import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
const userA = "11111111-1111-4111-8111-111111111111";
const userB = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";
const legacyId = 1784576525026;
async function user(id: string, managed = true) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims', $1, false)", [
    JSON.stringify({
      sub: id,
      app_metadata: { todo_access: managed },
      user_metadata: { todo_access: true },
    }),
  ]);
  await db.exec("set role authenticated");
}
async function rows(query: string, params: unknown[] = []) {
  return (await db.query<Record<string, any>>(query, params)).rows;
}
const payload = (id = legacyId, title = "Karavanla Ege-Akdeniz turuna çık") =>
  JSON.stringify([{ id, title, description: "Denizle..", completed: true }]);
async function importTasks(raw: string) {
  return rows("select public.import_todo_legacy_tasks($1::jsonb) as count", [
    raw,
  ]);
}
before(async () => {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    insert into auth.users values ('${userA}'),('${userB}');
    create function auth.jwt() returns jsonb language sql stable as $$ select nullif(current_setting('request.jwt.claims',true),'')::jsonb $$;
    create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
    grant usage on schema auth, public to authenticated,anon,service_role;
    grant execute on function auth.jwt(), auth.uid() to authenticated,anon,service_role;
  `);
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/202611160001_private_todos.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
});
after(async () => {
  await db.close();
});
test("anonymous and unprovisioned accounts cannot access tasks or import", async () => {
  await db.exec("set role anon");
  await assert.rejects(
    () => rows("select * from public.todo_tasks"),
    /permission denied/,
  );
  await assert.rejects(() => importTasks(payload()), /permission denied/);
  await user(userB, false);
  await assert.rejects(
    () => rows("insert into public.todo_tasks(title) values ('blocked')"),
    /row-level security/,
  );
  await assert.rejects(
    () => importTasks(payload()),
    /Managed account required/,
  );
});
test("server owns timestamps, owner and optimistic concurrency version", async () => {
  await user(userA);
  const [created] = await rows(
    "insert into public.todo_tasks(id,title) values ($1,$2) returning *",
    [taskId, "  First task  "],
  );
  assert.equal(created.user_id, userA);
  assert.equal(created.title, "First task");
  assert.equal(created.version, 1);
  assert.equal(created.completed_at, null);
  assert(Math.abs(Date.now() - new Date(created.created_at).getTime()) < 10000);
  await assert.rejects(
    () =>
      rows("update public.todo_tasks set created_at=now() where id=$1", [
        taskId,
      ]),
    /permission denied/,
  );
  await assert.rejects(
    () =>
      rows("update public.todo_tasks set user_id=$1 where id=$2", [
        userB,
        taskId,
      ]),
    /permission denied/,
  );
  const [completed] = await rows(
    "update public.todo_tasks set completed=true where id=$1 and version=1 returning *",
    [taskId],
  );
  assert(completed.completed_at);
  assert.equal(completed.version, 2);
  assert.equal(
    new Date(completed.created_at).toISOString(),
    new Date(created.created_at).toISOString(),
  );
  assert.deepEqual(
    await rows(
      "update public.todo_tasks set title='stale' where id=$1 and version=1 returning id",
      [taskId],
    ),
    [],
  );
  const [reopened] = await rows(
    "update public.todo_tasks set completed=false where id=$1 returning *",
    [taskId],
  );
  assert.equal(reopened.completed_at, null);
});
test("another managed account cannot read, update or delete existing user data", async () => {
  await user(userB);
  assert.deepEqual(await rows("select * from public.todo_tasks"), []);
  assert.deepEqual(
    await rows(
      "update public.todo_tasks set title='stolen' where id=$1 returning id",
      [taskId],
    ),
    [],
  );
  assert.deepEqual(
    await rows("delete from public.todo_tasks where id=$1 returning id", [
      taskId,
    ]),
    [],
  );
  await assert.rejects(
    () =>
      rows("insert into public.todo_tasks(user_id,title) values ($1,$2)", [
        userA,
        "spoof",
      ]),
    /permission denied/,
  );
});
test("legacy import preserves creation time, does not invent completion time and is idempotent", async () => {
  await user(userA);
  assert.equal((await importTasks(payload()))[0].count, 1);
  let [task] = await rows(
    "select * from public.todo_tasks where legacy_id=$1",
    [legacyId],
  );
  assert.equal(
    new Date(task.created_at).toISOString(),
    "2026-07-20T19:42:05.026Z",
  );
  assert.equal(task.completed, true);
  assert.equal(task.completed_at, null);
  await rows(
    "update public.todo_tasks set title='edited in cloud' where id=$1",
    [task.id],
  );
  await importTasks(payload());
  [task] = await rows("select * from public.todo_tasks where legacy_id=$1", [
    legacyId,
  ]);
  assert.equal(task.title, "edited in cloud");
  assert.equal(task.version, 2);
  assert.equal(
    (
      await rows(
        "select count(*) as count from public.todo_tasks where legacy_id=$1",
        [legacyId],
      )
    )[0].count,
    1,
  );
});
test("reimport cannot resurrect a deleted legacy task and receipts are not writable by clients", async () => {
  await user(userA);
  await rows("delete from public.todo_tasks where legacy_id=$1", [legacyId]);
  await importTasks(payload());
  assert.deepEqual(
    await rows("select * from public.todo_tasks where legacy_id=$1", [
      legacyId,
    ]),
    [],
  );
  await assert.rejects(
    () => rows("delete from public.todo_legacy_imports"),
    /permission denied/,
  );
});
test("a bad item rolls back the entire import, including its receipts", async () => {
  await user(userA);
  const raw = JSON.stringify([
    { id: legacyId + 1, title: "valid", description: "", completed: false },
    { id: legacyId + 2, title: "", description: "", completed: false },
  ]);
  await assert.rejects(() => importTasks(raw), /Invalid legacy task/);
  assert.deepEqual(
    await rows("select * from public.todo_tasks where legacy_id=$1", [
      legacyId + 1,
    ]),
    [],
  );
  assert.equal((await importTasks(payload(legacyId + 1)))[0].count, 1);
  assert.equal(
    (
      await rows("select * from public.todo_tasks where legacy_id=$1", [
        legacyId + 1,
      ])
    ).length,
    1,
  );
});
test("the same legacy ID is isolated per account", async () => {
  await user(userB);
  await importTasks(payload());
  const [task] = await rows(
    "select * from public.todo_tasks where legacy_id=$1",
    [legacyId],
  );
  assert.equal(task.user_id, userB);
});

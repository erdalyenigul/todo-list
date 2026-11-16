import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLegacyTasks } from "../src/utils/legacyTasks.ts";
import { usernameToEmail, normalizeUsername } from "../src/utils/username.ts";
import { formatTimestamp } from "../src/utils/dateTime.ts";

const task = {
  id: 1784576525026,
  title: "Karavanla Ege-Akdeniz turuna çık",
  description: "Denizle..",
  completed: false,
};
test("preserves the actual legacy creation time and content", () => {
  assert.deepEqual(parseLegacyTasks(JSON.stringify([task])), [task]);
  const date = new Date(task.id).toISOString();
  assert.equal(date, "2026-07-20T19:42:05.026Z");
  assert.match(formatTimestamp(date), /20 Temmuz 2026.*22:42:05/);
});
test("fails closed on corrupt, duplicate or incomplete legacy data", () => {
  for (const raw of [
    "{",
    "{}",
    JSON.stringify([task, task]),
    JSON.stringify([{ ...task, id: "1784576525026" }]),
    JSON.stringify([{ ...task, title: "   " }]),
    JSON.stringify([{ ...task, completed: "false" }]),
    JSON.stringify([{ ...task, id: 1 }]),
    JSON.stringify([{ ...task, id: Date.now() + 86400001 }]),
  ]) {
    assert.throws(() => parseLegacyTasks(raw));
  }
  assert.deepEqual(parseLegacyTasks(null), []);
});
test("usernames normalize identically for provisioning and sign-in, including Unicode", async () => {
  assert.equal(normalizeUsername(" ADMIN "), "admin");
  assert.equal(
    await usernameToEmail(" ADMIN "),
    await usernameToEmail("admin"),
  );
  assert.equal(await usernameToEmail("ÇAĞRI"), await usernameToEmail("çağrı"));
  assert.notEqual(
    await usernameToEmail("admin"),
    await usernameToEmail("other"),
  );
  assert.match(
    await usernameToEmail("admin"),
    /^u[0-9a-f]{48}@accounts\.todo\.invalid$/,
  );
  assert.throws(() => normalizeUsername("admin@example.com"));
});

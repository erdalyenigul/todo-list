import { database } from "../lib/supabase";
import { parseLegacyTasks } from "../utils/legacyTasks";

export function readLegacySnapshot(
  storage: Pick<Storage, "getItem"> = localStorage,
) {
  const raw = storage.getItem("tasks");
  return { raw, tasks: parseLegacyTasks(raw) };
}

export async function importLegacySnapshot(
  snapshot: ReturnType<typeof readLegacySnapshot>,
  storage: Pick<Storage, "getItem" | "removeItem"> = localStorage,
) {
  if (!snapshot.tasks.length) return;
  const { data, error } = await database().rpc("import_todo_legacy_tasks", {
    items: snapshot.tasks,
  });
  if (error || data !== snapshot.tasks.length) {
    throw new Error(
      "Aktarım doğrulanamadı. Eski kayıtlarınız korunuyor; tekrar deneyebilirsiniz.",
      { cause: error },
    );
  }
  // Never erase edits made by an older tab while the request was in flight.
  if (storage.getItem("tasks") === snapshot.raw) storage.removeItem("tasks");
}

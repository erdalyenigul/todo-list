import { validateTask } from "../utils/taskValidation";
import { database } from "../lib/supabase";
import type { Task, TaskFilter, TaskInput } from "../types/task";

const fields =
  "id,user_id,title,description,completed,created_at,updated_at,completed_at,legacy_id,version";
const pageSize = 100;

export async function listTasks(filter: TaskFilter, offset = 0) {
  let query = database().from("todo_tasks").select(fields);
  if (filter !== "all") query = query.eq("completed", filter === "completed");
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range(offset, offset + pageSize);
  if (error)
    throw new Error(
      "Maddeler yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.",
      { cause: error },
    );
  return {
    tasks: data.slice(0, pageSize) as Task[],
    hasMore: data.length > pageSize,
  };
}

export async function getTask(id: string): Promise<Task | null> {
  const legacy = /^\d{12,14}$/.test(id);
  if (
    !legacy &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return null;
  const { data, error } = await database()
    .from("todo_tasks")
    .select(fields)
    .eq(legacy ? "legacy_id" : "id", legacy ? Number(id) : id)
    .maybeSingle();
  if (error)
    throw new Error("Madde yüklenemedi. Lütfen tekrar deneyin.", {
      cause: error,
    });
  return data as Task | null;
}

// The form keeps this UUID until a successful response, so retrying after an
// ambiguous network failure cannot create a second copy.
export async function createTask(id: string, input: TaskInput): Promise<Task> {
  const value = validateTask(input);
  const { data, error } = await database()
    .from("todo_tasks")
    .insert({ id, ...value })
    .select(fields)
    .single();
  if (error?.code === "23505") {
    const existing = await getTask(id);
    if (
      existing &&
      existing.title === value.title &&
      existing.description === value.description
    )
      return existing;
  }
  if (error)
    throw new Error(
      "Kaydedilemedi. Girdiğiniz bilgiler korunuyor; tekrar deneyebilirsiniz.",
      { cause: error },
    );
  return data as Task;
}

export async function updateTask(
  task: Task,
  patch: Partial<TaskInput> & { completed?: boolean },
): Promise<Task> {
  const value = { ...patch };
  if (value.title !== undefined || value.description !== undefined) {
    Object.assign(
      value,
      validateTask({
        title: value.title ?? task.title,
        description: value.description ?? task.description,
      }),
    );
  }
  const { data, error } = await database()
    .from("todo_tasks")
    .update(value)
    .eq("id", task.id)
    .eq("version", task.version)
    .select(fields)
    .maybeSingle();
  if (error)
    throw new Error("Değişiklik kaydedilemedi. Lütfen tekrar deneyin.", {
      cause: error,
    });
  if (!data)
    throw new Error(
      "Bu madde başka bir oturumda değişti veya silindi. Güncel halini yükleyip tekrar deneyin.",
    );
  return data as Task;
}

export async function deleteTask(task: Task) {
  const { data, error } = await database()
    .from("todo_tasks")
    .delete()
    .eq("id", task.id)
    .eq("version", task.version)
    .select("id")
    .maybeSingle();
  if (error)
    throw new Error("Madde silinemedi. Lütfen tekrar deneyin.", {
      cause: error,
    });
  if (!data)
    throw new Error(
      "Bu madde başka bir oturumda değişti veya silindi. Listeyi yenileyin.",
    );
}

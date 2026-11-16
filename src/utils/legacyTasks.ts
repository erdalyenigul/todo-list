import type { LegacyTask } from "../types/task.ts";
import { validateTask } from "./taskValidation.ts";

export function parseLegacyTasks(raw: string | null): LegacyTask[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    throw new Error(
      "Eski kayıtlar okunamadı. Tarayıcı verileriniz değiştirilmedi.",
      { cause },
    );
  }
  if (!Array.isArray(parsed) || parsed.length > 1000)
    throw new Error(
      "Eski kayıtların biçimi desteklenmiyor; verileriniz korunuyor.",
    );
  const ids = new Set<number>();
  return parsed.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      !Number.isSafeInteger(item.id) ||
      item.id < 946684800000 ||
      item.id > Date.now() + 86400000 ||
      typeof item.title !== "string" ||
      typeof item.description !== "string" ||
      typeof item.completed !== "boolean" ||
      ids.has(item.id)
    ) {
      throw new Error(
        "Eski kayıtlarda geçersiz veya tekrarlanan bir madde var. Verileriniz değiştirilmedi.",
      );
    }
    ids.add(item.id);
    return { id: item.id, ...validateTask(item), completed: item.completed };
  });
}

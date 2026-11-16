import type { TaskInput } from "../types/task";

export function validateTask(input: TaskInput): TaskInput {
  const title = input.title.trim();
  if (
    !title ||
    [...title].length > 200 ||
    [...input.description].length > 10000
  ) {
    throw new Error("Başlık 1–200, açıklama en fazla 10.000 karakter olmalı.");
  }
  return { title, description: input.description };
}

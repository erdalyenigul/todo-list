export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  legacy_id: number | null;
  version: number;
}

export interface TaskInput {
  title: string;
  description: string;
}
export interface LegacyTask extends TaskInput {
  id: number;
  completed: boolean;
}
export type TaskFilter = "all" | "completed" | "incomplete";

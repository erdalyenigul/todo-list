<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import TaskDates from "../components/TaskDates.vue";
import { deleteTask, listTasks, updateTask } from "../services/tasks";
import type { Task, TaskFilter } from "../types/task";
const tasks = ref<Task[]>([]);
const filter = ref<TaskFilter>("all");
const loading = ref(false);
const busy = ref(false);
const hasMore = ref(false);
const error = ref("");
const dialog = ref<HTMLDialogElement>();
const deleting = ref<Task | null>(null);
let request = 0;
async function load(append = false) {
  const current = ++request;
  loading.value = true;
  error.value = "";
  if (!append) tasks.value = [];
  try {
    const page = await listTasks(filter.value, append ? tasks.value.length : 0);
    if (current !== request) return;
    tasks.value = append ? [...tasks.value, ...page.tasks] : page.tasks;
    hasMore.value = page.hasMore;
  } catch (cause) {
    if (current === request)
      error.value = cause instanceof Error ? cause.message : "Yüklenemedi.";
  } finally {
    if (current === request) loading.value = false;
  }
}
onMounted(() => load());
watch(filter, () => load());
async function toggle(task: Task) {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    const updated = await updateTask(task, { completed: !task.completed });
    tasks.value = tasks.value
      .map((item) => (item.id === updated.id ? updated : item))
      .filter(
        (item) =>
          filter.value === "all" ||
          item.completed === (filter.value === "completed"),
      );
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Kaydedilemedi.";
  } finally {
    busy.value = false;
  }
}
function askDelete(task: Task) {
  deleting.value = task;
  dialog.value?.showModal();
}
async function confirmDelete() {
  if (!deleting.value || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await deleteTask(deleting.value);
    tasks.value = tasks.value.filter((task) => task.id !== deleting.value?.id);
    dialog.value?.close();
    deleting.value = null;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Silinemedi.";
    dialog.value?.close();
  } finally {
    busy.value = false;
  }
}
const filters: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "incomplete", label: "Yapılacak" },
  { value: "completed", label: "Tamamlanan" },
];
</script>
<template>
  <section class="mt-10">
    <div class="flex flex-wrap gap-4 justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Maddelerim</h1>
      <RouterLink to="/new-task" class="button button-primary"
        >Yeni madde</RouterLink
      >
    </div>
    <div class="flex flex-wrap gap-3 mb-6" aria-label="Madde filtresi">
      <button
        v-for="item in filters"
        :key="item.value"
        type="button"
        class="button"
        :class="filter === item.value ? 'button-primary' : 'bg-gray-700'"
        :aria-pressed="filter === item.value"
        :disabled="busy"
        @click="filter = item.value"
      >
        {{ item.label }}
      </button>
      <button
        type="button"
        class="button bg-gray-700"
        :disabled="busy || loading"
        @click="load()"
      >
        Yenile
      </button>
    </div>
    <p v-if="error" role="alert" class="notice-error">{{ error }}</p>
    <p v-if="loading" role="status" class="my-5">Yükleniyor…</p>
    <p v-else-if="!tasks.length && !error" class="my-6 text-gray-300">
      Bu listede henüz madde yok.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <article v-for="task in tasks" :key="task.id" class="panel">
        <p v-if="task.completed" class="text-green-300 text-sm mb-2">
          Tamamlandı
        </p>
        <h2 class="text-xl font-semibold break-words">{{ task.title }}</h2>
        <p class="text-gray-300 whitespace-pre-wrap break-words mt-2">
          {{ task.description }}
        </p>
        <TaskDates :task="task" />
        <div class="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            class="button bg-green-700"
            :disabled="busy || loading"
            @click="toggle(task)"
          >
            {{ task.completed ? "Yeniden aç" : "Tamamlandı olarak işaretle" }}
          </button>
          <RouterLink
            :to="`/tasks/${task.id}`"
            class="button bg-yellow-500 text-gray-950"
            >Düzenle</RouterLink
          >
          <button
            type="button"
            class="button bg-red-700"
            :disabled="busy || loading"
            @click="askDelete(task)"
          >
            Sil
          </button>
        </div>
      </article>
    </div>
    <button
      v-if="hasMore"
      type="button"
      class="button bg-gray-700 mt-6"
      :disabled="busy || loading"
      @click="load(true)"
    >
      Daha fazla göster
    </button>
    <dialog
      ref="dialog"
      class="panel max-w-md w-full text-white"
      aria-labelledby="delete-heading"
    >
      <h2 id="delete-heading" class="text-xl font-bold">Madde silinsin mi?</h2>
      <p class="my-4 break-words">
        “{{ deleting?.title }}” kalıcı olarak silinecek.
      </p>
      <div class="flex gap-3">
        <button
          type="button"
          class="button bg-gray-600"
          autofocus
          :disabled="busy"
          @click="dialog?.close()"
        >
          Vazgeç
        </button>
        <button
          type="button"
          class="button bg-red-700"
          :disabled="busy"
          @click="confirmDelete"
        >
          {{ busy ? "Siliniyor…" : "Sil" }}
        </button>
      </div>
    </dialog>
  </section>
</template>

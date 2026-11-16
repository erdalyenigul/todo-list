<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import TaskForm from "../components/TaskForm.vue";
import TaskDates from "../components/TaskDates.vue";
import { getTask, updateTask } from "../services/tasks";
import type { Task, TaskInput } from "../types/task";
const route = useRoute();
const router = useRouter();
const task = ref<Task | null>(null);
const loading = ref(true);
const busy = ref(false);
const error = ref("");
const loadError = ref("");
async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    task.value = await getTask(String(route.params.id));
    if (task.value && String(route.params.id) !== task.value.id)
      await router.replace(`/tasks/${task.value.id}`);
  } catch (cause) {
    loadError.value =
      cause instanceof Error ? cause.message : "Madde yüklenemedi.";
  } finally {
    loading.value = false;
  }
}
onMounted(load);
async function save(input: TaskInput) {
  if (!task.value || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    task.value = await updateTask(task.value, input);
    await router.push("/tasks");
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Kaydedilemedi.";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <section class="panel max-w-2xl mx-auto mt-10">
    <h1 class="text-2xl font-bold mb-6">Maddeyi düzenle</h1>
    <p v-if="loading" role="status">Yükleniyor…</p>
    <div v-else-if="loadError">
      <p role="alert" class="notice-error">{{ loadError }}</p>
      <button type="button" class="button" @click="load">Tekrar dene</button>
    </div>
    <template v-else-if="task">
      <TaskForm :initial="task" :busy="busy" :error="error" @save="save" />
      <TaskDates :task="task" />
    </template>
    <p v-else>
      Madde bulunamadı. Eski bir bağlantıysa önce bu tarayıcıdaki maddeleri
      hesabınıza aktarın.
    </p>
    <RouterLink to="/tasks" class="inline-block mt-5 underline"
      >Listeye dön</RouterLink
    >
  </section>
</template>

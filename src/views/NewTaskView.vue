<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import TaskForm from "../components/TaskForm.vue";
import { createTask } from "../services/tasks";
import type { TaskInput } from "../types/task";
const router = useRouter();
const id = crypto.randomUUID();
const busy = ref(false);
const error = ref("");
async function save(input: TaskInput) {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await createTask(id, input);
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
    <h1 class="text-2xl font-bold mb-6">Yeni madde</h1>
    <TaskForm
      :busy="busy"
      :error="error"
      submit-label="Madde oluştur"
      @save="save"
    />
    <RouterLink to="/tasks" class="inline-block mt-5 underline"
      >Listeye dön</RouterLink
    >
  </section>
</template>

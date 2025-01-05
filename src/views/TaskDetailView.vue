<template>
  <div class="container mx-auto mt-10 max-w-[800px]">
    <div class="flex justify-between items-center py-4">
      <h1 class="text-xl font-bold">Task Edit</h1>
      <span
        v-if="task"
        class=" bg-green-500 text-white px-3 py-1 rounded-lg flex items-center"
        :class="task.completed ? 'bg-green-500' : 'bg-red-500'"
      >
        {{ task.completed ? "Completed" : "Incomplete" }}
      </span>
    </div>
    <div
      v-if="task"
      class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border relative"
    >
      <label class="block mb-2 text-lg font-semibold">Title</label>
      <input
        v-model="editedTitle"
        class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
      />

      <label class="block mt-4 mb-2 text-lg font-semibold"
        >Description</label
      >
      <textarea
        v-model="editedDescription"
        class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
        rows="3"
      ></textarea>

      
      <div class="flex w-full flex-col md:flex-row md:items-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
        <button
          @click="saveEdit"
          class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Save
        </button>
        <button
          @click="cancelEdit"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>

        <button
          @click="toggleTaskCompletion"
          class="px-6 py-2 rounded-lg text-white bg-blue-500"
        >
        {{ task.completed ? "Mark as Incomplete" : "Mark as Completed" }}
        </button>
      </div>
      
    </div>

    <div v-else class="text-center text-gray-500">No tasks...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTasks, saveTasks } from "../utils/localStorage";

const route = useRoute();
const router = useRouter();
const task = ref(null);
const editedTitle = ref("");
const editedDescription = ref("");

onMounted(() => {
  const tasks = getTasks();
  task.value = tasks.find((t) => t.id == route.params.id);
  if (task.value) {
    editedTitle.value = task.value.title;
    editedDescription.value = task.value.description;
  }
});
const toggleTaskCompletion = () => {
  task.value.completed = !task.value.completed;
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id == task.value.id);
  tasks[index] = task.value;
  saveTasks(tasks);
};
const saveEdit = () => {
  task.value.title = editedTitle.value;
  task.value.description = editedDescription.value;

  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id == task.value.id);
  tasks[index] = task.value;
  saveTasks(tasks);

  router.push("/tasks");
};
const cancelEdit = () => {
  router.push("/tasks");
};
</script>

<template>
  <div class="container mx-auto mt-10">
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white text-gray-700 p-6 rounded-lg shadow-lg relative z-50">
        <h3 class="text-lg font-semibold mb-4">
          Are you sure you want to delete this task?
        </h3>
        <div class="flex justify-end space-x-4">
          <button
            @click="deleteTask"
            class="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <h1 class="text-3xl font-bold text-center mb-6">Tasks</h1>

    <div class="flex justify-center space-x-4 mb-8">
      <button
        @click="filterTasks('all')"
        :class="filterButtonClass('all')"
        class="px-6 py-2 rounded-lg"
      >
        All
      </button>
      <button
        @click="filterTasks('completed')"
        :class="filterButtonClass('completed')"
        class="px-6 py-2 rounded-lg"
      >
        Completed
      </button>
      <button
        @click="filterTasks('incomplete')"
        :class="filterButtonClass('incomplete')"
        class="px-6 py-2 rounded-lg"
      >
        Incomplete
      </button>
    </div>

    <transition-group
      v-if="filteredTasks.length > 0"
      name="task"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="relative p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border"
      >
        <div
          v-if="task.completed"
          class="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full"
        >
          Completed
        </div>

        <h2 class="text-xl font-semibold">{{ task.title }}</h2>
        <p class="text-gray-700 dark:text-gray-300">{{ task.description }}</p>

        <div class="flex w-full flex-col md:flex-row md:items-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
          <button
            @click="toggleTaskCompletion(task)"
            class="px-4 py-2 rounded text-white"
            :class="
              task.completed
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-green-500 hover:bg-green-600'
            "
          >
            {{ task.completed ? "Mark as Incomplete" : "Mark as Completed" }}
          </button>

          <button
            @click="goToDetail(task.id)"
            class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit
          </button>

          <button
            @click="openDeleteModal(task)"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </transition-group>

    <div v-else class="text-center text-gray-500 mt-10">
      No tasks to display.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getTasks, saveTasks } from "../utils/localStorage";

const taskToDelete = ref(null); // Tanımlanmamışsa bu satır eklenmeli
const showDeleteModal = ref(false);
const tasks = ref([]);
const selectedFilter = ref("all");
const router = useRouter();

onMounted(() => {
  tasks.value = getTasks();
});

const filterButtonClass = (filter) => {
  return selectedFilter.value === filter
    ? "bg-blue-500 text-white"
    : "bg-gray-300 text-gray-800";
};
const filterTasks = (filter) => {
  selectedFilter.value = filter;
};

const filteredTasks = computed(() => {
  if (selectedFilter.value === "completed") {
    return tasks.value.filter((task) => task.completed);
  }
  if (selectedFilter.value === "incomplete") {
    return tasks.value.filter((task) => !task.completed);
  }
  return tasks.value;
});
const toggleTaskCompletion = (task) => {
  task.completed = !task.completed;
  saveTasks(tasks.value);
};
const goToDetail = (id) => {
  router.push(`/tasks/${id}`);
};

const openDeleteModal = (task) => {
  taskToDelete.value = task;
  showDeleteModal.value = true;
};

const deleteTask = () => {
  if (taskToDelete.value) {
    tasks.value = tasks.value.filter((t) => t.id !== taskToDelete.value.id);
    saveTasks(tasks.value); // LocalStorage güncellemesi için
    showDeleteModal.value = false;
    taskToDelete.value = null;
  }
};
</script>

<style>
/* Animations for Task Transitions */
.task-enter-active,
.task-leave-active {
  transition: all 0.5s ease;
}
.task-enter-from,
.task-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.task-leave-active {
  position: absolute;
}
</style>

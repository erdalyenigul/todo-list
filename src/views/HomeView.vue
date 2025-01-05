<template>
  <div class="container mx-auto text-center mt-20">
    <h1 class="text-2xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
      Erdal's ToDo List 🚀
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
      Simple and efficient task management. Reach your goals faster!
    </p>

    <div class="flex justify-center space-x-6">
      <button 
        @click="goToTasks"
        class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-lg"
      >
        View Tasks
      </button>

      <button 
        @click="goToAddTask"
        class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-lg"
      >
        Add New Task
      </button>
    </div>

    <div class="mt-20">
      <img 
        src="https://images.pexels.com/photos/29996973/pexels-photo-29996973/free-photo-of-colorful-2025-planner-with-pen-and-plant.jpeg"
        alt="Productivity Image"
        class="rounded-lg shadow-lg mx-auto w-full max-w-[600px]"
      />
    </div>

    <div class="mt-16">
      <h2 class="text-3xl font-semibold text-gray-800 dark:text-white mb-4">
        Why This App?
      </h2>
      <p class="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        Erdal's ToDo List helps you organize your daily plans better. 
        With its simple and minimal design, you can boost your productivity 
        and manage your time more effectively.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const goToTasks = () => {
  router.push('/tasks');
};

const goToAddTask = () => {
  router.push('/new-task');
};
</script>

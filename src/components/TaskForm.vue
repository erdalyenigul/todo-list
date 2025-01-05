<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border max-w-lg mx-auto">
    <form @submit.prevent="submitTask">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
        <input 
          v-model="taskTitle" 
          type="text" 
          class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" 
          required
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
        <textarea 
          v-model="taskDescription" 
          class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" 
          rows="3"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button 
          type="submit" 
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const taskTitle = ref('');
const taskDescription = ref('');
const taskPriority = ref('Orta');

const emit = defineEmits(['taskAdded']);

const submitTask = () => {
  if (taskTitle.value.trim()) {
    const newTask = {
      id: Date.now(),
      title: taskTitle.value,
      description: taskDescription.value,
      completed: false
    };

    emit('taskAdded', newTask);
    taskTitle.value = '';
    taskDescription.value = '';
  }
};
</script>

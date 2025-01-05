<template>
  <div class="container mx-auto mt-10">
    <h1 class="text-3xl font-bold text-center mb-6">Create New Task</h1>
    <TaskForm @taskAdded="goToHome" />
  </div>
</template>

<script setup>
import TaskForm from '../components/TaskForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHome = (newTask) => {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  router.push('/tasks');
};
</script>

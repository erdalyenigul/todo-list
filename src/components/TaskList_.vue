<template>
    <div class="mt-5">
      <div v-if="filteredTasks.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <TaskItem 
          v-for="task in filteredTasks" 
          :key="task.id" 
          :task="task"
          @toggle-complete="toggleTaskCompletion(task)"
          @delete-task="deleteTask"
          @edit-task="editTask"
        />
      </div>
      <div v-else class="text-center text-gray-500 dark:text-gray-400 mt-10">
        No tasks have been added yet.
      </div>
    </div>
  </template>
  
  <script setup>
  import TaskItem from './TaskItem.vue';
  import { ref, computed, onMounted } from 'vue';
  import { getTasks, saveTasks } from '../utils/localStorage';
  
  const tasks = ref([]);
  const filter = ref('all');
  
  onMounted(() => {
    tasks.value = getTasks();
  });
  
  const editTask = (updatedTask) => {
    const index = tasks.value.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks.value[index] = updatedTask;
      saveTasks(tasks.value);
    }
  };
  
  const toggleTaskCompletion = (task) => {
    task.completed = !task.completed;
    saveTasks(tasks.value);
  };
  
  const deleteTask = (task) => {
    tasks.value = tasks.value.filter(t => t.id !== task.id);
    saveTasks(tasks.value);
  };
  
  const filteredTasks = computed(() => {
    if (filter.value === 'completed') {
      return tasks.value.filter(task => task.completed);
    } else if (filter.value === 'incomplete') {
      return tasks.value.filter(task => !task.completed);
    }
    return tasks.value;
  });
  </script>
  
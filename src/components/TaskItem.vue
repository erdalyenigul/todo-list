<template>
    <div class="relative p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border">
      <div 
        v-if="task.completed" 
        class="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full"
      >
        Completed
      </div>
  
      <div v-if="isEditing">
        <input 
          v-model="editedTitle" 
          class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder="Task Title"
        />
        <textarea 
          v-model="editedDescription" 
          class="w-full mt-3 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          rows="3"
          placeholder="Description"
        ></textarea>
        <div class="mt-4 flex space-x-4">
          <button 
            @click="saveEdit" 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
          <button 
            @click="cancelEdit" 
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
  
      <div v-else>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ task.title }}
        </h2>
        <p class="text-gray-700 dark:text-gray-300 mt-2">{{ task.description }}</p>
  
        <div class="mt-4 flex space-x-4">
          <button 
            @click="toggleComplete" 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {{ task.completed ? 'Undo' : 'Done' }}
          </button>
          <button 
            @click="startEdit" 
            class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button 
            @click="deleteTask" 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    task: Object
  });
  const emit = defineEmits(['toggle-complete', 'delete-task', 'edit-task']);
  
  const isEditing = ref(false);
  const editedTitle = ref(props.task.title);
  const editedDescription = ref(props.task.description);
  
  const startEdit = () => {
    isEditing.value = true;
  };
  
  const cancelEdit = () => {
    isEditing.value = false;
    editedTitle.value = props.task.title;
    editedDescription.value = props.task.description;
  };
  
  const saveEdit = () => {
    const updatedTask = {
      ...props.task,
      title: editedTitle.value,
      description: editedDescription.value
    };
    emit('edit-task', updatedTask);
    isEditing.value = false;
  };
  
  const toggleComplete = () => {
    emit('toggle-complete', props.task);
  };
  
  const deleteTask = () => {
    emit('delete-task', props.task);
  };
  </script>
  
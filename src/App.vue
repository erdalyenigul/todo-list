<template>
  <div class="min-h-screen flex flex-col justify-between bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
    <header class="bg-blue-600 text-white p-2">
      <div class="container mx-auto flex justify-between items-center">
        <RouterLink to="/" class="px-4 py-2"><h1 class="text-2xl font-bold">ToDo List</h1></RouterLink>
        
        <nav class="hidden md:flex space-x-6">
          <RouterLink to="/" class="px-4 py-2">Main</RouterLink>
          <RouterLink to="/tasks" class="px-4 py-2">Tasks</RouterLink>
          <RouterLink to="/new-task" class="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600">
            New Task
          </RouterLink>
        </nav>

        <div class="md:hidden">
          <button @click="toggleMenu" class="focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="showMenu" class="md:hidden mt-4 bg-blue-700 p-4 rounded-lg">
        <RouterLink 
          to="/" 
          class="block py-2 px-4 hover:bg-blue-800 rounded-lg"
          @click="toggleMenu"
        >
          Ana Sayfa
        </RouterLink>
        <RouterLink 
          to="/tasks" 
          class="block py-2 px-4 hover:bg-blue-800 rounded-lg"
          @click="toggleMenu"
        >
          Tasks
        </RouterLink>
        <RouterLink 
          to="/new-task" 
          class="block py-2 px-4 bg-green-500 rounded-lg hover:bg-green-600"
          @click="toggleMenu"
        >
          Yeni Görev
        </RouterLink>
      </div>
    </header>

    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
      <RouterView />
    </main>

    <footer class="bg-blue-700 text-white p-4 text-center mt-20">
      <p>© 2025 ToDo List | <a href="https://github.com/erdalyenigul">Erdal Yenigul</a> </p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};
</script>

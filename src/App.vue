<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { session, username, signOut } from "./stores/auth";
import LegacyImportBanner from "./components/LegacyImportBanner.vue";
const router = useRouter();
const route = useRoute();
const error = ref("");
const busy = ref(false);
const revision = ref(0);
watch(
  () => session.value?.user.id,
  (id, previous) => {
    if (previous && id !== previous) void router.replace("/login");
  },
);
async function logout() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await signOut();
    await router.replace("/login");
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Çıkış yapılamadı.";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <div class="min-h-dvh bg-gray-900 text-white flex flex-col">
    <header class="bg-blue-700">
      <nav
        class="container mx-auto flex flex-wrap items-center gap-3 p-4"
        aria-label="Ana menü"
      >
        <RouterLink
          :to="session ? '/tasks' : '/login'"
          class="text-xl font-bold mr-auto"
          >ToDo List</RouterLink
        >
        <template v-if="session">
          <RouterLink to="/tasks" class="button">Maddelerim</RouterLink>
          <span class="text-sm">{{ username }}</span>
          <button
            type="button"
            class="button bg-blue-900"
            :disabled="busy"
            @click="logout"
          >
            Çıkış yap
          </button>
        </template>
      </nav>
    </header>
    <main class="container mx-auto px-4 sm:px-6 flex-grow pb-10">
      <p v-if="error" role="alert" class="notice-error mt-4">{{ error }}</p>
      <template v-if="session">
        <LegacyImportBanner :key="session.user.id" @imported="revision++" />
        <RouterView :key="`${session.user.id}:${route.fullPath}:${revision}`" />
      </template>
      <RouterView v-else-if="route.name === 'Login'" />
    </main>
    <footer class="text-center text-gray-400 text-sm p-5">
      ToDo List · Kişisel yapılacaklar listeniz
    </footer>
  </div>
</template>

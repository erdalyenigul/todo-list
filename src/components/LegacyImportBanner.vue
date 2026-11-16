<script setup lang="ts">
import { onMounted, ref } from "vue";
import { username } from "../stores/auth";
import {
  importLegacySnapshot,
  readLegacySnapshot,
} from "../services/legacyImport";
const emit = defineEmits<{ imported: [] }>();
const snapshot = ref<ReturnType<typeof readLegacySnapshot>>();
const error = ref("");
const message = ref("");
const busy = ref(false);
function read() {
  try {
    snapshot.value = readLegacySnapshot();
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : "Eski kayıtlar okunamadı.";
  }
}
onMounted(read);
async function importTasks() {
  if (busy.value || !snapshot.value) return;
  busy.value = true;
  error.value = "";
  try {
    await importLegacySnapshot(snapshot.value);
    message.value = "Eski maddeleriniz hesabınıza aktarıldı.";
    read();
    emit("imported");
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : "Aktarım yapılamadı. Eski kayıtlarınız korunuyor.";
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <aside
    v-if="snapshot?.tasks.length || error || message"
    class="panel my-6"
    aria-label="Eski maddeleri aktar"
  >
    <template v-if="snapshot?.tasks.length">
      <h2 class="font-bold">
        Bu tarayıcıda {{ snapshot.tasks.length }} eski madde bulundu
      </h2>
      <p class="mt-2">
        Maddeleri <strong>{{ username }}</strong> hesabınıza aktarabilirsiniz.
        Oluşturulma tarihleri korunacak.
      </p>
      <button
        type="button"
        class="button button-primary mt-4"
        :disabled="busy"
        @click="importTasks"
      >
        {{ busy ? "Aktarılıyor…" : "Bu hesaba aktar" }}
      </button>
    </template>
    <p v-if="message" role="status" class="mt-2">{{ message }}</p>
    <p v-if="error" role="alert" class="notice-error">{{ error }}</p>
  </aside>
</template>

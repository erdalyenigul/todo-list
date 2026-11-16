<script setup lang="ts">
import { ref } from "vue";
import type { TaskInput } from "../types/task";
const props = defineProps<{
  initial?: TaskInput;
  busy?: boolean;
  error?: string;
  submitLabel?: string;
}>();
const emit = defineEmits<{ save: [value: TaskInput] }>();
const title = ref(props.initial?.title ?? "");
const description = ref(props.initial?.description ?? "");
</script>
<template>
  <form method="post" @submit.prevent="emit('save', { title, description })">
    <div class="field">
      <label for="task-title"
        >Başlık <span class="text-gray-400">(zorunlu)</span></label
      >
      <input
        id="task-title"
        v-model="title"
        name="title"
        required
        maxlength="200"
        :readonly="busy"
      />
    </div>
    <div class="field">
      <label for="task-description">Açıklama</label>
      <textarea
        id="task-description"
        v-model="description"
        name="description"
        rows="4"
        maxlength="10000"
        :readonly="busy"
      ></textarea>
    </div>
    <p v-if="error" role="alert" class="notice-error">{{ error }}</p>
    <button type="submit" class="button button-primary" :disabled="busy">
      {{ busy ? "Kaydediliyor…" : (submitLabel ?? "Kaydet") }}
    </button>
  </form>
</template>

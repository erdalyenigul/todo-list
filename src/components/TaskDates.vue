<script setup lang="ts">
import type { Task } from "../types/task";
import { formatTimestamp } from "../utils/dateTime";
defineProps<{ task: Task }>();
</script>
<template>
  <dl class="text-sm text-gray-300 space-y-1 mt-4">
    <div>
      <dt class="inline">Oluşturuldu:</dt>
      <dd class="inline">
        <time :datetime="task.created_at">{{
          formatTimestamp(task.created_at)
        }}</time>
      </dd>
    </div>
    <div>
      <dt class="inline">Son kayıt:</dt>
      <dd class="inline">
        <time :datetime="task.updated_at">{{
          formatTimestamp(task.updated_at)
        }}</time>
      </dd>
    </div>
    <div v-if="task.completed_at">
      <dt class="inline">Tamamlandı:</dt>
      <dd class="inline">
        <time :datetime="task.completed_at">{{
          formatTimestamp(task.completed_at)
        }}</time>
      </dd>
    </div>
  </dl>
  <p class="text-xs text-gray-400 mt-2">
    Türkiye saati (UTC+3)<span v-if="task.legacy_id">
      · Oluşturulma tarihi eski kaydın cihaz zamanından korundu.</span
    >
  </p>
  <p
    v-if="task.completed && !task.completed_at"
    class="text-xs text-gray-400 mt-1"
  >
    Eski kayıtta tamamlanma zamanı bulunmuyor.
  </p>
</template>

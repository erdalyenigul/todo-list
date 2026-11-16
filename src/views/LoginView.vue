<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { signIn } from "../stores/auth";
import { supabase } from "../lib/supabase";

const router = useRouter();
const route = useRoute();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const busy = ref(false);
const error = ref("");
async function submit() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await signIn(username.value, password.value);
    password.value = "";
    const target =
      typeof route.query.next === "string" ? route.query.next : "/tasks";
    await router.replace(
      /^\/(tasks(?:\/[^/?#]+)?|new-task)$/.test(target) ? target : "/tasks",
    );
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : "Giriş yapılamadı. Tekrar deneyin.";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="panel max-w-md mx-auto mt-10">
    <h1 id="login-heading" class="text-2xl font-bold mb-2">Giriş yap</h1>
    <p class="text-gray-300 mb-6">
      Yönetici tarafından açılan hesabınızla devam edin.
    </p>
    <p v-if="!supabase" role="alert" class="notice-error">
      Hizmet henüz yapılandırılmadı. Lütfen yöneticiyle iletişime geçin.
    </p>
    <form
      v-else
      method="post"
      aria-labelledby="login-heading"
      @submit.prevent="submit"
    >
      <div class="field">
        <label for="username">Kullanıcı adı</label>
        <input
          id="username"
          v-model="username"
          name="username"
          autocomplete="username"
          autocapitalize="none"
          autocorrect="off"
          :spellcheck="false"
          required
          maxlength="64"
          enterkeyhint="next"
          :readonly="busy"
        />
      </div>
      <div class="field">
        <label for="password">Şifre</label>
        <input
          id="password"
          v-model="password"
          name="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          required
          enterkeyhint="go"
          :readonly="busy"
        />
        <button
          type="button"
          class="text-left underline py-2"
          :aria-pressed="showPassword"
          aria-controls="password"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? "Şifreyi gizle" : "Şifreyi göster" }}
        </button>
      </div>
      <p v-if="error" role="alert" class="notice-error">{{ error }}</p>
      <button
        type="submit"
        class="button button-primary w-full"
        :disabled="busy"
      >
        {{ busy ? "Giriş yapılıyor…" : "Giriş yap" }}
      </button>
    </form>
    <p class="text-sm text-gray-300 mt-5">
      Hesap veya şifre desteği için yöneticiyle iletişime geçin.
    </p>
  </section>
</template>

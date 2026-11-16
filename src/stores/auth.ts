import { computed, shallowRef } from "vue";
import type { Session } from "@supabase/supabase-js";
import { database, supabase } from "../lib/supabase";
import { usernameToEmail } from "../utils/username";

const currentSession = shallowRef<Session | null>(null);
export const session = computed(() => currentSession.value);
export const username = computed(() =>
  String(session.value?.user.app_metadata.username ?? ""),
);

function acceptSession(value: Session | null) {
  currentSession.value =
    value?.user.app_metadata.todo_access === true ? value : null;
}

let initialized: Promise<void> | undefined;
export function initializeAuth(): Promise<void> {
  return (initialized ??= (async () => {
    if (!supabase) return;
    supabase.auth.onAuthStateChange((_event, value) => acceptSession(value));
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      acceptSession(null);
      return;
    }
    acceptSession(data.session);
  })());
}

export async function signIn(name: string, password: string) {
  const email = await usernameToEmail(name);
  const { data, error } = await database().auth.signInWithPassword({
    email,
    password,
  });
  if (error)
    throw new Error(
      "Giriş yapılamadı. Kullanıcı adınızı, şifrenizi ve bağlantınızı kontrol edin.",
      { cause: error },
    );
  if (data.user?.app_metadata.todo_access !== true) {
    await database().auth.signOut({ scope: "local" });
    throw new Error(
      "Bu hesap için erişim tanımlı değil. Yöneticiyle iletişime geçin.",
    );
  }
  acceptSession(data.session);
}

export async function signOut() {
  const { error } = await database().auth.signOut({ scope: "local" });
  if (error)
    throw new Error("Çıkış yapılamadı. Lütfen tekrar deneyin.", {
      cause: error,
    });
  acceptSession(null);
}

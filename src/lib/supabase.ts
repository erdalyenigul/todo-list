import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

// Only the public publishable/anon key belongs in a Vite bundle.
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
        global: {
          fetch: (input, init) => {
            const deadline = AbortSignal.timeout(15000);
            const signal = init?.signal
              ? AbortSignal.any([init.signal, deadline])
              : deadline;
            return fetch(input, { ...init, signal });
          },
        },
      })
    : null;

export function database() {
  if (!supabase)
    throw new Error(
      "Hizmet henüz yapılandırılmadı. Lütfen yöneticiyle iletişime geçin.",
    );
  return supabase;
}

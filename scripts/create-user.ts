// Run only on a trusted administrator's machine. This file is never bundled.
// Supply credentials via environment variables, never command-line arguments.
import { createClient } from "@supabase/supabase-js";
import { normalizeUsername, usernameToEmail } from "../src/utils/username.ts";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const name = process.env.TODO_USERNAME;
const password = process.env.TODO_PASSWORD;
if (!url || !secret || !name || !password) {
  throw new Error(
    "Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TODO_USERNAME and TODO_PASSWORD securely.",
  );
}
if (password.length < 8)
  throw new Error("Use at least 8 characters for a new password.");
const username = normalizeUsername(name);
const client = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await client.auth.admin.createUser({
  email: await usernameToEmail(username),
  password,
  email_confirm: true,
  app_metadata: { username, todo_access: true },
});
if (error) {
  // Never reset or overwrite an existing account implicitly.
  throw new Error(
    `Account creation failed (${error.code ?? error.status ?? "unknown"}).`,
  );
}
console.log(`Created managed account ${username} (${data.user.id}).`);

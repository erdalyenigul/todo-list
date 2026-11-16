# ToDo List

A private Vue 3 / TypeScript task app backed by Supabase Postgres and Supabase Auth.
Users sign in with an administrator-provisioned username and password. There is no
registration screen or client-side signup call.

## Data and access

- Tasks live only in `public.todo_tasks`. No new task data is written to localStorage.
- Postgres generates UUIDs and UTC `timestamptz` creation, last-save and completion
  times. The UI displays dates in `Europe/Istanbul` and labels that timezone.
- Row-level security requires both the authenticated owner and administrator-issued
  `app_metadata.todo_access: true`. User-editable `user_metadata` cannot grant access.
- Column grants protect ownership and timestamps. A version counter prevents stale
  edits or deletes from silently overwriting changes from another session.
- Supabase Auth may persist its session in browser storage. Passwords are handled by
  Supabase Auth, never stored in tasks or committed to the repository.
- A network failure is shown as an error; there is no silent local/offline fallback.

## Configure Supabase before deploying

Target project: `bzwrukilhzagpbsvrwyz`.

1. Inspect the project's existing schema first. Apply
   `supabase/migrations/202611160001_private_todos.sql` using the Supabase migration
   workflow or SQL Editor. It creates new `todo_*` tables and does not alter existing
   unrelated tables. Do not reapply the same migration manually.
2. In Authentication settings, **disable new user signups** and **anonymous sign-ins**.
   Keep email/password sign-in enabled. Set the minimum password length to at least
   8 characters. Do not weaken the password requirements to accept a short password.
3. Set the site URL to `https://2025-todo-list.vercel.app`. No email link, public signup
   or password-reset flow is used; administrators handle account recovery.
4. Provision the initial managed account with the script below. Test signing in before
   switching production to this version. Accounts without the admin-issued access
   flag cannot access the tables, even if an unrelated signup endpoint is enabled.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the Vercel project's
   environment variables and rebuild. Use a **publishable/anon key**, never a secret
   or service-role key in a `VITE_` variable or the browser bundle.

## Administrator-created accounts

Run on a trusted administrator's computer with Node 22.18+.
Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TODO_USERNAME`, and `TODO_PASSWORD`
securely in the process environment (or an ignored `.env.admin.local` file).
Do not pass passwords as command-line arguments or commit credential files.

```sh
npm run admin:create-user
# Alternatively, with an ignored local environment file:
node --env-file=.env.admin.local --experimental-strip-types scripts/create-user.ts
```

The script uses `auth.admin.createUser`, confirms the internal email and sets the
server-controlled `username` and `todo_access` app metadata. It does not send email
and refuses to overwrite existing accounts. `usernameToEmail()` is shared with the
sign-in form: it derives a stable internal address from a normalized username so no
public username directory or email lookup is necessary. These addresses are not
mailboxes; reset passwords with the Supabase admin API/dashboard. Use this script
for additional accounts as well. Never add a public `signUp` call.

## Preserve existing browser tasks

Open the deployed app on the **same origin and browser profile** where the old tasks
were created (`https://2025-todo-list.vercel.app`), then sign in to the intended account.
The import banner shows the account name and asks the user to explicitly import the
browser's legacy tasks. A preview domain cannot access production localStorage.

- Original `Date.now()` IDs become `legacy_id`; their creation instants are preserved.
  For example, `1784576525026` becomes `2026-07-20T19:42:05.026Z`.
- Old numeric `/tasks/:id` links resolve to the imported UUID-owned record.
- Old completion times were never stored. Imported completed tasks retain a null
  completion timestamp, and the UI explains that it is unknown. `updated_at` records
  the import/save time, not a fictional past edit date.
- The server imports a batch atomically. Invalid data fails without clearing storage.
- Per-user import receipts make retries idempotent, preserve later cloud edits and
  prevent a deleted task from being recreated by a repeated import.
- The original `tasks` key is removed only after the server acknowledges the entire
  batch and its contents still match the snapshot. Concurrent changes in another
  old tab are kept for another import attempt.
- If old data was already erased from that browser, this app cannot recover it.

## Development and validation

```sh
npm ci
cp .env.example .env.local
# Set the public project key in .env.local.
npm run dev
npm run typecheck
npm test
npm run build
```

`npm test` runs real PostgreSQL RLS, grants, timestamp, concurrency and migration
checks using PGlite, plus legacy parsing and username normalization tests. Production
Auth settings and the real Supabase REST integration still require a deployment
smoke test. Never claim that local SQL tests prove remote configuration is applied.

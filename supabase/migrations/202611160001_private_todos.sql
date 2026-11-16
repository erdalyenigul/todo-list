begin;

create table public.todo_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null default '' check (char_length(description) <= 10000),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  legacy_id bigint check (legacy_id >= 946684800000),
  version bigint not null default 1,
  unique (user_id, legacy_id),
  check (completed or completed_at is null)
);

create index todo_tasks_owner_created_idx on public.todo_tasks(user_id, created_at desc, id);
create index todo_tasks_owner_completed_idx on public.todo_tasks(user_id, completed, created_at desc, id);

-- Keep an import receipt after deletion so retrying an old browser import cannot
-- resurrect a task. No direct API access to receipts is granted to end users.
create table public.todo_legacy_imports (
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_id bigint not null,
  task_id uuid references public.todo_tasks(id) on delete set null,
  imported_at timestamptz not null default now(),
  primary key (user_id, legacy_id)
);

create function public.stamp_todo_task() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.title := btrim(new.title);
  if tg_op = 'INSERT' then
    new.version := 1;
    if new.legacy_id is not null then
      new.created_at := to_timestamp(new.legacy_id / 1000.0);
      -- Old tasks have no completion timestamp; do not invent one on import.
      new.completed_at := null;
    else
      new.created_at := clock_timestamp();
      new.completed_at := case when new.completed then new.created_at else null end;
    end if;
  else
    if new.id is distinct from old.id or new.user_id is distinct from old.user_id
      or new.legacy_id is distinct from old.legacy_id or new.created_at is distinct from old.created_at then
      raise exception 'Task identity and creation time are immutable';
    end if;
    new.version := old.version + 1;
    new.completed_at := case
      when not new.completed then null
      when not old.completed then clock_timestamp()
      else old.completed_at end;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger stamp_todo_task before insert or update on public.todo_tasks
for each row execute function public.stamp_todo_task();

alter table public.todo_tasks enable row level security;
alter table public.todo_legacy_imports enable row level security;

-- app_metadata can only be assigned with the Auth admin API. Self-registration
-- cannot grant todo_access even if the project's signup toggle is misconfigured.
create policy todo_owner_access on public.todo_tasks to authenticated
using (
  user_id = (select auth.uid()) and
  coalesce((select auth.jwt())->'app_metadata'->>'todo_access', 'false') = 'true'
)
with check (
  user_id = (select auth.uid()) and
  coalesce((select auth.jwt())->'app_metadata'->>'todo_access', 'false') = 'true'
);

revoke all on public.todo_tasks, public.todo_legacy_imports from public, anon, authenticated;
grant select, delete on public.todo_tasks to authenticated;
grant insert (id, title, description, completed) on public.todo_tasks to authenticated;
grant update (title, description, completed) on public.todo_tasks to authenticated;
grant all on public.todo_tasks, public.todo_legacy_imports to service_role;

create function public.import_todo_legacy_tasks(items jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  item jsonb;
  old_id bigint;
  reserved_id bigint;
  new_id uuid;
  processed integer := 0;
begin
  if owner_id is null or coalesce(auth.jwt()->'app_metadata'->>'todo_access', 'false') <> 'true' then
    raise exception 'Managed account required' using errcode = '42501';
  end if;
  if jsonb_typeof(items) is distinct from 'array' then
    raise exception 'Expected an array';
  end if;
  if jsonb_array_length(items) > 1000 then raise exception 'Too many legacy tasks'; end if;

  for item in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(item) is distinct from 'object'
      or jsonb_typeof(item->'id') is distinct from 'number'
      or (item->>'id') !~ '^[0-9]{12,14}$'
      or jsonb_typeof(item->'title') is distinct from 'string'
      or char_length(btrim(item->>'title')) not between 1 and 200
      or jsonb_typeof(item->'description') is distinct from 'string'
      or char_length(item->>'description') > 10000
      or jsonb_typeof(item->'completed') is distinct from 'boolean' then
      raise exception 'Invalid legacy task';
    end if;
    old_id := (item->>'id')::bigint;
    if old_id < 946684800000 or old_id > extract(epoch from now() + interval '1 day') * 1000 then
      raise exception 'Invalid legacy creation time';
    end if;
    reserved_id := null;
    insert into public.todo_legacy_imports(user_id, legacy_id) values (owner_id, old_id)
    on conflict (user_id, legacy_id) do nothing returning legacy_id into reserved_id;
    if reserved_id is not null then
      insert into public.todo_tasks(user_id, title, description, completed, legacy_id)
      values (owner_id, item->>'title', item->>'description', (item->>'completed')::boolean, old_id)
      returning id into new_id;
      update public.todo_legacy_imports set task_id = new_id where user_id = owner_id and legacy_id = old_id;
    end if;
    processed := processed + 1;
  end loop;
  return processed;
end;
$$;

revoke all on function public.stamp_todo_task() from public, anon, authenticated;
revoke all on function public.import_todo_legacy_tasks(jsonb) from public, anon;
grant execute on function public.import_todo_legacy_tasks(jsonb) to authenticated;

commit;

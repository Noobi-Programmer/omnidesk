# Database Schema

## MVP decision: no database

The P0 run lives ≤2 minutes, history is single-user, and the cookbook pattern we follow
(openbox-deals, lego-hunter) is **pure in-memory + client persistence**. Adding Supabase to the
MVP buys nothing the demo needs and costs workstream C an hour we don't have.

MVP persistence = `HistoryStore` interface with a localStorage implementation (Workstream B):

```ts
interface HistoryStore {
  list(): Promise<ResearchSummary[]>;          // taskId, prompt, mode, createdAt, status
  save(response: ResearchResponse): Promise<void>;   // cap: 20 entries (oldest evicted)
  get(taskId: string): Promise<ResearchResponse | null>;
  recordDecision(audit: AuditEntry): Promise<void>;  // approvals log
}
```

`AuditEntry = { id, actionId, decision: 'approve' | 'dismiss', at: string, note?: string }`.

## Future schema (Supabase Postgres — when multi-user/auth/persistence matter)

Enabled by the same interfaces; nothing in the orchestrator changes. RLS on every table;
`profiles.id` = auth.users.id.

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  business_context text,
  response_style jsonb,          -- learned reply-style preferences
  created_at timestamptz default now()
);

create table research_tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  prompt text not null,
  mode text not null check (mode in ('quick','standard','deep')),
  status text not null,          -- running | completed | partial | failed
  request jsonb not null,
  response jsonb,                -- full ResearchResponse on completion
  stats jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table sources (
  id text primary key,           -- matches SourceDocument.id within task
  task_id uuid references research_tasks(id) on delete cascade,
  url text not null, final_url text, domain text, title text,
  fetched_via text, status text, fetched_at timestamptz
);

create table findings (
  id text primary key,
  task_id uuid references research_tasks(id) on delete cascade,
  source_id text references sources(id),
  field text, value jsonb, status text, quote text, confidence text
);

create table action_drafts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references research_tasks(id) on delete cascade,
  type text check (type in ('email','task','calendar','web_form')),
  title text, payload jsonb, risk_level text,
  status text check (status in ('awaiting_approval','approved','dismissed'))
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  action_id uuid references action_drafts(id),
  decision text check (decision in ('approve','dismiss')),
  decided_by uuid references profiles(id),
  note text, created_at timestamptz default now()
);

-- P2 inbox (build only after verification of provider APIs)
create table integrations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  provider text,                -- gmail | whatsapp_business | instagram_professional
  status text, scopes text[], last_synced_at timestamptz
);

create table messages (
  id text primary key,          -- provider message id
  integration_id uuid references integrations(id),
  received_at timestamptz, sender text, subject text,
  raw jsonb, summary text, priority_score numeric,
  risk_tier text, thread_ref text
);

-- P4 workforce
create table agent_tasks (
  id uuid primary key default gen_random_uuid(),
  parent_task_id uuid references agent_tasks(id),
  profile_id uuid references profiles(id),
  objective text, worker text, status text,
  checkpoint jsonb, attempts int default 0, created_at timestamptz default now()
);
```

`research_queries` are embedded in `research_tasks.request->plan.queries` — a separate table
buys nothing at our scale. Do not create tables that the MVP never reads.

create table if not exists professors (
  id uuid primary key default gen_random_uuid(),
  rmp_id text unique not null,
  name text not null,
  university text not null default '',
  department text not null default '',
  overall_rating float,
  total_review_count int,
  analyzed_at timestamptz
);

create table if not exists analysis_results (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references professors(id) on delete cascade,
  axis text not null check (axis in ('workload', 'clarity', 'fairness')),
  sentiment_score float not null,
  positive_pct float not null,
  negative_pct float not null,
  neutral_pct float not null,
  review_count int not null,
  top_phrases jsonb not null default '[]'
);

create index if not exists idx_professors_rmp_id on professors(rmp_id);

-- 도장인 익명 게시판 v2 (카테고리 포함)
-- Supabase SQL Editor에서 실행하세요.
-- user_id는 나중에 회원제 전환 시 auth.users와 연결할 자리입니다 (지금은 NULL).

create table if not exists board_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  nickname text not null,
  pin_hash text not null,
  category text not null default '잡담',   -- 질문 | 정보 | 잡담
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists board_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references board_posts(id) on delete cascade,
  user_id uuid,
  nickname text not null,
  pin_hash text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_board_posts_created on board_posts (created_at desc);
create index if not exists idx_board_posts_cat on board_posts (category, created_at desc);
create index if not exists idx_board_comments_post on board_comments (post_id, created_at);

alter table board_posts enable row level security;
alter table board_comments enable row level security;

-- 방문자 집계
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create index if not exists idx_visits_created on visits (created_at desc);
alter table visits enable row level security;

-- 익명 방문자 설문 (연령대·산업군)
create table if not exists visitor_profiles (
  id uuid primary key default gen_random_uuid(),
  age_group text not null,
  industry text not null,
  created_at timestamptz not null default now()
);
alter table visitor_profiles enable row level security;

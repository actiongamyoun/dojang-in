-- 도장인 익명 게시판 v1
-- Supabase SQL Editor에서 실행하세요.
-- user_id는 나중에 회원제 전환 시 auth.users와 연결할 자리입니다 (지금은 NULL).

create table if not exists board_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                      -- 회원제 전환 대비 (현재 미사용)
  nickname text not null,
  pin_hash text not null,            -- SHA-256(PIN) — 삭제 인증용
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
create index if not exists idx_board_comments_post on board_comments (post_id, created_at);

-- RLS 활성화. anon 정책은 만들지 않음 → 모든 접근은 서버(service_role) 경유.
alter table board_posts enable row level security;
alter table board_comments enable row level security;

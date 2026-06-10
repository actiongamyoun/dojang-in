# 도장인 — 조선소 도장검사 허브

Next.js 15 + Markdown SSG. 디자인: 시안 B (화이트+블루, 검사 성적서 무드)

## 배포 방법 (Vercel)

1. GitHub에 새 repo 생성 (예: actiongamyoun/dojangin) 후 이 폴더 전체 push
2. Vercel → Add New Project → repo 선택 → 설정 변경 없이 Deploy
3. 배포 후 도메인: dojangin.vercel.app (프로젝트명에 따라 다를 수 있음)

## 로컬 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

## 글 추가 방법

content/ 폴더에 .md 파일을 추가하면 자동으로 목록·sitemap에 반영됩니다.

```markdown
---
title: "글 제목"
category: "카테고리"
date: "2026-06-10"
description: "검색 결과에 노출될 요약 (SEO)"
---

본문...
```

## 배포 후 할 일 (SEO)

- 네이버 서치어드바이저 (searchadvisor.naver.com) 사이트 등록 + sitemap.xml 제출
- 구글 서치콘솔 (search.google.com/search-console) 동일하게 등록
- metadataBase URL: 실제 배포 도메인이 다르면 app/layout.tsx, app/sitemap.ts, app/robots.ts의 dojangin.vercel.app 수정

## 구조

```
app/
  layout.tsx        헤더/푸터, SEO 메타
  page.tsx          홈 (도구 + 글 목록 + 커뮤니티 예고)
  globals.css       디자인 토큰
  guide/page.tsx    글 목록
  guide/[slug]/     글 상세 (SSG)
  sitemap.ts, robots.ts
content/            마크다운 글 (3편 초안 — 검수 필요!)
lib/posts.ts        글 로더
```

## ⚠️ 배포 전 확인

- content/ 글 3편은 초안입니다. 기술 내용 검수 후 배포하세요.
- PAINT SMART 링크(app/page.tsx)의 Netlify URL이 실제 주소와 맞는지 확인하세요.

---

## v2 업데이트 (소통 공간 · 새소식 · 자격증)

### 새 메뉴
- /board — 익명 게시판 (닉네임+PIN, 댓글, PIN 삭제, honeypot 스팸 방지)
- /news — 새소식 (content-news/*.md 에 글 추가)
- /cert — 자격증 정보 (AMPP CIP · FROSIO)

### 게시판 사용 전 필수 설정
1. Supabase 새 프로젝트 생성 (Seoul 리전 권장)
2. SQL Editor에서 supabase_setup.sql 실행
3. Vercel 환경변수 추가:
   - NEXT_PUBLIC_SUPABASE_URL = 프로젝트 URL
   - SUPABASE_SERVICE_ROLE_KEY = service_role 키 (Settings > API)
4. 재배포

환경변수가 없으면 게시판만 "준비 중"으로 표시되고 나머지는 정상 작동합니다.

### 회원제 전환 대비
board_posts / board_comments 테이블에 user_id 컬럼이 미리 있습니다.
나중에 Supabase Auth 붙일 때 컬럼 추가 없이 전환 가능합니다.

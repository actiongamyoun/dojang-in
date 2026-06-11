#!/usr/bin/env python3
"""
도장인 데일리 뉴스 다이제스트
Google News RSS(조선업 + 도료/도장) → 중복 제거 → Claude Haiku 선별·요약
→ content-news/news-YYYY-MM-DD.md 생성

저작권 원칙: 기사 본문은 절대 싣지 않는다. 제목 + 자체 작성 요약(2문장 이내) + 원문 링크만.
"""

import json
import os
import sys
import html
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
import feedparser

KST = timezone(timedelta(hours=9))
TODAY = datetime.now(KST)
DATE_STR = TODAY.strftime("%Y-%m-%d")
WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"]
DATE_KR = f"{TODAY.month}월 {TODAY.day}일({WEEKDAYS[TODAY.weekday()]})"

ROOT = Path(__file__).resolve().parent.parent
SEEN_FILE = ROOT / "scripts" / "seen_links.json"
OUT_FILE = ROOT / "content-news" / f"news-{DATE_STR}.md"

QUERIES = [
    "조선업 OR 조선소",
    "선박 도료 OR 선박 도장 OR 방오도료",
]

MODEL = "claude-haiku-4-5-20251001"
MAX_CANDIDATES = 30   # Haiku에 넘길 최대 후보 수
MIN_FRESH = 3         # 새 기사가 이보다 적으면 그날은 생략


def fetch_candidates() -> list[dict]:
    items = []
    for q in QUERIES:
        url = (
            "https://news.google.com/rss/search?q="
            + requests.utils.quote(q)
            + "+when:1d&hl=ko&gl=KR&ceid=KR:ko"
        )
        feed = feedparser.parse(url)
        for e in feed.entries:
            title = html.unescape(e.get("title", "")).strip()
            link = e.get("link", "")
            source = ""
            if hasattr(e, "source") and hasattr(e.source, "title"):
                source = e.source.title
            elif " - " in title:
                title, source = title.rsplit(" - ", 1)
            if title and link:
                items.append({"title": title.strip(), "link": link, "source": source.strip()})
    # 제목 기준 중복 제거
    seen_titles = set()
    uniq = []
    for it in items:
        key = it["title"]
        if key not in seen_titles:
            seen_titles.add(key)
            uniq.append(it)
    return uniq


def load_seen() -> list[str]:
    if SEEN_FILE.exists():
        return json.loads(SEEN_FILE.read_text(encoding="utf-8"))
    return []


def save_seen(seen: list[str]):
    SEEN_FILE.write_text(
        json.dumps(seen[-800:], ensure_ascii=False, indent=0), encoding="utf-8"
    )


def pick_and_summarize(candidates: list[dict]) -> list[dict]:
    """Haiku에게 선별 + 자체 요약을 맡긴다. 실패 시 빈 리스트."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY 없음", file=sys.stderr)
        return []

    listing = "\n".join(
        f"{i}. [{c['source']}] {c['title']}" for i, c in enumerate(candidates)
    )
    prompt = f"""당신은 조선소 도장검사 전문 커뮤니티 '도장인'의 뉴스 에디터입니다.
아래는 오늘 수집된 조선업·도료/도장 관련 기사 제목 목록입니다.

{listing}

작업:
1. 조선소·조선업·선박 도료·도장·방오도료·표면처리와 관련성이 높은 기사를 5~7개 고르세요.
   (단순 주가 기사, 광고성, 무관한 기사는 제외. 수주·기술·안전·인력·도료 신제품·규제 등 우선)
2. 각 기사에 대해 제목만 보고 추론 가능한 범위에서 1~2문장의 짧은 소개를 한국어로 직접 작성하세요.
   기사 원문 표현을 복제하지 말고 완전히 새로 쓰세요. 추측이 필요한 세부 내용은 쓰지 마세요.
3. 아래 JSON 배열만 출력하세요. 다른 텍스트, 마크다운 백틱 금지.

[{{"idx": 번호, "summary": "소개 문장"}}]"""

    try:
        res = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": MODEL,
                "max_tokens": 1500,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=90,
        )
        res.raise_for_status()
        text = res.json()["content"][0]["text"].strip()
        text = text.replace("```json", "").replace("```", "").strip()
        picked = json.loads(text)
    except Exception as ex:
        print(f"Haiku 호출/파싱 실패: {ex}", file=sys.stderr)
        return []

    out = []
    for p in picked:
        try:
            c = candidates[int(p["idx"])]
            out.append({**c, "summary": str(p["summary"]).strip()})
        except (KeyError, IndexError, ValueError):
            continue
    return out[:7]


def build_md(items: list[dict]) -> str:
    lines = [
        "---",
        f'title: "오늘의 조선·도장 뉴스 — {DATE_KR}"',
        'category: "데일리뉴스"',
        f'date: "{DATE_STR}"',
        f'description: "조선업·도료 업계 주요 소식 {len(items)}건 — 도장인이 매일 아침 골라드립니다."',
        "---",
        "",
        f"도장인이 고른 오늘의 업계 소식 {len(items)}건입니다. 제목을 누르면 원문으로 이동합니다.",
        "",
    ]
    for it in items:
        src = f" ({it['source']})" if it["source"] else ""
        lines.append(f"### [{it['title']}]({it['link']}){src}")
        lines.append("")
        lines.append(it["summary"])
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*요약은 도장인이 자체 작성했으며, 상세 내용은 각 원문 기사를 확인하세요.*")
    return "\n".join(lines)


def main():
    if OUT_FILE.exists():
        print(f"{OUT_FILE.name} 이미 존재 — 생략")
        return

    candidates = fetch_candidates()
    print(f"수집: {len(candidates)}건")

    seen = load_seen()
    fresh = [c for c in candidates if c["link"] not in seen][:MAX_CANDIDATES]
    print(f"신규: {len(fresh)}건")

    if len(fresh) < MIN_FRESH:
        print("신규 기사 부족 — 오늘은 생략")
        return

    items = pick_and_summarize(fresh)
    if len(items) < MIN_FRESH:
        print("선별 결과 부족 — 오늘은 생략")
        return

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(build_md(items), encoding="utf-8")
    save_seen(seen + [c["link"] for c in fresh])
    print(f"생성 완료: {OUT_FILE.name} ({len(items)}건)")


if __name__ == "__main__":
    main()

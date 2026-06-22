#!/usr/bin/env python3
"""
도장인 뉴스레터 발송
오늘 생성된 content-news/news-YYYY-MM-DD.md 를 읽어
카드뉴스 HTML 이메일로 만들고, Supabase 구독자 전원에게 Resend로 발송.

뉴스봇(news_digest.py) 다음 단계로 실행됨.
환경변수: RESEND_API_KEY, RESEND_FROM, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

KST = timezone(timedelta(hours=9))
TODAY = datetime.now(KST)
DATE_STR = TODAY.strftime("%Y-%m-%d")
WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"]
DATE_KR = f"{TODAY.month}월 {TODAY.day}일({WEEKDAYS[TODAY.weekday()]})"

ROOT = Path(__file__).resolve().parent.parent
NEWS_FILE = ROOT / "content-news" / f"news-{DATE_STR}.md"
SITE = "https://dojang-in.vercel.app"


def parse_digest(text: str):
    """마크다운 다이제스트에서 (제목, 링크, 출처, 요약) 항목 추출."""
    body = re.sub(r"^---.*?---", "", text, count=1, flags=re.DOTALL).strip()
    items = []
    # ### [제목](링크) (출처)  +  다음 줄 요약
    pattern = re.compile(r"### \[([^\]]+)\]\(([^)]+)\)(?:\s*\(([^)]+)\))?\s*\n+([^\n#]+)")
    for m in pattern.finditer(body):
        items.append({
            "title": m.group(1).strip(),
            "link": m.group(2).strip(),
            "source": (m.group(3) or "").strip(),
            "summary": m.group(4).strip(),
        })
    return items


def build_email_html(items, unsubscribe_url: str) -> str:
    cards = ""
    for i, it in enumerate(items, 1):
        src = f' · {it["source"]}' if it["source"] else ""
        cards += f"""
        <tr><td style="padding:0 0 14px 0">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e3eaf2;border-radius:14px;overflow:hidden">
            <tr>
              <td width="64" valign="top" style="background:linear-gradient(135deg,#0d5ba8,#063a6f);color:#fff;text-align:center;padding:18px 0;font-weight:800;font-size:18px">{i:02d}</td>
              <td style="padding:16px 18px">
                <a href="{it['link']}" style="color:#0d5ba8;font-size:16px;font-weight:700;text-decoration:none;line-height:1.4">{it['title']}</a>
                <div style="color:#94a3b8;font-size:12px;margin:4px 0 8px">기사 원문{src} ↗</div>
                <div style="color:#475569;font-size:14px;line-height:1.6">{it['summary']}</div>
              </td>
            </tr>
          </table>
        </td></tr>"""

    return f"""<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f7fb;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="padding:0 16px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0d5ba8,#063a6f);border-radius:16px;margin-bottom:18px">
            <tr><td style="padding:26px 22px;color:#fff">
              <div style="font-size:13px;opacity:.85;letter-spacing:1px">DOJANGIN DAILY · {DATE_KR}</div>
              <div style="font-size:23px;font-weight:800;margin-top:6px">오늘의 조선·도장 뉴스</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 16px">
          <table width="100%" cellpadding="0" cellspacing="0">{cards}</table>
        </td></tr>
        <tr><td style="padding:18px 16px;text-align:center;color:#94a3b8;font-size:12px">
          <a href="{SITE}/news" style="color:#0d5ba8;text-decoration:none;font-weight:600">도장인에서 더 보기 →</a><br/><br/>
          이 메일은 도장인 뉴스레터 구독자에게 발송되었습니다.<br/>
          <a href="{unsubscribe_url}" style="color:#94a3b8">구독 해지</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


def get_subscribers(url, key):
    res = requests.get(
        f"{url}/rest/v1/subscribers?select=email,token&confirmed=eq.true",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
        timeout=30,
    )
    res.raise_for_status()
    return res.json()


def send_email(api_key, sender, to, subject, html):
    res = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"from": sender, "to": [to], "subject": subject, "html": html},
        timeout=30,
    )
    return res.ok, res.text


def main():
    if not NEWS_FILE.exists():
        print(f"{NEWS_FILE.name} 없음 — 발송 생략")
        return

    resend_key = os.environ.get("RESEND_API_KEY")
    sender = os.environ.get("RESEND_FROM", "도장인 <onboarding@resend.dev>")
    sb_url = os.environ.get("SUPABASE_URL")
    sb_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not all([resend_key, sb_url, sb_key]):
        print("환경변수 누락 (RESEND_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — 발송 생략", file=sys.stderr)
        return

    items = parse_digest(NEWS_FILE.read_text(encoding="utf-8"))
    if not items:
        print("파싱된 기사 없음 — 발송 생략")
        return

    subs = get_subscribers(sb_url, sb_key)
    if not subs:
        print("구독자 없음 — 발송 생략")
        return

    subject = f"[도장인] 오늘의 조선·도장 뉴스 — {DATE_KR}"
    sent = 0
    for s in subs:
        unsub = f"{SITE}/api/unsubscribe?token={s['token']}"
        html = build_email_html(items, unsub)
        ok, info = send_email(resend_key, sender, s["email"], subject, html)
        if ok:
            sent += 1
        else:
            print(f"발송 실패 {s['email']}: {info[:120]}", file=sys.stderr)
    print(f"발송 완료: {sent}/{len(subs)}명")


if __name__ == "__main__":
    main()

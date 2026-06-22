import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import Subscribe from "@/app/components/Subscribe";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새소식",
  description: "도장인 공지와 매일 업데이트되는 조선·도장 업계 뉴스",
};

export default function NewsList() {
  const all = getAllPosts("news");
  const notices = all.filter((p) => p.category === "공지");
  const news = all.filter((p) => p.category !== "공지");

  const dateBox = (date: string) => {
    const [, m, d] = date.split("-");
    return (
      <div className="news-thumb">
        <span className="nd">{m}.{d}</span>
        <span className="ni ms">newspaper</span>
      </div>
    );
  };

  return (
    <main>
      <div className="sec" style={{ paddingBottom: 0 }}><Subscribe /></div>
      {notices.length > 0 && (
        <div className="sec">
          <div className="sec-h"><h2>공지</h2></div>
          <div className="feed">
            {notices.map((post) => (
              <Link key={post.slug} href={`/news/${post.slug}`} className="post notice-post">
                <span className="badge b-notice">공지</span>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <div className="meta"><span>{post.date}</span></div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="sec">
        <div className="sec-h"><h2>업계 뉴스</h2><span>매일 06:00 업데이트</span></div>
        {news.length === 0 && (
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            첫 데일리 뉴스가 곧 도착합니다. 매일 아침 조선·도장 업계 소식을 골라드려요.
          </p>
        )}
        <div className="feed">
          {news.map((post) => (
            <Link key={post.slug} href={`/news/${post.slug}`} className="post news-row">
              {dateBox(post.date)}
              <div className="news-body">
                <span className="badge b-news">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

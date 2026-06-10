import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();
  const news = getAllPosts("news").slice(0, 3);

  return (
    <main>
      <div className="hero">
        <div className="container">
          <div className="rep-no">DOJANGIN · COATING INSPECTION HUB</div>
          <h1>도장검사,<br /><u>기준</u>이 있는 곳</h1>
          <p>
            검사 도구 · 규격 해설 · 결함 사례. 조선소 도장 QC 실무 경험으로 만든
            도장검사원의 허브입니다.
          </p>
          <div className="cta-row">
            <a className="cta" href="#tools">도구 사용하기</a>
            <Link className="cta ghost" href="/guide">실무 지식 보기</Link>
          </div>
        </div>
      </div>

      <section id="tools">
        <div className="container">
          <div className="sec-head">
            <h2>검사 도구</h2>
            <span>FREE / NO SIGN-UP</span>
          </div>
          <div className="tools">
            <a className="tool" href="https://humidity-dew.vercel.app" target="_blank" rel="noopener">
              <div className="val">ΔT 3.2°C</div>
              <b>이슬점 계산기</b>
              <small>노점차 즉시 판정</small>
            </a>
            <a className="tool" href="https://paint-recoating-immersion.netlify.app" target="_blank" rel="noopener">
              <div className="val">72h</div>
              <b>재도장 간격 조회</b>
              <small>6개 메이커 TDS 기반</small>
            </a>
            <span className="tool soon">
              <div className="val">90/10</div>
              <b>DFT 통계</b>
              <small>준비 중</small>
            </span>
            <span className="tool soon">
              <div className="val">418 L</div>
              <b>도료 소요량</b>
              <small>준비 중</small>
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="sec-head">
            <h2>실무 지식</h2>
            <span>UPDATED WEEKLY</span>
          </div>
          {posts.map((post) => (
            <Link key={post.slug} href={`/guide/${post.slug}`} className="row">
              <b>{post.title}</b>
              <span className="cat">{post.category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="container">
          <div className="sec-head">
            <h2>새소식</h2>
            <span>INDUSTRY NEWS</span>
          </div>
          {news.map((post) => (
            <Link key={post.slug} href={`/news/${post.slug}`} className="row">
              <b>{post.title}</b>
              <span className="cat">{post.category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <Link href="/board" className="soon-box" style={{ display: "flex" }}>
            <div>
              <b>소통 공간</b>
              <p>현장 질문 · 정보 공유 · 잡담 — 익명으로 편하게</p>
            </div>
            <span className="pill">OPEN</span>
          </Link>
          <Link href="/cert" className="soon-box" style={{ display: "flex" }}>
            <div>
              <b>자격증 정보</b>
              <p>AMPP CIP · FROSIO 레벨 체계와 응시 전략</p>
            </div>
            <span className="pill">GUIDE</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

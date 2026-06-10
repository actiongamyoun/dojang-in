import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자격증 정보 — AMPP CIP · FROSIO",
  description:
    "도장검사원 국제 자격증 AMPP CIP(구 NACE CIP)와 FROSIO의 레벨 체계, 응시 요건, 차이점을 정리했습니다.",
};

export default function CertPage() {
  return (
    <main>
      <article className="article">
        <div className="article-card">
          <header>
            <span className="badge b-notice">자격증</span>
            <h1>도장검사 국제 자격증 가이드</h1>
            <div className="meta">AMPP CIP · FROSIO</div>
          </header>
          <div className="prose">
            <p>
              도장검사 분야에서 국제적으로 통용되는 자격은 크게 두 갈래입니다.
              미국 기반의 <strong>AMPP CIP</strong>(구 NACE CIP)와 노르웨이 기반의{" "}
              <strong>FROSIO</strong>. 조선·해양 프로젝트 사양서에는 보통
              &ldquo;NACE CIP Level 2 이상 또는 FROSIO Level III&rdquo; 식으로 둘 중
              하나를 요구합니다.
            </p>

            <h2>AMPP CIP (구 NACE CIP)</h2>
            <p>
              2021년 NACE와 SSPC가 통합해 AMPP가 되면서, NACE CIP와 SSPC PCI가
              하나의 프로그램으로 합쳐졌습니다. 기존 NACE CIP 자격은 업계 전환이
              끝날 때까지 유효하게 인정됩니다.
            </p>
            <table>
              <thead>
                <tr><th>레벨</th><th>명칭</th><th>특징</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Basic Coatings Inspector (구 CIP Level 1)</td>
                  <td>비파괴 검사 중심의 기초 과정. 사전 경력 요건 없이 입문 가능</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Certified Coatings Inspector (구 CIP Level 2)</td>
                  <td>파괴·비파괴 검사 전반. 조선소 사양서에서 가장 많이 요구되는 레벨</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Senior Certified Coatings Inspector (구 CIP Level 3)</td>
                  <td>구술 시험(Peer Review) 방식. 경력 검사원 대상 최상위 자격</td>
                </tr>
              </tbody>
            </table>
            <p>
              레벨별로 교육 과정 수료와 시험 통과가 필요하며, 상위 레벨은 경력
              요건이 추가됩니다. 국내에서도 위탁 교육기관을 통해 한국 회차가
              열립니다.
            </p>

            <h2>FROSIO</h2>
            <p>
              노르웨이 표면처리교육위원회가 운영하는 자격으로, 북해 해양플랜트
              요구에서 출발해 조선·해양 분야에서 특히 인정도가 높습니다. AMPP와
              구조가 다른 점이 핵심입니다 — <strong>교육(약 80시간)과 시험은 하나</strong>이고,
              레벨은 시험이 아니라 <strong>제출한 경력으로 결정</strong>됩니다.
            </p>
            <table>
              <thead>
                <tr><th>레벨</th><th>색상</th><th>경력 요건</th></tr>
              </thead>
              <tbody>
                <tr><td>I</td><td>White</td><td>경력 없음 또는 Level II 요건 미달</td></tr>
                <tr><td>II</td><td>Green</td><td>관련 경력 2년 이상</td></tr>
                <tr><td>III</td><td>Red</td><td>관련 경력 5년 이상 (그중 검사 경력 2년 이상 증빙)</td></tr>
              </tbody>
            </table>
            <p>
              시험은 이론(150점 만점, 100점 이상 합격)과 실기로 구성되며,
              자격 유효기간은 5년입니다. 경력이 쌓이면 재시험 없이 상위 레벨로
              업그레이드를 신청할 수 있다는 점이 큰 장점입니다.
            </p>

            <h2>둘 중 무엇을 딸까?</h2>
            <ul>
              <li>
                <strong>발주처·프로젝트 사양 먼저 확인</strong> — 결국 사양서가
                요구하는 자격이 정답입니다. 해양플랜트·유럽 선주 프로젝트는
                FROSIO 선호가 강한 편이고, 미주·중동 쪽은 AMPP(NACE) 요구가
                많습니다.
              </li>
              <li>
                <strong>경력이 이미 5년 이상이라면</strong> — FROSIO는 시험 한
                번으로 Level III(Red)까지 바로 받을 수 있어 효율적입니다.
              </li>
              <li>
                <strong>단계적으로 쌓고 싶다면</strong> — AMPP CIP는 레벨별
                교육이 체계적이라 입문자에게 진입 장벽이 낮습니다.
              </li>
            </ul>

            <blockquote>
              교육 일정·응시료는 수시로 바뀌므로 반드시 공식 채널에서
              확인하세요 — AMPP: ampp.org · FROSIO: frosio.no
            </blockquote>
          </div>
        </div>
      </article>
    </main>
  );
}

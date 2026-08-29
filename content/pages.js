/* ============================================================
   content/pages.js — 정적 페이지 본문
   ------------------------------------------------------------
   골격(head·헤더·푸터·JSON-LD)은 tools/lib/layout.js 가 붙입니다.
   여기에는 <main> 안에 들어갈 내용만 씁니다.
   ============================================================ */
'use strict';

const { COMPANY, EXTERNAL_LINKS } = require('../assets/js/config.js');
const { SERVICES } = require('../assets/js/services.js');
const { GUIDES } = require('../assets/js/guides.js');
const { publishedCases } = require('../assets/js/cases.js');
const { entityId } = require('../tools/lib/layout.js');

/* 증거 유형 필터 값 — 실제로 발행된 사례에 있는 유형만 칩으로 냅니다.
   아직 사례가 없는 유형(예: 납품)을 0건 칩으로 내걸지 않기 위한 것입니다. */
const EVIDENCE_ORDER = [
  { value: '시공', label: '시공' },
  { value: '유지보수', label: '교체·유지보수' },
  { value: '납품', label: '납품' }
];
const EVIDENCE_FILTER = EVIDENCE_ORDER.filter((t) =>
  publishedCases().some((c) => (c.evidenceType || '시공') === t.value));

/* 브랜드 엔티티 @id — layout.js 와 같은 값을 씁니다. */
const ENTITY_BRAND = entityId('#brand');

const TEL = COMPANY.telHref;
const SHOP = EXTERNAL_LINKS.shop.url;

/* 홈·서비스 개요에서 함께 쓰는 서비스 카드 */
function serviceCards(root) {
  return SERVICES.map((s) => `
      <a class="card card-link service-card" href="${root}service/${s.slug}.html">
        <h3>${s.name}</h3>
        <p>${s.summary}</p>
        <ul class="facilities">${s.facilities.slice(0, 4).map((f) => `<li>${f}</li>`).join('')}</ul>
        <span class="card-more">자세히 보기 →</span>
      </a>`).join('');
}

const PROCESS_INSTALL = [
  ['현장 확인', '제주도 내 현장을 직접 보고 상태와 동선을 확인합니다.'],
  ['시설·자재 선정', '규격과 재질을 현장 조건에 맞춰 고릅니다.'],
  ['견적', '작업 범위를 나눠 견적을 드립니다. 부분 시공도 가능합니다.'],
  ['설치 또는 교체', '기존 시설 철거가 필요하면 함께 진행합니다.'],
  ['유지관리', '다음 점검 시점과 확인할 항목을 알려드립니다.']
];

const PROBLEM_ROUTES = [
  ['파손된 안전시설을 교체해야 합니다', 'service/road-traffic.html'],
  ['기존 시설이 노후되어 위험합니다', 'service/public-maintenance.html'],
  ['차량 진출입 구간이 위험합니다', 'service/road-traffic.html'],
  ['보행자 안전이 걱정됩니다', 'service/pedestrian-life.html'],
  ['학교 안전시설을 개선해야 합니다', 'service/school-child.html'],
  ['배수로 그레이팅이 덜컹거립니다', 'service/pedestrian-life.html'],
  ['해풍에 금속 시설물이 부식됩니다', 'service/metal-fabrication.html'],
  ['자재만 납품받고 싶습니다', 'products.html']
];

/* ── 제품·자재 ───────────────────────────────────────────── */
const PRODUCT_GROUPS = [
  {
    id: 'traffic', name: '도로·교통 안전자재', service: 'road-traffic',
    items: ['차선규제봉', '시선유도봉', '고휘도 반사테이프', '반사 경고도료', '볼라드'],
    pick: '설치 구간의 성격(직선·회전·주차장)과 반복 충격 정도에 따라 규격과 재질이 달라집니다. ' +
      '제주는 자외선과 염분 노출이 크므로 내후성과 복원력을 함께 봅니다.'
  },
  {
    id: 'school', name: '학교·어린이 안전자재', service: 'school-child',
    items: ['통학로 시선유도봉', '경사로 진입판(U형)', '안전표지', '미끄럼방지 자재'],
    pick: '진입판은 단차 높이에 맞는 규격을 골라야 하고, 시선유도봉은 보행 폭을 침범하지 않는 위치가 중요합니다.'
  },
  {
    id: 'pedestrian', name: '보행·배수 자재', service: 'pedestrian-life',
    items: ['배수로 그레이팅', '중하중 그레이팅', '트렌치 커버'],
    pick: '가장 먼저 정할 것은 하중 조건입니다. 차량이 지나가는 구간은 중하중용이어야 합니다. ' +
      '규격은 배수로 폭·깊이와 기존 프레임 상태를 실측해 정합니다.'
  },
  {
    id: 'maintenance', name: '보수·유지관리 자재', service: 'public-maintenance',
    items: ['방청·재도장 자재', '앵커·고정 부자재', '도로복구용 아스콘'],
    pick: '보수는 자재보다 상태 판단이 먼저입니다. 어느 범위까지 보수로 해결되는지 확인한 뒤 자재를 정합니다.'
  },
  {
    id: 'metal', name: '스테인리스·금속 부자재', service: 'metal-fabrication',
    items: ['앵글·프레임 부재', '무수축몰탈', '고정 브래킷'],
    pick: '재질은 현장 환경에 따라 STS304 / STS316 / 용융아연도금 중에서 고릅니다. 한 가지를 정답으로 두지 않습니다.'
  }
];

/* ============================================================ */
const PAGES = [

  /* ── HOME ─────────────────────────────────────────────── */
  {
    file: 'index.html', navKey: '',
    title: '제주안전시설 | 제주 안전시설 설치·교체·보수 · 안전자재 납품',
    description: '제주안전시설은 (주)아인산업안전이 운영하는 제주 안전시설 전문 브랜드입니다. ' +
      '관공서·공공기관·학교의 차선규제봉, 시선유도봉, 출차주의등, 배수로 그레이팅, 경사로 진입판 등 ' +
      '안전시설 설치·교체·보수와 안전자재 납품을 제주 전 지역에서 수행합니다.',
    trail: null,
    faq: [
      { q: '제주 어느 지역까지 시공하나요?', a: '제주특별자치도 전 지역입니다. 제주시·서귀포시와 읍면 지역에서 현장 확인 후 시공합니다. 육지 시공은 하지 않습니다.' },
      { q: '안전시설 자재만 납품받을 수 있나요?', a: '가능합니다. 직영으로 설치하시는 경우 필요한 시설과 수량을 알려주시면 납품 견적을 드립니다. 소량 구매는 \에서 바로 하실 수 있습니다.' },
      { q: '소규모 공사도 맡아 주시나요?', a: '1개소부터 시공합니다. 물량이 작아 견적을 받기 어려운 현장을 주로 맡고 있습니다.' },
      { q: '제주 건설현장에 안전용품·안전자재 납품이 되나요?', a: '가능합니다. 제주도 내 건설·시공 현장에 차선규제봉, 시선유도봉, 반사테이프, 배수로 그레이팅, 경계석, 금속 부자재 등을 납품합니다. 설치가 필요하면 시공까지 함께 진행합니다.' },
      { q: '제주 학교 안전시설 시공이 가능한가요?', a: '가능합니다. 통학로 시선유도봉, 출입구 경사로 진입판, 교내 배수로 그레이팅 등을 시공한 사례가 있습니다. 학생 통행이 없는 방학 기간에 맞춰 진행합니다.' },
      { q: '공공기관이 아니어도 문의할 수 있나요?', a: '가능합니다. 공공·교육시설이 중심이지만 제주도 내 공동주택, 병원, 호텔·리조트, 어린이집, 사업장 등도 문의를 받고 있습니다.' }
    ],
    body: `
<!-- ═══════════ 01 HERO ═══════════
     흰 배경 비대칭 — 좌 헤드라인 / 우 실제 현장 사진.
     사진은 사례 001(서귀포시 치유의 숲 입구 로터리)의 실제 시공 후 사진입니다. -->
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__text">
      <h1 class="hero__title">제주의 안전시설을<br>설치하고, 고치고,<br>오래 지킵니다.</h1>
      <p class="hero__scope">도로 · 학교 · 공공시설 · 관광시설</p>
      <p class="hero__desc">안전시설 시공 · 유지보수 · 안전자재 납품</p>
      <div class="hero__actions">
        <a class="link-arrow" href="cases.html">제주 시공사례</a>
        <a class="btn-ghost" href="contact.html?type=site">현장 견적 문의</a>
      </div>
    </div>
    <figure class="hero__media">
      <img src="assets/images/cases/001/after-01.jpg" srcset="assets/images/cases/001/after-01-thumb.jpg 773w, assets/images/cases/001/after-01.jpg 900w" sizes="(max-width:900px) 100vw, 50vw" alt="서귀포시 로터리 진입부에 차선규제봉을 교체한 도로" width="900" height="507" loading="eager" fetchpriority="high" decoding="async">
      <figcaption>서귀포시 치유의 숲 입구 로터리 — 차선규제봉 교체</figcaption>
    </figure>
  </div>
</section>

<!-- ═══════════ 02 ABOUT ═══════════ -->
<section class="section">
  <div class="wrap statement__grid">
    <div class="statement__text reveal">
      <span class="eyebrow">About Us</span>
      <h2>제주의 현장을 알고,<br>필요한 안전을<br>현장에서 해결합니다.</h2>
      <p>${COMPANY.relationSentence} 제주도 안에서 관공서·공공기관과 학교의 안전시설을
         설치하고, 교체하고, 보수합니다. 건설·시공 현장에는 안전용품과 안전자재를 납품하고,
         필요하면 설치까지 함께 진행합니다. 영업 지역은 ${COMPANY.areaServedLabel}입니다.</p>
      <p>물량이 작아 견적을 받기 어려운 현장을 주로 맡습니다. 1개소부터 시공하고,
         직영으로 설치하시는 경우에는 자재만 납품합니다. 시설물 유지관리 공사업과
         안전용품 업종을 함께 등록해 두어 시공과 납품을 한 곳에서 처리합니다.</p>
      <p class="statement__more"><a class="link-arrow" href="about.html">회사소개</a></p>
    </div>
    <figure class="statement__media reveal">
      <img src="assets/images/cases/009/after-02.jpg" alt="단지 내 도로의 경계석을 교체하고 아스콘 포장을 복구한 모습" width="900" height="507" loading="lazy" decoding="async">
      <figcaption>단지 내 도로 — 경계석 교체와 아스콘 포장 복구</figcaption>
    </figure>
  </div>
</section>

<!-- ═══════════ 03 RECENT PROJECTS ═══════════
     사진이 주인공입니다. 상자형 카드를 쓰지 않습니다.
     지역·시설·작업은 cases.js 에 실제로 있는 값만 표시됩니다. -->
<section class="section section--surface">
  <div class="wrap">
    <div class="section-head section-head--row reveal">
      <div>
        <span class="eyebrow">Recent Projects</span>
        <h2>제주 현장 시공사례</h2>
      </div>
      <p>사진과 작업 내용을 그대로 정리했습니다.<br>비슷한 현장이면 견적을 가늠하실 수 있습니다.</p>
    </div>
    <div class="works__grid" id="homeWorks" data-limit="6"></div>
    <p class="works__more"><a class="link-arrow" href="cases.html">시공사례 전체 보기</a></p>
  </div>
</section>

<!-- ═══════════ 04 SERVICES ═══════════
     번호 + 괘선 목록. 동일한 라운드 카드를 다섯 번 반복하지 않습니다. -->
<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow">Services</span>
      <h2>다섯 가지 분야</h2>
      <p>제주에서 실제로 수행한 작업을 기준으로 나눴습니다.</p>
    </div>
    <div class="svc-list">
      ${SERVICES.map((s, i) => `
      <a class="svc-row reveal" href="service/${s.slug}.html">
        <span class="svc-row__no">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3 class="svc-row__ttl">${s.name}</h3>
          <p class="svc-row__text">${s.summary}</p>
          <ul class="svc-row__items">${s.facilities.slice(0, 4).map((f) => `<li>${f}</li>`).join('')}</ul>
        </div>
        <span class="svc-row__go">보기</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<!-- ═══════════ 05 자재 납품 ═══════════ -->
<section class="section section--surface">
  <div class="wrap supply__grid">
    <div class="supply__text reveal">
      <span class="eyebrow">Materials</span>
      <h2>시공 없이<br>자재만 납품받을 수 있습니다.</h2>
      <p class="supply__desc">직영으로 설치하시는 경우 필요한 시설과 수량을 알려주시면 납품 견적을 드립니다.
         규격과 재질은 현장 조건에 맞춰 함께 정합니다. 관공서·학교의 안전자재 납품과
         제주도 내 건설·시공 현장의 안전용품 납품을 모두 받고 있습니다.
         소량·직접 구매는 <a href="${SHOP}" target="_blank" rel="noopener noreferrer">${EXTERNAL_LINKS.shop.shortLabel}</a>에서 바로 하실 수 있습니다.</p>
      <div class="supply__actions">
        <a class="link-arrow" href="products.html">제품·자재 보기</a>
        <a class="btn-ghost" href="construction-safety.html">건설현장 안전용품·자재 납품</a>
      </div>
    </div>
    <figure class="supply__media reveal">
      <img src="assets/images/cases/004/after-01.jpg" alt="배수로에 새로 설치한 중하중 그레이팅" width="966" height="544" loading="lazy" decoding="async">
      <figcaption class="figure-note">배수로 중하중 그레이팅 — 교체 후</figcaption>
    </figure>
  </div>
</section>

<!-- ═══════════ 06 진행 절차 ═══════════ -->
<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow">Process</span>
      <h2>진행 절차</h2>
      <p>자재 납품은 <strong>필요 자재 확인 → 규격·수량 협의 → 견적 → 납품</strong> 순으로 진행합니다.</p>
    </div>
    <ol class="steps">
      ${PROCESS_INSTALL.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<!-- ═══════════ 07 현장 상황별 안내 ═══════════ -->
<section class="section section--surface">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow">Where to start</span>
      <h2>어떤 상황이신가요?</h2>
      <p>지금 겪고 계신 상황을 고르시면 해당 안내로 바로 이동합니다.</p>
    </div>
    <ul class="problem-list">
      ${PROBLEM_ROUTES.map(([label, href]) =>
        `<li><a href="${href}">${label}<em>바로가기 →</em></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<!-- ═══════════ 08 CONTACT ═══════════ -->
<section class="cta-band">
  <div class="wrap">
    <span class="eyebrow">Contact</span>
    <h2>현장 사진 한 장이면<br>시작할 수 있습니다.</h2>
    <p>현장 사진 1~2장과 위치, 수량을 보내주시면 개략 견적을 드립니다.</p>
    <a class="cta-band__tel" href="${TEL}">${COMPANY.tel}</a>
    <p class="cta-band__hours">${COMPANY.areaServedLabel} · 1개소부터 시공·납품</p>
    <div class="btn-row">
      <a class="btn" href="contact.html">문의 남기기</a>
      <a class="btn-ghost" href="contact.html?type=supply">자재 납품 문의</a>
    </div>
  </div>
</section>`
  },

  /* ── SERVICE 개요 ─────────────────────────────────────── */
  {
    file: 'service.html', navKey: 'service',
    title: '제주 안전시설 설치·교체·보수 서비스 | 제주안전시설',
    description: '제주도 내 안전시설 설치·교체·보수 서비스 안내입니다. 도로·교통, 스테인리스·금속, ' +
      '학교·어린이, 보행·생활, 공공시설 유지보수 5개 분야와 시설별 안내를 정리했습니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '서비스' }],
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>제주 안전시설 설치·교체·보수</h1>
    <p>제주도 내 관공서·공공기관·학교·공공시설을 중심으로, 소규모 안전시설을 현장에서 설치하고 교체·보수합니다.
       1개소부터 시공하며 기존 시설 철거도 함께 진행합니다.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="grid grid--3">${serviceCards('')}</div>
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <div class="section-head">
      <h2>시설 이름으로 찾기</h2>
      <p>찾으시는 시설을 고르시면 해당 분야 안내로 이동합니다.</p>
    </div>
    <div class="chips">
      ${SERVICES.flatMap((s) => s.facilities.map((f) =>
        `<a class="chip" href="service/${s.slug}.html">${f}</a>`)).join('\n      ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>진행 절차</h2></div>
    <ol class="steps">
      ${PROCESS_INSTALL.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('\n      ')}
    </ol>
    <p class="note">공동주택·병원·호텔·리조트·어린이집·사업장 등 제주도 내 시설도 문의 가능합니다.</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="contact.html?type=site">현장 확인 요청</a>
      <a class="btn btn-ghost" href="cases.html">시공사례 보기</a>
    </div>
  </div>
</section>`
  },

  /* ── CASES 목록 ───────────────────────────────────────── */
  {
    file: 'cases.html', navKey: 'cases',
    title: '제주 안전시설 시공사례 | 설치·교체·보수 기록',
    description: '제주안전시설이 제주도에서 실제로 수행한 안전시설 시공사례입니다. ' +
      '차선규제봉 교체, 시선유도봉 설치, 출차주의등 설치, 그레이팅 교체, 경계석 재설치 등을 ' +
      '문제·작업·결과와 시공 전후 사진으로 정리했습니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '시공사례' }],
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>제주 안전시설 시공사례</h1>
    <p>제주도에서 실제로 해결한 현장 기록입니다. 새로 설치한 <strong>시공</strong>과
       기존 시설을 고친 <strong>교체·유지보수</strong>를 기록 유형으로 구분해 두었습니다.
       분야와 작업 유형을 선택하면 비슷한 시공사례를 쉽게 찾을 수 있습니다.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="filters">
      <label class="sr-only" for="caseSearch">사례 검색</label>
      <input class="search-box" id="caseSearch" type="search" placeholder="시설명·지역·작업으로 검색 (예: 그레이팅, 서귀포, 교체)">

      <div class="filter-group" data-filter="evidence" data-values='${JSON.stringify(EVIDENCE_FILTER)}'>
        <span>기록 유형</span><div class="chips"></div>
      </div>
      <div class="filter-group" data-filter="service" data-values='${JSON.stringify(SERVICES.map((s) => ({ value: s.slug, label: s.name })))}'>
        <span>분야</span><div class="chips"></div>
      </div>
      <div class="filter-group" data-filter="work" data-values='${JSON.stringify(['설치', '교체', '보수', '개선'])}'>
        <span>작업 유형</span><div class="chips"></div>
      </div>
    </div>

    <p class="result-count" id="caseCount" role="status"></p>
    <div class="grid grid--3" id="caseGrid"></div>

    <p class="note" style="margin-top:24px">
      원문에 기재되지 않은 지역·발주처는 비워 두었습니다. 확인되지 않은 정보를 표기하지 않습니다.
    </p>
  </div>
</section>

<section class="cta-band">
  <div class="wrap">
    <h2>비슷한 현장이신가요?</h2>
    <p>현장 사진과 위치를 보내주시면 개략 견적을 드립니다.</p>
    <div class="btn-row">
      <a class="btn btn-safety" href="${TEL}">☎ ${COMPANY.tel}</a>
      <a class="btn btn-ghost" href="contact.html?type=quote">견적 문의</a>
    </div>
  </div>
</section>`
  },

  /* ── PRODUCT ──────────────────────────────────────────── */
  {
    file: 'products.html', navKey: 'products',
    title: '제주 안전용품·안전자재 납품 | 품목별 규격과 선택 기준',
    description: '제주도 내 안전용품·안전자재 납품 안내입니다. 차선규제봉, 시선유도봉, 반사테이프, ' +
      '배수로 그레이팅, 경사로 진입판 등 품목별 규격과 고르는 기준을 정리했습니다. ' +
      '수량·규격이 정해진 납품은 견적으로, 소량 구매는 \로 안내합니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '제품·자재' }],
    faq: [
      { q: '안전시설 자재만 납품받을 수 있나요?', a: '가능합니다. 직영 인력이 설치하시는 경우 필요한 자재와 수량을 알려주시면 납품 견적을 드립니다.' },
      { q: '규격을 모르는데 어떻게 주문하나요?', a: '제주도 내 현장이면 방문해 실측한 뒤 규격을 정해 드립니다. 배수로 그레이팅처럼 실측이 필요한 품목은 특히 그렇습니다.' },
      { q: '관공서 수의계약 서류도 처리되나요?', a: '가능합니다. 세금계산서 발행과 필요한 서류를 준비해 드립니다. 필요한 양식을 알려주세요.' },
      { q: '소량만 필요한데 어떻게 하나요?', a: '\에서 바로 구매하실 수 있습니다. 설치까지 필요하시면 견적 문의를 이용해 주세요.' }
    ],
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>안전용품·안전자재 납품</h1>
    <p>제주도 내 관공서·공공기관·학교와 건설·시공 현장에 안전용품과 안전자재를 납품합니다.
       설치까지 필요하시면 시공 견적으로, 직접 설치하시면 자재 납품 또는 쇼핑몰 구매로 안내합니다.
       건설현장 납품은 <a href="construction-safety.html">제주 건설현장 안전용품·자재 납품</a>에
       품목과 진행 순서를 따로 정리했습니다.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split">
      <a href="contact.html?type=supply">
        <b>수량·규격이 정해진 납품</b>
        <span>견적으로 진행합니다. 세금계산서 발행과 관공서·학교 수의계약 서류를 준비해 드립니다. 1개소·소량도 가능합니다.</span>
      </a>
      <a href="${SHOP}" target="_blank" rel="noopener noreferrer">
        <b>${EXTERNAL_LINKS.shop.label}</b>
        <span>${EXTERNAL_LINKS.shop.desc} 운영회사 (주)아인산업안전이 운영합니다. (새 창)</span>
      </a>
    </div>
    <p class="note note--safety" style="margin-top:18px">
      이 사이트에서는 주문·결제를 받지 않습니다. 납품은 견적으로, 소량 구매는 쇼핑몰에서 진행됩니다.
    </p>
  </div>
</section>

${PRODUCT_GROUPS.map((g, i) => `
<section class="section${i % 2 ? ' section--surface' : ''}" id="${g.id}">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${g.id.toUpperCase()}</span>
      <h2>${g.name}</h2>
    </div>
    <div class="grid grid--2">
      <div class="card">
        <h3>취급 품목</h3>
        <ul>${g.items.map((it) => `<li>${it}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h3>고를 때 보는 것</h3>
        <p>${g.pick}</p>
        <a class="card-more" href="service/${g.service}.html">관련 서비스 보기 →</a>
      </div>
    </div>
    <div class="btn-row" style="margin-top:14px">
      <a class="btn btn-primary" href="contact.html?type=supply">${g.name} 납품 문의</a>
    </div>
  </div>
</section>`).join('')}

<section class="cta-band">
  <div class="wrap">
    <h2>필요한 자재를 알려주세요</h2>
    <p>품목과 수량, 납품지(제주도 내)를 알려주시면 견적을 드립니다.</p>
    <div class="btn-row">
      <a class="btn btn-safety" href="${TEL}">☎ ${COMPANY.tel}</a>
      <a class="btn btn-ghost" href="contact.html?type=supply">자재 납품 문의</a>
    </div>
  </div>
</section>`
  },

  /* ── 건설현장 안전용품·안전자재 납품 ──────────────────────
     사업 축 B(납품)를 건설현장 수요로 확장한 페이지입니다.
     ※ docs/BRAND_POSITIONING.md 는 '건설현장 가설 안전시설 업체'
       포지션을 명시적으로 거부합니다(주 고객이 건설사가 아님).
       그래서 이 페이지는 '가설 안전시설 시공'이 아니라
       '제주도 내 현장에 안전시설·안전자재를 납품'하는 범위로만 씁니다.
       비계·안전난간·안전망·보호구 등 근거 없는 품목은 적지 않습니다. */
  {
    file: 'construction-safety.html', navKey: 'products',
    title: '제주 건설현장 안전용품·안전자재 납품 | 제주안전시설',
    description: '제주도 내 건설·시공 현장에 안전시설과 안전자재를 납품합니다. ' +
      '차선규제봉, 시선유도봉, 반사테이프, 배수로 그레이팅, 경계석, 금속 부자재를 규격·수량에 맞춰 공급하고, ' +
      '설치가 필요하면 시공까지 함께 진행합니다. 제주 전 지역, 1개소·소량부터.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '건설현장 안전용품·자재' }],
    /* 실제 페이지 내용과 같은 범위만 선언합니다 — 납품(공급)과 설치.
       가설 안전시설 시공은 하지 않으므로 넣지 않습니다. */
    jsonld: [{
      '@type': 'Service',
      '@id': '#service-construction-supply',
      name: '제주 건설현장 안전용품·안전자재 납품',
      serviceType: '안전용품·안전자재 납품',
      description: '제주도 내 건설·시공 현장에 차선규제봉, 시선유도봉, 반사테이프, 배수로 그레이팅, ' +
        '경계석, 금속 부자재 등 안전시설과 안전자재를 납품하고, 필요하면 설치까지 진행합니다.',
      provider: { '@id': ENTITY_BRAND },
      areaServed: COMPANY.areaServed.map((a) => ({ '@type': 'AdministrativeArea', name: a }))
    }],
    faq: [
      { q: '제주 건설현장에 안전용품·안전자재 납품이 가능한가요?', a: '가능합니다. 제주특별자치도 전 지역으로 납품합니다. 필요한 품목과 규격, 수량, 현장 위치를 알려주시면 견적을 드립니다. 육지 납품은 하지 않습니다.' },
      { q: '납품만 받을 수 있나요, 설치도 해주시나요?', a: '둘 다 가능합니다. 직영 인력이 설치하시면 자재만 납품하고, 설치가 필요하면 시공 견적으로 진행합니다. 기존 시설 철거가 필요한 경우도 함께 처리합니다.' },
      { q: '소량만 필요한데 납품되나요?', a: '1개소·소량부터 납품합니다. 물량이 작아 견적을 받기 어려운 현장을 주로 맡고 있습니다. 아주 소량이면 (주)아인산업안전이 운영하는 \에서 바로 구매하실 수도 있습니다.' },
      { q: '세금계산서와 거래 서류 처리가 되나요?', a: '가능합니다. 세금계산서를 발행하고, 필요한 거래 서류를 준비해 드립니다. 필요한 양식을 알려주세요.' },
      { q: '규격을 모르는 상태에서도 문의할 수 있나요?', a: '가능합니다. 제주도 내 현장이면 방문해 실측한 뒤 규격을 정합니다. 배수로 그레이팅처럼 기존 프레임 실측이 필요한 품목은 특히 그렇습니다. 현장 사진 1~2장만 보내주셔도 됩니다.' }
    ],
    body: `
<section class="page-head">
  <div class="wrap">
    <span class="eyebrow">Construction Site Supply</span>
    <h1>제주 건설현장 안전용품·안전자재 납품</h1>
    <p>제주도 내 건설·시공 현장에 안전시설과 안전자재를 납품합니다.
       규격과 수량이 정해져 있으면 견적으로, 설치까지 필요하면 시공으로 진행합니다.
       ${COMPANY.areaServedLabel}에서 1개소·소량부터 대응합니다.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2>납품할 수 있는 품목</h2>
    <p>아래는 제주안전시설이 실제로 시공하거나 납품해 온 품목입니다.
       현장에서 다뤄 본 것만 적었습니다. 품목별 규격과 선택 기준은
       <a href="products.html">제품·자재 페이지</a>에 정리되어 있습니다.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>구분</th><th>품목</th><th>건설현장에서 쓰이는 곳</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>도로·교통 안전자재</strong></td>
            <td>차선규제봉, 시선유도봉, 고휘도 반사테이프, 반사 경고도료, 볼라드</td>
            <td>공사 구간 차로 분리, 진출입 동선 유도, 야간 시인성 확보</td>
          </tr>
          <tr>
            <td><strong>보행·배수 자재</strong></td>
            <td>배수로 그레이팅, 중하중 그레이팅, 트렌치 커버</td>
            <td>차량이 지나는 구간의 배수로 복개, 발 빠짐·덜컹거림 해소</td>
          </tr>
          <tr>
            <td><strong>진입·단차 자재</strong></td>
            <td>경사로 진입판(차량 진입판 U형)</td>
            <td>보도·도로 단차 해소, 차량 진입 충격 완화</td>
          </tr>
          <tr>
            <td><strong>보수·복구 자재</strong></td>
            <td>도로 경계석, 아스콘, 방청·재도장 자재, 앵커·고정 부자재</td>
            <td>준공 전 원상복구, 파손 구간 부분 보수</td>
          </tr>
          <tr>
            <td><strong>스테인리스·금속 부자재</strong></td>
            <td>앵글·프레임 부재, 무수축몰탈, 고정 브래킷</td>
            <td>현장 조건에 맞춘 고정·프레임 작업</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="note note--safety">
      취급하지 않는 품목은 적지 않았습니다. 위 목록에 없는 자재가 필요하시면
      먼저 문의해 주세요. 가능한 것과 불가능한 것을 그대로 알려드립니다.
    </p>
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <h2>납품만 받을지, 설치까지 맡길지</h2>
    <p>현장 인력이 직접 설치하는 경우와 시공까지 맡기는 경우를 나눠 진행합니다.</p>
    <div class="split">
      <a href="contact.html?type=supply">
        <b>자재만 납품</b>
        <span>규격과 수량이 정해진 경우입니다. 견적 후 납품하며, 세금계산서와 필요한 거래 서류를 준비해 드립니다. 1개소·소량도 가능합니다.</span>
      </a>
      <a href="contact.html?type=site">
        <b>납품 + 설치</b>
        <span>설치까지 필요한 경우입니다. 제주도 내 현장을 확인한 뒤 규격을 정하고, 기존 시설 철거가 필요하면 함께 진행합니다.</span>
      </a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2>제주 현장에서 자주 나오는 요청</h2>
    <p>건설·시공 현장에서 실제로 들어오는 요청은 대개 다음 형태입니다.
       모두 제주안전시설이 시공사례로 남긴 작업과 같은 계열입니다.</p>
    <ul class="problem-list">
      <li><a href="service/road-traffic.html">공사 구간 차로를 분리할 시선유도봉·차선규제봉이 필요합니다<em>도로·교통 안전시설 →</em></a></li>
      <li><a href="service/pedestrian-life.html">차량이 지나는 배수로에 중하중 그레이팅을 넣어야 합니다<em>보행·배수 안전시설 →</em></a></li>
      <li><a href="service/public-maintenance.html">준공 전에 경계석과 포장을 원상복구해야 합니다<em>보수·유지관리 →</em></a></li>
      <li><a href="service/metal-fabrication.html">해풍 환경이라 금속 부재 재질을 정해야 합니다<em>스테인리스·금속 시설물 →</em></a></li>
      <li><a href="products.html">규격·수량이 정해진 자재를 납품받고 싶습니다<em>제품·자재 안내 →</em></a></li>
    </ul>
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Evidence</span>
      <h2>같은 계열의 제주 시공사례</h2>
      <p>건설현장 납품과 같은 품목을 실제로 시공한 기록입니다. 규격과 작업 방식을 가늠하실 수 있습니다.</p>
    </div>
    <div class="works__grid" id="worksGrid" data-cases-ids="1,9,4"></div>
    <p class="works__more"><a class="link-arrow" href="cases.html">제주 시공사례 전체 보기</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2>납품 진행 순서</h2>
    <ol class="steps">
      <li><b>필요 품목 확인</b><span>품목과 대략 수량, 현장 위치를 알려주세요. 현장 사진 1~2장이면 충분한 경우가 많습니다.</span></li>
      <li><b>규격·수량 협의</b><span>규격이 정해지지 않았으면 제주도 내 현장을 방문해 실측합니다.</span></li>
      <li><b>견적</b><span>자재만 납품할지, 설치까지 포함할지 나눠 견적을 드립니다.</span></li>
      <li><b>납품 또는 시공</b><span>납품 일정을 맞추고, 설치가 포함되면 현장 일정에 맞춰 진행합니다.</span></li>
    </ol>
  </div>
</section>

<section class="cta-band">
  <div class="wrap">
    <span class="eyebrow">Contact</span>
    <h2>필요한 품목과 수량을<br>알려주세요.</h2>
    <p>제주도 내 현장이면 방문해 실측한 뒤 규격을 정합니다. 현장 사진 1~2장만 보내주셔도 됩니다.</p>
    <a class="cta-band__tel" href="${TEL}">${COMPANY.tel}</a>
    <p class="cta-band__hours">${COMPANY.areaServedLabel} · 1개소·소량부터 납품</p>
    <div class="btn-row">
      <a class="btn" href="contact.html?type=supply">자재 납품 문의</a>
      <a class="btn-ghost" href="${SHOP}" target="_blank" rel="noopener noreferrer">\</a>
    </div>
  </div>
</section>`
  },

  /* ── GUIDE 목록 ───────────────────────────────────────── */
  {
    file: 'guide.html', navKey: 'guide',
    title: '안전시설 설치·교체·유지관리 자료실 | 제주안전시설',
    description: '시선유도봉·차선규제봉 설치 기준, 스텐 자바라 대문 시공 공정, 제주 해풍 환경의 금속 재질 선정 등 ' +
      '제주 현장에서 확인한 안전시설 자료를 정리했습니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '자료실' }],
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>안전시설 자료실</h1>
    <p>현장에서 실제로 확인한 내용만 정리합니다. 각 문서는 관련 서비스와 실제 시공사례로 이어집니다.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="grid grid--3">
      ${GUIDES.map((g) => `
      <a class="card card-link" href="guide/${g.slug}.html">
        <h3>${g.title}</h3>
        <p>${g.summary}</p>
        <span class="card-more">읽어보기 →</span>
      </a>`).join('')}
    </div>
    <p class="note" style="margin-top:22px">
      자료는 실제 시공사례가 쌓이는 대로 시설별로 늘려 갑니다.
      찾으시는 시설의 자료가 없으면 <a href="contact.html">문의</a>로 알려주세요.
    </p>
  </div>
</section>`
  },

  /* ── ABOUT ────────────────────────────────────────────── */
  {
    file: 'about.html', navKey: 'about',
    title: '회사소개 | 제주안전시설 · (주)아인산업안전',
    description: '제주안전시설은 (주)아인산업안전이 운영하는 제주 안전시설 전문 브랜드입니다. ' +
      '제주도 내 관공서·공공기관·학교의 안전시설 설치·교체·보수와 안전자재 납품을 수행합니다. ' +
      '사업자정보와 등록 업종을 안내합니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '회사소개' }],
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>제주안전시설 소개</h1>
    <p>${COMPANY.relationSentence}</p>
  </div>
</section>

<section class="section">
  <div class="wrap prose">
    <h2>하는 일</h2>
    <p>제주도 안에서 두 가지를 합니다. 하나는 <strong>안전시설의 설치·교체·보수</strong>이고,
       다른 하나는 <strong>안전시설·안전자재의 납품</strong>입니다.
       금액은 크지 않지만 미루면 위험해지는 시설이 주 대상입니다.</p>
    <p>차선규제봉과 시선유도봉, 출차주의등, 배수로 그레이팅, 경사로 진입판, 도로 경계석,
       반사시설, 스테인리스 금속 시설물처럼 <strong>소규모 안전시설</strong>을 다룹니다.
       기존 시설의 철거와 재설치, 노후 시설 보수도 함께 진행합니다.</p>

    <h2>주로 만나는 고객</h2>
    <p>관공서, 공공기관, 준공공기관, 학교와 교육기관, 공기업, 공공시설 관리주체가 중심입니다.
       공공·교육시설의 담당자는 대개 시설 전문가가 아니기 때문에,
       "무엇을 어떤 규격으로" 정하는 일부터 함께 합니다.</p>
    <p>공공기관만 대상으로 하지는 않습니다. 제주도 내 공동주택, 병원, 호텔·리조트, 어린이집,
       사업장 등에서도 문의를 받고 있습니다.</p>

    <h2>영업 지역</h2>
    <p><strong>${COMPANY.areaServedLabel}</strong>입니다.
       제주 안에서 현장을 직접 확인하고 시공하는 것이 이 브랜드의 전제입니다.
       육지 시공을 주 서비스로 하지 않습니다.</p>

    <h2>왜 제주 업체여야 하는가</h2>
    <ul>
      <li><strong>현장 확인이 빠릅니다.</strong> 사진만으로 판단하지 않고 직접 봅니다.</li>
      <li><strong>소규모 물량에 대응합니다.</strong> 1개소부터 시공·납품합니다.</li>
      <li><strong>제주 환경을 전제로 고릅니다.</strong> 염분·강풍·자외선은 제주에서 상수입니다.</li>
      <li><strong>시공과 자재를 한 곳에서 처리합니다.</strong> 등록 업종에 시설물 유지관리 공사업과 안전용품이 함께 있습니다.</li>
    </ul>

    <h2>운영회사</h2>
    <div class="table-wrap">
      <table>
        <caption>사업자 정보</caption>
        <tbody>
          <tr><th>상호</th><td>${COMPANY.name}</td></tr>
          <tr><th>대표자</th><td>${COMPANY.representative}</td></tr>
          <tr><th>사업자등록번호</th><td>${COMPANY.businessNumber}</td></tr>
          <tr><th>통신판매업신고</th><td>${COMPANY.mailOrderNumber}</td></tr>
          <tr><th>사업 개시</th><td>${COMPANY.foundingDate}</td></tr>
          <tr><th>주소</th><td>${COMPANY.address}</td></tr>
          <tr><th>대표전화</th><td><a href="${TEL}">${COMPANY.tel}</a></td></tr>
          <tr><th>이메일</th><td><a href="mailto:${COMPANY.email}">${COMPANY.email}</a></td></tr>
          <tr><th>등록 업종</th><td>${COMPANY.registeredBusiness.join(' · ')}</td></tr>
          <tr><th>\</th><td><a href="${SHOP}" target="_blank" rel="noopener noreferrer">${SHOP}</a></td></tr>
        </tbody>
      </table>
    </div>

    <div class="btn-row">
      <a class="btn btn-primary" href="contact.html">문의하기</a>
      <a class="btn btn-ghost" href="cases.html">시공사례 보기</a>
    </div>
  </div>
</section>`
  },

  /* ── CONTACT ──────────────────────────────────────────── */
  {
    file: 'contact.html', navKey: 'contact',
    title: '견적·설치·납품 문의 | 제주안전시설',
    description: '제주 안전시설 현장 확인, 시공 견적, 설치, 안전자재 납품 문의를 받습니다. ' +
      '대표전화 1660-4019. 현장 사진 1~2장과 위치, 수량을 보내주시면 개략 견적이 가능합니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '문의' }],
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>견적 · 설치 · 납품 문의</h1>
    <p>제주도 내 현장이면 직접 확인하고 견적을 드립니다.
       <strong>현장 사진 1~2장과 위치, 수량</strong>을 보내주시면 개략 견적이 가능합니다.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="card">
        <h3>바로 연락하기</h3>
        <p>가장 빠른 방법입니다. 통화가 어려우시면 문자로 남겨 주세요.</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="${TEL}">☎ ${COMPANY.tel}</a>
          <a class="btn btn-ghost" href="${COMPANY.smsHref}">문자 보내기</a>
        </div>
        <p style="margin-top:12px" class="card-tags">
          이메일 <a href="mailto:${COMPANY.email}">${COMPANY.email}</a><br>
          상담시간 ${COMPANY.hours}
        </p>
      </div>
      <div class="card">
        <h3>문의 유형</h3>
        <ul>
          <li><strong>현장 확인</strong> — 상태를 봐야 판단이 되는 경우</li>
          <li><strong>견적 문의(시공)</strong> — 설치·교체·보수 범위 산정</li>
          <li><strong>설치 문의</strong> — 자재는 있고 설치만 필요한 경우</li>
          <li><strong>자재 납품 문의</strong> — 직영 설치용 자재 납품</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <div class="section-head">
      <h2>문의 내용 작성</h2>
      <p>아래를 채우고 버튼을 누르면 메일 앱에 내용이 자동으로 채워집니다.
         메일에 <strong>현장 사진을 첨부</strong>해 보내주시면 됩니다.</p>
    </div>

    <form id="inquiryForm" class="card" novalidate>
      <p>
        <label for="f-type"><strong>문의 유형</strong></label><br>
        <select id="f-type" name="type" class="search-box">
          <option value="site">현장 확인 요청</option>
          <option value="quote" selected>견적 문의 (시공)</option>
          <option value="install">설치 문의</option>
          <option value="supply">자재 납품 문의</option>
        </select>
      </p>
      <div class="grid grid--2">
        <p><label for="f-org">기관/업체명</label><input class="search-box" id="f-org" name="org" type="text" autocomplete="organization"></p>
        <p><label for="f-name">담당자</label><input class="search-box" id="f-name" name="name" type="text" autocomplete="name"></p>
        <p><label for="f-phone">연락처</label><input class="search-box" id="f-phone" name="phone" type="tel" autocomplete="tel"></p>
        <p><label for="f-place">현장 위치 (제주도 내)</label><input class="search-box" id="f-place" name="place" type="text" placeholder="예: 제주시 ○○동 / 서귀포시 ○○읍"></p>
        <p><label for="f-facility">시설 / 자재</label><input class="search-box" id="f-facility" name="facility" type="text" placeholder="예: 시선유도봉, 배수로 그레이팅"></p>
        <p><label for="f-qty">수량</label><input class="search-box" id="f-qty" name="qty" type="text" placeholder="예: 12개소 / 미정"></p>
      </div>
      <p>
        <label for="f-msg">내용</label>
        <textarea class="search-box" id="f-msg" name="message" rows="5" placeholder="현재 상태와 필요한 작업을 적어 주세요."></textarea>
      </p>
      <div class="btn-row">
        <button class="btn btn-safety" type="submit">메일로 문의 보내기</button>
        <a class="btn btn-ghost" href="${TEL}">전화가 편하시면</a>
      </div>
      <p class="card-tags" style="margin-top:10px">
        입력하신 내용은 이 사이트에 저장되지 않습니다. 메일 앱으로 그대로 전달됩니다.
      </p>
    </form>

    <p class="note" style="margin-top:18px">
      공동주택·병원·호텔·리조트·어린이집·사업장 등 제주도 내 시설도 문의 가능합니다.
    </p>
  </div>
</section>`
  },

  /* ── PRIVACY ──────────────────────────────────────────── */
  {
    file: 'privacy.html', navKey: '',
    title: '개인정보처리방침 | 제주안전시설',
    description: '제주안전시설(운영: (주)아인산업안전)의 개인정보처리방침입니다. ' +
      '이 사이트는 별도의 회원가입이나 서버 저장 없이 전화·문자·이메일로만 문의를 받습니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '개인정보처리방침' }],
    body: `
<section class="page-head"><div class="wrap"><h1>개인정보처리방침</h1></div></section>
<section class="section"><div class="wrap prose">
  <h2>1. 수집하는 정보</h2>
  <p>이 웹사이트는 회원가입 기능이 없으며, 방문자의 개인정보를 서버에 저장하지 않습니다.
     문의 페이지의 입력 항목은 방문자의 기기에서 메일 본문으로 조립될 뿐이며 이 사이트로 전송·저장되지 않습니다.</p>
  <p>전화·문자·이메일로 문의를 주시는 경우, 상담과 견적에 필요한 범위에서
     기관/업체명, 담당자명, 연락처, 현장 위치, 문의 내용을 확인합니다.</p>

  <h2>2. 이용 목적</h2>
  <p>현장 확인, 견적 산출, 시공 및 자재 납품 진행, 이후의 유지관리 안내를 위해서만 사용합니다.</p>

  <h2>3. 보유 기간</h2>
  <p>상담이 종료되고 계약으로 이어지지 않은 경우 관련 기록을 파기합니다.
     계약이 체결된 경우 관계 법령이 정한 기간 동안 보관합니다.</p>

  <h2>4. 제3자 제공</h2>
  <p>법령에 따른 경우를 제외하고 제3자에게 제공하지 않습니다.</p>

  <h2>5. 시공 사진</h2>
  <p>시공사례에 사용하는 사진은 현장 기록 사진입니다. 발주처가 특정될 수 있는 정보(기관명, 차량번호,
     인물, 명패 등)는 게시하지 않거나 확인 후 게시합니다.
     이미 게시된 사례에 대해 게시 중단을 원하시면 아래 연락처로 알려 주시면 즉시 조치합니다.</p>

  <h2>6. 문의처</h2>
  <p>${COMPANY.name} · ${COMPANY.address}<br>
     전화 <a href="${TEL}">${COMPANY.tel}</a> · 이메일 <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
</div></section>`
  },

  /* ── 404 ──────────────────────────────────────────────── */
  {
    file: '404.html', navKey: '',
    title: '페이지를 찾을 수 없습니다 | 제주안전시설',
    description: '요청하신 페이지를 찾을 수 없습니다. 주소가 바뀌었거나 삭제된 페이지입니다. 제주안전시설의 안전시설 서비스, 제주 시공사례, 제품·자재 납품 안내, 문의 페이지로 이동하실 수 있습니다.',
    trail: null,
    noindex: true,
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>페이지를 찾을 수 없습니다</h1>
    <p>주소가 바뀌었거나 삭제된 페이지입니다. 아래에서 원하시는 곳으로 이동해 주세요.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="grid grid--2">
      <a class="card card-link" href="service.html"><h3>서비스</h3><p>안전시설 설치·교체·보수 5개 분야</p></a>
      <a class="card card-link" href="cases.html"><h3>시공사례</h3><p>제주에서 실제로 해결한 현장 기록</p></a>
      <a class="card card-link" href="products.html"><h3>제품·자재</h3><p>안전자재 납품 및 쇼핑몰 안내</p></a>
      <a class="card card-link" href="contact.html"><h3>문의</h3><p>현장 확인 · 견적 · 납품 문의</p></a>
    </div>
  </div>
</section>`
  }
];

module.exports = { PAGES, serviceCards, PROCESS_INSTALL, PRODUCT_GROUPS };

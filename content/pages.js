/* ============================================================
   content/pages.js — 정적 페이지 본문
   ------------------------------------------------------------
   골격(head·헤더·푸터·JSON-LD)은 tools/lib/layout.js 가 붙입니다.
   여기에는 <main> 안에 들어갈 내용만 씁니다.
   ============================================================ */
'use strict';

const { COMPANY } = require('../assets/js/config.js');
const { SERVICES } = require('../assets/js/services.js');
const { GUIDES } = require('../assets/js/guides.js');

const TEL = COMPANY.telHref;
const SHOP = COMPANY.storeUrl;

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
      { q: '안전시설 자재만 납품받을 수 있나요?', a: '가능합니다. 직영으로 설치하시는 경우 필요한 시설과 수량을 알려주시면 납품 견적을 드립니다. 소량 구매는 안전용품 쇼핑몰에서 바로 하실 수 있습니다.' },
      { q: '소규모 공사도 맡아 주시나요?', a: '1개소부터 시공합니다. 물량이 작아 견적을 받기 어려운 현장을 주로 맡고 있습니다.' },
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
      <img src="assets/images/cases/001/after-01.jpg" alt="서귀포시 로터리 진입부에 차선규제봉을 교체한 도로" width="900" height="507" loading="eager" fetchpriority="high" decoding="async">
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
      <p>제주안전시설은 ${COMPANY.relationSentence} 관공서·공공기관·학교의 안전시설을
         설치하고, 교체하고, 보수합니다. 영업 지역은 ${COMPANY.areaServedLabel}입니다.</p>
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
        <h2>제주에서 한 일</h2>
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
         규격과 재질은 현장 조건에 맞춰 함께 정합니다. 소량 구매는 안전용품 쇼핑몰에서 바로 하실 수 있습니다.</p>
      <div class="supply__actions">
        <a class="link-arrow" href="products.html">제품·자재 보기</a>
        <a class="btn-ghost" href="${SHOP}" target="_blank" rel="noopener noreferrer">안전용품 쇼핑몰</a>
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
    <p>제주도에서 실제로 해결한 현장 기록입니다. 발주처 유형과 시설로 걸러 보시면
       비슷한 현장을 찾기 쉽습니다.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="filters">
      <label class="sr-only" for="caseSearch">사례 검색</label>
      <input class="search-box" id="caseSearch" type="search" placeholder="시설명·지역·작업으로 검색 (예: 그레이팅, 서귀포, 교체)">

      <div class="filter-group" data-filter="customer" data-values='${JSON.stringify(['관공서', '공공기관', '공기업', '학교', '교육기관', '공공주차장', '공원·체육시설', '공동주택', '사업장'])}'>
        <span>발주처 유형</span><div class="chips"></div>
      </div>
      <div class="filter-group" data-filter="service" data-values='${JSON.stringify(SERVICES.map((s) => ({ value: s.slug, label: s.name })))}'>
        <span>분야</span><div class="chips"></div>
      </div>
      <div class="filter-group" data-filter="work" data-values='${JSON.stringify(['설치', '교체', '보수', '개선'])}'>
        <span>작업 유형</span><div class="chips"></div>
      </div>
      <div class="filter-group" data-filter="region" data-values='${JSON.stringify(['제주시', '서귀포시'])}'>
        <span>지역</span><div class="chips"></div>
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
    title: '제주 안전시설·안전자재 납품 | 제주안전시설',
    description: '제주도 내 안전시설·안전자재 납품 안내입니다. 차선규제봉, 시선유도봉, 반사테이프, ' +
      '배수로 그레이팅, 경사로 진입판 등 수량·규격이 정해진 납품은 견적으로, 소량 구매는 안전용품 쇼핑몰로 안내합니다.',
    trail: [{ label: '홈', href: 'index.html' }, { label: '제품·자재' }],
    faq: [
      { q: '안전시설 자재만 납품받을 수 있나요?', a: '가능합니다. 직영 인력이 설치하시는 경우 필요한 자재와 수량을 알려주시면 납품 견적을 드립니다.' },
      { q: '규격을 모르는데 어떻게 주문하나요?', a: '제주도 내 현장이면 방문해 실측한 뒤 규격을 정해 드립니다. 배수로 그레이팅처럼 실측이 필요한 품목은 특히 그렇습니다.' },
      { q: '관공서 수의계약 서류도 처리되나요?', a: '가능합니다. 세금계산서 발행과 필요한 서류를 준비해 드립니다. 필요한 양식을 알려주세요.' },
      { q: '소량만 필요한데 어떻게 하나요?', a: '안전용품 쇼핑몰에서 바로 구매하실 수 있습니다. 설치까지 필요하시면 견적 문의를 이용해 주세요.' }
    ],
    body: `
<section class="page-head">
  <div class="wrap">
    <h1>안전시설·안전자재 납품</h1>
    <p>제주도 내 관공서·학교·공공기관에 안전시설과 안전자재를 납품합니다.
       설치까지 필요하시면 시공 견적으로, 직접 설치하시면 자재 납품 또는 쇼핑몰 구매로 안내합니다.</p>
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
        <b>소량 · 직접 구매</b>
        <span>운영회사 (주)아인산업안전이 운영하는 안전용품 쇼핑몰에서 바로 구매하실 수 있습니다. (새 창)</span>
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
      <a class="btn btn-ghost" href="${SHOP}" target="_blank" rel="noopener noreferrer">쇼핑몰에서 구매</a>
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
          <tr><th>안전용품 쇼핑몰</th><td><a href="${SHOP}" target="_blank" rel="noopener noreferrer">${SHOP}</a></td></tr>
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

module.exports = { PAGES, serviceCards, PROCESS_INSTALL };

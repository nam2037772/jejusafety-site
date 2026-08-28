#!/usr/bin/env node
/* ============================================================
   tools/build.js — 데이터 → 정적 HTML
   ------------------------------------------------------------
     node tools/build.js            전체 생성
     node tools/build.js --quiet    요약만 출력

   생성 대상
     index / service / cases / products / guide / about / contact / privacy / 404
     service/<slug>.html      × 5   (services.js + content/service-copy.js)
     case/<번호>-<slug>.html  × N   (assets/js/cases.js)          ← 검색 랜딩페이지
     guide/<slug>.html        × N   (guides.js + content/guide-copy.js)
     robots.txt / sitemap.xml

   ▶ case/ 와 guide/ 아래 파일은 생성물입니다. 직접 고치지 마세요 — 다음 빌드에 덮어씁니다.
   ▶ 도메인(config.js 의 siteUrl)이 비어 있으면 canonical·og:url·sitemap 을 만들지 않습니다.
     임의의 placeholder 도메인을 넣지 않습니다.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { page, esc, HAS_DOMAIN, abs, entityId, COMPANY } = require('./lib/layout.js');
const { imageSize } = require('./lib/image-size.js');
const { SERVICES, SERVICE_BY_SLUG } = require('../assets/js/services.js');
const { CASES, publishedCases } = require('../assets/js/cases.js');
const { GUIDES } = require('../assets/js/guides.js');
const { PAGES, PRODUCT_GROUPS } = require('../content/pages.js');

/* 제품군 slug → 한글 이름.
   앵커 텍스트에 'traffic 자재 안내' 처럼 영문 슬러그가 그대로 나가면
   사람에게도 검색엔진에도 의미가 없습니다. */
const PRODUCT_NAME = {};
PRODUCT_GROUPS.forEach((g) => { PRODUCT_NAME[g.id] = g.name; });
const productLabel = (id) => (PRODUCT_NAME[id] || id) + ' 안내';
const { SERVICE_COPY } = require('../content/service-copy.js');
const { GUIDE_COPY } = require('../content/guide-copy.js');

const QUIET = process.argv.includes('--quiet');
const written = [];

function write(file, html) {
  const dest = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, 'utf8');
  written.push(file);
  if (!QUIET) console.log('  ✓ ' + file);
}

function pad3(n) { return String(n).padStart(3, '0'); }
function caseFile(c) { return 'case/' + pad3(c.id) + '-' + c.slug + '.html'; }

/* ── 시공 시기 표기 ────────────────────────────────────────
   근거가 사진 촬영일뿐이면 '경' 을 붙여 근사값임을 드러냅니다.
   확인된 날짜를 흐리지도, 추정치를 확정처럼 쓰지도 않기 위한 장치입니다.
   date 가 없으면 null 을 돌려주고, 화면에서는 행 자체가 빠집니다. */
function dateLabel(c) {
  if (!c.date) return null;
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(c.date);
  if (!m) return c.date;
  const [, y, mo, d] = m;
  const base = d
    ? `${y}년 ${Number(mo)}월 ${Number(d)}일`
    : `${y}년 ${Number(mo)}월`;
  return c.dateBasis === '사진' ? base + '경' : base;
}

/* 증거 유형 — 시공사례 / 납품사례 / 교체·유지보수 사례를 화면에서 가릅니다.
   값이 없으면 '시공' 으로 봅니다 (기존 데이터와의 호환). */
const EVIDENCE_LABEL = { '시공': '시공', '납품': '납품', '유지보수': '교체·유지보수' };
function evidenceOf(c) { return c.evidenceType || '시공'; }

/* 발행 중인 사례만 id 로 찾습니다.
   서비스 페이지의 '시공사례 보기' 배지가 보류 사례를 가리키지 않게 하는 근거입니다. */
const PUBLISHED_BY_ID = {};
publishedCases().forEach((c) => { PUBLISHED_BY_ID[c.id] = c; });
function guideFile(g) { return 'guide/' + g.slug + '.html'; }

/* ── 공통 조각 ─────────────────────────────────────────── */
function faqBlock(faq, heading) {
  if (!faq || !faq.length) return '';
  return `
<section class="section${heading === 'surface' ? ' section--surface' : ''}">
  <div class="wrap">
    <div class="section-head"><h2>자주 묻는 질문</h2></div>
    <div class="faq">
      ${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p class="a">${esc(f.a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

function ctaBand(title, desc, primaryHref, primaryLabel) {
  return `
<section class="cta-band">
  <div class="wrap">
    <h2>${esc(title)}</h2>
    <p>${esc(desc)}</p>
    <div class="btn-row">
      <a class="btn btn-safety" href="{{ROOT}}${primaryHref}">${esc(primaryLabel)}</a>
      <a class="btn btn-ghost" href="${COMPANY.telHref}">☎ ${COMPANY.tel}</a>
    </div>
  </div>
</section>`;
}

/* 하위 폴더 페이지의 상대경로 치환 */
function rel(html, depth) {
  return html.replace(/\{\{ROOT\}\}/g, '../'.repeat(depth));
}

/* <img> 의 width/height — 브라우저가 사진을 받기 전에 잡아 둘 자리입니다.
   실제 파일 비율과 다르면 사진이 도착할 때 레이아웃이 밀립니다(CLS).
   그래서 파일에서 직접 읽고, 못 읽을 때만 기존 기본값으로 물러섭니다.
   `file` 은 assets/images/cases/<no>/ 안의 파일명입니다. */
function sizeAttr(no, file, fallback) {
  const s = imageSize(path.join(ROOT, 'assets', 'images', 'cases', no, file));
  return s ? `width="${s.width}" height="${s.height}"` : fallback;
}

/* ── 사례 카드를 빌드 시점에 심습니다 ──────────────────────
   자바스크립트로만 카드를 그리면 사례 상세 페이지로 가는 링크가
   HTML 안에 존재하지 않습니다. 크롤러(특히 네이버 Yeti)가 스크립트를
   실행하지 않으면 사례가 통째로 색인에서 빠집니다.
   → 정적으로 심어 두고, main.js 는 그 위에서 필터링만 합니다.
────────────────────────────────────────────────────────── */
function caseCardHtml(c, root) {
  const href = `${root}case/${pad3(c.id)}-${c.slug}.html`;
  const dir = `${root}assets/images/cases/${pad3(c.id)}/`;
  const rep = c.images && c.images.representative;
  const repThumb = rep && rep.replace(/(\.[a-z]+)$/i, '-thumb$1');
  const fig = rep
    ? `<img src="${dir}${repThumb}" alt="${esc(c.title)} 시공 후 모습"` +
      ` ${sizeAttr(pad3(c.id), repThumb, 'width="773" height="580"')} loading="lazy" decoding="async">`
    : '<div class="noimg">사진 준비 중</div>';

  const badges = [];
  badges.push(`<span class="badge badge--evidence">${esc(EVIDENCE_LABEL[evidenceOf(c)])}</span>`);
  if (c.region) badges.push(`<span class="badge badge--region">${esc(c.region)}</span>`);
  const cust = c.customerLabel || c.customerType;
  if (cust) badges.push(`<span class="badge badge--customer">${esc(cust)}</span>`);
  (c.workType || []).forEach((w) => badges.push(`<span class="badge badge--work">${esc(w)}</span>`));

  return `<a class="card card-link case-card" href="${href}">` +
    `<figure>${fig}</figure><div class="body">` +
    (badges.length ? `<div class="badges">${badges.join('')}</div>` : '') +
    `<h3>${esc(c.title)}</h3>` +
    `<p>${esc(String(c.problem).slice(0, 78))}…</p>` +
    `<span class="card-more">사례 자세히 보기 →</span></div></a>`;
}

/* 홈 RECENT PROJECTS — 편집형 기록.
   상자형 카드가 아니라 사진 + 현장 정보 한 줄 + 제목으로 둡니다.
   지역·시설·작업은 데이터에 있는 것만 씁니다. 시공 연도는 cases.js 에
   date 가 비어 있으므로 넣지 않습니다 (지어내지 않습니다). */
function workRowHtml(c, root) {
  const href = `${root}case/${pad3(c.id)}-${c.slug}.html`;
  const dir = `${root}assets/images/cases/${pad3(c.id)}/`;
  const rep = c.images && c.images.representative;
  const repThumb = rep && rep.replace(/(\.[a-z]+)$/i, '-thumb$1');
  const fig = rep
    ? `<img src="${dir}${repThumb}" alt="${esc(c.title)} 시공 후 모습"` +
      ` ${sizeAttr(pad3(c.id), repThumb, 'width="773" height="435"')} loading="lazy" decoding="async">`
    : '<div class="noimg">사진 준비 중</div>';

  const meta = [];
  const place = c.region || c.regionDetail || c.customerLabel;
  if (place) meta.push(esc(place));
  if (c.facilityType) meta.push(esc(c.facilityType));
  if ((c.workType || []).length) meta.push(esc(c.workType.join(' · ')));

  return `<a class="work" href="${href}">` +
    `<figure class="work__media">${fig}</figure>` +
    (meta.length ? `<p class="work__meta">${meta.map((m) => `<span>${m}</span>`).join('')}</p>` : '') +
    `<h3 class="work__ttl">${esc(c.title)}</h3></a>`;
}

function prefillCases(html, depth) {
  const root = '../'.repeat(depth);
  const list = publishedCases();

  return html.replace(/<div([^>]*)><\/div>/g, (whole, attrs) => {
    let picked = null;
    const limit = (attrs.match(/data-limit="(\d+)"/) || [])[1];

    /* 편집형 시공사례 블록. data-cases-ids 로 사례를 직접 고를 수 있습니다
       (고르지 않으면 최신 순으로 data-limit 만큼). */
    if (/id="(homeWorks|worksGrid)"/.test(attrs)) {
      const ids = (attrs.match(/data-cases-ids="([^"]+)"/) || [])[1];
      let sel;
      if (ids) {
        sel = ids.split(',').map((s) => parseInt(s.trim(), 10))
          .map((id) => list.filter((c) => c.id === id)[0]).filter(Boolean);
      } else {
        sel = list.slice(0, parseInt(limit || '6', 10));
      }
      const inner = sel.map((c) => workRowHtml(c, root)).join('\n      ');
      return `<div${attrs}>\n      ${inner || '<p class="note">등록된 시공사례가 아직 없습니다.</p>'}\n    </div>`;
    }
    if (/id="caseGrid"/.test(attrs)) picked = list;
    else if (/id="homeCases"/.test(attrs)) picked = list.slice(0, parseInt(limit || '6', 10));
    else {
      const svc = (attrs.match(/data-cases-service="([^"]+)"/) || [])[1];
      const ids = (attrs.match(/data-cases-ids="([^"]+)"/) || [])[1];
      if (svc) {
        picked = list.filter((c) => c.primaryService === svc || (c.relatedServices || []).indexOf(svc) >= 0)
          .slice(0, parseInt(limit || '3', 10));
      } else if (ids) {
        const want = ids.split(',').map((s) => parseInt(s.trim(), 10));
        picked = want.map((id) => list.filter((c) => c.id === id)[0]).filter(Boolean);
      }
    }
    if (!picked) return whole;
    const inner = picked.map((c) => caseCardHtml(c, root)).join('\n      ');
    return `<div${attrs}>\n      ${inner || '<p class="note">등록된 시공사례가 아직 없습니다.</p>'}\n    </div>`;
  });
}

/* FAQPage 구조화데이터는 같은 Q&A 가 페이지에 실제로 보일 때만 쓸 수 있습니다
   (검색엔진 가이드라인). 정적 페이지는 faq 를 JSON-LD 로만 내보내고 있었으므로,
   본문에 보이는 FAQ 가 없으면 다크 CTA 앞에 끼워 넣습니다. */
function withVisibleFaq(body, faq) {
  if (!faq || !faq.length) return body;
  if (/<details>/.test(body)) return body;
  const block = faqBlock(faq, /class="section--surface"[\s\S]*$/.test(body) ? '' : 'surface');
  const i = body.lastIndexOf('<section class="cta-band">');
  return i === -1 ? body + '\n' + block : body.slice(0, i) + block + '\n\n' + body.slice(i);
}

/* ── 1. 정적 페이지 ────────────────────────────────────── */
function buildStatic() {
  PAGES.forEach((p) => {
    write(p.file, page({
      file: p.file, navKey: p.navKey, title: p.title, description: p.description,
      trail: p.trail, faq: p.faq, body: withVisibleFaq(prefillCases(p.body, 0), p.faq),
      needsCaseIndex: p.file === 'cases.html',
      /* 페이지가 직접 선언한 노드(p.jsonld)를 그대로 싣습니다.
         실제 페이지 내용과 일치하는 스키마만 넣습니다 — 평점·리뷰·가격은 넣지 않습니다. */
      jsonld: (p.file === 'index.html'
        ? [{ '@type': 'WebSite', '@id': entityId('#website'), name: COMPANY.brand, publisher: { '@id': entityId('#operator') } }]
        : []).concat(p.jsonld || [])
    }));
  });
}

/* ── 2. 서비스 상세 5장 ───────────────────────────────── */
function buildServices() {
  SERVICES.forEach((s) => {
    const c = SERVICE_COPY[s.slug];
    if (!c) throw new Error('service-copy 누락: ' + s.slug);

    /* 시설 표의 '시공사례' 표시.
       caseIds 에 적힌 사례 중 실제로 발행 중인 것만 인정하고, 그 사례로 링크합니다.
       발행 사례가 없으면 아무 표시도 하지 않습니다 —
       볼 수 없는 사례를 근거로 '시공사례 있음' 을 내걸지 않기 위한 것입니다. */
    const caseLink = (f) => {
      const hit = (f.caseIds || []).map((id) => PUBLISHED_BY_ID[id]).filter(Boolean);
      if (!hit.length) return '';
      const t = hit[0];
      return ` <a class="badge badge--work" href="{{ROOT}}case/${pad3(t.id)}-${t.slug}.html">시공사례 보기 →</a>`;
    };

    const facilityRows = c.facilities.map((f) => `
        <tr>
          <td><strong>${esc(f.name)}</strong>${caseLink(f)}</td>
          <td>${esc(f.spec)}</td>
          <td>${esc(f.use)}</td>
        </tr>`).join('');

    const extra = [];
    if (c.materialNote) extra.push(`
    <div class="note note--safety">
      <strong>${esc(c.materialNote.title)}</strong><br>${esc(c.materialNote.body)}
    </div>`);
    if (c.judgeTable) extra.push(`
    <h2>${esc(c.judgeTable.title)}</h2>
    <p>${esc(c.judgeTable.note)}</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>현장 상태</th><th>판단</th><th>조치</th></tr></thead>
        <tbody>${c.judgeTable.rows.map((r) =>
          `<tr><td>${esc(r[0])}</td><td><strong>${esc(r[1])}</strong></td><td>${esc(r[2])}</td></tr>`).join('')}</tbody>
      </table>
    </div>`);

    const relatedGuides = GUIDES.filter((g) => g.service === s.slug);

    const body = rel(`
<section class="page-head">
  <div class="wrap">
    <h1>${esc(s.h1)}</h1>
    <p>${esc(c.lead)}</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>이런 상황이신가요?</h2></div>
    <ul class="problem-list">
      ${c.problems.map((p) => `<li><a href="{{ROOT}}contact.html?type=site">${esc(p)}<em>문의 →</em></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <div class="section-head">
      <h2>시설 종류와 규격</h2>
      <p>현장 조건에 따라 규격이 달라집니다. 담당자께서 미리 규격을 아실 필요는 없습니다.</p>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>시설</th><th>규격 · 재질</th><th>용도</th></tr></thead>
        <tbody>${facilityRows}</tbody>
      </table>
    </div>
    ${extra.join('\n')}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>시공 절차</h2></div>
    <ol class="steps">
      ${c.process.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <div class="section-head">
      <h2>이 분야의 제주 시공사례</h2>
      <p>실제로 수행한 현장입니다.</p>
    </div>
    <div class="grid grid--3" data-cases-service="${s.slug}" data-limit="3"></div>
    <p style="margin-top:16px"><a class="btn btn-ghost" href="{{ROOT}}cases.html">시공사례 전체 보기</a></p>
  </div>
</section>
${faqBlock(s.faq)}
<section class="section section--surface">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="card">
        <h3>자재만 필요하신가요?</h3>
        <p>${esc(c.supplyNote)}</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="{{ROOT}}contact.html?type=supply">자재 납품 문의</a>
          <a class="btn btn-ghost" href="{{ROOT}}products.html#${s.productAnchor}">제품·자재 안내</a>
        </div>
      </div>
      <div class="card">
        <h3>관련 자료</h3>
        ${relatedGuides.length
          ? `<ul>${relatedGuides.map((g) => `<li><a href="{{ROOT}}guide/${g.slug}.html">${esc(g.title)}</a></li>`).join('')}</ul>`
          : '<p>이 분야의 자료를 준비 중입니다.</p>'}
        <a class="card-more" href="{{ROOT}}guide.html">자료실 전체 보기 →</a>
      </div>
    </div>
    <p class="note" style="margin-top:18px">
      공동주택·병원·호텔·리조트·어린이집·사업장 등 제주도 내 시설도 문의 가능합니다.
    </p>
  </div>
</section>
${ctaBand('현장을 보고 견적을 드립니다', '제주도 내 현장이면 직접 확인합니다. 현장 사진 1~2장과 위치, 수량을 알려주세요.', 'contact.html?type=site', '현장 견적 문의')}`, 1);

    write(`service/${s.slug}.html`, page({
      file: `service/${s.slug}.html`, navKey: 'service',
      title: `${s.h1} | 제주안전시설`.length > 60
        ? `${s.h1} | 제주안전시설` : `${s.h1} | 제주안전시설`,
      description: c.lead.slice(0, 155),
      trail: [{ label: '홈', href: 'index.html' }, { label: '서비스', href: 'service.html' }, { label: s.name }],
      faq: s.faq,
      body: prefillCases(body, 1),
      jsonld: [{
        '@type': 'Service',
        '@id': `#service-${s.slug}`,
        name: s.h1,
        serviceType: s.name,
        description: c.lead,
        provider: { '@id': entityId('#brand') },
        areaServed: COMPANY.areaServed.map((a) => ({ '@type': 'AdministrativeArea', name: a })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${s.name} 취급 시설`,
          itemListElement: c.facilities.map((f) => ({
            '@type': 'Offer', itemOffered: { '@type': 'Service', name: f.name, description: f.use }
          }))
        }
      }]
    }));
  });
}

/* ── 3. 사례 상세 (검색 랜딩페이지) ───────────────────── */
function buildCases() {
  const list = publishedCases();
  const byId = {};
  list.forEach((c) => (byId[c.id] = c));

  list.forEach((c) => {
    const dir = `{{ROOT}}assets/images/cases/${pad3(c.id)}/`;
    const svc = SERVICE_BY_SLUG[c.primaryService];

    const gallery = (title, tagClass, files, alt) => {
      if (!files || !files.length) return '';
      return `
    <div class="phase">
      <h3><span class="tag ${tagClass}">${title}</span></h3>
      <div class="gallery">
        ${files.map((f, i) => {
          const thumb = f.replace(/(\.[a-z]+)$/i, '-thumb$1');
          return `<a href="${dir}${f}" target="_blank" rel="noopener">` +
            `<img src="${dir}${thumb}" alt="${esc(c.title)} ${alt} ${i + 1}" ` +
            `${sizeAttr(pad3(c.id), thumb, 'width="773" height="580"')} loading="lazy" decoding="async"></a>`;
        }).join('\n        ')}
      </div>
    </div>`;
    };

    const specRows = [
      ['기록 유형', EVIDENCE_LABEL[evidenceOf(c)] + ' 사례'],
      ['지역', c.region ? `${c.region}${c.regionDetail ? ' · ' + c.regionDetail : ''}` : (c.regionDetail || null)],
      ['발주처 유형', c.customerLabel || c.customerType],
      ['시설', c.facilityType],
      ['작업 유형', (c.workType || []).join(' · ')],
      ['시공 시기', dateLabel(c)],
      ['수량', c.quantity],
      ['소요 기간', c.duration]
    ].filter(([, v]) => v);

    /* 시기가 사진 촬영일에서 온 경우, 그 사실을 화면에 밝힙니다.
       '경' 만 붙여 두고 근거를 숨기면 읽는 사람이 확인할 방법이 없습니다. */
    const dateNote = (c.date && c.dateBasis === '사진')
      ? '<p class="figure-note">시공 시기는 현장 사진의 촬영일을 기준으로 한 근사값입니다. ' +
        '원문에 시공일이 따로 기재되어 있지 않아 «경»으로 표기합니다.</p>'
      : '';

    const rc = (c.relatedCases || []).filter((id) => byId[id]);

    const body = rel(`
<section class="page-head">
  <div class="wrap">
    <h1>${esc(c.title)}</h1>
    <p>${esc(svc ? svc.name : '')} · 제주안전시설 시공사례</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <dl class="spec-list">
      ${specRows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n      ')}
    </dl>
    ${dateNote}

    <h2>문제</h2>
    <p>${esc(c.problem)}</p>

    <h2>설치 목적</h2>
    <p>${esc(c.purpose)}</p>

    <h2>작업 내용</h2>
    <ol>${c.work.map((w) => `<li>${esc(w)}</li>`).join('')}</ol>

    ${c.materials && c.materials.length ? `
    <h2>사용 자재</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>자재</th><th>규격 · 재질</th></tr></thead>
        <tbody>${c.materials.map((m) =>
          `<tr><td>${esc(m.name)}</td><td>${m.spec ? esc(m.spec) : '<span class="card-tags">기재 없음</span>'}</td></tr>`).join('')}</tbody>
      </table>
    </div>` : ''}

    <h2>시공 사진</h2>
    ${gallery('시공 전', 'tag--before', c.images.before, '시공 전')}
    ${gallery('시공 중', 'tag--process', c.images.process, '시공 중')}
    ${gallery('시공 후', 'tag--after', c.images.after, '시공 후')}
    ${(c.images.product && c.images.product.length) ? `
    <div class="phase">
      <h3><span class="tag tag--process">제품 이미지</span></h3>
      <div class="gallery">
        ${c.images.product.map((f, i) =>
          `<img src="${dir}${f}" alt="${esc(c.facilityType)} 제품 이미지 ${i + 1}" ${sizeAttr(pad3(c.id), f, 'width="773" height="580"')} loading="lazy" decoding="async">`).join('')}
      </div>
      <p class="figure-note">제품 설명용 이미지입니다. 현장 촬영 사진이 아닙니다.</p>
    </div>` : ''}

    <h2>결과</h2>
    <p>${esc(c.result)}</p>
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <div class="grid grid--3">
      <div class="card">
        <h3>관련 서비스</h3>
        <ul>
          ${[c.primaryService].concat(c.relatedServices || []).filter((s) => SERVICE_BY_SLUG[s])
            .map((s) => `<li><a href="{{ROOT}}service/${s}.html">${esc(SERVICE_BY_SLUG[s].name)}</a></li>`).join('')}
        </ul>
      </div>
      <div class="card">
        <h3>관련 제품·자재</h3>
        ${(c.relatedProducts || []).length
          ? `<ul>${c.relatedProducts.map((p) => `<li><a href="{{ROOT}}products.html#${p}">${esc(productLabel(p))}</a></li>`).join('')}</ul>`
          : '<p>이 사례는 제작·시공 위주입니다.</p>'}
        <a class="card-more" href="{{ROOT}}contact.html?type=supply">자재 납품 문의 →</a>
      </div>
      <div class="card">
        <h3>관련 자료</h3>
        ${(c.relatedGuides || []).length
          ? `<ul>${c.relatedGuides.map((g) => {
              const gg = GUIDES.filter((x) => x.slug === g)[0];
              return gg ? `<li><a href="{{ROOT}}guide/${gg.slug}.html">${esc(gg.title)}</a></li>` : '';
            }).join('')}</ul>`
          : '<p>관련 자료를 준비 중입니다.</p>'}
        <a class="card-more" href="{{ROOT}}guide.html">자료실 →</a>
      </div>
    </div>
  </div>
</section>

${rc.length ? `
<section class="section" data-related-block>
  <div class="wrap">
    <div class="section-head"><h2>비슷한 시공사례</h2></div>
    <div class="grid grid--3" data-cases-ids="${rc.join(',')}"></div>
  </div>
</section>` : ''}
${faqBlock(c.faq, 'surface')}
${ctaBand('비슷한 현장이신가요?', '현장 사진과 위치, 수량을 보내주시면 개략 견적을 드립니다. 제주도 내 현장은 직접 확인합니다.', 'contact.html?type=quote', '현장 견적 문의')}

<section class="section">
  <div class="wrap">
    <p><a href="{{ROOT}}cases.html">← 시공사례 목록으로</a></p>
  </div>
</section>`, 1);

    const imgs = []
      .concat(c.images.before || [], c.images.process || [], c.images.after || [])
      .map((f) => HAS_DOMAIN ? abs(`assets/images/cases/${pad3(c.id)}/${f}`) : null)
      .filter(Boolean);

    const article = {
      '@type': 'Article',
      headline: c.title,
      description: c.seo.description,
      about: { '@id': `#service-${c.primaryService}` },
      author: { '@id': entityId('#brand') },
      publisher: { '@id': entityId('#operator') },
      articleSection: svc ? svc.name : undefined,
      keywords: (c.tags || []).join(', ')
    };
    if (imgs.length) article.image = imgs;
    /* 사진 촬영일에서 추정한 시기는 구조화 데이터에 넣지 않습니다.
       화면에는 '2026년 7월경' 으로 근사임을 밝힐 수 있지만,
       datePublished 는 근사 표기를 담을 수 없어 단정이 되어 버립니다. */
    if (c.date && c.dateBasis === '문서') article.datePublished = c.date;

    write(caseFile(c), page({
      file: caseFile(c), navKey: 'cases',
      title: c.seo.title, description: c.seo.description,
      trail: [{ label: '홈', href: 'index.html' }, { label: '시공사례', href: 'cases.html' }, { label: c.title }],
      faq: c.faq, ogType: 'article',
      ogImage: c.images.representative ? `assets/images/cases/${pad3(c.id)}/${c.images.representative}` : null,
      body: prefillCases(body, 1),
      jsonld: [article]
    }));
  });
}

/* ── 4. 가이드 ────────────────────────────────────────── */
function buildGuides() {
  GUIDES.forEach((g) => {
    const copy = GUIDE_COPY[g.slug];
    if (!copy) throw new Error('guide-copy 누락: ' + g.slug);
    const svc = SERVICE_BY_SLUG[g.service];

    const body = rel(`
<section class="page-head">
  <div class="wrap">
    <h1>${esc(g.title)}</h1>
    <p>${esc(g.summary)}</p>
  </div>
</section>

<section class="section">
  <div class="wrap prose">
${copy}
  </div>
</section>

<section class="section section--surface">
  <div class="wrap">
    <div class="grid grid--3">
      <div class="card">
        <h3>관련 서비스</h3>
        ${svc ? `<p><a href="{{ROOT}}service/${svc.slug}.html">${esc(svc.name)}</a></p><p>${esc(svc.summary)}</p>` : ''}
      </div>
      <div class="card">
        <h3>관련 제품·자재</h3>
        <ul>${(g.relatedProducts || []).map((p) => `<li><a href="{{ROOT}}products.html#${p}">${esc(productLabel(p))}</a></li>`).join('')}</ul>
        <a class="card-more" href="{{ROOT}}contact.html?type=supply">자재 납품 문의 →</a>
      </div>
      <div class="card">
        <h3>다른 자료</h3>
        <ul>${GUIDES.filter((x) => x.slug !== g.slug).map((x) =>
          `<li><a href="{{ROOT}}guide/${x.slug}.html">${esc(x.title)}</a></li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>

${(g.relatedCases || []).length ? `
<section class="section" data-related-block>
  <div class="wrap">
    <div class="section-head"><h2>이 내용이 적용된 제주 시공사례</h2></div>
    <div class="grid grid--3" data-cases-ids="${g.relatedCases.join(',')}"></div>
  </div>
</section>` : ''}
${faqBlock(g.faq, 'surface')}
${ctaBand('현장에 맞는 방법을 함께 정합니다', '자료만으로 판단이 어려우시면 현장을 확인하고 알려드립니다.', 'contact.html?type=site', '현장 확인 요청')}`, 1);

    write(guideFile(g), page({
      file: guideFile(g), navKey: 'guide',
      title: g.seo.title, description: g.seo.description,
      trail: [{ label: '홈', href: 'index.html' }, { label: '자료실', href: 'guide.html' }, { label: g.title }],
      faq: g.faq, ogType: 'article', body: prefillCases(body, 1),
      jsonld: [{
        '@type': 'Article',
        headline: g.title,
        description: g.seo.description,
        about: { '@id': `#service-${g.service}` },
        author: { '@id': entityId('#brand') },
        publisher: { '@id': entityId('#operator') }
      }]
    }));
  });
}

/* ── 4-2. 목록용 슬림 인덱스 ──────────────────────────────
   cases.js 는 본문·FAQ·자재까지 담고 있어 사례가 늘수록 커집니다.
   목록 화면에 필요한 필드만 뽑아 따로 내보내고, cases.html 에서만 읽습니다.
   (다른 페이지는 카드가 이미 정적 HTML 로 들어 있어 데이터가 필요 없습니다)
────────────────────────────────────────────────────────── */
function buildCaseIndex() {
  const slim = publishedCases().map((c) => ({
    id: c.id, slug: c.slug, title: c.title,
    region: c.region, regionDetail: c.regionDetail,
    facilityType: c.facilityType,
    customerType: c.customerType, customerLabel: c.customerLabel,
    primaryService: c.primaryService, relatedServices: c.relatedServices || [],
    workType: c.workType,
    evidenceType: evidenceOf(c),
    dateLabel: dateLabel(c),
    excerpt: String(c.problem).slice(0, 78),
    representative: c.images.representative || null,
    hasBefore: !!(c.images.before && c.images.before.length),
    tags: c.tags || []
  }));
  const js = [
    '/* 생성물 — tools/build.js 가 만듭니다. 직접 고치지 마세요.',
    '   cases.html 의 필터·검색이 쓰는 목록 전용 데이터입니다.',
    '   정렬은 빌드 시점에 이미 적용되어 있습니다 (대표사례 → 최신순 → 시공전 사진 가중치). */',
    "'use strict';",
    'const CASE_INDEX = ' + JSON.stringify(slim, null, 1) + ';',
    ''
  ].join(String.fromCharCode(10));
  fs.writeFileSync(path.join(ROOT, 'assets', 'js', 'cases-index.js'), js, 'utf8');
  written.push('assets/js/cases-index.js');
  if (!QUIET) console.log('  ✓ assets/js/cases-index.js');
}

/* ── 5. robots.txt / sitemap.xml ──────────────────────── */
function buildRobotsAndSitemap() {
  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    '# 네이버 검색로봇',
    'User-agent: Yeti',
    'Allow: /',
    '',
    HAS_DOMAIN
      ? 'Sitemap: ' + abs('sitemap.xml')
      : '# Sitemap: 도메인 확정 후 config.js 의 siteUrl 을 채우고 tools/build.js 를 다시 실행하면 이 줄이 채워집니다.',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');
  written.push('robots.txt');

  if (!HAS_DOMAIN) {
    console.log('\n  · sitemap.xml 은 만들지 않았습니다 — config.js 의 siteUrl 이 비어 있습니다.');
    console.log('    임의의 도메인으로 정본 주소를 만들지 않습니다. 도메인이 정해지면 siteUrl 한 줄만 채우세요.');
    return;
  }

  const urls = written
    .filter((f) => f.endsWith('.html') && f !== '404.html')
    .map((f) => abs(f === 'index.html' ? '' : f));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  written.push('sitemap.xml');
}

/* ── 실행 ─────────────────────────────────────────────── */
console.log('제주안전시설 — 정적 페이지 생성\n');

/* 생성물 폴더는 매번 비우고 다시 만듭니다 (지워진 사례가 남지 않게) */
['case', 'guide', 'service'].forEach((d) => {
  const p = path.join(ROOT, d);
  if (fs.existsSync(p)) fs.readdirSync(p).filter((f) => f.endsWith('.html'))
    .forEach((f) => fs.unlinkSync(path.join(p, f)));
});

buildStatic();
buildServices();
buildCases();
buildGuides();
buildCaseIndex();

function buildRedirects() {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>페이지 이동 | 제주안전시설</title>
  <meta http-equiv="refresh" content="0; url=008-jeju-parking-pillar-reflective-tape.html">
  <link rel="canonical" href="${COMPANY.siteUrl}/case/008-jeju-parking-pillar-reflective-tape.html">
</head>
<body>
  <p>해당 사례가 분리·이동되었습니다. <a href="008-jeju-parking-pillar-reflective-tape.html">새 페이지로 이동</a>해 주세요.</p>
</body>
</html>`;
  write('case/008-jeju-parking-reflective-tape-delineator-post.html', html);
}
buildRedirects();

buildRobotsAndSitemap();

const skipped = CASES.filter((c) => !c.published || (c.review && c.review.disclosure === '확인필요'));
console.log(`\n완료 — ${written.length}개 파일`);
console.log(`  페이지 ${written.filter((f) => f.endsWith('.html')).length}장 (사례 ${publishedCases().length}건)`);
if (skipped.length) {
  console.log(`  보류 ${skipped.length}건 — ${skipped.map((c) => pad3(c.id)).join(', ')} (published:false 또는 공개 검토 중)`);
}
if (!HAS_DOMAIN) console.log('  도메인 미확정 — canonical / og:url / sitemap.xml 미생성');
console.log('');

/* ============================================================
   tools/lib/layout.js — 모든 페이지의 공통 골격
   ------------------------------------------------------------
   ▶ head · 헤더 · 빵부스러기 · 푸터 · 모바일 CTA · JSON-LD 를
     이 파일 한 곳에서 만듭니다.
     페이지가 15장이든 115장이든 브랜드 표기와 구조화데이터가
     어긋날 수 없게 하려는 것이 목적입니다.
       · 브랜드는 항상 '제주안전시설', 운영회사는 항상 '(주)아인산업안전'
       · title / description 은 페이지마다 하나씩만
       · canonical · og:url · sitemap 은 도메인이 확정될 때까지 만들지 않음
   ============================================================ */
'use strict';

const { COMPANY, EXTERNAL_LINKS } = require('../../assets/js/config.js');

const NAV = [
  { href: 'service.html', label: '서비스', key: 'service' },
  { href: 'cases.html', label: '시공사례', key: 'cases' },
  { href: 'products.html', label: '제품·자재', key: 'products' },
  { href: 'guide.html', label: '자료실', key: 'guide' },
  { href: 'about.html', label: '회사소개', key: 'about' },
  { href: 'contact.html', label: '문의', key: 'contact' }
];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 도메인이 확정되었는가. 확정 전에는 절대 URL 을 만들지 않습니다. */
const HAS_DOMAIN = !!(COMPANY.siteUrl && COMPANY.siteUrl.trim());
function abs(path) {
  if (!HAS_DOMAIN) return null;
  return COMPANY.siteUrl.replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
}

/* 기본 og:image — 페이지가 따로 지정하지 않았을 때만 씁니다.
   사례 001(서귀포시 치유의 숲 입구 로터리) 실제 시공 후 사진으로,
   홈 히어로에 이미 쓰고 있는 이미지입니다. 새 이미지를 만들지 않습니다. */
const DEFAULT_OG_IMAGE = 'assets/images/cases/001/after-01.jpg';

/** 엔티티 @id.
    '#operator' 같은 문서 상대 조각은 페이지마다 다른 노드로 해석되어
    운영회사·브랜드가 페이지 수만큼 쪼개집니다. 도메인이 확정된 뒤에는
    사이트 루트 기준 절대 @id 를 써서 전 페이지가 같은 엔티티를 가리키게 합니다.
    (도메인 미확정 시에는 기존대로 상대 조각을 유지합니다.) */
function entityId(fragment) {
  return HAS_DOMAIN ? abs('') + fragment : fragment;
}

/* ── 구조화 데이터 ─────────────────────────────────────────
   엔티티 관계를 모든 페이지에서 같은 모양으로 선언합니다.

     제주안전시설      → 브랜드 (LocalBusiness / ProfessionalService)
     (주)아인산업안전  → 운영 법인 (Organization, parentOrganization)
     제주특별자치도    → 영업 지역 (areaServed)
     안전시설 설치·교체·보수 / 안전자재 납품 → 제공 서비스

   ※ 리뷰·평점·가격은 넣지 않습니다. 실제로 가진 데이터가 아닙니다.
────────────────────────────────────────────────────────── */
function baseGraph() {
  const operator = {
    '@type': 'Organization',
    '@id': entityId('#operator'),
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    identifier: [{ '@type': 'PropertyValue', name: '사업자등록번호', value: COMPANY.businessNumber }],
    founder: undefined,
    foundingDate: COMPANY.foundingDate,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressRegion: COMPANY.addressRegion,
      addressLocality: COMPANY.addressLocality,
      streetAddress: COMPANY.streetAddress
    },
    telephone: COMPANY.tel,
    email: COMPANY.email,
    sameAs: [COMPANY.storeUrl, EXTERNAL_LINKS.blog.url].filter(Boolean)
  };

  const brand = {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': entityId('#brand'),
    name: COMPANY.brand,
    description: COMPANY.description,
    parentOrganization: { '@id': entityId('#operator') },
    /* 영업 지역은 제주도 한정입니다 */
    areaServed: COMPANY.areaServed.map((a) => ({ '@type': 'AdministrativeArea', name: a })),
    address: operator.address,
    telephone: COMPANY.tel,
    email: COMPANY.email,
    knowsAbout: COMPANY.knowsAbout,
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: '안전시설 설치·교체·보수', serviceType: '안전시설 시공' }
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: '안전시설·안전자재 납품', serviceType: '안전자재 납품' }
      }
    ],
    sameAs: [COMPANY.storeUrl].filter(Boolean)
  };

  if (COMPANY.openingHours.opens && COMPANY.openingHours.closes) {
    brand.openingHoursSpecification = [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: COMPANY.openingHours.days,
      opens: COMPANY.openingHours.opens,
      closes: COMPANY.openingHours.closes
    }];
  }
  if (COMPANY.geo.latitude && COMPANY.geo.longitude) {
    brand.geo = { '@type': 'GeoCoordinates', latitude: COMPANY.geo.latitude, longitude: COMPANY.geo.longitude };
  }
  if (HAS_DOMAIN) { brand.url = abs(''); operator.url = abs(''); }

  return [operator, brand];
}

function breadcrumbNode(trail, root) {
  if (!trail || trail.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => {
      const item = { '@type': 'ListItem', position: i + 1, name: t.label };
      if (t.href) item.item = HAS_DOMAIN ? abs(t.href) : root + t.href;
      return item;
    })
  };
}

function faqNode(faq) {
  if (!faq || !faq.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}

function stripUndefined(v) {
  return JSON.parse(JSON.stringify(v, (k, val) => (val === undefined ? undefined : val)));
}

/* ── 골격 ─────────────────────────────────────────────────── */
/**
 * @param {object} p
 *   file        생성 경로 (예: 'service/road-traffic.html')
 *   navKey      현재 메뉴 키
 *   title       <title> — 페이지마다 유일
 *   description meta description — 페이지마다 유일
 *   trail       빵부스러기 [{label, href}]  (마지막 항목은 href 없음)
 *   body        본문 HTML
 *   jsonld      추가 JSON-LD 노드 배열
 *   faq         FAQPage 로 만들 [{q,a}]
 *   ogType      기본 'website'
 *   needsCaseIndex  사례 목록 필터가 필요한 페이지(cases.html)만 true.
 *                   나머지 페이지는 카드가 이미 정적 HTML 로 들어 있어 데이터가 필요 없습니다.
 */
function page(p) {
  const depth = (p.file.match(/\//g) || []).length;
  const root = '../'.repeat(depth);
  const canonical = abs(p.file === 'index.html' ? '' : p.file);

  const graph = baseGraph();
  const crumb = breadcrumbNode(p.trail, root);
  if (crumb) graph.push(crumb);
  const fq = faqNode(p.faq);
  if (fq) graph.push(fq);
  (p.jsonld || []).forEach((n) => graph.push(n));

  const nav = NAV.map((n) =>
    `<li><a href="${root}${n.href}"${n.key === p.navKey ? ' aria-current="page"' : ''}>${n.label}</a></li>`
  ).join('');

  const crumbHtml = (p.trail && p.trail.length > 1)
    ? `<nav class="breadcrumb" aria-label="현재 위치"><div class="wrap"><ol>` +
      p.trail.map((t) => `<li>${t.href ? `<a href="${root}${t.href}">${esc(t.label)}</a>` : esc(t.label)}</li>`).join('') +
      `</ol></div></nav>`
    : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="${esc(COMPANY.brand)}">
${((COMPANY.verification || {}).naver || '').trim() ? `<meta name="naver-site-verification" content="${esc(COMPANY.verification.naver.trim())}">` : ''}
${((COMPANY.verification || {}).google || '').trim() ? `<meta name="google-site-verification" content="${esc(COMPANY.verification.google.trim())}">` : ''}
${canonical ? `<link rel="canonical" href="${canonical}">` : `<!-- canonical: 도메인 확정 후 config.js 의 siteUrl 을 채우고 tools/build.js 를 다시 실행하세요. 임의의 도메인을 넣지 않습니다. -->`}
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:site_name" content="${esc(COMPANY.brand)}">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
${(p.ogImage || DEFAULT_OG_IMAGE) && HAS_DOMAIN ? `<meta property="og:image" content="${abs(p.ogImage || DEFAULT_OG_IMAGE)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" media="print" onload="this.media='all'" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300..500&family=Noto+Serif+KR:wght@300..500&display=swap">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300..500&family=Noto+Serif+KR:wght@300..500&display=swap"></noscript>
<link rel="stylesheet" href="${root}assets/css/style.css">
<script>document.documentElement.className+=' js';</script>
<script type="application/ld+json">
${JSON.stringify(stripUndefined({ '@context': 'https://schema.org', '@graph': graph }), null, 2)}
</script>
</head>
<body data-root="${root}">
<a class="skip-link" href="#main">본문으로 건너뛰기</a>

<header class="site-header">
  <div class="wrap header-inner">
    <a class="logo" href="${root}index.html">
      <span class="logo-mark">제주안전시설</span>
      <span class="logo-sub">운영 (주)아인산업안전</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="gnb">메뉴</button>
    <nav id="gnb" class="gnb" aria-label="주요 메뉴"><ul>${nav}</ul></nav>
    <a class="header-tel" href="${COMPANY.telHref}">☎ ${COMPANY.tel}</a>
  </div>
</header>
${crumbHtml}
<main id="main">
${p.body}
</main>

<footer class="site-footer">
  <div class="wrap">
    <p class="footer-brand">제주안전시설<span>${esc(COMPANY.relationSentence)}</span></p>
    <ul class="footer-nav">
      ${NAV.map((n) => `<li><a href="${root}${n.href}">${n.label}</a></li>`).join('\n      ')}
      <li><a href="${root}construction-safety.html">건설현장 안전용품·자재</a></li>
      <li><a href="${root}privacy.html">개인정보처리방침</a></li>
      <li><a href="${EXTERNAL_LINKS.shop.url}" target="_blank" rel="noopener noreferrer">${esc(EXTERNAL_LINKS.shop.shortLabel)}</a></li>
    </ul>
    <dl class="footer-biz">
      <div><dt>운영회사</dt><dd>${esc(COMPANY.name)}</dd></div>
      <div><dt>대표자</dt><dd>${esc(COMPANY.representative)}</dd></div>
      <div><dt>사업자등록번호</dt><dd>${esc(COMPANY.businessNumber)}</dd></div>
      <div><dt>통신판매업신고</dt><dd>${esc(COMPANY.mailOrderNumber)}</dd></div>
      <div><dt>주소</dt><dd>${esc(COMPANY.address)}</dd></div>
      <div><dt>대표전화</dt><dd><a href="${COMPANY.telHref}">${esc(COMPANY.tel)}</a></dd></div>
      <div><dt>이메일</dt><dd><a href="mailto:${esc(COMPANY.email)}">${esc(COMPANY.email)}</a></dd></div>
      <div><dt>영업 지역</dt><dd>${esc(COMPANY.areaServedLabel)}</dd></div>
    </dl>
    <p class="footer-copy">© <span data-year>2026</span> ${esc(COMPANY.name)}. 제주안전시설은 (주)아인산업안전의 브랜드입니다.</p>
  </div>
</footer>

<div class="mobile-cta">
  <a href="${COMPANY.telHref}">전화하기</a>
  <a href="${root}contact.html">견적·납품문의</a>
</div>

<script src="${root}assets/js/config.js"></script>
${p.needsCaseIndex ? `<script src="${root}assets/js/cases-index.js"></script>` : ''}
<script src="${root}assets/js/main.js"></script>
</body>
</html>
`;
}

module.exports = { page, esc, NAV, HAS_DOMAIN, abs, entityId, COMPANY };

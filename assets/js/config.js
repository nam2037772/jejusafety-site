/* ============================================================
   config.js — 회사 정보 · 외부 채널 · 상담 채널
   ------------------------------------------------------------
   ▶ 전화번호 · 주소 · 도메인이 바뀌면 이 파일 한 곳만 고칩니다.
     헤더 · 푸터 · CTA · 구조화데이터가 모두 여기서 나옵니다.
   ▶ 확인되지 않은 값은 비워 둡니다. 빈 값이면 화면에도 JSON-LD 에도
     나타나지 않습니다. 추측한 값을 넣지 않습니다.
   ▶ 이 파일은 브라우저가 그대로 내려받는 공개 파일입니다.
     표시 의무가 없는 값(법인등록번호 등)은 넣지 않습니다.
   ============================================================ */
'use strict';

const COMPANY = {
  /* ── 브랜드 / 법인 ────────────────────────────────────────
     화면에 보이는 이름은 '제주안전시설' 하나입니다.
     '(주)아인산업안전' 은 운영회사·사업자정보·JSON-LD legalName 자리에만 씁니다.
     브랜드명을 아인안전시설 / 제주안전 / 아인세이프티 등으로 바꾸지 않습니다. */
  brand: '제주안전시설',
  brandSubline: '제주 안전시설 설치·교체·보수 · 안전자재 납품',
  operator: '(주)아인산업안전',
  trustLine: '운영 (주)아인산업안전 · 제주 전 지역 현장 대응',

  /* 브랜드와 법인의 관계는 모든 페이지에서 이 한 문장으로 통일합니다. */
  relationSentence: '제주안전시설은 (주)아인산업안전이 운영하는 제주 안전시설 전문 브랜드입니다.',

  name: '주식회사 아인산업안전',
  legalName: '주식회사 아인산업안전',
  shortName: '아인산업안전',

  /* 구조화데이터의 회사 설명 — 한 곳에서만 관리합니다. */
  description: '제주안전시설은 제주특별자치도에서 관공서·공공기관·학교 등 공공·교육시설을 중심으로 ' +
    '안전시설 설치·교체·보수와 안전시설·안전자재 납품을 수행하는 지역 전문 브랜드입니다. ' +
    '차선규제봉, 시선유도봉, 출차주의등, 배수로 그레이팅, 경사로 진입판, 경계석, 반사시설, ' +
    '스테인리스 금속 시설물 등 소규모 안전시설 공사를 현장에서 처리합니다. 운영은 (주)아인산업안전입니다.',

  tel: '1660-4019',
  telHref: 'tel:16604019',
  smsHref: 'sms:16604019',
  email: 'ainsafe@naver.com',

  address: '제주특별자치도 서귀포시 성산읍 풍천로 142, 103호',
  addressRegion: '제주특별자치도',
  addressLocality: '서귀포시',
  streetAddress: '성산읍 풍천로 142, 103호',
  postalCode: '',

  /* ── 영업 지역 — 제주도 한정 ──────────────────────────────
     전국 시공 / 전국 출장 / 전국 배송 을 뜻하는 값을 넣지 않습니다. */
  areaServed: ['제주특별자치도', '제주시', '서귀포시'],
  areaServedLabel: '제주특별자치도 전 지역 (제주시 · 서귀포시 · 읍면)',

  hours: '평일 08:00 – 18:00 (현장 상담 예약제)',
  /* 확정 전에는 비워 둡니다 — 잘못된 시간이 검색엔진에 올라가지 않게 */
  openingHours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '', closes: '' },

  /* ── 사업자 정보 (확인된 값) ───────────────────────────── */
  businessNumber: '690-87-00288',
  mailOrderNumber: '제2023-제주성산-00026호',
  representative: '김선미',
  foundingDate: '2016-02-10',

  /* 확인되지 않은 값 — 비워 둡니다 */
  geo: { latitude: '', longitude: '' },

  registeredBusiness: [
    '시설물 유지관리 공사업',
    '건축공사',
    '건축자재',
    '안전용품',
    '전자상거래 소매업'
  ],

  /* 전문 분야 — JSON-LD knowsAbout.
     실제로 수행한 일만 적습니다. 하지 않는 일을 넣지 않습니다.
     (모두 assets/js/cases.js 의 실제 사례가 뒷받침합니다) */
  knowsAbout: [
    '제주 안전시설 설치',
    '제주 안전시설 교체',
    '제주 안전시설 보수',
    '제주 안전자재 납품',
    '제주 차선규제봉 설치',
    '제주 시선유도봉 설치',
    '제주 출차주의등 설치',
    '제주 배수로 그레이팅 교체',
    '제주 경사로 진입판 설치',
    '제주 경계석 재설치',
    '제주 반사시설 시공',
    '제주 스테인리스 자바라 대문 설치',
    '제주 학교 안전시설',
    '제주 공공기관 안전시설'
  ],

  /* 같은 사업자가 운영하는 안전용품 쇼핑몰 — JSON-LD 에서는 sameAs 로 연결합니다. */
  storeUrl: 'https://www.ainsafety.com',

  /* ▶ 도메인 미확정.
       확정되면 여기 한 줄만 채우고 `node tools/build.js` 를 다시 실행하세요.
       canonical · og:url · sitemap.xml 이 모두 이 값에서 만들어집니다.
       ※ 비어 있는 동안에는 canonical / og:url / sitemap 을 만들지 않습니다.
         임의의 placeholder 도메인을 넣지 않습니다 — 잘못된 정본 주소가
         색인되면 되돌리는 비용이 큽니다. */
  siteUrl: 'https://jejusafety.kr'
};

/* 외부 채널 — 새 탭 (target=_blank, rel="noopener noreferrer") */
const EXTERNAL_LINKS = {
  shop: {
    url: COMPANY.storeUrl,
    label: '안전용품 쇼핑몰에서 구매',
    desc: '소량이거나 직접 설치하시는 경우, 안전용품을 온라인에서 바로 구매하실 수 있습니다.'
  },
  blog: { url: 'https://blog.naver.com/ainsafe', label: '네이버 블로그', desc: '현장에서 기록한 시공 과정을 올립니다.' }
};

/* 상담 채널 — 실제로 동작하는 수단만 씁니다 (정적 사이트, 자체 서버 없음) */
const CONTACT_CHANNELS = {
  phone: COMPANY.telHref,
  sms: COMPANY.smsHref,
  email: COMPANY.email,

  /* TODO: 카카오톡 채널이 개설되면 주소를 넣으세요. 값이 있으면 화면에 버튼이 생깁니다. */
  kakao: '',

  /* ▶ 향후 '사진 첨부형 견적문의 폼' 자리.
       네이버폼·구글폼 주소를 넣으면 문의 CTA 가 그 폼으로 전환됩니다.
       (contact.js 의 sendInquiry() 한 함수만 분기합니다 — 아래 주석 참고) */
  externalForm: ''
};

/* 문의 유형 — contact.html?type= 값. 제품 페이지의 '자재 납품 문의' 는 type=supply 로 들어옵니다. */
const INQUIRY_TYPES = {
  site: { label: '현장 확인 요청', subject: '[제주안전시설] 현장 확인 요청' },
  quote: { label: '견적 문의 (시공)', subject: '[제주안전시설] 시공 견적 문의' },
  install: { label: '설치 문의', subject: '[제주안전시설] 설치 문의' },
  supply: { label: '자재 납품 문의', subject: '[제주안전시설] 안전자재 납품 문의' }
};

/* Node(tools/*.js) 와 브라우저 양쪽에서 씁니다 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COMPANY, EXTERNAL_LINKS, CONTACT_CHANNELS, INQUIRY_TYPES };
}

/* ============================================================
   cases.js — 제주안전시설 시공사례 (발행 데이터 / 단일 진실원)
   ------------------------------------------------------------
   ▶ 이 파일이 사이트가 발행하는 정본입니다.
     Obsidian Raw 노트는 '원본 증거(Source of Truth)' 이고,
     이 파일은 거기서 사실만 뽑아 재작성한 '발행 구조 데이터' 입니다.
     블로그 문장을 그대로 옮기지 않습니다. 흐름은 항상
       problem → purpose → work → result  입니다.

   ▶ 지어내지 않습니다.
     원문에 없는 값은 null 또는 [] 로 둡니다 (날짜·규격·수량·기관명).
     기관명이 불명확하면 customerType 만 두고 customerName 은 null 입니다.

   ▶ 이미지 경로: assets/images/cases/<id 3자리>/<role>-<nn>.jpg
     같은 이름에 `-thumb` 이 붙은 파일이 목록 카드용 축소본입니다.

   ▶ 사례를 늘리는 방법은 docs/RAW_TO_CASE_PIPELINE.md 를 보세요.
     구조를 바꾸지 않고 100건 이상으로 늘어날 수 있게 설계되어 있습니다.

   필드
     id            3자리 일련번호 (재사용 금지)
     slug          영문 kebab-case. 한 번 정하면 바꾸지 않습니다 (URL)
     title         H1 이자 목록 제목. 사람이 실제로 검색하는 표현으로 씁니다
     date          시공 시기 'YYYY-MM' | 'YYYY-MM-DD' | null. 근거가 없으면 null
     dateBasis     date 의 근거. '문서' | '사진' | null
                     '문서' — 계약·준공 서류로 확인된 날짜. 그대로 표기합니다
                     '사진' — 사진 촬영일만 근거. 화면에 '2026년 7월경' 으로 표기하고
                              JSON-LD datePublished 에는 넣지 않습니다 (단정하지 않기 위해)
                     null   — date 가 없을 때. 화면에 시공 시기를 표시하지 않습니다
     region        '제주시' | '서귀포시' | null
     regionDetail  읍면동·현장 성격. 공개 가능한 범위만
     facilityType  시설명 — 검색어의 핵심
     customerType  발주처 유형 (services.js 의 CUSTOMER_TYPES) | null
     customerName  발주처 실명. 공개 가능할 때만
     customerLabel 화면 표기용 익명 라벨 (예: '제주 소재 초등학교')
     evidenceType  '시공' | '납품' | '유지보수' (없으면 '시공')
                     시공     — 없던 시설을 새로 설치
                     납품     — 자재만 공급. 설치는 포함하지 않음
                     유지보수 — 기존 시설의 교체·보수·복구
                   ※ 기술자료·제품 안내는 사례가 아닙니다. guides.js 로 갑니다
     primaryService / relatedServices
     workType      ['설치','교체','보수','개선','납품'] 중 복수
     problem       현장에서 무엇이 위험했는가
     purpose       설치·보수의 목적
     work          실제로 한 일. 순서대로
     materials     [{name, spec}] — spec 은 원문에 있을 때만
     result        무엇이 해결되었는가
     images        {representative, before[], process[], after[], product[]}
     relatedProducts / relatedGuides / relatedCases
     faq           이 사례를 보고 실제로 묻는 질문
     tags          검색 키워드
     seo           {title, description} — 비우면 빌드가 만듭니다
     sourceRef     원본 Raw 노트 (읽기 전용 역추적용)
     review        {disclosure:'ok'|'확인필요', notes}
     featured      대표사례 — 목록 정렬의 1순위
     published     false 면 빌드에서 제외
   ============================================================ */
'use strict';

const CASES = [
  /* ────────────────────────────────────────────────────────── */
  {
    id: 1,
    slug: 'seogwipo-rotary-lane-delineator-replacement',
    title: '서귀포시 로터리 차선규제봉 교체',
    date: '2026-07',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2026-07-16~18 (원문에 시공일 기재 없음 → 확인 후 채울 것)
    region: '서귀포시',
    regionDetail: '치유의 숲 입구 로터리',
    facilityType: '차선규제봉(시선유도봉)',
    customerType: '관공서',
    customerName: '서귀포시청',
    customerLabel: '서귀포시청',
    evidenceType: '유지보수',
    primaryService: 'road-traffic',
    relatedServices: [],
    workType: ['교체', '설치'],

    problem: '로터리는 진입 차량과 진출 차량이 같은 지점에서 동시에 발생하는 구간입니다. ' +
      '이곳의 기존 규제봉이 제 기능을 못 하면 중앙선 침범과 불법 유턴이 늘고, 회전 반경이 큰 탓에 ' +
      '운전자가 차로를 잘못 읽는 일이 생깁니다.',
    purpose: '회전 구간에서 운전자의 시선을 유도하고 차로 구분을 명확히 해, 중앙선 침범과 불법 유턴을 줄입니다.',
    work: [
      '기존 규제봉 철거',
      '설치 위치 측량 및 정렬 확인',
      '앵커 천공 및 고정',
      '국내산 표준규격 차선규제봉 설치',
      '설치 상태 및 체결 상태 최종 점검'
    ],
    materials: [
      { name: '차선규제봉 (국내산 표준규격)', spec: '고탄성 TPU·우레탄, 고휘도 반사띠' },
      { name: '앵커', spec: '스테인리스' }
    ],
    quantity: null,
    duration: null,
    result: '회전 구간의 차로 구분이 다시 명확해지고, 반사띠로 야간·우천 시 시인성을 확보했습니다. ' +
      '규제봉은 설치 간격과 직진 정렬이 흐트러지면 시각적 유도 효과가 떨어지기 때문에, ' +
      '정렬을 맞춘 뒤 체결부를 다시 점검해 마무리했습니다.',

    images: {
      representative: 'after-01.jpg',
      before: ['before-01.jpg', 'before-02.jpg', 'before-03.jpg', 'before-04.jpg', 'before-05.jpg', 'before-06.jpg', 'before-07.jpg', 'before-08.jpg'],
      process: ['process-01.jpg', 'process-02.jpg'],
      after: ['after-01.jpg', 'after-02.jpg', 'after-03.jpg', 'after-04.jpg', 'after-05.jpg', 'after-06.jpg'],
      product: []
    },

    relatedProducts: ['traffic'],
    relatedGuides: ['delineator-post-installation'],
    relatedCases: [6, 3, 8],
    faq: [
      { q: '기존 규제봉을 철거하고 같은 자리에 다시 설치할 수 있나요?',
        a: '가능합니다. 이 현장도 기존 규제봉을 철거한 뒤 앵커를 다시 천공해 고정했습니다. 기존 앵커 구멍이 손상된 경우 위치를 조정합니다.' },
      { q: '제주 해안 도로에도 같은 제품을 쓰나요?',
        a: '자외선과 염분에 견디는 내후성이 필요합니다. 이 현장에는 반복 충격에서 복원되는 고탄성 소재의 국내산 표준규격 제품을 적용했습니다.' }
    ],
    tags: ['제주 차선규제봉', '서귀포 차선규제봉 교체', '제주 시선유도봉', '로터리 안전시설', '차선규제봉 철거 재설치'],
    seo: {
      title: '서귀포시 로터리 차선규제봉 교체 사례 | 제주안전시설',
      description: '서귀포시 치유의 숲 입구 로터리의 차선규제봉을 철거하고 재설치한 시공사례입니다. 앵커 천공·정렬·체결 점검까지의 작업 내용과 시공 전후 사진을 정리했습니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-001.md',
    review: { disclosure: 'ok', notes: '공공 발주처(서귀포시청) 실명 표기. 공공 도로시설 공사로 통상 공개 가능하나 최종 확인 권장.' },
    featured: true,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 6,
    slug: 'jeju-exit-warning-light-mirror-sensor',
    title: '제주 진출입로 출차주의등 설치 (미러센서·경광등)',
    date: '2025-12',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2025-12-15
    region: null,
    regionDetail: '건물 진출입로',
    facilityType: '출차주의등',
    customerType: null,
    customerName: null,
    customerLabel: null,
    evidenceType: '시공',
    primaryService: 'road-traffic',
    relatedServices: ['pedestrian-life'],
    workType: ['설치'],

    problem: '진출입로는 건물에서 나오는 차량과 보도를 지나는 보행자가 만나는 지점입니다. ' +
      '차량이 나오는 것을 보행자가 미리 알 수 없으면, 서로를 발견하는 시점이 늦어집니다.',
    purpose: '출차 차량을 감지해 보행자가 미리 인지하도록 경광과 음성으로 알립니다.',
    work: [
      '현장 확인 — 출차 동선과 보행 동선이 만나는 지점 파악',
      '설치 위치와 시공 방법 협의',
      '기초 준비',
      '미러센서 설치 (한 방향만 감지하도록 구성)',
      '메인센서 1·2번 감지 순서에 따른 배선',
      '감지 시 경광등과 음성 안내가 함께 작동하도록 연동',
      '센서 감도 조절',
      '차단기 설치 후 작동 시험 반복'
    ],
    materials: [
      { name: '미러센서', spec: '일방향 감지' },
      { name: '경광등', spec: null }
    ],
    quantity: null,
    duration: null,
    result: '차량이 진출입로로 나올 때 경광등과 음성 안내가 함께 작동해, 보행자가 출차를 미리 인지할 수 있게 되었습니다. ' +
      '감지 방향을 한 방향으로 제한해 진입 차량에는 반응하지 않도록 했습니다.',

    images: {
      representative: 'after-02.jpg',
      before: ['before-01.jpg', 'before-02.jpg'],
      process: ['process-01.jpg', 'process-02.jpg', 'process-03.jpg', 'process-04.jpg', 'process-05.jpg', 'process-06.jpg', 'process-07.jpg', 'process-08.jpg'],
      after: ['after-01.jpg', 'after-02.jpg'],
      product: []
    },

    relatedProducts: ['traffic'],
    relatedGuides: [],
    relatedCases: [1, 8],
    faq: [
      { q: '출차주의등은 어느 쪽 차량을 감지하나요?',
        a: '현장에 맞춰 정합니다. 이 현장은 나가는 차량만 감지하도록 일방향으로 구성해, 들어오는 차량에는 작동하지 않습니다.' },
      { q: '경광등만 켜지나요, 소리도 나나요?',
        a: '이 현장은 감지 시 경광등과 음성 안내가 함께 작동하도록 연동했습니다. 주변 여건에 따라 음성 없이 경광만 쓰기도 합니다.' },
      { q: '설치 후 감지가 잘 안 되면 어떻게 하나요?',
        a: '설치 당일 센서 감도를 조절하고 작동 시험을 여러 차례 반복해 확인합니다.' }
    ],
    tags: ['제주 출차주의등', '출차주의등 설치', '미러센서 경광등', '주차장 보행자 안전', '진출입로 안전시설'],
    seo: {
      title: '제주 출차주의등 설치 사례 (미러센서·경광등) | 제주안전시설',
      description: '제주 건물 진출입로에 미러센서와 경광등을 연동한 출차주의등을 설치한 시공사례입니다. 위치 협의부터 배선, 감도 조절, 작동 시험까지의 과정을 정리했습니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-006.md',
    review: { disclosure: 'ok', notes: '원문에 발주처·지역 기재 없음 → null 유지.' },
    featured: true,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 9,
    slug: 'road-kerb-realignment-asphalt-restoration',
    title: '단지 내 도로 경계석 철거·재설치 및 아스콘 포장 복구',
    date: '2025-07',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2025-07-31 ~ 2025-08-05
    region: null,
    regionDetail: '단지 내 도로',
    facilityType: '도로 경계석 / 아스콘 포장',
    customerType: null,
    customerName: null,
    customerLabel: null,
    evidenceType: '유지보수',
    primaryService: 'road-traffic',
    relatedServices: ['public-maintenance'],
    workType: ['교체', '개선'],

    problem: '단지 내 도로의 선형이 좁아 차량이 경계석을 밟고 지나가는 일이 반복되고 있었습니다. ' +
      '경계석이 계속 하중을 받으면 파손과 이탈로 이어지고, 화단 쪽으로 차량이 넘어오는 위험도 남습니다.',
    purpose: '화단을 줄여 통행 폭을 확보하고, 차량이 경계석을 밟지 않는 선형으로 조정합니다.',
    work: [
      '수목을 최대한 보호하는 범위로 화단 축소 범위 결정',
      '경계석을 설치할 위치에 선형 표시',
      '장비 투입해 기존 경계석 철거 · 폐기물 처리',
      '화단 흙 조심스럽게 철거 후 외부 반출',
      '컴팩터로 다짐 (폭이 좁아 진동로라 진입 불가)',
      '잡석 포설 후 재다짐',
      '경계석 설치',
      '포장 마감 위치의 레벨 체크 및 구배 확인',
      '전체 재다짐 및 경계석 뒷채움',
      '아스팔트 프라이머 도포',
      '도로복구용 아스콘 포설 및 다짐'
    ],
    materials: [
      { name: '잡석', spec: null },
      { name: '도로복구용 아스콘', spec: '25kg 포대 — 5cm 두께 복구 시 약 4포 소요' }
    ],
    quantity: null,
    duration: null,
    result: '차량이 경계석을 밟지 않는 통행 폭이 확보되고, 철거 구간의 포장까지 복구했습니다. ' +
      '아스콘 포설 시에는 기온이 높아 컴팩터 하부에 경유를 뿌려가며 다졌고, ' +
      '양생을 위해 하루 정도 차량 통제가 필요한 작업입니다.',

    images: {
      representative: 'after-02.jpg',
      before: ['before-01.jpg', 'before-02.jpg'],
      process: ['process-01.jpg', 'process-03.jpg', 'process-05.jpg', 'process-07.jpg', 'process-09.jpg', 'process-11.jpg', 'process-13.jpg', 'process-15.jpg', 'process-17.jpg', 'process-19.jpg'],
      after: ['after-01.jpg', 'after-02.jpg'],
      product: []
    },

    relatedProducts: ['maintenance'],
    relatedGuides: [],
    relatedCases: [8],
    faq: [
      { q: '경계석만 다시 놓고 포장은 따로 맡겨야 하나요?',
        a: '한 번에 진행합니다. 철거·다짐·잡석 포설·경계석 설치 후 프라이머 도포와 도로복구용 아스콘 포장까지 이어서 시공했습니다.' },
      { q: '작업 중 차량 통행은 어떻게 되나요?',
        a: '아스콘 포장은 양생 시간이 필요합니다. 이 현장은 하루 정도 해당 구간의 차량 통제가 필요했습니다.' },
      { q: '화단의 수목은 어떻게 되나요?',
        a: '수목을 최대한 보호하는 선에서 화단 축소 범위를 먼저 정하고 선형을 표시한 뒤 작업했습니다.' }
    ],
    tags: ['제주 경계석 재설치', '경계석 선형 조정', '아스콘 포장 복구', '단지 내 도로 안전', '도로복구용 아스콘'],
    seo: {
      title: '도로 경계석 철거·재설치 및 아스콘 포장 복구 사례 | 제주안전시설',
      description: '차량이 경계석을 밟고 지나가던 단지 내 도로의 선형을 조정한 시공사례입니다. 철거·다짐·잡석 포설·경계석 재설치·아스콘 포장 복구까지 전 공정을 정리했습니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-009.md',
    review: { disclosure: 'ok', notes: '원문에 지역·발주처 기재 없음 → null 유지. 사진상 008 과 같은 현장으로 보이나 원문에 명시 없어 단정하지 않음.' },
    featured: true,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 8,
    slug: 'jeju-parking-pillar-reflective-tape',
    title: '제주 주차장 기둥 고휘도 반사테이프 부착',
    date: '2025-08',
    dateBasis: '사진', // 사진 촬영일 2025-08-05 — 원문에 시공일 기재 없음
    region: null,
    regionDetail: '제주도 내 주차장',
    facilityType: '고휘도 반사테이프',
    customerType: null,
    customerName: null,
    customerLabel: null,
    evidenceType: '시공',
    primaryService: 'road-traffic',
    relatedServices: ['pedestrian-life'],
    workType: ['설치', '개선'],

    problem: '주차면 한가운데에 구조물 기둥이 서 있어, 차를 대고 뺄 때 운전자가 기둥을 보지 못하고 ' +
      '차량 측면을 긁는 접촉 사고 위험이 컸습니다. 기둥이 회색이라 밝은 낮에도 배경과 구분되지 않았습니다.',
    purpose: '기둥의 위치가 주·야간 모두 한눈에 들어오게 만들어 측면 접촉을 막습니다.',
    work: [
      '기둥 표면 오염 제거 및 부착면 정리',
      '운전자 눈높이에 맞춰 부착 높이 결정',
      '노랑·검정 패턴 고휘도 반사테이프 부착',
      '주차면에서 실제로 보이는지 차량 위치에서 확인'
    ],
    materials: [
      { name: '고휘도 반사테이프', spec: '노랑·검정 패턴' }
    ],
    quantity: null,
    duration: null,
    result: '기둥이 주·야간 모두 눈에 들어오게 되어 차량 측면 접촉 위험이 줄었습니다. ' +
      '자재비와 시공 시간이 크게 들지 않으면서 야간 주차 시 체감 효과가 큰 작업입니다.',

    images: {
      representative: 'after-01.jpg',
      before: ['before-01.jpg', 'before-02.jpg', 'before-03.jpg'],
      process: ['process-01.jpg'],
      after: ['after-01.jpg', 'after-02.jpg', 'after-03.jpg'],
      product: []
    },

    relatedProducts: ['traffic'],
    relatedGuides: [],
    relatedCases: [11, 9, 1],
    faq: [
      { q: '반사테이프만 부착하는 소규모 작업도 맡기나요?',
        a: '맡습니다. 기둥 몇 개에 반사테이프를 붙이는 정도의 작업도 시공합니다.' },
      { q: '주차장 운영을 멈추지 않고 작업할 수 있나요?',
        a: '반사테이프 부착은 기둥 단위로 짧게 진행할 수 있어, 해당 주차면만 잠시 비워 주시면 됩니다.' }
    ],
    tags: ['제주 반사테이프', '주차장 기둥 보호', '고휘도 반사테이프', '주차장 안전시설', '기둥 충돌 방지'],
    seo: {
      title: '제주 주차장 기둥 반사테이프 부착 사례 | 제주안전시설',
      description: '주차면 중앙에 선 기둥이 보이지 않아 차량 측면 접촉 위험이 있던 제주 주차장에 고휘도 반사테이프를 부착해 주·야간 시인성을 확보한 시공사례입니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-008.md',
    review: {
      disclosure: 'ok',
      notes: '원문에 발주처·정확한 지역 기재 없음 → null 유지 (공공주차장 여부 미확인). ' +
        '원문 008 은 한 현장에서 수행한 서로 다른 작업 3가지를 한 글에 담고 있어, ' +
        '증거(사진)가 각각 독립적으로 성립하는 단위로 사례 008(기둥 반사테이프)과 사례 011(시선유도봉·반사 경고도색)로 나눴습니다. ' +
        '두 사례는 사진을 공유하지 않습니다. ' +
        'process-01 은 배경 건물의 기관 명패가 찍혀 있어 상단을 잘라냈습니다(발주처 미확인 상태 유지).'
    },
    featured: false,
    published: true
  },

  /* ──────────────────────────────────────────────────────────
     008 과 같은 현장·같은 날의 기록이지만, 시설·문제·사진이 모두 다릅니다.
     008 = 주차면 기둥(반사테이프) / 011 = 진입 모서리 경계석(유도봉·도색).
     사진은 한 장도 겹치지 않습니다. ────────────────────────── */
  {
    id: 11,
    slug: 'jeju-parking-delineator-post-kerb-marking',
    title: '제주 주차장 시선유도봉·경계석 반사 경고도색',
    date: '2025-08',
    dateBasis: '사진', // 사진 촬영일 2025-08-05 — 원문에 시공일 기재 없음
    region: null,
    regionDetail: '제주도 내 주차장 진입 모서리',
    facilityType: '시선유도봉 / 반사 경고도색',
    customerType: null,
    customerName: null,
    customerLabel: null,
    evidenceType: '시공',
    primaryService: 'road-traffic',
    relatedServices: ['pedestrian-life'],
    workType: ['설치', '개선'],

    problem: '주차장 진입 모서리에서 차량 회전 동선과 보행 동선이 구분 없이 겹쳤습니다. ' +
      '화단 쪽으로 돌출된 경계석은 낮에도 눈에 잘 띄지 않아 차량이 타고 넘거나 긁는 일이 반복될 수 있는 자리였습니다.',
    purpose: '차량이 도는 공간과 사람이 걷는 공간을 눈으로 구분되게 하고, 돌출된 경계석의 위치를 알립니다.',
    work: [
      '주차장 모서리와 보행로 경계부에 시선유도봉 설치',
      '도로와 잔디 경계석 돌출부에 노랑·검정 반사 경고도색',
      '차량 회전 반경을 침범하지 않는 위치인지 확인'
    ],
    materials: [
      { name: '시선유도봉', spec: null },
      { name: '반사 경고도료', spec: '노랑·검정' }
    ],
    quantity: null,
    duration: null,
    result: '보행 동선과 차량 회전 공간이 눈으로 구분되었고, 돌출된 경계석이 식별되어 ' +
      '타고 넘거나 접촉하는 일을 줄일 수 있게 되었습니다.',

    images: {
      representative: 'after-02.jpg',
      before: [],
      process: [],
      after: ['after-01.jpg', 'after-02.jpg', 'after-03.jpg'],
      product: []
    },

    relatedProducts: ['traffic', 'pedestrian'],
    relatedGuides: ['delineator-post-installation'],
    relatedCases: [8, 1, 3],
    faq: [
      { q: '경계석 반사도색만 따로 의뢰할 수 있나요?',
        a: '가능합니다. 돌출된 경계석이나 턱 부위만 반사 경고도색으로 마감하는 작업도 별도로 진행합니다.' },
      { q: '시선유도봉을 세울 자리는 어떻게 정하나요?',
        a: '차량 회전 반경을 침범하지 않으면서 보행 동선은 지켜 주는 위치로 잡습니다. 회전 구간 안쪽으로 너무 붙이면 오히려 접촉 대상이 됩니다.' }
    ],
    tags: ['제주 시선유도봉', '경계석 반사도색', '주차장 동선 분리', '반사 경고도색', '주차장 안전시설'],
    seo: {
      title: '제주 주차장 시선유도봉·경계석 반사도색 사례 | 제주안전시설',
      description: '차량 회전 동선과 보행 동선이 겹치던 제주 주차장 진입 모서리에 시선유도봉을 세우고 돌출 경계석에 반사 경고도색을 적용한 시공사례입니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-008.md',
    review: {
      disclosure: 'ok',
      notes: '원문 008 에서 분리한 사례입니다. 원문에 발주처·정확한 지역 기재 없음 → null 유지. ' +
        '시공 전 사진이 없어 before 는 비웠습니다 (원문에 해당 구간의 작업 전 사진이 없음 — 추측으로 채우지 않습니다).'
    },
    featured: false,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 4,
    slug: 'school-drainage-heavy-duty-grating-replacement',
    title: '학교 배수로 중하중 그레이팅 교체',
    date: '2026-04',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2026-04-15
    region: null,
    regionDetail: null,
    facilityType: '중하중 그레이팅',
    customerType: '학교',
    customerName: null,
    customerLabel: '제주 소재 초등학교',
    evidenceType: '유지보수',
    primaryService: 'pedestrian-life',
    relatedServices: ['school-child', 'public-maintenance'],
    workType: ['교체', '보수'],

    problem: '현장을 확인해 보니 바닥 콘크리트에 균열이 여러 곳 있었고, 배수로 주변이 파손·열화된 상태였습니다. ' +
      '기존 그레이팅은 이 구간에 걸리는 하중을 감당하지 못하고 있었습니다. 학생들이 지나다니는 공간이라 ' +
      '방치하면 안전사고로 이어질 수 있는 상태였습니다.',
    purpose: '차량·보행 하중에 견디는 제품으로 교체하고, 파손된 배수로 주변을 함께 정리합니다.',
    work: [
      '기존 그레이팅 철거',
      '배수로 주변 보수 및 정리',
      '중하중 그레이팅 설치 및 고정'
    ],
    materials: [
      { name: '중하중용 그레이팅', spec: null }
    ],
    quantity: null,
    duration: null,
    result: '반복 하중에 견디는 구조로 바뀌어 내구성이 확보되고, 배수 기능이 개선되었습니다. ' +
      '균열부 주변을 함께 정리해 학생 이동 구간의 안전성과 외관이 같이 좋아졌습니다. ' +
      '학교·주차장처럼 하중이 지속적으로 걸리는 구간은 일반 그레이팅으로는 파손이 반복됩니다.',

    images: {
      representative: 'after-01.jpg',
      before: ['before-01.jpg', 'before-02.jpg', 'before-03.jpg'],
      process: ['process-01.jpg'],
      after: ['after-01.jpg', 'after-02.jpg', 'after-03.jpg'],
      product: ['product-01.png']
    },

    relatedProducts: ['pedestrian'],
    relatedGuides: [],
    relatedCases: [2],
    faq: [
      { q: '일반 그레이팅과 중하중 그레이팅은 어떻게 구분하나요?',
        a: '걸리는 하중으로 정합니다. 차량이 지나가거나 하중이 반복되는 구간에는 중하중용을 적용합니다. 이 현장도 기존 제품의 하중 대응이 부족해 교체했습니다.' },
      { q: '균열이 같이 있는데 그레이팅만 바꾸면 되나요?',
        a: '균열이 있는 구간은 보수와 교체를 같이 진행합니다. 주변이 열화된 상태에서 제품만 바꾸면 다시 파손됩니다.' },
      { q: '학기 중에도 작업이 가능한가요?',
        a: '학생 통행이 있는 구간은 통행을 막고 작업해야 하므로, 방학 또는 통행이 적은 시간대에 진행하는 것을 권합니다.' }
    ],
    tags: ['제주 배수로 그레이팅', '중하중 그레이팅', '학교 배수로 교체', '그레이팅 교체', '학교 안전시설'],
    seo: {
      title: '학교 배수로 중하중 그레이팅 교체 사례 | 제주안전시설',
      description: '균열과 파손이 진행된 학교 배수로의 그레이팅을 중하중용으로 교체한 시공사례입니다. 철거·주변 보수·설치까지의 작업 내용과 시공 전후 사진을 정리했습니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-004.md',
    review: { disclosure: 'ok', notes: '원문에 학교명·지역 기재 없음 → customerLabel 로 익명 처리. product-01 은 AI 생성 삽화(현장 실사 아님).' },
    featured: false,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 2,
    slug: 'school-entrance-ramp-plate-installation',
    title: '학교 출입구 경사로 진입판 설치',
    date: '2026-04',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2026-04-16
    region: null,
    regionDetail: null,
    facilityType: '경사로 진입판 (차량 진입판 U형)',
    customerType: '학교',
    customerName: null,
    customerLabel: '제주 소재 초등학교',
    evidenceType: '시공',
    primaryService: 'school-child',
    relatedServices: ['pedestrian-life'],
    workType: ['설치'],

    problem: '보도와 도로 사이에 단차가 있어 통행이 끊기는 구조였습니다. ' +
      '아이들뿐 아니라 유모차와 휠체어가 지날 때 걸림이 생기고, 차량이 넘어갈 때는 충격이 그대로 전달됩니다.',
    purpose: '단차를 완만하게 이어 보행과 차량 통행을 모두 안정시킵니다.',
    work: [
      '현장 단차 높이에 맞는 진입판 규격 선정',
      '배수로와 기존 구조를 고려한 설치 위치 조정',
      '흔들림 방지를 위한 고정 시공',
      '보행 동선과 차량 통행을 함께 고려한 배치'
    ],
    materials: [
      { name: '차량 진입판 U형', spec: '고강도 고무 컴파운드, 미끄럼방지 패턴' }
    ],
    quantity: null,
    duration: null,
    result: '보행 이동이 끊기지 않고 자연스럽게 이어지며, 차량 진입 시 충격이 줄었습니다. ' +
      '현장마다 단차 높이와 주변 구조가 다르기 때문에 제품 선택과 배치가 결과를 좌우하는 작업입니다.',

    images: {
      representative: 'after-01.jpg',
      before: ['before-01.jpg'],
      process: ['process-01.jpg'],
      after: ['after-01.jpg', 'after-02.jpg', 'after-03.jpg'],
      product: ['product-01.png']
    },

    relatedProducts: ['school'],
    relatedGuides: [],
    relatedCases: [3, 4],
    faq: [
      { q: '단차 높이를 모르는데 어떻게 제품을 정하나요?',
        a: '현장에서 단차 높이와 주변 구조를 확인한 뒤 규격을 정합니다. 담당자께서 미리 규격을 아실 필요는 없습니다.' },
      { q: '배수로가 바로 앞에 있는데 설치가 되나요?',
        a: '됩니다. 이 현장도 배수로와 기존 구조를 피해 위치를 조정해 설치했습니다.' },
      { q: '진입판이 밀리거나 흔들리지 않나요?',
        a: '흔들림 방지를 위한 고정 시공을 함께 진행합니다. 고정 없이 얹어두면 차량 통행에 밀립니다.' }
    ],
    tags: ['학교 경사로 진입판', '차량 진입판 U형', '단차 해소', '제주 학교 안전시설', '보도 단차'],
    seo: {
      title: '학교 출입구 경사로 진입판 설치 사례 | 제주안전시설',
      description: '보도와 도로 사이 단차로 통행이 불편했던 학교 출입구에 차량 진입판(U형)을 설치한 시공사례입니다. 규격 선정, 위치 조정, 고정 시공 과정을 정리했습니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-002.md',
    review: { disclosure: 'ok', notes: '원문에 학교명·지역 기재 없음 → customerLabel 로 익명 처리. product-01 은 AI 생성 삽화(현장 실사 아님).' },
    featured: false,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 3,
    slug: 'seogwipo-school-route-delineator-post',
    title: '서귀포시 초등학교 통학로 시선유도봉 설치',
    date: '2026-04',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2026-04-15
    region: '서귀포시',
    regionDetail: '초등학교 통학로',
    facilityType: '시선유도봉',
    customerType: '학교',
    customerName: null,
    customerLabel: '서귀포시 소재 초등학교',
    evidenceType: '시공',
    primaryService: 'school-child',
    relatedServices: ['road-traffic'],
    workType: ['설치'],

    problem: '현장을 처음 확인했을 때 차량과 보행자의 동선이 자연스럽게 섞일 수 있는 구조였습니다. ' +
      '어린이가 매일 이용하는 통학로였기 때문에, 사고가 난 뒤가 아니라 그 전에 손을 대야 하는 구간이었습니다.',
    purpose: '차량 진입 구간과 보행 동선을 눈으로 구분해, 통학 시간대의 혼재를 줄입니다.',
    work: [
      '차량 진입 구간에 시선유도봉 설치',
      '일정 간격 유지 및 직선 정렬 시공',
      '바닥 천공 후 앵커 고정',
      '주변 통행에 방해되지 않도록 위치 조정'
    ],
    materials: [
      { name: '시선유도봉', spec: '연질 폴리우레탄, Ø250 × Ø80 × H750, 반사띠 적용' }
    ],
    quantity: null,
    duration: null,
    result: '차량 이동 경로가 정리되고 보행자 동선이 명확히 구분되었으며, 운전자 시인성이 개선되었습니다. ' +
      '작업 자체는 단순해 보이지만 간격·정렬·고정 상태에 따라 완성도가 크게 달라지는 시공입니다.',

    images: {
      representative: 'after-01.jpg',
      before: ['before-01.png'],
      process: ['process-01.jpg', 'process-02.jpg'],
      after: ['after-01.jpg'],
      product: ['product-01.png']
    },

    relatedProducts: ['school', 'traffic'],
    relatedGuides: ['delineator-post-installation'],
    relatedCases: [1, 2],
    faq: [
      { q: '통학로에 시선유도봉을 세우면 통행에 방해되지 않나요?',
        a: '주변 통행을 확인한 뒤 위치를 조정해 설치합니다. 이 현장도 보행 폭을 확보하는 선에서 배치했습니다.' },
      { q: '학교에서 쓰기에 적합한 제품인가요?',
        a: '충격 시 복원력이 있고 반사띠가 적용된, 학교와 공공시설에서 널리 쓰이는 규격의 제품을 적용했습니다.' },
      { q: '서귀포도 현장 확인이 가능한가요?',
        a: '가능합니다. 제주시·서귀포시와 읍면 지역 모두 현장 확인 후 견적을 드립니다.' }
    ],
    tags: ['제주 시선유도봉', '서귀포 통학로 안전시설', '학교 시선유도봉', '통학로 동선 분리', '제주 학교 안전시설'],
    seo: {
      title: '서귀포시 초등학교 통학로 시선유도봉 설치 사례 | 제주안전시설',
      description: '차량과 보행자 동선이 섞이던 서귀포시 초등학교 통학로에 시선유도봉을 설치한 시공사례입니다. 간격·정렬·앵커 고정 등 시공 방법과 제품 규격을 정리했습니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-003.md',
    review: { disclosure: 'ok', notes: '원문이 학교명을 익명 처리(D초등학교). 원본 이미지 파일명에 실명이 있었으나 반입 시 규칙에 따라 리네임되어 사이트에는 남지 않음. product-01 은 AI 생성 삽화.' },
    featured: false,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 5,
    slug: 'stainless-folding-gate-rail-type',
    title: '레일형 스텐 자바라 대문 설치',
    date: '2026-04',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2026-04-02
    region: null,
    regionDetail: null,
    facilityType: '스텐 자바라 대문 (레일형)',
    customerType: null,
    customerName: null,
    customerLabel: null,
    evidenceType: '시공',
    primaryService: 'metal-fabrication',
    relatedServices: [],
    workType: ['설치'],

    problem: '차량 통행이 잦고 대문의 직선 주행성이 중요한 진입로였습니다. ' +
      '자바라 대문은 길어질수록 휘어짐이 생기기 쉽고, 강풍이나 경사 조건에서는 개폐 중 경로를 이탈할 위험이 있습니다.',
    purpose: '레일이 바퀴를 잡아주는 구조로 만들어, 대문이 길어져도 일직선으로 개폐되게 합니다.',
    work: [
      '바닥면에 앵글 레일 고정 — 레일 수평 확보',
      '레일 위를 바퀴가 주행하는 방식으로 자바라 본체 설치',
      '개폐 시험 및 구동 상태 확인'
    ],
    materials: [
      { name: '스텐 자바라 대문', spec: 'STS304' },
      { name: '앵글 레일', spec: null }
    ],
    quantity: null,
    duration: null,
    result: '레일이 가이드 역할을 해 대문이 길어져도 휘어짐 없이 열리고 닫힙니다. ' +
      '바퀴가 레일에 맞물려 돌기 때문에 외부 충격이나 강풍에도 경로를 이탈할 위험이 낮고, ' +
      '바닥 마찰이 일정해 바퀴 편마모가 적습니다. 레일 홈에 이물질이 끼면 바퀴가 상하므로 주기적인 청소가 필요합니다.',

    images: {
      representative: 'after-02.jpg',
      before: [],
      process: [],
      after: ['after-01.jpg', 'after-02.jpg', 'after-03.jpg', 'after-04.jpg', 'after-05.jpg', 'after-06.jpg'],
      product: []
    },

    relatedProducts: ['metal'],
    relatedGuides: ['stainless-folding-gate', 'metal-material-selection'],
    relatedCases: [7],
    faq: [
      { q: '레일형과 무레일형 중 어느 쪽이 좋나요?',
        a: '현장에 따라 다릅니다. 대문이 길거나 강풍·경사 조건이면 레일형이 직선 주행과 이탈 방지에 유리합니다. 다만 차량이 레일을 밟고 지나가므로 레일이 바닥에서 튀어나오지 않게 마감해야 합니다.' },
      { q: '레일 시공에서 가장 중요한 것은 무엇인가요?',
        a: '수평입니다. 바닥면과 레일이 들뜨면 바퀴 소음이 나고 이탈 위험이 생깁니다.' },
      { q: '관리는 어떻게 하나요?',
        a: '레일 홈에 흙이나 자갈이 끼지 않도록 주기적으로 청소하면 부드러운 구동감이 오래 유지됩니다.' }
    ],
    tags: ['제주 스텐 자바라 대문', '레일형 자바라 대문', 'STS304 대문', '스테인리스 대문 설치', '제주 금속 시설물'],
    seo: {
      title: '레일형 스텐 자바라 대문 설치 사례 | 제주안전시설',
      description: '차량 통행이 잦은 진입로에 앵글 레일 주행 방식의 스텐 자바라 대문(STS304)을 설치한 시공사례입니다. 레일 수평 확보와 개폐 안정성 확인 과정을 정리했습니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-005.md',
    review: { disclosure: 'ok', notes: '원문에 지역·발주처 기재 없음 → null 유지. 시공 전 사진 없음.' },
    featured: false,
    published: true
  },

  /* ────────────────────────────────────────────────────────── */
  {
    id: 7,
    slug: 'jeju-stainless-folding-gate-angle-frame',
    title: '제주 스텐 자바라 대문 설치 (앵글 프레임·무수축몰탈)',
    date: '2025-12',
    dateBasis: '사진', // _dateHint: 사진 촬영일 2025-12-01 ~ 12-02
    region: null,
    regionDetail: null,
    facilityType: '스텐 자바라 대문 (앵글 프레임형)',
    customerType: null,
    customerName: null,
    customerLabel: null,
    evidenceType: '시공',
    primaryService: 'metal-fabrication',
    relatedServices: [],
    workType: ['설치'],

    problem: '제주는 바닷바람의 염분 때문에 철제 대문이 빠르게 녹습니다. ' +
      '또 태풍급 바람이 부는 지역이라, 대문을 바닥에 얹어 두는 수준으로 고정하면 흔들림과 전도 위험이 남습니다.',
    purpose: '염분에 견디는 재질과, 강풍에도 흔들리지 않는 바닥 고정 구조를 확보합니다.',
    work: [
      '바닥 커팅 후 치핑',
      '50×50 ST 앵글 프레임 위치 선정 (기준점 설정)',
      '하부는 무수축몰탈로 레벨 조정',
      '상부는 앵커 + 용접으로 고정, 전체 수직·수평 오차 최소화',
      '닫힘 시 틈새를 줄이는 20mm 턱 제작',
      '스텐 자바라 본체 설치 및 고정 브래킷 체결',
      '펼침·접힘 시험, 이동 레일 확인, 구배 체크, 조립부 간섭 확인',
      '하부 무수축몰탈 레벨 마무리 및 오염 제거'
    ],
    materials: [
      { name: '스텐 자바라 대문', spec: 'SUS304' },
      { name: '프레임', spec: '50×50 ST 앵글' },
      { name: '무수축몰탈', spec: null }
    ],
    quantity: null,
    duration: null,
    result: '가볍게 밀어도 부드럽게 열리고 닫힘이 단단한 상태로 마무리되었습니다. ' +
      '20mm 턱을 만들어 닫힘 틈새를 줄인 덕분에 흔들림과 바람의 영향, 진동이 함께 줄었습니다. ' +
      '자바라 대문에서 시간이 가장 많이 드는 곳이 바닥 고정이며, 여기를 줄이면 태풍 한 번에 되돌아옵니다.',

    images: {
      representative: 'after-03.jpg',
      before: [],
      process: ['process-01.jpg', 'process-02.jpg', 'process-03.jpg', 'process-04.jpg'],
      after: ['after-03.jpg'],
      product: []
    },

    relatedProducts: ['metal'],
    relatedGuides: ['stainless-folding-gate', 'metal-material-selection'],
    relatedCases: [5],
    faq: [
      { q: '바닥에 그냥 고정하면 안 되나요?',
        a: '권하지 않습니다. 앵글을 매립하고 무수축몰탈로 채운 뒤 앵커와 용접으로 고정해야 차량이 지나다녀도 흔들리지 않습니다.' },
      { q: '20mm 턱은 왜 만드나요?',
        a: '대문이 닫힐 때 자연스럽게 걸리게 하고 틈새를 최소화하기 위해서입니다. 이 턱 하나가 흔들림과 바람의 영향, 진동을 줄여 줍니다.' }
    ],
    tags: ['제주 스텐 자바라 대문', 'SUS304 대문', '자바라 대문 앵글 프레임', '무수축몰탈 고정', '제주 해풍 부식'],
    seo: {
      title: '제주 스텐 자바라 대문 설치 사례 (앵글 프레임) | 제주안전시설',
      description: '염분과 강풍 조건을 전제로 50×50 ST 앵글 프레임과 무수축몰탈로 바닥을 고정해 스텐 자바라 대문(SUS304)을 설치한 제주 시공사례입니다.'
    },
    sourceRef: 'Raw/04. 안전시설/안전시설-007.md',
    review: {
      disclosure: '확인필요',
      notes: '완료 사진 4장 중 3장(after-01·02·04 에 해당하던 컷)의 배경에 제3자 상호와 전화번호가 찍혀 있어 현장이 식별될 수 있습니다. ' +
        '해당 컷은 게시 목록에서 제외했고, 배경에 상호가 없는 1장만 남겼습니다. ' +
        '원문 본문에 있던 개인 휴대폰번호는 사이트에 옮기지 않았습니다(대표번호 1660-4019 사용). ' +
        '사진 파일도 공개 저장소에서 제외했습니다 (.gitignore 의 assets/images/cases/007/). ' +
        '게시 여부를 발주처와 확인한 뒤 그 .gitignore 줄을 지우고 사진을 커밋한 다음 published 를 true 로 바꾸세요.'
    },
    featured: false,
    published: false
  }
];

/* ── 목록 정렬 ──────────────────────────────────────────────
   1순위: 대표사례(featured)
   2순위: 최신순 (date 가 없는 사례는 뒤로)
   보조 가중치: 시공 전 사진이 있으면 동점 구간에서만 앞으로 올립니다.
                (하드 정렬 키가 아닙니다 — 비교 가능한 기록을 조금 우대할 뿐입니다)
─────────────────────────────────────────────────────────── */
const BEFORE_PHOTO_WEIGHT = 0.5;

function caseSortScore(c) {
  const dateNum = c.date ? Number(String(c.date).replace(/-/g, '').padEnd(8, '0')) : 0;
  const before = (c.images && c.images.before && c.images.before.length) ? BEFORE_PHOTO_WEIGHT : 0;
  return { featured: c.featured ? 1 : 0, score: dateNum + before };
}

function sortCases(list) {
  return list.slice().sort((a, b) => {
    const sa = caseSortScore(a); const sb = caseSortScore(b);
    if (sa.featured !== sb.featured) return sb.featured - sa.featured;
    if (sb.score !== sa.score) return sb.score - sa.score;
    return a.id - b.id;
  });
}

/** 발행 대상만. published:false 와 공개 검토 중인 사례는 사이트에 나오지 않습니다. */
function publishedCases() {
  return sortCases(CASES.filter((c) => c.published && (!c.review || c.review.disclosure !== '확인필요')));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CASES, sortCases, publishedCases, BEFORE_PHOTO_WEIGHT };
}

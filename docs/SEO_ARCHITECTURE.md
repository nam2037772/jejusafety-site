# SEO_ARCHITECTURE.md — 검색·AEO 구조 구현 보고

> 관점: **Website Design < Search Asset < Brand Asset**
> 목표: `제주 + 안전시설 = 제주안전시설` 이라는 검색·브랜드 연상 확보

---

## 1. SEO Architecture

### 1-1. 페이지 = 독립 검색 자산

25장 전부가 회사소개의 일부가 아니라 **각자 검색 의도를 가진 랜딩페이지**입니다.
`title` · `description` 은 사이트 전체에서 **유일**하며, `check-site.js` 가 중복을 오류로 잡습니다.

| 층 | 페이지 | 검색 의도 |
| --- | --- | --- |
| 브랜드 | `index.html` | 제주 안전시설 (브랜드·지역·업종) |
| 서비스 | `service/*.html` × 5 | 지역 + 시설군 + 작업 |
| **사례** | `case/*.html` × N | **지역 + 시설 + 작업 + 발주처유형** (가장 롱테일, 가장 많이 늘어남) |
| 자재 | `products.html` | 지역 + 시설 + **납품/구매** |
| 자료 | `guide/*.html` × N | 시설 + 방법·기준 (정보 탐색) |
| 신뢰 | `about.html` `contact.html` | 브랜드·법인·연락 |

### 1-2. 키워드 구조 — `지역 + 시설 + 작업`

**모든 주 키워드에 `제주`가 들어갑니다.** 지역 없는 전국 키워드는 노리지 않습니다.
전국 경쟁으로 나가는 순간 이 브랜드의 해자(제주 지역성)가 사라집니다.

| 페이지 | 주 키워드 | 실제 title |
| --- | --- | --- |
| `/` | 제주 안전시설 | 제주안전시설 \| 제주 안전시설 설치·교체·보수 · 안전자재 납품 |
| `service/road-traffic` | 제주 차선규제봉 | 제주 도로·교통 안전시설 설치·교체 \| 제주안전시설 |
| `service/school-child` | 제주 학교 안전시설 | 제주 학교·어린이 안전시설 설치 \| 제주안전시설 |
| `service/pedestrian-life` | 제주 배수로 그레이팅 | 제주 배수로 그레이팅 교체 · 보행 안전시설 \| 제주안전시설 |
| `service/public-maintenance` | 제주 안전시설 보수 | 제주 안전시설 보수 · 노후 시설 유지관리 \| 제주안전시설 |
| `service/metal-fabrication` | 제주 스텐 자바라 대문 | 제주 스테인리스·금속 안전시설물 제작·설치 \| 제주안전시설 |
| `products.html` | 제주 안전자재 납품 | 제주 안전시설·안전자재 납품 \| 제주안전시설 |
| `case/001` | 서귀포 차선규제봉 교체 | 서귀포시 로터리 차선규제봉 교체 사례 \| 제주안전시설 |
| `case/006` | 제주 출차주의등 설치 | 제주 출차주의등 설치 사례 (미러센서·경광등) \| 제주안전시설 |

**키워드 스터핑을 하지 않습니다.** 키워드는 실제 사례 서술·규격표·FAQ 안에서 자연히 반복됩니다.
`check-site.js` 가 근거 없는 최상급(1위·최고·최저가)과 전국 표현을 오류로 잡습니다.

### 1-3. 지역 SEO — doorway page 없이

- `areaServed` 는 **제주특별자치도 · 제주시 · 서귀포시** 로만 선언
- 지역명은 **실제 사례의 `region` / `regionDetail`** 에서만 나옵니다 (제목·요약표·배지)
- **`제주시.html` 같은 빈 지역 페이지를 만들지 않습니다.** 콘텐츠 없는 지역 랜딩은 doorway 판정 위험
- 지역별 사례가 충분히 쌓이면 `cases.html` 의 지역 필터를 랜딩으로 승격하는 것을 2차로 검토
- 원문에 지역이 없는 사례는 `region: null` — **없는 지역을 SEO 목적으로 만들지 않습니다**

---

## 2. AEO Architecture (AI Search 대응)

### 2-1. 엔티티 관계 — 모든 페이지에서 동일

```
제주안전시설            → LocalBusiness + ProfessionalService   @id "#brand"
   ├ parentOrganization → (주)아인산업안전  Organization         @id "#operator"
   ├ areaServed         → 제주특별자치도 · 제주시 · 서귀포시
   ├ makesOffer         → 안전시설 설치·교체·보수 / 안전시설·안전자재 납품
   ├ knowsAbout         → 실제 수행 작업 14종 (사례가 뒷받침하는 것만)
   └ sameAs             → ainsafety.com (안전용품 쇼핑몰)
```

- 이 그래프는 `tools/lib/layout.js` **한 곳**에서 생성되므로 페이지 간 모순이 생길 수 없습니다.
- `check-site.js` 가 매 페이지에서 `#brand` · `#operator` 노드 존재와
  `parentOrganization` 관계, `areaServed` 에 '전국'이 없는지 검사합니다.
- 브랜드-법인 관계는 화면에서도 한 문장으로 통일됩니다 (푸터 전 페이지):
  **"제주안전시설은 (주)아인산업안전이 운영하는 제주 안전시설 전문 브랜드입니다."**

### 2-2. 질문형 콘텐츠

FAQ 는 **실제 고객 질문**만 담습니다. 장식용 대량 생성을 하지 않습니다.
답변은 짧고, 사실 기반이며, **해당 사례·서비스에서 실제로 한 일**을 근거로 답합니다.

| 위치 | 개수 | 예 |
| --- | --- | --- |
| 홈 | 4 | "안전시설 자재만 납품받을 수 있나요?" |
| 서비스 5장 | 3~4씩 | "제주에서 시선유도봉 설치가 가능한가요?" / "기존 차선규제봉 교체도 가능한가요?" / "학교 안전시설 소규모 공사도 가능한가요?" |
| 사례 8장 | 2~3씩 | "기존 그레이팅 철거 후 재설치가 가능한가요?" |
| 제품 | 4 | "관공서 수의계약 서류도 처리되나요?" |
| 자료실 3장 | 2~3씩 | "제주는 무조건 STS316을 써야 하나요?" |

전부 `FAQPage` JSON-LD 로도 나갑니다. **화면 텍스트와 구조화데이터가 같은 원본에서 생성**되므로
불일치가 발생하지 않습니다.

### 2-3. AI 가 답을 뽑아가기 좋은 형태

- 사례 상단의 **정의 목록(요약표)** — 지역·발주처유형·시설·작업유형이 한눈에
- 서비스의 **시설/규격 표** — "시설 · 규격·재질 · 용도" 3열
- 유지보수의 **판단표** — "현장 상태 → 판단 → 조치"
- 재질 가이드의 **비교표** — STS304 / STS316 / 용융아연도금
- `problem → purpose → work → result` 고정 순서 — 질문-답변 매핑이 쉬운 구조

---

## 3. Internal Linking Map

```
                          ┌──────────────┐
                          │  index.html  │
                          └──────┬───────┘
         ┌───────────────┬───────┴───────┬────────────────┐
         ▼               ▼               ▼                ▼
   service.html     cases.html     products.html     guide.html
         │               │               │                │
         ▼               ▼               │                ▼
  service/<slug> ◀──┐    │               │         guide/<slug>
         │  ▲       │    │               │            │   ▲  │
         │  │       │    ▼               │            │   │  │
         │  │       └─ case/<id>-<slug> ─┼────────────┘   │  │
         │  │            │  │  │         │                │  │
         │  └────────────┘  │  └─────────┴────────────────┘  │
         │   관련 서비스     │   관련 제품 앵커                 │
         │                 └─ 관련 사례 (relatedCases) ────────┘
         ▼
   contact.html?type=site|quote|install|supply
```

### 실제 연결 (모두 정적 HTML 링크 — JS 없이도 크롤링됨)

| 방향 | 구현 |
| --- | --- |
| Case → Service | `primaryService` + `relatedServices` 전부 링크 |
| Case → Product | `relatedProducts` → `products.html#<앵커>` |
| Case → Guide | `relatedGuides` → `guide/<slug>.html` |
| Case → Case | `relatedCases` → "비슷한 시공사례" 카드 |
| Service → Case | 해당 분야 사례 3건 **빌드 시점에 카드로 심음** |
| Service → Guide | `guides.js` 의 `service` 로 역참조 |
| Service → Product | `productAnchor` |
| Guide → Case | `relatedCases` 카드 |
| Guide → Guide | 같은 자료실의 다른 문서 |
| Product → Service | 제품군마다 관련 서비스 링크 |
| 홈 → 문제별 라우터 | 8개 문제 문장 → 해당 서비스·제품 |
| 전 페이지 → 문의 | 헤더 전화 · 모바일 고정바 · CTA 밴드 |

**고립 페이지 0** — `check-site.js` 가 검사합니다.

> ⚠️ 초기 구현에서 사례 카드를 JS 로만 그렸더니 사례 8장이 전부 고립 페이지였습니다.
> 크롤러(특히 네이버 Yeti)가 스크립트를 실행하지 않으면 사례가 통째로 색인에서 빠집니다.
> → `tools/build.js` 의 `prefillCases()` 가 **빌드 시점에 카드를 HTML 로 심고**,
> `main.js` 는 그 위에서 필터링만 합니다.

---

## 4. Structured Data 구현

| 타입 | 적용 위치 | 비고 |
| --- | --- | --- |
| `Organization` (`#operator`) | 전 페이지 | legalName · 사업자등록번호(identifier) · 주소 · sameAs |
| `LocalBusiness` + `ProfessionalService` (`#brand`) | 전 페이지 | parentOrganization · areaServed · knowsAbout · makesOffer |
| `WebSite` | 홈 | publisher → `#operator` |
| `BreadcrumbList` | 하위 전 페이지 | 화면 빵부스러기와 동일 데이터 |
| `Service` (`#service-<slug>`) | 서비스 5장 | `hasOfferCatalog` 로 취급 시설 나열 |
| `FAQPage` | 홈·서비스·사례·제품·자료실 | 화면 FAQ 와 같은 원본 |
| `Article` | 사례 8장 · 자료실 3장 | `about` → 해당 Service 노드 참조 |
| `ImageObject` (Article.image) | 사례 | **도메인 확정 후에만** (절대 URL 필요) |

### 넣지 않은 것

- **`AggregateRating` · `Review`** — 실제 리뷰 데이터가 없습니다
- **`Offer.price` · `priceRange`** — 현장마다 다르고, 사이트에 금액을 표기하지 않습니다
- **`openingHoursSpecification`** — 영업시간이 확정되지 않아 `config.js` 에서 비워 둠 (값이 차면 자동 출력)
- **`geo`** — 위경도 미확인
- **`aggregateRating` 을 위한 가짜 후기** — 만들지 않습니다

> 원칙: **실제 페이지 내용과 일치하는 데이터만.** 빈 값은 JSON-LD 에서 자동으로 빠집니다.

---

## 5. Case SEO 템플릿

사례 상세는 포트폴리오가 아니라 **독립 검색 랜딩페이지**입니다. 고정 구조:

```
H1        <지역> <시설명> <작업>            ← 사람이 실제로 검색하는 표현
요약표     지역 | 발주처 유형 | 시설 | 작업 유형 | 시공 시기 | 수량 | 소요 기간
           (값이 없는 행은 아예 나오지 않습니다 — 빈칸을 만들지 않음)

1  문제      현장에서 무엇이 위험했는가
2  설치 목적  왜 이 시설이 필요했는가
3  작업 내용  실제로 한 일 (순서 목록)
4  사용 자재  자재 · 규격/재질 표 (규격 미기재는 "기재 없음")
5  시공 사진  시공 전 / 시공 중 / 시공 후 (역할 태그 + 썸네일 → 원본 링크)
   제품 이미지 (있으면) — "현장 촬영 사진이 아닙니다" 명시
6  결과      무엇이 해결되었는가

관련 서비스 | 관련 제품·자재 | 관련 자료     ← 3열 카드
비슷한 시공사례                              ← relatedCases 카드
자주 묻는 질문                               ← FAQPage
CTA: 비슷한 현장이신가요? → 견적 문의 / 전화
← 시공사례 목록으로
```

### 메타

- `title` = `seo.title` (60자 이내, 사이트 전체 유일)
- `description` = `seo.description` (70~160자, 사이트 전체 유일)
- `og:type=article`, `og:image` = 대표컷 (도메인 확정 후)
- JSON-LD: `Article` + `BreadcrumbList` + `FAQPage` + 공통 엔티티 그래프

### 금지

- 실제 사실과 다른 지역·기관·작업을 SEO 목적으로 생성 — **`check-cases.js` 는 막을 수 없으므로 규칙으로 강제**
  (`docs/RAW_TO_CASE_PIPELINE.md` §3 재작성 규칙)
- 확인되지 않은 날짜·수량·규격 표기 → `null`

---

## 6. Technical SEO 검증 결과

```
$ node tools/check-cases.js
사례 데이터 검증 — 전체 9건 / 발행 8건
문제 없음

$ node tools/check-site.js
기술 SEO 검증 — HTML 25장
문제 없음
```

| 항목 | 결과 |
| --- | --- |
| semantic HTML | ✅ `<header> <nav> <main> <section> <footer>`, skip link, `aria-current` |
| unique title | ✅ 25/25 유일 |
| unique meta description | ✅ 25/25 유일, 70~160자 |
| one logical H1 | ✅ 25/25 정확히 1개 |
| canonical 준비 | ✅ 도메인 확정 시 자동 생성 · **확정 전에는 미생성**(임의 도메인 금지) |
| robots.txt | ✅ 생성 (Yeti 포함), Sitemap 줄은 도메인 확정 시 자동 |
| sitemap.xml generation | ✅ 로직 구현 · 도메인 확정 시 자동 생성 |
| Open Graph | ✅ type·title·description·site_name·locale 전 페이지 / url·image 는 도메인 확정 후 |
| image alt | ✅ 전 이미지 (사례 사진은 `<제목> 시공 전 N` 형식 자동 생성) |
| image dimensions | ✅ 전 이미지 `width`/`height` — CLS 0 |
| lazy loading | ✅ 전 이미지 `loading="lazy" decoding="async"` |
| mobile performance | ✅ 웹폰트 0 · **JS 16KB**(목록 페이지만 23KB) · CSS 20KB · 목록은 썸네일(w773) |
| Core Web Vitals | LCP = 히어로 텍스트(이미지 없음) / CLS = `aspect-ratio` + `width/height` 로 0 / INP = 스크립트 최소 |

### 사례 데이터 분리 (`cases-index.js`)

`cases.js` 는 본문·FAQ·자재까지 담고 있어 사례가 늘수록 커집니다(현재 39KB).
이것을 전 페이지에 실으면 100건 시점에 수백 KB 가 됩니다.

→ 빌드가 **목록에 필요한 필드만** 뽑아 `assets/js/cases-index.js` 로 내보내고,
**`cases.html` 에서만** 읽습니다. 다른 페이지는 카드가 이미 정적 HTML 이라 데이터가 필요 없습니다.

| 페이지 | 로드하는 JS | 크기 |
| --- | --- | --- |
| 홈 · 서비스 · 사례상세 · 자료실 · 문의 | `config.js` + `main.js` | **16KB** |
| `cases.html` | + `cases-index.js` | **23KB** |

정렬은 빌드 시점에 이미 적용해 두므로 브라우저는 정렬 연산을 하지 않습니다.
| clean static URLs | ✅ `/service/<slug>.html`, `/case/<번호>-<slug>.html` — 쿼리 렌더 없음 |
| breadcrumb | ✅ 화면 + `BreadcrumbList` JSON-LD |
| internal links | ✅ 깨진 링크 0 · 고립 페이지 0 |
| 404 handling | ✅ `404.html` + 주요 경로 안내 |
| no broken links | ✅ 내부 링크·앵커 전수 검사 통과 |
| 외부 링크 | ✅ 전부 `rel="noopener noreferrer"` |
| 금지 표현 | ✅ 전국 시공·출장·배송 / 1위·최고·최저가 0건 |
| 브랜드 표기 | ✅ 변형 표기(아인안전시설·제주안전·아인세이프티) 0건 |
| 개인정보 | ✅ 개인 휴대폰번호 패턴 0건 (007 원문의 번호는 반입하지 않음) |

---

## 7. Content Expansion Method

### 사례 10 → 30 → 50 → 100+

구조를 바꾸지 않고 늘어납니다.

| 늘어나는 것 | 그대로인 것 |
| --- | --- |
| `cases.js` 항목 수 | 스키마 · 정렬 규칙 · 카드/상세 템플릿 |
| `assets/images/cases/NNN/` | 이미지 경로·썸네일 규칙 |
| `case/*.html` 생성물 | 빌드·검증 명령 |
| 필터 칩의 건수 | 필터 축 (분야·발주처·작업·지역) |

절차는 [RAW_TO_CASE_PIPELINE.md](RAW_TO_CASE_PIPELINE.md) 한 장에 있습니다.
**사람이 Raw 를 미리 정리하지 않습니다.**

### 시설별 Guide 확장

각 가이드는 **연결할 실제 사례가 있을 때** 만듭니다. 근거 없는 문서는 만들지 않습니다.

| 가이드 | 상태 | 근거 사례 |
| --- | --- | --- |
| 시선유도봉·차선규제봉 설치 기준 | ✅ 작성됨 | 001 · 003 · 008 |
| 스텐 자바라 대문 시공 공정 | ✅ 작성됨 | 005 |
| 제주 해풍 환경 금속 재질 선정 | ✅ 작성됨 | 005 |
| 출차주의등 감지 방식 선택 | 대기 | 006 (사례 1건 — 2건 이상 쌓이면) |
| 배수로 그레이팅 규격 실측 | 대기 | 004 |
| 경계석·포장 복구 절차 | 대기 | 009 |
| 안전난간 / 볼라드 / 안전망 | 대기 | **실적 없음 — 사례가 생긴 뒤 작성** |

가이드 추가 = `guides.js` 항목 1개 + `guide-copy.js` 본문 1개 → `build.js`.
목록·상세·내부 링크·JSON-LD 는 자동입니다.

### 새 서비스 분야가 필요해지면

`services.js` 에 항목 추가 → `content/service-copy.js` 에 본문 추가 → 빌드.
**페이지를 손으로 만들지 않습니다.**

---

## 8. Measurement 준비

MVP 에서 analytics 시스템을 만들지 않습니다. 대신 붙일 자리를 비워 둡니다.

| 항목 | 상태 |
| --- | --- |
| Google Search Console | 도메인 확정 후 소유권 확인 파일 또는 DNS TXT |
| 네이버 서치어드바이저 | 도메인 확정 후 소유권 확인 HTML 파일을 루트에 추가 |
| sitemap submission | `siteUrl` 채우고 빌드 → `sitemap.xml` 생성 → 양쪽에 제출 |
| indexed pages / queries / impressions / clicks / CTR / landing pages | 두 콘솔의 기본 리포트로 확인 |
| 태그 스크립트 | 필요해지면 `tools/lib/layout.js` 의 `</head>` 직전 한 곳에 추가 → 전 페이지 반영 |

> 랜딩페이지 리포트가 의미를 가지려면 **페이지가 검색 의도별로 분리되어 있어야** 합니다.
> 이 사이트는 사례마다 독립 URL 을 갖기 때문에, 어떤 시설·지역·작업의 검색이
> 실제 문의로 이어지는지 사례 단위로 읽을 수 있습니다.

---

## 9. Flywheel

```
Real Jeju Problem     실제 제주 현장의 안전 문제
   → Real Work        실제로 해결 (설치·교체·보수·납품)
   → Structured Case  Raw → AI 구조화 → case/*.html (검색 랜딩페이지)
   → Search Exposure  지역+시설+작업 롱테일 노출
   → Brand Authority  '제주 + 안전시설 = 제주안전시설'
   → Inquiry          현장 견적 / 자재 납품 문의
   → Real Work …
```

이 회전을 막는 것은 두 가지뿐입니다.

1. **사례를 쌓는 비용** → 파이프라인으로 낮췄습니다 (Raw 투입 → AI 구조화 → 검증 → 빌드)
2. **가짜 콘텐츠의 유혹** → 규칙과 검증 스크립트로 막았습니다
   (없는 지역·날짜·규격 금지, 전국 표현 금지, 장식용 FAQ 금지, 근거 없는 최상급 금지)

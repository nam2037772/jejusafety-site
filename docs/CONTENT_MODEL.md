# CONTENT_MODEL.md — 제주안전시설

> **최종 반영본** — Obsidian Raw 001~010 실제 자료에 맞춰 스키마를 조정했습니다 (2026-08-27).
> 원본 → 발행 데이터로 가는 절차는 [RAW_TO_CASE_PIPELINE.md](RAW_TO_CASE_PIPELINE.md) 를 보세요.

이 사이트의 자산은 **사례(case)** 입니다. 나머지 데이터 모델은 사례를 잘 쌓기 위해 존재합니다.
목표: **사례 1건 추가 = 데이터 1건 + 사진 폴더 1개.** 그 이상 손이 가면 사례가 안 쌓입니다.

---

## 1. 데이터 흐름

```
Obsidian Raw (읽기 전용)  ──tools/import-raw.js──▶  data/raw-extract/*.json
                                                    assets/images/cases/NNN/
                                                            │  AI 가 사실 추출·재작성
                                                            ▼
assets/js/config.js     회사·연락처·영업지역·siteUrl
assets/js/services.js   서비스 5종 메타 + enum(고객유형·작업유형·지역)
assets/js/cases.js      ★ 사례 원본 (단일 진실원)
assets/js/guides.js     가이드 메타
content/pages.js        정적 페이지 본문
content/service-copy.js 서비스 5장 본문
content/guide-copy.js   가이드 본문
        │
        └── node tools/build.js ──▶ *.html (25장) + robots.txt + sitemap.xml
                                     tools/lib/layout.js 가 head·헤더·푸터·JSON-LD 를 붙임
```

- **사람이 편집하는 파일은 위 7개뿐**입니다. `*.html` 은 전부 생성물입니다.
- 골격을 한 곳(`tools/lib/layout.js`)에서 만들기 때문에, 페이지가 몇 장이 되든
  브랜드 표기·엔티티 관계·canonical 규칙이 어긋날 수 없습니다.
- 원본을 JSON 이 아니라 JS 로 두는 이유: 정적 페이지에서 `fetch` 없이 `<script>` 한 줄로 읽히고,
  주석을 달 수 있으며, Node 도구에서 `require` 로 그대로 씁니다.

## 2. Case 스키마

### 2-1. 필드 정의

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | number | ✅ | 3자리 일련번호. **재사용 금지** |
| `slug` | string | ✅ | 영문 kebab-case. URL 확정 후 **변경 금지** |
| `title` | string | ✅ | H1 이자 목록 제목. **사람이 실제로 검색하는 표현**으로 |
| `date` | `YYYY-MM` \| `YYYY-MM-DD` \| `null` | | 시공 시기. **원문에 없으면 null** (사진 촬영일 힌트는 주석으로만) |
| `region` | `'제주시'` \| `'서귀포시'` \| `null` | | 원문에 없으면 null. 지역 필터에서 빠집니다 |
| `regionDetail` | string \| null | | 읍면동·현장 성격. 공개 가능한 범위만 |
| `facilityType` | string | ✅ | 시설명 — 검색어의 핵심 |
| `customerType` | enum \| `null` | | 발주처 유형 (2-3). 원문에 없으면 null |
| `customerName` | string \| null | | 발주처 실명. 공개 가능할 때만. 쓰면 `review.notes` 에 근거 필수 |
| `customerLabel` | string \| null | | 화면 표기용 익명 라벨 (예: `제주 소재 초등학교`) |
| `primaryService` | enum(slug) | ✅ | 주 서비스 분야 1개 (2-2) |
| `relatedServices` | slug[] | | 부 분야 — 교차 노출·내부 링크용 |
| `workType` | enum[] | ✅ | `설치` \| `교체` \| `보수` \| `개선` \| `납품` |
| `problem` | string | ✅ | 현장에서 무엇이 위험했는가 |
| `purpose` | string | ✅ | 설치·보수의 **목적** |
| `work` | string[] | ✅ | 실제로 한 일. 순서대로 |
| `materials` | `{name, spec}[]` | | `spec` 은 원문에 있을 때만. 없으면 `null` |
| `quantity` / `duration` | string \| null | | 원문에 없으면 null |
| `result` | string | ✅ | 무엇이 해결되었는가 |
| `images` | object | ✅ | 2-4 참조 |
| `relatedProducts` | string[] | | `products.html` 앵커 id (`traffic` `school` `pedestrian` `maintenance` `metal`) |
| `relatedGuides` | slug[] | | 가이드 slug |
| `relatedCases` | id[] | | 비슷한 사례 — 내부 링크의 핵심 |
| `faq` | `{q,a}[]` | | 이 사례를 보고 실제로 묻는 질문. FAQPage JSON-LD 원본 |
| `tags` | string[] | | 검색·필터용 키워드 |
| `seo` | `{title, description}` | ✅ | title 60자 / description 70~160자 |
| `sourceRef` | string | ✅ | 원본 Raw 노트 경로 (읽기 전용 역추적) |
| `review` | `{disclosure, notes}` | | `disclosure: '확인필요'` 면 **빌드에서 자동 제외** |
| `featured` | boolean | | 대표사례 — 목록 정렬 1순위 |
| `published` | boolean | ✅ | `false` 면 빌드에서 제외 |

> **필수에서 뺀 것 (실제 자료 반영):** `date` · `region` · `customerType`.
> Raw 10건 중 시공일이 적힌 건이 0건, 지역이 적힌 건이 2건뿐이었습니다.
> 확인되지 않은 값을 필수로 두면 결국 지어내게 됩니다.

### 2-2. `service` — 서비스 분야 (5, 고정)

`road-traffic` · `school-child` · `pedestrian-life` · `public-maintenance` · `metal-fabrication`

### 2-3. `customerType` — 발주처 유형 (8, 고정)

`관공서` · `학교` · `공공기관` · `공기업` · `공공주차장` · `공원·체육시설` · `공동주택` · `사업장`

> 이 값은 **필터 배지**로 노출됩니다. 담당자가 "우리와 같은 유형의 발주처 사례"를 찾는 경로입니다.
> 자유 문자열로 두면 표기가 갈려 필터가 무너지므로 enum으로 고정하고, `check-cases.js` 가 검증합니다.

### 2-4. `images`

```js
images: {
  representative: 'after-01.jpg',                    // 목록 카드 대표컷
  before:  ['before-01.jpg'],                        // 시공 전
  process: ['process-01.jpg', 'process-02.jpg'],     // 시공 중
  after:   ['after-01.jpg', 'after-02.jpg'],         // 시공 후
  product: ['product-01.png']                        // 제품 이미지 (현장 실사 아님)
}
```

- 실제 경로: **`assets/images/cases/<번호 3자리>/<파일명>`** — 폴더는 번호만 씁니다.
  slug 이 바뀌어도 폴더를 옮길 필요가 없습니다.
- 파일명 규칙: `before-01` `process-01` `after-01` `product-01` (2자리 0패딩).
  같은 이름에 `-thumb` 이 붙은 파일이 **목록 카드용 축소본**입니다 (`import-raw.js --thumbs` 가 만듭니다).
- `alt` 는 빌드가 자동 생성: `<title> 시공 전 1` 형식.
- **`product` 는 현장 사진과 분리됩니다.** 사례 상세에서 별도 블록으로 나오고
  "제품 설명용 이미지입니다. 현장 촬영 사진이 아닙니다." 문구가 붙습니다.
  AI 생성 삽화·카탈로그 이미지가 현장 기록과 섞이지 않게 하려는 것입니다.
- 사진이 없으면 자리를 비웁니다. **스톡 이미지·타사 사진 사용 금지.**

### 2-5. 목록 정렬

```
1순위  featured (대표사례)
2순위  최신순 (date 없는 사례는 뒤로)
보조   시공 전 사진 보유 → 동점 구간에서만 앞으로 (BEFORE_PHOTO_WEIGHT = 0.5)
```

`before` 사진 유무는 **하드 정렬 키가 아니라 가중치**입니다.
비교 가능한 기록을 조금 우대할 뿐, 대표사례·최신순을 뒤집지 않습니다.

목록 상단에는 **발주처 유형 필터 칩**(건수 표시)을 두어 관공서·학교·공공기관 등
대표 고객군별 사례가 바로 보이게 합니다.

### 2-6. `seo`

`seo.title` / `seo.description` 은 **직접 씁니다.** 자동 생성에 기대지 않습니다 —
사례마다 검색 의도가 다르고, 자동 문장은 서로 비슷해져 중복 판정 위험이 있습니다.

`check-cases.js` 가 다음을 막습니다.

- 누락 / 사례 간 중복
- title 60자 초과, description 160자 초과 또는 70자 미만

---

## 3. Service 스키마

메타는 `assets/js/services.js`, 본문은 `content/service-copy.js` 로 나눕니다.

| 파일 | 담는 것 |
| --- | --- |
| `services.js` | `slug` `name` `h1` `summary` `facilities[]` `productAnchor` `keywords{primary,secondary[]}` `faq[]` — **다른 페이지가 참조하는 값** |
| `service-copy.js` | `lead` `problems[]` `facilities[{name,spec,use,hasCase}]` `process[[제목,설명]]` `supplyNote` + 분야별 추가 블록(`materialNote` / `judgeTable`) — **문장** |

`facilities[].hasCase` 가 `true` 이면 규격표에 **"시공사례 있음"** 배지가 붙습니다.
실제로 해본 일과 대응 가능한 일을 화면에서 구분하기 위한 값입니다.

또한 `services.js` 는 사이트 전체가 쓰는 **enum 3종**을 함께 정의합니다 —
`CUSTOMER_TYPES`(9) · `WORK_TYPES`(5) · `REGIONS`(2).

---

## 4. Guide 스키마

| 파일 | 담는 것 |
| --- | --- |
| `guides.js` | `slug` `title` `summary` `service` `relatedCases[]` `relatedProducts[]` `faq[]` `seo{}` |
| `guide-copy.js` | 본문 HTML |

> 가이드는 **연결할 실제 사례가 있을 때만** 씁니다.
> 근거 없는 문서는 검색에도 사람에게도 도움이 되지 않습니다.

---

## 5. Config 스키마 (`config.js`)

```
COMPANY           brand '제주안전시설' / operator '(주)아인산업안전' / legalName /
                  relationSentence / tel / email / address / areaServed[] /
                  businessNumber / representative / storeUrl / siteUrl / knowsAbout[]
EXTERNAL_LINKS    shop(ainsafety.com) · blog
CONTACT_CHANNELS  phone · sms · email · kakao(빈값) · externalForm(빈값)
INQUIRY_TYPES     site · quote · install · supply
```

원칙:

- **전화번호·주소·도메인이 바뀌면 이 파일 한 곳만 고칩니다.** 헤더·푸터·CTA·JSON-LD 가 모두 여기서 나옵니다.
- 확인되지 않은 값(위경도, 영업시간)은 **비워 둡니다.** 빈 값이면 화면·JSON-LD 양쪽에서 자동으로 빠집니다.
- `siteUrl` 이 비어 있으면 **canonical·og:url·sitemap.xml 을 만들지 않습니다.** 임의 도메인 금지.
- `config.js` 는 브라우저가 그대로 내려받는 공개 파일입니다. 표시 의무가 없는 값은 넣지 않습니다.
- `areaServed` 에 제주 외 지역을 넣지 않습니다. `check-site.js` 가 검사합니다.

### 향후 사진 첨부형 견적문의 폼

`main.js` 는 입력을 모으는 `buildInquiry()` 와 보내는 `sendInquiry()` 를 분리해 두었습니다.
`CONTACT_CHANNELS.externalForm` 에 네이버폼·구글폼 주소가 들어오면 문의 CTA 가 그 폼으로 전환됩니다.
**폼 도입 시 고칠 곳은 config 한 줄과 `sendInquiry()` 한 함수뿐입니다.**

---

## 6. 사례 추가 작업 흐름

```
1) node tools/import-raw.js --write --download --thumbs
   → data/raw-extract/<번호>.json + assets/images/cases/<번호>/

2) 사진 역할이 애매하면 사진을 보고 data/case-roles.json 에 근거와 함께 고정 → 1) 재실행

3) AI 가 docs/RAW_TO_CASE_PIPELINE.md 규칙으로 assets/js/cases.js 에 항목 추가
   (problem → purpose → work → result 로 재작성. 원문 문장 복사 금지)

4) node tools/check-cases.js     데이터 검증
   node tools/build.js           HTML·robots·sitemap 생성
   node tools/check-site.js      기술 SEO 검증

5) 커밋 · 배포
```

---

## 7. 검증 규칙

### `check-cases.js`

| 검사 | 실패 조건 |
| --- | --- |
| 필수 필드 | `id` `slug` `title` `facilityType` `primaryService` `workType` `problem` `purpose` `work` `result` `images` `seo` `sourceRef` `published` 누락 |
| enum | `region` / `customerType` / `workType` / `primaryService` / `relatedServices` 가 정의 목록 밖 |
| slug · id | 중복, 또는 소문자·숫자·하이픈 외 문자 |
| 이미지 | 데이터가 가리키는 파일이 실제로 없음 (썸네일 없음은 경고) |
| 참조 무결성 | 없는 가이드·사례·제품 앵커를 가리킴, 자기 자신 참조 |
| 발주처 실명 | `customerName` 이 있는데 `review.notes` 에 근거 없음 (경고) |
| 공개 검토 | `review.disclosure === '확인필요'` 인데 `published:true` (경고 + 빌드 제외) |
| SEO | title/description 누락·중복·길이 |
| 고립 | 어느 사례·가이드도 이 사례를 참조하지 않음 (경고) |

### `check-site.js`

| 검사 | 내용 |
| --- | --- |
| 구조 | `lang="ko"` · charset · viewport · `<main>` · **H1 정확히 1개** |
| 메타 | title·description 존재·**사이트 전체 유일**·길이 |
| canonical | 도메인 있으면 필수, 없으면 **있으면 오류** (임의 도메인 방지) |
| Open Graph | `og:type` `og:title` `og:description` `og:site_name` |
| JSON-LD | 파싱 가능 · `#brand` / `#operator` 노드 존재 · `parentOrganization` 관계 · areaServed 에 '전국' 없음 |
| 이미지 | `alt` 필수, `width`/`height` (CLS), `loading` |
| 링크 | 내부 링크 실재 · 앵커 실재 · 외부 링크 `rel="noopener noreferrer"` · **고립 페이지** |
| 표현 | 전국 시공·출장·설치·배송, 1위/No.1/최저가/업계 최고 |
| 브랜드 | `아인안전시설` `아인세이프티` `제주안전`(단독) 등 변형 표기 |
| 연락처 | 대표전화 표기 일치 · **개인 휴대폰번호 패턴 검출** |

---

## 8. 확장 여지 (지금은 만들지 않음)

MVP에서 **구현하지 않되, 구조가 막지는 않는** 항목입니다.

| 항목 | 지금 하는 준비 |
| --- | --- |
| 지역별 랜딩 페이지 | `region` / `regionDetail` 을 처음부터 구조화해 둠 |
| 발주처 유형별 랜딩 | `customerType` enum 고정 |
| 사례 → 제품 연동 강화 | `relatedProducts` 앵커 id 유지 |
| 헤드리스 CMS 이전 | `cases.js` 가 순수 데이터 배열이라 JSON 직렬화만 하면 이전 가능 |
| 다국어 | 미준비. 필요해지면 별도 디렉터리 분기 |

---

## 9. 콘텐츠 작성 규칙

- **지어내지 않습니다.** 규격·수량·기간·발주처는 확인된 값만. 모르면 필드를 비웁니다
- 발주처 실명은 공개 동의가 있을 때만. 없으면 `customerType` + `region` 까지만 (`제주시 공공기관`)
- 사진에 차량번호·인물·명패가 찍히면 가리고 올립니다
- 제목에 `최고` `1위` `최저가` 를 쓰지 않습니다 (공공 발주처 대상 감점 요소이자 표시광고법 위험)
- `problem` 은 **발주 담당자가 겪은 말**로 씁니다. 공법 설명이 아니라 현장 상황 서술
- 한 사례에 한 시설. 시설이 여러 개면 사례를 나눕니다 (검색 대응 단위가 시설이기 때문)

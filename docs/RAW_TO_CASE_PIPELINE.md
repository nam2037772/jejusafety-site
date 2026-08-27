# RAW_TO_CASE_PIPELINE.md — 비정형 원본을 발행 사례로

> **Obsidian Raw = Source of Truth (원본 증거)**
> **Website Case DB = Published Structured Data (발행 구조 데이터)**
>
> 두 층은 절대 섞이지 않습니다. Raw 는 블로그 원문·현장 메모·사진이 들어오는 대로 쌓이는 자리이고,
> 사이트는 거기서 **사실만 뽑아 재작성한** 데이터로 만들어집니다.
> **사람이 Raw 를 미리 정리해야 하는 구조를 만들지 않습니다.**

---

## 1. 층 구분

```
┌─ Obsidian Vault (READ ONLY) ────────────────────────────────┐
│  Raw/04. 안전시설/안전시설-0NN.md                            │
│  · 블로그 원문을 거의 그대로 붙여넣은 비정형 텍스트           │
│  · 현장 메모, 사진 링크, 홍보 문장이 섞여 있음                │
│  · 구조도 제목 체계도 사이트와 무관                           │
│  ※ 수정·이동·삭제·리네임 금지                                │
└──────────────────────────────────────────────────────────────┘
            │  ① 기계적 추출 (스크립트)
            ▼
   data/raw-extract/0NN.json        ← 발행물이 아님. AI 가 읽을 원자료
   assets/images/cases/0NN/         ← 사이트 전용 이미지 사본 (리네임됨)
            │  ② 사실 추출 · 구조화 · 재작성 (AI)
            ▼
   assets/js/cases.js               ← 발행 정본
            │  ③ 검증 → 생성
            ▼
   case/0NN-<slug>.html             ← 검색 랜딩페이지
```

---

## 2. ① 기계적 추출 — `tools/import-raw.js`

스크립트는 **원문을 해석하지 않습니다.** 기계가 확실히 아는 것만 꺼냅니다.

```bash
node tools/import-raw.js                              # 미리보기
node tools/import-raw.js --write                      # 추출물 JSON 저장
node tools/import-raw.js --write --download --thumbs  # 이미지 사본까지
node tools/import-raw.js --vault="D:\경로\에릭_vault"  # 경로 지정
```

꺼내는 것: frontmatter · 이미지 URL과 등장 순서 · 섹션 마커로 판정한 역할 ·
파일명에 박힌 촬영일 힌트 · 이미지를 걷어낸 본문 평문.

### 안전장치

| 장치 | 내용 |
| --- | --- |
| **vault 쓰기 금지** | `assertOutsideVault()` — 쓰기 대상이 vault 안이면 그 자리에서 종료 |
| **원본 파일명 폐기** | 저장 시 `before-01.jpg` 형식으로 리네임 → 파일명에 든 기관·학교 실명이 사이트에 남지 않습니다 |
| **역할 보수적 판정** | 마커가 없으면 전부 `process`. **추측으로 before/after 를 붙이지 않습니다** |
| **중복 방지** | 이미 받은 파일은 건너뜁니다 (`--force` 로 재수신) |

### 이미지 역할 확정 — `data/case-roles.json`

자동 판정이 닿지 않는 사례는 **사진을 실제로 확인한 뒤** 이 파일에 역할을 고정합니다.
등장 순서(1-based) 기준이며, `_why` 에 판정 근거를 남깁니다. `drop` 은 같은 사진의 중복 게시본입니다.

```json
"006": {
  "_why": "본문 서술 순서와 사진 일치. idx1·2 = 시공 전 진출입로, idx11·12 = 설치 완료 (사진 확인함).",
  "before": [1, 2], "after": [11, 12]
}
```

> 이 판정은 스크립트가 아니라 **사람/AI 의 판단**이므로 코드가 아닌 데이터로 분리해 둡니다.

---

## 3. ② 구조화 — AI 가 하는 일

`data/raw-extract/0NN.json` 을 읽고 `assets/js/cases.js` 에 항목 하나를 씁니다.
**이 단계가 이 파이프라인의 핵심이고, 사람이 Raw 를 손보지 않아도 되는 이유입니다.**

### 재작성 규칙 (그대로 따를 것)

1. **블로그 문장을 복사하지 않습니다.** 사실만 보존하고 문장은 새로 씁니다.
   - 인사말("안녕하세요 아인산업안전입니다"), 홍보 마무리, 이모지, 해시태그는 버립니다.
   - 개인 연락처·타사 연락처는 옮기지 않습니다. 연락은 대표번호 하나입니다.
2. **흐름은 항상 `problem → purpose → work → result`.**
   - `problem` 은 발주 담당자가 겪은 현장 상황으로 씁니다. 공법 설명이 아닙니다.
   - `work` 는 실제로 한 일을 순서대로. 없는 공정을 채우지 않습니다.
   - `result` 는 무엇이 해결되었는가. "최선을 다하겠습니다" 류는 결과가 아닙니다.
3. **원문에 없는 사실은 만들지 않습니다.**

   | 상황 | 처리 |
   | --- | --- |
   | 기관명이 불명확 | `customerType: '공공기관'`, `customerName: null` |
   | 학교 이름 공개가 불확실 | `customerLabel: '제주시 소재 학교'` (지역이 확인된 범위까지만) |
   | 정확한 날짜가 없음 | `date: null` — 사진 촬영일 힌트는 **주석으로만** 남깁니다 |
   | 자재 규격이 없음 | `spec: null` |
   | 수량·기간이 없음 | `quantity: null`, `duration: null` |

4. **제목(H1)은 사람이 실제로 검색하는 표현으로.**
   `지역 + 고객유형 + 시설명 + 작업` 형태가 기본입니다.
   확인되지 않은 지역·기관을 SEO 목적으로 붙이지 않습니다.
   - ○ `서귀포시 로터리 차선규제봉 교체`
   - ○ `제주 진출입로 출차주의등 설치 (미러센서·경광등)`
   - ✗ `제주시 ○○초등학교 안전시설 시공` (원문에 없는 지역·기관)
5. **분류는 5개 taxonomy 로.** `primaryService` 하나를 정하고 나머지는 `relatedServices`.
   기준은 "검색하는 사람이 어느 시설을 떠올리는가" 입니다.
6. **연결을 반드시 채웁니다.** `relatedServices` · `relatedProducts` · `relatedGuides` · `relatedCases`.
   고립된 사례 페이지를 만들지 않습니다.
7. **FAQ 는 이 사례를 보고 실제로 묻는 질문만.** 장식용 FAQ 를 만들지 않습니다.
8. **공개 검토가 필요하면 표시합니다.**
   ```js
   review: { disclosure: '확인필요', notes: '사진 배경에 제3자 상호·전화번호 노출' },
   published: false
   ```
   `disclosure: '확인필요'` 이면 `published` 값과 무관하게 빌드에서 제외됩니다.

### AI 에게 줄 프롬프트 (그대로 복사해서 사용)

```
data/raw-extract/0NN.json 을 읽고 assets/js/cases.js 에 사례 1건을 추가해 줘.

· docs/RAW_TO_CASE_PIPELINE.md 의 재작성 규칙을 따를 것
· 블로그 문장을 복사하지 말고 problem → purpose → work → result 로 새로 쓸 것
· 원문에 없는 사실(날짜·규격·수량·기관명·지역)은 null 로 둘 것
· 5개 서비스 taxonomy 로 분류하고 relatedServices/Products/Guides/Cases 를 채울 것
· 사진 역할이 불명확하면 data/case-roles.json 에 근거와 함께 고정할 것
· 마지막에 node tools/check-cases.js 와 node tools/build.js 를 실행할 것
```

---

## 4. ③ 검증 · 생성

```bash
node tools/check-cases.js   # 필수 필드·enum·slug 중복·이미지 존재·참조 무결성·공개 검토
node tools/build.js         # case/*.html · service/*.html · guide/*.html · robots · sitemap
node tools/check-site.js    # H1·title·description·링크·이미지·금지표현·브랜드 표기
```

셋 다 통과해야 배포합니다. `check-cases.js` 와 `check-site.js` 는 오류가 있으면 종료코드 1 을 냅니다.

---

## 5. 새 자료가 Raw 에 들어왔을 때

Raw 에 무엇이 들어오든(블로그 원문, 현장 메모, 사진만 있는 노트) 절차는 같습니다.

```
1) node tools/import-raw.js --write --download --thumbs
2) data/raw-extract/<번호>.json 확인 — 사진 역할이 애매하면 사진을 직접 보고
   data/case-roles.json 에 근거와 함께 고정한 뒤 1) 을 다시 실행
3) AI 가 §3 규칙으로 assets/js/cases.js 에 항목 추가
4) node tools/check-cases.js  →  node tools/build.js  →  node tools/check-site.js
5) 커밋 · 배포
```

**사람이 Raw 를 미리 정리하지 않습니다.** 정리는 ①(기계) 과 ②(AI) 가 합니다.
사람이 개입하는 곳은 딱 두 군데입니다 — **사진 역할 확인**과 **공개 여부 판단**.

### 사례가 100건이 되어도 바뀌지 않는 것

| 늘어나는 것 | 그대로인 것 |
| --- | --- |
| `cases.js` 의 항목 수 | 스키마, 정렬 규칙, 카드·상세 템플릿 |
| `assets/images/cases/NNN/` 폴더 수 | 이미지 경로 규칙, 썸네일 규칙 |
| `case/*.html` 생성물 수 | 빌드 명령, 검증 명령 |
| 목록 필터의 건수 표시 | 필터 축 (분야·발주처·작업·지역) |

새 분야가 필요해지면 `services.js` 에 항목을 더하고 `content/service-copy.js` 에 본문을 씁니다.
새 시설 가이드가 필요하면 `guides.js` + `content/guide-copy.js` 에 더합니다.
**어느 경우에도 페이지를 손으로 만들지 않습니다.**

---

## 6. Raw 원본을 건드리지 않았다는 확인

```bash
# 파일 목록·크기·수정시각이 그대로인지
ls -la "$VAULT/Raw/04. 안전시설"
```

`import-raw.js` 는 vault 안에 어떤 파일도 쓰지 않습니다. 쓰려는 코드가 들어오면
`assertOutsideVault()` 가 경로를 검사해 프로세스를 종료시킵니다.
이미지도 vault 안 파일이 아니라 원문에 적힌 외부 주소에서 사본을 내려받습니다.

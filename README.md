# 제주안전시설 — 웹사이트

**브랜드** 제주안전시설 · **운영회사** (주)아인산업안전
제주특별자치도 내 안전시설 **설치·교체·보수** 와 **안전시설·안전자재 납품**.

프레임워크·번들러·서버·DB 없이 **HTML + CSS + Vanilla JS** 로 동작합니다.
Node 스크립트 하나가 데이터에서 HTML 을 만듭니다. 외부 의존성 0 — `npm install` 이 필요 없습니다.

---

## 빠르게 시작

```bash
node tools/build.js          # 데이터 → HTML 생성
python -m http.server 8777   # http://localhost:8777
```

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `node tools/import-raw.js --write --download --thumbs` | Obsidian Raw(**읽기 전용**) → `data/raw-extract/` + 이미지 사본 |
| `node tools/check-cases.js` | 사례 데이터 검증 (필수 필드·enum·이미지·참조 무결성·공개 검토) |
| `node tools/build.js` | HTML 25장 + `robots.txt` + `sitemap.xml` 생성 |
| `node tools/check-site.js` | 기술 SEO 검증 (H1·title·description·링크·이미지·금지표현·브랜드 표기) |

배포 전에는 **`check-cases` → `build` → `check-site`** 순으로 셋 다 통과해야 합니다.

---

## 고칠 파일은 어디인가

| 하고 싶은 일 | 고칠 파일 |
| --- | --- |
| 전화·주소·쇼핑몰·**도메인** 변경 | `assets/js/config.js` ← **제일 먼저 보는 파일** |
| 시공사례 추가·수정 | `assets/js/cases.js` (+ `assets/images/cases/<번호>/`) |
| 서비스 분야 문장 수정 | `content/service-copy.js` |
| 홈·문의 등 정적 페이지 문장 | `content/pages.js` |
| 자료실 글 추가 | `assets/js/guides.js` + `content/guide-copy.js` |
| 헤더·푸터·JSON-LD 골격 | `tools/lib/layout.js` |

**`*.html` 과 `assets/js/cases-index.js` 는 전부 생성물입니다.** 직접 고치면 다음 빌드에 사라집니다.

---

## 사례를 늘리는 방법

```
Obsidian Raw (비정형 원본)
   → tools/import-raw.js         기계적 사실 추출 + 이미지 사본
   → AI 가 재작성                 problem → purpose → work → result
   → assets/js/cases.js          발행 정본
   → tools/build.js              case/<번호>-<slug>.html (검색 랜딩페이지)
```

절차와 재작성 규칙: **[docs/RAW_TO_CASE_PIPELINE.md](docs/RAW_TO_CASE_PIPELINE.md)**
사람이 Raw 를 미리 정리하지 않습니다. 사람이 개입하는 곳은 **사진 역할 확인**과 **공개 여부 판단** 둘뿐입니다.

> ⚠️ **Obsidian vault 는 읽기 전용입니다.** `import-raw.js` 는 vault 안에 아무것도 쓰지 않으며,
> 쓰려는 시도가 있으면 `assertOutsideVault()` 가 프로세스를 종료시킵니다.

---

## 도메인이 정해지면

1. `assets/js/config.js` 의 `siteUrl` 한 줄을 채웁니다
2. 저장소 루트에 같은 값으로 `CNAME` 파일을 만듭니다
3. `node tools/build.js` 재실행 → canonical · og:url · `sitemap.xml` 이 자동 생성됩니다
4. Google Search Console · 네이버 서치어드바이저에 사이트와 `sitemap.xml` 제출

**도메인 확정 전에는 canonical·og:url·sitemap 을 만들지 않습니다.**
임의의 placeholder 도메인으로 정본 주소가 색인되면 되돌리는 비용이 큽니다.

---

## 문서

| 문서 | 내용 |
| --- | --- |
| [BRAND_POSITIONING.md](docs/BRAND_POSITIONING.md) | 브랜드 정의·고객·영업 지역·메시지·금지 표현 |
| [SITE_MAP.md](docs/SITE_MAP.md) | 사이트맵·서비스 분류·페이지 구조·URL·SEO 매핑·저장소 구조 |
| [CONTENT_MODEL.md](docs/CONTENT_MODEL.md) | 데이터 스키마·정렬·검증 규칙 |
| [RAW_TO_CASE_PIPELINE.md](docs/RAW_TO_CASE_PIPELINE.md) | 비정형 원본 → 발행 사례 파이프라인 |
| [SEO_ARCHITECTURE.md](docs/SEO_ARCHITECTURE.md) | SEO·AEO 구조, 내부 링크 맵, 구조화데이터, 검증 결과, 확장 방법 |
| [CASE_IMPORT_AUDIT.md](docs/CASE_IMPORT_AUDIT.md) | 초기 사례 10건 분석·반입 결과·남은 확인 사항 |

---

## 규칙 (코드보다 먼저 지킬 것)

- **지어내지 않습니다.** 날짜·규격·수량·기관명·지역은 확인된 값만. 모르면 `null`
- **영업 지역은 제주도.** 전국 시공·출장·배송 표현 금지 (`check-site.js` 가 검사)
- **브랜드는 `제주안전시설` 하나.** 아인안전시설·제주안전·아인세이프티로 바꾸지 않습니다
- **실제 제주 현장 사진만.** AI 삽화·스톡은 `images.product[]` 로 분리
- **근거 없는 최상급 금지.** 1위·최고·최저가는 공공 발주처 대상 감점 요소입니다

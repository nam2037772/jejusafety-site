#!/usr/bin/env node
/* ============================================================
   tools/check-cases.js — 사례 데이터 검증 (배포 전 실행)
   ------------------------------------------------------------
     node tools/check-cases.js

   무엇을 막는가
     · 필수 필드 누락 / enum 밖의 값
     · id·slug 중복, slug 형식 위반 (URL 은 바꾸면 안 되므로)
     · 데이터가 가리키는데 실제로 없는 이미지
     · 존재하지 않는 서비스·가이드·사례·제품 앵커 참조 (고립·깨진 링크 예방)
     · 공개 검토가 끝나지 않은 사례가 발행되는 것
     · SEO title/description 누락·중복·길이 초과
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { CASES, publishedCases } = require('../assets/js/cases.js');
const { SERVICE_BY_SLUG, CUSTOMER_TYPES, WORK_TYPES, REGIONS } = require('../assets/js/services.js');
const { GUIDE_BY_SLUG } = require('../assets/js/guides.js');

const PRODUCT_ANCHORS = ['traffic', 'school', 'pedestrian', 'maintenance', 'metal'];
const REQUIRED = ['id', 'slug', 'title', 'facilityType', 'primaryService', 'workType',
  'problem', 'purpose', 'work', 'result', 'images', 'seo', 'sourceRef', 'published'];

const errors = [];
const warns = [];
const E = (id, m) => errors.push(`[${String(id).padStart(3, '0')}] ${m}`);
const W = (id, m) => warns.push(`[${String(id).padStart(3, '0')}] ${m}`);

const seenId = new Set();
const seenSlug = new Set();
const seenTitle = new Map();
const seenDesc = new Map();
const allIds = new Set(CASES.map((c) => c.id));

CASES.forEach((c) => {
  const id = c.id;

  REQUIRED.forEach((f) => {
    const v = c[f];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) {
      E(id, `필수 필드 누락: ${f}`);
    }
  });

  if (seenId.has(id)) E(id, 'id 중복');
  seenId.add(id);
  if (seenSlug.has(c.slug)) E(id, `slug 중복: ${c.slug}`);
  seenSlug.add(c.slug);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug || '')) E(id, `slug 형식 위반(소문자·숫자·하이픈): ${c.slug}`);

  /* enum */
  if (c.region && REGIONS.indexOf(c.region) < 0) E(id, `region 값 오류: ${c.region}`);
  if (c.customerType && CUSTOMER_TYPES.indexOf(c.customerType) < 0) E(id, `customerType 값 오류: ${c.customerType}`);
  if (!SERVICE_BY_SLUG[c.primaryService]) E(id, `primaryService 없음: ${c.primaryService}`);
  (c.relatedServices || []).forEach((s) => { if (!SERVICE_BY_SLUG[s]) E(id, `relatedServices 없음: ${s}`); });
  (c.workType || []).forEach((w) => { if (WORK_TYPES.indexOf(w) < 0) E(id, `workType 값 오류: ${w}`); });

  /* 참조 무결성 — 깨진 내부 링크의 원천을 막습니다 */
  (c.relatedGuides || []).forEach((g) => { if (!GUIDE_BY_SLUG[g]) E(id, `relatedGuides 없음: ${g}`); });
  (c.relatedProducts || []).forEach((p) => { if (PRODUCT_ANCHORS.indexOf(p) < 0) E(id, `relatedProducts 앵커 없음: ${p}`); });
  (c.relatedCases || []).forEach((r) => {
    if (!allIds.has(r)) E(id, `relatedCases 없음: ${r}`);
    else if (r === id) E(id, 'relatedCases 가 자기 자신을 가리킴');
  });

  /* 날짜 형식 (있을 때만) */
  if (c.date && !/^\d{4}-\d{2}(-\d{2})?$/.test(c.date)) E(id, `date 형식 오류: ${c.date}`);

  /* 이미지 */
  const dir = path.join(ROOT, 'assets', 'images', 'cases', String(id).padStart(3, '0'));
  const roles = ['before', 'process', 'after', 'product'];
  const listed = [];
  roles.forEach((r) => (c.images[r] || []).forEach((f) => listed.push(f)));
  if (c.images.representative) listed.push(c.images.representative);

  /* 비공개 보류 사례(미발행·공개 검토 중)는 사진을 공개 저장소에 두지 않습니다.
     그래서 파일이 없는 것이 정상입니다 — 오류가 아니라 경고로 알립니다.
     게시 승인 시 .gitignore 의 해당 줄을 지우고 사진을 넣으면 됩니다. */
  const isPublic = c.published && !(c.review && c.review.disclosure === '확인필요');

  listed.forEach((f) => {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) {
      if (isPublic) E(id, `이미지 없음: ${path.relative(ROOT, p)}`);
      else W(id, `비공개 보류 사례의 사진이 저장소에 없습니다(정상): ${path.basename(p)}`);
      return;
    }
    const thumb = p.replace(/(\.[a-z]+)$/i, '-thumb$1');
    if (!fs.existsSync(thumb)) W(id, `썸네일 없음(목록이 원본을 씁니다): ${path.basename(thumb)}`);
  });

  if (c.images.representative) {
    const inRoles = roles.some((r) => (c.images[r] || []).indexOf(c.images.representative) >= 0);
    if (!inRoles) W(id, `representative 가 before/process/after/product 목록에 없습니다: ${c.images.representative}`);
  } else if (c.published) {
    W(id, 'representative 없음 — 목록 카드에 사진이 나오지 않습니다');
  }

  /* 발주처 실명 노출 */
  if (c.customerName && (!c.review || !c.review.notes)) {
    W(id, `customerName 실명(${c.customerName})이 있는데 review.notes 에 공개 근거가 없습니다`);
  }

  /* 공개 검토 */
  if (c.published && c.review && c.review.disclosure === '확인필요') {
    W(id, '공개 검토 중(확인필요) — published:true 이지만 빌드에서 제외됩니다');
  }

  /* SEO */
  if (c.seo) {
    if (!c.seo.title) E(id, 'seo.title 없음');
    if (!c.seo.description) E(id, 'seo.description 없음');
    if (c.seo.title && c.seo.title.length > 60) W(id, `seo.title 60자 초과 (${c.seo.title.length}자)`);
    if (c.seo.description && c.seo.description.length > 160) W(id, `seo.description 160자 초과 (${c.seo.description.length}자)`);
    if (c.seo.description && c.seo.description.length < 70) W(id, `seo.description 이 짧습니다 (${c.seo.description.length}자)`);
    if (c.published) {
      if (seenTitle.has(c.seo.title)) E(id, `seo.title 중복: ${seenTitle.get(c.seo.title)} 와 동일`);
      seenTitle.set(c.seo.title, id);
      if (seenDesc.has(c.seo.description)) E(id, `seo.description 중복: ${seenDesc.get(c.seo.description)} 와 동일`);
      seenDesc.set(c.seo.description, id);
    }
  }

  /* 원본 역추적 */
  if (c.sourceRef && !/^Raw\//.test(c.sourceRef) && !/^data\//.test(c.sourceRef)) {
    W(id, `sourceRef 경로 형식 확인 필요: ${c.sourceRef}`);
  }
});

/* 고립 방지 — 발행 사례는 최소 한 곳에서 참조되어야 합니다 */
const pub = publishedCases();
const referenced = new Set();
CASES.forEach((c) => (c.relatedCases || []).forEach((r) => referenced.add(r)));
require('../assets/js/guides.js').GUIDES.forEach((g) => (g.relatedCases || []).forEach((r) => referenced.add(r)));
pub.forEach((c) => {
  /* 서비스 페이지가 자동으로 3건씩 노출하므로 완전 고립은 아니지만,
     명시적 연결이 하나도 없으면 내부 링크가 얇아집니다. */
  if (!referenced.has(c.id)) W(c.id, '다른 사례·가이드에서 이 사례를 참조하지 않습니다 (relatedCases 연결 권장)');
});

/* ── 출력 ─────────────────────────────────────────────── */
console.log(`사례 데이터 검증 — 전체 ${CASES.length}건 / 발행 ${pub.length}건\n`);
if (errors.length) {
  console.log(`오류 ${errors.length}건`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  console.log('');
}
if (warns.length) {
  console.log(`경고 ${warns.length}건`);
  warns.forEach((w) => console.log('  · ' + w));
  console.log('');
}
if (!errors.length && !warns.length) console.log('문제 없음\n');
process.exit(errors.length ? 1 : 0);

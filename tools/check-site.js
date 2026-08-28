#!/usr/bin/env node
/* ============================================================
   tools/check-site.js — 기술 SEO · 링크 · 브랜드 표기 검증
   ------------------------------------------------------------
     node tools/check-site.js

   검사 항목
     구조     lang / charset / viewport / H1 1개 / semantic main
     메타     title·description 존재·유일·길이 / canonical 규칙 / Open Graph
     이미지   alt / width·height / loading (CLS·LCP)
     링크     내부 링크 존재 / 앵커 존재 / 외부 링크 rel / 고립 페이지
     데이터   JSON-LD 파싱 / 엔티티 관계(브랜드↔운영회사) 일관성
     표현     전국 시공·출장·배송 등 금지 표현 / 근거 없는 최상급
     브랜드   '제주안전시설' 이외의 브랜드 변형 표기
     연락처   config.js 의 전화·이메일과 페이지 표기 일치
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { COMPANY } = require('../assets/js/config.js');
const { entityId } = require('./lib/layout.js');
const ID_BRAND = entityId('#brand');
const ID_OPERATOR = entityId('#operator');

const errors = [];
const warns = [];
const E = (f, m) => errors.push(`${f} — ${m}`);
const W = (f, m) => warns.push(`${f} — ${m}`);

const HAS_DOMAIN = !!(COMPANY.siteUrl && COMPANY.siteUrl.trim());

/* ── 대상 수집 ─────────────────────────────────────────── */
function htmlFiles(dir, base) {
  let out = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    if (d.name === 'node_modules' || d.name.startsWith('.')) return;
    const p = path.join(dir, d.name);
    const relp = path.posix.join(base, d.name);
    if (d.isDirectory()) {
      if (['assets', 'tools', 'docs', 'data', 'content'].includes(d.name) && base === '') return;
      out = out.concat(htmlFiles(p, relp));
    } else if (d.name.endsWith('.html')) out.push(relp);
  });
  return out;
}

const files = htmlFiles(ROOT, '').sort();
if (!files.length) { console.error('HTML 파일이 없습니다. 먼저 node tools/build.js 를 실행하세요.'); process.exit(1); }

const titles = new Map();
const descs = new Map();
const linkedTo = new Set();
const anchorsByFile = new Map();

/* 1차 통과 — 앵커 id 수집 */
files.forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  anchorsByFile.set(f, ids);
});

/* ── 금지 표현 ─────────────────────────────────────────── */
const FORBIDDEN = [
  [/전국\s*(시공|출장|설치|배송|어디)/g, '전국 영업을 뜻하는 표현 (영업 지역은 제주도)'],
  [/육지\s*(전역|전국)/g, '육지 전역 표현'],
  [/(제주\s*)?(1위|넘버\s*원|No\.?\s*1)/gi, '근거 없는 순위 표현'],
  [/최저가|업계\s*최고|최고의\s*품질/g, '근거 없는 최상급 표현']
];
const BRAND_VARIANTS = [
  [/아인안전시설/g, "브랜드명 변형 — '제주안전시설' 로 통일"],
  [/아인세이프티/g, "브랜드명 변형 — '제주안전시설' 로 통일"],
  [/제주안전(?!시설)(?![가-힣])/g, "브랜드명 축약 — '제주안전시설' 로 통일"]
];

/* ── 본 검사 ──────────────────────────────────────────── */
files.forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const dir = path.posix.dirname(f) === '.' ? '' : path.posix.dirname(f);

  if (/<meta http-equiv="refresh"/i.test(html) && html.length < 1000) {
    linkedTo.add(f); // Prevent orphan warning
    return;
  }

  /* 구조 */
  if (!/<html lang="ko">/.test(html)) E(f, 'html lang="ko" 누락');
  if (!/<meta charset="utf-8">/i.test(html)) E(f, 'charset 누락');
  if (!/name="viewport"/.test(html)) E(f, 'viewport 누락');
  if (!/<main[\s>]/.test(html)) E(f, '<main> 누락');

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || [];
  if (h1.length !== 1) E(f, `H1 이 ${h1.length}개 (1개여야 합니다)`);

  /* 메타 */
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) E(f, 'title 누락');
  if (!desc) E(f, 'meta description 누락');
  if (title) {
    if (titles.has(title)) E(f, `title 중복 (${titles.get(title)})`);
    titles.set(title, f);
    if (title.length > 60) W(f, `title 60자 초과 (${title.length}자)`);
  }
  if (desc) {
    if (descs.has(desc)) E(f, `description 중복 (${descs.get(desc)})`);
    descs.set(desc, f);
    if (desc.length > 160) W(f, `description 160자 초과 (${desc.length}자)`);
    if (desc.length < 70) W(f, `description 이 짧습니다 (${desc.length}자)`);
  }

  /* canonical 규칙 */
  const hasCanonical = /rel="canonical"/.test(html);
  if (HAS_DOMAIN && !hasCanonical) E(f, 'canonical 누락 (도메인이 설정되어 있습니다)');
  if (!HAS_DOMAIN && hasCanonical) E(f, '도메인 미확정인데 canonical 이 있습니다 (임의 도메인 금지)');

  /* Open Graph */
  ['og:type', 'og:title', 'og:description', 'og:site_name'].forEach((p) => {
    if (!html.includes(`property="${p}"`)) E(f, `${p} 누락`);
  });

  /* JSON-LD */
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) E(f, 'JSON-LD 누락');
  ld.forEach((m, i) => {
    try {
      const data = JSON.parse(m[1]);
      const g = data['@graph'] || [];
      const brand = g.filter((n) => n['@id'] === ID_BRAND)[0];
      const op = g.filter((n) => n['@id'] === ID_OPERATOR)[0];
      if (!brand) E(f, 'JSON-LD 에 #brand(제주안전시설) 노드가 없습니다');
      if (!op) E(f, 'JSON-LD 에 #operator((주)아인산업안전) 노드가 없습니다');
      if (brand && brand.name !== COMPANY.brand) E(f, `JSON-LD brand.name 불일치: ${brand.name}`);
      if (brand && (!brand.parentOrganization || brand.parentOrganization['@id'] !== ID_OPERATOR)) {
        E(f, 'JSON-LD 에 브랜드→운영회사 관계(parentOrganization)가 없습니다');
      }
      if (brand && JSON.stringify(brand.areaServed || '').includes('전국')) E(f, 'areaServed 에 전국이 들어 있습니다');
    } catch (e) {
      E(f, `JSON-LD 파싱 실패 (${i + 1}번째): ${e.message}`);
    }
  });

  /* 이미지 */
  [...html.matchAll(/<img\b[^>]*>/g)].forEach((m) => {
    const tag = m[0];
    if (!/\salt="/.test(tag)) E(f, 'alt 없는 img: ' + tag.slice(0, 70));
    else if (/\salt=""/.test(tag)) W(f, '빈 alt: ' + tag.slice(0, 70));
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) {
      W(f, 'width/height 없는 img (CLS 위험): ' + tag.slice(0, 70));
    }
    if (!/loading="(lazy|eager)"/.test(tag)) W(f, 'loading 속성 없는 img: ' + tag.slice(0, 70));
  });

  /* 링크 */
  [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].forEach((m) => {
    const tag = m[0];
    const href = m[1];

    if (/^(https?:)?\/\//.test(href)) {
      if (!/rel="[^"]*noopener/.test(tag) || !/rel="[^"]*noreferrer/.test(tag)) {
        E(f, `외부 링크에 rel="noopener noreferrer" 누락: ${href}`);
      }
      return;
    }
    if (/^(mailto:|tel:|sms:|#)/.test(href)) {
      if (href.startsWith('#') && href.length > 1) {
        const id = decodeURIComponent(href.slice(1));
        if (!anchorsByFile.get(f).has(id)) W(f, `같은 페이지 앵커 없음: ${href}`);
      }
      return;
    }

    const [p, hash] = href.split('#');
    const target = path.posix.normalize(path.posix.join(dir, p.split('?')[0]));
    if (!fs.existsSync(path.join(ROOT, target))) {
      E(f, `내부 링크 깨짐: ${href} → ${target}`);
      return;
    }
    linkedTo.add(target);
    if (hash && anchorsByFile.has(target) && !anchorsByFile.get(target).has(hash)) {
      W(f, `링크 대상에 앵커 없음: ${href}`);
    }
  });

  /* 표현 · 브랜드 */
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  FORBIDDEN.concat(BRAND_VARIANTS).forEach(([re, why]) => {
    const hit = text.match(re);
    if (hit) E(f, `${why}: "${[...new Set(hit)].join('", "')}"`);
  });

  /* 연락처 일치 */
  if (!html.includes(COMPANY.tel)) W(f, `대표전화(${COMPANY.tel})가 페이지에 없습니다`);
  const badTel = text.match(/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g);
  if (badTel) E(f, `개인 휴대폰번호로 보이는 값이 있습니다: ${[...new Set(badTel)].join(', ')}`);
});

/* 고립 페이지 */
files.forEach((f) => {
  if (f === 'index.html' || f === '404.html') return;
  if (!linkedTo.has(f)) W(f, '어느 페이지에서도 링크되지 않습니다 (고립 페이지)');
});

/* robots.txt */
if (!fs.existsSync(path.join(ROOT, 'robots.txt'))) E('robots.txt', '없습니다');
if (HAS_DOMAIN && !fs.existsSync(path.join(ROOT, 'sitemap.xml'))) E('sitemap.xml', '도메인이 설정됐는데 없습니다');

/* ── 출력 ─────────────────────────────────────────────── */
console.log(`기술 SEO 검증 — HTML ${files.length}장\n`);
if (errors.length) {
  console.log(`오류 ${errors.length}건`);
  errors.forEach((e) => console.log('  ✗ ' + e));
  console.log('');
}
if (warns.length) {
  console.log(`경고 ${warns.length}건`);
  warns.slice(0, 40).forEach((w) => console.log('  · ' + w));
  if (warns.length > 40) console.log(`  … 외 ${warns.length - 40}건`);
  console.log('');
}
if (!errors.length && !warns.length) console.log('문제 없음\n');
else console.log(`요약 — 오류 ${errors.length} / 경고 ${warns.length}\n`);
process.exit(errors.length ? 1 : 0);

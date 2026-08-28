#!/usr/bin/env node
/* ============================================================
   tools/import-raw.js — Obsidian Raw 노트 → 기계적 사실 추출
   ------------------------------------------------------------
   Raw 노트는 "블로그 원문을 거의 그대로 붙여넣은 비정형 원본"입니다.
   이 스크립트는 그 원문을 해석하지 않습니다. 기계가 확실히 알 수 있는 것만
   꺼내서 data/raw-extract/NNN.json 에 쌓습니다.

     · frontmatter (그대로)
     · 이미지 주소 · 등장 순서 · 섹션 마커로 판정한 역할(before/process/after)
     · 이미지 파일명에 들어 있는 촬영일 힌트
     · 본문 평문 (AI 가 읽고 사실을 뽑기 위한 원자료)

   ▶ 여기서 끝나지 않습니다.
     추출물 → **AI 가 Problem / Solution / Work / Result 로 재작성** →
     assets/js/cases.js  가 사이트의 발행 데이터입니다.
     블로그 문장을 사이트로 복사하지 않습니다. docs/RAW_TO_CASE_PIPELINE.md 참고.

   사용법
     node tools/import-raw.js                    추출만 (미리보기)
     node tools/import-raw.js --write            추출물 JSON 저장
     node tools/import-raw.js --write --download 이미지까지 내려받기
     node tools/import-raw.js --vault="D:\\경로\\에릭_vault"

   ▶ Obsidian vault 는 읽기 전용입니다.
     이 스크립트는 vault 안의 어떤 파일도 만들거나 고치거나 지우지 않습니다.
     쓰기 대상이 vault 안이면 그 자리에서 멈춥니다 (assertOutsideVault).
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXTRACT_DIR = path.join(REPO_ROOT, 'data', 'raw-extract');
const CASE_IMAGE_ROOT = path.join(REPO_ROOT, 'assets', 'images', 'cases');

const DEFAULT_VAULT = 'C:\\Users\\user\\내 드라이브(nam2037772@gmail.com)\\Vault\\에릭_vault';
const RAW_SUBDIR = path.join('Raw', '04. 안전시설');

const WRITE = process.argv.includes('--write');
const DOWNLOAD = process.argv.includes('--download');
const THUMBS = process.argv.includes('--thumbs');
const FORCE = process.argv.includes('--force');

/* 사람/AI 가 사진을 보고 확정한 역할. 자동 판정을 덮어씁니다.
   판정 근거는 data/case-roles.json 의 _why 와 docs/CASE_IMPORT_AUDIT.md 에 있습니다. */
const ROLE_OVERRIDES = (() => {
  const f = path.join(REPO_ROOT, 'data', 'case-roles.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
})();

/** 등장 순서(1-based) 기준으로 역할을 덮어쓰고, drop 목록은 걷어냅니다. */
function applyOverrides(no, images) {
  const ov = ROLE_OVERRIDES[no];
  if (!ov) return images;
  const drop = new Set(ov.drop || []);
  return images
    .map((img, i) => {
      const idx = i + 1;
      for (const role of ['before', 'process', 'after', 'product']) {
        if (Array.isArray(ov[role]) && ov[role].includes(idx)) return { ...img, role, overridden: true };
      }
      return img;
    })
    .filter((img, i) => !drop.has(i + 1));
}

function argValue(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3).replace(/^"|"$/g, '') : '';
}

const VAULT = path.resolve(argValue('vault') || process.env.JEJUSAFETY_VAULT || DEFAULT_VAULT);

/* ── vault 쓰기 금지 가드 ────────────────────────────────────
   실수로 vault 안에 쓰는 코드가 들어와도 여기서 멈춥니다. */
function assertOutsideVault(target) {
  const abs = path.resolve(target);
  const rel = path.relative(VAULT, abs);
  const inside = abs === VAULT || (rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel));
  if (inside) {
    console.error('\n[중단] Obsidian vault 는 읽기 전용입니다. vault 안에 쓰려 했습니다:\n  ' + abs + '\n');
    process.exit(1);
  }
  return abs;
}

/* ── frontmatter 파서 (원본 표기를 바꾸지 않고 그대로 담습니다) ── */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && key) {
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push(listItem[1].replace(/^"|"$/g, '').trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      data[key] = v === '' ? [] : v.replace(/^"|"$/g, '');
    }
  }
  return { data, body: text.slice(m[0].length) };
}

/* ── 이미지 역할 판정 ────────────────────────────────────────
   기계가 확신할 수 있을 때만 before/after 를 붙입니다.
   근거가 없으면 process 로 둡니다 — 틀린 before/after 는 신뢰를 깎습니다. */
const ROLE_MARKERS = [
  [/\[?\s*작업\s*전\s*사진\s*\]?/, 'before'],
  [/\[?\s*작업\s*중\s*사진\s*\]?/, 'process'],
  [/\[?\s*작업\s*후\s*사진\s*\]?/, 'after']
];

/** 파일명이 현장 실사가 아니라 삽화·도표임을 드러내는 신호 */
function isIllustration(name) {
  return /ChatGPT[_-]?Image|^SE-[0-9a-f-]{8,}|견적|%EA%B2%AC%EC%A0%81/i.test(name);
}

/** 네이버 사진 파일명에 박혀 있는 촬영일 (예: 900_20260716_175302.jpg → 2026-07-16) */
function dateHintFrom(name) {
  const m = decodeURIComponent(name).match(/(20\d{2})[^\d]?(\d{2})[^\d]?(\d{2})[_＿]/);
  if (!m) return null;
  const [, y, mo, d] = m;
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
  return `${y}-${mo}-${d}`;
}

function baseNameOf(url) {
  const clean = url.split('?')[0];
  return clean.slice(clean.lastIndexOf('/') + 1);
}

function extOf(name) {
  const m = decodeURIComponent(name).match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? '.' + m[1].toLowerCase().replace('jpeg', 'jpg') : '.jpg';
}

/* 마크다운 이미지 링크. 파일명에 괄호가 있으면 `\(1\)` 처럼 이스케이프되어 들어오므로
   `\.` 을 한 글자로 받아 URL 이 중간에서 잘리지 않게 합니다. */
const MD_IMAGE_RE = /!\[[^\]]*\]\(((?:\\.|[^()\s])+)\)/g;

function unescapeMd(url) {
  return url.replace(/\\(.)/g, '$1');
}

/**
 * 본문을 훑어 이미지 목록을 순서대로 만듭니다.
 * - `[작업전/중/후 사진]` 마커가 나오면 그 다음 이미지들의 역할이 정해집니다.
 * - `|시공전|시공후|` 표 안의 이미지는 열 위치로 역할이 정해집니다.
 * - 둘 다 없으면 process (미분류) 입니다.
 */
function collectImages(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  const seen = new Set();
  let markerRole = null;
  let tableCols = null; // 시공전/시공후 표의 열 → 역할

  for (const line of lines) {
    for (const [re, role] of ROLE_MARKERS) {
      if (re.test(line)) { markerRole = role; tableCols = null; }
    }

    /* 표 헤더에서 시공전/시공후 열 위치를 읽습니다 */
    if (/^\s*\|/.test(line) && /시공\s*전/.test(line) && /시공\s*후/.test(line)) {
      tableCols = line.split('|').slice(1, -1).map((c) => {
        if (/시공\s*전/.test(c)) return 'before';
        if (/시공\s*후/.test(c)) return 'after';
        return null;
      });
      continue;
    }

    const urls = [...line.matchAll(MD_IMAGE_RE)].map((m) => unescapeMd(m[1]));
    if (!urls.length) { if (!/^\s*\|/.test(line)) tableCols = tableCols; continue; }

    /* 표 안의 줄이면 열 위치로 역할을 나눕니다 */
    if (tableCols && /^\s*\|/.test(line)) {
      const cells = line.split('|').slice(1, -1);
      cells.forEach((cell, i) => {
        [...cell.matchAll(MD_IMAGE_RE)].forEach((m) => {
          push(unescapeMd(m[1]), tableCols[i] || markerRole || 'process');
        });
      });
      continue;
    }

    urls.forEach((u) => push(u, markerRole || 'process'));
  }

  function push(url, role) {
    if (!/^https?:/.test(url)) return;
    if (seen.has(url)) return;
    seen.add(url);
    const origName = baseNameOf(url);
    out.push({
      url,
      origName: decodeURIComponent(origName),
      role: isIllustration(origName) ? 'product' : role,
      dateHint: dateHintFrom(origName),
      ext: extOf(origName)
    });
  }

  return out;
}

/** 본문에서 이미지·구분선을 걷어낸 평문 — AI 가 사실을 뽑을 원자료 */
function plainBody(body) {
  return body
    .replace(new RegExp(MD_IMAGE_RE.source, 'g'), '')
    .replace(/\u200b/g, '')
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n')
    .trim();
}

/* ── 이미지 내려받기 ─────────────────────────────────────── */
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  Referer: 'https://blog.naver.com/ainsafe',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
};

/** 네이버 CDN 은 type 파라미터로 폭을 정합니다.
    다만 아무 크기나 되는 게 아니라 이미지마다 허용된 값만 200 을 돌려줍니다.
    (w160·w320·w400·w480 은 404. 실제로 쓸 수 있는 것은 w773 / w966 뿐)
    → 본문용 w966, 목록 카드용 w773. 이미지 처리 의존성 없이 두 크기를 확보합니다. */
function sized(url, width) {
  return /\?type=w\d+$/.test(url) ? url.replace(/\?type=w\d+$/, '?type=w' + width) : url;
}

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('리다이렉트가 너무 많습니다'));
    const lib = url.startsWith('http://') ? http : https;
    const req = lib.get(url, { headers: HEADERS, timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(download(new URL(res.headers.location, url).toString(), dest, redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 1024) return reject(new Error('파일이 너무 작습니다 (' + buf.length + 'B)'));
        fs.writeFileSync(assertOutsideVault(dest), buf);
        resolve(buf.length);
      });
    });
    req.on('timeout', () => req.destroy(new Error('시간 초과')));
    req.on('error', reject);
  });
}

/* ── 실행 ────────────────────────────────────────────────── */
async function main() {
  const rawDir = path.join(VAULT, RAW_SUBDIR);
  if (!fs.existsSync(rawDir)) {
    console.error('Raw 폴더를 찾지 못했습니다:\n  ' + rawDir +
      '\n--vault= 로 경로를 지정하거나 JEJUSAFETY_VAULT 를 설정하세요.');
    process.exit(1);
  }

  const files = fs.readdirSync(rawDir)
    .filter((f) => /^안전시설-\d+\.md$/.test(f))
    .sort();

  console.log(`Raw 원본: ${rawDir}`);
  console.log(`대상 ${files.length}건  ${WRITE ? '(저장)' : '(미리보기)'}${DOWNLOAD ? ' + 이미지 내려받기' : ''}\n`);

  if (WRITE) fs.mkdirSync(assertOutsideVault(EXTRACT_DIR), { recursive: true });

  for (const file of files) {
    const no = file.match(/(\d+)/)[1].padStart(3, '0');
    const text = fs.readFileSync(path.join(rawDir, file), 'utf8');
    const { data, body } = parseFrontmatter(text);
    const images = applyOverrides(no, collectImages(body));

    const counts = images.reduce((a, i) => (a[i.role] = (a[i.role] || 0) + 1, a), {});
    const hints = [...new Set(images.map((i) => i.dateHint).filter(Boolean))].sort();

    const extract = {
      caseNo: no,
      sourceRef: path.join(RAW_SUBDIR, file).replace(/\\/g, '/'),
      extractedAt: new Date().toISOString().slice(0, 10),
      frontmatter: data,
      /* 사진 파일명에서 읽은 촬영일. 시공일이 아니라 '힌트'입니다.
         확인 전에는 사이트 데이터의 date 를 null 로 둡니다. */
      dateHints: hints,
      imageCount: images.length,
      roleCounts: counts,
      images: images.map((img, i) => ({ ...img, index: i + 1 })),
      roleOverride: ROLE_OVERRIDES[no] ? ROLE_OVERRIDES[no]._why || true : false,
      body: plainBody(body)
    };

    console.log(`  ${no}  이미지 ${images.length}장  ` +
      Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ') +
      (hints.length ? `  촬영일힌트 ${hints[0]}~${hints[hints.length - 1]}` : '  촬영일힌트 없음'));

    if (WRITE) {
      fs.writeFileSync(
        assertOutsideVault(path.join(EXTRACT_DIR, `${no}.json`)),
        JSON.stringify(extract, null, 2) + '\n', 'utf8'
      );
    }

    if (DOWNLOAD) {
      const dir = path.join(CASE_IMAGE_ROOT, no);
      fs.mkdirSync(assertOutsideVault(dir), { recursive: true });
      const seq = {};
      for (const img of images) {
        seq[img.role] = (seq[img.role] || 0) + 1;
        const name = `${img.role}-${String(seq[img.role]).padStart(2, '0')}${img.ext}`;
        const dest = path.join(dir, name);
        const thumb = dest.replace(/(\.[a-z]+)$/, '-thumb$1');
        const haveFull = fs.existsSync(dest) && !FORCE;
        const haveThumb = fs.existsSync(thumb) && !FORCE;
        if (haveFull && (!THUMBS || haveThumb)) { console.log(`      · ${name} (있음)`); continue; }
        try {
          const size = haveFull ? fs.statSync(dest).size : await download(sized(img.url, 966), dest);
          let extra = '';
          if (THUMBS && !haveThumb) {
            /* 목록 카드용 축소본 — 모바일에서 큰 원본을 내려받지 않게 합니다 */
            try {
              const t = await download(sized(img.url, 773), thumb);
              extra = ` (+thumb ${(t / 1024).toFixed(0)}KB)`;
            } catch (e) { extra = ' (thumb 실패)'; }
          }
          console.log(`      ✓ ${name}  ${(size / 1024).toFixed(0)}KB${extra}`);
        } catch (e) {
          console.log(`      ✗ ${name}  ${e.message}`);
        }
      }
    }
  }

  console.log('\n다음 단계 — 추출물은 사실 원자료일 뿐입니다.');
  console.log('  docs/RAW_TO_CASE_PIPELINE.md 규칙에 따라 AI 가');
  console.log('  Problem / Solution / Work / Result 로 재작성해 assets/js/cases.js 에 넣습니다.');
  console.log('  블로그 문장을 그대로 옮기지 않습니다.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });

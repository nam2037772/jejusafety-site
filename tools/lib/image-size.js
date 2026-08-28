/* ============================================================
   tools/lib/image-size.js — 이미지 파일의 실제 픽셀 크기 읽기
   ------------------------------------------------------------
   왜 필요한가
     <img width/height> 는 브라우저가 이미지를 받기 전에 자리를 잡아
     두는 값입니다. 실제 비율과 다르면 사진이 도착하는 순간 레이아웃이
     밀립니다(CLS). 그래서 빌드 시점에 파일 헤더에서 직접 읽습니다.

   사례 사진은 JPEG·PNG 두 가지뿐이라 헤더만 훑습니다. 다른 형식이나
   깨진 파일이면 null 을 돌려주고, 부르는 쪽이 기존 기본값을 씁니다.
   ============================================================ */
'use strict';

const fs = require('fs');

/** PNG: 8바이트 시그니처 뒤 IHDR 청크에 폭·높이가 빅엔디안 32비트로 들어 있습니다 */
function pngSize(buf) {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** JPEG: SOF0~SOF15 세그먼트를 만날 때까지 마커를 건너뜁니다 */
function jpegSize(buf) {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null;
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) { off++; continue; }        // 패딩 바이트
    const marker = buf[off + 1];
    if (marker === 0xff) { off++; continue; }
    /* SOF0·1·2·3·5·6·7·9·10·11·13·14·15 에 크기가 있습니다.
       0xC4(DHT)·0xC8·0xCC 는 SOF 가 아니므로 제외합니다. */
    if (marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) { off += 2; continue; }
    if (marker === 0xda) return null;                   // 스캔 시작 — 여기까지 없으면 없음
    off += 2 + buf.readUInt16BE(off + 2);
  }
  return null;
}

const cache = new Map();

/** 파일의 intrinsic 크기 { width, height } 또는 null */
function imageSize(file) {
  if (cache.has(file)) return cache.get(file);
  let size = null;
  try {
    const fd = fs.openSync(file, 'r');
    /* SOF 는 보통 앞쪽에 있지만 EXIF 썸네일이 길 수 있어 넉넉히 읽습니다 */
    const buf = Buffer.alloc(65536);
    const read = fs.readSync(fd, buf, 0, 65536, 0);
    fs.closeSync(fd);
    const head = buf.subarray(0, read);
    size = pngSize(head) || jpegSize(head);
  } catch (e) { size = null; }
  cache.set(file, size);
  return size;
}

module.exports = { imageSize };

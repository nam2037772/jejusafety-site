/* ============================================================
   main.js — 공통 동작 + 사례 목록 필터 + 문의 링크 조립
   ------------------------------------------------------------
   ▶ 이 파일은 '보조'입니다.
     내비게이션·본문·사례 카드·사례 상세는 전부 정적 HTML 로 이미 들어 있습니다.
     자바스크립트가 꺼져도 페이지는 읽히고 모든 링크는 크롤링됩니다.
     여기서 하는 일은 세 가지뿐입니다 — 모바일 메뉴, 사례 목록 필터, 문의 링크 조립.
   ▶ 사례 데이터(cases-index.js)는 목록 페이지에서만 읽습니다.
   ▶ 의존성 없음. 번들러 없음.
   ============================================================ */
(function () {
  'use strict';

  /* 하위 폴더(service/, case/, guide/)에서도 경로가 맞도록 body[data-root] 를 씁니다. */
  var ROOT = (document.body && document.body.getAttribute('data-root')) || '';

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pad3(n) { return String(n).padStart(3, '0'); }

  /* ── 헤더 · 푸터 ──────────────────────────────────────── */
  function initChrome() {
    var toggle = document.querySelector('.nav-toggle');
    var gnb = document.getElementById('gnb');
    if (toggle && gnb) {
      toggle.addEventListener('click', function () {
        var open = gnb.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        /* 메뉴가 열리면 헤더가 어두운 오버레이 위에 놓입니다.
           로고가 검정 그대로면 배경에 묻히므로 헤더에도 상태를 알립니다. */
        var header = document.querySelector('.site-header');
        if (header) header.classList.toggle('is-nav-open', open);
      });
    }
    var year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ── 스크롤 등장 ──────────────────────────────────────────
     .reveal 은 CSS 에서 opacity:0 으로 시작합니다. 관찰자가 없으면
     내용이 영영 보이지 않으므로, 지원하지 않는 브라우저에서는
     즉시 모두 보이게 합니다. */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ── 사례 카드 (빌드가 심는 것과 같은 모양) ───────────── */
  function caseCard(c) {
    var href = ROOT + 'case/' + pad3(c.id) + '-' + c.slug + '.html';
    var dir = ROOT + 'assets/images/cases/' + pad3(c.id) + '/';
    var fig = c.representative
      ? '<img src="' + dir + c.representative.replace(/(\.[a-z]+)$/i, '-thumb$1') +
        '" alt="' + esc(c.title) + ' 시공 후 모습" width="773" height="580" loading="lazy" decoding="async">'
      : '<div class="noimg">사진 준비 중</div>';

    var badges = [];
    if (c.region) badges.push('<span class="badge badge--region">' + esc(c.region) + '</span>');
    var cust = c.customerLabel || c.customerType;
    if (cust) badges.push('<span class="badge badge--customer">' + esc(cust) + '</span>');
    (c.workType || []).forEach(function (w) {
      badges.push('<span class="badge badge--work">' + esc(w) + '</span>');
    });

    return '<a class="card card-link case-card" href="' + href + '">' +
      '<figure>' + fig + '</figure><div class="body">' +
      (badges.length ? '<div class="badges">' + badges.join('') + '</div>' : '') +
      '<h3>' + esc(c.title) + '</h3>' +
      '<p>' + esc(c.excerpt) + '…</p>' +
      '<span class="card-more">사례 자세히 보기 →</span></div></a>';
  }

  /* ── 사례 목록 (필터 · 검색) ──────────────────────────
     초기 화면은 빌드가 심어 둔 정적 카드입니다.
     사용자가 필터를 건드릴 때만 다시 그립니다. */
  function initCasesPage() {
    var grid = document.getElementById('caseGrid');
    if (!grid || typeof CASE_INDEX === 'undefined') return;

    var all = CASE_INDEX; // 정렬은 빌드 시점에 이미 적용됨
    var state = { service: '', customer: '', region: '', work: '', q: '' };

    function matches(c) {
      if (state.service && c.primaryService !== state.service &&
        (c.relatedServices || []).indexOf(state.service) < 0) return false;
      if (state.customer && c.customerType !== state.customer) return false;
      if (state.region && c.region !== state.region) return false;
      if (state.work && (c.workType || []).indexOf(state.work) < 0) return false;
      if (state.q) {
        var hay = [c.title, c.facilityType, c.excerpt, (c.tags || []).join(' '),
          c.regionDetail, c.customerLabel].join(' ').toLowerCase();
        if (hay.indexOf(state.q.toLowerCase()) < 0) return false;
      }
      return true;
    }

    /** 특정 필터 값을 골랐을 때 남는 건수 (칩에 표시) */
    function countIf(key, val) {
      var saved = state[key];
      state[key] = val;
      var n = all.filter(matches).length;
      state[key] = saved;
      return n;
    }

    function buildChips(group) {
      var key = group.getAttribute('data-filter');
      var values = JSON.parse(group.getAttribute('data-values'));
      var box = group.querySelector('.chips');
      box.innerHTML = '';

      [{ v: '', l: '전체' }].concat(values.map(function (v) {
        return { v: v.value !== undefined ? v.value : v, l: v.label !== undefined ? v.label : v };
      })).forEach(function (opt) {
        var n = countIf(key, opt.v);
        var active = state[key] === opt.v;
        var btn = el('button', {
          type: 'button', class: 'chip', 'aria-pressed': active ? 'true' : 'false',
          disabled: (n === 0 && !active) ? 'disabled' : null
        }, esc(opt.l) + '<span class="n">' + n + '</span>');
        btn.addEventListener('click', function () {
          state[key] = active ? '' : opt.v;
          render();
        });
        box.appendChild(btn);
      });
    }

    function render() {
      document.querySelectorAll('[data-filter]').forEach(buildChips);
      var hit = all.filter(matches);
      var count = document.getElementById('caseCount');
      if (count) {
        count.textContent = '시공사례 ' + hit.length + '건' +
          (hit.length !== all.length ? ' (전체 ' + all.length + '건 중)' : '');
      }
      grid.innerHTML = hit.map(caseCard).join('') ||
        '<p class="note">조건에 맞는 사례가 없습니다. 위 필터를 해제해 보세요.</p>';
    }

    var search = document.getElementById('caseSearch');
    if (search) {
      search.addEventListener('input', function () { state.q = search.value.trim(); render(); });
    }

    /* 칩과 건수만 먼저 만들고, 카드는 정적 HTML 그대로 둡니다 */
    document.querySelectorAll('[data-filter]').forEach(buildChips);
    var count = document.getElementById('caseCount');
    if (count) count.textContent = '시공사례 ' + all.length + '건';
  }

  /* ── 문의 링크 조립 ───────────────────────────────────────
     입력을 모으는 곳(buildInquiry)과 보내는 곳(sendInquiry)을 나눠 둡니다.
     ▶ 향후 '사진 첨부형 견적문의 폼'을 붙일 때 고칠 곳은
       config.js 의 CONTACT_CHANNELS.externalForm 한 줄과
       아래 sendInquiry() 한 함수뿐입니다.
  ─────────────────────────────────────────────────────────── */
  function buildInquiry(form) {
    var get = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ''; };
    var type = get('type') || 'quote';
    var meta = INQUIRY_TYPES[type] || INQUIRY_TYPES.quote;
    return {
      type: type,
      subject: meta.subject,
      body: [
        '문의 유형: ' + meta.label,
        '기관/업체명: ' + get('org'),
        '담당자: ' + get('name'),
        '연락처: ' + get('phone'),
        '현장 위치(제주도 내): ' + get('place'),
        '시설/자재: ' + get('facility'),
        '수량: ' + get('qty'),
        '',
        '내용:',
        get('message'),
        '',
        '※ 현장 사진 1~2장을 이 메일에 첨부해 주시면 개략 견적이 더 정확해집니다.'
      ].join('\n')
    };
  }

  function sendInquiry(inq) {
    /* 외부 폼(사진 첨부형)이 준비되면 그쪽으로 보냅니다 */
    if (CONTACT_CHANNELS.externalForm) {
      window.open(CONTACT_CHANNELS.externalForm, '_blank', 'noopener');
      return;
    }
    /* 자체 서버가 없으므로 메일 앱으로 넘깁니다 */
    location.href = 'mailto:' + COMPANY.email +
      '?subject=' + encodeURIComponent(inq.subject) +
      '&body=' + encodeURIComponent(inq.body);
  }

  function initContact() {
    var form = document.getElementById('inquiryForm');
    if (!form) return;

    /* products.html 등에서 넘어온 ?type=supply 를 미리 선택 */
    var t = new URLSearchParams(location.search).get('type');
    if (t && form.elements.type && form.elements.type.querySelector('option[value="' + t + '"]')) {
      form.elements.type.value = t;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sendInquiry(buildInquiry(form));
    });
  }

  /* ── 시작 ─────────────────────────────────────────────── */
  function boot() {
    initChrome();
    initReveal();
    initCasesPage();
    if (typeof COMPANY !== 'undefined') initContact();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

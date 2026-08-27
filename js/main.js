/* ==========================================================================
   main.js — 헤더, 모바일 메뉴, 스크롤 관련 동작

   IntersectionObserver를 두 가지 용도로 쓴다.
     1) 섹션이 화면에 들어올 때 부드럽게 등장시키기
     2) 지금 보고 있는 섹션을 내비게이션에 표시하기 (scroll spy)
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. 헤더 — 스크롤하면 배경과 경계선이 나타난다
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById('header');
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        // 스크롤 이벤트마다 스타일을 건드리지 않도록 프레임당 한 번으로 묶는다
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------------------
     2. 모바일 메뉴
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav__link'));

    /* 메뉴가 열려 있는 동안 화면에서 실제로 조작 가능한 요소들.
       헤더의 언어·테마 버튼은 오버레이 위에 계속 보이므로 함께 포함한다. */
    function focusable() {
      var extras = Array.prototype.slice.call(
        document.querySelectorAll('.header__actions button')
      );
      return links.concat(extras);
    }

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '메뉴 닫기');
      nav.classList.add('is-open');
      document.body.classList.add('is-nav-open');
      if (links[0]) links[0].focus();
    }

    function close(returnFocus) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
      nav.classList.remove('is-open');
      document.body.classList.remove('is-nav-open');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      isOpen() ? close(false) : open();
    });

    // 메뉴에서 항목을 고르면 닫고 해당 섹션으로 이동한다
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        if (isOpen()) close(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;

      if (e.key === 'Escape') {
        close(true);
        return;
      }

      // 열려 있는 동안 Tab이 화면 밖 요소로 빠져나가지 않게 한다
      if (e.key === 'Tab') {
        var items = focusable();
        if (!items.length) return;

        var first = items[0];
        var last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // 데스크톱 폭으로 넓어지면 열린 상태를 정리한다
    var mq = window.matchMedia('(min-width: 768px)');
    var onChange = function (e) {
      if (e.matches && isOpen()) close(false);
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else if (mq.addListener) {
      mq.addListener(onChange);
    }
  }

  /* ------------------------------------------------------------------
     3. 등장 애니메이션
     ------------------------------------------------------------------ */
  function initReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    // 모션을 줄이도록 설정했거나 지원하지 않는 브라우저면 즉시 다 보여준다
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 한 번 나타나면 그대로 둔다
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     4. Scroll spy — 지금 보고 있는 섹션을 내비게이션에 표시
     ------------------------------------------------------------------ */
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    if (!links.length) return;

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      sections.push(section);
    });

    function setActive(id) {
      links.forEach(function (link) {
        link.classList.toggle('is-active', link === map[id]);
      });
    }

    /* 화면 중앙 부근(위 40% ~ 아래 55%를 제외한 띠)에 걸친 섹션을 현재로 본다 */
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ------------------------------------------------------------------
     5. 이메일 복사
     ------------------------------------------------------------------ */
  function initCopyEmail() {
    var btn = document.getElementById('copyEmail');
    if (!btn) return;

    var label = btn.querySelector('.copy-btn__label');
    var live = document.getElementById('liveRegion');
    var email = btn.getAttribute('data-email');
    var resetTimer;

    function feedback(ok) {
      var done = window.i18n ? window.i18n.t('contact.copied', '복사됨') : '복사됨';
      var fail = window.i18n ? window.i18n.t('contact.copy', '복사') : '복사';
      var text = ok ? done : fail;

      if (label) label.textContent = text;
      btn.classList.toggle('is-copied', ok);
      if (live) live.textContent = ok ? email + ' ' + done : text;

      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        if (label) label.textContent = window.i18n ? window.i18n.t('contact.copy', '복사') : '복사';
        btn.classList.remove('is-copied');
        if (live) live.textContent = '';
      }, 2000);
    }

    btn.addEventListener('click', function () {
      // Clipboard API는 보안 컨텍스트(https 또는 localhost)에서만 동작한다
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(
          function () {
            feedback(true);
          },
          function () {
            feedback(false);
          }
        );
        return;
      }

      // file:// 로 직접 열었을 때를 위한 대비책
      var temp = document.createElement('textarea');
      temp.value = email;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(temp);
      feedback(ok);
    });
  }

  /* ------------------------------------------------------------------
     6. 푸터 연도
     ------------------------------------------------------------------ */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    initHeader();
    initNav();
    initReveal();
    initScrollSpy();
    initCopyEmail();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

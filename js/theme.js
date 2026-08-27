/* ==========================================================================
   theme.js — 라이트 / 다크 전환

   실제 테마 적용은 index.html <head>의 인라인 스크립트가 첫 페인트 전에
   이미 끝내 둔다(깜빡임 방지). 이 파일은 토글 버튼의 동작만 담당한다.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncButton(theme) {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;

    var goingDark = theme !== 'dark'; // 눌렀을 때 어디로 가는지
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute('aria-label', goingDark ? '다크 모드로 전환' : '라이트 모드로 전환');
  }

  /* 모바일 브라우저 주소창 색까지 맞춰준다 */
  function syncMetaColor(theme) {
    var meta = document.getElementById('metaThemeColor');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d0f14' : '#ffffff');
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    syncButton(theme);
    syncMetaColor(theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* 저장 불가 환경 — 이번 방문에만 적용된다 */
    }
  }

  function init() {
    var theme = current();
    syncButton(theme);
    syncMetaColor(theme);

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    }

    /* 사용자가 직접 고른 적이 없다면 OS 설정 변경을 따라간다 */
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var listener = function (e) {
      var saved = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch (err) {
        /* noop */
      }
      if (saved) return;

      var next = e.matches ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      syncButton(next);
      syncMetaColor(next);
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', listener);
    } else if (mq.addListener) {
      mq.addListener(listener); // 구형 Safari
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

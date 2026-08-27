/* ==========================================================================
   i18n.js — 한국어 / 영어 전환

   HTML에는 한국어를 그대로 써 둔다. 그래야 JS가 꺼져 있거나 아직 로드되지
   않은 상태에서도 내용이 읽히고, 검색엔진도 한국어 본문을 그대로 수집한다.
   따라서 여기에는 영어 문구만 사전으로 둔다.
   한국어로 돌아갈 때는 최초 로드 시 떠 둔 스냅샷을 복원한다.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "lang";

  /* ---------- 영어 사전 ----------
     TODO: 한국어 원문을 채운 뒤, 여기 영어 번역도 함께 갱신하세요.
     키가 없으면 그냥 한국어가 그대로 남으므로 사이트가 깨지지는 않습니다. */
  var EN = {
    "a11y.skip": "Skip to content",
    "site.logo": "Taehyeong Lim",

    "nav.aria": "Main menu",
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.projects": "Projects",
    "nav.education": "Education",
    "nav.contact": "Contact",

    "hero.eyebrow": "Frontend Developer",
    "hero.name": "Taehyeog Lim",
    "hero.lead":
      "I enjoy understanding how data flows behind the screen, not just how the screen looks.",
    "hero.ctaProjects": "View projects",
    "hero.ctaContact": "Get in touch",

    "about.title": "About",
    "about.photoAlt": "Portrait of Taehyeog Lim",
    "about.p1":
      "Hi, I'm Taehyeog Lim, an aspiring frontend developer. I care about building interfaces where the user never has to stop and wonder what to do next.",
    "about.p2":
      "I've built web applications with React and Next.js, and connected them to Supabase to handle authentication and data myself. I'm not satisfied with only drawing the screen — I want to know where the data comes from.",
    "about.p3":
      "I don't have professional experience yet, but I've learned by asking early rather than staying stuck, and by writing down what I find. I'm looking for a team I can grow with.",
    "about.resume": "Download résumé",

    "skills.title": "Skills",
    "skills.lead":
      "Grouped into three levels, based on how confidently I could explain each one.",
    "skills.coreTitle": "Core",
    "skills.coreDesc": "I can design and build with these on my own.",
    "skills.usedTitle": "Used in projects",
    "skills.usedDesc":
      "I've shipped with these and can work with the docs at hand.",
    "skills.learningTitle": "Currently learning",
    "skills.learningDesc":
      "Not yet confident enough to claim — these are what I'm studying now.",
    "skills.gitFlow": "Git branching strategy",

    "projects.title": "Projects",
    "projects.labelProblem": "Problem",
    "projects.labelSolution": "Approach",
    "projects.labelLearned": "What I learned",
    "projects.labelProblem2": "Problem",
    "projects.labelSolution2": "Approach",
    "projects.labelLearned2": "What I learned",
    "projects.live": "Live site",
    "projects.live2": "Live site",

    "projects.p1Alt": "Screenshot of project 1",
    "projects.p1Title": "[TODO] Project name",
    "projects.p1Summary":
      "[TODO] One sentence describing what this project is.",
    "projects.p1Problem": "[TODO] What problem you set out to solve.",
    "projects.p1Solution":
      "[TODO] How you solved it and why you chose that approach.",
    "projects.p1Learned": "[TODO] What you took away from it.",

    "projects.p2Alt": "Screenshot of project 2",
    "projects.p2Title": "[TODO] Project name",
    "projects.p2Summary":
      "[TODO] One sentence describing what this project is.",
    "projects.p2Problem": "[TODO] What problem you set out to solve.",
    "projects.p2Solution":
      "[TODO] How you solved it and why you chose that approach.",
    "projects.p2Learned": "[TODO] What you took away from it.",

    "education.title": "Education",
    "education.e1Title": "[TODO] Bootcamp / program name",
    "education.e1Meta": "[TODO] Institution · Completed",
    "education.e1Desc":
      "[TODO] What you studied and your role on team projects.",
    "education.e2Title": "[TODO] University",
    "education.e2Meta": "[TODO] Major · B.A./B.S.",
    "education.e2Desc":
      "[TODO] Anything from your major that connects to development.",

    "contact.title": "Contact",
    "contact.lead":
      "If there's a chance to work together, feel free to reach out anytime.",
    "contact.copy": "Copy",
    "contact.copied": "Copied",

    "footer.top": "Back to top",
  };

  /* ---------- 상태 ---------- */
  var current = "ko";
  var snapshot = new WeakMap(); // 요소 → 한국어 원문

  /* 요소가 번역할 대상 — 기본은 텍스트, data-i18n-attr가 있으면 그 속성 */
  function targetAttr(el) {
    return el.getAttribute("data-i18n-attr");
  }

  function readValue(el) {
    var attr = targetAttr(el);
    return attr ? el.getAttribute(attr) : el.textContent.trim();
  }

  function writeValue(el, value) {
    var attr = targetAttr(el);
    if (attr) {
      el.setAttribute(attr, value);
    } else {
      el.textContent = value;
    }
  }

  /* 최초 1회: 현재 DOM에 있는 한국어를 떠 둔다 */
  function capture() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      snapshot.set(el, readValue(el));
    });
  }

  function apply(lang) {
    current = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (lang === "en") {
        // 사전에 없는 키는 한국어를 그대로 둔다 (번역 누락 시에도 깨지지 않음)
        if (Object.prototype.hasOwnProperty.call(EN, key)) {
          writeValue(el, EN[key]);
        }
      } else {
        var original = snapshot.get(el);
        if (original !== undefined) writeValue(el, original);
      }
    });

    document.documentElement.setAttribute("lang", lang);

    // 버튼에는 '전환될 언어'를 표시한다
    var btn = document.getElementById("langToggle");
    if (btn) {
      var label = btn.querySelector("[data-lang-label]");
      if (label) label.textContent = lang === "en" ? "KO" : "EN";
      btn.setAttribute(
        "aria-label",
        lang === "en" ? "한국어로 전환" : "Switch to English",
      );
    }

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* 저장 불가 환경 — 이번 방문에만 적용된다 */
    }
  }

  function init() {
    capture();

    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* noop */
    }

    // 저장된 설정이 없으면 브라우저 언어를 참고하되, 한국어가 기본
    if (!saved) {
      saved = (navigator.language || "ko").toLowerCase().startsWith("ko")
        ? "ko"
        : "en";
    }
    apply(saved);

    var btn = document.getElementById("langToggle");
    if (btn) {
      btn.addEventListener("click", function () {
        apply(current === "ko" ? "en" : "ko");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 다른 스크립트(복사 버튼 문구 등)가 쓸 수 있도록 최소한만 공개한다
  window.i18n = {
    t: function (key, fallback) {
      if (current === "en" && Object.prototype.hasOwnProperty.call(EN, key))
        return EN[key];
      return fallback;
    },
    lang: function () {
      return current;
    },
  };
})();

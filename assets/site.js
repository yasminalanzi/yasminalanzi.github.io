/* Page behaviour: theme, language switch, the brand strip and the work directory. */
(function () {
  'use strict';

  var W = window.Works;
  var root = document.documentElement;
  var lang = (root.getAttribute('lang') || 'ar').slice(0, 2) === 'en' ? 'en' : 'ar';
  var BASE = document.body.getAttribute('data-base') || '';
  var EXTERNAL = !window.SITE_SANDBOX;

  var T = {
    ar: {
      all: 'الكل',
      emptyNote: 'تُضاف أعمال هذه الفئة قريبًا.',
      showingAll: 'تعرض الصفحة الآن كل الأعمال',
      showingOne: function (label) { return 'تعرض الصفحة الآن أعمال «' + label + '»'; },
      resultsEmpty: function (label) { return 'أعمال «' + label + '» قريبًا'; },
      loadError: 'تعذّر تحميل الأعمال. حدّث الصفحة للمحاولة مرة أخرى.',
      cvSoon: 'تُضاف السيرة الذاتية قريبًا',
      linkedinSoon: 'يُضاف رابط الحساب قريبًا',
      sandbox: 'هذه نسخة للمراجعة داخل Claude، ولا تُعرض فيها معاينات الروابط. تظهر المعاينات الحقيقية حين يُنشر الموقع على عنوانه.'
    },
    en: {
      all: 'All',
      emptyNote: 'Work in this category is on its way.',
      showingAll: 'Showing all work',
      showingOne: function (label) { return 'Showing ' + label; },
      resultsEmpty: function (label) { return label + ': coming soon'; },
      loadError: 'The work list didn’t load. Refresh the page to try again.',
      cvSoon: 'The CV is on its way',
      linkedinSoon: 'The profile link is on its way',
      sandbox: 'This is a review copy inside Claude, where link previews can’t load. The real previews appear once the site is live at its own address.'
    }
  }[lang];

  var state = { data: null, filter: 'all', brands: {} };

  /* ---------- small helpers ---------- */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  var esc = W.esc;

  var MAIL_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"></rect><path d="M3.8 7.2l8.2 6 8.2-6"></path></svg>';

  // Platform links in the page itself (contact, footer) carry the same marks as the cards.
  $all('[data-mark]').forEach(function (el) {
    el.innerHTML = W.markSVG(el.getAttribute('data-mark'), Number(el.getAttribute('data-size')) || 16);
  });

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2400);
  }

  function storage(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
    return null;
  }

  /* ---------- theme ---------- */

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function paintThemeButton() {
    var btn = $('#theme-toggle');
    if (!btn) return;
    var dark = currentTheme() === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    var parts = btn.querySelectorAll('span');
    if (parts[0]) parts[0].classList.toggle('is-on', !dark);
    if (parts[1]) parts[1].classList.toggle('is-on', dark);
  }

  function initTheme() {
    var btn = $('#theme-toggle');
    paintThemeButton();
    if (btn) {
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        storage('ya-theme', next);
        paintThemeButton();
      });
    }
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { if (!root.getAttribute('data-theme')) paintThemeButton(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }
  }

  /* ---------- language switch keeps your place ---------- */

  function initLangSwitch() {
    $all('[data-lang-link]').forEach(function (a) {
      a.addEventListener('click', function () {
        var base = a.getAttribute('href').split('#')[0];
        var hash = location.hash && /^#[\w-]+$/.test(location.hash) ? location.hash : '';
        a.setAttribute('href', base + hash);
      });
    });
  }

  /* ---------- site settings: email, LinkedIn, CV ---------- */

  function applySettings(settings) {
    var draft = !!settings.draft;
    var email = (settings.email || '').trim();
    var linkedin = (settings.linkedin || '').trim();
    var cv = (settings.cv || '').trim();
    var cvHref = cv ? (/^(https?:|data:)/.test(cv) ? cv : BASE + cv) : '';

    $all('[data-set="email"]').forEach(function (el) {
      if (email) {
        el.innerHTML = '<a class="email" href="mailto:' + esc(email) + '">' +
          '<span class="email-icon" aria-hidden="true">' + MAIL_SVG + '</span>' +
          '<span class="email-address" dir="ltr" lang="en">' + esc(email) + '</span></a>';
      } else {
        el.innerHTML = draft ? '<span class="email ph" dir="ltr" lang="en">[name@yourdomain.com]</span>' : '';
      }
    });
    $all('[data-mailto]').forEach(function (el) {
      if (email) el.setAttribute('href', 'mailto:' + email);
      else el.hidden = true;
    });
    var wire = function (name, href, soon) {
      $all('[data-set="' + name + '"]').forEach(function (el) {
        if (href) {
          el.setAttribute('href', href);
          // A file kept inside the page (the single-file copy) is downloaded; browsers will not open it in a tab.
          if (/^data:/.test(href)) {
            el.setAttribute('download', name === 'cv' ? 'Yasmin-Alanzi-CV.pdf' : name);
            el.removeAttribute('target');
          }
        } else if (draft) {
          el.addEventListener('click', function (e) { e.preventDefault(); toast(soon); });
        } else {
          el.hidden = true;
        }
      });
      if (!href && !draft) $all('[data-optional="' + name + '"]').forEach(function (el) { el.hidden = true; });
    };
    wire('linkedin', linkedin, T.linkedinSoon);
    wire('cv', cvHref, T.cvSoon);
    if (!email && !draft) $all('[data-optional="email"]').forEach(function (el) { el.hidden = true; });
    if (!draft) $all('[data-draft-only]').forEach(function (el) { el.hidden = true; });
  }

  /* ---------- brand strip ---------- */

  // Client logos keep their own colours. Each sits on a tile in one of the site's own cover tones
  // (paper, lavender, blush) or on ink when the logo was drawn for a dark ground. A brand without a
  // logo shows its name.
  function renderBrands(brands, draft) {
    var list = $('#brand-list');
    if (!list || !brands) return;
    var withLogos = brands.some(function (b) { return b.logo; });
    list.classList.toggle('has-logos', withLogos);
    list.innerHTML = brands.map(function (b) {
      var name = W.pick(b, lang);
      var ground = { paper: 1, lavender: 1, blush: 1, ink: 1 }[b.ground] ? b.ground : 'paper';
      var tile = 'brand-tile tile-' + ground;
      if (b.logo && b.w && b.h) {
        return '<li class="' + tile + '"><img src="' + esc(BASE + b.logo) + '" alt="' + esc(name.text) + '" width="' + Number(b.w) + '" height="' + Number(b.h) +
          '" style="--w:' + Number(b.w) + ';--h:' + Number(b.h) + '" loading="lazy" decoding="async"></li>';
      }
      var mark = draft && b.confirm && lang === 'en' ? ' ph' : '';
      return '<li class="' + (withLogos ? tile : '') + '"><span class="brand-word' + mark + '"' + W.langAttrs(name, lang) + '>' + esc(name.text) + '</span></li>';
    }).join('');
    // The strip moves slowly unless the visitor has asked for less motion; the second copy
    // closes the loop and is hidden from screen readers.
    var marquee = $('#marquee');
    var track = list.parentNode;
    var old = track.querySelector('.brand-list--clone');
    if (old) old.remove();
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (marquee && withLogos && !still) {
      var clone = list.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.add('brand-list--clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
      track.appendChild(clone);
      marquee.classList.add('is-moving');
    } else if (marquee) {
      marquee.classList.remove('is-moving');
    }
  }

  /* ---------- work directory ---------- */

  function categoryLabel(id) {
    var c = state.data.categories.filter(function (x) { return x.id === id; })[0];
    return c ? (c[lang] || c.ar) : '';
  }

  function worksIn(id) {
    return state.data.works.filter(function (w) { return w.cat === id; });
  }

  function cardContext(number) {
    return {
      lang: lang,
      theme: currentTheme(),
      external: EXTERNAL,
      draft: !!state.data.settings.draft,
      number: number,
      resolve: function (p) { return /^(https?:|data:|blob:)/.test(p) ? p : BASE + p; },
      brand: function (id) { return id ? state.brands[id] || null : null; }
    };
  }

  function visibleCategories() {
    var draft = !!state.data.settings.draft;
    return state.data.categories.filter(function (c) { return draft || worksIn(c.id).length; });
  }

  function renderChips() {
    var chips = $('#chips');
    var cats = visibleCategories();
    var all = { id: 'all', label: T.all };
    var items = [all].concat(cats.map(function (c) { return { id: c.id, label: c[lang] || c.ar }; }));
    // On wide screens the bar is two even rows; the break between them is ignored on phones.
    var half = Math.ceil(items.length / 2);
    chips.innerHTML = items.map(function (c, i) {
      var on = state.filter === c.id;
      return (i === half && items.length > 4 ? '<span class="chips-break" aria-hidden="true"></span>' : '') +
        '<button type="button" class="chip" data-filter="' + esc(c.id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        esc(c.label) + '</button>';
    }).join('');
  }

  // Every work is shown, in every view and on every screen: no counts, no "show more".
  function renderGroups() {
    var host = $('#groups');
    var f = state.filter;
    var html = EXTERNAL ? '' : '<p class="sandbox-note">' + esc(T.sandbox) + '</p>';
    visibleCategories().forEach(function (c) {
      if (f !== 'all' && f !== c.id) return;
      var list = worksIn(c.id);
      var label = c[lang] || c.ar;
      var intro = W.pick(c.intro, lang);
      // A category laid out wide (account headers in social media management) has two cards a row.
      html += '<section class="group' + (c.layout === 'wide' ? ' group--wide' : '') + '" aria-labelledby="g-' + esc(c.id) + '">' +
        '<div class="group-head"><h3 id="g-' + esc(c.id) + '" tabindex="-1">' + esc(label) + '</h3></div>' +
        (intro.text ? '<p class="group-intro"' + W.langAttrs(intro, lang) + '>' + esc(intro.text) + '</p>' : '');
      if (!list.length) {
        html += '<p class="group-note">' + esc(T.emptyNote) + '</p>';
      } else {
        html += '<div class="grid">' + list.map(function (w, i) { return W.cardHTML(w, cardContext(i + 1)); }).join('') + '</div>';
      }
      html += '</section>';
    });
    host.innerHTML = html;
    W.hydrate(host);
  }

  // Said to screen readers when a visitor picks a category (nothing is shown on screen).
  function announce(id) {
    var results = $('#results');
    if (!results) return;
    if (id === 'all') results.textContent = T.showingAll;
    else results.textContent = worksIn(id).length ? T.showingOne(categoryLabel(id)) : T.resultsEmpty(categoryLabel(id));
  }

  function setFilter(id, focusGroup) {
    state.filter = id;
    renderChips();
    renderGroups();
    announce(id);
    var pressed = $('#chips [aria-pressed="true"]');
    if (focusGroup) {
      var head = $('#g-' + id);
      if (head) {
        head.scrollIntoView({ block: 'start' });
        head.focus({ preventScroll: true });
      }
    } else if (pressed) {
      pressed.focus({ preventScroll: true });
    }
  }

  function initDirectory() {
    $('#chips').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (btn) setFilter(btn.getAttribute('data-filter'));
    });
  }

  /* ---------- deep links: #w01 points to a work's card ---------- */

  function followHash() {
    var id = (location.hash || '').slice(1);
    if (!/^w[\w-]+$/.test(id) || !state.data) return;
    var work = state.data.works.filter(function (w) { return w.id === id; })[0];
    if (!work) return;
    var card = $('#card-' + id);
    if (!card) {
      setFilter(work.cat);
      card = $('#card-' + id);
    }
    if (card) {
      card.classList.add('is-target');
      card.scrollIntoView({ block: 'center' });
      setTimeout(function () { card.classList.remove('is-target'); }, 2600);
    }
  }

  /* ---------- start ---------- */

  function init(data) {
    state.data = data;
    data.settings = data.settings || {};
    data.categories = data.categories || [];
    data.works = data.works || [];
    (data.brands || []).forEach(function (b) { if (b.id) state.brands[b.id] = b; });
    applySettings(data.settings);
    renderBrands(data.brands, !!data.settings.draft);
    renderChips();
    renderGroups();
    followHash();
    window.addEventListener('hashchange', followHash);
  }

  initTheme();
  initLangSwitch();
  initDirectory();

  var source = window.SITE_DATA ? Promise.resolve(window.SITE_DATA) :
    fetch(BASE + 'data/works.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); });
  source
    .then(init)
    .catch(function () {
      var host = $('#groups');
      if (host) host.innerHTML = '<p class="group-note">' + esc(T.loadError) + '</p>';
    });
})();

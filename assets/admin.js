/* Lets Yasmin add and edit works, see each card exactly as the site will show it, and publish. */
(function () {
  'use strict';

  var W = window.Works;
  var EXTERNAL = !window.SITE_SANDBOX;
  var BASE = '../';
  var GH_KEY = 'ya-admin-github';

  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var esc = W.esc;

  // Form field id, where it is kept in the work, and how a list is typed into it.
  var FIELDS = [
    ['f-link', 'link'],
    ['f-cat', 'cat'],
    ['f-brand', 'brand'],
    ['f-art', 'art'],
    ['f-title-ar', 'title.ar'],
    ['f-client-ar', 'client.ar'],
    ['f-desc-ar', 'desc.ar'],
    ['f-points-ar', 'points.ar', 'lines'],
    ['f-tags-ar', 'tags.ar', 'commas'],
    ['f-linklabel-ar', 'linkLabel.ar'],
    ['f-style', 'sampleStyle'],
    ['f-samples-ar', 'samples.ar', 'blocks'],
    ['f-title-en', 'title.en'],
    ['f-desc-en', 'desc.en'],
    ['f-points-en', 'points.en', 'lines'],
    ['f-tags-en', 'tags.en', 'commas'],
    ['f-linklabel-en', 'linkLabel.en'],
    ['f-samples-en', 'samples.en', 'blocks']
  ];

  // Lists as they are typed: a line per point, commas between tags, a blank line between samples.
  function toText(v, kind, id) {
    if (kind === 'lines') return Array.isArray(v) ? v.join('\n') : '';
    if (kind === 'commas') return Array.isArray(v) ? v.join(/-en$/.test(id) ? ', ' : '، ') : '';
    if (kind === 'blocks') {
      return Array.isArray(v) ? v.map(function (b) { return Array.isArray(b) ? b.join('\n') : String(b); }).join('\n\n') : '';
    }
    return v == null ? '' : String(v);
  }

  function fromText(text, kind) {
    var lines = function (t) { return t.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };
    if (kind === 'lines') return lines(text);
    if (kind === 'commas') return text.split(/[,،]/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (kind === 'blocks') return text.split(/\n\s*\n/).map(lines).filter(function (b) { return b.length; });
    return text;
  }

  var state = {
    data: null,
    baseJSON: '',
    baseSha: '',
    selected: null,
    snapshot: null,
    newIds: {},
    pending: {},
    gh: readGh(),
    busy: false,
    force: false,
    previewKey: '',
    previewTimer: null,
    deleteTimer: null
  };

  /* ---------- small helpers ---------- */

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
    } catch (e) { return null; }
    return null;
  }

  function readGh() {
    try {
      var g = JSON.parse(store(GH_KEY) || 'null');
      return g && g.owner && g.repo && g.token ? g : null;
    } catch (e) { return null; }
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  function setStatus(msg, isError) {
    var el = $('#status');
    el.textContent = msg || '';
    el.classList.toggle('is-error', !!isError);
  }

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  function setPath(obj, path, value) {
    var keys = path.split('.');
    var o = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      if (!o[keys[i]] || typeof o[keys[i]] !== 'object' || Array.isArray(o[keys[i]])) o[keys[i]] = {};
      o = o[keys[i]];
    }
    o[keys[keys.length - 1]] = value;
  }

  function decodeBase64Utf8(b64) {
    var bin = atob(String(b64).replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  function resolveMedia(path) {
    if (state.pending[path]) return state.pending[path].url;
    return /^(https?:|data:|blob:)/.test(path) ? path : BASE + path;
  }

  /* ---------- GitHub ---------- */

  function gh(path, opts) {
    opts = opts || {};
    var g = state.gh;
    var headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + g.token,
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch('https://api.github.com/repos/' + encodeURIComponent(g.owner) + '/' + encodeURIComponent(g.repo) + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store'
    }).then(function (r) {
      if (!r.ok) {
        var err = new Error('GitHub ' + r.status);
        err.status = r.status;
        throw err;
      }
      return r.status === 204 ? null : r.json();
    });
  }

  function ghMessage(err) {
    var s = err && err.status;
    if (s === 401) return 'المفتاح غير صالح أو انتهت صلاحيته. أنشئي مفتاحًا جديدًا من «الربط بالموقع المنشور».';
    if (s === 403) return 'المفتاح لا يملك صلاحية الكتابة في هذا المستودع. أنشئيه من الرابط في «الربط بالموقع المنشور» لتكون الصلاحية مختارة مسبقًا.';
    if (s === 404) return 'لم أجد المستودع. تأكدي من اسم المستخدم واسم المستودع.';
    if (s === 409 || s === 422) return 'تغيّر الموقع أثناء النشر. اضغطي «نشر التغييرات» مرة أخرى.';
    return 'تعذّر الاتصال بـ GitHub. تأكدي من الإنترنت ثم أعيدي المحاولة.';
  }

  function guessRepo() {
    var host = location.hostname;
    var m = /^([\w-]+)\.github\.io$/i.exec(host);
    if (!m) return { owner: '', repo: '' };
    var first = location.pathname.split('/')[1];
    var repo = first && first !== 'admin' ? first : host.toLowerCase();
    return { owner: m[1], repo: repo };
  }

  function renderGh() {
    var body = $('#gh-body');
    if (!EXTERNAL) {
      body.innerHTML = '<p class="field-note">هذه نسخة للمعاينة. الربط والنشر يعملان من لوحة الأعمال في موقعك المنشور.</p>';
      return;
    }
    if (state.gh) {
      body.innerHTML = '<div class="gh-ok">' +
        '<p class="field-note is-ok">اللوحة مربوطة بالمستودع <strong>' + esc(state.gh.owner + '/' + state.gh.repo) + '</strong>.</p>' +
        '<div class="inline-actions"><button type="button" class="btn btn--quiet" data-gh="edit">تغيير المفتاح</button>' +
        '<button type="button" class="btn btn--text" data-gh="forget">إلغاء الربط في هذا المتصفح</button></div></div>';
      return;
    }
    var g = guessRepo();
    body.innerHTML =
      '<p class="field-note">يحتاج النشر إلى مفتاح من حسابك في GitHub، ويبقى المفتاح في هذا المتصفح وحده.</p>' +
      '<ol>' +
      '<li>افتحي <a href="https://github.com/settings/tokens/new?scopes=public_repo&amp;description=Yasmin%20portfolio" target="_blank" rel="noopener">صفحة إنشاء المفتاح</a>، والصلاحية المطلوبة مختارة فيها مسبقًا.</li>' +
      '<li>اختاري مدة الصلاحية، ثم اضغطي الزر الأخضر أسفل الصفحة (Generate token).</li>' +
      '<li>انسخي المفتاح والصقيه في الحقل التالي.</li>' +
      '</ol>' +
      '<div class="field"><label for="gh-owner">اسم المستخدم في GitHub</label><input id="gh-owner" dir="ltr" autocomplete="off" value="' + esc(g.owner) + '"></div>' +
      '<div class="field"><label for="gh-repo">اسم المستودع</label><input id="gh-repo" dir="ltr" autocomplete="off" value="' + esc(g.repo) + '"></div>' +
      '<div class="field"><label for="gh-token">المفتاح</label><input id="gh-token" type="password" dir="ltr" autocomplete="off" spellcheck="false"></div>' +
      '<div class="inline-actions"><button type="button" class="btn btn--primary" data-gh="save">حفظ الربط</button></div>';
  }

  function saveGh() {
    var owner = ($('#gh-owner').value || '').trim();
    var repo = ($('#gh-repo').value || '').trim();
    var token = ($('#gh-token').value || '').trim();
    if (!owner || !repo || !token) {
      setStatus('أكملي الحقول الثلاثة ثم احفظي.', true);
      return;
    }
    state.gh = { owner: owner, repo: repo, token: token, branch: 'main' };
    setStatus('جارٍ التحقق من الربط…');
    gh('').then(function (info) {
      if (info.permissions && info.permissions.push === false) {
        var e = new Error('no push');
        e.status = 403;
        throw e;
      }
      state.gh.branch = info.default_branch || 'main';
      store(GH_KEY, JSON.stringify(state.gh));
      renderGh();
      setStatus('تم الربط. يمكنك النشر الآن.');
      if (!isDirty()) loadData();
    }).catch(function (err) {
      state.gh = null;
      setStatus(ghMessage(err), true);
    });
  }

  /* ---------- data ---------- */

  function normalize(d) {
    d.settings = d.settings || {};
    d.categories = d.categories || [];
    d.brands = d.brands || [];
    d.works = d.works || [];
    d.works.forEach(function (w) {
      ['title', 'desc'].forEach(function (k) {
        if (!w[k] || typeof w[k] !== 'object') w[k] = { ar: typeof w[k] === 'string' ? w[k] : '', en: '' };
      });
      if (w.link == null) w.link = '';
      if (w.cover == null) w.cover = '';
      if (w.brand == null) w.brand = '';
    });
    return d;
  }

  function loadData() {
    setStatus('جارٍ تحميل الأعمال…');
    var viaGh = !!(state.gh && EXTERNAL);
    var first = viaGh
      ? gh('/contents/data/works.json?ref=' + encodeURIComponent(state.gh.branch)).then(function (j) {
        return { text: decodeBase64Utf8(j.content), sha: j.sha, fromGh: true };
      })
      : Promise.reject(new Error('skip'));
    first.catch(function (err) {
      if (viaGh) setStatus(ghMessage(err), true);
      return fetch(BASE + 'data/works.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
        .then(function (text) { return { text: text, sha: '', fromGh: false }; });
    }).then(function (res) {
      state.data = normalize(JSON.parse(res.text));
      state.baseJSON = JSON.stringify(state.data);
      state.baseSha = res.sha;
      state.pending = {};
      state.newIds = {};
      fillSettings();
      renderList();
      if (state.selected && findWork(state.selected)) openWork(state.selected); else closeEditor();
      updatePublish();
      if (res.fromGh) setStatus('');
      else if (!viaGh) setStatus('');
    }).catch(function () {
      setStatus('تعذّر تحميل قائمة الأعمال. حدّثي الصفحة.', true);
    });
  }

  function findWork(id) {
    return state.data ? state.data.works.filter(function (w) { return w.id === id; })[0] : null;
  }

  function current() { return state.selected ? findWork(state.selected) : null; }

  function isReferenced(path) {
    if (state.data.settings.cv === path) return true;
    return state.data.works.some(function (w) { return w.cover === path; });
  }

  function isDirty() {
    if (!state.data) return false;
    if (JSON.stringify(state.data) !== state.baseJSON) return true;
    return Object.keys(state.pending).some(isReferenced);
  }

  function updatePublish() {
    var btn = $('#publish');
    var dirty = isDirty();
    btn.disabled = state.busy || !dirty;
    $('#publish-label').textContent = state.busy ? 'جارٍ النشر…' : (dirty ? 'نشر التغييرات' : 'لا تغييرات للنشر');
  }

  function changed() {
    updatePublish();
  }

  /* ---------- list ---------- */

  function missingOf(w) {
    return W.missingFields(w).filter(function (f) { return f !== 'الرابط'; });
  }

  function platformPill(w) {
    var p = W.parseLink(w.link);
    if (!p) return '<span class="pill">' + (W.pickList(w.samples, 'ar').items.length ? 'نص' : 'بلا رابط') + '</span>';
    var n = W.workLinks(w).length;
    var many = n === 2 ? 'رابطان' : W.digits(n, 'ar') + ' روابط';
    return '<span class="pill">' + esc(W.platformName(p, 'ar')) + (n > 1 ? ' · ' + many : '') + '</span>';
  }

  function rowHTML(w) {
    var title = W.pick(w.title, 'ar').text || 'عمل جديد بلا عنوان';
    var miss = missingOf(w);
    return '<li><button type="button" class="row" data-id="' + esc(w.id) + '" aria-current="' + (w.id === state.selected ? 'true' : 'false') + '">' +
      '<span class="row-title">' + esc(title) + '</span>' +
      '<span class="row-meta">' +
      (state.newIds[w.id] ? '<span class="pill pill--new">جديد</span>' : '') +
      platformPill(w) +
      (miss.length ? '<span class="pill pill--todo">ينقص: ' + esc(miss.join('، ')) + '</span>' : '') +
      '</span></button></li>';
  }

  function renderList() {
    var d = state.data;
    $('#work-list').innerHTML = d.categories.map(function (c) {
      var list = d.works.filter(function (w) { return w.cat === c.id; });
      return '<div class="list-group"><h2>' + esc(c.ar) + ' · ' + esc(W.digits(list.length, 'ar')) + '</h2>' +
        (list.length ? '<ul>' + list.map(rowHTML).join('') + '</ul>' : '<p class="field-note">لا أعمال في هذه الفئة بعد.</p>') +
        '</div>';
    }).join('');
  }

  /* ---------- editor ---------- */

  function fillForm(w) {
    $('#f-cat').innerHTML = state.data.categories.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.ar) + '</option>';
    }).join('');
    $('#f-brand').innerHTML = '<option value="">بلا شعار</option>' + state.data.brands.filter(function (b) { return b.id; }).map(function (b) {
      return '<option value="' + esc(b.id) + '">' + esc(b.ar || b.en) + '</option>';
    }).join('');
    FIELDS.forEach(function (f) {
      var el = document.getElementById(f[0]);
      if (!el) return;
      var v = getPath(w, f[1]);
      if (f[0] === 'f-style' && !v) v = 'script';
      el.value = toText(v, f[2], f[0]);
    });
    renderMore(w);
  }

  /* ---------- the work's other links ---------- */

  function renderMore(w) {
    var list = w.more || [];
    $('#more-list').innerHTML = list.map(function (m, i) {
      var label = m.label || {};
      return '<div class="more-row">' +
        '<div class="field"><label for="m-url-' + i + '">الرابط ' + esc(W.digits(i + 2, 'ar')) + '</label><input id="m-url-' + i + '" data-more="url" data-i="' + i + '" type="url" dir="ltr" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://" value="' + esc(m.url || '') + '"></div>' +
        '<div class="field"><label for="m-ar-' + i + '">اسمه</label><input id="m-ar-' + i + '" data-more="ar" data-i="' + i + '" autocomplete="off" placeholder="مثل: المقطع الأساسي" value="' + esc(label.ar || '') + '"></div>' +
        '<button type="button" class="btn btn--text" data-more-remove="' + i + '">إزالة هذا الرابط</button>' +
        '</div>';
    }).join('');
  }

  function onMore(el) {
    var w = current();
    var i = Number(el.getAttribute('data-i'));
    if (!w || !w.more || !w.more[i]) return;
    var key = el.getAttribute('data-more');
    if (key === 'url') w.more[i].url = el.value.trim();
    else {
      if (!w.more[i].label || typeof w.more[i].label !== 'object') w.more[i].label = { ar: '', en: '' };
      w.more[i].label[key] = el.value;
    }
    changed();
    schedulePreview(key === 'url');
    updateRow(w);
  }

  function addMore() {
    var w = current();
    if (!w) return;
    w.more = w.more || [];
    w.more.push({ url: '', label: { ar: '', en: '' } });
    renderMore(w);
    changed();
    var inputs = $all('#more-list [data-more="url"]');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }

  function removeMore(i) {
    var w = current();
    if (!w || !w.more) return;
    w.more.splice(i, 1);
    if (!w.more.length) delete w.more;
    renderMore(w);
    changed();
    renderPreview(true);
    updateRow(w);
  }

  function previewContext(w) {
    var siblings = state.data.works.filter(function (x) { return x.cat === w.cat; });
    return {
      lang: 'ar',
      theme: currentTheme(),
      external: EXTERNAL,
      draft: true,
      number: siblings.indexOf(w) + 1,
      resolve: resolveMedia,
      brand: function (id) {
        return id ? state.data.brands.filter(function (b) { return b.id === id; })[0] || null : null;
      }
    };
  }

  function renderPreview(force) {
    var w = current();
    var host = $('#preview');
    if (!w) { host.innerHTML = ''; return; }
    var key = W.workLinks(w).map(function (l) { return l.p.url; }).join(' ') + '|' + (w.cover || '') + '|' + w.cat + '|' + (w.brand || '') + '|' + (w.art || '');
    var html = W.cardHTML(w, previewContext(w));
    var existing = host.querySelector('.card');
    if (!force && existing && key === state.previewKey) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var body = tmp.querySelector('.card-body');
      existing.querySelector('.card-body').replaceWith(body);
      return;
    }
    state.previewKey = key;
    host.innerHTML = html;
    W.hydrate(host);
  }

  function schedulePreview(force) {
    clearTimeout(state.previewTimer);
    state.previewTimer = setTimeout(function () { renderPreview(force); }, force ? 350 : 120);
  }

  function renderLinkStatus() {
    var w = current();
    var el = $('#link-status');
    var raw = (w.link || '').trim();
    var p = W.parseLink(raw);
    var cls = 'field-note';
    var msg;
    if (!raw) {
      msg = 'بلا رابط: تظهر البطاقة بنصّها كاملًا، وعلى غلافها صورة ترفعينها أو رسم الغلاف أو شعار الجهة.';
    } else if (!p) {
      msg = 'هذا لا يبدو رابطًا. انسخيه كاملًا من شريط العنوان.';
      cls += ' is-warn';
    } else if (p.platform === 'web') {
      msg = 'رابط من موقع ' + p.host + '. تظهر البطاقة باسم الموقع، ويمكنك إضافة صورة غلاف لها.';
      cls += ' is-ok';
    } else if (!p.id) {
      msg = p.platform === 'tiktok'
        ? 'هذا رابط مختصر من تيك توك. افتحيه، ثم انسخي الرابط الكامل من شريط العنوان لتظهر المعاينة.'
        : 'الرابط من ' + W.platformName(p, 'ar') + ' لكنه لا يشير إلى منشور بعينه. انسخي رابط المنشور نفسه.';
      cls += ' is-warn';
    } else {
      msg = 'رابط صحيح: ' + W.describeLink(p, 'ar') + '. ' +
        (p.platform === 'youtube' ? 'تظهر صورة المقطع في البطاقة تلقائيًا.' : 'يظهر ' + (W.isVideo(p) ? 'المقطع' : 'المنشور') + ' نفسه داخل البطاقة.');
      cls += ' is-ok';
      if (!EXTERNAL) msg += ' المعاينة الحية تعمل في الموقع المنشور.';
    }
    el.className = cls;
    el.textContent = msg;
  }

  function renderHint() {
    var w = current();
    var el = $('#form-hint');
    var miss = missingOf(w);
    if (!miss.length) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = 'ينقص هذا العمل: ' + miss.join('، ') + '.' + (w.hint ? ' ' + w.hint + '.' : '');
  }

  function renderCoverThumb() {
    var w = current();
    var el = $('#cover-thumb');
    if (w && w.cover) {
      el.style.backgroundImage = 'url("' + resolveMedia(w.cover).replace(/"/g, '%22') + '")';
      el.classList.add('has-image');
      $('#cover-remove').hidden = false;
    } else {
      el.style.backgroundImage = '';
      el.classList.remove('has-image');
      $('#cover-remove').hidden = true;
    }
  }

  function updateRow(w) {
    var btn = $('#work-list .row[data-id="' + w.id + '"]');
    if (!btn) { renderList(); return; }
    var li = btn.parentNode;
    var tmp = document.createElement('ul');
    tmp.innerHTML = rowHTML(w);
    li.replaceWith(tmp.firstChild);
  }

  function resetDelete() {
    clearTimeout(state.deleteTimer);
    var btn = $('#delete');
    btn.classList.remove('is-armed');
    btn.textContent = 'حذف العمل';
  }

  function leaveCurrent() {
    var w = current();
    if (!w) return;
    var empty = !W.pick(w.title, 'ar').text && !W.pick(w.title, 'en').text && !w.link && !w.cover;
    if (state.newIds[w.id] && empty) removeWork(w.id, true);
  }

  function openWork(id, focusLink) {
    if (state.selected && state.selected !== id) leaveCurrent();
    var w = findWork(id);
    if (!w) return;
    state.selected = id;
    state.snapshot = JSON.parse(JSON.stringify(w));
    resetDelete();
    fillForm(w);
    $('#editor-empty').hidden = true;
    $('#work-form').hidden = false;
    document.body.classList.add('is-editing');
    $('#form-title').textContent = state.newIds[id] ? 'عمل جديد' : 'تعديل العمل';
    $('#more-panel').open = !!(w.more && w.more.length);
    $('#samples-panel').open = W.pickList(w.samples, 'ar').items.length > 0;
    renderList();
    renderLinkStatus();
    renderHint();
    renderCoverThumb();
    renderPreview(true);
    if (window.matchMedia('(max-width: 999px)').matches) window.scrollTo(0, 0);
    if (focusLink) $('#f-link').focus();
  }

  function closeEditor() {
    leaveCurrent();
    state.selected = null;
    $('#work-form').hidden = true;
    $('#editor-empty').hidden = false;
    document.body.classList.remove('is-editing');
    $('#preview').innerHTML = '';
    state.previewKey = '';
    if (state.data) renderList();
  }

  function removeWork(id, quiet) {
    var list = state.data.works;
    var i = list.map(function (w) { return w.id; }).indexOf(id);
    if (i === -1) return;
    list.splice(i, 1);
    delete state.newIds[id];
    if (state.selected === id) state.selected = null;
    changed();
    if (!quiet) toast('حُذف العمل. يختفي من الموقع بعد النشر.');
  }

  function onField(e) {
    var w = current();
    if (!w) return;
    if (e.target.hasAttribute('data-more')) { onMore(e.target); return; }
    var f = FIELDS.filter(function (x) { return x[0] === e.target.id; })[0];
    if (!f) return;
    var v = e.target.value;
    if (f[0] === 'f-link') v = v.trim();
    else v = fromText(v, f[2]);
    setPath(w, f[1], v);
    changed();
    // These change the cover, so the whole card is drawn again.
    if (f[0] === 'f-link' || f[0] === 'f-cat' || f[0] === 'f-brand' || f[0] === 'f-art' || f[0] === 'f-style' || /^f-samples/.test(f[0])) {
      renderLinkStatus();
      schedulePreview(true);
    } else {
      schedulePreview(false);
    }
    renderHint();
    if (f[0] === 'f-cat') renderList(); else updateRow(w);
  }

  function move(delta) {
    var w = current();
    if (!w) return;
    var list = state.data.works;
    var i = list.indexOf(w);
    var j = i + delta;
    while (j >= 0 && j < list.length && list[j].cat !== w.cat) j += delta;
    if (j < 0 || j >= list.length) { toast(delta < 0 ? 'هذا أول عمل في فئته.' : 'هذا آخر عمل في فئته.'); return; }
    list[i] = list[j];
    list[j] = w;
    changed();
    renderList();
    renderPreview(true);
  }

  function revert() {
    var w = current();
    if (!w || !state.snapshot) return;
    var list = state.data.works;
    var copy = JSON.parse(JSON.stringify(state.snapshot));
    list[list.indexOf(w)] = copy;
    fillForm(copy);
    changed();
    renderList();
    renderLinkStatus();
    renderHint();
    renderCoverThumb();
    renderPreview(true);
    toast('عاد العمل كما كان عند فتحه.');
  }

  function armDelete() {
    var btn = $('#delete');
    if (btn.classList.contains('is-armed')) {
      var id = state.selected;
      resetDelete();
      removeWork(id);
      state.selected = null;
      closeEditor();
      return;
    }
    btn.classList.add('is-armed');
    btn.textContent = 'اضغطي مرة أخرى للحذف';
    clearTimeout(state.deleteTimer);
    state.deleteTimer = setTimeout(resetDelete, 4000);
  }

  function nextId() {
    var max = 0;
    state.data.works.forEach(function (w) {
      var m = /^w(\d+)$/.exec(w.id);
      if (m) max = Math.max(max, Number(m[1]));
    });
    var n = String(max + 1);
    return 'w' + (n.length < 2 ? '0' + n : n);
  }

  function addWork() {
    if (!state.data) return;
    var open = current();
    var cat = open ? open.cat : (state.data.categories[0] && state.data.categories[0].id);
    leaveCurrent();
    var w = {
      id: nextId(),
      cat: cat,
      link: '',
      cover: '',
      brand: '',
      title: { ar: '', en: '' },
      desc: { ar: '', en: '' }
    };
    state.data.works.push(w);
    state.newIds[w.id] = true;
    state.selected = null;
    changed();
    openWork(w.id, true);
  }

  /* ---------- images and files ---------- */

  function readAsBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(',')[1]); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function compressImage(file, maxW, quality) {
    return new Promise(function (resolve, reject) {
      var src = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxW / img.naturalWidth);
        var cw = Math.max(1, Math.round(img.naturalWidth * scale));
        var ch = Math.max(1, Math.round(img.naturalHeight * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(src);
        canvas.toBlob(function (blob) {
          if (!blob) { reject(new Error('encode')); return; }
          readAsBase64(blob).then(function (b64) {
            resolve({ b64: b64, url: URL.createObjectURL(blob), type: 'image/jpeg' });
          }, reject);
        }, 'image/jpeg', quality);
      };
      img.onerror = function () { URL.revokeObjectURL(src); reject(new Error('decode')); };
      img.src = src;
    });
  }

  function takeImage(file) {
    var w = current();
    if (!w) return;
    if (!file || !/^image\//.test(file.type)) { toast('اختاري ملف صورة.'); return; }
    compressImage(file, 1600, 0.86).then(function (res) {
      var path = 'media/' + w.id + '-' + Date.now().toString(36) + '.jpg';
      state.pending[path] = res;
      w.cover = path;
      changed();
      renderCoverThumb();
      renderPreview(true);
      updateRow(w);
      toast('أُضيفت صورة الغلاف.');
    }).catch(function () { toast('تعذّرت قراءة الصورة. جرّبي صورة أخرى.'); });
  }

  function removeCover() {
    var w = current();
    if (!w) return;
    w.cover = '';
    changed();
    renderCoverThumb();
    renderPreview(true);
    updateRow(w);
  }

  function takeCv(file) {
    if (!file) return;
    if (file.type && file.type !== 'application/pdf') { toast('اختاري ملف PDF.'); return; }
    readAsBase64(file).then(function (b64) {
      var path = 'media/cv.pdf';
      state.pending[path] = { b64: b64, url: URL.createObjectURL(file), type: 'application/pdf' };
      state.data.settings.cv = path;
      $('#cv-state').textContent = 'جاهز للنشر: ' + file.name;
      changed();
    }).catch(function () { toast('تعذّرت قراءة الملف.'); });
  }

  /* ---------- settings ---------- */

  function fillSettings() {
    var s = state.data.settings;
    $('#s-draft').checked = !!s.draft;
    $('#s-email').value = s.email || '';
    $('#s-linkedin').value = s.linkedin || '';
    $('#cv-state').textContent = s.cv ? 'مرفوعة' : 'لم تُرفع بعد';
  }

  function onSetting(e) {
    var s = state.data.settings;
    if (e.target.id === 's-draft') s.draft = e.target.checked;
    if (e.target.id === 's-email') s.email = e.target.value.trim();
    if (e.target.id === 's-linkedin') s.linkedin = e.target.value.trim();
    changed();
  }

  /* ---------- publish ---------- */

  function cleanForPublish() {
    var d = state.data;
    d.works = d.works.filter(function (w) {
      var empty = !W.pick(w.title, 'ar').text && !W.pick(w.title, 'en').text && !w.link && !w.cover;
      return !(state.newIds[w.id] && empty);
    });
    var trimAll = function (o) {
      Object.keys(o).forEach(function (k) {
        if (typeof o[k] === 'string') o[k] = o[k].trim();
        else if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) trimAll(o[k]);
      });
    };
    d.works.forEach(trimAll);
    d.works.forEach(function (w) {
      if (w.more) {
        w.more = w.more.filter(function (m) { return m && m.url; });
        if (!w.more.length) delete w.more;
      }
      if (w.samples && !W.pickList(w.samples, 'ar').items.length && !W.pickList(w.samples, 'en').items.length) {
        delete w.samples;
        delete w.sampleStyle;
      }
    });
  }

  function commitFiles(text) {
    var g = state.gh;
    var branch = encodeURIComponent(g.branch || 'main');
    var parentSha;
    var baseTree;
    return gh('/git/ref/heads/' + branch).then(function (ref) {
      parentSha = ref.object.sha;
      return gh('/git/commits/' + parentSha);
    }).then(function (commit) {
      baseTree = commit.tree.sha;
      var files = [{ path: 'data/works.json', content: text, encoding: 'utf-8' }];
      Object.keys(state.pending).forEach(function (path) {
        if (isReferenced(path)) files.push({ path: path, content: state.pending[path].b64, encoding: 'base64' });
      });
      return files.reduce(function (chain, f) {
        return chain.then(function (tree) {
          return gh('/git/blobs', { method: 'POST', body: { content: f.content, encoding: f.encoding } }).then(function (b) {
            tree.push({ path: f.path, mode: '100644', type: 'blob', sha: b.sha });
            return tree;
          });
        });
      }, Promise.resolve([]));
    }).then(function (tree) {
      return gh('/git/trees', { method: 'POST', body: { base_tree: baseTree, tree: tree } });
    }).then(function (t) {
      return gh('/git/commits', { method: 'POST', body: { message: 'تحديث الأعمال من لوحة الأعمال', tree: t.sha, parents: [parentSha] } });
    }).then(function (c) {
      return gh('/git/refs/heads/' + branch, { method: 'PATCH', body: { sha: c.sha } });
    });
  }

  function setBusy(on) {
    state.busy = on;
    updatePublish();
  }

  function publish() {
    if (!isDirty() || state.busy) return;
    if (!EXTERNAL) {
      toast('النشر يعمل من لوحة الأعمال في موقعك المنشور، لا من نسخة المعاينة.');
      return;
    }
    if (!state.gh) {
      $('#gh-panel').open = true;
      $('#gh-panel').scrollIntoView({ block: 'center' });
      setStatus('اربطي اللوحة بموقعك أولًا من «الربط بالموقع المنشور».', true);
      return;
    }
    leaveCurrent();
    cleanForPublish();
    var text = JSON.stringify(state.data, null, 2) + '\n';
    setBusy(true);
    setStatus('جارٍ النشر…');
    gh('/contents/data/works.json?ref=' + encodeURIComponent(state.gh.branch)).then(function (j) {
      if (state.baseSha && j.sha !== state.baseSha && !state.force) {
        var e = new Error('changed elsewhere');
        e.conflict = true;
        throw e;
      }
      return commitFiles(text);
    }).then(function () {
      return gh('/contents/data/works.json?ref=' + encodeURIComponent(state.gh.branch)).catch(function () { return null; });
    }).then(function (j) {
      state.baseJSON = JSON.stringify(state.data);
      state.baseSha = j ? j.sha : '';
      state.pending = {};
      state.newIds = {};
      state.force = false;
      setBusy(false);
      renderList();
      if (current()) $('#form-title').textContent = 'تعديل العمل';
      setStatus('نُشرت التغييرات، وتظهر في الموقع خلال دقيقة أو دقيقتين.');
      toast('نُشرت التغييرات');
    }).catch(function (err) {
      setBusy(false);
      if (err && err.conflict) {
        state.force = true;
        setStatus('تغيّرت قائمة الأعمال في الموقع منذ فتحتِ هذه الصفحة. اضغطي «نشر التغييرات» مرة أخرى لتحلّ تعديلاتك محلها، أو حدّثي الصفحة لتحميل النسخة الأحدث.', true);
        return;
      }
      setStatus(ghMessage(err), true);
    });
  }

  /* ---------- wiring ---------- */

  function init() {
    renderGh();
    updatePublish();

    $('#work-list').addEventListener('click', function (e) {
      var row = e.target.closest('.row');
      if (row) openWork(row.getAttribute('data-id'));
    });
    $('#add-work').addEventListener('click', addWork);
    $('#back').addEventListener('click', function () {
      closeEditor();
      $('#list-pane').scrollIntoView({ block: 'start' });
    });
    $('#work-form').addEventListener('input', onField);
    $('#work-form').addEventListener('submit', function (e) { e.preventDefault(); });
    $('#more-add').addEventListener('click', addMore);
    $('#more-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-more-remove]');
      if (b) removeMore(Number(b.getAttribute('data-more-remove')));
    });

    $('#cover-pick').addEventListener('click', function () { $('#f-cover').click(); });
    $('#f-cover').addEventListener('change', function (e) {
      takeImage(e.target.files && e.target.files[0]);
      e.target.value = '';
    });
    $('#cover-remove').addEventListener('click', removeCover);
    document.addEventListener('paste', function (e) {
      if (!current() || !e.clipboardData) return;
      var files = Array.prototype.slice.call(e.clipboardData.files || []);
      var image = files.filter(function (f) { return /^image\//.test(f.type); })[0];
      if (image) {
        e.preventDefault();
        takeImage(image);
      }
    });

    $('#move-up').addEventListener('click', function () { move(-1); });
    $('#move-down').addEventListener('click', function () { move(1); });
    $('#revert').addEventListener('click', revert);
    $('#delete').addEventListener('click', armDelete);

    $('#settings-panel').addEventListener('input', onSetting);
    $('#cv-pick').addEventListener('click', function () { $('#s-cv').click(); });
    $('#s-cv').addEventListener('change', function (e) {
      takeCv(e.target.files && e.target.files[0]);
      e.target.value = '';
    });

    $('#gh-body').addEventListener('click', function (e) {
      var b = e.target.closest('[data-gh]');
      if (!b) return;
      var act = b.getAttribute('data-gh');
      if (act === 'save') saveGh();
      if (act === 'edit' || act === 'forget') {
        if (act === 'forget') store(GH_KEY, null);
        state.gh = null;
        renderGh();
        setStatus(act === 'forget' ? 'أُلغي الربط في هذا المتصفح.' : '');
      }
    });

    $('#publish').addEventListener('click', publish);

    window.addEventListener('beforeunload', function (e) {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    loadData();
  }

  init();
})();

/* Shared by the site and the admin page: reading links, building previews and work cards. */
(function (global) {
  'use strict';

  var PLATFORMS = {
    youtube: { ar: 'يوتيوب', en: 'YouTube' },
    tiktok: { ar: 'تيك توك', en: 'TikTok' },
    instagram: { ar: 'إنستقرام', en: 'Instagram' },
    x: { ar: 'إكس', en: 'X' },
    snapchat: { ar: 'سناب شات', en: 'Snapchat' },
    linkedin: { ar: 'لينكدإن', en: 'LinkedIn' },
    whatsapp: { ar: 'واتساب', en: 'WhatsApp' },
    facebook: { ar: 'فيسبوك', en: 'Facebook' },
    threads: { ar: 'ثريدز', en: 'Threads' },
    telegram: { ar: 'تيليجرام', en: 'Telegram' },
    web: { ar: 'الرابط', en: 'Link' }
  };

  /*
   * Platforms are shown by their marks, not their names (the name stays for screen readers).
   * Marks from Bootstrap Icons, MIT licence, © The Bootstrap Authors; drawn on a 16 × 16 grid.
   */
  var MARK = {
    x: '<path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>',
    instagram: '<path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>',
    tiktok: '<path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>',
    youtube: '<path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>',
    snapchat: '<path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14.371.246l.339.221a.4.4 0 0 1 .109.11c.026.053.027.11-.012.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047m-1.121.602c-.684.378-1.139.337-1.493.565-.3.193-.122.61-.34.76-.269.186-1.061-.012-2.085.326-.845.279-1.384 1.082-2.903 1.082s-2.045-.801-2.904-1.084c-1.022-.338-1.816-.14-2.084-.325-.218-.15-.041-.568-.341-.761-.354-.228-.809-.187-1.492-.563-.436-.24-.189-.39-.044-.46 2.478-1.199 2.873-3.05 2.89-3.188.022-.166.045-.297-.138-.466-.177-.164-.962-.65-1.18-.802-.36-.252-.52-.503-.402-.812.082-.214.281-.295.49-.295a1 1 0 0 1 .197.022c.396.086.78.285 1.002.338q.04.01.082.011c.118 0 .16-.06.152-.195-.026-.433-.087-1.277-.019-2.066.094-1.084.444-1.622.859-2.097.2-.229 1.137-1.22 2.93-1.22 1.792 0 2.732.987 2.931 1.215.416.475.766 1.013.859 2.098.068.788.009 1.632-.019 2.065-.01.142.034.195.152.195a.4.4 0 0 0 .082-.01c.222-.054.607-.253 1.002-.338a1 1 0 0 1 .197-.023c.21 0 .409.082.49.295.117.309-.04.56-.401.812-.218.152-1.003.638-1.18.802-.184.169-.16.3-.139.466.018.14.413 1.991 2.89 3.189.147.073.394.222-.041.464"/>',
    linkedin: '<path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>',
    whatsapp: '<path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>',
    facebook: '<path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>',
    threads: '<path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>',
    telegram: '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/>'
  };

  // Sites that are platforms but whose posts cannot be shown inside the page.
  var HOSTS = {
    'linkedin.com': 'linkedin', 'lnkd.in': 'linkedin',
    'snapchat.com': 'snapchat',
    'facebook.com': 'facebook', 'fb.com': 'facebook', 'fb.watch': 'facebook',
    'threads.net': 'threads', 'threads.com': 'threads',
    'wa.me': 'whatsapp', 'whatsapp.com': 'whatsapp',
    't.me': 'telegram', 'telegram.me': 'telegram'
  };

  // The names a platform goes by when she writes it as a tag.
  var ALIASES = {
    x: ['إكس', 'تويتر', 'x', 'twitter'],
    instagram: ['إنستقرام', 'إنستغرام', 'انستا', 'instagram'],
    tiktok: ['تيك توك', 'tiktok'],
    youtube: ['يوتيوب', 'youtube'],
    snapchat: ['سناب شات', 'سناب', 'snapchat', 'snap'],
    linkedin: ['لينكدإن', 'لنكدإن', 'linkedin'],
    whatsapp: ['واتساب', 'واتس', 'whatsapp'],
    facebook: ['فيسبوك', 'facebook'],
    threads: ['ثريدز', 'threads'],
    telegram: ['تيليجرام', 'تليجرام', 'تلقرام', 'telegram']
  };
  var BY_NAME = {};
  Object.keys(ALIASES).forEach(function (id) {
    ALIASES[id].forEach(function (name) { BY_NAME[squash(name)] = id; });
  });

  // Spelling differences that do not change the name: spaces, alef forms, tatweel, a leading «منصة».
  function squash(s) {
    return String(s == null ? '' : s).trim().toLowerCase()
      .replace(/[\sـ​-‏]+/g, '')
      .replace(/[إأآ]/g, 'ا')
      .replace(/^منصة/, '');
  }

  var TEXT = {
    ar: {
      opensOn: 'يفتح على',
      opensImage: 'تفتح الصورة كاملة',
      videoOn: 'مقطع على ',
      postOn: 'منشور على ',
      linkOut: 'رابط خارجي',
      links: 'روابط العمل',
      tags: 'المنصات',
      phTitle: '[عنوان العمل]',
      phImage: '[صورة الغلاف]'
    },
    en: {
      opensOn: 'opens on',
      opensImage: 'opens the full image',
      videoOn: 'Video on ',
      postOn: 'Post on ',
      linkOut: 'External link',
      links: 'Links to this work',
      tags: 'Platforms',
      phTitle: '[Title of the work]',
      phImage: '[Cover image]'
    }
  };

  var ARROW = {
    ar: 'M17 17L7 7M15 7H7v8',
    en: 'M7 17L17 7M9 7h8v8'
  };
  var CHEVRON = {
    ar: 'M15 6l-6 6 6 6',
    en: 'M9 6l6 6-6 6'
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function digits(value, lang) {
    var s = String(value == null ? '' : value);
    if (lang !== 'ar') return s;
    return s.replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.charAt(Number(d)); });
  }

  function westernDigits(value) {
    return String(value == null ? '' : value)
      .replace(/[٠-٩]/g, function (d) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)); })
      .replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); });
  }

  function countLabel(n, lang) {
    if (lang !== 'ar') return n === 1 ? '1 piece' : n + ' pieces';
    if (n === 1) return 'عمل واحد';
    if (n === 2) return 'عملان';
    if (n >= 3 && n <= 10) return digits(n, 'ar') + ' أعمال';
    return digits(n, 'ar') + ' عملًا';
  }

  // Text in the page's language, falling back to the other language with its own direction.
  function pick(field, lang) {
    if (!field) return { text: '', lang: lang };
    if (typeof field === 'string') return { text: field, lang: lang };
    var own = (field[lang] || '').trim();
    if (own) return { text: own, lang: lang };
    var other = lang === 'ar' ? 'en' : 'ar';
    var alt = (field[other] || '').trim();
    return { text: alt, lang: alt ? other : lang };
  }

  // The same for lists (points, tags, samples).
  function pickList(field, lang) {
    var clean = function (list) {
      return Array.isArray(list) ? list.filter(function (x) {
        return Array.isArray(x) ? x.some(function (s) { return String(s || '').trim(); }) : String(x || '').trim();
      }) : [];
    };
    if (!field) return { items: [], lang: lang };
    var own = clean(field[lang]);
    if (own.length) return { items: own, lang: lang };
    var other = lang === 'ar' ? 'en' : 'ar';
    var alt = clean(field[other]);
    return { items: alt, lang: alt.length ? other : lang };
  }

  function langAttrs(picked, pageLang) {
    if (!(picked.text || (picked.items && picked.items.length)) || picked.lang === pageLang) return '';
    return ' lang="' + picked.lang + '" dir="' + (picked.lang === 'ar' ? 'rtl' : 'ltr') + '"';
  }

  function result(platform, id, url, kind) {
    return {
      platform: platform,
      id: id || '',
      kind: kind || '',
      url: url.href,
      host: url.hostname.replace(/^www\./, '')
    };
  }

  // Reads a pasted link and returns the platform and the post id, or null when it is not a link.
  function parseLink(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var s = raw.trim();
    if (!s) return null;
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    var u;
    try { u = new URL(s); } catch (e) { return null; }
    if (u.hostname.indexOf('.') === -1) return null;
    var host = u.hostname.toLowerCase().replace(/^(www|m|mobile|music)\./, '');
    var path = u.pathname;
    var m;

    if (host === 'youtu.be') {
      m = path.match(/^\/([\w-]{11})/);
      return result('youtube', m ? m[1] : '', u);
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      var v = u.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return result('youtube', v, u);
      m = path.match(/^\/(shorts|embed|live|v)\/([\w-]{11})/);
      if (m) return result('youtube', m[2], u, m[1] === 'shorts' ? 'short' : '');
      return result('youtube', '', u);
    }
    if (host === 'tiktok.com' || /\.tiktok\.com$/.test(host)) {
      m = path.match(/\/(?:video|photo)\/(\d{6,})/);
      return result('tiktok', m ? m[1] : '', u);
    }
    if (host === 'instagram.com') {
      m = path.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]{5,})/);
      if (m) return result('instagram', m[2], u, m[1] === 'p' ? 'p' : 'reel');
      return result('instagram', '', u);
    }
    if (host === 'x.com' || host === 'twitter.com') {
      m = path.match(/^\/(?:[\w]+|i\/web)\/status(?:es)?\/(\d+)/);
      return result('x', m ? m[1] : '', u);
    }
    return result('web', '', u);
  }

  function isVideo(p) {
    if (!p) return false;
    if (p.platform === 'youtube' || p.platform === 'tiktok') return true;
    return p.platform === 'instagram' && p.kind === 'reel';
  }

  // The platform whose mark a link carries: its own, or the one its site belongs to ('' for others).
  function markOf(p) {
    if (!p) return '';
    if (MARK[p.platform]) return p.platform;
    var host = p.host || '';
    for (var h in HOSTS) {
      if (host === h || host.slice(-(h.length + 1)) === '.' + h) return HOSTS[h];
    }
    return '';
  }

  // Which platform a tag names, or ''.
  function tagPlatform(text) {
    return BY_NAME[squash(text)] || '';
  }

  function markSVG(id, size) {
    if (!MARK[id]) return '';
    var s = size || 16;
    return '<svg class="pf-mark" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="' + s + '" height="' + s +
      '" fill="currentColor">' + MARK[id] + '</svg>';
  }

  // A link shown as its platform's mark, or as a chain for an ordinary site.
  function linkGlyph(p, size) {
    var id = markOf(p);
    if (id) return markSVG(id, size);
    var s = size || 16;
    return '<svg class="pf-mark" aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="' + s + '" height="' + s +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"></path><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"></path></svg>';
  }

  function platformName(p, lang) {
    if (!p) return '';
    var id = markOf(p);
    if (p.platform === 'web') return id ? PLATFORMS[id][lang] : p.host;
    return PLATFORMS[p.platform][lang];
  }

  function describeLink(p, lang) {
    var t = TEXT[lang];
    if (!p) return '';
    if (p.platform === 'web') return t.linkOut + ' · ' + p.host;
    return (isVideo(p) ? t.videoOn : t.postOn) + PLATFORMS[p.platform][lang];
  }

  // Every link of a work, in her order: the main link first, then the others.
  function workLinks(work) {
    var out = [];
    var main = parseLink(work.link);
    if (main) out.push({ p: main, label: work.linkLabel });
    (work.more || []).forEach(function (m) {
      var p = m && parseLink(m.url);
      if (p) out.push({ p: p, label: m.label });
    });
    return out;
  }

  // The link whose preview fills the cover: the first one that points to a post the platform can show.
  function coverLink(work) {
    var all = workLinks(work);
    for (var i = 0; i < all.length; i++) {
      if (all[i].p.id) return all[i].p;
    }
    return all.length ? all[0].p : null;
  }

  // The official, key-free way each platform shows a post inside another page.
  function embedSrc(p, opts) {
    if (!p || !p.id) return '';
    if (p.platform === 'tiktok') {
      return 'https://www.tiktok.com/player/v1/' + p.id +
        '?controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0' +
        '&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0&autoplay=0&loop=0';
    }
    if (p.platform === 'instagram') {
      return 'https://www.instagram.com/' + (p.kind === 'p' ? 'p' : 'reel') + '/' + p.id + '/embed/';
    }
    if (p.platform === 'x') {
      return 'https://platform.twitter.com/embed/Tweet.html?id=' + p.id +
        '&dnt=true&hideThread=true&theme=' + (opts.theme === 'dark' ? 'dark' : 'light') + '&lang=' + opts.lang;
    }
    return '';
  }

  // Inner size each embed is drawn at before it is scaled into the card.
  var FRAME = {
    tiktok: null,
    instagram: { w: 328, h: 584 },
    x: { w: 400, h: 500 }
  };

  var ICON = {
    play: '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M8 5.5v13l11-6.5z" fill="currentColor"></path></svg>',
    post: '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3.5" width="16" height="17" rx="2.5"></rect><path d="M8 8.5h8M8 12h8M8 15.5h5"></path></svg>',
    link: '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"></path><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"></path></svg>',
    image: '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="M20.5 16l-5-5-8.5 8.5"></path></svg>',
    bell: '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"></path><path d="M10 20.5a2.2 2.2 0 0 0 4 0"></path></svg>'
  };

  function arrowSVG(lang, size) {
    var s = size || 13;
    return '<svg aria-hidden="true" class="ico-arrow" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + ARROW[lang] + '"></path></svg>';
  }

  function chevronSVG(lang, size) {
    var s = size || 13;
    return '<svg aria-hidden="true" class="ico-chevron" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + CHEVRON[lang] + '"></path></svg>';
  }

  // Until the preview arrives (or where it cannot), the cover shows the platform's mark.
  // The card's title already says where the link opens, so both marks are hidden from screen readers.
  function fallbackHTML(p) {
    return '<div class="cover-fallback"><span class="fb-mark">' + linkGlyph(p, 26) + '</span></div>';
  }

  function tagHTML(p) {
    return '<span class="cover-tag" aria-hidden="true">' + linkGlyph(p, 14) + '</span>';
  }

  function hasSamples(work) {
    return pickList(work.samples, 'ar').items.length > 0;
  }

  /*
   * Small drawings for works that live in documents (strategy, plans, guidelines). Each shows the
   * shape of that kind of work, in the site's own colours, with no words, so it reads in both languages.
   * Drawn on a 300 × 200 canvas; `ground` is the cover tone behind it.
   */
  var ART = {
    // a positioning map: the brand moves from where it stood to a clearer place among the others
    positioning: { ground: 'ink', svg:
      '<path class="fl" d="M60 100H240M150 24V176"/>' +
      '<path class="fl" d="M234 95l6 5-6 5M145 30l5-6 5 6"/>' +
      '<circle class="nd" cx="92" cy="56" r="5.5"/><circle class="nd" cx="100" cy="142" r="5.5"/>' +
      '<circle class="nd" cx="186" cy="146" r="5.5"/><circle class="nd" cx="226" cy="122" r="5.5"/>' +
      '<circle class="ln dash" cx="124" cy="82" r="7"/>' +
      '<path class="ln dash" d="M132 77C150 52 172 46 190 57"/><path class="ln" d="M185.9 50.1L190 57L182 56.5"/>' +
      '<circle class="so" cx="200" cy="58" r="21"/><circle class="mk" cx="200" cy="58" r="8.5"/>' },
    // a site map: the home page, its pages, and the blog with its posts
    sitemap: { ground: 'paper', svg:
      '<path class="fl" d="M150 52V68M78 68H222M78 68V84M126 68V84M174 68V84M222 68V84M222 104V118M222 134V140M222 156V162"/>' +
      '<rect class="mk" x="124" y="30" width="52" height="22" rx="6"/><path class="oms" d="M139 41H161"/>' +
      '<rect class="nd" x="60" y="84" width="36" height="20" rx="5"/><rect class="nd" x="108" y="84" width="36" height="20" rx="5"/>' +
      '<rect class="nd" x="156" y="84" width="36" height="20" rx="5"/><rect class="nd nd--soft" x="204" y="84" width="36" height="20" rx="5"/>' +
      '<path class="tx tx--s" d="M70 94H86M118 94H134M166 94H182M214 94H230"/>' +
      '<rect class="nd" x="194" y="118" width="56" height="16" rx="4"/><rect class="nd" x="194" y="140" width="56" height="16" rx="4"/>' +
      '<rect class="nd" x="194" y="162" width="56" height="16" rx="4"/>' +
      '<path class="tx tx--s" d="M203 126H234M203 148H227M203 170H238"/>' },
    // two fields that meet: what is documented and what is analysed, with the story told where they overlap
    venn: { ground: 'spark', svg:
      '<circle class="so" cx="124" cy="100" r="56"/><circle class="so" cx="176" cy="100" r="56"/>' +
      '<circle class="ln" cx="124" cy="100" r="56"/><circle class="ln" cx="176" cy="100" r="56"/>' +
      '<path class="mk" d="M150 50.4A56 56 0 0 1 150 149.6A56 56 0 0 1 150 50.4Z"/>' +
      '<path class="tx" d="M82 88H112M82 100H106M82 112H114"/>' +
      '<path class="tx tx--bar" d="M190 114V104M201 114V95M212 114V86"/>' +
      '<rect class="om" x="146" y="84" width="8" height="15" rx="4"/><path class="oms" d="M141 95a9 9 0 0 0 18 0M150 104V110"/>' },
    // one presence at the centre of the platforms it runs, two of them lit with activity
    hub: { ground: 'paper', svg:
      '<circle class="fl dash" cx="150" cy="100" r="66"/>' +
      '<path class="fl" d="M150 100L150 34M150 100L212.8 79.6M150 100L188.8 153.4M150 100L111.2 153.4M150 100L87.2 79.6"/>' +
      '<circle class="mk" cx="150" cy="100" r="22"/><circle class="om" cx="150" cy="94" r="5.5"/><path class="om" d="M140.5 110a9.5 8 0 0 1 19 0Z"/>' +
      '<rect class="nd" x="138" y="22" width="24" height="24" rx="7"/><rect class="nd" x="200.8" y="67.6" width="24" height="24" rx="7"/>' +
      '<rect class="nd" x="176.8" y="141.4" width="24" height="24" rx="7"/><rect class="nd" x="99.2" y="141.4" width="24" height="24" rx="7"/>' +
      '<rect class="nd" x="75.2" y="67.6" width="24" height="24" rx="7"/>' +
      '<circle class="mk bd" cx="161" cy="23" r="5"/><circle class="mk bd" cx="223.8" cy="68.6" r="5"/>' },
    // a guide: a heading, what to write and what to avoid, and the tone set on a scale
    guide: { ground: 'ink', svg:
      '<rect class="nd" x="96" y="26" width="108" height="148" rx="8"/>' +
      '<rect class="mk" x="112" y="44" width="48" height="8" rx="4"/>' +
      '<path class="tx" d="M112 72H164"/><circle class="mk" cx="184" cy="72" r="8"/><path class="oms" d="M180.4 72.4l2.6 2.6 5-5.6"/>' +
      '<path class="tx" d="M112 96H156"/><circle class="ln" cx="184" cy="96" r="8"/><path class="ln" d="M181 93l6 6M187 93l-6 6"/>' +
      '<path class="fl" d="M112 126H188"/><path class="mks" d="M112 126H152"/><circle class="nd nd--mark" cx="158" cy="126" r="6"/>' +
      '<path class="tx" d="M112 150H178M112 162H146"/>' },
    // six stages handed between three teams, ending in the result
    lanes: { ground: 'spark', flow: true, svg:
      '<path class="fl" d="M62 26H237M44 44H256M44 86H256M44 128H256M44 170H256"/>' +
      '<circle class="dt" cx="62" cy="26" r="3.5"/><circle class="dt" cx="97" cy="26" r="3.5"/><circle class="dt" cx="132" cy="26" r="3.5"/>' +
      '<circle class="dt" cx="167" cy="26" r="3.5"/><circle class="dt" cx="202" cy="26" r="3.5"/><circle class="dt" cx="237" cy="26" r="3.5"/>' +
      '<circle class="mk" cx="33" cy="65" r="5"/><circle class="so so--strong" cx="33" cy="107" r="5"/><circle class="nd" cx="33" cy="149" r="5"/>' +
      '<path class="mks" d="M75 65H79.5V149H84M110 149H114.5V65H119M145 65H149.5V107H154M180 107H189M215 107H219.5V149H224"/>' +
      '<rect class="nd" x="49" y="56" width="26" height="18" rx="4"/><rect class="nd" x="84" y="140" width="26" height="18" rx="4"/>' +
      '<rect class="nd" x="119" y="56" width="26" height="18" rx="4"/><rect class="nd" x="154" y="98" width="26" height="18" rx="4"/>' +
      '<rect class="nd" x="189" y="98" width="26" height="18" rx="4"/><rect class="mk" x="224" y="140" width="26" height="18" rx="4"/>' }
  };

  function artHTML(name) {
    var a = ART[name];
    if (!a) return '';
    return '<div class="cover cover--art ground-' + a.ground + '">' +
      '<svg class="dg' + (a.flow ? ' dg--flow' : '') + '" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      a.svg + '</svg></div>';
  }

  /*
   * ctx = { lang, theme, external (may load previews from other sites), resolve(path) -> url,
   *         number (position of the work in its category), draft, brand(id) -> brand or null }
   */
  function coverHTML(work, ctx) {
    var lang = ctx.lang;
    var p = coverLink(work);
    if (work.cover) {
      var src = ctx.resolve ? ctx.resolve(work.cover) : work.cover;
      return '<div class="cover cover--image">' +
        (p ? tagHTML(p) : '') +
        '<img src="' + esc(src) + '" alt="" loading="lazy" decoding="async">' +
        (isVideo(p) ? '<span class="cover-play" aria-hidden="true">' + ICON.play + '</span>' : '') +
        '</div>';
    }
    if (p) {
      if (p.platform === 'youtube' && p.id && ctx.external) {
        return '<div class="cover cover--youtube">' + fallbackHTML(p) +
          '<img class="yt-img" data-yt="' + esc(p.id) + '" src="https://i.ytimg.com/vi/' + esc(p.id) + '/maxresdefault.jpg" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
          '<span class="cover-play" aria-hidden="true">' + ICON.play + '</span>' + tagHTML(p) + '</div>';
      }
      var src2 = ctx.external ? embedSrc(p, ctx) : '';
      if (src2) {
        var f = FRAME[p.platform];
        return '<div class="cover cover--embed cover--' + p.platform + '" data-embed="' + esc(src2) + '"' +
          (f ? ' data-w="' + f.w + '" data-h="' + f.h + '"' : '') + '>' +
          fallbackHTML(p) +
          '<div class="embed-box"></div>' + tagHTML(p) + '</div>';
      }
      return '<div class="cover cover--link cover--' + p.platform + '">' + fallbackHTML(p) + tagHTML(p) + '</div>';
    }
    // App notifications are shown where they arrive: on a phone's lock screen.
    if (work.sampleStyle === 'notification' && hasSamples(work)) return phoneHTML(work, lang);
    // Other text samples (script excerpts) are the work itself, so their card needs no cover.
    if (hasSamples(work)) return '';
    // An image she still has to send: shown while the site is a draft.
    var note = pick(work.coverNote, lang);
    if (ctx.draft && note.text) {
      return '<div class="cover cover--pending">' + ICON.image +
        '<span class="ph"' + langAttrs(note, lang) + '>[' + esc(note.text) + ']</span></div>';
    }
    // A work that lives in a document: a drawing of its kind.
    if (work.art && ART[work.art]) return artHTML(work.art);
    // No link and no image: the client's logo on the ground it was made for, as in the brand strip.
    var b = ctx.brand ? ctx.brand(work.brand) : null;
    if (b && b.logo && b.w && b.h) {
      var ground = { paper: 1, lavender: 1, blush: 1, ink: 1 }[b.ground] ? b.ground : 'paper';
      var logo = ctx.resolve ? ctx.resolve(b.logo) : b.logo;
      return '<div class="cover cover--brand tile-' + ground + '"><img src="' + esc(logo) + '" alt="" width="' + Number(b.w) + '" height="' + Number(b.h) +
        '" style="--w:' + Number(b.w) + ';--h:' + Number(b.h) + '" loading="lazy" decoding="async"></div>';
    }
    // Otherwise its number in the category.
    return '<div class="cover cover--index"><span class="idx-num">' + esc(digits(String(ctx.number || 1).padStart(2, '0'), lang)) + '</span></div>';
  }

  function listHTML(cls, picked, lang, label) {
    if (!picked.items.length) return '';
    return '<ul class="' + cls + '"' + langAttrs(picked, lang) + (label ? ' aria-label="' + esc(label) + '"' : '') + '>' +
      picked.items.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
  }

  // The lines of each sample, without empty ones.
  function sampleBlocks(picked) {
    return picked.items.map(function (lines) {
      return (Array.isArray(lines) ? lines : [lines]).filter(function (s) { return String(s || '').trim(); });
    }).filter(function (ls) { return ls.length; });
  }

  /*
   * A phone with the notifications on its lock screen, rising from the bottom of the cover.
   * The notifications are the work, so they stay real text; the phone around them is decoration.
   */
  function phoneHTML(work, lang) {
    var picked = pickList(work.samples, lang);
    var notes = sampleBlocks(picked).map(function (ls) {
      return '<li class="phone-note"><span class="pn-icon" aria-hidden="true">' + ICON.bell + '</span><span class="pn-text">' +
        '<strong>' + esc(ls[0]) + '</strong>' +
        ls.slice(1).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') +
        '</span></li>';
    }).join('');
    return '<div class="cover cover--phone"><div class="phone"><div class="phone-screen">' +
      '<div class="phone-status" aria-hidden="true"><span class="phone-island"></span>' +
      '<svg class="phone-signal" viewBox="0 0 34 12" width="34" height="12" fill="currentColor">' +
      '<rect x="0" y="8" width="3" height="4" rx="1"></rect><rect x="5" y="5.5" width="3" height="6.5" rx="1"></rect>' +
      '<rect x="10" y="3" width="3" height="9" rx="1"></rect><rect x="15" y="0" width="3" height="12" rx="1"></rect>' +
      '<rect x="21.5" y="1.5" width="11" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2"></rect>' +
      '<rect x="23.3" y="3.3" width="6.4" height="5.4" rx="1.2"></rect></svg></div>' +
      '<div class="phone-clock" aria-hidden="true" dir="ltr">' + esc(digits('9:30', lang)) + '</div>' +
      '<ul class="phone-notes"' + langAttrs(picked, lang) + '>' + notes + '</ul>' +
      '</div></div></div>';
  }

  function samplesHTML(work, lang) {
    var picked = pickList(work.samples, lang);
    if (!picked.items.length) return '';
    // Notifications already sit on the phone in the cover.
    if (work.sampleStyle === 'notification' && !work.cover && !coverLink(work)) return '';
    var attrs = langAttrs(picked, lang);
    var blocks = picked.items.map(function (lines) {
      var ls = (Array.isArray(lines) ? lines : [lines]).filter(function (s) { return String(s || '').trim(); });
      return ls;
    }).filter(function (ls) { return ls.length; });
    if (work.sampleStyle === 'notification') {
      return '<ul class="samples samples--note"' + attrs + '>' + blocks.map(function (ls) {
        return '<li class="note"><span class="note-icon" aria-hidden="true">' + ICON.bell + '</span><span class="note-text">' +
          '<strong>' + esc(ls[0]) + '</strong>' +
          ls.slice(1).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') +
          '</span></li>';
      }).join('') + '</ul>';
    }
    return '<div class="samples samples--script"' + attrs + '>' + blocks.map(function (ls) {
      return '<blockquote class="script">' + ls.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') + '</blockquote>';
    }).join('') + '</div>';
  }

  // Works with more than one link list each of them; a single link is the card itself.
  function linksHTML(work, lang) {
    var all = workLinks(work);
    if (all.length < 2) return '';
    var t = TEXT[lang];
    return '<ul class="card-links" aria-label="' + esc(t.links) + '">' + all.map(function (l) {
      var label = pick(l.label, lang);
      // the mark leads the row on screen; screen readers hear the label first, then the platform
      var mark = '<span class="pf">' + linkGlyph(l.p, 15) + '<span class="vh">' + esc(platformName(l.p, lang)) + '</span></span>';
      var name = label.text ? '<span' + langAttrs(label, lang) + '>' + esc(label.text) + '</span>' + mark : mark;
      return '<li><a href="' + esc(l.p.url) + '" target="_blank" rel="noopener">' + name + arrowSVG(lang) + '</a></li>';
    }).join('') + '</ul>';
  }

  // Tags that name a platform show its mark; any other tag stays as text.
  function tagsHTML(picked, lang, label) {
    if (!picked.items.length) return '';
    return '<ul class="card-tags"' + langAttrs(picked, lang) + ' aria-label="' + esc(label) + '">' +
      picked.items.map(function (s) {
        var id = tagPlatform(s);
        if (!id) return '<li>' + esc(s) + '</li>';
        return '<li class="tag-mark" title="' + esc(s) + '">' + markSVG(id, 15) + '<span class="vh">' + esc(s) + '</span></li>';
      }).join('') + '</ul>';
  }

  // One work card. The title opens the same post the cover shows.
  function cardHTML(work, ctx) {
    var lang = ctx.lang;
    var t = TEXT[lang];
    var p = coverLink(work);
    var title = pick(work.title, lang);
    var client = pick(work.client, lang);
    var desc = pick(work.desc, lang);
    var titleText = title.text ? esc(title.text) : '<span class="ph">' + esc(t.phTitle) + '</span>';
    // A work shown by its image alone (an email, a screen) opens that image at full size.
    // (Not in a page saved as one file: browsers will not open an embedded image in a tab.)
    var full = !p && work.cover ? (ctx.resolve ? ctx.resolve(work.cover) : work.cover) : '';
    if (/^data:/.test(full)) full = '';
    var heading;
    if (p) {
      heading = '<a class="card-link" href="' + esc(p.url) + '" target="_blank" rel="noopener"' + langAttrs(title, lang) + '>' + titleText +
        ' <span class="vh">(' + esc(t.opensOn + ' ' + platformName(p, lang)) + ')</span></a>';
    } else if (full) {
      heading = '<a class="card-link" href="' + esc(full) + '" target="_blank" rel="noopener"' + langAttrs(title, lang) + '>' + titleText +
        ' <span class="vh">(' + esc(t.opensImage) + ')</span></a>';
    } else {
      heading = '<span' + langAttrs(title, lang) + '>' + titleText + '</span>';
    }
    var cover = coverHTML(work, ctx);
    var links = linksHTML(work, lang);
    var glyph = p && !links ? linkGlyph(p, 16) : (full ? ICON.image.replace('width="22" height="22"', 'width="17" height="17"') : '');
    var action = glyph ? '<span class="card-action" aria-hidden="true"><span class="pf">' + glyph + '</span>' + arrowSVG(lang) + '</span>' : '';
    return '<article class="card' + (cover ? '' : ' card--sample') + '" id="card-' + esc(work.id) + '" data-id="' + esc(work.id) + '">' +
      cover +
      '<div class="card-body">' +
      '<h4 class="card-title">' + heading + '</h4>' +
      (client.text ? '<span class="card-client"' + langAttrs(client, lang) + '>' + esc(client.text) + '</span>' : '') +
      (desc.text ? '<p class="card-desc"' + langAttrs(desc, lang) + '>' + esc(desc.text) + '</p>' : '') +
      listHTML('card-points', pickList(work.points, lang), lang) +
      tagsHTML(pickList(work.tags, lang), lang, t.tags) +
      samplesHTML(work, lang) +
      links +
      action +
      '</div></article>';
  }

  /* ---------- Bringing previews to life once the cards are on the page ---------- */

  var io = null;
  var ro = null;

  function scaleFrame(cover) {
    var box = cover.querySelector('.embed-box');
    if (!box) return;
    var w = Number(cover.getAttribute('data-w'));
    var h = Number(cover.getAttribute('data-h'));
    if (!w || !h) return;
    var rect = box.getBoundingClientRect();
    if (!rect.height) return;
    box.style.setProperty('--s', String(rect.height / h));
    box.style.setProperty('--fw', w + 'px');
    box.style.setProperty('--fh', h + 'px');
  }

  function loadEmbed(cover) {
    if (cover.getAttribute('data-loaded')) return;
    cover.setAttribute('data-loaded', '1');
    var box = cover.querySelector('.embed-box');
    var src = cover.getAttribute('data-embed');
    if (!box || !src) return;
    var frame = document.createElement('iframe');
    frame.src = src;
    frame.title = '';
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.setAttribute('allow', 'encrypted-media; picture-in-picture');
    frame.addEventListener('load', function () { cover.classList.add('is-loaded'); });
    box.appendChild(frame);
    scaleFrame(cover);
  }

  function hydrate(root) {
    if (!root) return;
    root.querySelectorAll('img.yt-img').forEach(function (img) {
      if (img.getAttribute('data-wired')) return;
      img.setAttribute('data-wired', '1');
      var id = img.getAttribute('data-yt');
      var check = function () {
        // YouTube answers a missing large cover with a 120 px grey image; use the standard one instead.
        if (img.naturalWidth && img.naturalWidth <= 120 && img.src.indexOf('maxresdefault') !== -1) {
          img.classList.add('is-letterboxed');
          img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
          return;
        }
        if (img.naturalWidth > 120) img.closest('.cover').classList.add('is-loaded');
      };
      img.addEventListener('load', check);
      img.addEventListener('error', function () {
        if (img.src.indexOf('maxresdefault') !== -1) {
          img.classList.add('is-letterboxed');
          img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
        } else {
          img.remove();
        }
      });
      if (img.complete) check();
    });
    root.querySelectorAll('.cover--image img').forEach(function (img) {
      if (img.getAttribute('data-wired')) return;
      img.setAttribute('data-wired', '1');
      // Landscape images fill the card; square and upright ones (posts) are shown whole inside a
      // frame, the way the video previews are; tall pages (an email, a long screen) show their top,
      // like a sheet coming out of the cover; very wide shots (an account's header) are shown whole.
      var shape = function () {
        if (!img.naturalWidth || !img.naturalHeight) return;
        var r = img.naturalWidth / img.naturalHeight;
        var cover = img.closest('.cover');
        cover.classList.toggle('is-tall', r < 0.75);
        cover.classList.toggle('is-framed', r >= 0.75 && r < 1.35);
        cover.classList.toggle('is-shot', r >= 2);
      };
      img.addEventListener('load', shape);
      img.addEventListener('error', function () { img.closest('.cover').classList.add('is-broken'); });
      if (img.complete) shape();
    });
    var covers = root.querySelectorAll('.cover--embed');
    if (!covers.length) return;
    if (!io && 'IntersectionObserver' in global) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadEmbed(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '300px 0px' });
    }
    if (!ro && 'ResizeObserver' in global) {
      ro = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { scaleFrame(entry.target); });
      });
    }
    covers.forEach(function (cover) {
      if (cover.getAttribute('data-watched')) return;
      cover.setAttribute('data-watched', '1');
      if (ro) ro.observe(cover);
      if (io) io.observe(cover); else loadEmbed(cover);
    });
  }

  // What a work still lacks, in the admin's words.
  function missingFields(work) {
    var out = [];
    if (!pick(work.title, 'ar').text) out.push('العنوان');
    var note = pick(work.coverNote, 'ar').text;
    if (note && !work.cover) out.push(note);
    var main = parseLink(work.link);
    if (main && !main.id && main.platform !== 'web') out.push('الرابط الكامل');
    return out;
  }

  global.Works = {
    PLATFORMS: PLATFORMS,
    TEXT: TEXT,
    esc: esc,
    digits: digits,
    westernDigits: westernDigits,
    countLabel: countLabel,
    pick: pick,
    pickList: pickList,
    langAttrs: langAttrs,
    parseLink: parseLink,
    workLinks: workLinks,
    coverLink: coverLink,
    isVideo: isVideo,
    platformName: platformName,
    markOf: markOf,
    markSVG: markSVG,
    linkGlyph: linkGlyph,
    tagPlatform: tagPlatform,
    describeLink: describeLink,
    embedSrc: embedSrc,
    coverHTML: coverHTML,
    ART: ART,
    cardHTML: cardHTML,
    hydrate: hydrate,
    arrowSVG: arrowSVG,
    chevronSVG: chevronSVG,
    missingFields: missingFields,
    ICON: ICON
  };
})(window);

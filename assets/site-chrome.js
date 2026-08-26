/**
 * Shared site chrome: consistent scroll position on page load.
 * If the URL has a hash (e.g. /index.html#anamorphic-flow), the browser scrolls to that section.
 * Otherwise, start at the top so each page feels consistent when using the main nav.
 */
(function () {
  'use strict';

  /* -------- Theme flag --------
   * DEFAULT_THEME is the site-wide flag: the theme used when a visitor
   * has no saved preference. Set it to 'dark' or 'light'.
   * A visitor's manual choice (via the toggle) is remembered in
   * localStorage and always wins over this default.
   */
  var DEFAULT_THEME = 'dark';
  var THEME_KEY = 'site-theme';
  var THEMES = ['light', 'dark'];

  function readStoredTheme() {
    try {
      var v = localStorage.getItem(THEME_KEY);
      return THEMES.indexOf(v) !== -1 ? v : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  // Apply as early as possible to minimise the flash of the wrong theme.
  applyTheme(readStoredTheme() || DEFAULT_THEME);

  function buildThemeToggle() {
    if (document.querySelector('.theme-toggle')) {
      return;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';

    function render() {
      var dark = currentTheme() === 'dark';
      btn.textContent = dark ? 'Light mode' : 'Dark mode';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      render();
    });

    render();
    document.body.appendChild(btn);
  }

  var STORES = {
    apple: 'https://apps.apple.com/za/app/anamorphicdesqueezer/id6757354068',
    google: 'https://play.google.com/store/apps/details?id=com.squeezer.app'
  };
  var ANAMORPHIC_PROMO = {
    src: '/assets/anamorphic-desqueezer-iphone-hero.png?v=3',
    href: '/anamorphic-desqueeze-iphone.html',
    alt: 'AnamorphicDesqueezer — See Anamorphic. Correctly. For Mobile, iPad, iPhone, MacBook, and Windows.',
    width: 1024,
    height: 1024
  };

  var ANAMORPHIC_PROMO_SKIP_PAGES = [
    '/cinelutlivegrade.html',
    '/mediautility.html',
    '/document-management-system.html',
    '/photo-editing.html',
    '/windows-tools.html',
    '/cinema-monitors.html',
    '/virtual-monitors.html',
    '/cinemonitor.html',
    '/get-apps.html'
  ];

  function normalizePromoPath(raw) {
    var path = (raw || '/').split('?')[0].split('#')[0];
    if (!path || path === '/') {
      return '/index.html';
    }
    path = path.replace(/\/$/, '');
    if (path === '/index') {
      return '/index.html';
    }
    if (path.indexOf('.') === -1) {
      path = path + '.html';
    }
    return path;
  }

  function shouldShowAnamorphicPromo() {
    if (document.body && document.body.getAttribute('data-no-anamorphic-promo') === 'true') {
      return false;
    }
    var path = normalizePromoPath(window.location.pathname);
    return ANAMORPHIC_PROMO_SKIP_PAGES.indexOf(path) === -1;
  }

  /* -------- Site-wide main nav (single source of truth) -------- */
  var SITE_NAV = [
    { id: 'filmmaking', label: 'Filmmaking', href: '/index.html#filmstudio' },
    { id: 'anamorphic', label: 'Anamorphic Flow', href: '/anamorphic.html' },
    { id: 'cinema-monitor', label: 'Cinema Monitor', href: '/cinema-monitors.html' },
    { id: 'livegrade', label: 'LiveGrade', href: '/cinelutlivegrade.html', title: 'LiveGrade · DIT · Dailies' },
    { id: 'get-apps', label: 'Get apps', href: '/get-apps.html' },
    { id: 'utilities', label: 'Utilities', href: '/mediautility.html' },
    { id: 'organize', label: 'Organize', href: '/document-management-system.html' },
    { id: 'photos', label: 'Photos', href: '/photo-editing.html', title: 'Photo Editing' },
    { id: 'win-anamorphic', label: 'WindowsAnamorphic', href: '/windows-tools.html' },
    { id: 'guides', label: 'Guides', href: '/guides.html' }
  ];

  var NAV_ACTIVE_BY_PATH = {
    '/index.html': 'filmmaking',
    '/filmstudio.html': 'filmmaking',
    '/cinema-monitors.html': 'cinema-monitor',
    '/virtual-monitors.html': 'cinema-monitor',
    '/cinemonitor.html': 'cinema-monitor',
    '/anamorphic.html': 'anamorphic',
    '/anamorphic-desqueeze-iphone.html': 'anamorphic',
    '/moment-anamorphic-desqueeze.html': 'anamorphic',
    '/sirui-anamorphic-desqueeze.html': 'anamorphic',
    '/cinemascope-export-online.html': 'anamorphic',
    '/get-apps.html': 'get-apps',
    '/cinelutlivegrade.html': 'livegrade',
    '/mediautility.html': 'utilities',
    '/document-management-system.html': 'organize',
    '/photo-editing.html': 'photos',
    '/windows-tools.html': 'win-anamorphic',
    '/guides.html': 'guides',
    '/how-to-desqueeze-1-33x.html': 'guides'
  };

  function resolveActiveNavId() {
    var path = normalizePromoPath(window.location.pathname);
    if (Object.prototype.hasOwnProperty.call(NAV_ACTIVE_BY_PATH, path)) {
      return NAV_ACTIVE_BY_PATH[path];
    }
    return null;
  }

  function buildSiteNav() {
    var nav = document.querySelector('.site-header .nav');
    if (!nav) {
      return;
    }
    var activeId = resolveActiveNavId();
    nav.setAttribute('aria-label', 'Main');
    while (nav.firstChild) {
      nav.removeChild(nav.firstChild);
    }
    for (var i = 0; i < SITE_NAV.length; i++) {
      var item = SITE_NAV[i];
      var link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      if (item.title) {
        link.setAttribute('title', item.title);
      }
      if (item.id === activeId) {
        link.setAttribute('aria-current', 'page');
      }
      nav.appendChild(link);
    }
  }

  function buildAnamorphicPromoBanner() {
    if (!shouldShowAnamorphicPromo()) {
      return;
    }
    var header = document.querySelector('.site-header');
    if (!header) {
      return;
    }
    if (document.querySelector('.anamorphic-promo-banner')) {
      return;
    }
    if (document.querySelector('.hub-hero__visual img[src*="anamorphic-desqueezer"]')) {
      return;
    }

    var banner = document.createElement('div');
    banner.className = 'anamorphic-promo-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'AnamorphicDesqueezer for mobile');

    var inner = document.createElement('div');
    inner.className = 'anamorphic-promo-banner__inner';

    var link = document.createElement('a');
    link.className = 'anamorphic-promo-banner__link';
    link.href = ANAMORPHIC_PROMO.href;

    var frame = document.createElement('div');
    frame.className = 'anamorphic-promo-banner__frame';

    var img = document.createElement('img');
    img.className = 'anamorphic-promo-banner__art';
    img.src = ANAMORPHIC_PROMO.src;
    img.width = ANAMORPHIC_PROMO.width;
    img.height = ANAMORPHIC_PROMO.height;
    img.alt = ANAMORPHIC_PROMO.alt;
    img.loading = 'eager';
    img.decoding = 'async';

    frame.appendChild(img);
    link.appendChild(frame);
    inner.appendChild(link);
    banner.appendChild(inner);
    header.insertAdjacentElement('afterend', banner);
  }

  function buildFooterTrust() {
    var footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.site-footer__trust')) {
      return;
    }

    var trust = document.createElement('div');
    trust.className = 'site-footer__trust';
    trust.setAttribute('aria-label', 'Store reviews and community');

    trust.innerHTML =
      '<div class="store-trust">' +
        '<a class="store-trust__badge store-trust__badge--apple" href="' + STORES.apple + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="store-trust__label">App Store <span class="store-trust__sub">See ratings &amp; reviews</span></span>' +
        '</a>' +
        '<a class="store-trust__badge store-trust__badge--google" href="' + STORES.google + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="store-trust__label">Google Play <span class="store-trust__sub">See ratings &amp; reviews · 1K+ downloads</span></span>' +
        '</a>' +
      '</div>';

    var inner = footer.querySelector('.site-footer__inner');
    if (inner) {
      footer.insertBefore(trust, inner);
    } else {
      footer.appendChild(trust);
    }
  }

  /* -------- Regional languages (site-wide) --------
   * Translates every page into the visitor's language via Google Translate.
   * Preference is remembered; first visit follows the browser language.
   */
  var LANG_KEY = 'site-lang';
  var LANG_MANUAL_KEY = 'site-lang-manual';
  var GEO_LANG_KEY = 'site-geo-lang';
  var GEO_COUNTRY_KEY = 'site-geo-country';
  var LANG_SOURCE = 'en';
  var RTL_LANGS = { ar: 1, fa: 1, he: 1, ur: 1, yi: 1, ps: 1 };
  var WORLD_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'ru', name: 'Русский' },
    { code: 'uk', name: 'Українська' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ar', name: 'العربية' },
    { code: 'he', name: 'עברית' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'اردو' },
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'zh-TW', name: '中文 (繁體)' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'th', name: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'fil', name: 'Filipino' },
    { code: 'sv', name: 'Svenska' },
    { code: 'da', name: 'Dansk' },
    { code: 'no', name: 'Norsk' },
    { code: 'fi', name: 'Suomi' },
    { code: 'cs', name: 'Čeština' },
    { code: 'sk', name: 'Slovenčina' },
    { code: 'ro', name: 'Română' },
    { code: 'hu', name: 'Magyar' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'bg', name: 'Български' },
    { code: 'hr', name: 'Hrvatski' },
    { code: 'sr', name: 'Српски' },
    { code: 'sl', name: 'Slovenščina' },
    { code: 'lt', name: 'Lietuvių' },
    { code: 'lv', name: 'Latviešu' },
    { code: 'et', name: 'Eesti' },
    { code: 'ca', name: 'Català' },
    { code: 'eu', name: 'Euskara' },
    { code: 'gl', name: 'Galego' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ne', name: 'नेपाली' },
    { code: 'si', name: 'සිංහල' },
    { code: 'my', name: 'မြန်မာ' },
    { code: 'km', name: 'ខ្មែរ' },
    { code: 'lo', name: 'ລາວ' },
    { code: 'ka', name: 'ქართული' },
    { code: 'hy', name: 'Հայերեն' },
    { code: 'az', name: 'Azərbaycan' },
    { code: 'kk', name: 'Қазақ' },
    { code: 'uz', name: 'Oʻzbek' },
    { code: 'mn', name: 'Монгол' },
    { code: 'is', name: 'Íslenska' },
    { code: 'ga', name: 'Gaeilge' },
    { code: 'cy', name: 'Cymraeg' },
    { code: 'mt', name: 'Malti' },
    { code: 'sq', name: 'Shqip' },
    { code: 'mk', name: 'Македонски' },
    { code: 'bs', name: 'Bosanski' },
    { code: 'be', name: 'Беларуская' }
  ];

  function langSupported(code) {
    for (var i = 0; i < WORLD_LANGUAGES.length; i++) {
      if (WORLD_LANGUAGES[i].code === code) {
        return true;
      }
    }
    return false;
  }

  function normalizeLang(raw) {
    if (!raw) {
      return LANG_SOURCE;
    }
    var value = String(raw).replace('_', '-');
    if (langSupported(value)) {
      return value;
    }
    var lower = value.toLowerCase();
    if (lower === 'zh' || lower.indexOf('zh-cn') === 0 || lower.indexOf('zh-hans') === 0) {
      return 'zh-CN';
    }
    if (lower.indexOf('zh-tw') === 0 || lower.indexOf('zh-hant') === 0 || lower === 'zh-hk') {
      return 'zh-TW';
    }
    if (lower.indexOf('pt') === 0) {
      return 'pt';
    }
    if (lower === 'nb' || lower === 'nn') {
      return 'no';
    }
    if (lower === 'tl') {
      return 'fil';
    }
    var base = lower.split('-')[0];
    if (langSupported(base)) {
      return base;
    }
    return LANG_SOURCE;
  }

  function readGoogTransCookie() {
    var match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if (!match) {
      return null;
    }
    try {
      var parts = decodeURIComponent(match[1]).split('/');
      return parts[2] || null;
    } catch (e) {
      return null;
    }
  }

  function readManualLang() {
    try {
      if (localStorage.getItem(LANG_MANUAL_KEY) === '1') {
        var stored = localStorage.getItem(LANG_KEY);
        if (stored) {
          return normalizeLang(stored);
        }
      }
    } catch (e) {}
    return null;
  }

  function detectBrowserLang() {
    var list = [];
    if (navigator.languages && navigator.languages.length) {
      list = navigator.languages;
    } else if (navigator.language) {
      list = [navigator.language];
    }
    for (var i = 0; i < list.length; i++) {
      var code = normalizeLang(list[i]);
      if (code !== LANG_SOURCE) {
        return code;
      }
    }
    return LANG_SOURCE;
  }

  /* Country → language (region auto). Example: Japan (JP) → Japanese (ja). */
  var COUNTRY_LANG = {
    JP: 'ja', KR: 'ko', CN: 'zh-CN', TW: 'zh-TW', HK: 'zh-TW', MO: 'zh-TW',
    ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
    EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es',
    SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es', PR: 'es',
    FR: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', MG: 'fr', CD: 'fr',
    CM: 'fr', HT: 'fr',
    DE: 'de', AT: 'de', LI: 'de',
    PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
    IT: 'it', SM: 'it', VA: 'it',
    NL: 'nl',
    PL: 'pl',
    RU: 'ru',
    UA: 'uk',
    TR: 'tr',
    SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar',
    MA: 'ar', OM: 'ar', QA: 'ar', TN: 'ar', BH: 'ar', DZ: 'ar', LY: 'ar',
    SY: 'ar', YE: 'ar', SD: 'ar',
    IL: 'he',
    IN: 'hi',
    BD: 'bn',
    LK: 'si',
    NP: 'ne',
    PK: 'ur',
    TH: 'th',
    VN: 'vi',
    ID: 'id',
    MY: 'ms',
    PH: 'fil',
    SE: 'sv',
    DK: 'da',
    NO: 'no',
    FI: 'fi',
    CZ: 'cs',
    SK: 'sk',
    RO: 'ro',
    HU: 'hu',
    GR: 'el',
    BG: 'bg',
    HR: 'hr',
    RS: 'sr',
    SI: 'sl',
    LT: 'lt',
    LV: 'lv',
    EE: 'et',
    IS: 'is',
    IE: 'ga',
    GE: 'ka',
    AM: 'hy',
    AZ: 'az',
    KZ: 'kk',
    UZ: 'uz',
    MN: 'mn',
    IR: 'fa',
    AF: 'fa',
    ET: 'am',
    KE: 'sw',
    TZ: 'sw',
    ZA: 'af',
    MM: 'my',
    KH: 'km',
    LA: 'lo',
    AL: 'sq',
    MK: 'mk',
    BA: 'bs',
    BY: 'be',
    MT: 'mt',
    CY: 'el'
  };

  function langFromCountry(countryCode) {
    if (!countryCode) {
      return null;
    }
    var mapped = COUNTRY_LANG[String(countryCode).toUpperCase()];
    return mapped && langSupported(mapped) ? mapped : null;
  }

  function fetchRegionLang() {
    try {
      var cached = sessionStorage.getItem(GEO_LANG_KEY);
      if (cached) {
        return Promise.resolve(normalizeLang(cached));
      }
      var cachedCountry = sessionStorage.getItem(GEO_COUNTRY_KEY);
      if (cachedCountry) {
        var fromCache = langFromCountry(cachedCountry);
        if (fromCache) {
          sessionStorage.setItem(GEO_LANG_KEY, fromCache);
          return Promise.resolve(fromCache);
        }
      }
    } catch (e) {}

    // Lightweight country lookup (no API key). Japan → JP → ja, etc.
    return fetch('https://get.geojs.io/v1/ip/country.json', { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('geo failed');
        }
        return res.json();
      })
      .then(function (data) {
        var country = (data && (data.country || data.country_code)) || '';
        try {
          sessionStorage.setItem(GEO_COUNTRY_KEY, String(country).toUpperCase());
        } catch (e) {}
        var lang = langFromCountry(country) || detectBrowserLang();
        try {
          sessionStorage.setItem(GEO_LANG_KEY, lang);
        } catch (e) {}
        return lang;
      })
      .catch(function () {
        return detectBrowserLang();
      });
  }

  function resolveAutoLang() {
    var manual = readManualLang();
    if (manual) {
      return Promise.resolve(manual);
    }
    return fetchRegionLang();
  }

  function setGoogTransCookie(lang) {
    var expireClear = 'Thu, 01 Jan 1970 00:00:00 GMT';
    var expireSet = 'Sat, 01 Jan 2050 00:00:00 GMT';
    var host = location.hostname;

    function write(value, expires, domain) {
      var cookie = 'googtrans=' + value + '; expires=' + expires + '; path=/';
      if (domain) {
        cookie += '; domain=' + domain;
      }
      document.cookie = cookie;
    }

    if (!lang || lang === LANG_SOURCE) {
      write('', expireClear, '');
      write('', expireClear, host);
      write('', expireClear, '.' + host);
      return;
    }
    var value = '/' + LANG_SOURCE + '/' + lang;
    write(value, expireSet, '');
    write(value, expireSet, host);
    write(value, expireSet, '.' + host);
  }

  function applyDocumentDirection(lang) {
    var rtl = !!RTL_LANGS[String(lang).split('-')[0]];
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang === LANG_SOURCE ? 'en' : lang);
  }

  function triggerGoogleCombo(lang) {
    var combo = document.querySelector('.goog-te-combo');
    if (!(combo instanceof HTMLSelectElement)) {
      return false;
    }
    var value = lang === LANG_SOURCE ? '' : lang;
    if (combo.value === value) {
      return true;
    }
    combo.value = value;
    combo.dispatchEvent(new Event('change'));
    return true;
  }

  function setLanguage(lang, reload, manual) {
    var next = normalizeLang(lang);
    try {
      localStorage.setItem(LANG_KEY, next);
      if (manual) {
        localStorage.setItem(LANG_MANUAL_KEY, '1');
      }
    } catch (e) {}
    setGoogTransCookie(next);
    applyDocumentDirection(next);
    if (reload === false) {
      triggerGoogleCombo(next);
      return;
    }
    try {
      sessionStorage.setItem('site-lang-reload', '1');
    } catch (e) {}
    location.reload();
  }

  function mountLanguageSwitcher(active) {
    if (document.querySelector('.lang-switcher')) {
      var existing = document.getElementById('site-lang-select');
      if (existing) {
        existing.value = active;
      }
      return;
    }

    var wrap = document.createElement('div');
    wrap.className = 'lang-switcher lang-switcher--pulse';
    wrap.setAttribute('role', 'navigation');
    wrap.setAttribute('aria-label', 'Translate this website');
    wrap.title = 'Translate this website';

    var cue = document.createElement('span');
    cue.className = 'lang-switcher__cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.innerHTML =
      '<span class="lang-switcher__cursor"></span>' +
      '<span class="lang-switcher__hint">Translate</span>';

    var label = document.createElement('label');
    label.className = 'lang-switcher__label';
    label.setAttribute('for', 'site-lang-select');
    label.textContent = 'Language';

    var select = document.createElement('select');
    select.id = 'site-lang-select';
    select.className = 'lang-switcher__select';
    select.setAttribute('aria-label', 'Translate website — choose language');

    for (var i = 0; i < WORLD_LANGUAGES.length; i++) {
      var opt = document.createElement('option');
      opt.value = WORLD_LANGUAGES[i].code;
      opt.textContent = WORLD_LANGUAGES[i].name;
      if (WORLD_LANGUAGES[i].code === active) {
        opt.selected = true;
      }
      select.appendChild(opt);
    }

    function markInteracted() {
      wrap.classList.remove('lang-switcher--pulse');
      wrap.classList.add('lang-switcher--used');
      try {
        sessionStorage.setItem('site-lang-hint-seen', '1');
      } catch (e) {}
    }

    select.addEventListener('change', function () {
      markInteracted();
      setLanguage(select.value, true, true);
    });
    select.addEventListener('focus', markInteracted);
    select.addEventListener('pointerdown', markInteracted);
    wrap.addEventListener('pointerdown', markInteracted);

    try {
      if (sessionStorage.getItem('site-lang-hint-seen') === '1') {
        wrap.classList.remove('lang-switcher--pulse');
        wrap.classList.add('lang-switcher--used');
      }
    } catch (e) {}

    wrap.appendChild(cue);
    wrap.appendChild(label);
    wrap.appendChild(select);
    document.body.appendChild(wrap);
  }

  function loadGoogleTranslate(active) {
    if (!document.getElementById('google_translate_element')) {
      var host = document.createElement('div');
      host.id = 'google_translate_element';
      host.className = 'google-translate-host';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }

    window.googleTranslateElementInit = function () {
      if (!(window.google && google.translate && google.translate.TranslateElement)) {
        return;
      }
      new google.translate.TranslateElement(
        {
          pageLanguage: LANG_SOURCE,
          autoDisplay: false,
          multilanguagePage: true
        },
        'google_translate_element'
      );
      var tries = 0;
      var timer = setInterval(function () {
        tries += 1;
        if (triggerGoogleCombo(active) || tries > 20) {
          clearInterval(timer);
        }
      }, 250);
    };

    if (!document.getElementById('google-translate-script')) {
      var script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  function buildLanguageSwitcher() {
    resolveAutoLang().then(function (active) {
      applyDocumentDirection(active);

      var reloadGuard = null;
      try {
        reloadGuard = sessionStorage.getItem('site-lang-reload');
      } catch (e) {}

      if (active !== LANG_SOURCE && !readGoogTransCookie() && reloadGuard !== '1') {
        setGoogTransCookie(active);
        try {
          sessionStorage.setItem('site-lang-reload', '1');
          sessionStorage.setItem(GEO_LANG_KEY, active);
        } catch (e) {}
        location.reload();
        return;
      }
      try {
        sessionStorage.removeItem('site-lang-reload');
      } catch (e) {}

      if (active === LANG_SOURCE && readGoogTransCookie()) {
        setGoogTransCookie(LANG_SOURCE);
      }

      mountLanguageSwitcher(active);
      loadGoogleTranslate(active);
    });
  }

  function onDomReady() {
    buildSiteNav();
    buildAnamorphicPromoBanner();
    buildLanguageSwitcher();
    buildThemeToggle();
    buildFooterTrust();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
  } else {
    onDomReady();
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  function scrollOnLoad() {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollOnLoad);
  } else {
    scrollOnLoad();
  }
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      scrollOnLoad();
    }
  });
})();

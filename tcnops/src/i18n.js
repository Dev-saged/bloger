window.TCN_I18N = (function () {
  "use strict";
  var h = document.documentElement, en = h.classList.contains("tcn-en");
  /* Arabic (source) -> English. Used only when the visitor's language is English. */
  var AR2EN = {
    "انتقل إلى المحتوى": "Skip to content", "ابحث في المقالات…": "Search articles…", "بحث": "Search", "إغلاق": "Close",
    "الرئيسية": "Home", "الأقسام": "Sections", "القائمة": "Menu", "الوضع": "Theme", "الأعلى": "Top", "عاجل": "Breaking",
    "الذكاء الاصطناعي": "Artificial Intelligence", "أخبار التقنية": "Tech News", "تطبيقات وأدوات": "Apps & Tools",
    "الأمن الرقمي": "Cyber Security", "سياسة الخصوصية": "Privacy Policy", "اتصل بنا": "Contact Us", "من نحن": "About Us",
    "سياسة التحرير": "Editorial Policy", "إخلاء المسؤولية": "Disclaimer", "الصفحات": "Pages", "تابعنا": "Follow us",
    "أحدث المقالات": "Latest articles", "مقالات هذا الموقع": "Articles on this site", "تابع جديد التقنية أولاً بأول": "Get tech news first",
    "على قنواتنا في واتساب وتيليجرام": "On our WhatsApp and Telegram channels", "واتساب": "WhatsApp", "تيليجرام": "Telegram",
    "تحميل المزيد": "Load more", "جارٍ التحميل…": "Loading…", "مقالات أقدم": "Older posts", "مقالات أحدث": "Newer posts",
    "عرض الكل": "View all", "الأرشيف": "Archive", "أرشيف المقالات": "Article archive", "كل ما نشرناه، مرتّباً زمنياً، مع بحث وتصفية فورية.": "Everything we published, in order, with instant search and filters.", "مقال": "posts", "سنة": "years", "تصنيف": "categories", "كل التصنيفات": "All categories", "الأحدث أولاً": "Newest first", "الأقدم أولاً": "Oldest first", "لا توجد نتائج": "No results", "جديد": "New", "آخر الأخبار": "Latest news", "إيقاف الشريط مؤقتاً": "Pause ticker", "تشغيل الشريط": "Play ticker", "البوابة التقنية": "AIT News", "عالم التقنية": "Tech-WD", "عرب هاردوير": "ArabHardware", "أحدث المقالات": "Latest articles", "الكل": "All", "الإنترنت": "Internet", "عالم الإنترنت": "Internet", "أبرز المقالات": "Top stories", "د قراءة": "min read", "أ−": "A−", "أ+": "A+", "الأكثر قراءة": "Most read", "التصنيفات": "Categories", "عن الموقع": "About",
    "محتويات المقال": "Table of contents", "نسخ الرابط": "Copy link", "تم النسخ": "Copied", "مشاركة": "Share",
    "مقالات ذات صلة": "Related articles", "المقال السابق": "Previous article", "المقال التالي": "Next article",
    "الكاتب": "Author", "إعلان": "Ad", "نسخ": "Copy", "تم": "Done", "عرض كل النتائج": "See all results",
    "لا توجد مقالات هنا بعد": "No articles here yet", "جرّب البحث بكلمات أخرى أو تصفّح الأقسام.": "Try other keywords or browse sections.",
    "الصفحة غير موجودة": "Page not found", "ربما نُقل الرابط أو حُذف. ابحث عمّا تريد:": "The link may have moved or been removed. Search for what you need:",
    "العودة للرئيسية": "Back to home", "اكتب كلمتين على الأقل لبدء البحث الفوري.": "Type at least two characters to search instantly.",
    "تصغير الخط": "Smaller text", "تكبير الخط": "Larger text", "العودة إلى أعلى الصفحة": "Back to top",
    "الوضع الفاتح والداكن": "Light and dark mode", "مقالات هذا الشهر": "Total articles", "إجمالي المقالات": "Total articles",
    "جميع الحقوق محفوظة": "All rights reserved", "تصميم وتطوير": "Designed & developed by", "ساجد العبادلة": "Sajed Al-Abadla",
    "من غزة، فلسطين": "from Gaza, Palestine", "تعليقات": "Comments", "التعليقات": "Comments", "بحث:": "Search:",
    "أخبار": "News", "تطبيقات": "Apps", "ذكاء اصطناعي": "AI", "مقالات": "Articles", "أنترنت": "Internet", "خصوصية بيانات": "Data Privacy"
  };
  /* English -> Arabic safety net for leftovers saved in Blogger's own widget data. */
  var EN2AR = {
    "Recent": "الأحدث", "Popular": "الأكثر قراءة", "Comments": "التعليقات", "Archive": "الأرشيف", "About Me": "من أنا",
    "Latest News": "آخر الأخبار", "view All": "عرض الكل", "view all": "عرض الكل", "View All": "عرض الكل",
    "Menu": "القائمة", "Featured Post": "مقال مميز", "Contact Form": "نموذج الاتصال", "Read More": "اقرأ المزيد",
    "No Posts found!": "لا توجد مقالات!", "No posts found.": "لا توجد مقالات."
  };
  var RULES = [
    [/^الصفحة (\d+) من (\d+)$/, "Page $1 of $2"], [/^الصفحة (\d+)$/, "Page $1"],
    [/^(\d+) د قراءة$/, "$1 min read"], [/^نتائج البحث عن «(.*)»$/, "Search results for \u201C$1\u201D"], [/^تصنيف: (.+)$/, "Category: $1"], [/^لا توجد نتائج لـ «(.*)»\. جرّب كلمة أقصر أو تصفّح الأقسام:$/, "No results for \u201C$1\u201D. Try a shorter word or browse sections:"],
    [/^لا توجد مقالات مطابقة للوسم «(.*)»\.$/, "No posts matching tag “$1”."],
    [/^لا توجد مقالات في التصنيف «(.*)»\.$/, "No posts found for label “$1”."],
    [/^عرض كل المقالات في (.+)$/, "View all posts in $1"]
  ];
  var FOOT = [["جميع الحقوق محفوظة", "All rights reserved"], ["تصميم وتطوير", "Designed & developed by"], ["ساجد العبادلة", "Sajed Al-Abadla"], ["من غزة، فلسطين", "from Gaza, Palestine"]];
  var ARB = /[؀-ۿ]/;
  var ATTRS = ["aria-label", "title", "placeholder", "alt"];
  var AUTO = ".post-body,.post-title,.tile h2,.tile h3,.row h2,.row h3,.row p,.hcard h3,.pop h3,.ticker li,.sres b,.pn b,.t-big p";

  function tr(s) {
    var t = s.trim();
    if (!t) return s;
    if (!en) { return Object.prototype.hasOwnProperty.call(EN2AR, t) ? s.replace(t, EN2AR[t]) : s; }
    if (!ARB.test(t)) return s;
    if (Object.prototype.hasOwnProperty.call(AR2EN, t)) return s.replace(t, AR2EN[t]);
    for (var i = 0; i < RULES.length; i++) { if (RULES[i][0].test(t)) return s.replace(t, t.replace(RULES[i][0], RULES[i][1])); }
    return s;
  }
  function footer(node) {
    var out = node.nodeValue;
    for (var i = 0; i < FOOT.length; i++) out = out.split(FOOT[i][0]).join(FOOT[i][1]);
    if (out !== node.nodeValue) node.nodeValue = out;
  }
  function walk(n) {
    if (n.nodeType === 3) {
      var p = n.parentNode, v = n.nodeValue;
      if (en && p && p.closest && p.closest(".fbar")) footer(n);
      var r = tr(v); if (r !== v) n.nodeValue = r;
      return;
    }
    if (n.nodeType !== 1) return;
    var tag = n.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;
    if (n.classList && n.classList.contains("post-body")) { if (en) n.setAttribute("dir", "auto"); return; }
    for (var i = 0; i < ATTRS.length; i++) {
      var a = n.getAttribute(ATTRS[i]);
      if (a) { var t = tr(a); if (t !== a) n.setAttribute(ATTRS[i], t); }
    }
    if (en && n.matches && n.matches(AUTO)) n.setAttribute("dir", "auto");
    if (en && tag === "OPTION") { var x = tr(n.textContent); if (x !== n.textContent) n.textContent = x; }
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  function date(iso, short) {
    var p = String(iso || "").split("T")[0].split("-");
    if (p.length !== 3) return iso;
    try {
      return new Intl.DateTimeFormat(en ? "en-US" : "ar-u-nu-latn", { year: "numeric", month: short ? "short" : "long", day: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])));
    } catch (e) { return iso; }
  }
  function toggleUrl() {
    var u = new URL(location.href); u.searchParams.delete("lang"); return u.toString();
  }
  function addSwitch() {
    var b = document.querySelector("[data-lang]");
    if (!b) return;
    var S = window.TCN_S || {};
    if (/^(لا|no|off)$/i.test(S["الإنجليزية_التلقائية"] || "") && !en) { b.remove(); return; }
    b.hidden = false; b.lang = en ? "ar" : "en"; b.textContent = en ? "ع" : "EN";
    b.setAttribute("aria-label", en ? "ع — التبديل إلى العربية" : "EN — Switch to English");
    b.addEventListener("click", function () {
      try { localStorage.setItem("tcnops-lang", en ? "ar" : "en"); } catch (e) { }
      location.href = toggleUrl();
    });
  }
  function init() {
    walk(document.body);
    addSwitch();
    h.classList.add("tcn-ready");
    var queue = [], busy = false;
    new MutationObserver(function (muts) {
      muts.forEach(function (m) { m.addedNodes.forEach(function (n) { queue.push(n); }); });
      if (busy) return; busy = true;
      requestAnimationFrame(function () { busy = false; var q = queue; queue = []; q.forEach(function (n) { if (n.isConnected !== false) walk(n); }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  return { en: en, t: tr, date: date, walk: walk };
})();

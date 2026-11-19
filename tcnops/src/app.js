(function () {
  "use strict";
  var d = document, h = d.documentElement, C = window.TCN_CFG || {};
  C.label = C.label || ((d.querySelector("[data-first-label]") || {}).textContent || "").trim();
  var HOME = (C.home || "/").replace(/\/?$/, "/");
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var buzz = function () { if (!still && navigator.vibrate) try { navigator.vibrate(8); } catch (e) { } };

  var S = window.TCN_S || {};
  /* إزالة المساحات الفارغة دون أي إزاحة للمحتوى */
  $$(".zone .widget").forEach(function (w) { if (!w.querySelector("img,iframe,ins,script,a,div,p,span,ul") && !w.textContent.trim()) w.remove(); });
  $$(".zone").forEach(function (z) { if (!z.querySelector(".widget")) z.remove(); });
  var OFF = { "بديل_التصنيفات": 1, "بديل_الشريط_الجانبي": 1 };
  var on = function (k) { var v = S[k]; return v === undefined ? !OFF[k] : !/^(لا|no|off|false|0|إيقاف|معطل)$/i.test(v); };
  var val = function (k, def) { return S[k] !== undefined && S[k] !== "" ? S[k] : def; };

  /* ---- التواريخ ---- */
  var LANG = h.classList.contains("tcn-en") ? "en" : "ar";
  var fmtDate = function (iso, rel) {
    var dt = new Date(iso); if (isNaN(dt)) return "";
    try {
      if (rel) {
        var diff = (dt - Date.now()) / 1000, a = Math.abs(diff), rtf = new Intl.RelativeTimeFormat(LANG, { numeric: "auto" });
        if (a < 3600) return rtf.format(Math.round(diff / 60), "minute");
        if (a < 86400) return rtf.format(Math.round(diff / 3600), "hour");
        if (a < 604800) return rtf.format(Math.round(diff / 86400), "day");
      }
      return new Intl.DateTimeFormat(LANG === "ar" ? "ar-u-nu-latn" : "en-US", { year: "numeric", month: "long", day: "numeric" }).format(dt);
    } catch (e) { return dt.toLocaleDateString(); }
  };
  var localizeTimes = function (root) {
    $$("time[datetime]", root).forEach(function (t) {
      if (t.dataset.done) return; t.dataset.done = 1;
      var full = fmtDate(t.getAttribute("datetime"));
      if (!full) return;
      t.title = full; t.textContent = t.hasAttribute("data-rel") ? fmtDate(t.getAttribute("datetime"), true) : full;
    });
  };

  /* ---- الخلاصات ---- */
  var firstImg = function (e) {
    if (e.media$thumbnail) return e.media$thumbnail.url.replace(/\/s\d+(-c)?\//, "/w640-h400-p-k-no-nu/").replace(/=s\d+(-c)?$/, "=w640-h400-p-k-no-nu");
    var c = (e.content || e.summary || {}).$t || "", m = c.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : "";
  };
  var parseFeed = function (j) {
    return ((j.feed && j.feed.entry) || []).map(function (e) {
      var link = (e.link || []).filter(function (l) { return l.rel === "alternate"; })[0] || {};
      var c = ((e.summary || e.content || {}).$t || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return { title: e.title.$t, url: link.href, img: firstImg(e), date: e.published.$t, snippet: c.slice(0, 160), labels: (e.category || []).map(function (x) { return x.term; }) };
    });
  };
  var feed = function (opt) {
    var u = HOME + "feeds/posts/" + (opt.full ? "default" : "summary") + (opt.label ? "/-/" + encodeURIComponent(opt.label) : "") + "?alt=json&max-results=" + (opt.max || 8) + (opt.q ? "&q=" + encodeURIComponent(opt.q) : "");
    return fetch(u, { credentials: "omit" }).then(function (r) { if (!r.ok) throw r.status; return r.json(); }).then(function (j) {
      return { items: parseFeed(j), total: +((j.feed.openSearch$totalResults || {}).$t || 0) };
    });
  };
  var thumb = function (p, cls) {
    return '<div class="thumb ' + (cls || "") + '">' + (p.img ? '<img loading="lazy" decoding="async" src="' + esc(p.img) + '" alt="" width="640" height="400">' : '<span class="ph">' + esc((p.title || "T").trim().charAt(0)) + "</span>") + "</div>";
  };

  /* ---- الوضع الداكن ---- */
  if (on("الوضع_الداكن")) {
    $$("[data-theme-toggle]").forEach(function (b) {
      b.hidden = false;
      b.addEventListener("click", function () {
        var nx = h.dataset.theme === "dark" ? "light" : "dark";
        var go = function () { h.dataset.theme = nx; try { localStorage.setItem("tcn-theme", nx); } catch (e) { } };
        d.startViewTransition && !still ? d.startViewTransition(go) : go(); buzz();
      });
    });
  } else { $$("[data-theme-toggle]").forEach(function (b) { b.remove(); }); }

  /* ---- الهيدر الذكي ---- */
  var hdr = $(".hdr"), lastY = 0, tt = $(".to-top"), prog = $(".progress"), ticking = false;
  var onScroll = function () {
    var y = scrollY;
    if (hdr && on("إخفاء_الهيدر_عند_النزول")) hdr.classList.toggle("hide", y > 400 && y > lastY && !d.querySelector("dialog[open]"));
    lastY = y;
    if (tt) tt.classList.toggle("on", y > 700);
    if (prog) { var b = $(".post-body"); if (b) { var r = b.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight * .6))); prog.style.transform = "scaleX(" + p + ")"; } }
    ticking = false;
  };
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if (tt) { if (on("زر_الأعلى")) tt.addEventListener("click", function () { scrollTo({ top: 0, behavior: still ? "auto" : "smooth" }); }); else tt.remove(); }

  /* ---- البحث الفوري ---- */
  var sd = $("#sdlg");
  if (sd) {
    var si = $("input", sd), sr = $(".sres", sd), timer, ctrl;
    var openS = function () { if (sd.showModal) sd.showModal(); else sd.setAttribute("open", ""); setTimeout(function () { si.focus(); }, 30); };
    $$("[data-search]").forEach(function (b) { b.addEventListener("click", openS); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/INPUT|TEXTAREA/.test(d.activeElement.tagName) && !d.activeElement.isContentEditable) { e.preventDefault(); openS(); }
    });
    sd.addEventListener("click", function (e) { if (e.target === sd) sd.close(); });
    var hint = sr.innerHTML;
    var mark = function (t, q) { var s = esc(t); q.split(/\s+/).filter(Boolean).forEach(function (w) { s = s.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>"); }); return s; };
    if (on("البحث_الفوري")) si.addEventListener("input", function () {
      var q = si.value.trim(); clearTimeout(timer);
      if (q.length < 2) { sr.innerHTML = hint; return; }
      sr.innerHTML = '<div class="skel" style="height:64px;margin:8px"></div><div class="skel" style="height:64px;margin:8px"></div>';
      timer = setTimeout(function () {
        feed({ q: q, max: 8, full: true }).then(function (r) {
          if (si.value.trim() !== q) return;
          sr.innerHTML = r.items.length ? r.items.map(function (p) {
            return '<a href="' + esc(p.url) + '">' + thumb(p) + '<span><b>' + mark(p.title, q) + "</b><small>" + esc(fmtDate(p.date)) + "</small></span></a>";
          }).join("") + '<a class="shint" style="display:block" href="' + HOME + "search?q=" + encodeURIComponent(q) + '">عرض كل النتائج</a>'
            : '<div class="shint"><p>لا توجد نتائج لـ «' + esc(q) + '». جرّب كلمة أقصر أو تصفّح الأقسام:</p>' + ($(".chips") ? '<div class="chips">' + $(".chips").innerHTML + "</div>" : "") + "</div>";
        }).catch(function () { sr.innerHTML = '<div class="shint">تعذّر البحث الآن. اضغط Enter للبحث في الصفحة الكاملة.</div>'; });
      }, 280);
    });
  }

  /* ---- شريط الأخبار: أخبار الموقع + مواقع تقنية عربية ---- */
  var tk = $("[data-ticker]"), tw = tk && tk.closest(".ticker");
  if (tw) {
    if (!on("شريط_الأخبار")) tw.remove();
    else {
      var TMAX = +val("عدد_أخبار_الشريط", 18), KEY = "tcn-tk-v2";
      var bridge = val("جسر_الخلاصات", "https://api.rss2json.com/v1/api.json?rss_url=");
      var srcs = on("أخبار_خارجية_في_الشريط") ? val("مصادر_الشريط", "https://aitnews.com/feed/ | https://www.tech-wd.com/wd/feed/ | https://www.arabhardware.net/feed").split(/\s*[|،]\s*/).filter(function (u) { return /^https?:\/\//.test(u); }) : [];
      var host = function (u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
      var NAMES = { "aitnews.com": "البوابة التقنية", "tech-wd.com": "عالم التقنية", "arabhardware.net": "عرب هاردوير", "unlimit-tech.com": "أنليمت تك" };
      var paint = function (items) {
        if (!items.length) { tw.remove(); return; }
        var fresh = Date.now() - 3 * 3600e3;
        var li = items.map(function (x) {
          return '<li class="' + (x.own ? "own" : "ext") + '"><a href="' + esc(x.u) + '"' + (x.own ? "" : ' target="_blank" rel="noopener nofollow"') + '><span class="src">' + esc(x.s) + "</span>" +
            (new Date(x.d) > fresh ? '<span class="new">جديد</span>' : "") + '<span class="tt">' + esc(x.t) + '</span><time datetime="' + esc(x.d) + '" data-rel></time></a></li>';
        }).join("");
        tk.innerHTML = li + li.replace(/<li class="/g, '<li aria-hidden="true" class="').replace(/<a /g, '<a tabindex="-1" ');
        localizeTimes(tk);
        requestAnimationFrame(function () { tk.style.setProperty("--tick-d", Math.max(35, Math.round(tk.scrollWidth / 2 / +val("سرعة_الشريط", 55))) + "s"); });
      };
      var mix = function (own, ext) {
        var seen = {}, out = [], i = 0, j = 0;
        ext = ext.filter(function (x) { var k = x.t.replace(/\s+/g, ""); if (seen[k]) return false; seen[k] = 1; return true; })
          .sort(function (a, b) { return new Date(b.d) - new Date(a.d); });
        while (out.length < TMAX && (i < own.length || j < ext.length)) {
          if (i < own.length && (out.length % 3 === 0 || j >= ext.length)) out.push(own[i++]); else if (j < ext.length) out.push(ext[j++]); else out.push(own[i++]);
        }
        return out;
      };
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { }
      if (cached && Date.now() - cached.t < 15 * 60e3 && cached.items.length) paint(cached.items);
      else {
        var ownP = on("أخبار_الموقع_في_الشريط") ? feed({ label: (tk.dataset.label && !/^(تلقائي|auto)?$/.test(tk.dataset.label.trim()) ? tk.dataset.label.trim() : val("وسم_الشريط", "")), max: 8 }).then(function (r) { return r.items.map(function (p) { return { t: p.title, u: p.url, d: p.date, s: val("اسم_الموقع_في_الشريط", "TCNOPS"), own: 1 }; }); }).catch(function () { return []; }) : Promise.resolve([]);
        var ready = val("مصدر_الأخبار_الجاهز", "https://raw.githubusercontent.com/Dev-saged/bloger/tcnops-feed/ticker.json");
        var viaBridge = function () { return Promise.all(srcs.map(function (u) {
          return fetch(bridge + encodeURIComponent(u)).then(function (r) { return r.json(); }).then(function (j) {
            var name = NAMES[host(u)] || (j.feed && j.feed.title) || host(u);
            return (j.items || []).slice(0, 8).map(function (x) { return { t: x.title, u: x.link, d: String(x.pubDate || "").replace(" ", "T") + "Z", s: name, own: 0 }; });
          }).catch(function () { return []; });
        })).then(function (all) { return [].concat.apply([], all); }); };
        var extP = !srcs.length ? Promise.resolve([]) : (ready ? fetch(ready, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
          var it = (j.items || []).filter(function (x) { return x.t && x.u; }).map(function (x) { return { t: x.t, u: x.u, d: x.d, s: x.s, own: 0 }; });
          if (!it.length) throw 0; return it;
        }).catch(viaBridge) : viaBridge());
        Promise.all([ownP, extP]).then(function (r) {
          var items = mix(r[0], r[1]);
          if (items.length) try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), items: items })); } catch (e) { }
          paint(items);
        });
      }
      var pb = $("[data-tk-pause]", tw);
      pb && pb.addEventListener("click", function () {
        var p = tw.classList.toggle("paused"); pb.setAttribute("aria-pressed", p); pb.setAttribute("aria-label", p ? "تشغيل الشريط" : "إيقاف الشريط مؤقتاً"); buzz();
      });
    }
  }

  /* ---- بدائل تلقائية إذا غابت أدوات بلوجر ---- */
  var cats;
  var getCats = function () {
    return cats || (cats = fetch(HOME + "feeds/posts/summary?alt=json&max-results=0").then(function (r) { return r.json(); }).then(function (j) { return ((j.feed && j.feed.category) || []).map(function (c) { return c.term; }); }).catch(function () { return []; }));
  };
  var markCur = function (root) { var cu = location.href.split(/[?#]/)[0]; $$("a", root).forEach(function (a) { if (a.href.split(/[?#]/)[0] === cu) a.setAttribute("aria-current", "page"); }); };
  var lblUrl = function (t) { return HOME + "search/label/" + encodeURIComponent(t); };
  var cf = $("[data-chips-fallback]");
  if (cf && on("بديل_التصنيفات") && !$(".chips")) getCats().then(function (l) {
    if (!l.length) return;
    cf.innerHTML = '<nav aria-label="التصنيفات"><ul class="chips"><li><a href="' + HOME + '">الكل</a></li>' + l.slice(0, 30).map(function (t) { return '<li><a href="' + lblUrl(t) + '">' + esc(t) + "</a></li>"; }).join("") + "</ul></nav>";
    markCur(cf);
  });
  var sf = $("[data-side-fallback]");
  if (sf && on("بديل_الشريط_الجانبي")) {
    if (!$(".pop")) feed({ max: 5, full: true }).then(function (r) {
      if (!r.items.length) return;
      sf.insertAdjacentHTML("beforeend", '<div class="card-w"><div class="wh"><h2>أحدث المقالات</h2></div><ol class="pop">' + r.items.map(function (p) { return '<li><a href="' + esc(p.url) + '">' + thumb(p) + "<h3>" + esc(p.title) + "</h3></a></li>"; }).join("") + "</ol></div>");
    }).catch(function () { });
    if (!$(".cloud")) getCats().then(function (l) {
      if (!l.length) return;
      sf.insertAdjacentHTML("beforeend", '<div class="card-w" style="margin-top:20px"><div class="wh"><h2>التصنيفات</h2></div><ul class="cloud">' + l.map(function (t) { return '<li><a href="' + lblUrl(t) + '">' + esc(t) + "</a></li>"; }).join("") + "</ul></div>");
    });
  }

  /* ---- بطاقات الواجهة ---- */
  var st = $("[data-stat]");
  if (st) {
    if (!on("بطاقة_الإحصاء")) st.remove();
    else feed({ max: 1 }).then(function (r) { if (r.total) $("strong", st).textContent = r.total; }).catch(function () { });
  }
  var fl = $("[data-follow]");
  if (fl) {
    if (!on("بطاقة_المتابعة")) fl.remove();
    else { var wa = val("قناة_واتساب", ""), tg = val("قناة_تيليجرام", ""); if (wa) $("[data-wa]", fl).href = wa; if (tg) $("[data-tg]", fl).href = tg; }
  }

  /* ---- أقسام الرئيسية (تحميل كسول) ---- */
  var lazy = function (el, fn) {
    if (!("IntersectionObserver" in window)) return fn();
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: "400px" }); io.observe(el);
  };
  $$("[data-hsec]").forEach(function (sec) {
    var label = sec.dataset.hsec.trim(), g = $(".hgrid", sec), n = +(sec.dataset.n || 4);
    g.innerHTML = new Array(n + 1).join('<div class="skel" style="height:240px"></div>');
    lazy(sec, function () {
      feed({ label: label, max: n, full: true }).then(function (r) {
        if (!r.items.length) { sec.remove(); return; }
        g.innerHTML = r.items.map(function (p) { return '<a class="hcard" href="' + esc(p.url) + '">' + thumb(p) + '<div class="tx"><h3>' + esc(p.title) + '</h3><time datetime="' + esc(p.date) + '" data-rel></time></div></a>'; }).join("");
        localizeTimes(g);
      }).catch(function () { sec.remove(); });
    });
  });

  /* ---- تحميل المزيد ---- */
  var more = $("[data-more]");
  if (more && on("تحميل_المزيد")) {
    more.addEventListener("click", function (e) {
      e.preventDefault(); if (more.getAttribute("aria-busy") === "true") return;
      more.setAttribute("aria-busy", "true"); var lbl = more.textContent; more.textContent = "جارٍ التحميل…";
      fetch(more.href).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html"), list = $(".list"), rows = $$(".list > .row", doc);
        rows.forEach(function (r, i) { var n = d.importNode(r, true); n.classList.add("rise"); n.style.animationDelay = i * 40 + "ms"; list.appendChild(n); });
        localizeTimes(list);
        var nx = $("[data-more]", doc);
        if (nx && rows.length) { more.href = nx.href; more.textContent = lbl; more.removeAttribute("aria-busy"); history.replaceState(null, "", location.href); }
        else more.closest(".pager").remove();
      }).catch(function () { location.href = more.href; });
    });
  }

  /* ---- نقل المساحات الإعلانية إلى أماكنها ---- */
  $$("[data-move]").forEach(function (z) { var t = $(z.dataset.move); if (t) t.insertAdjacentElement(z.dataset.where || "beforebegin", z); else if (z.dataset.only) z.remove(); });

  /* ---- صفحة المقال ---- */
  var body = $(".post-body");
  if (body) {
    var words = (body.textContent || "").trim().split(/\s+/).length, mins = Math.max(1, Math.round(words / 190));
    var rt = $("[data-rt]"); if (rt) { if (on("زمن_القراءة")) rt.innerHTML = rt.innerHTML.replace("{n}", mins); else rt.remove(); }
    if (!on("شريط_التقدم") && prog) { prog.remove(); prog = null; }

    var ps = $$(":scope > p, :scope > div > p", body).filter(function (p) { return p.textContent.trim().length > 60; });
    var mid = $("#ads-post-middle"); if (mid) { if (ps.length > 3) ps[Math.floor(ps.length / 2)].insertAdjacentElement("afterend", mid); else mid.remove(); }
    var bio = $("[data-bio]"); if (bio && S["نبذة_الكاتب"]) bio.textContent = S["نبذة_الكاتب"];

    $$("table", body).forEach(function (t) { if (!t.closest(".tbl")) { var w = d.createElement("div"); w.className = "tbl"; t.parentNode.insertBefore(w, t); w.appendChild(t); } });
    $$("a[href^='http']", body).forEach(function (a) { if (a.hostname !== location.hostname) { a.target = "_blank"; a.rel = "noopener"; } });
    $$("img", body).forEach(function (im, i) { if (i > 0) { im.loading = "lazy"; } im.decoding = "async"; if (!im.alt) im.alt = C.title || ""; });

    var hs = $$("h2, h3", body);
    if (on("فهرس_المقال") && hs.length >= 3) {
      var toc = d.createElement("details"); toc.className = "toc"; toc.open = innerWidth > 760;
      toc.innerHTML = '<summary>محتويات المقال<svg class="ico"><use href="#i-down"/></svg></summary><ol></ol>';
      var ol = $("ol", toc);
      hs.forEach(function (x, i) { if (!x.id) x.id = "h-" + (i + 1); ol.insertAdjacentHTML("beforeend", '<li class="l' + x.tagName.charAt(1) + '"><a href="#' + x.id + '">' + esc(x.textContent.trim()) + "</a></li>"); });
      hs[0].parentNode.insertBefore(toc, hs[0]);
      if ("IntersectionObserver" in window) {
        var links = $$("a", toc), io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (l) { l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id); }); } }); }, { rootMargin: "-20% 0px -70% 0px" });
        hs.forEach(function (x) { io.observe(x); });
      }
    }

    var sh = $("[data-share]");
    if (sh) {
      if (!on("أزرار_المشاركة")) sh.remove();
      else {
        var u = encodeURIComponent(C.url || location.href), tl = encodeURIComponent(C.title || d.title);
        $$("a[data-net]", sh).forEach(function (a) {
          a.href = { wa: "https://wa.me/?text=" + tl + "%20" + u, tg: "https://t.me/share/url?url=" + u + "&text=" + tl, x: "https://x.com/intent/post?url=" + u + "&text=" + tl, fb: "https://www.facebook.com/sharer/sharer.php?u=" + u }[a.dataset.net];
        });
        var cp = $("[data-copy]", sh);
        cp && cp.addEventListener("click", function () {
          var done = function () { var o = cp.innerHTML; cp.classList.add("ok"); cp.lastChild.textContent = "تم النسخ"; buzz(); setTimeout(function () { cp.classList.remove("ok"); cp.innerHTML = o; }, 1800); };
          (navigator.clipboard ? navigator.clipboard.writeText(C.url || location.href) : Promise.reject()).then(done, function () { prompt("انسخ الرابط:", C.url || location.href); });
        });
        var ns = $("[data-native]", sh);
        if (ns) { if (navigator.share) { ns.hidden = false; ns.addEventListener("click", function () { navigator.share({ title: C.title, url: C.url || location.href }).catch(function () { }); }); } else ns.remove(); }
      }
    }

    var fz = $("[data-fz]");
    if (fz) {
      if (!on("حجم_الخط")) fz.remove();
      else {
        var cur = +(localStorage.getItem("tcn-fz") || 1);
        var apply = function () { body.style.setProperty("--fz", cur); try { localStorage.setItem("tcn-fz", cur); } catch (e) { } };
        apply();
        $$("button", fz).forEach(function (b) { b.addEventListener("click", function () { cur = Math.min(1.3, Math.max(.85, +(cur + (+b.dataset.step)).toFixed(2))); apply(); }); });
      }
    }

    if (on("نسخ_الأكواد")) $$("pre", body).forEach(function (pre) {
      var b = d.createElement("button"); b.type = "button"; b.className = "copy-code"; b.textContent = "نسخ";
      b.addEventListener("click", function () { navigator.clipboard && navigator.clipboard.writeText(pre.innerText.replace(/نسخ$/, "").trim()).then(function () { b.textContent = "تم"; setTimeout(function () { b.textContent = "نسخ"; }, 1500); }); });
      pre.appendChild(b);
    });

    if (on("تكبير_الصور") && window.HTMLDialogElement) {
      var zd = d.createElement("dialog"); zd.className = "zoom-dlg"; zd.innerHTML = '<img alt="">'; d.body.appendChild(zd);
      zd.addEventListener("click", function () { zd.close(); });
      body.addEventListener("click", function (e) {
        var im = e.target.closest("img"); if (!im || im.width < 200) return;
        e.preventDefault(); var a = im.closest("a"); $("img", zd).src = a && /\.(jpe?g|png|webp|gif|avif)|googleusercontent|bp\.blogspot/i.test(a.href) ? a.href : im.currentSrc || im.src; $("img", zd).alt = im.alt; zd.showModal();
      });
    }

    var ab = $(".author-box"); if (ab && !on("صندوق_الكاتب")) ab.remove();

    var rel = $("[data-related]");
    if (rel) {
      if (!on("مقالات_ذات_صلة") || !C.label) rel.remove();
      else lazy(rel, function () {
        var n = +val("عدد_ذات_صلة", 6);
        feed({ label: C.label, max: n + 1, full: true }).then(function (r) {
          var items = r.items.filter(function (p) { return p.url && p.url.split("?")[0] !== (C.url || "").split("?")[0]; }).slice(0, n);
          if (!items.length) { rel.remove(); return; }
          $(".hgrid", rel).innerHTML = items.map(function (p) { return '<a class="hcard" href="' + esc(p.url) + '">' + thumb(p) + '<div class="tx"><h3>' + esc(p.title) + '</h3><time datetime="' + esc(p.date) + '" data-rel></time></div></a>'; }).join("");
          localizeTimes(rel);
        }).catch(function () { rel.remove(); });
      });
    }
  }

  if (!body) { var pm = $("#ads-post-middle"); if (pm) pm.remove(); }

  /* ---- إعلان أسفل الشاشة ---- */
  var anc = $(".anchor-ad");
  if (anc) {
    if (!anc.querySelector(".adbox") || !on("إعلان_أسفل_الشاشة") || sessionStorage.getItem("tcn-anc")) anc.remove();
    else { anc.hidden = false; $(".x", anc).addEventListener("click", function () { anc.remove(); try { sessionStorage.setItem("tcn-anc", 1); } catch (e) { } }); }
  }

  /* ---- شريط الجوال والقوائم ---- */
  var bn = $(".bnav");
  if (bn) { if (on("شريط_الجوال_السفلي")) { bn.hidden = false; h.classList.add("has-bnav"); } else bn.remove(); }
  $$("[data-sheet]").forEach(function (b) {
    var dlg = d.getElementById(b.dataset.sheet); if (!dlg) return;
    b.addEventListener("click", function () {
      var box = $("[data-fill]", dlg);
      if (box && !box.children.length) { var n = $(".nav ul"), c = $(".chips"); if (n) { var u = n.cloneNode(true); u.className = "flinks"; box.appendChild(u); } if (c) { var h2 = d.createElement("h2"); h2.textContent = "التصنيفات"; h2.style.marginTop = "16px"; box.appendChild(h2); var cc = c.cloneNode(true); cc.style.flexWrap = "wrap"; box.appendChild(cc); } } dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", ""); buzz(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("a")) dlg.close(); });
  });
  var cur = location.href.split(/[?#]/)[0];
  $$(".nav a, .bnav a, .chips a, #menu-sheet a").forEach(function (a) { if (a.href.split(/[?#]/)[0] === cur) a.setAttribute("aria-current", "page"); });

/*FEATURES*/
  /* ===== خط العناوين (من لوحة المزايا) ===== */
  (function () {
    var FONTS = { "IBM Plex Sans Arabic": 1, "Alexandria": 1, "Readex Pro": 1, "Noto Kufi Arabic": 1, "El Messiri": 1, "Cairo": 1, "Tajawal": 1, "Almarai": 1, "Reem Kufi": 1, "Amiri": 1, "Changa": 1, "Lalezar": 1 };
    var f = val("خط_العناوين", "IBM Plex Sans Arabic").trim();
    if (!FONTS[f] || f === "IBM Plex Sans Arabic") return;
    var l = d.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + f.replace(/ /g, "+") + ":wght@" + (f === "Lalezar" ? "400" : "600;700") + "&display=swap";
    d.head.appendChild(l); h.style.setProperty("--f-head", "'" + f + "'," + "var(--f-ar)");
  })();

  /* ===== 1) ملخص اليوم ===== */
  var dg = $("[data-digest]");
  if (dg) {
    if (!on("ملخص_اليوم")) dg.remove();
    else feed({ max: 12, label: dg.dataset.label || "" }).then(function (r) {
      var hours = +(dg.dataset.hours || 48), since = Date.now() - hours * 3600e3;
      var items = r.items.filter(function (p) { return new Date(p.date) > since; });
      if (items.length < 3) items = r.items;
      items = items.slice(0, 5);
      if (!items.length) { dg.remove(); return; }
      $("ol", dg).innerHTML = items.map(function (p) { return '<li><a href="' + esc(p.url) + '"><b>' + esc(p.title) + '</b><time datetime="' + esc(p.date) + '" data-rel></time></a></li>'; }).join("");
      var dt = $("[data-today]", dg); if (dt) try { dt.textContent = new Intl.DateTimeFormat(LANG === "ar" ? "ar-u-nu-latn" : "en-US", { weekday: "long", day: "numeric", month: "long" }).format(new Date()); } catch (e) { }
      localizeTimes(dg); dg.hidden = false;
    }).catch(function () { dg.remove(); });
  }

  /* ===== 7) مؤشرات الثقة ===== */
  var trust = $("[data-trust]");
  if (trust && body) {
    var up = $("[data-updated]", trust), pub = $(".post-meta time");
    var okUp = on("آخر_تحديث") && up && pub && (new Date(up.getAttribute("datetime")) - new Date(pub.getAttribute("datetime")) > 864e5);
    if (okUp) { up.hidden = false; up.closest("span").hidden = false; } else if (up) up.closest("span").remove();
    var tags = $$(".post-tags a").map(function (a) { return a.textContent.replace(/^#/, "").trim(); });
    var vt = val("وسم_التحقق", "تم التحقق");
    var vb = $("[data-verified]", trust);
    if (vb) { if (on("شارة_التحقق") && tags.indexOf(vt) > -1) vb.hidden = false; else vb.remove(); }
    if (!trust.querySelector(":scope > :not([hidden])")) trust.remove(); else trust.hidden = false;
    $$(".post-tags a").forEach(function (a) { var t = a.textContent.replace(/^#/, "").trim(); if (t === vt || /^سلسلة\s*[:：]/.test(t)) a.remove(); });
  }

  /* ===== 6) تقدّم السلسلة ===== */
  var sb = $("[data-series]");
  if (sb && body) {
    var sl = $$("[data-label-all]").map(function (x) { return x.textContent.trim(); }).filter(function (t) { return /^سلسلة\s*[:：]/.test(t); })[0];
    if (!on("سلاسل_المقالات") || !sl) sb.remove();
    else feed({ label: sl, max: 50 }).then(function (r) {
      var parts = r.items.slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      var me = (C.url || location.href).split(/[?#]/)[0], idx = -1;
      parts.forEach(function (p, i) { if (p.url.split(/[?#]/)[0] === me) idx = i; });
      if (parts.length < 2 || idx < 0) { sb.remove(); return; }
      var name = sl.replace(/^سلسلة\s*[:：]\s*/, "");
      sb.innerHTML = '<details class="series"' + (innerWidth > 760 ? " open" : "") + '><summary><span class="s-k">سلسلة</span><b>' + esc(name) + '</b><span class="s-n">الجزء <span class="num">' + (idx + 1) + '</span> من <span class="num">' + parts.length + '</span></span><svg class="ico"><use href="#i-down"/></svg></summary>' +
        '<div class="s-bar"><i style="width:' + Math.round((idx + 1) / parts.length * 100) + '%"></i></div><ol>' +
        parts.map(function (p, i) { return '<li' + (i === idx ? ' aria-current="step"' : i < idx ? ' class="done"' : "") + '><a href="' + esc(p.url) + '">' + esc(p.title) + "</a></li>"; }).join("") + "</ol>" +
        (parts[idx + 1] ? '<a class="btn btn-p s-next" href="' + esc(parts[idx + 1].url) + '">الجزء التالي<svg class="ico ico-s flip"><use href="#i-next"/></svg></a>' : "") + "</details>";
      sb.hidden = false;
    }).catch(function () { sb.remove(); });
  }

  /* ===== 2) استمع للمقال ===== */
  var lb = $("[data-listen]");
  if (lb) {
    var synth = window.speechSynthesis;
    if (!on("الاستماع_للمقال") || !synth || !body) lb.remove();
    else {
      lb.hidden = false;
      var chunks = [], ci = 0, playing = false, rate = +val("سرعة_القراءة_الصوتية", 1), voice = null;
      var pickVoice = function () { var vs = synth.getVoices(); voice = vs.filter(function (v) { return /^ar/i.test(v.lang); })[0] || null; };
      pickVoice(); if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;
      var build = function () {
        var txt = $$("h2, h3, p, li, blockquote", body).filter(function (e) { return !e.closest(".toc,.series,.adbox,.zone,pre,table"); }).map(function (e) { return e.textContent.trim(); }).filter(Boolean).join(". ");
        chunks = (C.title + ". " + txt).match(/[^.!؟?\n]{1,220}[.!؟?\n]?/g) || [];
      };
      var setUi = function (s) { lb.classList.toggle("on", s); $(".l-t", lb).textContent = s ? "إيقاف مؤقت" : (ci ? "متابعة الاستماع" : "استمع للمقال"); lb.setAttribute("aria-pressed", s); };
      var speak = function () {
        if (ci >= chunks.length) { ci = 0; playing = false; setUi(false); return; }
        var u = new SpeechSynthesisUtterance(chunks[ci]); u.lang = "ar"; if (voice) u.voice = voice; u.rate = rate;
        u.onend = function () { if (playing) { ci++; speak(); } };
        u.onerror = function () { playing = false; setUi(false); };
        synth.speak(u);
      };
      lb.addEventListener("click", function () {
        if (!chunks.length) build();
        if (playing) { playing = false; synth.cancel(); setUi(false); }
        else { playing = true; setUi(true); synth.cancel(); speak(); }
        buzz();
      });
      addEventListener("pagehide", function () { synth.cancel(); });
    }
  }

  /* ===== 3) وضع القراءة المريحة ===== */
  var rm = $("[data-readmode]");
  if (rm) {
    if (!on("وضع_القراءة") || !body) rm.remove();
    else {
      rm.hidden = false;
      var setRm = function (s) { h.classList.toggle("read-mode", s); rm.setAttribute("aria-pressed", s); $(".l-t", rm).textContent = s ? "الخروج من وضع القراءة" : "وضع القراءة"; };
      rm.addEventListener("click", function () { var s = !h.classList.contains("read-mode"); var go = function () { setRm(s); }; d.startViewTransition && !still ? d.startViewTransition(go) : go(); if (s) body.closest(".post").scrollIntoView({ behavior: still ? "auto" : "smooth" }); buzz(); });
      d.addEventListener("keydown", function (e) { if (e.key === "Escape" && h.classList.contains("read-mode")) setRm(false); });
    }
  }

  /* ===== 5) حفظ المقالات ===== */
  var SKEY = "tcn-saved";
  var getSaved = function () { try { return JSON.parse(localStorage.getItem(SKEY) || "[]"); } catch (e) { return []; } };
  var putSaved = function (l) { try { localStorage.setItem(SKEY, JSON.stringify(l.slice(0, 200))); } catch (e) { } refreshCount(); };
  var refreshCount = function () { var n = getSaved().length; $$("[data-saved-count]").forEach(function (c) { c.textContent = n; c.hidden = !n; }); };
  var savedOn = on("حفظ_المقالات");
  if (!savedOn) $$("[data-saved-open],[data-save]").forEach(function (b) { b.remove(); });
  else {
    $$("[data-saved-open]").forEach(function (b) { b.hidden = false; });
    refreshCount();
    var sv = $("[data-save]");
    if (sv && body) {
      sv.hidden = false;
      var me2 = (C.url || location.href).split(/[?#]/)[0];
      var isS = function () { return getSaved().some(function (x) { return x.url === me2; }); };
      var paintS = function () { var s = isS(); sv.classList.toggle("on", s); sv.setAttribute("aria-pressed", s); $(".l-t", sv).textContent = s ? "محفوظ" : "حفظ"; };
      paintS();
      sv.addEventListener("click", function () {
        var l = getSaved();
        if (isS()) l = l.filter(function (x) { return x.url !== me2; });
        else { var im = $("img", body); l.unshift({ url: me2, title: C.title || d.title, img: im ? (im.currentSrc || im.src) : "", date: ($(".post-meta time") || {}).getAttribute ? $(".post-meta time").getAttribute("datetime") : "", at: Date.now() }); }
        putSaved(l); paintS(); buzz();
      });
    }
    var sd2 = d.getElementById("saved-sheet");
    if (sd2) {
      var paintList = function () {
        var l = getSaved(), box = $("[data-saved-list]", sd2);
        box.innerHTML = l.length ? l.map(function (p, i) { return '<div class="sv-row"><a href="' + esc(p.url) + '">' + thumb({ img: p.img, title: p.title }) + "<span><b>" + esc(p.title) + "</b><small>" + esc(p.date ? fmtDate(p.date) : "") + '</small></span></a><button aria-label="إزالة من المحفوظات" class="icon-btn" data-rm="' + i + '" type="button"><svg class="ico ico-s"><use href="#i-close"/></svg></button></div>'; }).join("")
          : '<div class="empty" style="border:0"><svg viewBox="0 0 64 64"><path d="M20 10h24v44L32 45 20 54Z"/></svg><h2>لا توجد مقالات محفوظة</h2><p>اضغط «حفظ» أعلى أي مقال لتجده هنا لاحقاً.</p></div>';
      };
      sd2.addEventListener("click", function (e) { var b = e.target.closest("[data-rm]"); if (b) { var l = getSaved(); l.splice(+b.dataset.rm, 1); putSaved(l); paintList(); } });
      $$("[data-saved-open]").forEach(function (b) { b.addEventListener("click", function () { paintList(); sd2.showModal ? sd2.showModal() : sd2.setAttribute("open", ""); buzz(); }); });
    }
  }

  /* ===== 4) تثبيت الموقع كتطبيق ===== */
  if (on("تثبيت_كتطبيق")) {
    var name = val("اسم_التطبيق", "TCNOPS"), icon = val("أيقونة_التطبيق", "");
    try {
      var mf = { name: name + " — أخبار التقنية", short_name: name, lang: "ar", dir: "rtl", start_url: HOME + "?utm_source=pwa", scope: HOME, display: "standalone", background_color: "#f3f7f9", theme_color: "#0f7f86",
        description: "أخبار التقنية والذكاء الاصطناعي والتطبيقات بلغة عربية واضحة" };
      if (icon) mf.icons = [{ src: icon, sizes: "512x512", type: "image/png", purpose: "any maskable" }];
      var ml = d.createElement("link"); ml.rel = "manifest"; ml.href = URL.createObjectURL(new Blob([JSON.stringify(mf)], { type: "application/manifest+json" })); d.head.appendChild(ml);
      if (icon) { var ai = d.createElement("link"); ai.rel = "apple-touch-icon"; ai.href = icon; d.head.appendChild(ai); }
    } catch (e) { }
    var ib = $("[data-install]"), deferred = null;
    var standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    if (ib && !standalone) {
      addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; ib.hidden = false; });
      if (ios) ib.hidden = false;
      ib.addEventListener("click", function () {
        if (deferred) { deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; ib.hidden = true; }); }
        else { var g = d.getElementById("ios-sheet"); if (!g) return; var bx = $("[data-ios]", g); if (bx && !bx.children.length) bx.innerHTML = '<ol class="ios-steps"><li>اضغط زر <b>المشاركة</b> أسفل المتصفح.</li><li>اختر <b>إضافة إلى الشاشة الرئيسية</b>.</li><li>اضغط <b>إضافة</b>، وسيظهر الموقع كتطبيق.</li></ol><button class="btn btn-p" data-close style="width:100%" type="button">حسناً</button>'; g.showModal ? g.showModal() : g.setAttribute("open", ""); }
      });
      addEventListener("appinstalled", function () { ib.hidden = true; });
    }
  } else { var ibx = $("[data-install]"); if (ibx) ibx.remove(); }

  /* ---- إغلاق النوافذ بالنقر خارجها أو بالسحب للأسفل ---- */
  d.addEventListener("click", function (e) {
    var x = e.target.closest("[data-close]"); if (x) { var dl0 = x.closest("dialog"); if (dl0) dl0.close(); return; }
    var dl = e.target; if (dl.tagName !== "DIALOG" || !dl.open) return;
    var r = dl.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dl.close();
  });
  $$("dialog.sheet").forEach(function (sh) {
    var y0 = null;
    sh.addEventListener("touchstart", function (e) { var inn = $(".in", sh); y0 = (!inn || inn.scrollTop <= 0) ? e.touches[0].clientY : null; }, { passive: true });
    sh.addEventListener("touchmove", function (e) { if (y0 === null) return; var dy = e.touches[0].clientY - y0; if (dy > 0) sh.style.transform = "translateY(" + dy + "px)"; }, { passive: true });
    sh.addEventListener("touchend", function (e) { if (y0 === null) return; var dy = e.changedTouches[0].clientY - y0; sh.style.transform = ""; y0 = null; if (dy > 90) sh.close(); });
  });

  /* ===== لوحة التحكم المرئية (?panel) ===== */
  (function () {
    var SC = window.TCN_SCHEMA; if (!SC) return;
    var q = /[?&]panel\b/.test(location.search);
    try { if (q) localStorage.setItem("tcn-admin", "1"); } catch (e) { }
    var admin = q; try { admin = admin || localStorage.getItem("tcn-admin") === "1"; } catch (e) { }
    var PKEY = "tcn-preview";
    var getP = function () { try { return JSON.parse(localStorage.getItem(PKEY) || "{}") || {}; } catch (e) { return {}; } };
    var hasP = function () { return Object.keys(getP()).length > 0; };
    var isOff = function (v) { return /^(لا|no|off|false|0)$/i.test(String(v)); };
    var cur = function (it) { var v = S[it.k]; return v === undefined || v === "" ? it.v : v; };

    if (hasP()) {
      var bar = d.createElement("div"); bar.className = "pv-bar";
      bar.innerHTML = '<svg class="ico ico-s"><use href="#i-eye"/></svg><span>معاينة على جهازك فقط: الزوار يرون الإعدادات المحفوظة في بلوجر.</span><button type="button" data-pv-open>اللوحة</button><button type="button" data-pv-clear>إلغاء المعاينة</button>';
      d.body.appendChild(bar);
      $("[data-pv-clear]", bar).onclick = function () { localStorage.removeItem(PKEY); location.reload(); };
      $("[data-pv-open]", bar).onclick = function () { openPanel(); };
    }
    if (!admin) return;

    var fab = d.createElement("button"); fab.type = "button"; fab.className = "pv-fab"; fab.setAttribute("aria-label", "لوحة تحكم القالب");
    fab.innerHTML = '<svg class="ico"><use href="#i-sliders"/></svg>'; d.body.appendChild(fab);
    fab.onclick = function () { openPanel(); };

    var dlg;
    function build() {
      dlg = d.createElement("dialog"); dlg.className = "cp"; dlg.setAttribute("aria-label", "لوحة تحكم القالب");
      var tabs = SC.g.map(function (g, i) { return '<button type="button" role="tab" data-tab="' + g.id + '" aria-selected="' + (i === 0) + '">' + esc(g.t) + "</button>"; }).join("");
      var panes = SC.g.map(function (g, i) {
        return '<section class="cp-pane" data-pane="' + g.id + '"' + (i ? " hidden" : "") + '><p class="cp-lead">' + esc(g.d) + '</p><div class="cp-grid">' + g.i.map(function (it) {
          var v = cur(it), id = "cp-" + it.k;
          var ctl = it.y === "bool" ? '<label class="sw"><input type="checkbox" id="' + id + '" data-k="' + esc(it.k) + '"' + (isOff(v) ? "" : " checked") + '><span class="sw-t" aria-hidden="true"></span></label>'
            : it.y === "select" ? '<select id="' + id + '" data-k="' + esc(it.k) + '">' + it.o.map(function (o) { return '<option' + (o === v ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select>"
            : '<input id="' + id + '" data-k="' + esc(it.k) + '" type="' + (it.y === "num" ? "number" : "text") + '" step="any" dir="auto" value="' + esc(v) + '">';
          return '<div class="cp-item cp-' + it.y + '"><label for="' + id + '"><b>' + esc(it.t) + "</b>" + (it.d ? "<small>" + esc(it.d) + "</small>" : "") + "</label>" + ctl + "</div>";
        }).join("") + "</div></section>";
      }).join("");
      dlg.innerHTML = '<div class="cp-head"><div><b>لوحة تحكم TCNOPS</b><small>الإصدار <span class="ltr">' + SC.v + '</span></small></div><button type="button" class="icon-btn" data-cp-x aria-label="إغلاق"><svg class="ico"><use href="#i-close"/></svg></button></div>' +
        '<nav class="cp-tabs" role="tablist">' + tabs + "</nav><div class=\"cp-body\">" + panes + "</div>" +
        '<div class="cp-foot"><div class="cp-note" data-cp-note>غيّر ما تريد: الإظهار والإخفاء يُطبَّق فوراً، وباقي المزايا بعد «معاينة الآن».</div>' +
        '<div class="cp-btns"><button type="button" class="btn" data-cp-reload>معاينة الآن</button><button type="button" class="btn btn-p" data-cp-copy><svg class="ico ico-s"><use href="#i-link"/></svg>نسخ الإعدادات للحفظ</button></div>' +
        '<details class="cp-how"><summary>كيف أحفظها لكل الزوار؟</summary><ol><li>اضغط «نسخ الإعدادات للحفظ».</li><li>في بلوجر افتح «التنسيق» ثم أداة «لوحة المزايا» في أعلى الصفحة (الصندوق الأصفر).</li><li>احذف النص القديم في المحتوى والصق الجديد، ثم «حفظ».</li><li>ارجع هنا واضغط «إلغاء المعاينة» لترى ما يراه الزوار.</li></ol><button type="button" class="btn" data-cp-hidefab>إخفاء زر اللوحة من هذا الجهاز</button></details></div>';
      d.body.appendChild(dlg);
      dlg.addEventListener("click", function (e) {
        var t = e.target.closest("[data-tab]");
        if (t) { $$("[data-tab]", dlg).forEach(function (b) { b.setAttribute("aria-selected", b === t); }); $$("[data-pane]", dlg).forEach(function (p) { p.hidden = p.dataset.pane !== t.dataset.tab; }); return; }
        if (e.target.closest("[data-cp-x]")) dlg.close();
        if (e.target.closest("[data-cp-reload]")) location.reload();
        if (e.target.closest("[data-cp-hidefab]")) { localStorage.removeItem("tcn-admin"); fab.remove(); dlg.close(); }
        if (e.target.closest("[data-cp-copy]")) {
          var txt = text(), btn = e.target.closest("[data-cp-copy]");
          var ok = function () { btn.lastChild.textContent = "تم النسخ"; btn.classList.add("ok"); $("[data-cp-note]", dlg).textContent = "تم النسخ. الآن الصقه في أداة «لوحة المزايا» في التنسيق واحفظ."; $(".cp-how", dlg).open = true; };
          (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(ok, function () { var ta = d.createElement("textarea"); ta.value = txt; ta.className = "cp-ta"; $(".cp-foot", dlg).appendChild(ta); ta.select(); try { d.execCommand("copy"); ok(); } catch (x) { } });
        }
      });
      dlg.addEventListener("change", function (e) {
        var k = e.target.dataset.k; if (!k) return;
        var v = e.target.type === "checkbox" ? (e.target.checked ? "نعم" : "لا") : e.target.value;
        var p = getP(); p[k] = v; try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (x) { }
        S[k] = v; applyBlocks();
        $("[data-cp-note]", dlg).textContent = "حُفظ على جهازك للمعاينة. اضغط «نسخ الإعدادات للحفظ» لتطبيقه على كل الزوار.";
      });
    }
    function applyBlocks() {
      var css = "";
      SC.g.forEach(function (g) { g.i.forEach(function (it) { if (it.s && isOff(cur(it))) css += it.s + "{display:none!important}"; }); });
      if (isOff(S["إظهار_الشريط_الجانبي"] || "نعم")) css += ".layout{grid-template-columns:minmax(0,1fr)!important}";
      var st = d.getElementById("tcn-off"); if (st) st.textContent = css;
    }
    function text() {
      var out = ["═════ لوحة مزايا TCNOPS — الإصدار " + SC.v + " ═════", "# أُنشئ من لوحة التحكم المرئية. لفتحها أضف ?panel إلى رابط موقعك.", ""];
      SC.g.forEach(function (g) { out.push("═════ " + g.t + " ═════"); g.i.forEach(function (it) { out.push("# " + it.t + (it.d ? ": " + it.d : "")); out.push(it.k + ": " + cur(it)); }); out.push(""); });
      return out.join("\n");
    }
    function openPanel() { if (!dlg) build(); dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", ""); }
    if (q) openPanel();
  })();

  /* ---- عناوين للإطارات المضمّنة (إمكانية الوصول) ---- */
  var titleFrames = function () { $$("iframe:not([title])").forEach(function (f) { var src = f.src || ""; f.title = /blogger\.com\/comment/.test(src) || f.id === "comment-editor" ? "نموذج التعليق" : /youtube/.test(src) ? "فيديو يوتيوب" : "محتوى مضمّن"; }); };
  titleFrames(); setTimeout(titleFrames, 2500);

  localizeTimes(d);
  h.classList.add("js");
})();

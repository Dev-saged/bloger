  /* ===== الأرشيف الزمني (?archive أو /p/archive.html) ===== */
  (function () {
    var isQ = /[?&]archive\b/.test(location.search), isPage = /\/p\/archive\.html/.test(location.pathname);
    var flinks = $("#footer-2 .flinks");
    if (on("الأرشيف") && flinks && !$("a[href*='archive']", flinks)) flinks.insertAdjacentHTML("afterbegin", '<li><a href="' + HOME + '?archive">الأرشيف</a></li>');
    if (!on("الأرشيف") || !(isQ || isPage)) return;
    var host = isPage ? $(".post-body") : $(".main");
    if (!host) return;
    if (isQ) { d.title = "الأرشيف | " + (d.title.split("|").pop() || "TCNOPS").trim(); $$(".bento,[data-home-slot],.sec-h,.list,.pager,.digest,#home-sections2,.zone", host).forEach(function (n) { n.remove(); }); $$(".main > *").forEach(function (n) { n.hidden = true; }); }
    var box = d.createElement("section"); box.className = "arc"; box.setAttribute("aria-label", "أرشيف المقالات");
    box.innerHTML = (isQ ? '<header class="arc-h"><h1>أرشيف المقالات</h1><p>كل ما نشرناه، مرتّباً زمنياً، مع بحث وتصفية فورية.</p></header>' : "") +
      '<div class="arc-stats"><div><strong class="num" data-a-n>—</strong><span>مقال</span></div><div><strong class="num" data-a-y>—</strong><span>سنة</span></div><div><strong class="num" data-a-l>—</strong><span>تصنيف</span></div></div>' +
      '<div class="arc-tools"><label class="arc-q"><svg class="ico ico-s"><use href="#i-search"/></svg><input type="search" placeholder="ابحث في عناوين الأرشيف…" aria-label="ابحث في الأرشيف"></label>' +
      '<select aria-label="التصنيف" data-a-lab><option value="">كل التصنيفات</option></select><button type="button" class="btn" data-a-sort aria-pressed="false"><svg class="ico ico-s"><use href="#i-down"/></svg><span>الأحدث أولاً</span></button></div>' +
      '<nav class="arc-years" aria-label="السنوات"></nav><div class="arc-body" aria-live="polite"><div class="skel" style="height:72px"></div><div class="skel" style="height:72px;margin-top:10px"></div><div class="skel" style="height:72px;margin-top:10px"></div></div>';
    if (isQ) host.appendChild(box); else { host.innerHTML = ""; host.appendChild(box); }
    var all = [], CK = "tcn-archive-v1";
    var month = function (dt) { try { return new Intl.DateTimeFormat(LANG === "ar" ? "ar-u-nu-latn" : "en-US", { month: "long" }).format(dt); } catch (e) { return dt.getMonth() + 1; } };
    var load = function (start) {
      return fetch(HOME + "feeds/posts/summary?alt=json&max-results=150&start-index=" + start).then(function (r) { return r.json(); }).then(function (j) {
        var items = ((j.feed && j.feed.entry) || []).map(function (e) {
          var l = (e.link || []).filter(function (x) { return x.rel === "alternate"; })[0] || {};
          return { t: e.title.$t, u: l.href, d: e.published.$t, l: (e.category || []).map(function (c) { return c.term; }) };
        });
        all = all.concat(items);
        var total = +((j.feed.openSearch$totalResults || {}).$t || 0);
        return (items.length && all.length < total) ? load(start + items.length) : all;
      });
    };
    var cached = null; try { cached = JSON.parse(sessionStorage.getItem(CK) || "null"); } catch (e) { }
    (cached && Date.now() - cached.t < 30 * 60e3 ? Promise.resolve(cached.a) : load(1).then(function (a) { try { sessionStorage.setItem(CK, JSON.stringify({ t: Date.now(), a: a })); } catch (e) { } return a; }))
      .then(function (a) { all = a; init(); }).catch(function () { $(".arc-body", box).innerHTML = '<div class="empty"><h2>تعذّر تحميل الأرشيف</h2><p>تحقق من الاتصال ثم أعد المحاولة.</p></div>'; });
    function init() {
      var labels = {}, years = {};
      all.forEach(function (p) { p.dt = new Date(p.d); p.y = p.dt.getFullYear(); years[p.y] = (years[p.y] || 0) + 1; p.l.forEach(function (x) { if (!/^سلسلة\s*[:：]/.test(x) && x !== val("وسم_التحقق", "تم التحقق")) labels[x] = (labels[x] || 0) + 1; }); });
      $("[data-a-n]", box).textContent = all.length; $("[data-a-y]", box).textContent = Object.keys(years).length; $("[data-a-l]", box).textContent = Object.keys(labels).length;
      var sel = $("[data-a-lab]", box);
      Object.keys(labels).sort(function (a, b) { return labels[b] - labels[a]; }).forEach(function (x) { sel.insertAdjacentHTML("beforeend", "<option value=\"" + esc(x) + "\">" + esc(x) + " (" + labels[x] + ")</option>"); });
      var pre = new URLSearchParams(location.search).get("label"); if (pre) sel.value = pre;
      var q = $("input", box), sortBtn = $("[data-a-sort]", box), asc = false, t;
      var render = function () {
        var term = q.value.trim().toLowerCase(), lab = sel.value;
        var list = all.filter(function (p) { return (!lab || p.l.indexOf(lab) > -1) && (!term || p.t.toLowerCase().indexOf(term) > -1); })
          .sort(function (a, b) { return asc ? a.dt - b.dt : b.dt - a.dt; });
        var body = $(".arc-body", box), yrs = $(".arc-years", box);
        if (!list.length) { body.innerHTML = '<div class="empty"><svg viewBox="0 0 64 64"><circle cx="28" cy="28" r="16"/><path d="m40 40 14 14"/></svg><h2>لا توجد نتائج</h2><p>جرّب كلمة أخرى أو اختر «كل التصنيفات».</p></div>'; yrs.innerHTML = ""; return; }
        var html = "", lastY = null, lastM = null, ys = [];
        list.forEach(function (p) {
          var m = p.dt.getMonth();
          if (p.y !== lastY) { if (lastY !== null) html += "</ol></div></section>"; html += '<section class="arc-y" id="y' + p.y + '"><h2 class="arc-yh"><span class="num">' + p.y + "</span></h2>"; ys.push(p.y); lastY = p.y; lastM = null; }
          if (m !== lastM) { if (lastM !== null) html += "</ol></div>"; var cnt = list.filter(function (x) { return x.y === p.y && x.dt.getMonth() === m; }).length; html += '<div class="arc-m"><h3>' + esc(month(p.dt)) + ' <span class="num">' + cnt + "</span></h3><ol>"; lastM = m; }
          var lb = p.l.filter(function (x) { return labels[x]; })[0];
          html += '<li><a href="' + esc(p.u) + '"><span class="arc-d num">' + p.dt.getDate() + '</span><span class="arc-t">' + esc(p.t) + "</span>" + (lb ? '<span class="tag">' + esc(lb) + "</span>" : "") + "</a></li>";
        });
        body.innerHTML = html + "</ol></div></section>";
        yrs.innerHTML = ys.map(function (y) { return '<a href="#y' + y + '"><span class="num">' + y + '</span><small class="num">' + list.filter(function (x) { return x.y === y; }).length + "</small></a>"; }).join("");
      };
      q.addEventListener("input", function () { clearTimeout(t); t = setTimeout(render, 150); });
      sel.addEventListener("change", render);
      sortBtn.addEventListener("click", function () { asc = !asc; sortBtn.setAttribute("aria-pressed", asc); $("span", sortBtn).textContent = asc ? "الأقدم أولاً" : "الأحدث أولاً"; render(); });
      render();
    }
  })();

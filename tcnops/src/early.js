(function () {
  /* يقرأ لوحة المزايا قبل رسم الصفحة: لا وميض عند إخفاء أي كتلة */
  var d = document, S = {}, el = d.getElementById("tcn-settings");
  if (el) {
    var txt = el.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div)>/gi, "\n").replace(/<[^>]+>/g, "");
    var ta = d.createElement("textarea"); ta.innerHTML = txt; txt = ta.value;
    txt.split(/\n/).forEach(function (line) {
      if (/^\s*(#|═|—|-{2,})/.test(line)) return;
      var m = line.match(/^\s*([^:=#]+?)\s*[:=]\s*(.*?)\s*$/);
      if (m) S[m[1].trim().replace(/\s+/g, "_")] = m[2];
    });
  }
  var P = null;
  try { P = JSON.parse(localStorage.getItem("tcn-preview") || "null"); } catch (e) { }
  if (P) for (var k in P) S[k] = P[k];
  window.TCN_S = S; window.TCN_SAVED_KEYS = P ? Object.keys(P) : [];
  var SEL = window.TCN_SEL || {}, css = "";
  for (var key in SEL) if (S[key] !== undefined && /^(لا|no|off|false|0)$/i.test(S[key])) css += SEL[key] + "{display:none!important}";
  if (S["إظهار_الشريط_الجانبي"] && /^(لا|no|off)$/i.test(S["إظهار_الشريط_الجانبي"])) css += ".layout{grid-template-columns:minmax(0,1fr)!important}";
  var st = d.createElement("style"); st.id = "tcn-off"; st.textContent = css; d.head.appendChild(st);
})();

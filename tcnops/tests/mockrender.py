"""Minimal Blogger-template renderer for local testing of TCNOPS-2026.xml (subset used by this template)."""
import re, html, json, sys, xml.dom.minidom as M

class Ctx:
    def __init__(s, root, parent=None): s.v = root; s.p = parent
    def get(s, path):
        cur = s
        while cur:
            head = path.split(".")[0]
            if head in cur.v: break
            cur = cur.p
        if not cur: return ""
        val = cur.v
        for k in path.split("."):
            if k in ("escaped", "jsonEscaped", "canonical") and not (isinstance(val, dict) and k in val):
                if k == "jsonEscaped": val = json.dumps(str(val), ensure_ascii=False)[1:-1]
                continue
            val = val.get(k, "") if isinstance(val, dict) else ""
        return val

def py_expr(e):
    e = html.unescape(e)
    m = re.match(r"^(.*?)\s\?\s(.*?)\s:\s(.*)$", e)
    if m: return "(%s if %s else %s)" % (py_expr(m.group(2)), py_expr(m.group(1)), py_expr(m.group(3)))
    e = re.sub(r"data:([\w.]+)", lambda m: 'D("%s")' % m.group(1), e)
    e = re.sub(r"!(?!=)", " not ", e)
    e = e.replace(" gt ", " > ")
    return e

def ev(e, ctx):
    try:
        return eval(py_expr(e), {"D": ctx.get, "resizeImage": lambda u, *a: u, "true": True, "false": False})
    except Exception as ex:
        raise SystemExit("EXPR FAIL: %r -> %s (%s)" % (e, py_expr(e), ex))

class R:
    def __init__(s, doc, data, widgets):
        s.data = data; s.widgets = widgets; s.inc = {}
    def attrs(s, el, ctx):
        out = []
        for k, v in el.attributes.items():
            if k.startswith("xmlns") or k.startswith("b:"): continue
            if k.startswith("expr:"): k, v = k[5:], str(ev(v, ctx))
            out.append(' %s="%s"' % (k, html.escape(v, quote=True)))
        return "".join(out)
    def kids(s, el, ctx):
        out = []; nodes = list(el.childNodes); i = 0
        while i < len(nodes):
            n = nodes[i]
            if n.nodeType == n.ELEMENT_NODE and n.tagName == "b:if":
                out.append(s.bif(n, ctx))
            else:
                out.append(s.node(n, ctx))
            i += 1
        return "".join(out)
    def bif(s, el, ctx):
        branches = []; cond = el.getAttribute("cond"); cur = []
        for n in el.childNodes:
            if n.nodeType == n.ELEMENT_NODE and n.tagName in ("b:elseif", "b:else"):
                branches.append((cond, cur)); cur = []; cond = n.getAttribute("cond") if n.tagName == "b:elseif" else "true"
            else: cur.append(n)
        branches.append((cond, cur))
        for c, nodes in branches:
            if ev(c, ctx):
                return "".join(s.node(n, ctx) if not (n.nodeType == n.ELEMENT_NODE and n.tagName == "b:if") else s.bif(n, ctx) for n in nodes)
        return ""
    def node(s, n, ctx):
        if n.nodeType == n.TEXT_NODE: return html.escape(n.data, quote=False)
        if n.nodeType == n.CDATA_SECTION_NODE: return n.data
        if n.nodeType != n.ELEMENT_NODE: return ""
        t = n.tagName
        if t.startswith("data:"):
            v = ctx.get(t[5:]); return str(v) if not isinstance(v, (dict, list)) else ""
        if t == "b:if": return s.bif(n, ctx)
        if t in ("b:skin", "b:template-skin", "b:widget-settings"): return ""
        if t == "b:loop":
            items = ev(n.getAttribute("values"), ctx) or []; var = n.getAttribute("var"); idx = n.getAttribute("index")
            return "".join(s.kids(n, Ctx({var: it, **({idx: i} if idx else {})}, ctx)) for i, it in enumerate(items))
        if t == "b:include":
            if n.hasAttribute("cond") and not ev(n.getAttribute("cond"), ctx): return ""
            name = n.getAttribute("name"); inc = s.inc.get(name)
            if not inc: return "<!--include %s-->" % name
            c = ctx
            if n.hasAttribute("data"):
                var = inc.getAttribute("var") or n.getAttribute("data"); c = Ctx({var: ctx.get(n.getAttribute("data"))}, ctx)
            return s.kids(inc, c)
        if t == "b:section":
            return '<div class="section %s" id="%s">%s</div>' % (n.getAttribute("class"), n.getAttribute("id"), s.kids(n, ctx))
        if t == "b:widget":
            wid = n.getAttribute("id"); s.inc = {i.getAttribute("id"): i for i in n.getElementsByTagName("b:includable")}
            wd = {"title": n.getAttribute("title"), "content": ""}
            for st in n.getElementsByTagName("b:widget-setting"):
                if st.getAttribute("name") == "content": wd["content"] = "".join(c.data for c in st.childNodes if c.nodeType in (3, 4))
            if n.getAttribute("type") == "LinkList":
                st = {x.getAttribute("name"): "".join(c.data for c in x.childNodes if c.nodeType == 3) for x in n.getElementsByTagName("b:widget-setting")}
                wd["links"] = [{"target": st["link-%d" % i], "name": st["text-%d" % i]} for i in range(20) if "link-%d" % i in st]
            wd.update(s.widgets.get(n.getAttribute("type"), {}))
            return '<div class="widget %s" id="%s">%s</div>' % (n.getAttribute("type"), wid, s.kids(s.inc["main"], Ctx(wd, ctx)))
        if t == "b:includable": return ""
        if t.startswith("b:"): return s.kids(n, ctx)
        inner = s.kids(n, ctx)
        if t in ("br", "meta", "link", "img", "input") and not inner: return "<%s%s>" % (t, s.attrs(n, ctx))
        return "<%s%s>%s</%s>" % (t, s.attrs(n, ctx), inner, t)

def render(xmlpath, data, widgets):
    src = open(xmlpath, encoding="utf-8").read()
    doc = M.parseString(src.encode())
    r = R(doc, data, widgets)
    return "<!DOCTYPE html>" + r.node(doc.documentElement, Ctx(data))

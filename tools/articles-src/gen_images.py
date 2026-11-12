import sys, os, asyncio, html
sys.path.insert(0, '/tmp/art')
import a1, a2, a3, a4, a5
from bidi import wrap
import re

A = a1.A + a2.A + a3.A + a4.A
for a in A:
    a.update(a5.X[a['slug']])

FD = '/tmp/art/node_modules/@fontsource'
KF = f'{FD}/noto-kufi-arabic/files/noto-kufi-arabic'
FONTS = ''
AR = 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC,U+0560-0588'
LA = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
for w in (400, 700, 900):
    for sub, rng in (('arabic', AR), ('latin', LA)):
        p = f'{KF}-{sub}-{w}-normal.woff2'
        assert os.path.exists(p), p
        FONTS += f"@font-face{{font-family:KF;font-weight:{w};src:url('file://{p}') format('woff2');unicode-range:{rng}}}\n"

G = 'oklch(0.84 0.15 88)'

M = {}
M['trophy'] = '''<path d="M130 80h140v80c0 48-30 80-70 86-40-6-70-38-70-86z" fill="url(#gf)"/>
<path d="M130 100c-48 0-62 24-50 54s44 40 64 40M270 100c48 0 62 24 50 54s-44 40-64 40" fill="none" stroke="G" stroke-width="12" stroke-linecap="round"/>
<rect x="184" y="246" width="32" height="46" rx="6" fill="url(#gf)"/><rect x="146" y="292" width="108" height="28" rx="8" fill="url(#gf)"/>
<path d="M200 112l12 26 28 4-20 20 5 28-25-14-25 14 5-28-20-20 28-4z" fill="rgba(0,0,0,.28)"/>'''
M['pitch'] = '''<rect x="40" y="70" width="320" height="260" rx="8" fill="none" stroke="G" stroke-width="7"/>
<path d="M200 70v260" stroke="G" stroke-width="7"/><circle cx="200" cy="200" r="52" fill="none" stroke="G" stroke-width="7"/><circle cx="200" cy="200" r="7" fill="G"/>
<rect x="40" y="140" width="62" height="120" fill="none" stroke="G" stroke-width="7"/><rect x="298" y="140" width="62" height="120" fill="none" stroke="G" stroke-width="7"/>
<path d="M255 120l40 30M250 280l50-26" stroke="rgba(255,255,255,.7)" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round"/><path d="M297 154l-4-16 16 4z" fill="#fff"/>'''
M['screen'] = '''<rect x="60" y="80" width="280" height="190" rx="22" fill="rgba(255,255,255,.07)" stroke="G" stroke-width="9"/>
<path d="M175 130l70 45-70 45z" fill="url(#gf)"/><path d="M80 238h240" stroke="rgba(255,255,255,.35)" stroke-width="5" stroke-dasharray="4 10"/>
<rect x="170" y="270" width="60" height="26" fill="G"/><rect x="130" y="296" width="140" height="16" rx="8" fill="G"/>
<text x="92" y="118" font-family="KF" font-weight="900" font-size="30" fill="G">VAR</text><circle cx="312" cy="106" r="9" fill="#ff3b30"/>'''
M['shield'] = '''<path d="M200 60l120 40v90c0 70-50 112-120 138-70-26-120-68-120-138v-90z" fill="rgba(255,255,255,.07)" stroke="G" stroke-width="10" stroke-linejoin="round"/>
<path d="M200 60v268" stroke="G" stroke-width="6" opacity=".55"/><path d="M80 170h240" stroke="G" stroke-width="6" opacity=".55"/>
<path d="M200 116l14 30 32 4-24 22 6 32-28-16-28 16 6-32-24-22 32-4z" fill="url(#gf)" transform="translate(0 52) scale(1)"/>'''
M['stars'] = '''<circle cx="200" cy="200" r="130" fill="none" stroke="G" stroke-width="5" stroke-dasharray="3 16" stroke-linecap="round"/>
<path d="M200 120l22 48 52 6-38 36 10 52-46-26-46 26 10-52-38-36 52-6z" fill="url(#gf)"/>
<g fill="G"><circle cx="200" cy="52" r="12"/><circle cx="324" cy="142" r="12"/><circle cx="278" cy="296" r="12"/><circle cx="122" cy="296" r="12"/><circle cx="76" cy="142" r="12"/></g>'''
M['duel'] = '''<circle cx="130" cy="200" r="86" fill="rgba(255,255,255,.07)" stroke="G" stroke-width="9"/><circle cx="270" cy="200" r="86" fill="rgba(255,255,255,.07)" stroke="G" stroke-width="9"/>
<path d="M130 160l30 22-11 36h-38l-11-36z" fill="url(#gf)"/><path d="M270 160l30 22-11 36h-38l-11-36z" fill="url(#gf)"/>
<rect x="164" y="170" width="72" height="60" rx="30" fill="#0b0f14"/><text x="200" y="212" text-anchor="middle" font-family="KF" font-weight="900" font-size="34" fill="G">VS</text>'''
M['flag'] = '''<g transform="rotate(-6 200 200)"><rect x="70" y="100" width="260" height="62" fill="#111"/><rect x="70" y="162" width="260" height="62" fill="#f4f4f0"/><rect x="70" y="224" width="260" height="62" fill="#1b9c4e"/>
<path d="M70 100l110 93-110 93z" fill="#d22b2b"/></g><rect x="52" y="86" width="12" height="236" rx="6" fill="G" transform="rotate(-6 200 200)"/>
<circle cx="300" cy="300" r="44" fill="#fff" stroke="G" stroke-width="6"/><path d="M300 276l20 15-8 24h-24l-8-24z" fill="#111"/>'''
M['stadium'] = '''<ellipse cx="200" cy="210" rx="170" ry="112" fill="none" stroke="G" stroke-width="9"/><ellipse cx="200" cy="210" rx="130" ry="82" fill="none" stroke="G" stroke-width="6" opacity=".7"/>
<ellipse cx="200" cy="210" rx="92" ry="54" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="3" opacity=".9"/><path d="M200 156v108M108 210h184" stroke="#fff" stroke-width="3" opacity=".6"/>
<path d="M60 130l-18-78M340 130l18-78" stroke="G" stroke-width="8" stroke-linecap="round"/><circle cx="42" cy="48" r="13" fill="G"/><circle cx="358" cy="48" r="13" fill="G"/>'''
M['board'] = '''<rect x="50" y="70" width="300" height="260" rx="22" fill="rgba(255,255,255,.07)" stroke="G" stroke-width="9"/>
<g stroke="G" stroke-width="9" stroke-linecap="round"><path d="M100 120l30 30M130 120l-30 30"/><path d="M100 250l30 30M130 250l-30 30"/><path d="M250 190l28 28M278 190l-28 28"/></g>
<g fill="none" stroke="#fff" stroke-width="8"><circle cx="205" cy="130" r="17"/><circle cx="205" cy="270" r="17"/><circle cx="305" cy="130" r="17"/></g>
<path d="M140 140c40 10 50 40 60 74M150 268c45-10 70-30 85-52" fill="none" stroke="G" stroke-width="5" stroke-dasharray="3 12" stroke-linecap="round"/>'''
M['ball'] = '''<circle cx="200" cy="200" r="130" fill="#f6f6f2" stroke="G" stroke-width="9"/>
<path d="M200 138l54 39-21 62h-66l-21-62z" fill="#111"/>
<g stroke="#111" stroke-width="8" stroke-linecap="round"><path d="M200 138V78M254 177l56-20M233 239l36 50M167 239l-36 50M146 177l-56-20"/></g>
<g fill="#111"><path d="M200 70l30 18-6 22h-48l-6-22z" opacity=".9"/></g>'''
M['fox'] = '''<path d="M80 80l90 56h60l90-56-24 128c-8 40-48 94-96 108-48-14-88-68-96-108z" fill="url(#gf)"/>
<path d="M200 316c-30-10-62-44-72-92l72 36 72-36c-10 48-42 82-72 92z" fill="#fff" opacity=".92"/>
<circle cx="156" cy="190" r="12" fill="#111"/><circle cx="244" cy="190" r="12" fill="#111"/><path d="M188 262h24l-12 16z" fill="#111"/>
<path d="M80 80l30 48M320 80l-30 48" stroke="#111" stroke-width="10" stroke-linecap="round" opacity=".35"/>'''
M['pulse'] = '''<circle cx="200" cy="200" r="132" fill="none" stroke="G" stroke-width="6" opacity=".55"/>
<path d="M50 210h80l28-72 46 140 34-96 20 28h92" fill="none" stroke="G" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#fff"><circle cx="302" cy="102" r="10"/><circle cx="112" cy="304" r="8"/></g>'''

def motif(name):
    s = M[name].replace('stroke="G"', f'stroke="{G}"').replace('fill="G"', f'fill="{G}"').replace('"G"', f'"{G}"')
    return f'''<svg viewBox="0 0 400 400" width="470" height="470" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="gf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="oklch(0.9 0.14 92)"/><stop offset="1" stop-color="oklch(0.7 0.16 62)"/></linearGradient></defs>{s}</svg>'''

BASE = f'''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><style>{FONTS}
*{{box-sizing:border-box;margin:0}}
html{{overflow:hidden;width:1200px;height:630px}}
body{{width:1200px;height:630px;overflow:hidden;font-family:KF,sans-serif;color:#fff;position:relative;
background:linear-gradient(135deg,oklch(0.27 0.075 var(--h)) 0%,oklch(0.16 0.05 calc(var(--h) + 24)) 62%,oklch(0.12 0.035 calc(var(--h) + 40)) 100%)}}
.grass{{position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 90px,transparent 90px 180px)}}
.ring{{position:absolute;left:-210px;top:50%;width:640px;height:640px;margin-top:-320px;border-radius:50%;border:5px solid rgba(255,255,255,.07)}}
.glow{{position:absolute;left:30px;top:80px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,oklch(0.72 0.17 var(--h) / .42),transparent 68%);filter:blur(10px)}}
.mot{{position:absolute;left:55px;top:80px;filter:drop-shadow(0 22px 34px rgba(0,0,0,.45))}}
.brand{{position:absolute;right:70px;bottom:44px;display:flex;align-items:center;gap:14px}}
.dot{{width:18px;height:18px;border-radius:50%;background:#ff3b30;box-shadow:0 0 0 7px rgba(255,59,48,.25)}}
.brand b{{font-weight:900;font-size:30px;letter-spacing:0}} .brand i{{font-style:normal;font-weight:700;font-size:20px;color:{G};direction:ltr;letter-spacing:.14em}}
.edge{{position:absolute;right:0;top:0;bottom:0;width:14px;background:linear-gradient(180deg,{G},oklch(0.7 0.16 62))}}
</style>'''

def size_for(n, base, small):
    return base if n <= 40 else small

def cover(a):
    t = wrap(html.escape(a['title']))
    L0 = len(a['title'])
    fs = 74 if L0 <= 30 else (62 if L0 <= 44 else 54)
    return BASE + f'''<body style="--h:{a['hue']}"><div class="grass"></div><div class="ring"></div><div class="glow"></div>
<div class="mot">{motif(a['motif'])}</div><div class="edge"></div>
<div style="position:absolute;right:84px;top:76px;width:620px">
<span style="display:inline-block;padding:9px 26px;border-radius:40px;border:2px solid {G};color:{G};font-weight:700;font-size:26px;background:rgba(255,255,255,.05)">{html.escape(a['kicker'])}</span>
<h1 style="margin-top:34px;font-size:{fs}px;line-height:1.38;font-weight:900;text-wrap:balance;text-shadow:0 4px 22px rgba(0,0,0,.45)">{t}</h1></div>
<div class="brand"><div class="dot"></div><b>سبورت لايف 24</b><i>LIVE</i></div></body></html>'''

def card(a):
    f = a['facts']
    n = len(f)
    tiles = ''
    for v, c in f:
        L = len(v)
        fs = 108 if L <= 4 else (86 if L <= 6 else (64 if L <= 9 else 50))
        if re.search('[\u0600-\u06FF]', v) and L > 3: fs = 54
        tiles += f'''<div style="background:linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.04));border:2px solid rgba(255,255,255,.14);border-radius:30px;padding:26px 30px;display:flex;flex-direction:column;justify-content:space-between;min-height:0">
<div dir="ltr" style="text-align:right;font-weight:900;font-size:{fs}px;line-height:1.05;color:{G};font-variant-numeric:tabular-nums">{wrap(html.escape(v))}</div>
<div style="font-weight:700;font-size:29px;line-height:1.5;color:#e9eef5">{wrap(html.escape(c))}</div></div>'''
    cols = 2 if n == 4 else 3
    rows = 2 if n == 4 else 1
    return BASE + f'''<body style="--h:{a['hue']}"><div class="grass"></div><div class="edge"></div>
<div style="position:absolute;right:76px;left:62px;top:46px;display:flex;justify-content:space-between;align-items:center">
<h2 style="font-size:46px;font-weight:900">{wrap(html.escape(a['infotitle']))}</h2>
<span style="padding:8px 22px;border-radius:40px;border:2px solid {G};color:{G};font-weight:700;font-size:24px">{html.escape(a['kicker'])}</span></div>
<div style="position:absolute;right:76px;left:62px;top:134px;bottom:112px;display:grid;grid-template-columns:repeat({cols},1fr);grid-template-rows:repeat({rows},1fr);gap:22px">{tiles}</div>
<div class="brand" style="bottom:34px"><div class="dot"></div><b>سبورت لايف 24</b><i>LIVE</i></div></body></html>'''

async def main():
    from playwright.async_api import async_playwright
    out = '/home/claude/bloger/images/articles'
    os.makedirs(out, exist_ok=True)
    os.makedirs('/tmp/art/html', exist_ok=True)
    only = sys.argv[1:]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
        for a in A:
            if only and a['slug'] not in only: continue
            for kind, fn in (('cover', cover), ('info', card)):
                fp = f"/tmp/art/html/{a['slug']}-{kind}.html"
                open(fp, 'w', encoding='utf8').write(fn(a))
                await pg.goto('file://' + fp)
                await pg.evaluate('document.fonts.ready')
                await pg.wait_for_timeout(250)
                await pg.screenshot(path=f"{out}/{a['slug']}-{kind}.jpg", type='jpeg', quality=84)
        await b.close()

asyncio.run(main())

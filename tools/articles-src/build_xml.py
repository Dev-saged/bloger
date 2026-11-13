import sys, re, html
sys.path.insert(0, '/tmp/art')
import a1, a2, a3, a4, a5, a6
from bidi import wrap
from xml.sax.saxutils import escape

SHA = sys.argv[1]
CDN = f'https://cdn.jsdelivr.net/gh/Dev-saged/bloger@{SHA}/images/articles/'
SITE = 'https://sport1live24.blogspot.com'

A = a1.A + a2.A + a3.A + a4.A
for a in A:
    a.update(a5.X[a['slug']])
    a['deep'] = a6.Y[a['slug']]
T = {a['slug']: a['title'] for a in A}

def fig(slug, kind, alt, cap=None, first=False):
    src = f'{CDN}{slug}-{kind}.jpg'
    c = f'<figcaption>{html.escape(cap)}</figcaption>' if cap else ''
    return (f'<figure style="margin:0 0 1.2em;text-align:center"><img src="{src}" alt="{html.escape(alt)}" width="1200" height="630" '
            f'style="max-width:100%;height:auto;border-radius:18px"{" fetchpriority=\"high\"" if first else " loading=\"lazy\""}/>{c}</figure>')

def body(a):
    s = a['slug']
    parts = [a['intro'], fig(s, 'cover', a['title'], first=True)]
    for i, (h, t) in enumerate(a['sections']):
        parts.append(f'<h2>{h}</h2>{t}')
        if i == 1:
            parts.append(fig(s, 'info', a['infotitle'] + ' — سبورت لايف 24', cap=a['infotitle']))
    parts.append(f"<h2>{a['extra'][0]}</h2>{a['extra'][1]}")
    parts.append(f"<h2>{a['deep'][0]}</h2>{a['deep'][1]}")
    faq = ''.join(f'<h3>{q}</h3><p>{an}</p>' for q, an in a['faq'])
    parts.append(f'<h2>أسئلة شائعة</h2>{faq}')
    parts.append(f"<h2>الخلاصة</h2>{a['outro']}")
    rel = ''.join(f'<li><a href="/2026/11/{r}.html">{html.escape(T[r])}</a></li>' for r in a['related'])
    parts.append(f'<h2>اقرأ أيضاً</h2><ul>{rel}</ul>')
    return wrap(''.join(parts))

def entry(i, a):
    mm = 2 * i
    ts = f'2026-11-12T19:{mm:02d}:00.000+02:00'
    cats = ''.join(f"<category scheme='http://www.blogger.com/atom/ns#' term='{escape(l)}'/>" for l in a['labels'])
    return f'''<entry>
<id>tag:blogger.com,1999:blog-8100000000000000001.post-{4100000000000000000 + i}</id>
<published>{ts}</published>
<updated>{ts}</updated>
<category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
{cats}
<title type='text'>{escape(a['title'])}</title>
<content type='html'>{escape(body(a))}</content>
<author><name>ساجد العبادلة</name></author>
<blogger:type>POST</blogger:type>
<blogger:status>LIVE</blogger:status>
<blogger:filename>/2026/11/{a['slug']}.html</blogger:filename>
<blogger:metaDescription>{escape(a['desc'])}</blogger:metaDescription>
</entry>'''

head = '''<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:blogger='http://schemas.google.com/blogger/2008' xmlns:gd='http://schemas.google.com/g/2005' xmlns:georss='http://www.georss.org/georss' xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/' xmlns:thr='http://purl.org/syndication/thread/1.0'>
<id>tag:blogger.com,1999:blog-8100000000000000001.archive</id>
<updated>2026-11-12T19:40:00.000+02:00</updated>
<title type='text'>سبورت لايف 24</title>
<generator version='7.00' uri='http://www.blogger.com'>Blogger</generator>
'''
out = head + '\n'.join(entry(i, a) for i, a in enumerate(A)) + '\n</feed>\n'
path = '/home/claude/bloger/articles/sport-live-24-articles-batch-1.xml'
import os
os.makedirs(os.path.dirname(path), exist_ok=True)
open(path, 'w', encoding='utf8').write(out)
tot = 0
for a in A:
    t = re.sub('<[^>]+>', ' ', body(a))
    n = len(t.split()); tot += n
print('articles', len(A), 'avg words', tot // len(A), 'bytes', len(out.encode('utf8')))

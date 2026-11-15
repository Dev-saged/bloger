# يدمج data.json (الدوافع والعناوين السابقة) داخل index.src.html وينتج index.html
import json,pathlib
d=pathlib.Path(__file__).parent
s=(d/'index.src.html').read_text(encoding='utf8')
assert '/*DATA*/null' in s
(d/'index.html').write_text(s.replace('/*DATA*/null',json.dumps(json.load(open(d/'data.json',encoding='utf8')),ensure_ascii=False)),encoding='utf8')

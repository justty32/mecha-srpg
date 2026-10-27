"""固定交付驗證：標準庫XML/HTML、現有Node與git；不啟動瀏覽器或網路。"""
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
ART = ROOT / 'art' / 'svg-study-1027'
NS = '{http://www.w3.org/2000/svg}'
subjects = ['kamau', 'samir', 'bulwark', 'bulwark-ritual', 'bulwark-feral', 'busan', 'busan-ritual', 'busan-feral', 'repair-dock']
terrain = ['tile-ground', 'tile-road', 'tile-rubble', 'tile-cover']
effects = ['fx-shot', 'fx-hit', 'fx-explosion']
expected = {name + '.svg' for name in subjects + terrain + effects + ['portrait-parts', 'mech-parts']}
assert {p.name for p in ART.glob('*.svg')} == expected
for path in sorted(ART.glob('*.svg')):
    raw = path.read_text()
    assert '<!DOCTYPE' not in raw and '<!ENTITY' not in raw
    root = ET.fromstring(raw)
    box = list(map(float, root.attrib['viewBox'].split()))
    assert len(box) == 4 and box[2] > 0 and box[3] > 0
    assert root.find(NS + 'title').text and root.find(NS + 'desc').text
    ids = [e.get('id') for e in root.iter() if e.get('id')]
    assert len(ids) == len(set(ids)), path.name
    assert any(e.tag == NS + 'g' for e in root.iter())
    for element in root.iter():
        assert element.tag.split('}')[-1] not in {'script', 'foreignObject', 'image', 'iframe', 'audio', 'video'}
        for attr, value in element.attrib.items():
            assert not attr.lower().startswith('on')
            if attr.split('}')[-1] == 'href':
                assert value.startswith('#') and value[1:] in ids
            for target in re.findall(r'url\(([^)]+)\)', value):
                assert target.strip('"\' ').startswith('#')
    if path.stem in terrain + effects:
        assert box == [0, 0, 128, 128]

for filename in ['busan.svg', 'busan-ritual.svg', 'busan-feral.svg']:
    root = ET.parse(ART / filename).getroot()
    layers = [e.get('id') for e in root if e.tag == NS + 'g']
    assert layers == ['background', 'far', 'mid', 'foreground', 'dynamic', 'interactive']
    hotspots = [e for e in root.iter() if e.get('data-hotspot')]
    assert {e.get('id') for e in hotspots} == {'hotspot-hangar', 'hotspot-shop', 'hotspot-dock'}
    assert all(e.get('tabindex') == '0' and e.get('role') == 'button' and e.get('aria-label') for e in hotspots)
    assert {e.get('data-moving') for e in root.iter() if e.get('data-moving')} >= {'ship', 'flag', 'smoke'}

for prefix, files in [('portrait', {'kamau':'kamau.svg', 'samir':'samir.svg'}), ('mech', {'cold':'bulwark.svg', 'ritual':'bulwark-ritual.svg', 'feral':'bulwark-feral.svg'})]:
    manifest = json.loads((ART / f'{prefix}-manifest.json').read_text())
    for key, filename in files.items():
        root = ET.parse(ART / filename).getroot()
        assert {e.get('id') for e in root.iter(NS + 'symbol')} == set(manifest['presets'][key]['parts'].values())
    changeable = ['face', 'hair', 'eyes', 'mouth', 'clothes'] if prefix == 'portrait' else ['head', 'armor', 'weapons']
    assert all(len(manifest['options'][key]) >= 2 for key in changeable)

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]; self.counts=Counter(); self.layers=Counter(); self.fragments=[]
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'): self.ids.append(attrs['id'])
        for key in ['src', 'href']:
            if key in attrs:
                if attrs[key].startswith('#'): self.fragments.append(attrs[key][1:])
                else: self.refs.append(attrs[key])
        if 'data-layer' in attrs: self.layers[attrs['data-layer']] += 1
        for key in ['data-layer-switch', 'data-hotspot', 'data-replay', 'data-doll-out', 'data-fallback']:
            if key in attrs: self.counts[key] += 1
        assert tag not in ['iframe', 'object', 'embed']
        if 'data-hotspot' in attrs: assert attrs.get('tabindex') == '0' and attrs.get('aria-label')

page = Page(); page.feed((ART / 'index.html').read_text())
assert len(page.ids) == len(set(page.ids))
assert set(page.fragments) <= set(page.ids)
assert page.counts == {'data-layer-switch':18, 'data-hotspot':9, 'data-replay':3, 'data-doll-out':2, 'data-fallback':2}
assert set(page.layers.values()) == {3} and len(page.layers) == 6
for ref in page.refs:
    assert not ref.startswith(('/', '//')) and not re.match(r'[a-z]+:', ref, re.I)
    assert (ART / ref).is_file(), ref
for path in ART.glob('*.css'):
    css = path.read_text()
    assert '@import' not in css and not re.search(r'animation[^;{}]*\binfinite\b', css)
    for target in re.findall(r'url\(([^)]+)\)', css):
        target = target.strip('"\' ')
        assert not re.match(r'[a-z]+:', target, re.I) and (ART / target).is_file()
fx = (ART / 'effects.css').read_text()
for key, duration in [('shot',280), ('hit',360), ('explosion',620)]:
    assert f'data-effect="{key}"' in fx
    assert f'study-fx-{key} {duration}ms' in fx
    body = re.search(r'@keyframes study-fx-' + key + r'\s*\{(.*?)(?=@keyframes|@media|\Z)', fx, re.S)[1]
    assert re.search(r'100%\s*\{\s*opacity:\s*0;', body)
assert 'prefers-reduced-motion: reduce' in fx and 'study-fx-reduced 120ms' in fx
city_css = (ART / 'city-motion.css').read_text()
assert 'animation-iteration-count: 1' in city_css
assert 'prefers-reduced-motion: reduce' in city_css and 'animation: none' in city_css
for filename in ['assembly.js', 'demo.js']:
    js = (ART / filename).read_text()
    assert not re.search(r'\bfetch\s*\(|XMLHttpRequest|https?://', js.replace('http://www.w3.org/2000/svg', ''))
    subprocess.run(['node', '--check', str(ART / filename)], check=True)
subprocess.run(['node', str(HERE / 'check-demo.cjs')], check=True)
subprocess.run(['git', 'diff', '--check', '--', str(ART), str(HERE)], cwd=ROOT, check=True)
for folder in [ART, HERE]:
    for path in folder.rglob('*'):
        if not path.is_file() or path.suffix not in {'.md','.py','.js','.cjs','.html','.css','.svg','.json'}:
            continue
        text = path.read_text()
        assert text.endswith('\n') and all(line == line.rstrip() for line in text.splitlines()), path.name
print('PASS 18 SVG (16 assets + 2 libraries), local references, six layers/9 focusable hotspots, selective defs, HTML/CSS/JS, whitespace.')
print('Not verified: real browser UI, layout, animation timeline; PNG reviews are static only.')

"""以本輪完整輸出製作靜態層控與效果影格；不是瀏覽器時間序列錄影。"""
import copy
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
ART = HERE.parents[4] / 'art/svg-study-1027'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
q = lambda name: '{' + NS + '}' + name
nodes = {n['id']: n for n in json.loads((ART / 'mech-layers.json').read_text())['nodes']}


def beneath(leaf, parent):
    while leaf:
        if leaf == parent:
            return True
        leaf = nodes[leaf]['parent']
    return False


def prepare(filename, mode):
    graphic = ET.parse(ART / filename).getroot()
    # 已重建機甲輸出可視幾何為instance，不依賴defs shadow tree。
    assembled = graphic.find(".//*[@id='assembled']")
    assert assembled is not None
    for element in assembled.iter():
        leaf = element.get('data-mech-node')
        if leaf:
            hidden = ((mode == 'no-left-arm-and-weapon' and (beneath(leaf, 'arm-left') or beneath(leaf, 'weapon-left'))) or
                      (mode == 'shoulder-only' and not beneath(leaf, 'arm-left-shoulder')) or
                      (mode == 'no-shoulder-crown' and leaf == 'arm-left-shoulder-crown'))
            if hidden:
                element.set('display', 'none')
    return graphic


def insert(sheet, graphic, col, row, label):
    prefix = f'evidence-{row}-{col}-'
    mapping = {n.get('id'): prefix + n.get('id') for n in graphic.iter() if n.get('id')}
    for n in graphic.iter():
        for key, value in list(n.attrib.items()):
            if key == 'id':
                n.set(key, mapping[value])
            elif key.split('}')[-1] == 'href' and value.startswith('#'):
                n.set(key, '#' + mapping[value[1:]])
            elif key in {'aria-labelledby', 'aria-describedby'}:
                n.set(key, ' '.join(mapping.get(v, v) for v in value.split()))
            else:
                n.set(key, re.sub(r'url\(#([^)]*)\)', lambda m: 'url(#' + mapping[m[1]] + ')', value))
    for child in graphic:
        if child.tag == q('g'):
            # 證據頁也維持五層：直接變換既有assembly，不外加wrapper。
            child.set('transform', f'translate({col * 480 + 20} {row * 600 + 18}) scale(.55) ' + child.get('transform', ''))
        sheet.append(child)
    ET.SubElement(sheet, q('text'), {'x': str(col * 480 + 16), 'y': str(row * 600 + 575),
                                   'font-family': 'sans-serif', 'font-size': '17', 'fill': '#f4e8ce'}).text = label


def sheet(cols, rows, title):
    root = ET.Element(q('svg'), {'viewBox': f'0 0 {cols * 480} {rows * 600}'})
    ET.SubElement(root, q('title')).text = title
    ET.SubElement(root, q('desc')).text = 'Offline static SVG evidence; no GUI, network, or browser animation capture.'
    ET.SubElement(root, q('rect'), {'width': str(cols * 480), 'height': str(rows * 600), 'fill': '#18232b'})
    return root


def save(name, root):
    ET.indent(root)
    (HERE / name).write_text(ET.tostring(root, encoding='unicode') + '\n')


choices = [('cold', 'bulwark.svg'), ('ritual', 'bulwark-ritual.svg'), ('feral', 'bulwark-feral.svg')]
root = sheet(4, 3, 'Three presets: full / hide left arm and weapon / solo left shoulder / hide left shoulder crown')
for row, (key, filename) in enumerate(choices):
    for col, mode in enumerate(['full', 'no-left-arm-and-weapon', 'shoulder-only', 'no-shoulder-crown']):
        insert(root, prepare(filename, mode), col, row, f'{key} / {mode}')
save('layers-contact.svg', root)
print('Created layers-contact.svg; effects sheet follows after CSS phase inspection.')

# CSS關鍵狀態的靜態幾何證據，不宣稱它們是同一毫秒的瀏覽器採樣。
# 新校準/掃描65%、掠光55%、電暈/羽流55%、粒子軌跡58%；依astra峰值建議。
effects = sheet(3, 3, 'Static effect snapshots: sensor / armor light band / energy and thermal flow')
for row, (key, filename) in enumerate(choices):
    for col, phase in enumerate(['sensors', 'sweep', 'energy']):
        graphic = prepare(filename, 'full')
        assembled = graphic.find(".//*[@id='assembled']")
        defs = graphic.find(q('defs'))
        if defs is None:
            defs = ET.SubElement(graphic, q('defs'))
        clip = ET.SubElement(defs, q('clipPath'), {'id': 'evidence-sheen-band', 'clipPathUnits': 'objectBoundingBox'})
        ET.SubElement(clip, q('polygon'), {'points': '.35,0 .85,0 .55,1 .05,1'})
        for element in assembled.iter():
            effect = element.get('data-mech-effect')
            if not effect:
                continue
            animation = element.get('style', '')
            if phase == 'sensors' and effect == 'sensor':
                element.set('opacity', '1' if 'mech-calibration-ring' in animation else '.9')
                element.set('stroke-dashoffset', '0')
            elif phase == 'sweep' and effect == 'sheen':
                element.set('opacity', '1')
                element.set('clip-path', 'url(#evidence-sheen-band)')
            elif phase == 'energy' and effect in {'energy', 'vent', 'particle'}:
                element.set('opacity', {'energy': '.9', 'vent': '.8', 'particle': '.9'}[effect])
                if any(name in animation for name in ['mech-corona-flow', 'mech-particle-track']):
                    element.set('opacity', '1')
                if 'mech-plume-unfurl' in animation:
                    element.set('opacity', '.9')
                element.set('stroke-dashoffset', '0')
        insert(effects, graphic, col, row, f'{key} / {phase} (static sample)')
save('effects-contact.svg', effects)
print('Created effects-contact.svg; static CSS-state illustration, NOT animation timeline verification.')

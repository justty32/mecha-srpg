"""以現有部件重建8個組合，輸出接點驗收 contact sheet。"""
import copy
import sys
import importlib.util
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
ART = HERE.parents[4] / 'art' / 'svg-study-1027'
spec = importlib.util.spec_from_file_location('rebuild', ART / 'rebuild.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
q = build.q
mech_only = '--mech-only' in sys.argv
sheet_name = 'mech-contact-sheet.svg' if mech_only else 'doll-contact-sheet.svg'
sheet = ET.Element(q('svg'), {'viewBox': '0 0 1920 640' if mech_only else '0 0 1920 1280'})
ET.SubElement(sheet, q('title')).text = 'Doll assembly contact sheet: 4 portrait + 4 mech combinations'
ET.SubElement(sheet, q('desc')).text = 'Offline rendered assembly evidence, visual proposals. First row: two portrait presets and two cross combinations. Second row: three mech style presets and one mixed build.'
ET.SubElement(sheet, q('rect'), {'width': '1920', 'height': '640' if mech_only else '1280', 'fill': '#26343d'})
records = []
for prefix in (['mech'] if mech_only else ['portrait', 'mech']):
    source, manifest = build.read_family(prefix)
    keys = list(manifest['presets'])
    base = copy.deepcopy(manifest['presets'][keys[0]])
    mixed1, mixed2 = copy.deepcopy(base), copy.deepcopy(base)
    variable = [k for k in manifest['layers'] if len(manifest['options'][k]) > 1]
    if prefix == 'portrait':
        # 交叉臉型/頭髮，再獨立換眉眼/鼻口/服裝，涵蓋全部可換類。
        for layer in ['face', 'hair']:
            mixed1['parts'][layer] = manifest['presets'][keys[1]]['parts'][layer]
        for layer in ['eyes', 'mouth', 'clothes']:
            mixed2['parts'][layer] = manifest['presets'][keys[1]]['parts'][layer]
        manifest['presets']['cross-face-hair'] = mixed1
        manifest['presets']['cross-features-clothes'] = mixed2
        choices = keys + ['cross-face-hair', 'cross-features-clothes']
    else:
        mixed1['parts']['head'] = manifest['presets']['ritual']['parts']['head']
        mixed1['parts']['armor'] = manifest['presets']['feral']['parts']['armor']
        mixed1['parts']['weapons'] = manifest['presets']['ritual']['parts']['weapons']
        manifest['presets']['mixed'] = mixed1
        choices = keys + ['mixed']
    for col, key in enumerate(choices):
        row = 0 if prefix == 'portrait' or mech_only else 1
        x, y = col * 480, row * 640
        graphic = build.make_output(source, manifest, key, None)
        _, _, width, height = map(float, manifest['viewBox'].split())
        scale = min(440 / width, 550 / height)
        dx = x + (480 - width * scale) / 2
        group = ET.SubElement(sheet, q('g'), {'id': f'sample-{prefix}-{key}', 'transform': f'translate({dx} {y + 30}) scale({scale})'})
        idmap = {e.get('id'): f'{prefix}-{key}-{e.get("id")}' for e in graphic.iter() if e.get('id')}
        for e in graphic.iter():
            if e.get('id'): e.set('id', idmap[e.get('id')])
            for attr, value in list(e.attrib.items()):
                if attr.split('}')[-1] == 'href' and value.startswith('#'): e.set(attr, '#' + idmap[value[1:]])
        for child in graphic:
            group.append(child)
        text = ET.SubElement(sheet, q('text'), {'x': str(x + 20), 'y': str(y + 615), 'fill': '#f3e2ba', 'font-size': '18', 'font-family': 'sans-serif'})
        text.text = prefix + ' / ' + key
        records.append(f'{prefix}/{key}: ' + ', '.join(f'{layer}={part}' for layer, part in manifest['presets'][key]['parts'].items()))
ET.indent(sheet)
(HERE / sheet_name).write_text(ET.tostring(sheet, encoding='unicode') + '\n')
print('\n'.join(records))
print('Created', sheet_name)

"""離線重建：部件 SVG + manifest -> 完整樣張與含共用 defs 的 file:// 展示。"""
import copy
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
source_names = {'portrait-640': 'portrait-parts.svg + portrait-manifest.json', 'bulwark-800': 'mech-parts.svg + mech-manifest.json'}

def q(tag):
    return '{' + NS + '}' + tag

def read_family(prefix):
    manifest = json.loads((ROOT / f'{prefix}-manifest.json').read_text())
    source = ET.parse(ROOT / f'{prefix}-parts.svg').getroot()
    symbols = {e.get('id'): e for e in source.iter(q('symbol'))}
    assert source.get('viewBox') == manifest['viewBox']
    assert len(symbols) == len(list(source.iter(q('symbol'))))
    for layer in manifest['layers']:
        for option in manifest['options'][layer]:
            assert option['id'] in symbols, option['id']
    for preset in manifest['presets'].values():
        assert set(preset['parts']) == set(manifest['layers'])
        for layer, value in preset['parts'].items():
            assert value in {o['id'] for o in manifest['options'][layer]}
    return source, manifest

def referenced_ids(node):
    refs = set()
    for element in node.iter():
        for attr, value in element.attrib.items():
            if attr.split('}')[-1] == 'href':
                assert value.startswith('#'), 'external reference forbidden'
                refs.add(value[1:])
            refs.update(re.findall(r'url\([\"\']?#([^\"\')]+)', value))
        if element.tag == q('style') and element.text:
            refs.update(re.findall(r'url\([\"\']?#([^\"\')]+)', element.text))
    return refs


def selected_defs(source, selected):
    # 以defs直屬節點為最小複製單位；內部id映射回擁有者，追遞迴引用。
    nodes = [child for defs in source.findall(q('defs')) for child in defs]
    owner = {element.get('id'): index for index, node in enumerate(nodes) for element in node.iter() if element.get('id')}
    needed = {index for index, node in enumerate(nodes) if node.tag == q('style') and not node.get('id')}
    pending = list(selected)
    for index in needed:
        pending.extend(referenced_ids(nodes[index]))
    while pending:
        item = pending.pop()
        assert item in owner, f'missing local def: {item}'
        index = owner[item]
        if index in needed:
            continue
        needed.add(index)
        pending.extend(referenced_ids(nodes[index]))
    defs = ET.Element(q('defs'))
    for index, node in enumerate(nodes):
        if index in needed:
            defs.append(copy.deepcopy(node))
    return defs


def make_output(source, manifest, preset_key, filename):
    preset = manifest['presets'][preset_key]
    root = ET.Element(q('svg'), {'viewBox': manifest['viewBox'], 'role': 'img', 'aria-labelledby': 'output-title output-desc'})
    ET.SubElement(root, q('title'), {'id': 'output-title'}).text = preset.get('title', preset['label'])
    ET.SubElement(root, q('desc'), {'id': 'output-desc'}).text = preset.get('desc', '') + f' 視覺草案；來源：{source_names[manifest["family"]]}，由rebuild.py重建，未載細節均美術提案。'
    symbols = {e.get('id'): e for e in source.iter(q('symbol'))}
    selected = [symbols[preset['parts'][layer]] for layer in manifest['layers']]
    is_mech = manifest['family'] == 'bulwark-800'
    root.append(selected_defs(source, set().union(*(referenced_ids(node) for node in selected)) if is_mech else preset['parts'].values()))
    # 保留來源根節點的描邊與線端等全域美術屬性。
    group = ET.SubElement(root, q('g'), {'id': 'assembled', **{k: v for k, v in source.attrib.items() if k not in {'viewBox', 'id', 'role', 'aria-labelledby', 'width', 'height', 'data-family'}}})
    _, _, width, height = manifest['viewBox'].split()
    if is_mech:
        ids = {e.get('id'): 'output-' + e.get('id') for symbol in selected for e in symbol.iter() if e.get('id')}
        group.set('data-assembly', manifest['family'])
        group.set('data-mech-phase', 'idle')
        group.set('data-mech-play', 'paused')
        group.set('data-mech-reduced', 'false')
        for layer, symbol in zip(manifest['layers'], selected):
            for child in symbol:
                node = copy.deepcopy(child)
                node.set('data-part', layer)
                for element in node.iter():
                    for attr, value in list(element.attrib.items()):
                        if attr == 'id':
                            value = ids[value]
                        elif attr.split('}')[-1] == 'href' and value.startswith('#'):
                            value = '#' + ids.get(value[1:], value[1:])
                        elif attr in {'aria-labelledby', 'aria-describedby'}:
                            value = ' '.join(ids.get(key, key) for key in value.split())
                        value = re.sub(r'url\(["\']?#([^"\')]+)["\']?\)', lambda match: 'url(#' + ids.get(match[1], match[1]) + ')', value)
                        element.set(attr, value)
                group.append(node)
    else:
        for layer in manifest['layers']:
            node = ET.SubElement(group, q('g'), {'id': 'part-' + layer, 'data-part': layer})
            ET.SubElement(node, q('use'), {'href': '#' + preset['parts'][layer], 'width': width, 'height': height})
    ET.indent(root)
    if filename:
        (ROOT / filename).write_text(ET.tostring(root, encoding='unicode') + '\n')
    return root

def mech_tree_data(source, manifest):
    data = json.loads((ROOT / 'mech-layers.json').read_text())
    assert data['version'] == 1 and data['family'] == manifest['family']
    nodes = {node['id']: node for node in data['nodes']}
    assert len(nodes) == len(data['nodes']), 'duplicate semantic id'
    leaves = {key for key, node in nodes.items() if node['level'] == 'leaf'}
    shapes = {'path', 'rect', 'ellipse', 'circle', 'polygon', 'polyline', 'line', 'use'}

    def nonempty(element):
        tag = element.tag.split('}')[-1]
        if tag == 'path':
            return bool(element.get('d', '').strip())
        if tag in {'polygon', 'polyline'}:
            return len(re.findall(r'-?\d+(?:\.\d+)?', element.get('points', ''))) >= 4
        if tag == 'use':
            return bool(element.get('href') or element.get('{http://www.w3.org/1999/xlink}href'))
        keys = {'rect': ['width', 'height'], 'ellipse': ['rx', 'ry'], 'circle': ['r']}.get(tag)
        if keys:
            return all(float(element.get(key, '0')) > 0 for key in keys)
        return tag == 'line' and (element.get('x1', '0'), element.get('y1', '0')) != (element.get('x2', '0'), element.get('y2', '0'))

    index = {}
    for symbol in source.iter(q('symbol')):
        selected = set()

        def visit(element, owner=None):
            tag = element.tag.split('}')[-1]
            if tag in {'defs', 'clipPath', 'mask', 'filter'}:
                return
            marker = element.get('data-mech-node')
            if marker:
                assert owner is None, f'nested leaf markers: {marker}'
                assert marker in leaves, f'unknown leaf: {marker}'
                assert any(e.tag.split('}')[-1] in shapes and nonempty(e) for e in element.iter()), f'empty leaf: {marker}'
                owner = marker
            if tag in shapes and nonempty(element):
                assert owner, f'uncontrolled geometry: {symbol.get("id")}'
                selected.add(owner)
            for child in element:
                visit(child, owner)

        visit(symbol)
        index[symbol.get('id')] = sorted(selected)
    for key, preset in manifest['presets'].items():
        active = set().union(*(set(index[value]) for value in preset['parts'].values()))
        assert len(active) >= 100, f'{key}: only {len(active)} effective leaves'
    return data, index


def doll(prefix, source, manifest):
    escaped = html.escape
    controls = ''.join(f'<label>{escaped(layer)}<select data-part-select="{escaped(layer)}">' + ''.join(f'<option value="{escaped(option["id"])}">{escaped(option["label"])}</option>' for option in manifest['options'][layer]) + '</select></label>' for layer in manifest['layers'] if len(manifest['options'][layer]) > 1)
    presets = ''.join(f'<button type="button" data-preset="{escaped(key)}">還原{escaped(p["label"])}</button>' for key, p in manifest['presets'].items())
    defs = ''.join(ET.tostring(e, encoding='unicode') for e in source.findall(q('defs')))
    manifest = copy.deepcopy(manifest)
    manifest['fallbacks'] = ({'kamau': {'src': 'kamau.svg', 'label': '卡茂完整立繪'}} if prefix == 'portrait' else {'cold': {'src': 'bulwark.svg', 'label': '堅盾完整立繪'}})
    attrs = ' '.join(f'{k}="{escaped(v)}"' for k, v in source.attrib.items() if k not in {'viewBox', 'id', 'role', 'aria-labelledby', 'width', 'height', 'data-family'})
    data = json.dumps(manifest, ensure_ascii=False).replace('<', '\\u003c')
    tree = ''
    tree_json = ''
    if prefix == 'mech':
        layer_data, symbol_leaves = mech_tree_data(source, manifest)
        tree = '<div class="mech-tree" data-mech-tree><p class="mech-tree-help">機體左在畫面右。展開中層查看零件；武器與手臂各自控制。單看不改勾選偏好。</p><fieldset><legend>機甲大／中／細零件樹</legend><button type="button" data-mech-reset>還原可見性</button><button type="button" data-mech-solo-exit disabled>退出單看</button><div class="preset-buttons"><button type="button" data-mech-arm-pair="left-hide">隱藏左臂連同武器</button><button type="button" data-mech-arm-pair="left-show">顯示左臂連同武器</button><button type="button" data-mech-arm-pair="right-hide">隱藏右臂連同武器</button><button type="button" data-mech-arm-pair="right-show">顯示右臂連同武器</button></div><div class="mech-tree-nodes" data-mech-tree-nodes></div></fieldset><p class="mech-tree-status" data-mech-tree-status role="status"></p></div>'
        tree += '<fieldset class="mech-tree" data-mech-motion><legend>機甲啟動演出</legend><button type="button" data-mech-play-button>啟動／從頭播放</button><button type="button" data-mech-pause-button>暫停</button><button type="button" data-mech-motion-reset>還原演出</button><p data-mech-motion-status role="status"></p></fieldset>'
        tree_json = '<script type="application/json" data-mech-layers>' + json.dumps(layer_data, ensure_ascii=False).replace('<', '\\u003c') + '</script><script type="application/json" data-mech-symbol-leaves>' + json.dumps(symbol_leaves, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
    return f'<article class="doll" data-family="{prefix}"><h3>{"人物" if prefix == "portrait" else "機甲"}換件</h3><div class="doll-layout"><svg xmlns="{NS}" viewBox="{manifest["viewBox"]}" role="img" aria-label="可換件視覺草案">{defs}<g data-doll-out="{prefix}" {attrs}></g></svg><div class="doll-controls">{controls}<div class="preset-buttons">{presets}</div><button type="button" data-mix>換兩個部件示範</button><button type="button" data-fallback>完整立繪 fallback 示意</button><p class="doll-status" role="status"></p>{tree}</div></div><script type="application/json" data-manifest>{data}</script>{tree_json}</article>'

def city(filename, key, label):
    root = ET.parse(ROOT / filename).getroot()
    # 檔內穩定 id 原樣保留；嵌進同頁後加命名空間避免三版碰撞，data-source-id可回溯。
    ids = {e.get('id'): key + '-' + e.get('id') for e in root.iter() if e.get('id')}
    for e in root.iter():
        old = e.get('id')
        if old:
            e.set('data-source-id', old)
            e.set('id', ids[old])
        for attr, value in list(e.attrib.items()):
            if attr.split('}')[-1] == 'href' and value.startswith('#'):
                e.set(attr, '#' + ids[value[1:]])
            elif attr in {'aria-labelledby', 'aria-describedby'}:
                e.set(attr, ' '.join(ids.get(x, x) for x in value.split()))
            elif 'url(#' in value:
                e.set(attr, re.sub(r'url\(#([^)]*)\)', lambda m: 'url(#' + ids[m[1]] + ')', value))
    for layer in ['background', 'far', 'mid', 'foreground', 'dynamic', 'interactive']:
        found = [e for e in root if e.tag == q('g') and e.get('data-source-id') == layer]
        assert len(found) == 1, (filename, layer)
        found[0].set('data-layer', layer)
    root.set('class', 'city-art')
    root.set('role', 'group')
    switches = ''.join(f'<label><input type="checkbox" data-layer-switch="{layer}" checked>{name}</label>' for layer, name in [('background','背景'),('far','遠景'),('mid','中景'),('foreground','前景'),('dynamic','動態物件'),('interactive','互動物件')])
    return f'<article class="city-inspector"><h3>{label}</h3><div class="layer-switches">{switches}</div><div class="city-view">{ET.tostring(root, encoding="unicode")}</div><button type="button" data-city-play>播放一次港口動態</button><p class="city-status" role="status">可用 Tab 聚焦機庫、商店與碼頭，再按 Enter／空白顯示說明。僅示意。</p></article>'

if __name__ == '__main__':
    # 樣式來源按原有畫序合併，保持 file 展示單一 style.css 請求。
    style_sources = ['showcase.css', 'battle.css', 'controls.css']
    style = '\n'.join((ROOT / 'styles' / name).read_text() for name in style_sources)
    (ROOT / 'style.css').write_text(style.replace('url(../tile-ground.svg)', 'url(tile-ground.svg)'))
    families = {prefix: read_family(prefix) for prefix in ['portrait', 'mech']}
    source_names = {m['family']: f'{prefix}-parts.svg + {prefix}-manifest.json' for prefix, (_, m) in families.items()}
    for prefix, mapping in [('portrait', {'kamau': 'kamau.svg', 'samir': 'samir.svg'}), ('mech', {'cold': 'bulwark.svg', 'ritual': 'bulwark-ritual.svg', 'feral': 'bulwark-feral.svg'})]:
        if '--mech-only' in sys.argv and prefix != 'mech':
            continue
        source, manifest = families[prefix]
        for preset, filename in mapping.items():
            make_output(source, manifest, preset, filename)
    if '--components-only' in sys.argv:
        print('Rebuilt selected component outputs from unique sources.')
        raise SystemExit(0)
    out = '<section id="styles"><h2>04 / 同題三套造型</h2><p>同一堅盾、同一釜山；材質與形狀有別，未載細節均為美術提案。<a href="art-direction.md">讀畫風說明與色票</a></p><div class="style-comparison">'
    for key, label, mech, town in [('cold','冷鋼重工','bulwark.svg','busan.svg'),('ritual','祕儀科技','bulwark-ritual.svg','busan-ritual.svg'),('feral','狂潮異形','bulwark-feral.svg','busan-feral.svg')]:
        out += f'<article><h3>{label}</h3><div class="mat dark"><img src="{mech}" alt="{label}堅盾"></div><div class="mat light"><img src="{town}" alt="{label}釜山"></div></article>'
    out += '</div></section><section id="dolls"><h2>05 / 同一接點，實際換件</h2><p>預設可還原角色與機甲；自由試裝是視覺示意，不改正史或遊戲數值。</p>'
    out += ''.join(doll(prefix, *families[prefix]) for prefix in families)
    out += '</section><section id="cities"><h2>06 / 城市六層與互動熱點</h2><p>取消互動層會一併隱藏物件與熱點。三版共用層級及機庫／商店／碼頭語義；點選不改遊戲狀態。</p>'
    out += ''.join(city(filename, key, label) for filename, key, label in [('busan.svg','cold','冷鋼重工'),('busan-ritual.svg','ritual','祕儀科技'),('busan-feral.svg','feral','狂潮異形')]) + '</section>'
    template = (ROOT / 'index.template.html').read_text()
    assert template.count('<!-- DOLL-AND-CITY -->') == 1
    (ROOT / 'index.html').write_text(template.replace('<!-- DOLL-AND-CITY -->', out))
    print('Rebuilt selected outputs and offline showcase from unique component sources.')

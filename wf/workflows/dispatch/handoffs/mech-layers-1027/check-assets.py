"""本輪固定資料檢查；本機XML/JSON，不載套件或網路。"""
import collections
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
ART = ROOT / 'art/svg-study-1027'
NS = '{http://www.w3.org/2000/svg}'
SHAPES = {'path', 'rect', 'ellipse', 'circle', 'polygon', 'polyline', 'line', 'use'}
RESOURCES = {'defs', 'title', 'desc', 'metadata', 'style'}


def tag(node):
    return node.tag.split('}')[-1]


def xml(path):
    raw = path.read_text()
    assert not re.search(r'<!DOCTYPE|<!ENTITY', raw, re.I), path
    root = ET.fromstring(raw)
    ids = [e.get('id') for e in root.iter() if e.get('id')]
    assert len(ids) == len(set(ids)), ('duplicate id', path)
    by_id = {e.get('id'): e for e in root.iter() if e.get('id')}
    for element in root.iter():
        assert tag(element) not in {'script', 'foreignObject', 'image'}, path
        for key, value in element.attrib.items():
            assert not key.lower().startswith('on'), (path, key)
            if key.split('}')[-1] == 'href':
                assert value.startswith('#') and value[1:] in by_id, (path, value)
            for ref in re.findall(r'url\(([^)]+)\)', value):
                ref = ref.strip(' \"\'')
                assert ref.startswith('#') and ref[1:] in by_id, (path, ref)
        if tag(element) == 'style':
            for ref in re.findall(r'url\(([^)]+)\)', element.text or ''):
                ref = ref.strip(' \"\'')
                assert ref.startswith('#') and ref[1:] in by_id, (path, ref)
    return root, by_id


def visual_depth(node, ids, depth=1, stack=()):
    if tag(node) in RESOURCES:
        return depth - 1
    maximum = depth
    if tag(node) == 'use':
        ref = node.get('href') or node.get('{http://www.w3.org/1999/xlink}href')
        assert ref and ref.startswith('#') and ref not in stack, ('recursive use', ref)
        target = ids[ref[1:]]
        # use is a visual container; symbol itself is a definition, children render inside use.
        children = list(target) if tag(target) == 'symbol' else [target]
        for child in children:
            maximum = max(maximum, visual_depth(child, ids, depth + 1, (*stack, ref)))
    for child in node:
        maximum = max(maximum, visual_depth(child, ids, depth + 1, stack))
    return maximum


def main():
    source, ids = xml(ART / 'mech-parts.svg')
    manifest = json.loads((ART / 'mech-manifest.json').read_text())
    data = json.loads((ART / 'mech-layers.json').read_text())
    assert data['family'] == manifest['family'] and data['version'] == 1
    nodes = {n['id']: n for n in data['nodes']}
    assert len(nodes) == len(data['nodes'])
    for item in nodes.values():
        assert re.search(r'[\u3400-\u9fff]', item['label']), item
        parent = item['parent']
        expected = {'major': None, 'middle': 'major', 'leaf': 'middle'}[item['level']]
        assert (parent is None) if expected is None else nodes[parent]['level'] == expected
        if item['level'] == 'leaf':
            assert item['purpose'] in {'structure', 'armor', 'decoration'}
        trail = set()
        cursor = item
        while cursor:
            assert cursor['id'] not in trail
            trail.add(cursor['id'])
            cursor = nodes[cursor['parent']] if cursor['parent'] else None
        assert len(trail) + 1 <= 5  # implicit semantic root is level 1
    results = {}
    outputs = {'cold': 'bulwark.svg', 'ritual': 'bulwark-ritual.svg', 'feral': 'bulwark-feral.svg'}
    for key, preset in manifest['presets'].items():
        leaves = set()
        effects = set()

        def visit(element, inherited=None):
            marker = element.get('data-mech-node')
            assert not (marker and inherited), ('nested leaf marker', marker)
            owner = marker or inherited
            if marker:
                assert marker in nodes and nodes[marker]['level'] == 'leaf', marker
                assert any(tag(e) in SHAPES for e in element.iter()), ('empty leaf', marker)
                leaves.add(marker)
            if tag(element) in SHAPES:
                assert owner, ('uncontrolled geometry', key, ET.tostring(element)[:100])
                if tag(element) == 'path':
                    assert element.get('d', '').strip(), ('empty path', owner)
            if element.get('data-mech-effect'):
                assert owner, ('effect without owner', key)
                effects.update(element.get('data-mech-effect').split())
            if tag(element) not in RESOURCES:
                for child in element:
                    visit(child, owner)

        for symbol in preset['parts'].values():
            visit(ids[symbol])
        assert len(leaves) >= 100, (key, len(leaves))
        assert len(effects) >= 3, (key, effects)
        parents = {nodes[leaf]['parent'] for leaf in leaves}
        majors = {nodes[mid]['parent'] for mid in parents}
        purposes = dict(collections.Counter(nodes[leaf]['purpose'] for leaf in leaves))
        output, out_ids = xml(ART / outputs[key])
        depth = visual_depth(output, out_ids)
        assert depth <= 5, (key, 'render depth', depth)
        results[key] = {'major': len(majors), 'middle': len(parents), 'leaf': len(leaves),
                        'purposes': purposes, 'svgDepth': depth, 'effects': sorted(effects)}
    (HERE / 'asset-check.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(results, ensure_ascii=False))
    print('PASS real selected geometry, semantic hierarchy, local references, output depth <=5')


if __name__ == '__main__':
    main()

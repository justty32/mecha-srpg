"""交付檔數與相對HEAD新增容量；排除本機log/last/bytecode。"""
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
ART = ROOT / 'art/svg-study-1027'
allowed = {'mech-parts.svg', 'mech-manifest.json', 'bulwark.svg', 'bulwark-ritual.svg',
           'bulwark-feral.svg', 'assembly.js', 'demo.js', 'rebuild.py', 'index.template.html',
           'index.html', 'workshop.css', 'README.md', 'SOURCES.md', 'check-tree.cjs'}
changed = subprocess.check_output(['git', 'diff', '--name-only', '--', str(ART)], cwd=ROOT, text=True).splitlines()
added = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '--', str(ART)], cwd=ROOT, text=True).splitlines()
files = []
for name in set(changed + added):
    p = ROOT / name
    if '__pycache__' in p.parts or p.suffix == '.pyc':
        continue
    assert p.name in allowed or p.name.startswith('mech-'), ('outside art scope', name)
    files.append(p)
files.extend(p for p in HERE.rglob('*') if p.is_file() and '__pycache__' not in p.parts
             and p.suffix not in {'.log', '.pyc'} and not p.name.endswith('.last.txt')
             and p.name != 'inventory.json')
records = []
for p in sorted(set(files)):
    name = p.relative_to(ROOT).as_posix()
    old = subprocess.run(['git', 'show', 'HEAD:' + name], cwd=ROOT, capture_output=True)
    old_bytes = len(old.stdout) if old.returncode == 0 else 0
    records.append({'path': name, 'bytes': p.stat().st_size, 'baseBytes': old_bytes,
                    'addedBytes': max(0, p.stat().st_size - old_bytes)})
# inventory.json自含大小以固定點收斂，避免數字漏算自身。
report_path = (HERE / 'inventory.json').relative_to(ROOT).as_posix()
records.append({'path': report_path, 'bytes': 0, 'baseBytes': 0, 'addedBytes': 0})
for _ in range(8):
    data = {'files': len(records), 'currentBytes': sum(r['bytes'] for r in records),
            'addedBytes': sum(r['addedBytes'] for r in records), 'records': records}
    raw = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    size = len(raw.encode())
    if records[-1]['bytes'] == size:
        break
    records[-1].update(bytes=size, addedBytes=size)
assert data['files'] <= 50 and data['addedBytes'] <= 6000000, data
(HERE / 'inventory.json').write_text(raw)
print(json.dumps({k: v for k, v in data.items() if k != 'records'}, ensure_ascii=False))

"""content_gate.py：每種違規代碼至少一個陽性，加上新增／潤飾／carry 的陰性（乾淨）案例。

跑法：`python3 -I -m unittest wf/tools/test_content_gate.py`（或 `python3 -I wf/tools/test_content_gate.py`）。
每個測試在暫存目錄建一個小 git repo 當 base，再改工作樹模擬 codex 的產出。
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import content_gate  # noqa: E402

BASE_FILES = {
    'content/base/frames/old-frame.json': {'id': 'frame/old-frame', 'name': '舊機', 'grade': 'C', 'tags': ['mech']},
    'content/base/registries/slot-types.json': {'kind': 'slot-types', 'entries': ['arm', 'back']},
    'content/base/world/events/ev-a.json': {
        'id': 'event/ev-a', 'weight': 3, 'text': '你聽見有人敲船殼。',
        'choices': [{'text': '開門', 'effects': [{'op': 'cash', 'amount': -10}]},
                    {'text': '不理', 'effects': [], 'next': 'event/ev-b'}],
        'tags': ['night'], 'lines': ['一', '二']},
    'content/lore/characters/old-man.json': {'id': 'character/old-man', 'name': '老人', 'faction': None},
    'content/lore/timeline.json': {'contract': 'lore-timeline/1', 'entries': [{'date': '2090'}, {'date': '2100'}]},
    'src/engine.ts': 'export const x = 1;\n',
}


def sh(cwd, *args):
    subprocess.run(args, cwd=cwd, check=True, capture_output=True)


class GateCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.wt = Path(self.tmp.name) / 'wt'
        self.wt.mkdir()
        for rel, body in BASE_FILES.items():
            p = self.wt / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(body if isinstance(body, str) else json.dumps(body, ensure_ascii=False, indent=1))
        (self.wt / '.gitignore').write_text('node_modules/\nscratch/\n')
        sh(self.wt, 'git', 'init', '-q', '-b', 'main')
        sh(self.wt, 'git', 'add', '-A')
        sh(self.wt, 'git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'base')
        self.base = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=self.wt, capture_output=True,
                                   text=True, check=True).stdout.strip()

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, rel, body):
        p = self.wt / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(body if isinstance(body, str) else json.dumps(body, ensure_ascii=False, indent=1))

    def edit(self, rel, fn):
        p = self.wt / rel
        data = json.loads(p.read_text())
        fn(data)
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2))

    def run_gate(self, manifest):
        manifest = {'id': 't', 'base': self.base, **manifest}
        v, approved, ignored = content_gate.check(self.wt, manifest, self.base)
        return {c for _, c, _ in v}, approved, ignored

    ADD = {'mode': 'add', 'maxFiles': 5,
           'allow': {'kinds': ['base/frames', 'lore/characters'], 'namePrefix': {'base/*': 'cx3-'},
                     'modify': [{'path': 'content/lore/timeline.json', 'rule': 'superset'}]}}
    POLISH = {'mode': 'polish', 'allow': {'polishFiles': ['content/base/world/events/*.json']}}

    # ---- 新增模式 ----
    def test_add_clean(self):
        self.write('content/base/frames/cx3-new.json', {'id': 'frame/cx3-new', 'name': '新機'})
        self.write('content/lore/characters/new-pilot.json', {'id': 'character/new-pilot', 'name': '新人'})
        self.edit('content/lore/timeline.json', lambda d: d['entries'].insert(1, {'date': '2095'}))
        codes, approved, _ = self.run_gate(self.ADD)
        self.assertEqual(codes, set())
        self.assertEqual(len(approved), 3)

    def test_add_outside_kinds(self):
        self.write('content/base/monsters/cx3-x.json', {'id': 'monster/cx3-x'})
        self.assertIn('PATH', self.run_gate(self.ADD)[0])

    def test_add_src_file(self):
        self.write('src/hack.ts', 'x')
        self.assertIn('PATH', self.run_gate(self.ADD)[0])

    def test_modify_existing(self):
        self.edit('content/base/frames/old-frame.json', lambda d: d.update(grade='B'))
        self.assertIn('MODIFY', self.run_gate(self.ADD)[0])

    def test_modify_engine(self):
        self.write('src/engine.ts', 'export const x = 2;\n')
        self.assertIn('MODIFY', self.run_gate(self.ADD)[0])

    def test_delete(self):
        (self.wt / 'content/base/frames/old-frame.json').unlink()
        self.assertIn('DELETE', self.run_gate(self.ADD)[0])

    def test_superset_violation(self):
        self.edit('content/lore/timeline.json', lambda d: d['entries'].pop(0))
        self.assertIn('SUPERSET', self.run_gate(self.ADD)[0])

    def test_superset_changed_value(self):
        self.edit('content/lore/timeline.json', lambda d: d['entries'][0].update(date='2091'))
        self.assertIn('SUPERSET', self.run_gate(self.ADD)[0])

    def test_name_prefix(self):
        self.write('content/base/frames/plain.json', {'id': 'frame/plain'})
        self.assertIn('NAME-PREFIX', self.run_gate(self.ADD)[0])

    def test_id_mismatch(self):
        self.write('content/base/frames/cx3-a.json', {'id': 'frame/cx3-b'})
        self.assertIn('ID', self.run_gate(self.ADD)[0])

    def test_id_kind(self):
        self.write('content/base/frames/cx3-a.json', {'id': 'monster/cx3-a'})
        self.assertIn('ID-KIND', self.run_gate(self.ADD)[0])

    def test_bad_json(self):
        self.write('content/base/frames/cx3-a.json', '{"id": ')
        self.assertIn('JSON', self.run_gate(self.ADD)[0])

    def test_ext(self):
        self.write('content/base/frames/cx3-a.md', 'x')
        self.assertIn('EXT', self.run_gate(self.ADD)[0])

    def test_symlink(self):
        os.symlink('/etc/passwd', self.wt / 'content/base/frames/cx3-link.json')
        self.assertIn('SYMLINK', self.run_gate(self.ADD)[0])

    def test_mode_change(self):
        os.chmod(self.wt / 'content/base/registries/slot-types.json', 0o755)
        m = dict(self.ADD, allow=dict(self.ADD['allow'], modify=[{'path': 'content/base/registries/slot-types.json'}]))
        self.assertIn('MODE', self.run_gate(m)[0])

    def test_ignored_write(self):
        self.write('scratch/notes.json', '{}')
        codes, _, ignored = self.run_gate(self.ADD)
        self.assertIn('IGNORED', codes)
        self.assertTrue(ignored)

    def test_gitignore_edit_cannot_hide(self):
        self.write('.gitignore', 'node_modules/\nscratch/\ncontent/base/monsters/\n')
        self.write('content/base/monsters/cx3-x.json', {'id': 'monster/cx3-x'})
        codes = self.run_gate(self.ADD)[0]
        self.assertIn('MODIFY', codes)
        self.assertIn('IGNORED', codes)

    def test_committed_change_seen(self):
        self.write('src/engine.ts', 'export const x = 3;\n')
        sh(self.wt, 'git', 'add', '-A')
        sh(self.wt, 'git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'sneak')
        self.assertIn('MODIFY', self.run_gate(self.ADD)[0])

    def test_node_modules_symlink_ok(self):
        os.symlink(self.tmp.name, self.wt / 'node_modules')
        self.write('content/base/frames/cx3-a.json', {'id': 'frame/cx3-a'})
        codes, approved, _ = self.run_gate(self.ADD)
        self.assertEqual(codes, set())
        self.assertEqual(approved, ['content/base/frames/cx3-a.json'])

    def test_count(self):
        for i in range(6):
            self.write(f'content/base/frames/cx3-n{i}.json', {'id': f'frame/cx3-n{i}'})
        self.assertIn('COUNT', self.run_gate(self.ADD)[0])

    def test_bad_mode(self):
        self.assertIn('MODE', self.run_gate({'mode': 'yolo'})[0])

    def test_base_mismatch(self):
        self.write('content/base/frames/cx3-a.json', {'id': 'frame/cx3-a'})
        sh(self.wt, 'git', 'add', '-A')
        sh(self.wt, 'git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'moved')
        self.assertIn('BASE', self.run_gate(self.ADD)[0])

    # ---- 潤飾模式 ----
    def test_polish_clean(self):
        def fn(d):
            d['text'] = '船殼被敲了三下。'
            d['choices'][0]['text'] = '去開'
            d['lines'][1] = '貳'
        self.edit('content/base/world/events/ev-a.json', fn)
        codes, approved, _ = self.run_gate(self.POLISH)
        self.assertEqual(codes, set())
        self.assertEqual(approved, ['content/base/world/events/ev-a.json'])

    def test_polish_reformat_only_not_approved(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: None)
        codes, approved, _ = self.run_gate(self.POLISH)
        self.assertEqual(codes, set())
        self.assertEqual(approved, [])

    def test_polish_number(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d['choices'][0]['effects'][0].update(amount=-99))
        self.assertIn('POLISH-VALUE', self.run_gate(self.POLISH)[0])

    def test_polish_id(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d.update(id='event/ev-z'))
        self.assertIn('POLISH-FIELD', self.run_gate(self.POLISH)[0])

    def test_polish_ref(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d['choices'][1].update(next='event/ev-c'))
        self.assertIn('POLISH-FIELD', self.run_gate(self.POLISH)[0])

    def test_polish_tags(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d['tags'].__setitem__(0, 'day'))
        self.assertIn('POLISH-FIELD', self.run_gate(self.POLISH)[0])

    def test_polish_add_key(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d.update(name='新名'))
        self.assertIn('POLISH-KEYS', self.run_gate(self.POLISH)[0])

    def test_polish_array_length(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d['choices'].pop())
        self.assertIn('POLISH-LENGTH', self.run_gate(self.POLISH)[0])

    def test_polish_type(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d.update(weight='3'))
        self.assertIn('POLISH-TYPE', self.run_gate(self.POLISH)[0])

    def test_polish_idlike_text(self):
        self.edit('content/base/world/events/ev-a.json', lambda d: d.update(text='event/ev-b'))
        self.assertIn('POLISH-IDREF', self.run_gate(self.POLISH)[0])

    def test_polish_scope(self):
        self.edit('content/base/frames/old-frame.json', lambda d: d.update(name='改名'))
        self.assertIn('POLISH-SCOPE', self.run_gate(self.POLISH)[0])

    def test_polish_textfields_narrowed(self):
        m = {'mode': 'polish', 'allow': {'polishFiles': ['content/base/world/events/*.json'], 'textFields': ['text']}}
        self.edit('content/base/world/events/ev-a.json', lambda d: d['lines'].__setitem__(0, '壹'))
        self.assertIn('POLISH-FIELD', self.run_gate(m)[0])

    def test_polish_prose_fields_opt_in(self):
        m = {'mode': 'polish', 'allow': {'polishFiles': ['content/base/world/events/*.json'], 'proseFields': ['tags']}}
        self.edit('content/base/world/events/ev-a.json', lambda d: d['tags'].__setitem__(0, '蝕盛'))
        codes, approved, _ = self.run_gate(m)
        self.assertEqual(codes, set())
        self.assertEqual(approved, ['content/base/world/events/ev-a.json'])

    def test_polish_prose_fields_unknown_ignored(self):
        m = {'mode': 'polish', 'allow': {'polishFiles': ['content/base/world/events/*.json'], 'proseFields': ['id']}}
        self.edit('content/base/world/events/ev-a.json', lambda d: d.update(id='event/ev-z'))
        self.assertIn('POLISH-FIELD', self.run_gate(m)[0])

    def test_polish_no_add(self):
        self.write('content/base/world/events/ev-new.json', {'id': 'event/ev-new'})
        self.assertIn('ADD', self.run_gate(self.POLISH)[0])

    # ---- carry 與 CLI ----
    def test_carry_refuses_changed_destination(self):
        dest = Path(self.tmp.name) / 'dest'
        sh(self.tmp.name, 'git', 'clone', '-q', str(self.wt), str(dest))
        self.edit('content/base/world/events/ev-a.json', lambda d: d.update(text='改過'))
        (dest / 'content/base/world/events/ev-a.json').write_text('{"id": "event/ev-a", "別線": 1}')
        done, refused = content_gate.carry(self.wt, self.base, dest, 'polish', ['content/base/world/events/ev-a.json'])
        self.assertEqual(done, [])
        self.assertEqual(len(refused), 1)

    def test_carry_add_and_cli_exit_codes(self):
        dest = Path(self.tmp.name) / 'dest'
        sh(self.tmp.name, 'git', 'clone', '-q', str(self.wt), str(dest))
        self.write('content/base/frames/cx3-a.json', {'id': 'frame/cx3-a'})
        man = Path(self.tmp.name) / 'm.json'
        man.write_text(json.dumps({'id': 't', 'base': self.base, **self.ADD}))
        script = Path(content_gate.__file__)
        ok = subprocess.run([sys.executable, '-I', str(script), str(self.wt), str(man), '--carry', str(dest)],
                            capture_output=True, text=True)
        self.assertEqual(ok.returncode, 0, ok.stdout + ok.stderr)
        self.assertTrue((dest / 'content/base/frames/cx3-a.json').exists())
        self.write('src/engine.ts', 'boom')
        bad = subprocess.run([sys.executable, '-I', str(script), str(self.wt), str(man), '--json'],
                             capture_output=True, text=True)
        self.assertEqual(bad.returncode, 1)
        self.assertIn('MODIFY', bad.stdout)


if __name__ == '__main__':
    unittest.main()

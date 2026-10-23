"""inbox_ack.sh：dry-run 不動檔、--apply 併進 done/<日期>/messages.json 並記 STATE（全在暫存目錄）。

2026-10-23 隨 inbox_ack.sh 從 moddings/skyrim 移植時新寫（原處沒有對應的單元測試）。
"""

import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ACK = Path(__file__).resolve().with_name('inbox_ack.sh')
LETTER = '---\nfrom: cx-a\nstatus: DONE\nat: 2026-10-23T12:00:00+08:00\n---\n# a 做完了\n\n## 做了什麼\n見 /tmp/x/REPORT.md\n'


class InboxAckTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / 'inbox'
        (self.root / 'new').mkdir(parents=True)
        self.letter = self.root / 'new' / '20261023T1200-cx-a-DONE.md'
        self.letter.write_text(LETTER, encoding='utf-8')
        self.state = Path(self.tmp.name) / 'STATE.md'
        self.env = dict(os.environ, AGENT_INBOX_ROOT=str(self.root), AGENT_STATE_FILE=str(self.state))

    def run_ack(self, *args):
        return subprocess.run(['bash', str(ACK), *args], env=self.env, text=True, capture_output=True)

    def test_dry_run_touches_nothing(self):
        r = self.run_ack('--all', '--state', '收了')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('report: /tmp/x/REPORT.md', r.stdout)
        self.assertIn('dry-run', r.stdout)
        self.assertTrue(self.letter.exists())
        self.assertFalse((self.root / 'done').exists())
        self.assertFalse(self.state.exists())

    def test_apply_archives_and_logs(self):
        r = self.run_ack('--from', 'cx-a', '--state', '收了', '--apply')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertFalse(self.letter.exists())
        self.assertTrue((self.root / '.state' / 'acked' / self.letter.name).exists())
        data = json.loads((self.root / 'done' / '2026-10-23' / 'messages.json').read_text(encoding='utf-8'))
        self.assertEqual(data['contract'], 'wf-table/1')
        self.assertEqual([row['file'] for row in data['rows']], [self.letter.name])
        self.assertIn('cx-a DONE：收了', self.state.read_text(encoding='utf-8'))

    def test_usage(self):
        self.assertEqual(self.run_ack().returncode, 2)


if __name__ == '__main__':
    unittest.main()

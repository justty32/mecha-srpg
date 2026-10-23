"""cx_launch.sh／cx_watch.sh：用假 tmux（腳本）與假 /proc 樹測，不開真的 tmux、不跑 codex。

移植自 moddings/skyrim agentctl/tools/test_cx_tools.py（2026-10-23），改成本專案的預設旗標與唯讀信件掃描。
"""

import json
import os
from pathlib import Path
import subprocess
import tempfile
import textwrap
import unittest

TOOLS = Path(__file__).resolve().parent
LAUNCH = TOOLS / 'cx_launch.sh'
WATCH = TOOLS / 'cx_watch.sh'
INBOX = (TOOLS.parent / 'inbox').resolve()
DEFAULT_FLAGS = f'-s workspace-write --add-dir {INBOX}'

FAKE_TMUX = textwrap.dedent('''\
    #!/usr/bin/env python3
    # 假 tmux：sessions/<名> 檔＝session 存在；screens.json 是 capture-pane 依序回傳的畫面
    # （最後一張黏住）；所有呼叫記到 log.jsonl。
    import json, os, sys
    d = os.environ['FAKE_TMUX_DIR']; a = sys.argv[1:]
    with open(os.path.join(d, 'log.jsonl'), 'a') as fh:
        fh.write(json.dumps(a, ensure_ascii=False) + '\\n')
    def target():
        t = a[a.index('-t') + 1] if '-t' in a else a[a.index('-s') + 1]
        return t.lstrip('=')
    cmd = a[0]
    if cmd == 'has-session':
        sys.exit(0 if os.path.exists(os.path.join(d, 'sessions', target())) else 1)
    if cmd == 'new-session':
        os.makedirs(os.path.join(d, 'sessions'), exist_ok=True)
        open(os.path.join(d, 'sessions', target()), 'w').close(); sys.exit(0)
    if cmd == 'send-keys':
        sys.exit(0)
    if cmd == 'capture-pane':
        p = os.path.join(d, 'screens.json'); s = json.load(open(p))
        print(s[0])
        if len(s) > 1:
            json.dump(s[1:], open(p, 'w'))
        sys.exit(0)
    if cmd == 'display-message':
        print(open(os.path.join(d, 'pane_pid')).read().strip()); sys.exit(0)
    sys.exit(1)
''')


class FakeTmuxCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.d = Path(self.tmp.name)
        tmux = self.d / 'tmux'
        tmux.write_text(FAKE_TMUX)
        tmux.chmod(0o755)
        self.env = dict(os.environ, TMUX_BIN=str(tmux), FAKE_TMUX_DIR=str(self.d),
                        CX_SLEEP='true', AGENT_INBOX_ROOT=str(self.d / 'inbox'),
                        CX_PROC_ROOT=str(self.d / 'proc'))
        self.handoff = self.d / 'BRIEF.md'
        self.handoff.write_text('# 任務\n')
        self.screens([''])

    def tearDown(self):
        self.tmp.cleanup()

    def screens(self, items):
        (self.d / 'screens.json').write_text(json.dumps(items))

    def session(self, name):
        (self.d / 'sessions').mkdir(exist_ok=True)
        (self.d / 'sessions' / name).touch()

    def calls(self):
        p = self.d / 'log.jsonl'
        return [json.loads(l) for l in p.read_text().splitlines()] if p.exists() else []

    def run_tool(self, tool, *args, timeout=30):
        return subprocess.run(['bash', str(tool), *args], env=self.env, text=True,
                              capture_output=True, timeout=timeout)


class TestCxLaunch(FakeTmuxCase):
    def test_help(self):
        r = self.run_tool(LAUNCH, '--help')
        self.assertEqual(r.returncode, 0)
        self.assertIn('Working', r.stdout)

    def test_trust_then_retry_enter_until_working(self):
        self.screens(['', 'Do you trust the contents of this directory?', '› ',
                      '› 請讀 BRIEF', '• Working (2s • esc to interrupt)'])
        r = self.run_tool(LAUNCH, 'cx-t', str(self.handoff), '--dir', str(self.d))
        self.assertEqual(r.returncode, 0, r.stderr)
        calls = self.calls()
        sends = [c for c in calls if c[0] == 'send-keys']
        # codex 啟動：文字與 Enter 分兩次呼叫
        self.assertEqual(sends[0], ['send-keys', '-t', 'cx-t', '-l', f'codex {DEFAULT_FLAGS}'])
        self.assertEqual(sends[1], ['send-keys', '-t', 'cx-t', 'Enter'])
        # trust 提示補一次 Enter
        self.assertEqual(sends[2], ['send-keys', '-t', 'cx-t', 'Enter'])
        # 提示詞用 -l 單獨送，含交接書絕對路徑；之後 Enter 送了兩次（第一次沒 Working）
        self.assertEqual(sends[3][:4], ['send-keys', '-t', 'cx-t', '-l'])
        self.assertIn(str(self.handoff), sends[3][4])
        self.assertEqual(sends[4:], [['send-keys', '-t', 'cx-t', 'Enter']] * 2)
        self.assertIn('Enter x2', r.stderr)

    def test_model_flag(self):
        self.screens(['›', 'Working'])
        r = self.run_tool(LAUNCH, 'cx-m', str(self.handoff), '--model', 'gpt-6-sol')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn(['send-keys', '-t', 'cx-m', '-l', f'codex -m gpt-6-sol {DEFAULT_FLAGS}'], self.calls())

    def test_sandbox_none_and_explicit_add_dir(self):
        self.screens(['›', 'Working'])
        r = self.run_tool(LAUNCH, 'cx-n', str(self.handoff), '--sandbox', 'none', '--add-dir', '/tmp/x y')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn(['send-keys', '-t', 'cx-n', '-l', 'codex --add-dir /tmp/x\\ y'], self.calls())

    def test_existing_session_refused(self):
        self.session('cx-dup')
        r = self.run_tool(LAUNCH, 'cx-dup', str(self.handoff))
        self.assertEqual(r.returncode, 4)
        self.assertFalse(any(c[0] == 'new-session' for c in self.calls()))

    def test_never_working_exits_3(self):
        self.screens(['›', '› 請讀 stuck'])
        r = self.run_tool(LAUNCH, 'cx-s', str(self.handoff), '--tries', '3')
        self.assertEqual(r.returncode, 3)
        enters_after_prompt = [c for c in self.calls() if c[0] == 'send-keys'][3:]
        self.assertEqual(len(enters_after_prompt), 3)

    def test_boot_timeout_exits_5(self):
        self.screens(['loading'])
        r = self.run_tool(LAUNCH, 'cx-b', str(self.handoff), '--boot-timeout', '3')
        self.assertEqual(r.returncode, 5)

    def test_dry_run_touches_nothing(self):
        r = self.run_tool(LAUNCH, 'cx-d', str(self.handoff), '--dry-run')
        self.assertEqual(r.returncode, 0)
        self.assertIn('[dry-run]', r.stdout)
        self.assertEqual(self.calls(), [])

    def test_bad_args(self):
        self.assertEqual(self.run_tool(LAUNCH, 'cx-x').returncode, 2)
        self.assertEqual(self.run_tool(LAUNCH, 'bad name', str(self.handoff)).returncode, 2)
        self.assertEqual(self.run_tool(LAUNCH, 'cx-x', '/nonexistent').returncode, 2)


class TestCxWatch(FakeTmuxCase):
    def proc(self, pid, ppid):
        p = self.d / 'proc' / str(pid)
        p.mkdir(parents=True, exist_ok=True)
        (p / 'status').write_text(f'Name:\tx\nPid:\t{pid}\nPPid:\t{ppid}\n')

    def alive(self, name='cx-a', screen='• Working (5s)'):
        self.session(name)
        (self.d / 'pane_pid').write_text('100\n')
        self.proc(100, 1)
        self.proc(200, 100)
        self.screens([screen])

    def message(self, sender, status, title, box='new'):
        d = self.d / 'inbox' / box
        d.mkdir(parents=True, exist_ok=True)
        p = d / f'20261003T1200-{sender}-{status}.md'
        p.write_text(f'---\nfrom: {sender}\nstatus: {status}\nat: x\n---\n# {title}\n')
        return p

    def test_help(self):
        self.assertEqual(self.run_tool(WATCH, '--help').returncode, 0)

    def test_once_alive(self):
        self.alive()
        r = self.run_tool(WATCH, 'cx-a', '--once')
        self.assertEqual((r.returncode, r.stdout.strip()), (0, 'ALIVE cx-a'))

    def test_working_text_but_no_children_is_exited(self):
        self.alive()
        (self.d / 'proc' / '200' / 'status').write_text('PPid:\t1\n')
        r = self.run_tool(WATCH, 'cx-a', '--once')
        self.assertEqual(r.returncode, 4)
        self.assertTrue(r.stdout.startswith('EXITED cx-a'))

    def test_gone(self):
        r = self.run_tool(WATCH, 'cx-none', '--timeout', '5', '--interval', '1')
        self.assertEqual((r.returncode, r.stdout.strip()), (4, 'GONE cx-none'))

    def test_approval_prompt(self):
        self.alive(screen='Would you like to run the following command?')
        r = self.run_tool(WATCH, 'cx-a', '--timeout', '5', '--interval', '1')
        self.assertEqual(r.returncode, 5)
        self.assertIn('APPROVAL cx-a', r.stdout)

    def test_terminal_message_only_for_this_line(self):
        self.alive()
        self.message('cx-a', 'DONE', 'a 完成')
        other = self.message('cx-b', 'DONE', 'b 完成')
        r = self.run_tool(WATCH, 'cx-a', '--timeout', '5', '--interval', '1')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('MSG cx-a', r.stdout)
        self.assertNotIn('cx-b', r.stdout)
        self.assertTrue(other.exists())               # 唯讀：不搬、不刪
        self.assertTrue((self.d / 'inbox' / 'new' / '20261003T1200-cx-a-DONE.md').exists())

    def test_lead_recipient_reads_own_mail_dir(self):
        self.alive()
        self.message('cx-a', 'DONE', 'a 給領導', box='new')   # 進頂層的不算領導的
        self.message('cx-a', 'FAILED', 'a 失敗', box='mail/lead-x')
        r = self.run_tool(WATCH, 'cx-a', '--recipient', 'lead-x', '--timeout', '5', '--interval', '1')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('MSG cx-a FAILED', r.stdout)
        self.assertNotIn('a 給領導', r.stdout)

    def test_progress_then_timeout(self):
        self.alive()
        self.message('cx-a', 'PROGRESS', 'a 進度')
        r = self.run_tool(WATCH, 'cx-a', '--timeout', '2', '--interval', '1', '--stall', '0')
        self.assertEqual(r.returncode, 3)
        self.assertEqual(r.stdout.count('NOTE cx-a'), 1, r.stdout)   # 同一封只提示一次

    def test_stall(self):
        self.alive()
        r = self.run_tool(WATCH, 'cx-a', '--timeout', '10', '--interval', '1', '--stall', '2')
        self.assertEqual(r.returncode, 6)
        self.assertIn('STALL cx-a', r.stdout)


if __name__ == '__main__':
    unittest.main()

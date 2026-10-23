"""brief_lint.py：每種違規代碼各驗一個陽性與一個陰性（乾淨交接書）。

移植自 moddings/skyrim agentctl/tools/test_brief_lint.py（2026-10-23），樣本改成本專案 TEMPLATE.handoff.md 的段名。
"""

from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().with_name('brief_lint.py')
REPO_ROOT = Path(__file__).resolve().parents[2]

# 一份照範本寫、應該零違規的交接書。各測試只替換其中一段來製造違規。
CLEAN = '''# 任務：驗證 brief_lint 用的樣本線

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`。

## 背景與唯一目標

把樣本交接書寫成範本該有的樣子。

## 範圍（排除法寫死）

- 只做：樣本檔。
- 不做：其他 repo、`src/` 以外的目錄。
- 件數 gate：超過 5 件就停下回報；容量 gate：產物超過 20 MB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/wf-lint.sh --strict .` | 收工驗文檔 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT。

共通禁區：不碰鍵鼠螢幕、不開 GUI、不 push。

## 工作

1. 做事。
2. 寫 REPORT。

## 交付

REPORT 寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/sample/REPORT.md`，回報用 `wf/tools/inbox_mail.sh cx-s --up DONE 'x' r.md < /dev/null`。

## 驗收（固定 2 條，做完就停）

1. 測試全綠。
2. commit 只含明確路徑。
'''


def swap(section_heading, replacement, source=CLEAN):
    """把某個 `## 標題` 起算到下一個 `## ` 為止的整段換掉（replacement 為 '' 即刪段）。"""
    lines = source.splitlines(keepends=True)
    start = next(index for index, line in enumerate(lines)
                 if line.startswith('## ') and section_heading in line)
    end = next((index for index in range(start + 1, len(lines))
                if lines[index].startswith('## ')), len(lines))
    return ''.join(lines[:start]) + replacement + ''.join(lines[end:])


class BriefLintTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='brief-lint-')
        self.addCleanup(self.temp.cleanup)
        self.dir = Path(self.temp.name)

    def write(self, text, name='BRIEF.md'):
        path = self.dir / name
        path.write_text(text, encoding='utf-8')
        return path

    def run_lint(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), *map(str, args)],
                              capture_output=True, text=True)

    def codes(self, result):
        return [line.split(' ')[1] for line in result.stdout.splitlines()
                if not line.startswith('brief_lint:')]

    # ---- 陰性：乾淨交接書對所有代碼都不報 ----

    def test_clean_brief_has_no_violations(self):
        result = self.run_lint(self.write(CLEAN))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.codes(result), [], result.stdout)
        self.assertEqual(result.stdout.strip().splitlines()[-1],
                         'brief_lint: 0 違規／1 檔')

    def test_clean_brief_passes_strict(self):
        result = self.run_lint(self.write(CLEAN), '--strict')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    # ---- ACCEPT-COUNT ----

    def test_accept_count_mismatch(self):
        brief = self.write(swap('驗收', '## 驗收（固定 2 條，做完就停）\n\n'
                                '1. a\n2. b\n3. c\n'))
        result = self.run_lint(brief)
        self.assertIn('ACCEPT-COUNT', self.codes(result))
        self.assertIn('標題寫固定 2 條，段內實際有 3 個編號條目', result.stdout)

    def test_accept_count_missing_number(self):
        brief = self.write(swap('驗收', '## 驗收\n\n1. a\n2. b\n'))
        result = self.run_lint(brief)
        self.assertIn('ACCEPT-COUNT', self.codes(result))
        self.assertIn('沒把條數寫死', result.stdout)

    def test_accept_count_missing_section(self):
        brief = self.write(swap('驗收', ''))
        result = self.run_lint(brief)
        self.assertIn('ACCEPT-COUNT', self.codes(result))
        self.assertIn(':- ACCEPT-COUNT', result.stdout)

    # ---- ACCEPT-OPENWORD ----

    def test_accept_openword(self):
        brief = self.write(swap('驗收', '## 驗收（固定 2 條，做完就停）\n\n'
                                '1. 測試全綠。\n'
                                '2. 以及其他你認為必要的驗證。\n'))
        result = self.run_lint(brief)
        self.assertIn('ACCEPT-OPENWORD', self.codes(result))

    # ---- RESOURCE-SECTION ----

    def test_resource_section_missing(self):
        brief = self.write(swap('資源與禁區', ''))
        result = self.run_lint(brief)
        self.assertIn('RESOURCE-SECTION', self.codes(result))
        self.assertIn('缺「資源與禁區」段', result.stdout)

    def test_resource_section_keeps_two_options(self):
        brief = self.write(swap('資源與禁區',
                                '## 資源與禁區\n\n'
                                '- **唯讀調查線**：只讀。\n'
                                '- **可跑 godot headless 線**：只准 `godot-mono --headless`。\n'))
        result = self.run_lint(brief)
        self.assertIn('RESOURCE-SECTION', self.codes(result))
        self.assertIn('範本三選一留了 2 個', result.stdout)

    def test_resource_section_without_kind(self):
        brief = self.write(swap('資源與禁區', '## 資源與禁區\n\n不 push。\n'))
        result = self.run_lint(brief)
        self.assertIn('沒寫線別', result.stdout)

    # ---- READ-FIRST ----

    def test_read_first_missing(self):
        brief = self.write(CLEAN.replace(
            '先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`。\n', ''))
        result = self.run_lint(brief)
        self.assertIn(':- READ-FIRST', result.stdout)

    def test_read_first_without_agents(self):
        brief = self.write(CLEAN.replace('`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、', ''))
        result = self.run_lint(brief)
        self.assertIn('READ-FIRST', self.codes(result))

    # ---- TOOLS-SECTION ----

    def test_tools_path_missing(self):
        brief = self.write(swap('必用工具',
                                '## 必用工具\n\n'
                                '| 工具 | 用在哪一步 |\n|---|---|\n'
                                '| `wf/tools/no_such_tool.py --flag` | 幻覺工具 |\n'))
        result = self.run_lint(brief)
        self.assertIn('TOOLS-SECTION', self.codes(result))
        self.assertIn('點名的工具路徑不存在：wf/tools/no_such_tool.py',
                      result.stdout)

    def test_tools_table_empty(self):
        brief = self.write(swap('必用工具', '## 必用工具\n\n見工具索引。\n'))
        result = self.run_lint(brief)
        self.assertIn('TOOLS-SECTION', self.codes(result))
        self.assertIn('沒有任何一列', result.stdout)

    def test_tools_section_missing(self):
        brief = self.write(swap('必用工具', ''))
        result = self.run_lint(brief)
        self.assertIn(':- TOOLS-SECTION', result.stdout)

    def test_tools_absolute_path_is_accepted(self):
        brief = self.write(swap('必用工具',
                                '## 必用工具\n\n'
                                '| 工具 | 用在哪一步 |\n|---|---|\n'
                                f'| `{SCRIPT.parent}/wf-lint.sh --strict .` '
                                '| 收工 |\n'))
        result = self.run_lint(brief)
        self.assertEqual(self.codes(result), [], result.stdout)

    def test_tools_root_override(self):
        (self.dir / 'tools').mkdir()
        (self.dir / 'tools' / 'local.py').write_text('', encoding='utf-8')
        brief = self.write(swap('必用工具',
                                '## 必用工具\n\n'
                                '| 工具 | 用在哪一步 |\n|---|---|\n'
                                '| `tools/local.py` | 本地工具 |\n'))
        result = self.run_lint(brief, '--root', self.dir)
        self.assertEqual(self.codes(result), [], result.stdout)

    def test_tools_wrong_root_reports_missing(self):
        # --root 指到沒有 wf/tools 的地方，相對路徑就該報不存在（沒有 fallback）。
        result = self.run_lint(self.write(CLEAN), '--root', self.dir)
        self.assertIn('TOOLS-SECTION', self.codes(result))

    # ---- DELIVER-ABSPATH ----

    def test_deliver_without_absolute_path(self):
        brief = self.write(swap('交付', '## 交付\n\nREPORT 寫到 handoffs/sample/REPORT.md。\n'))
        result = self.run_lint(brief)
        self.assertIn('DELIVER-ABSPATH', self.codes(result))

    def test_deliver_section_missing(self):
        brief = self.write(swap('交付', ''))
        result = self.run_lint(brief)
        self.assertIn(':- DELIVER-ABSPATH', result.stdout)

    # ---- SCOPE-GATE ----

    def test_scope_missing_gates_and_donots(self):
        brief = self.write(swap('範圍', '## 範圍（排除法寫死）\n\n- 只做：樣本檔。\n'))
        result = self.run_lint(brief)
        self.assertIn('SCOPE-GATE', self.codes(result))
        for expected in ('件數 gate', '容量 gate', '「不做」清單'):
            self.assertIn(expected, result.stdout)

    def test_scope_missing_capacity_gate_only(self):
        brief = self.write(swap('範圍',
                                '## 範圍（排除法寫死）\n\n'
                                '- 只做：樣本檔。\n- 不做：其他 repo。\n'
                                '- 件數 gate：超過 5 件就停。\n'))
        result = self.run_lint(brief)
        self.assertIn('SCOPE-GATE', self.codes(result))
        self.assertIn('缺容量 gate', result.stdout)
        self.assertNotIn('件數 gate、', result.stdout)

    # ---- PLACEHOLDER ----

    def test_placeholder_leftover(self):
        brief = self.write(CLEAN.replace('樣本檔。', '<件 1>、<件 2>。'))
        result = self.run_lint(brief)
        self.assertIn('PLACEHOLDER', self.codes(result))
        self.assertIn('<件 1>', result.stdout)

    def test_redirect_and_fenced_are_not_placeholders(self):
        brief = self.write(CLEAN.replace('做事。',
                                         '做事：`codex exec x < /dev/null > log`。\n\n'
                                         '```sh\nfoo <線名>\n```\n'))
        result = self.run_lint(brief)
        self.assertNotIn('PLACEHOLDER', self.codes(result), result.stdout)

    def test_html_and_autolink_are_not_placeholders(self):
        brief = self.write(CLEAN.replace('做事。',
                                         '做事<br>，見 <https://example.com/a> '
                                         '與 <!-- wf-nav -->。'))
        result = self.run_lint(brief)
        self.assertNotIn('PLACEHOLDER', self.codes(result))

    # ---- CLI 行為 ----

    def test_strict_exit_code(self):
        brief = self.write(swap('交付', ''))
        self.assertEqual(self.run_lint(brief).returncode, 0)
        self.assertEqual(self.run_lint(brief, '--strict').returncode, 1)

    def test_multiple_files_and_summary(self):
        good = self.write(CLEAN, 'good.md')
        bad = self.write(swap('驗收', ''), 'bad.md')
        result = self.run_lint(good, bad)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('bad.md:- ACCEPT-COUNT', result.stdout)
        self.assertNotIn('good.md:', result.stdout)
        self.assertTrue(result.stdout.strip().endswith('違規／2 檔'))

    def test_missing_input_file_exits_2(self):
        result = self.run_lint(self.dir / 'nope.md')
        self.assertEqual(result.returncode, 2)
        self.assertIn('brief_lint:', result.stderr)

    def test_help(self):
        result = self.run_lint('--help')
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == '__main__':
    unittest.main()

#!/usr/bin/env python3
"""交接書品質 gate：照 `wf/workflows/TEMPLATE.handoff.md` 的硬規則逐條檢查。

移植自 moddings/skyrim `agentctl/tools/brief_lint.py`（2026-10-23），段名改成本專案範本。
那邊的 retro（2026-10-03）實證：被交接書點名的工具用了 134 次，沒被點名的 0 次——
一條線的成敗幾乎全由交接書決定，而範本遵循只靠領隊自覺。本工具把它變成機制。

用法：
    python3 wf/tools/brief_lint.py <交接書路徑>… [--strict]

每條違規印一行 `<檔>:<行或段> <代碼> <一句說明>`；代碼：
    ACCEPT-COUNT     驗收段沒寫死條數，或編號條目數與標題寫的 N 不符
    ACCEPT-OPENWORD  出現「其他你認為必要」這類開放驗證字樣（codex 線會為了保險亂跑）
    RESOURCE-SECTION 缺「資源與禁區」段，或範本三選一（唯讀調查線／可寫程式碼線／
                     可跑 godot headless 線）留了兩個以上、或一個都沒留
    READ-FIRST       缺「先讀」行或沒點名 AGENTS.md（實質工作線要親自讀 wf 規矩）
    TOOLS-SECTION    缺「必用工具」段／表為空／表內反引號路徑不存在
    DELIVER-ABSPATH  交付段沒有絕對路徑
    SCOPE-GATE       範圍段缺件數／容量 gate，或缺「不做」清單
    PLACEHOLDER      範本佔位 `<…>` 沒換掉（圍欄碼塊內不查）

預設全部當 warning 並 exit 0；收工自查用 `--strict`（有任一違規 exit 1）。
範本檔本身滿是佔位，本來就不是拿來 lint 的合格樣本。
"""

import argparse
import re
import sys
from pathlib import Path

# wf/tools/brief_lint.py → 專案根；「必用工具」的相對路徑一律相對專案根。
REPO_ROOT = Path(__file__).resolve().parents[2]

HEADING = re.compile(r'^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$')
FENCE = re.compile(r'^\s{0,3}(`{3,}|~{3,})')
NUMBERED = re.compile(r'^\d+[.、)]\s')
SEPARATOR_ROW = re.compile(r'^[|\s:-]+$')
BACKTICK = re.compile(r'`([^`]+)`')
# 絕對路徑：以 / 開頭且至少還有一層，避免把「和/或」這種當成路徑。
ABSPATH = re.compile(r'(?:^|[\s`(\[（「【>])(/[^\s`\]）)」】]*/[^\s`\]）)」】]*)')
PLACEHOLDER = re.compile(r'<([^<>\n]{1,60})>')

# 範本「驗收」段明令不要留的開放字樣（dispatch/README「六條最容易錯的」第 3 條）。
OPEN_VERIFY_WORDS = (
    '你認為必要', '你覺得必要', '以及其他必要', '其他必要的驗證', '其他必要驗證',
    '其他你認為', '其它你認為', '自行追加驗證', '視情況追加驗證', '視需要追加驗證',
)
# 範本「資源與禁區」段的三選一。
RESOURCE_OPTIONS = ('唯讀調查線', '可寫程式碼線', '可跑 godot headless 線')
# 不是佔位的角括號用法。
HTML_TAGS = frozenset(
    'br p b i u em strong code kbd sub sup hr div span ul ol li table tr td th '
    'img a details summary pre blockquote'.split()
)
INTERPRETERS = frozenset({'python3', 'python', 'bash', 'sh', 'zsh', 'sudo', 'env'})


class Section:
    """一個 markdown 段：標題行 + 到下一個同級或更高級標題為止的內文。"""

    def __init__(self, level, title, line):
        self.level = level
        self.title = title
        self.line = line
        self.body = []          # [(行號, 文字)]

    def text(self):
        return '\n'.join([self.title] + [text for _, text in self.body])


def read_lines(path):
    return path.read_text(encoding='utf-8', errors='replace').splitlines()


def fenced_flags(lines):
    """標出每一行是否在 ``` 圍欄內（圍欄線本身算在內）。"""
    flags = []
    inside = False
    for line in lines:
        if FENCE.match(line):
            inside = not inside
            flags.append(True)
            continue
        flags.append(inside)
    return flags


def parse_sections(lines, fenced):
    sections = []
    stack = []
    for index, line in enumerate(lines, start=1):
        if fenced[index - 1]:
            for section in stack:
                section.body.append((index, line))
            continue
        heading = HEADING.match(line)
        if heading:
            level = len(heading[1])
            stack = [s for s in stack if s.level < level]
            section = Section(level, heading[2], index)
            for parent in stack:
                parent.body.append((index, line))
            stack.append(section)
            sections.append(section)
            continue
        for section in stack:
            section.body.append((index, line))
    return sections


def find_section(sections, keyword):
    for section in sections:
        if keyword in section.title:
            return section
    return None


def table_rows(section):
    """回傳 (行號, [儲存格]) 的資料列；表頭與分隔列不算。"""
    rows = []
    header_seen = False
    pending = None
    for line, text in section.body:
        stripped = text.strip()
        if not stripped.startswith('|'):
            pending = None
            header_seen = False
            continue
        if SEPARATOR_ROW.match(stripped):
            header_seen = True
            pending = None
            continue
        cells = [cell.strip() for cell in
                 re.split(r'(?<!\\)\|', stripped.strip('|'))]
        if header_seen:
            rows.append((line, cells))
        else:
            pending = (line, cells)
    if pending is not None and not rows:
        # 沒有分隔列的表：唯一那列也當資料列，免得整段被當空表放過。
        rows.append(pending)
    return rows


def first_path_token(span):
    """反引號內容 → 第一個空白前的 token（跳過直譯器與旗標），不是路徑就回 None。"""
    tokens = span.split()
    while tokens and tokens[0] in INTERPRETERS:
        tokens = tokens[1:]
    if not tokens or tokens[0].startswith('-'):
        return None
    token = tokens[0].rstrip('，。；、）)')
    if '/' in token or token.endswith(('.py', '.sh')):
        return token
    return None


def check_acceptance(sections):
    found = []
    section = find_section(sections, '驗收')
    if section is None:
        found.append(('-', 'ACCEPT-COUNT',
                      '缺驗收段；範本要求「驗收（固定 N 條，做完就停）」。'))
        return found
    match = re.search(r'(\d+)\s*條', section.title)
    if not match:
        found.append((section.line, 'ACCEPT-COUNT',
                      f'驗收段標題沒把條數寫死：{section.title!r}（範本：「驗收（固定 N 條）」）。'))
        return found
    expected = int(match[1])
    items = [line for line, text in section.body if NUMBERED.match(text)]
    if len(items) != expected:
        found.append((section.line, 'ACCEPT-COUNT',
                      f'標題寫固定 {expected} 條，段內實際有 {len(items)} 個編號條目。'))
    return found


def check_open_words(lines):
    found = []
    for index, line in enumerate(lines, start=1):
        for word in OPEN_VERIFY_WORDS:
            if word in line:
                found.append((index, 'ACCEPT-OPENWORD',
                              f'出現開放驗證字樣「{word}」；驗收要寫死條數，線會為了保險亂跑。'))
                break
    return found


def check_resource(sections):
    found = []
    section = find_section(sections, '資源與禁區')
    if section is None:
        found.append(('-', 'RESOURCE-SECTION',
                      '缺「資源與禁區」段；沒寫的禁區＝等於允許（GUI、鍵鼠、push、刪檔）。'))
        return found
    body = '\n'.join(text for _, text in section.body)
    present = [option for option in RESOURCE_OPTIONS if option in body]
    if len(present) >= 2:
        found.append((section.line, 'RESOURCE-SECTION',
                      f'範本三選一留了 {len(present)} 個（{"／".join(present)}），要刪到只剩一個。'))
    elif not present:
        found.append((section.line, 'RESOURCE-SECTION',
                      f'沒寫線別；三選一：{"／".join(RESOURCE_OPTIONS)}。'))
    return found


def check_read_first(lines, fenced):
    for index, line in enumerate(lines):
        if not fenced[index] and line.lstrip().startswith(('先讀', '**先讀')):
            if 'AGENTS.md' in line:
                return []
            return [(index + 1, 'READ-FIRST', '「先讀」行沒點名 AGENTS.md。')]
    return [('-', 'READ-FIRST',
             '缺「先讀」行；實質工作線要先親自讀 AGENTS.md 與 wf 規矩（雜活線可寫「先讀：AGENTS.md（雜活，只讀這份）」）。')]


def check_tools(sections, root):
    found = []
    section = find_section(sections, '必用工具')
    if section is None:
        found.append(('-', 'TOOLS-SECTION',
                      '缺「必用工具」段；沒點名的工具使用次數是 0（retro 10-03）。'))
        return found
    rows = table_rows(section)
    if not rows:
        found.append((section.line, 'TOOLS-SECTION',
                      '「必用工具」表沒有任何一列；從 wf/workflows/dispatch/tool-index.md 抄對應的列進來。'))
        return found
    for line, cells in rows:
        for span in BACKTICK.findall(' '.join(cells)):
            token = first_path_token(span)
            if token is None:
                continue
            if not tool_path_exists(token, root):
                found.append((line, 'TOOLS-SECTION',
                              f'點名的工具路徑不存在：{token}'))
    return found


def tool_path_exists(token, root):
    """相對路徑一律相對專案根（預設由本檔位置推導，可用 --root 覆寫）。"""
    if token.startswith('/'):
        return Path(token).exists()
    return (root / token).exists()


def check_deliver(sections):
    found = []
    section = find_section(sections, '交付')
    if section is None:
        found.append(('-', 'DELIVER-ABSPATH',
                      '缺交付段；REPORT 路徑要寫絕對路徑，否則線會寫到別的地方。'))
        return found
    body = '\n'.join(text for _, text in section.body)
    if not ABSPATH.search(body):
        found.append((section.line, 'DELIVER-ABSPATH',
                      '交付段沒有任何絕對路徑（要寫 /home/... 這種完整路徑）。'))
    return found


def check_scope(sections):
    found = []
    section = find_section(sections, '範圍')
    if section is None:
        found.append(('-', 'SCOPE-GATE',
                      '缺範圍段；範圍詞會被線遞移展開成數十倍（dispatch/lessons）。'))
        return found
    text = section.text()
    missing = []
    if not re.search(r'件數\s*gate', text, re.IGNORECASE):
        missing.append('件數 gate')
    if not re.search(r'容量\s*gate', text, re.IGNORECASE):
        missing.append('容量 gate')
    if '不做' not in text:
        missing.append('「不做」清單')
    if missing:
        found.append((section.line, 'SCOPE-GATE',
                      f'範圍段缺{"、".join(missing)}；件數與容量 gate 要並列寫死。'))
    return found


def check_placeholders(lines, fenced):
    found = []
    for index, line in enumerate(lines, start=1):
        if fenced[index - 1]:
            continue
        leftovers = []
        for inner in PLACEHOLDER.findall(line):
            lowered = inner.lower()
            # `< /dev/null > log` 這類重導向：角括號內側是空白，不是佔位。
            if (inner[:1].isspace() or inner.startswith(('!', '/')) or '://' in inner or '@' in inner
                    or lowered in HTML_TAGS or lowered.rstrip('/') in HTML_TAGS):
                continue
            leftovers.append(f'<{inner}>')
        if leftovers:
            sample = '、'.join(leftovers[:3])
            found.append((index, 'PLACEHOLDER',
                          f'範本佔位沒換掉：{sample}'))
    return found


def lint(path, root):
    lines = read_lines(path)
    fenced = fenced_flags(lines)
    sections = parse_sections(lines, fenced)
    found = []
    found += check_acceptance(sections)
    found += check_open_words(lines)
    found += check_resource(sections)
    found += check_read_first(lines, fenced)
    found += check_tools(sections, root)
    found += check_deliver(sections)
    found += check_scope(sections)
    found += check_placeholders(lines, fenced)
    found.sort(key=lambda item: (0 if item[0] == '-' else 1,
                                 0 if item[0] == '-' else item[0], item[1]))
    return found


def main(argv=None):
    parser = argparse.ArgumentParser(
        description='交接書品質 gate：檢查交接書是否照 TEMPLATE.handoff.md 寫死該寫死的東西。')
    parser.add_argument('briefs', nargs='+', type=Path, metavar='HANDOFF.md',
                        help='要檢查的交接書（可多份）')
    parser.add_argument('--strict', action='store_true',
                        help='有任一違規就 exit 1（預設只印 warning、exit 0）')
    parser.add_argument('--root', type=Path, default=REPO_ROOT,
                        help='解析「必用工具」相對路徑的根（預設專案根）')
    args = parser.parse_args(argv)
    root = args.root.resolve()

    total = 0
    for brief in args.briefs:
        try:
            found = lint(brief, root)
        except OSError as error:
            print(f'brief_lint: {error}', file=sys.stderr)
            return 2
        for location, code, message in found:
            print(f'{brief}:{location} {code} {message}')
        total += len(found)
    print(f'brief_lint: {total} 違規／{len(args.briefs)} 檔')
    return int(bool(total)) if args.strict else 0


if __name__ == '__main__':
    sys.exit(main())

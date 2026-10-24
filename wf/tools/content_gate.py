#!/usr/bin/env python3
"""content_gate — 內容批次的路徑與欄位閘門（codex 內容填充的護欄）。

用法：
    python3 -I wf/tools/content_gate.py <worktree> <manifest.json> [--base COMMIT] [--json]
    python3 -I wf/tools/content_gate.py <worktree> <manifest.json> --carry <dest repo>

<worktree> 是 codex 實際寫入的隔離 git worktree；<manifest.json> 是 batch 帳本
（`content/batches/<id>.json`，契約 `content-batch/1`）。base commit 預設取 manifest 的
`base`，`--base` 可覆蓋。比對「base commit → worktree 現況」的全部差異（已追蹤檔的
修改／刪除、未追蹤新檔、git 忽略的新檔另列），逐檔判定：

新增模式（mode "add"）
  - 只允許「新增」檔；位置必須在 manifest `allow.kinds` 宣告的目錄
    （`base/frames`、`lore/characters` 之類，相對 `content/`），且是一層下的 `.json`。
  - 檔名＝id 的 name 段；id 前綴與同目錄既有檔一致；`allow.namePrefix` 有給就要符合。
  - 修改既有檔只限 `allow.modify` 明列的路徑，且只能用 `superset` 規則
    （舊值全保留：物件鍵不刪不改、陣列中舊元素依序仍在，只能插入新元素）。
  - 刪除、改權限、symlink、非 JSON 一律拒絕。
潤飾模式（mode "polish"）
  - 只允許「修改」`allow.polishFiles`（glob，相對 repo 根）命中的既有 JSON。
  - 新舊 JSON 結構逐節點比對：鍵集合、陣列長度、型別必須相同；值不同的葉子，
    其路徑上最近的物件鍵必須在文字欄白名單內（`allow.textFields` 可縮小），且新舊皆為字串、
    都不像 id 引用。id、數值、tags、引用、結構任何變動都拒絕。
兩種模式共通：`maxFiles` 件數上限；`--carry` 只把通過的檔複製回目的 repo——
新增模式目的地已存在同名檔就拒絕；潤飾模式目的地檔必須仍等於 base 版本（防蓋掉別線的改動）。

輸出每條違規一行 `VIOLATION <路徑> <代碼> <說明>`（`--json` 改印 JSON）；有違規 exit 1。
"""

import argparse
import fnmatch
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

DEFAULT_TEXT_FIELDS = (
    'name', 'title', 'summary', 'body', 'desc', 'description', 'text', 'label', 'brief',
    'lines', 'phrase', 'phrases', 'badge', 'note', 'aka', 'epithet', 'flavor',
)
# 像 id 引用的字串：`kind/name`、`pack:kind/name`。
ID_LIKE = re.compile(r'^(?:[a-z0-9-]+:)?[a-z][a-z0-9-]*/[a-z0-9][a-z0-9-]*$')
# git 忽略但可以存在的產物（不帶回、只列出）。
IGNORED_OK = ('node_modules', 'test-results', 'playwright-report', 'dist', '__pycache__')


def git(repo, *args, check=True):
    out = subprocess.run(['git', '-C', str(repo), *args], capture_output=True)
    if check and out.returncode != 0:
        raise SystemExit(f'git {" ".join(args)} 失敗：{out.stderr.decode(errors="replace").strip()}')
    return out.stdout


def split_z(raw):
    return [p for p in raw.decode('utf-8', errors='surrogateescape').split('\0') if p]


def collect_changes(wt, base):
    """回傳 [(status, path)]：A 新增、M 修改、D 刪除、T 型別變更、I 被忽略的新檔。"""
    changes = {}
    parts = split_z(git(wt, 'diff', '--name-status', '-z', '--no-renames', base, '--'))
    i = 0
    while i < len(parts):
        status, path = parts[i][0], parts[i + 1]
        changes[path] = status
        i += 2
    for path in split_z(git(wt, 'ls-files', '--others', '--exclude-standard', '-z')):
        # 領導建 worktree 時放的 node_modules symlink（指回主 repo）不算 codex 的產物。
        changes[path] = 'I' if path == 'node_modules' and (wt / path).is_symlink() else 'A'
    for path in split_z(git(wt, 'ls-files', '--others', '--ignored', '--exclude-standard',
                            '--directory', '-z')):
        changes.setdefault(path.rstrip('/'), 'I')
    return sorted((s, p) for p, s in changes.items())


def base_blob(wt, base, path):
    out = subprocess.run(['git', '-C', str(wt), 'show', f'{base}:{path}'], capture_output=True)
    return out.stdout if out.returncode == 0 else None


def load_json_bytes(raw):
    try:
        return json.loads(raw.decode('utf-8')), None
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        return None, str(e)


def superset(old, new, path='$'):
    """old 的每個值都還在 new 裡（物件鍵不刪不改、陣列舊元素依序仍在）。回傳第一個違規路徑或 None。"""
    if isinstance(old, dict):
        if not isinstance(new, dict):
            return path
        for k, v in old.items():
            if k not in new:
                return f'{path}.{k}（被刪）'
            bad = superset(v, new[k], f'{path}.{k}')
            if bad:
                return bad
        return None
    if isinstance(old, list):
        if not isinstance(new, list):
            return path
        j = 0
        for k, item in enumerate(old):
            while j < len(new) and new[j] != item:
                j += 1
            if j == len(new):
                return f'{path}[{k}]（舊元素不見或被改）'
            j += 1
        return None
    return None if old == new and type(old) is type(new) else path


def text_diff(old, new, fields, path='$', key=None, out=None):
    """潤飾比對：收集 (路徑, 代碼, 說明)。key＝路徑上最近的物件鍵。"""
    out = [] if out is None else out
    if type(old) is not type(new):
        out.append((path, 'TYPE', f'型別 {type(old).__name__} → {type(new).__name__}'))
        return out
    if isinstance(old, dict):
        if set(old) != set(new):
            gone, born = sorted(set(old) - set(new)), sorted(set(new) - set(old))
            out.append((path, 'KEYS', f'鍵集合變動：刪 {gone} 增 {born}'))
        for k in old:
            if k in new:
                text_diff(old[k], new[k], fields, f'{path}.{k}', k, out)
        return out
    if isinstance(old, list):
        if len(old) != len(new):
            out.append((path, 'LENGTH', f'陣列長度 {len(old)} → {len(new)}'))
            return out
        for i, (a, b) in enumerate(zip(old, new)):
            text_diff(a, b, fields, f'{path}[{i}]', key, out)
        return out
    if old == new:
        return out
    if not isinstance(old, str):
        out.append((path, 'VALUE', f'非文字值變動：{old!r} → {new!r}'))
    elif key not in fields:
        out.append((path, 'FIELD', f'欄位 `{key}` 不在文字欄白名單'))
    elif ID_LIKE.match(old) or ID_LIKE.match(new):
        out.append((path, 'IDREF', f'像 id 引用的字串被改：{old!r} → {new!r}'))
    return out


def expected_prefix(wt, base, kind_dir):
    """同目錄既有檔的 id 前綴（`frame/`、`character/`）；取 base 版本中第一個有 id 的檔。"""
    for name in split_z(git(wt, 'ls-tree', '-z', '--name-only', f'{base}:{kind_dir}', check=False)):
        if not name.endswith('.json'):
            continue
        raw = base_blob(wt, base, f'{kind_dir}/{name}')
        data, _ = load_json_bytes(raw or b'')
        if isinstance(data, dict) and isinstance(data.get('id'), str) and '/' in data['id']:
            return data['id'].rsplit('/', 1)[0] + '/'
    return None


def check(wt, manifest, base):
    allow = manifest.get('allow', {})
    mode = manifest.get('mode')
    violations, approved, ignored = [], [], []
    if mode not in ('add', 'polish'):
        return [('<manifest>', 'MODE', f'mode 必須是 add 或 polish，拿到 {mode!r}')], [], []
    kinds = [k.strip('/') for k in allow.get('kinds', [])]
    modify = {m['path']: m.get('rule', 'superset') for m in allow.get('modify', [])}
    polish_globs = allow.get('polishFiles', [])
    fields = set(allow.get('textFields') or DEFAULT_TEXT_FIELDS) & set(DEFAULT_TEXT_FIELDS)
    name_prefix = allow.get('namePrefix', {})
    prefix_cache = {}

    for status, path in collect_changes(wt, base):
        full = wt / path
        if status == 'I':
            top = path.split('/')[0]
            if top in IGNORED_OK or path.split('/')[-1] in IGNORED_OK:
                ignored.append(path)
            else:
                ignored.append(path)
                violations.append((path, 'IGNORED', '在 git 忽略路徑新增了檔（不會帶回，但屬越界寫入）'))
            continue
        if status in ('D',):
            violations.append((path, 'DELETE', '刪除既有檔'))
            continue
        if status == 'T' or (full.is_symlink()):
            violations.append((path, 'SYMLINK', '新增或改成 symlink／型別變更'))
            continue
        if status == 'M':
            raw_old = base_blob(wt, base, path)
            tree = git(wt, 'ls-tree', base, '--', path).split()
            old_exec = bool(tree) and tree[0] == b'100755'
            if old_exec != bool(os.stat(full).st_mode & 0o100):
                violations.append((path, 'MODE', '檔案權限變更'))
                continue
            new, err = load_json_bytes(full.read_bytes())
            old, _ = load_json_bytes(raw_old or b'')
            if mode == 'add':
                if path not in modify:
                    violations.append((path, 'MODIFY', '新增模式不得修改既有檔（不在 allow.modify 例外清單）'))
                    continue
                if err:
                    violations.append((path, 'JSON', f'改後不是合法 JSON：{err}'))
                    continue
                bad = superset(old, new)
                if bad:
                    violations.append((path, 'SUPERSET', f'例外檔只能追加，舊值被動：{bad}'))
                    continue
                approved.append(path)
            else:
                if not any(fnmatch.fnmatch(path, g) for g in polish_globs):
                    violations.append((path, 'POLISH-SCOPE', '不在 allow.polishFiles 範圍'))
                    continue
                if err or old is None:
                    violations.append((path, 'JSON', f'不是合法 JSON：{err}'))
                    continue
                diffs = text_diff(old, new, fields)
                if diffs:
                    for p, code, msg in diffs:
                        violations.append((path, f'POLISH-{code}', f'{p}：{msg}'))
                    continue
                if old != new:
                    approved.append(path)
            continue
        # status A：新增檔
        if mode == 'polish':
            violations.append((path, 'ADD', '潤飾模式不得新增檔'))
            continue
        parts = path.split('/')
        kind_dir = '/'.join(parts[:-1])
        rel_kind = '/'.join(parts[1:-1]) if parts[0] == 'content' else None
        if rel_kind not in kinds:
            violations.append((path, 'PATH', f'不在允許目錄（allow.kinds={kinds}）'))
            continue
        if not path.endswith('.json'):
            violations.append((path, 'EXT', '只允許 .json'))
            continue
        data, err = load_json_bytes(full.read_bytes())
        if err:
            violations.append((path, 'JSON', f'不是合法 JSON：{err}'))
            continue
        stem = parts[-1][:-5]
        pre = None
        for pat, want in name_prefix.items():
            if fnmatch.fnmatch(rel_kind, pat):
                pre = want
        if pre and not stem.startswith(pre):
            violations.append((path, 'NAME-PREFIX', f'檔名必須以 {pre} 開頭'))
            continue
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', stem):
            violations.append((path, 'NAME', '檔名須為 kebab-case 小寫'))
            continue
        did = data.get('id') if isinstance(data, dict) else None
        if not isinstance(did, str) or did.rsplit('/', 1)[-1] != stem:
            violations.append((path, 'ID', f'id {did!r} 的 name 段須等於檔名 {stem}'))
            continue
        if kind_dir not in prefix_cache:
            prefix_cache[kind_dir] = expected_prefix(wt, base, kind_dir)
        want = prefix_cache[kind_dir]
        if want and not did.startswith(want):
            violations.append((path, 'ID-KIND', f'id 前綴應為 {want}'))
            continue
        approved.append(path)

    limit = manifest.get('maxFiles')
    if isinstance(limit, int) and len(approved) > limit:
        violations.append(('<batch>', 'COUNT', f'通過 {len(approved)} 檔 > maxFiles {limit}'))
    return violations, approved, ignored


def carry(wt, base, dest, mode, approved):
    """把通過的檔複製到 dest repo；回傳 (已複製, 拒絕)。"""
    done, refused = [], []
    for path in approved:
        src, dst = wt / path, dest / path
        if mode == 'add' and dst.exists() and base_blob(wt, base, path) is None:
            refused.append((path, '目的地已有同名檔'))
            continue
        if dst.exists() and base_blob(wt, base, path) is not None:
            if dst.read_bytes() != base_blob(wt, base, path):
                refused.append((path, '目的地檔已被別人改過（≠ base 版本），不覆蓋'))
                continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        done.append(path)
    return done, refused


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('worktree')
    ap.add_argument('manifest')
    ap.add_argument('--base')
    ap.add_argument('--json', action='store_true')
    ap.add_argument('--carry', metavar='DEST_REPO')
    a = ap.parse_args(argv)
    wt = Path(a.worktree).resolve()
    manifest = json.loads(Path(a.manifest).read_text(encoding='utf-8'))
    base = a.base or manifest.get('base')
    if not base:
        raise SystemExit('缺 base commit（manifest.base 或 --base）')
    violations, approved, ignored = check(wt, manifest, base)
    result = {'batch': manifest.get('id'), 'mode': manifest.get('mode'), 'base': base,
              'approved': approved, 'ignored': ignored,
              'violations': [{'path': p, 'code': c, 'message': m} for p, c, m in violations]}
    if a.carry and not violations:
        done, refused = carry(wt, base, Path(a.carry).resolve(), manifest.get('mode'), approved)
        result['carried'] = done
        result['carryRefused'] = [{'path': p, 'message': m} for p, m in refused]
    if a.json:
        print(json.dumps(result, ensure_ascii=False, indent=1))
    else:
        for p, c, m in violations:
            print(f'VIOLATION {p} {c} {m}')
        for p in ignored:
            print(f'IGNORED-ARTIFACT {p}')
        print(f'{"FAIL" if violations else "OK"} batch={result["batch"]} mode={result["mode"]} '
              f'approved={len(approved)} violations={len(violations)}')
        for p in result.get('carried', []):
            print(f'CARRIED {p}')
        for r in result.get('carryRefused', []):
            print(f'CARRY-REFUSED {r["path"]} {r["message"]}')
    if violations or result.get('carryRefused'):
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())

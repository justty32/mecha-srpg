#!/usr/bin/env python3
"""lead-content-world 內容護欄檢查（只讀）。

用法：python3 lint_world.py [檔案或目錄 ...]   （預設掃 content/base/world/ 底下本線負責的資料夾）
檢查 engine-rules.md 寫死的規則：事件閘門、效果白名單、安全 ref、第一選項無 requires、
遭遇檔名排序、契約休眠、命名表大小、禁用詞。印出 ERROR 行，末行 OK／FAIL。
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../../../.."))
WORLD = os.path.join(ROOT, "content/base/world")
FOLDERS = ["events", "encounters", "dialogues", "contracts", "names", "backgrounds", "recruit-pools", "research", "markets"]
EVENT_DAYS = {5, 12, 19, 26}
SAFE_REFS = ["ledger.balances.cash", "ledger.balances.stock:scrap", "debt.ratio", "debt.balance", "restraint.beastCount",
             "restraint.beastWear", "restraint.freeSlots", "ship.hull.cur", "ship.fuel.cur", "campaign.pressure",
             "campaign.techHours", "calendar.month", "calendar.dom", "inventory.tickets.restraint", "inventory.tickets.airstrike",
             "person.mood"]
BANNED = ["電磁", "電壓", "電流", "電池", "伏特", "焦耳", "千瓦", "電子", "電路", "晶片", "電腦", "程式碼", "演算法", "量子", "奈米",
          "核融合", "核分裂", "反應爐", "口徑", "毫米", "公厘", "mm", "彈道學", "軌道力學", "推進劑", "火箭燃料", "Δv", "公里/秒", "公里／秒",
          "雷達", "聲納", "衛星", "無線電", "飛彈", "砲彈", "子彈", "坦克", "戰鬥機", "電能", "熱量", "電弧", "散熱"]
TEXT_KEYS = {"text", "name", "title", "lines", "topic", "names", "epithets"}
errors = []

def err(f, msg): errors.append(f"ERROR {os.path.relpath(f, ROOT)}: {msg}")

def walk_strings(v, key=""):
    if isinstance(v, str):
        if key in TEXT_KEYS: yield v
    elif isinstance(v, list):
        for x in v: yield from walk_strings(x, key)
    elif isinstance(v, dict):
        for k, x in v.items(): yield from walk_strings(x, k)

def refs(v):
    if isinstance(v, dict):
        if isinstance(v.get("ref"), str): yield v["ref"]
        for x in v.values(): yield from refs(x)
    elif isinstance(v, list):
        for x in v: yield from refs(x)

def num(v): return isinstance(v, (int, float)) and not isinstance(v, bool)

def guard_ok(requires, ref, need):
    """requires 內是否有 cmp ref >= need（或 > need-1）。"""
    for c in [requires] + list((requires or {}).get("all", [])):
        cmp = (c or {}).get("cmp")
        if cmp and isinstance(cmp.get("a"), dict) and cmp["a"].get("ref") == ref and num(cmp.get("b")):
            if cmp["op"] == ">=" and cmp["b"] >= need: return True
            if cmp["op"] == ">" and cmp["b"] >= need - 1: return True
    return False

def check_effects(f, effects, requires, where):
    for e in effects:
        if not isinstance(e, dict) or len(e) != 1 and not ("flag" in e and set(e) <= {"flag", "value"}):
            err(f, f"{where}: 效果必須是單鍵物件 {e}"); continue
        k = next(iter(e))
        if k == "ledger":
            l = e["ledger"]; acc, d = l.get("account"), l.get("delta")
            if not num(d): err(f, f"{where}: ledger.delta 必須是數字"); continue
            if not str(l.get("reason", "")).strip(): err(f, f"{where}: ledger.reason 必填")
            if set(l) - {"account", "delta", "reason"}: err(f, f"{where}: ledger 只准 account/delta/reason")
            if acc == "cash":
                if abs(d) > 600: err(f, f"{where}: cash 幅度 >600")
                if d < 0 and not guard_ok(requires, "ledger.balances.cash", -d): err(f, f"{where}: 扣 cash {d} 但 requires 沒有 ledger.balances.cash >= {-d}")
            elif acc == "stock:scrap":
                if abs(d) > 8: err(f, f"{where}: scrap 幅度 >8")
                if d < 0 and not guard_ok(requires, "ledger.balances.stock:scrap", -d): err(f, f"{where}: 扣 scrap 但 requires 沒有守門")
            elif acc in ("stock:flesh", "stock:chitin"):
                if not (0 < d <= 6): err(f, f"{where}: {acc} 只准 +1..+6")
            elif acc == "debt":
                if not (0 < d <= 600): err(f, f"{where}: debt 只准 +1..+600")
            else: err(f, f"{where}: 不准的帳 {acc}")
        elif k == "rep":
            for fid, v in e["rep"].items():
                if fid not in ("faction-ops/selene-whitegloves", "issuer") or (fid == "issuer" and not where.startswith("contract")) or not num(v) or abs(v) > 5: err(f, f"{where}: rep 只准 selene-whitegloves（契約可用 issuer）±5 內：{fid}")
        elif k == "flag":
            if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", str(e["flag"])): err(f, f"{where}: flag 名只准小寫英數與 -")
            if "value" in e and not num(e["value"]): err(f, f"{where}: flag value 必須是數字")
        elif k == "mood":
            m = e["mood"]
            for pk, v in m.items():
                if pk != "all" and not (where.startswith("dialogue") and pk.startswith("person/")): err(f, f"{where}: mood 只准 all（對白可用該人物）")
                if not num(v) or abs(v) > 2: err(f, f"{where}: mood 幅度 ±2 內")
        elif k == "techHours":
            if not num(e["techHours"]) or not (0 < e["techHours"] <= 24): err(f, f"{where}: techHours 只准 +1..+24")
        else: err(f, f"{where}: 不准的效果 {k}")

def check_cond_refs(f, v, where):
    for r in refs(v):
        if not (r.startswith("flags.") or r in SAFE_REFS or (where.startswith("contract") and r.split(".")[0] in ("rift", "calendar", "faction", "node", "contract"))):
            err(f, f"{where}: 不在安全清單的 ref {r}")

def dom_days(when):
    days = set(); month = False
    for c in (when or {}).get("all", []):
        cmp = c.get("cmp")
        if cmp and cmp.get("a", {}).get("ref") == "calendar.month" and cmp.get("op") in (">=", ">") and num(cmp.get("b")) and cmp["b"] >= (1 if cmp["op"] == ">=" else 0): month = True
        alts = [c] + list(c.get("any", []))
        for a in alts:
            x = a.get("cmp")
            if x and x.get("a", {}).get("ref") == "calendar.dom" and x.get("op") == "==" and num(x.get("b")): days.add(x["b"])
    return month, days

def load(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            for dp, _, fs in os.walk(p): files += [os.path.join(dp, x) for x in fs if x.endswith(".json")]
        else: files.append(p)
    out = {}
    for f in sorted(files):
        try: out[f] = json.load(open(f, encoding="utf-8"))
        except Exception as ex: err(f, f"JSON 壞：{ex}")
    return out

def main():
    args = sys.argv[1:] or [os.path.join(WORLD, d) for d in FOLDERS]
    data = load([os.path.abspath(a) for a in args])
    all_events = load([os.path.join(WORLD, "events")])
    chained = set()
    for e in all_events.values():
        if e.get("next"): chained.add(e["next"])
        for c in e.get("choices", []):
            if c.get("next"): chained.add(c["next"])
    dormant = set()
    for fo in load([os.path.join(WORLD, "factions-ops")]).values(): dormant |= set(fo.get("contractKinds", []))
    import subprocess
    existing = set(subprocess.run(["git", "-C", ROOT, "ls-tree", "-r", "--name-only", "HEAD", "content/base/world"], capture_output=True, text=True).stdout.split())
    for f, d in data.items():
        if os.path.relpath(f, ROOT) in existing: continue
        folder = os.path.basename(os.path.dirname(f)); base = os.path.basename(f)[:-5]
        for s in walk_strings(d):
            for w in BANNED:
                if w in s: err(f, f"禁用詞「{w}」：{s[:40]}")
        if folder == "events":
            if d.get("id") in ("event/credit-call", "event/funeral", "event/ruin-entry", "event/ruin-return"): continue
            if d.get("where") not in ("ship", "node", "route"): err(f, "where 只准 ship／node／route")
            if not num(d.get("weight")) or not (1 <= d["weight"] <= 5): err(f, "weight 只准 1..5 的數字")
            if not (20 <= len(d.get("text", "")) <= 220): err(f, "text 長度 20..220 字")
            check_cond_refs(f, d.get("when"), "event.when")
            if d["id"] not in chained:
                month, days = dom_days(d.get("when"))
                if not month: err(f, "隨機事件 when.all 必須含 calendar.month >= 1")
                if not days or not days <= EVENT_DAYS or len(days) > 2: err(f, f"隨機事件 when 必須限定 calendar.dom == 5/12/19/26 其中 1–2 天（現在 {sorted(days)}）")
            elif d.get("when") not in ({},): err(f, "鏈中事件（被 next 指到）when 必須是 {}")
            ch = d.get("choices", [])
            if not (2 <= len(ch) <= 4): err(f, "choices 2..4 個")
            if ch and ch[0].get("requires"): err(f, "第一個選項不可有 requires")
            for i, c in enumerate(ch):
                if not (2 <= len(c.get("text", "")) <= 40): err(f, f"choices[{i}].text 長度 2..40")
                check_cond_refs(f, c.get("requires"), "event.requires")
                check_effects(f, c.get("effects", []), c.get("requires"), f"event.choices[{i}]")
                if c.get("next") and not c["next"].startswith("event/"): err(f, "next 要寫 event/<id>")
            if "next" in d: err(f, "事件層級不要用 next，改在選項上寫 next")
        elif folder == "dialogues":
            pname = str(d.get("person", "/")).split("/")[-1]
            if not (base == pname or base.startswith(pname + "-")): err(f, "檔名必須是 <人物名> 或 <人物名>-<話題>")
            for i, t in enumerate(d.get("topics", [])):
                check_cond_refs(f, t.get("when"), "dialogue.when")
                check_effects(f, t.get("effects", []), None, f"dialogue.topics[{i}]")
                for j, c in enumerate(t.get("choices", [])):
                    if j == 0 and c.get("requires"): err(f, f"topics[{i}] 第一個選項不可有 requires")
                    check_cond_refs(f, c.get("requires"), "dialogue.requires")
                    check_effects(f, c.get("effects", []), c.get("requires"), f"dialogue.topics[{i}].choices[{j}]")
        elif folder == "encounters":
            if d.get("id", "") <= "encounter/insect-deep": err(f, "遭遇 id 必須排在 encounter/insect-deep 之後（用 rift-／rival-／league-／selene-／tide- 等前綴）")
            if d.get("family") == "insect": err(f, "不新增 insect 遭遇（會改變現有蟲族戰場選圖）")
        elif folder == "contracts":
            if d.get("id") in dormant and d.get("id") not in ("contract/clear", "contract/seal"): err(f, "新契約不可被任何 factions-ops 的 contractKinds 引用（休眠交付）")
            for o in d.get("objectives", []) + [o for st in d.get("stages", []) for o in st.get("objectives", [])]:
                if o.get("kind") not in ("eliminate", "survive", "hold") and not o.get("optional"): err(f, f"主目標只准 eliminate／survive／hold；{o.get('kind')} 必須 optional:true")
            for key in ("onComplete", "onFail", "onCancel"):
                check_effects(f, d.get(key, []), {"all": [{"cmp": {"a": {"ref": "ledger.balances.cash"}, "op": ">=", "b": 10**9}}]}, f"contract.{key}")
        elif folder == "names":
            if base.startswith("nick-") and base in ("nick-alien", "nick-beast", "nick-insect", "nick-mycelium"): continue
            if len(set(d.get("names", []))) < 8: err(f, "names 至少 8 個不重複")
            if len(d.get("names", [])) != len(set(d.get("names", []))): err(f, "names 有重複")
    for e in errors: print(e)
    print(f"FAIL {len(errors)} errors" if errors else f"OK {len(data)} files")
    sys.exit(1 if errors else 0)

if __name__ == "__main__": main()

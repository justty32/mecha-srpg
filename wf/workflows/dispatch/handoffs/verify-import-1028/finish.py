import pathlib,sys,json,re,subprocess,datetime
root=pathlib.Path('/home/lorkhan/repo/game_dev/mecha-srpg');out=root/'wf/workflows/dispatch/handoffs/verify-import-1028';replay=pathlib.Path('/tmp/mecha-integrate-1028/replay');pkg=pathlib.Path('/tmp/mecha-integrate-1028/mecha-srpg-pending-integration/tests')
sys.path.insert(0,str(root/'wf/tools'));from tabledb import load
meta=json.loads((out/'status.json').read_text());assert meta['status']=='SUITE_FINISHED'
tap=(out/'suite.tap').read_text(); stats={k:int(v) if k!='duration_ms' else float(v) for k,v in re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)$',tap,re.M)}
assert 'tests' in stats
historical=load(str(pkg/'test-failures.json')); comp=load(str(pkg/'test-comparison.json')); rows=[]
for m in re.finditer(r'^not ok (\d+) - ([^\n]+)\n(.*?)(?=^# Subtest:|^(?:not )?ok \d+ - |^1\.\.|\Z)',tap,re.M|re.S):
 number,name,diag=m.groups();old=next((r for r in historical.rows if r.get('scope')=='integrated' and r['test']==name),None);base=next((r for r in comp.rows if r['test']==name),None)
 def signature(s):
  p=re.search(r'^\s*expected:.*?(?=^\s*operator:)',s,re.M|re.S)
  if p:return p.group(0).strip()
  p=re.search(r'^\s*error:.*?(?=^\s*(?:code:|stack:))',s,re.M|re.S)
  return p.group(0).strip() if p else ''
 same=bool(old and signature(diag) and signature(diag)==signature(old['diagnostic']))
 category='相同已知敗' if same else ('未知：同名診斷差異' if old else '新敗（相對包內整合）')
 rows.append({'test':name,'classification':category,'local_diagnostic':diag.strip(),'historical_diagnostic':old['diagnostic'] if old else '', 'baseline_comparison':base or '', 'evidence':f'suite.tap test {number}'})
resolved=[]
for old in historical.rows:
 if old.get('scope')=='integrated' and not any(r['test']==old['test'] for r in rows):
  ok=bool(re.search(r'^ok \d+ - '+re.escape(old['test'])+r'$',tap,re.M))
  resolved.append({'test':old['test'],'classification':'環境差異：本機通過，包內 EPERM' if ok and 'EPERM' in old['diagnostic'] else '本機通過' if ok else '未知：未找到結果','historical_diagnostic':old['diagnostic']})
def table(name,data):
 p=out/name;p.write_text(json.dumps({'contract':'wf-table/1','source':'REPORT.md','extracted':'2026-10-28','columns':list(data[0]) if data else [],'rows':[]},ensure_ascii=False,indent=2));t=load(str(p))
 for r in data:t.add(r)
 t.save()
table('failures.json',rows);table('differences.json',resolved)
status=subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=replay,text=True);(out/'after-status.txt').write_text(status)
diff=subprocess.check_output(['git','diff','HEAD','--'],cwd=replay);(out/'protected.diff').write_bytes(diff)
assert not diff;assert status==(out/'before-status.txt').read_text()
meta.update(status='DONE',statistics=stats,failures=len(rows),differences=len(resolved),protected_diff_bytes=len(diff),snapshot_tree_after=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=replay,text=True).strip())
assert meta['snapshot_tree_after']==meta['snapshot_tree'];assert len(rows)==stats['fail']
(out/'status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
read=['AGENTS.md','wf/WORKFLOWS.md','wf/SESSION-LOG.md','wf/WAIT_USER.md','wf/workflows/common/user.md','wf/workflows/common/user/working.md','wf/workflows/testing.md','wf/workflows/dispatch/README.md','wf/workflows/common/data-files.md','wf/workflows/common/conventions.md','wf/workflows/common/code-map.md','wf/workflows/dev-env.md','wf/workflows/dispatch/handoffs/verify-import-1028.md','wf/workflows/dispatch/handoffs/integrate-zip-1028/REPORT.md','包 TESTS.md','包 tests/COMMANDS.md','包 tests/test-failures.json（tabledb slice 0:10）','包 tests/test-comparison.json（tabledb slice 0:9）','隔離 src/mcp/ui.test.ts','隔離 package.json','wf/inbox/new/*.md（16件，只讀）']
table('read-list.json',[{'read':r} for r in read])
report=f'''# 本機整合驗證 REPORT（DONE）

一次非截圖 suite：{stats['tests']} 案、{stats['pass']} 通過、{stats['fail']} 失敗；cancelled={stats.get('cancelled')}、skipped={stats.get('skipped')}。Node exit {meta['exit_code']}，實際耗時 {meta['elapsed_seconds']} 秒。未全綠，不修復、不重錄黃金、不重跑基底或失敗案例。

快照 HEAD `{meta['snapshot_head']}`，tree `{meta['snapshot_tree']}`，執行前後一致。使用 `/tmp/mecha-integrate-1028/replay`，不在 main 測試；node_modules 為既有主樹依賴唯讀連結，未安裝。Node {meta['node']}；nice 19、CPU {meta['cpus']}、concurrency=2。開跑前沒有其他實際測試／探針程序（pgrep 命中自身查詢 shell，已辨識）。

158 個來源檔名見 [sources](sources.txt)，由 src/test 下全部 *.test.ts 排除 src/mcp/ui.test.ts 產生，以單次 argv 傳入 node，未使用 xargs。原命令全文見 [command](command.txt)，原始合併 stdout/stderr 見 [TAP](suite.tap)，退出碼、起訖、耗時、統計見 [status](status.json)。兩個 UPDATE 環境變數均移除。

逐敗診斷與包內來源對照見 [失敗分類](failures.json)（{len(rows)} 列），本機與他平台差異見 [差異](differences.json)（{len(resolved)} 列）。歷史基底比較來自包內資料，並非本線重測。wait 與 ops-relic 即使重現包內失敗，仍保留原基底→擴充內容的軌跡改變限制；不可稱未受影響的舊敗。無足夠證據的差異標未知。

明列未執行：`ui_screenshot：預設戰場回 PNG 與回合資訊`、`ui_screenshot：?spectate=1 全 AI 觀戰，steps 後仍有回合資訊`，共兩案，不計 skipped；不能稱原始 npm test 全跑。未做 GUI、截圖、e2e 或人工視覺驗收。

隔離樹所有 tracked 路徑對 HEAD 的 [diff](protected.diff) 為空，涵蓋引擎、schemas、specs、黃金、內容、依賴；[前狀態](before-status.txt) 與 [後狀態](after-status.txt) 相同，僅既有 node_modules 連結。主樹只寫本線報告目錄，不以持續變動的 main 為測試基準。已讀清單見 [read-list](read-list.json)。未寄信、未 commit/push，無子代理。
'''
(out/'REPORT.md').write_text(report)
print(json.dumps(meta,ensure_ascii=False))

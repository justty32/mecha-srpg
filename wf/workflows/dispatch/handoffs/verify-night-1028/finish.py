import pathlib,sys,json,re,subprocess,os,collections
root=pathlib.Path('/home/lorkhan/repo/game_dev/mecha-srpg');out=root/'wf/workflows/dispatch/handoffs/verify-night-1028';base=root/'wf/workflows/dispatch/handoffs/verify-import-1028';replay=pathlib.Path('/tmp/mecha-night-verify-1028')
sys.path.insert(0,str(root/'wf/tools'));from tabledb import load
meta=json.loads((out/'status.json').read_text());assert meta['status']=='SUITE_FINISHED'
tap=(out/'suite.tap').read_text(); btap=(base/'suite.tap').read_text()
stats={k:int(v) if k!='duration_ms' else float(v) for k,v in re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)$',tap,re.M)}
historical=load(str(base/'failures.json')); rows=[]
def signature(s):
 m=re.search(r'^  failureType:.*?(?=^  stack:|^  \.\.\.|\Z)',s,re.M|re.S)
 return m.group(0).strip() if m else ''
for m in re.finditer(r'^not ok (\d+) - ([^\n]+)\n(.*?)(?=^# Subtest:|^(?:not )?ok \d+ - |^1\.\.|\Z)',tap,re.M|re.S):
 number,name,diag=m.groups();old=next((r for r in historical.rows if r['test']==name),None)
 now=signature(diag);previous=signature(old['local_diagnostic']) if old else ''
 if old:category='相同' if now and now==previous else '失敗軌跡改變' if now and previous else '未知'
 else:category='新增失敗' if re.search(r'^ok \d+ - '+re.escape(name)+r'$',btap,re.M) else '未知'
 rows.append({'test':name,'classification':category,'local_diagnostic':diag.strip(),'baseline_diagnostic':old['local_diagnostic'] if old else '', 'evidence':f'suite.tap test {number}'})
failed=len(rows)
for old in historical.rows:
 if not any(r['test']==old['test'] for r in rows):
  passed=bool(re.search(r'^ok \d+ - '+re.escape(old['test'])+r'$',tap,re.M))
  rows.append({'test':old['test'],'classification':'失敗消失' if passed else '未知','local_diagnostic':'明確ok' if passed else '未找到明確ok','baseline_diagnostic':old['local_diagnostic'],'evidence':'suite.tap'})
assert failed==stats['fail']
def table(name,data):
 p=out/name;p.write_text(json.dumps({'contract':'wf-table/1','source':'REPORT.md','extracted':'2026-10-28','columns':list(data[0]) if data else [],'rows':[]},ensure_ascii=False));t=load(str(p))
 for r in data:t.add(r)
 t.save()
table('comparison.json',rows)
status=subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=replay,text=True);(out/'after-status.txt').write_text(status)
diff=subprocess.check_output(['git','diff','HEAD','--'],cwd=replay);(out/'protected.diff').write_bytes(diff)
assert not diff;assert status==(out/'before-status.txt').read_text()
head,tree=subprocess.check_output(['git','rev-parse','HEAD','HEAD^{tree}'],cwd=replay,text=True).splitlines();assert head==meta['snapshot_head'] and tree==meta['snapshot_tree']
left=[]
for p in pathlib.Path('/proc').iterdir():
 if not p.name.isdigit():continue
 try:
  cmd=(p/'cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace');cwd=os.readlink(p/'cwd')
  if cwd==str(replay) and ('node' in cmd or '--test' in cmd):left.append(int(p.name))
 except OSError:pass
assert not left
counts=dict(collections.Counter(r['classification'] for r in rows))
meta.update(status='DONE',statistics=stats,comparison=counts,snapshot_head_after=head,snapshot_tree_after=tree,protected_diff_bytes=len(diff),residual_test_processes=left,runner_owned=False,excluded_not_executed=2)
(out/'status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
(out/'REPORT.md').write_text(f'''# 夜間固定快照整合驗證 REPORT（DONE）

唯一一次非截圖suite：{stats['tests']}案／{stats['pass']}過／{stats['fail']}敗；cancelled={stats['cancelled']}、skipped={stats['skipped']}。Node exit {meta['exit_code']}，耗時 {meta['elapsed_seconds']} 秒。對照前輪本機1031／1022／9：{json.dumps(counts,ensure_ascii=False)}。已釋放唯一runner；無殘留本線測試程序。此結果不代表自動接受整批內容。

主線正式GO指定commit `{head}`，tree `{tree}`，於 `/tmp/mecha-night-verify-1028` detached執行，前後commit/tree相同；未取main浮動HEAD。Node {meta['node']}，nice19、CPU {meta['cpus']}、concurrency2；開始 {meta['start']}，結束 {meta['end']}。主線確認內容線DONE及runner釋放，開跑前pgrep未找到其他runner。

[158檔來源](sources.txt)與基準逐筆完全相同，固定快照沒有新增或刪除測試來源。一次argv傳入，未分批。原命令見 [command](command.txt)，完整原始stdout/stderr見 [TAP](suite.tap)，退出碼、耗時、統計及資源釋放見 [status](status.json)。兩個黃金更新環境變數移除；只沿用既有node_modules連結，未下載安裝。

[逐項分類](comparison.json)保存本輪與本機基準完整診斷。比較錯誤類別／訊息與expected、actual、hash、events、day，忽略耗時、checkout前綴及堆疊；缺證據列未知。基準沿用 [verify-import](../verify-import-1028/REPORT.md)，未重跑基底或失敗case。wait及ops-relic先前已有的歷史軌跡改變限制仍保留。

明列未執行的兩案：`ui_screenshot：預設戰場回 PNG 與回合資訊`、`ui_screenshot：?spectate=1 全 AI 觀戰，steps 後仍有回合資訊`（src/mcp/ui.test.ts整檔排除），不算skipped，不能稱原始npm test全跑。

受保護範圍含所有tracked內容、引擎、schemas、specs、黃金與依賴；[diff](protected.diff)為空。[執行前](before-status.txt)與[執行後](after-status.txt)相同，只保留既有依賴連結。前輪證據未寫入；未修內容／黃金、未stage/commit/push、未GUI或截圖、未派子代理。

已讀：本session親讀AGENTS、WORKFLOWS、testing、dispatch、common/user、user/working、data-files、conventions、code-map、dev-env；本輪親讀verify-night brief及基準REPORT，以tabledb讀基準失敗資料。準備與分類方法見 [STATE](STATE.md)。
''')
state=(out/'STATE.md').read_text();(out/'STATE.md').write_text('DONE：唯一suite完成，runner已釋放。終局見 [REPORT](REPORT.md) 與 [status](status.json)。\n\n'+state.replace('RUNNING：','歷史啟動紀錄：',1))
files=[p for p in out.rglob('*') if p.is_file()];size=sum(p.stat().st_size for p in files);assert len(files)<=30 and size<=15000000
meta.update(artifact_files=len(files),artifact_bytes=size);(out/'status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(meta,ensure_ascii=False))

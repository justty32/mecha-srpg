import pathlib,subprocess,os,json,time,datetime,hashlib,shlex,re
root=pathlib.Path('/home/lorkhan/repo/game_dev/mecha-srpg');out=root/'wf/workflows/dispatch/handoffs/verify-night-1028'
expected='4a139221d82210dc23e7a3f129f13794a22e935a'
def capture(label):
 head,tree=subprocess.check_output(['git','rev-parse','HEAD','HEAD^{tree}'],cwd=root,text=True).splitlines()
 diff=subprocess.check_output(['git','diff','HEAD','--','content'],cwd=root);(out/f'wiki-{label}-content.diff').write_bytes(diff)
 h=hashlib.sha256();n=0
 for p in sorted((root/'content').rglob('*')):
  if p.is_file():h.update(str(p.relative_to(root)).encode()+b'\0'+p.read_bytes()+b'\0');n+=1
 return {'head':head,'tree':tree,'content_diff_bytes':len(diff),'all_content_files':n,'all_content_sha256':h.hexdigest(),'content_status':subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all','--','content'],cwd=root,text=True)}
before=capture('before');assert before['head']==expected;assert before['content_diff_bytes']==0
cpus=sorted(os.sched_getaffinity(0))[:2];cmd=['nice','-n','19','taskset','-c',','.join(map(str,cpus)),'node','--test','--test-concurrency=2','--test-reporter=tap','src/ui-adapter/vm/wiki/index-new.test.ts']
env=os.environ.copy();env.pop('GOLDEN_UPDATE',None);env.pop('UPDATE_GOLDEN',None)
(out/'wiki-command.txt').write_text('cd '+shlex.quote(str(root))+'\nenv -u GOLDEN_UPDATE -u UPDATE_GOLDEN '+shlex.join(cmd)+'\n')
meta={'status':'STARTED','runner_owned':True,'start':datetime.datetime.now().astimezone().isoformat(),'before':before,'cpus':cpus,'runs':1,'scope':'one file, six cases','node':subprocess.check_output(['node','--version'],text=True).strip()}
(out/'wiki-status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2));print(json.dumps(meta,ensure_ascii=False),flush=True)
start=time.monotonic()
with (out/'wiki-suite.tap').open('xb') as f:
 p=subprocess.Popen(cmd,cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT);meta['pid']=p.pid;code=p.wait()
meta.update(status='FINISHED',runner_owned=False,exit_code=code,elapsed_seconds=round(time.monotonic()-start,3),end=datetime.datetime.now().astimezone().isoformat());print(json.dumps({'status':'RUNNER_RELEASED','exit_code':code,'elapsed_seconds':meta['elapsed_seconds']},ensure_ascii=False),flush=True)
after=capture('after');meta['after']=after;meta['content_unchanged']=before==after
text=(out/'wiki-suite.tap').read_text();stats={k:int(v) if k!='duration_ms' else float(v) for k,v in re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)$',text,re.M)};meta['statistics']=stats
(out/'wiki-status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
assert before==after
assert stats['tests']==6
report=out/'REPORT.md'
with report.open('a') as f:f.write(f'''\n## 主線另授最後wiki窄測\n\n此項在主樹固定HEAD `{before['head']}`、tree `{before['tree']}`，包含R2 lore；與完整suite的commit `3a20a4367944cc3ed4ea62ee49552991b2f3d87e`／tree `9a5ab936bc2804c9ed36497b7047b1b448e5cead` 是不同快照，不合併宣稱同tree驗證。\n\n只執行 `src/ui-adapter/vm/wiki/index-new.test.ts` 一次：{stats['tests']}案／{stats['pass']}過／{stats['fail']}敗，exit {code}，耗時{meta['elapsed_seconds']}秒。nice19、CPU {cpus}、concurrency2；{meta['start']} 開始、{meta['end']} 結束即釋放runner。原始 [TAP](wiki-suite.tap)、[命令](wiki-command.txt)、[快照與統計](wiki-status.json) 分別保存。\n\n[前content diff](wiki-before-content.diff)與[後content diff](wiki-after-content.diff)均為空；涵蓋content/base、content/lore及content內索引，全部content檔名與位元組聚合SHA256前後相同（{before['all_content_files']}檔），HEAD/tree亦未變。沒有再跑完整suite、未修改前一隔離快照。\n''')
print(json.dumps(meta,ensure_ascii=False),flush=True)

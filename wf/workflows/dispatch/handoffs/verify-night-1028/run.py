import os, sys, subprocess, pathlib, json, time, shlex, datetime
root=pathlib.Path('/home/lorkhan/repo/game_dev/mecha-srpg'); out=root/'wf/workflows/dispatch/handoffs/verify-night-1028'; replay=pathlib.Path('/tmp/mecha-night-verify-1028')
sys.path.insert(0,str(root/'wf/tools')); from tabledb import load
paths=sorted(str(p.relative_to(replay)) for d in ['src','test'] for p in (replay/d).rglob('*.test.ts') if str(p.relative_to(replay))!='src/mcp/ui.test.ts')
assert len(paths)==158
assert paths==(out/'sources.txt').read_text().splitlines()
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=replay,text=True).strip()=='3a20a4367944cc3ed4ea62ee49552991b2f3d87e'
(out/'sources.txt').write_text('\n'.join(paths)+'\n')
tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=replay,text=True).strip(); assert tree=='9a5ab936bc2804c9ed36497b7047b1b448e5cead'
(out/'before-status.txt').write_text(subprocess.check_output(['git','status','--porcelain=v1','--untracked-files=all'],cwd=replay,text=True))
cpus=sorted(os.sched_getaffinity(0))[:2]
cmd=['nice','-n','19','taskset','-c',','.join(map(str,cpus)),'node','--test','--test-concurrency=2','--test-reporter=tap',*paths]
(out/'command.txt').write_text('cd '+shlex.quote(str(replay))+'\nenv -u GOLDEN_UPDATE -u UPDATE_GOLDEN '+shlex.join(cmd)+'\n')
meta={'go_received':True,'runner_owned':True,'worktree_created':True,'status':'STARTED','snapshot_tree':tree,'snapshot_head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=replay,text=True).strip(),'source_files':len(paths),'cpus':cpus,'node':subprocess.check_output(['node','--version'],text=True).strip(),'start':datetime.datetime.now().astimezone().isoformat(),'suite_runs':1}
(out/'status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)); print(json.dumps(meta,ensure_ascii=False),flush=True)
env=os.environ.copy(); env.pop('GOLDEN_UPDATE',None); env.pop('UPDATE_GOLDEN',None)
start=time.monotonic()
with (out/'suite.tap').open('xb') as log:
 p=subprocess.Popen(cmd,cwd=replay,env=env,stdout=log,stderr=subprocess.STDOUT)
 meta['pid']=p.pid;(out/'status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
 while p.poll() is None:
  time.sleep(5)
  elapsed=time.monotonic()-start
  if elapsed>=720:
   print('PROGRESS: suite 超過12分鐘，原程序繼續等待；不重跑',flush=True)
   p.wait();break
 meta.update(runner_owned=False,status='SUITE_FINISHED',exit_code=p.returncode,elapsed_seconds=round(time.monotonic()-start,3),end=datetime.datetime.now().astimezone().isoformat())
(out/'status.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)); print(json.dumps(meta,ensure_ascii=False),flush=True)

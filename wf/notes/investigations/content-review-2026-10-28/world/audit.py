"""本輪只讀盤點與分區資料交付；執行時須 python3 -B。"""
import sys,json,hashlib,re,subprocess
from pathlib import Path
from collections import Counter,defaultdict
sys.path.insert(0,'/mnt/c/code/mine/mecha-srpg/wf/tools')
from tabledb import load,Table
ROOT=Path('/mnt/c/code/mine/mecha-srpg')
OUT=Path(__file__).parent
HAND=ROOT/'wf/workflows/dispatch/handoffs'
def rows(p):
 t=load(str(p)); return [dict(zip(t.columns,r)) if isinstance(r,list) else r for r in t.rows]
def current(v):
 if isinstance(v,dict): v=v['$fmt']
 if isinstance(v,list): return [current(x) for x in v]
 return 'content/'+v.split('content/',1)[1] if 'content/' in v else v

def entries():
 result=[]
 for i,r in enumerate(rows(HAND/'lead-bigfill/review-all.json')):
  p=current(r['檔'])
  if p.startswith('content/lore/characters/'): continue
  result.append({'entry':f'BF:{i}','batch':'bigfill','source':str((HAND/'lead-bigfill/review-all.json').relative_to(ROOT)), 'row':i,'name':r['名稱'],'category':p.split('/')[2],'files':[p]})
 ps=[*sorted((HAND/'lead-world-life-1027').glob('*/review.json')),HAND/'lead-world-next-1027/review.json',HAND/'lead-world-more-1027/review.json']
 for p in ps:
  for i,r in enumerate(rows(p)):
   cat=r.get('category',r.get('類別'))
   if cat in ('characters','character'): continue
   fs=current(r.get('files',r.get('檔')))
   if not isinstance(fs,list): fs=[fs]
   if '型錄' in r: fs.append(current(r['型錄']))
   result.append({'entry':f'{p.parent.name if "life" in str(p) else p.parent.name+"-"+str(r.get("round"))}:{i}','batch':'seven','source':str(p.relative_to(ROOT)),'row':i,'name':r.get('name',r.get('名稱')),'category':cat,'files':fs})
 return result

def corpus():
 ps=subprocess.check_output(['rg','--files',str(ROOT/'content/base'),str(ROOT/'content/lore')],text=True).splitlines()
 d={}
 for p in ps:
  if not p.endswith('.json'): continue
  try: v=json.loads(Path(p).read_text())
  except (ValueError,OSError): continue
  if isinstance(v,dict): d[str(Path(p).relative_to(ROOT))]=v
 return d

def save_table(name,cols,rs,**meta):
 p=str(OUT/name)
 if Path(p).exists(): t=load(p);t.columns=list(cols);t.rows=[]
 else:t=Table(p,cols)
 t.meta={'contract':'wf-table/1','source':'README.md','extracted':'2026-10-28',**meta}
 for r in rs:t.add(r)
 t.save()
 return t

def init():
 es=entries();data=corpus();byfile=defaultdict(list)
 for e in es:
  for f in e['files']:byfile[f].append(e['entry'])
 save_table('entries.json',['entry','batch','source','row','name','category','files'],es,counts=dict(Counter(e['batch'] for e in es)),mapping='來源worktree地址按content/後綴映射主樹；不讀歷史worktree作現況')
 cov=[]
 for f,belongs in sorted(byfile.items()):
  p=ROOT/f
  cov.append({'file_path':{'$fmt':'${gitRoot}/'+f},'entries':belongs,'read_level':'mechanical_index' if p.exists() else 'missing','sha256':hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else '', 'lines':len(p.read_text().splitlines()) if p.exists() else 0,'role':'entry' if f==next(e['files'][0] for e in es if e['entry']==belongs[0]) else 'companion'})
 save_table('coverage.json',['file_path','entries','read_level','sha256','lines','role'],cov,read_levels={'mechanical_index':'解析/索引，不算親自全文讀完','full_text':'全文逐行進context且已核讀','missing':'現行主樹缺檔'},corpus_mechanical_files=len(data))
 print(json.dumps({'entries':Counter(e['batch'] for e in es),'categories':{b:dict(Counter(e['category'] for e in es if e['batch']==b)) for b in ('bigfill','seven')},'mapped_files':len(cov),'missing':[r['file_path'] for r in cov if r['read_level']=='missing'],'corpus_mechanical_files':len(data)},ensure_ascii=False))

def full(fs):
 t=load(str(OUT/'coverage.json'))
 for f in fs:
  p=ROOT/f; raw=p.read_text()
  print('\nFILE '+f+' sha256='+hashlib.sha256(p.read_bytes()).hexdigest())
  for n,line in enumerate(raw.splitlines(),1):print(f'{n:4}: {line}')
  rs=[r for r in t.rows if r['file_path']['$fmt']=='${gitRoot}/'+f]
  if rs:rs[0]['read_level']='full_text'
  else:t.add({'file_path':{'$fmt':'${gitRoot}/'+f},'entries':[],'read_level':'full_text','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'lines':len(raw.splitlines()),'role':'reference'})
 t.save()
if __name__=='__main__':
 if sys.argv[1]=='init':init()
 elif sys.argv[1]=='full':full(sys.argv[2:])
 elif sys.argv[1]=='list':
  es=[e for e in entries() if e['batch']=='seven'];a=int(sys.argv[2]);b=int(sys.argv[3])
  for e in es[a:b]: print(json.dumps(e,ensure_ascii=False))

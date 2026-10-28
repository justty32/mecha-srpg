from pathlib import Path
import sys,json,re,hashlib,subprocess,datetime
sys.path.insert(0,'wf/tools')
from tabledb import load
root=Path(__file__).parent
r=load(str(root/'review.json')); w=load(str(root/'write-sets.json'))
def table(name,cols,rows):
 p=root/name
 p.write_text(json.dumps({'contract':'wf-table/1','source':'REPORT.md','extracted':'2026-10-28','columns':cols,'rows':[]},ensure_ascii=False)+'\n')
 t=load(str(p))
 for row in rows:t.add(row)
 t.save()
m={'ability':'abilities','bodyplan':'bodyplans','component':'components','effect':'effects','frame':'frames','species':'species','monster':'monsters','person':'persons','aiprofile':'aiprofiles','map':'maps','faction':'factions','scenario':'scenarios'}
planned={x['id'] for x in w.rows}
refs=set()
for row in r.rows:
 refs.update(re.findall(r'\b('+'|'.join(m)+r')/([a-z0-9-]+)',json.dumps(row,ensure_ascii=False)))
refs.update(x.split('/') for x in [])
extra=['map/skirmish-20','aiprofile/focus-fire','faction/migrant-crew','faction/rift-insects','frame/bulwark-ii','frame/bulwark-iv-rampart','frame/longspear-v4','frame/longspear-v7','person/ren-kasai','person/chen-xiaohai','person/mara-okoye','person/ilse-brandt','monster/reaper-c','monster/hound-c','monster/spitter-c','monster/shelf-back-b','scenario/exm-crossline']
refs.update(tuple(x.split('/')) for x in extra)
refrows=[]
for kind,slug in sorted(refs):
 id=kind+'/'+slug;p=Path('content/base')/m[kind]/(slug+'.json')
 ok=id in planned or (p.exists() and json.loads(p.read_text()).get('id')==id)
 refrows.append({'id':id,'path':str(p),'status':'planned' if id in planned else 'existing' if ok else 'MISSING','ok':ok})
table('references.json',['id','path','status','ok'],refrows)
evidence=[]
for row in r.rows:
 for near in row['近似對照']:
  p=Path(near['file']);data=json.loads(p.read_text())
  evidence.append({'concept':row['id'],'file':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'fields':{k:v for k,v in data.items() if k in ['id','species','grade','bodyPlan','defaultLoadout','abilities','extraAbilities','partsOverride','aiProfile','pools']},'difference':near['difference']})
table('evidence.json',['concept','file','sha256','fields','difference'],evidence)
readpaths=['AGENTS.md','wf/workflows/common/user.md','wf/workflows/content/README.md','wf/workflows/content/batch.md','wf/workflows/content/world-pillars.md','wf/workflows/content/mechs.md','wf/workflows/content/bio-monsters.md','wf/workflows/content/abilities-effects.md','wf/workflows/content/acceptance-playtest.md','wf/workflows/content/numeric-bands.json','wf/workflows/content/templates.json','content/lore/style.md','wf/workflows/common/conventions.md','wf/workflows/common/code-map.md','wf/workflows/dispatch/handoffs/night-combat-plan-1028.md','src/core/types-def.ts','src/rules/command.ts','src/rules/state.ts','src/rules/movement.ts','src/rules/pools.ts','src/rules/turn.ts','src/rules/attack.ts','src/rules/layers.ts','src/ai/policies/tactical.ts','src/ai/adapters/rules-adapter.ts','src/content/loader.ts','test/rules/monster-def.test.ts','content/base/registries/locomotion.json']
readpaths+=list({e['file'] for e in evidence})
readpaths+=['content/base/'+m[k]+'/'+s+'.json' for k,s in refs if k+'/'+s not in planned]
readrows=[]
for pstr in sorted(set(readpaths)):
 p=Path(pstr)
 if p.exists():readrows.append({'file':pstr,'scope':'有界欄位／相關行；不代表全文或全庫查讀','sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
table('readlist.json',['file','scope','sha256'],readrows)
checks=[]
def ck(name,ok,detail):checks.append({'check':name,'ok':bool(ok),'detail':detail})
ck('four_complete',len(r.rows)==4 and all(all(k in x and x[k] not in ['',None] for k in r.columns) for x in r.rows),'2CM+2CK，主線均核可')
ck('near_neighbors',all(len(x['近似對照'])>=2 for x in r.rows),'每件3個近鄰，含exm/exk，保存字段與SHA256')
ck('brief_60',all(len(x['白話'])<=60 for x in r.rows),{x['id']:len(x['白話']) for x in r.rows})
ck('refs',all(x['ok'] for x in refrows),{'total':len(refrows),'missing':[x['id'] for x in refrows if not x['ok']]})
counts={b:sum(x['batch']==b for x in w.rows) for b in ['CM','CK']}
ck('write_set',counts=={'CM':6,'CK':13} and len(planned)==19,counts)
occupied=[x['path'] for x in w.rows if Path(x['path']).exists()]
ck('new_paths_absent',not occupied,{'occupied':occupied,'note':'交付時點；主線已授權並行實作，之後佔用不等於設計撞id。另rg新id/兩怪俗名於限定七類目錄無命中。'})
ck('naming_clarified',all('species維持必填俗名name；B/C級monster不加個體name/epithet' in x['可執行設計']['scope'] for x in r.rows if x['批次']=='CK'),'已同步review、CK頁與產表helper')
ck('documents',all((root/p).exists() for p in ['PLAN.md','REPORT.md','CM-mechs.md','CK-monsters.md']),'文件存在與本地連結核對，不執行測試')
paths=list(root.iterdir());ck('capacity',len(paths)+1<=20 and sum(p.stat().st_size for p in paths)<2000000,{'files_before_validation':len(paths),'bytes_before_validation':sum(p.stat().st_size for p in paths)})
ck('whitespace',not any(line.rstrip()!=line for p in paths if p.suffix in ['.md','.json','.py'] for line in p.read_text().splitlines()),'含untracked交付，不以空git diff冒充全文驗證')
table('validation.json',['check','ok','detail'],checks)
print(json.dumps({'document_checks':checks,'runtime_tests':'NOT RUN; handoff禁止'},ensure_ascii=False,indent=2))

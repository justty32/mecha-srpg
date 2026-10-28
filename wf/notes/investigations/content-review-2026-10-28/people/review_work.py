import sys,json,hashlib,re,collections
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path('/mnt/c/code/mine/mecha-srpg')
OUT=Path('/mnt/c/code/mine/mecha-srpg/wf/notes/investigations/content-review-2026-10-28/people')
sys.path.insert(0,str(ROOT/'wf/tools'))
from tabledb import load,Table
SOURCES={
 'pilots':'wf/workflows/dispatch/handoffs/lead-fill-pilots/review.json',
 'bigfill':'wf/workflows/dispatch/handoffs/lead-bigfill/review-all.json',
 'wl':'wf/workflows/dispatch/handoffs/lead-world-life-1027/characters/review.json',
 'wn-r2':'wf/workflows/dispatch/handoffs/lead-world-next-1027/round2/characters/review.json',
 'wm-r4':'wf/workflows/dispatch/handoffs/lead-world-more-1027/round4/characters/review.json'}
def rows(p):
 t=load(str(ROOT/p)); return [x if isinstance(x,dict) else dict(zip(t.columns,x)) for x in t.rows]
def table(name,cols,meta=None):
 return Table(str(OUT/name),columns=cols,meta={'contract':'wf-table/1','source':'README.md','extracted':'2026-10-28',**(meta or {})})
def sha(p): return hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
def fmt(p): return {'$fmt':'${gitRoot}/'+p}
def setup():
 membership=collections.defaultdict(list); entries=[]
 for group,src in SOURCES.items():
  for idx,x in enumerate(rows(src)):
   paths=[x['檔']] if '檔' in x else x['files']
   for p in paths:
    if group=='bigfill' and not p.startswith('content/lore/characters/'): continue
    membership[p].append({'group':group,'source':src,'row':idx})
    semantic=group!='pilots' or p.startswith('content/base/persons/')
    if semantic:
     entries.append({'group':group,'source':src,'row':idx,'file':p})
 inv=table('entries.json',['entry','group','source_path','source_row','content_path','content_id','exists'],{'scope':'148 pilots + 34 bigfill + 18 seven-round people; companions excluded'})
 for i,e in enumerate(entries):
  p=e['file']; exists=(ROOT/p).exists(); d=json.loads((ROOT/p).read_text()) if exists else {}
  inv.add({'entry':i+1,'group':e['group'],'source_path':fmt(e['source']),'source_row':e['row'],'content_path':fmt(p),'content_id':d.get('id',''),'exists':exists})
 inv.save()
 cov=table('coverage.json',['content_path','content_id','ownership','source_rows','read_level','sha256','bytes','notes'],{'read_levels':{'mechanical':'Parsed and indexed only; not personally full-read','full':'Personally read entire current JSON with line numbers'},'semantic_entries':len(entries)})
 for p,ms in membership.items():
  exists=(ROOT/p).exists(); d=json.loads((ROOT/p).read_text()) if exists else {}
  cov.add({'content_path':fmt(p),'content_id':d.get('id',''),'ownership':','.join(sorted({m['group'] for m in ms})),'source_rows':[{'table':m['source'],'row':m['row']} for m in ms],'read_level':'mechanical','sha256':sha(p) if exists else '', 'bytes':(ROOT/p).stat().st_size if exists else 0,'notes':'current main-tree mapping exact; companion not a semantic entry' if '/base/world/' in p or (ms[0]['group']=='pilots' and '/lore/' in p) else 'current main-tree mapping exact'})
 cov.save()
 print('semantic',len(entries),'groups',dict(collections.Counter(e['group'] for e in entries)),'coverage',len(cov.rows),'missing',sum(not r['sha256'] for r in cov.rows))
 print('unique source paths',len(membership))
if __name__ == "__main__":
 setup()

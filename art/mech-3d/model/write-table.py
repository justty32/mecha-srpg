"""生成器僅透過 tabledb 保存同質工作單。"""
import json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(root/'wf/tools'))
from tabledb import load
payload=json.load(sys.stdin)
p=Path(__file__).resolve().parent/payload['file']
if p.parent!=Path(__file__).resolve().parent:raise ValueError('model only')
rows=payload['rows']
p.write_text(json.dumps({'contract':'wf-table/1','source':payload.get('source','API.md'),'extracted':'2026-10-28','columns':list(rows[0]) if rows else [],'rows':[]}),encoding='utf8')
t=load(str(p))
for row in rows:t.add(row)
t.save()

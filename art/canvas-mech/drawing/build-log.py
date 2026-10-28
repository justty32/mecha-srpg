"""以實際 painter 驗證逐葉來源，記錄可交 viewer 的由下而上組裝序。"""
import sys,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(root/'wf/tools'))
from tabledb import load
script='''
import {configureMech,validateAssembly,createLeafJobs} from './art/canvas-mech/core/index.js';
import {validateLeafJob} from './art/canvas-mech/drawing/index.js';
const p=configureMech();if(!validateAssembly(p).ok)throw Error('invalid plan');
const jobs=new Map(createLeafJobs(p).map(j=>[j.nodeId,j]));
const rows=[];
function visit(n){
 const children=p.nodes.filter(c=>c.parentId===n.id);
 for(const c of children)visit(c);
 const leaf=n.kind==='leaf';const entry=leaf?validateLeafJob(jobs.get(n.id)):null;
 rows.push({nodeId:n.id,kind:n.kind,depth:n.id.split('.').length-1,children:children.map(c=>c.id),profile:entry?.profile??'',planHash:p.hash,status:leaf?'leaf-painter-contract-checked':'children-assembled-for-viewer'});
}
visit(p.nodes.find(n=>n.id===p.rootId));console.log(JSON.stringify(rows));
'''
rows=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=root,text=True))
p=root/'art/canvas-mech/drawing/assembly-log.json'
p.write_text(json.dumps({'contract':'wf-table/1','source':'REPORT.md','extracted':'2026-10-28','columns':list(rows[0]),'rows':[]}),encoding='utf8')
t=load(str(p))
for row in rows:t.add(row)
t.save()
print(json.dumps({'assemblySteps':len(rows),'leaves':sum(r['kind']=='leaf' for r in rows),'last':rows[-1]['nodeId']}))

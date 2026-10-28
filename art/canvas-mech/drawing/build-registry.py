"""僅在凍結 core 後，經 tabledb 讀工作單並產生 drawing 對映。"""
import sys, json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'wf/tools'))
from tabledb import load
folder=Path(__file__).resolve().parent
jobs=load(str(folder.parent/'core/leaf-jobs.json')).rows
# JS 負責與執行期相同的精確序列化；輸出僅寫 drawing。
script='''
import {readFileSync,writeFileSync} from 'node:fs';
import {profileForId,profiles} from './art/canvas-mech/drawing/profiles.js';
import {signature,PLAN_HASH} from './art/canvas-mech/drawing/freeze.js';
const jobs=JSON.parse(readFileSync(0,'utf8'));
const registry={};
for(const job of jobs) {
 if(job.planHash!==PLAN_HASH) throw new Error('Freeze mismatch');
 const profile=profileForId(job.nodeId);
 if(!profiles[profile]) throw new Error('Unmapped leaf '+job.nodeId);
 registry[job.nodeId]={profile,signature:signature(job)};
}
writeFileSync('art/canvas-mech/drawing/registry.js','// Generated from validated frozen leaf jobs; one entry per actual leaf.\\nexport const registry = '+JSON.stringify(registry,null,1)+';\\n');
console.log(JSON.stringify({leaves:jobs.length,profiles:new Set(Object.values(registry).map(v=>v.profile)).size}));
'''
subprocess.run(['node','--input-type=module','-e',script],input=json.dumps(jobs),text=True,cwd=ROOT,check=True)

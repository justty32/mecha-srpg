import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {configureModel,validateModel,createLeafJobs} from './index.js';
import {hashValue,sha256} from './hash.js';
const here=dirname(fileURLToPath(import.meta.url)),check=process.argv.includes('--check');
const plan=configureModel(),result=validateModel(plan);if(!result.ok)throw Error(JSON.stringify(result.errors));
const jobs=createLeafJobs(plan),jobsHash=hashValue(jobs);
const files=['API.md','index.js','layout.js','validation.js','state.js','hash.js','math.js','solid.js','rig.js','jobs.js','spec.js','design.js','design-torso.js','design-limbs.js','connections.js','refinement.js','model.test.js'];
const sources=files.map(file=>({file,sha256:sha256(readFileSync(join(here,file),'utf8'))}));
const summary={...plan.summary,connectionCount:plan.connections.length,coverageCount:jobs.reduce((n,j)=>n+j.requiredCoverage.length,0),poseCount:Object.keys(plan.poses).length};
if(check){
 const m=JSON.parse(readFileSync(join(here,'manifest.json'),'utf8'));
 if(!m.frozen||m.planHash!==plan.hash||m.jobsHash!==jobsHash||hashValue(m.sources)!==hashValue(sources))throw Error('Frozen source mismatch');
 const stored=JSON.parse(readFileSync(join(here,'assembly-plan.json'),'utf8'));if(hashValue(stored)!==hashValue(plan))throw Error('Stored plan mismatch');
 const data=JSON.parse(readFileSync(join(here,'leaf-jobs.json'),'utf8'));if(hashValue(data.rows)!==jobsHash)throw Error('Stored jobs mismatch');
 console.log(JSON.stringify({status:'verified',planHash:plan.hash,jobsHash,summary}));
}else{
 const meshExists=existsSync(join(here,'mesh.js'));
 if(meshExists&&!process.argv.includes('--refreeze'))throw Error('Mesh exists: explicit --refreeze required');
 const prior=existsSync(join(here,'manifest.json'))?JSON.parse(readFileSync(join(here,'manifest.json'),'utf8')):null;
 if(meshExists&&prior&&plan.interfaceVersion===prior.interfaceVersion)throw Error('Refreeze requires a new interfaceVersion');
 if(prior&&meshExists)writeFileSync(join(here,'manifest-'+prior.interfaceVersion+'.json'),JSON.stringify(prior,null,1)+'\n');
 const table=spawnSync('python3',[join(here,'write-table.py')],{input:JSON.stringify({file:'leaf-jobs.json',rows:jobs}),encoding:'utf8'});if(table.status!==0)throw Error(table.stderr);
 writeFileSync(join(here,'assembly-plan.json'),JSON.stringify(plan,null,1)+'\n');
 const manifest={interfaceVersion:plan.interfaceVersion,frozen:true,stage:'layout-frozen-awaiting-leader',frozenAt:new Date().toISOString(),meshExistedAtFreeze:meshExists,priorPlanHash:prior?.planHash??null,meshSourceAtFreeze:meshExists?sha256(readFileSync(join(here,'mesh.js'),'utf8')):null,planHash:plan.hash,jobsHash,summary,checks:{staticAllocation:true,solidCoverage:true,threePoseContacts:true,finiteThickness:true},sources};
 writeFileSync(join(here,'manifest.json'),JSON.stringify(manifest,null,1)+'\n');
 writeFileSync(join(here,'frozen.js'),`export const PLAN_HASH=${JSON.stringify(plan.hash)};\nexport const JOBS_HASH=${JSON.stringify(jobsHash)};\nexport const LEAF_HASHES=${JSON.stringify(Object.fromEntries(jobs.map(j=>[j.nodeId,hashValue(j)])),null,1)};\n`);
 console.log(JSON.stringify({status:'layout-frozen-awaiting-leader',planHash:plan.hash,jobsHash,summary}));
}

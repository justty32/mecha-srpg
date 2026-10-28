import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { configureMech,validateAssembly,createLeafJobs } from './index.js';
import { hashValue } from './hash.js';

const here=dirname(fileURLToPath(import.meta.url));
test('生成產物與實際 API/來源 SHA-256、容量一致，且 CLI --check 唯讀通過',()=>{
  const result=spawnSync(process.execPath,[join(here,'generate.js'),'--check'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const summary=JSON.parse(result.stdout);assert.equal(summary.status,'verified');assert.ok(summary.bytes<15_000_000);
  const plan=JSON.parse(readFileSync(join(here,'assembly-plan.json'),'utf8'));
  assert.equal(validateAssembly(plan).ok,true);assert.deepEqual(plan,configureMech());
  // 同質工作單透過 tabledb 選取；此測試驗證 JSON 邊界而非複製實作。
  const read=spawnSync('python3',[join(here,'../../../wf/tools/tabledb.py'),join(here,'leaf-jobs.json'),'--slice','0','94'],{encoding:'utf8',maxBuffer:2_000_000});
  assert.equal(read.status,0,read.stderr);
  const jobs=JSON.parse(read.stdout).map(({index,...job})=>job);
  assert.deepEqual(jobs,createLeafJobs(plan));assert.equal(hashValue(jobs),summary.jobsHash);
});

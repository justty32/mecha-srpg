import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import type { Blueprint } from './schema.ts';
export { buildLayout } from './layout.ts';
import { buildLayout } from './layout.ts';

export async function loadBlueprint(directory=fileURLToPath(new URL('./',import.meta.url))):Promise<Blueprint> {
  const names=['design','rig','slots','draw-order','poses'];
  const values=await Promise.all(names.map(async n=>JSON.parse(await readFile(resolve(directory,'data',`${n}.json`),'utf8'))));
  return {design:values[0],rig:values[1],slots:values[2],order:values[3],poses:values[4]};
}
export async function build(directory=fileURLToPath(new URL('./',import.meta.url))):Promise<ReturnType<typeof buildLayout>> {
  const blueprint=await loadBlueprint(directory),result=buildLayout(blueprint),out=resolve(directory,'generated');
  await mkdir(out,{recursive:true});
  await Promise.all([
    writeFile(resolve(out,'layout.json'),JSON.stringify(result.layout,null,2)+'\n'),
    writeFile(resolve(out,'work-orders.json'),JSON.stringify(result.workOrders,null,2)+'\n'),
    writeFile(resolve(out,'diagnostics.json'),JSON.stringify({version:blueprint.design.version,diagnostics:result.diagnostics},null,2)+'\n'),
    writeFile(resolve(out,'layout.svg'),result.svg),
    writeFile(resolve(out,'work-orders.svg'),result.workOrdersSvg),
  ]);
  return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=await build();
  console.log(JSON.stringify({orders:result.workOrders.orders.length,errors:result.diagnostics.filter(d=>d.severity==='error').length}));
  if(result.diagnostics.some(d=>d.severity==='error'))process.exitCode=1;
}

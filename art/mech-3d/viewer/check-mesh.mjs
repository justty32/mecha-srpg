import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export async function checkMesh(base, { jobs }) {
  const THREE = await import(pathToFileURL(resolve(base, 'vendor/three.module.min.js')).href);
  const { createLeafMesh } = await import(pathToFileURL(resolve(base, 'model/mesh.js')).href);
  assert.equal(typeof createLeafMesh, 'function');
  let solids = 0;
  let triangles = 0;
  let minimumThickness = Infinity;
  for (const job of jobs) {
    const leaf = createLeafMesh(THREE, job);
    assert.ok(leaf?.isObject3D, `非 Object3D：${job.nodeId}`);
    assert.equal(leaf.userData.nodeId, job.nodeId, 'mesh 與葉 ID 不符');
    let leafSolids = 0;
    leaf.traverse(object => {
      if (!object.isMesh) return;
      solids++; leafSolids++;
      object.geometry.computeBoundingBox();
      const bounds = object.geometry.boundingBox;
      assert.ok(bounds && [...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite), `無效 mesh bounds：${job.nodeId}`);
      const size = bounds.getSize(new THREE.Vector3());
      const thickness = Math.min(size.x, size.y, size.z);
      assert.ok(thickness > 0, `無真厚度：${job.nodeId}`);
      minimumThickness = Math.min(minimumThickness, thickness);
      triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
    });
    assert.ok(leafSolids > 0, `沒有實體 mesh：${job.nodeId}`);
    const bounds = new THREE.Box3().setFromObject(leaf);
    const allowed = job.localBounds;
    assert.ok(bounds.min.toArray().every((value, axis) => value >= allowed.min[axis] - 1e-5), `mesh 超出局部下界：${job.nodeId}`);
    assert.ok(bounds.max.toArray().every((value, axis) => value <= allowed.max[axis] + 1e-5), `mesh 超出局部上界：${job.nodeId}`);
  }
  return { leaves: jobs.length, solids, triangles, minimumThickness, finiteBounds: true, localBounds: true };
}

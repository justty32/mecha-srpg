import type { Blueprint, Design, LayoutNode, Region, Vec2 } from './schema.ts';
import { inverse, worldMatrices } from './rig.ts';
import { transformRegion } from './geometry.ts';
/** 先定大部位走廊，再計機構局部輪廓，最後將正規化外形分配到部件。 */
export function allocateDesign(source: Design, bones: Blueprint['rig']['bones']): Design {
  if (!source.allocation) return source;
  const a = source.allocation,
    worlds = worldMatrices(bones),
    root = bones.find((b) => b.parent === null);
  if (!root) throw new Error('Allocation requires root bone');
  const rootInverse = inverse(worlds[root.id]!),
    zero = { x: 0, y: 0, rotation: 0 };
  const profile = (p: Vec2[], box: [number, number, number, number]): Region => [
    p.map((v) => [box[0] + v[0] * box[2], box[1] + v[1] * box[3]] as Vec2),
  ];
  const machine: Region = [
    [
      [90, 70],
      [910, 70],
      [945, 340],
      [860, 1135],
      [140, 1135],
      [55, 340],
    ],
  ];
  const nodes: LayoutNode[] = [
    {
      id: 'machine',
      parent: null,
      level: 'machine',
      frame: { bone: root.id, transform: zero },
      envelope: transformRegion(machine, rootInverse),
      sockets: [],
    },
  ];
  for (const major of a.majors)
    nodes.push({
      id: major.id,
      parent: 'machine',
      level: 'major',
      frame: { bone: root.id, transform: zero },
      envelope: transformRegion(major.region, rootInverse),
      sockets: [],
    });
  for (const assembly of a.assemblies)
    nodes.push({
      id: assembly.id,
      parent: assembly.major,
      level: 'assembly',
      frame: { bone: assembly.bone, transform: zero },
      envelope: [...profile(assembly.profile, assembly.bounds), ...(assembly.extensions ?? [])],
      sockets: [{ id: 'pivot', at: [0, 0], axis: 90 }],
    });
  for (const leaf of a.leaves)
    nodes.push({
      id: leaf.id,
      parent: leaf.assembly,
      level: 'part',
      frame: { bone: leaf.bone, transform: zero },
      envelope: [...profile(leaf.profile, leaf.bounds), ...(leaf.extensions ?? [])],
      sockets: leaf.sockets ?? [{ id: 'mount', at: leaf.contact, axis: 90 }],
    });
  return { ...source, nodes };
}

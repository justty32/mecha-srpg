import hashlib, json, runpy, sys, xml.etree.ElementTree as E
from pathlib import Path
r=Path(sys.argv[1]); m=runpy.run_path(str(r/'rebuild.py'))
source, manifest=m['read_family']('mech')
data,index=m['mech_tree_data'](source,manifest)
q=m['q']; refs=m['referenced_ids']
source_ids={e.get('id'):e for e in source.iter() if e.get('id')}
assert len(source_ids)==sum(bool(e.get('id')) for e in source.iter()), 'duplicate source ids'
assert refs(source)<=set(source_ids), 'missing source reference'
def depth(e,n,ids,seen=()):
 tag=e.tag.split('}')[-1]
 if tag in {'defs','title','desc','style'}: return 0
 result=n
 if tag=='use':
  ref=e.get('href') or e.get('{http://www.w3.org/1999/xlink}href')
  assert ref and ref.startswith('#') and ref[1:] not in seen, 'bad use reference'
  target=ids[ref[1:]]
  children=list(target) if target.tag==q('symbol') else [target]
  result=max([result]+[depth(c,n+1,ids,seen+(ref[1:],)) for c in children])
 return max([result]+[depth(c,n+1,ids,seen) for c in e])
max_runtime=0
for symbol in source.iter(q('symbol')):
 for child in symbol:
  max_runtime=max(max_runtime,depth(child,3,source_ids))
assert max_runtime<=5, ('runtime depth',max_runtime)
outputs={}
for key,name in [('cold','bulwark.svg'),('ritual','bulwark-ritual.svg'),('feral','bulwark-feral.svg')]:
 out=E.parse(r/name).getroot()
 ids={e.get('id'):e for e in out.iter() if e.get('id')}
 assert len(ids)==sum(bool(e.get('id')) for e in out.iter()), name+' duplicate id'
 assert refs(out)<=set(ids), name+' missing reference'
 d=depth(out,1,ids); assert d<=5,(name,d)
 chosen=set(manifest['presets'][key]['parts'].values())
 assert {e.get('id') for e in out.iter(q('symbol'))}<=chosen, name+' unselected symbol'
 outputs[key]=d
 def mark(e): return e.get('data-mech-node')
 expected=set().union(*(set(index[i]) for i in chosen))
 assert {mark(e) for e in out.iter() if mark(e)}==expected,name+' missing output leaves'
def convert(e):
 return {'name':e.tag.split('}')[-1],'attrs':dict(e.attrib),'text':e.text or '', 'children':[convert(c) for c in e]}
hashes={name:hashlib.sha256((r/name).read_bytes()).hexdigest() for name in ['mech-parts.svg','mech-layers.json','mech-manifest.json','rebuild.py','bulwark.svg','bulwark-ritual.svg','bulwark-feral.svg']}
print(json.dumps({'index':index,'source':convert(source),'runtimeDepth':max_runtime,'outputDepth':outputs,'hashes':hashes}))

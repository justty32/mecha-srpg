import json,sys,collections
rows=[json.loads(l) for l in open(sys.argv[1]) if l.startswith('{')]
n=0;draw=0;rs=0;w=collections.Counter();reasons=collections.Counter();ms=0
for r in rows:
  ms+=r['ms']
  for x in r['rows']:
    n+=1; rs+=x.get('r',0); w[x.get('w')]+=1; reasons[x.get('reason')]+=1
    if x.get('w')=='draw': draw+=1
dec=sum(v for k,v in w.items() if k!='draw')
print(f"N={n} draw={draw} ({100*draw/n:.1f}%) avgRounds={rs/n:.2f} ms={ms}")
print("winners",dict(w), {k:f"{100*v/dec:.0f}%" for k,v in w.items() if k!='draw'})
print("reasons",dict(reasons))
for r in rows:
  if len(sys.argv)>2 or r['id'] in ('scenario/rift-edge-nest','scenario/nest-core-assault'):
    print(r['id'],r['winners'],[ (x.get('r'),x.get('reason')) for x in r['rows']])

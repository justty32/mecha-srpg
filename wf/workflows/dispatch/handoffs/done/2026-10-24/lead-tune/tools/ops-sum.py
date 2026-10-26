# 彙總 ops-tally 輸出：python3 ops-sum.py 檔案…（每檔取 seed 行；多檔＝多 seed 平行跑的結果）
import json,sys,collections
tot=collections.defaultdict(lambda: collections.Counter()); rows=[]
for f in sys.argv[1:]:
  for l in open(f):
    if not l.startswith('{'): continue
    d=json.loads(l)
    if 'phases' in d:
      for k,v in d['phases'].items(): tot[k].update(v)
    elif 'sortie' in d: rows.append(d)
keys=['n','win','repelled','withdrew','lost','timeout','withdrewR1','withdrewByR3','anchorKilled','nmHits']
print('phase\t'+'\t'.join(keys)+'\tavgR')
for k,v in sorted(tot.items()):
  print(k+'\t'+'\t'.join(str(v[x]) for x in keys)+f"\t{v['rounds']/max(1,v['n']):.1f}")
if rows:
  fr=collections.Counter(r['firstRetreat'] for r in rows if r['outcome']=='withdrew')
  print('withdrew firstRetreat round histogram',dict(sorted(fr.items(),key=lambda x:(x[0] is None,x[0] or 0))))
  tk=collections.defaultdict(collections.Counter)
  for r in rows: tk[r.get('template')][r['outcome']+('R1' if r['outcome']=='withdrew' and r['firstRetreat']==1 else '')]+=1
  for k,v in sorted(tk.items(),key=lambda x:str(x[0])): print('template',k,dict(v))

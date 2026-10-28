"""本分區唯讀索引與證據產出輔助；不修改來源。"""
import collections
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path('/mnt/c/code/mine/mecha-srpg')
OUT = Path(__file__).parent
sys.path.insert(0, str(ROOT / 'wf/tools'))
from tabledb import load, Table


def rows(rel):
    t = load(str(ROOT / rel))
    return [dict(zip(t.columns, r)) if isinstance(r, list) else r for r in t.rows]


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def build():
    records = {}
    h = 'wf/workflows/dispatch/handoffs/'
    for label, rel in [('gear200', h+'lead-fill-gear/review.json'), ('fill-scen63', h+'lead-fill-scen/review.json')]:
        for i, r in enumerate(rows(rel)):
            p = r['檔']
            records[p] = {'file_path': {'$fmt': '${gitRoot}/'+p}, 'entry_owner': label,
                          'entry_id': p, 'source': {'table': rel, 'row_index': i},
                          'mapping': 'exact-current-repo-relative', 'kind': r['類別']}
    sources = [('life-mechs', h+'lead-world-life-1027/mechs/review.json'),
               ('life-monsters', h+'lead-world-life-1027/monsters/review.json'),
               ('next', h+'lead-world-next-1027/review.json'),
               ('more', h+'lead-world-more-1027/review.json')]
    concepts = []
    for label, rel in sources:
        for i, r in enumerate(rows(rel)):
            if label in ['next', 'more'] and r['category'] not in ['mechs', 'monsters']:
                continue
            raw = r.get('files', r.get('檔'))
            raw = [raw] if isinstance(raw, str) else list(raw)
            if label == 'life-mechs': raw.append(r['型錄'])
            files = [p[p.index('content/'):] for p in raw]
            concepts.append((r.get('name', r.get('名稱')), files))
            for rawp, p in zip(raw, files):
                records[p] = {'file_path': {'$fmt': '${gitRoot}/'+p}, 'entry_owner': 'reference-seven-rounds',
                              'entry_id': r.get('id', files[0]), 'source': {'table': rel, 'row_index': i, 'original': rawp},
                              'mapping': 'strip-worktree-prefix-to-current-content' if rawp != p else 'exact-current-repo-relative',
                              'kind': r.get('category', r.get('類別'))}
    t = Table(str(OUT/'coverage.json'), columns=['file_path','entry_owner','entry_id','source','mapping','kind','read_level','sha256','bytes','mechanical_fields','full_read_note'], meta={
        'contract':'wf-table/1','source':'README.md','extracted':'2026-10-28',
        'scope': {'owned_entries':263,'gear':200,'scen':63,'reference_concepts':len(concepts),'reference_files':sum(len(f) for _,f in concepts)},
        'read_levels': {'mechanical-index':'解析JSON與抽取識別、名稱、引用及結構；未逐字全文審閱', 'full-text':'正文與全部字段已輸入本線context親讀'},
        'limits':'不宣稱全庫審完；全文僅列full-text；來源表是定位線索，裁決依現檔。'})
    missing = []
    for p, r in records.items():
        fp = ROOT/p
        if not fp.exists(): missing.append(p); continue
        data = json.loads(fp.read_text())
        r.update(read_level='mechanical-index',sha256=digest(fp),bytes=fp.stat().st_size,
                 mechanical_fields=list(data.keys()),full_read_note='')
        t.add(r)
    t.meta['missing'] = missing
    t.save()
    print(json.dumps({'owned':263,'reference_concepts':len(concepts),'coverage_files':len(t),'missing':missing},ensure_ascii=False))


def inspect(paths):
    t = load(str(OUT/'coverage.json'))
    for p in paths:
        fp = ROOT/p
        print('\nFILE', p, 'SHA256', digest(fp))
        for n, line in enumerate(fp.read_text().splitlines(), 1): print(f'{n:4}: {line}')
        found = next((i for i,r in enumerate(t.rows) if r['file_path']['$fmt'] == '${gitRoot}/'+p),None)
        if found is None:
            data = json.loads(fp.read_text())
            found = t.add({'file_path':{'$fmt':'${gitRoot}/'+p},'entry_owner':'reference-bounded-existing',
                          'entry_id':data.get('id',''),'source':{'selection':'候選兩端或直接配套'},
                          'mapping':'exact-current-repo-relative','kind':fp.parent.name,'read_level':'',
                          'sha256':digest(fp),'bytes':fp.stat().st_size,'mechanical_fields':list(data.keys()),'full_read_note':''})
        t.update(found, read_level='full-text',full_read_note='本輪以帶行號全文輸出親讀；未執行遊戲驗證')
        t.save()


if __name__ == '__main__':
    if sys.argv[1] == 'build': build()
    elif sys.argv[1] == 'inspect': inspect(sys.argv[2:])

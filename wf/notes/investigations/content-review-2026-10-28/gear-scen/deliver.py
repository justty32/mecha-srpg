"""將本線親讀判斷寫成 wf-table；來源維持只讀。"""
from review_work import *

C = 'content/base/'


def at(rel, fields, lines, quote):
    p = C + rel + '.json'
    t = load(str(OUT/'coverage.json'))
    r = next(r for r in t.rows if r['file_path']['$fmt'] == '${gitRoot}/'+p)
    assert r['read_level'] == 'full-text', p
    assert digest(ROOT/p) == r['sha256'], p
    return {'file_path': {'$fmt': '${gitRoot}/'+p}, 'fields':fields,
            'lines':lines, 'sha256':r['sha256'], 'read_level':'full-text', 'quote':quote}


def make():
    t = Table(str(OUT/'evidence.json'), columns=['id','status','classification','topic','side_a','side_b','support','similarity','difference','recommendation','confidence','confidence_limit'], meta={
        'contract':'wf-table/1','source':'README.md','extracted':'2026-10-28',
        'counts':{'confirmed_new_issues':0,'pending_new_rulings':0,'excluded':8,'candidate_groups':8},
        'selection':'主責263入口機械索引，逐欄定位新22概念使用舊gear配裝，以及與舊情境同獸系／同場景候選；全文裁定只限本表8組。',
        'line_semantics':'1-based，lines為含端點範圍；etymology含\\n但實檔常僅一行，字段可定位段落。',
        'baseline':'10/27 people C01–C16、content DUP-01–04/SER-01–03/SIZE-01–09已讀索引；P01與九槽、74–77及短場節奏不重開、不重新動態驗證。',
        'new_issues':[], 'new_rulings':[],
        'reviewer_sample':'S01（疊燈／燈腹過閘）為新跨批全文排除，建議領導抽核；兩端與直接物種／能力均已親讀。'})

    def add(key, cls, topic, a, b, support, same, diff, rec):
        t.add({'id':key,'status':'已排除','classification':cls,'topic':topic,
               'side_a':a,'side_b':b,'support':support,'similarity':same,'difference':diff,
               'recommendation':rec,'confidence':'高','confidence_limit':'僅對全文與靜態資料的差異有高信心；未做平衡、AI實戰、取得／市場或整合驗收。'})

    add('G01','同系列刻意換裝','BW-08不是BW-06換名；楔刃是正常配套',
        at('frames/wm-r7-bw08','$.bodyPlan / $.defaultLoadout / $.etymology',[6,57],'main-gun=fw-wedge-blade；母子交班後窗下相見'),
        at('frames/bulwark-caisson-01','$.bodyPlan / $.defaultLoadout / $.etymology',[6,57],'main-gun=mx-scatter-rune；堅盾公刻輪座守備'),
        [at('components/fw-wedge-blade','$.slot / $.size / $.abilities',[5,15],'weaponMount size1，沒有鳴刃反擊'),
         at('abilities/fw-wedge-blade-use','$.target / $.packets / $.essence / $.partAim',[21,58],'unit1格、pierce8、D、部位瞄準'),
         at('components/mx-scatter-rune','$.pools / $.abilities',[8,23],'散紋矢8發，mx-scatter-blast'),
         at('abilities/mx-scatter-blast','$.packets / $.target',[25,47],'ball1–3格 radius1，kinetic16'),
         at('world/models/wm-r7-bw08','$.frame / $.lineage / $.requires / $.exportPolicy',[3,18],'另立variant型錄，接堅盾公刻線')],
        '同D輪座、相同基礎屬性、燼池與自守；皆堅盾地方守備。',
        '新機失去範圍與3格射擊，改貼身部位瞄準；母親等兒子交班後親見的事件不在BW-06原文。不是新武器被重複創作。',
        '保留型號與既有楔刃引用；審閱時註明近戰守備換裝，不能把新名字當全面強化。')

    add('G02','同系列刻意變體','踏拍與開扇皆範圍鐵砧，但範圍形狀、骨架與敘事不同',
        at('frames/wm-r7-anvil-downbeat','$.bodyPlan / $.defaultLoadout / $.etymology',[6,57],'雙足；門鉤＋旋鉚鑿；奪回排練室後改在空地奏鼓'),
        at('frames/wn-r3-anvil-fan','$.bodyPlan / $.defaultLoadout / $.etymology',[6,58],'四足；扇潮矢筒＋熔齒鋸；試機院派工與修腿工錢'),
        [at('components/fw-door-sweep','$.size / $.abilities / $.etymology',[5,15],'小圓域降低閃避先手，不造地形障礙或擊退'),
         at('abilities/fw-door-sweep-use','$.costs / $.target / $.packets / $.effects / $.cooldown',[7,59],'3AP燼8，ball1格radius1，pierce5，m2-dragged，CD2'),
         at('components/fw-fan-tube','$.size / $.abilities',[6,15],'size2，fw-fan-tube-use'),
         at('abilities/fw-fan-tube-use','$.costs / $.target / $.packets / $.cooldown',[7,51],'4AP燼16，cone1–3格，energy12，CD2'),
         at('components/fw-rivet-drill','$.size / $.abilities',[6,15],'size2，fw-rivet-drill-use'),
         at('abilities/fw-rivet-drill-use','$.target / $.packets / $.effects / $.cooldown',[21,57],'unit1格pierce16，staggered，CD2')],
        '同C斷臂血統、相同燼池與鐵拳，共用排燼片且都有範圍掛件。',
        '踏拍是近鄰低傷削弱接單體鑿；開扇是3格扇射接貼身鋸。雙足與前足掛武器的四足風險不同。敘事分別是重回排練與勞務計價，沒有重複功勞。',
        '保留；門鉤與扇筒不互換成同一能力。兩掛件CD2的取捨留回家平衡，不把敘事鼓點當新技能。')

    add('G03','同系列刻意換裝','留像把伏架第二把傷害槍換成收捕件',
        at('frames/wm-r7-longspear-keepsake','$.etymology / $.defaultLoadout / $.innateAbilities',[5,60],'一把輝光連吼、一把扣足矢；同伴先打壞部位才補收捕；結尾合照'),
        at('frames/longspear-kneeler-v2','$.etymology / $.defaultLoadout / $.innateAbilities',[5,60],'四足雙槍伏架；輝光與紋刻兩類射擊'),
        [at('components/fw-ankle-pin','$.pools / $.abilities / $.etymology',[5,27],'拘束矢4發；物種捕捉部位條件仍須滿足'),
         at('abilities/fw-ankle-pin-use','$.costs / $.target / $.packets / $.effects',[7,38],'3AP一矢，1–3格，packets=[]，mx-netted'),
         at('components/mx-radiant-rifle','$.abilities',[9,11],'mx-radiant-shot'),
         at('components/mx-rune-rifle','$.pools / $.abilities',[8,23],'矢池12，mx-rune-shot'),
         at('abilities/mx-radiant-shot','$.costs / $.packets / $.target',[5,44],'流光15，energy22，1–7格'),
         at('abilities/mx-rune-shot','$.costs / $.packets / $.target',[5,45],'二矢，kinetic20，1–6格')],
        'C四足伏架、基礎屬性、雙池與架砲相同，左槍與靈目相同。',
        '原版兩把傷害槍提供資源分流；留像只有左槍輸出，右側零傷拘束是收尾用途。合照被獸架與修工擠入畫面的故事，不是原版配裝沿革。',
        '保留並標成捕捉協作換裝；不可把扣足矢敘述成自帶拆腿或繞過捕捉門檻。')

    add('G04','正常配套與同系列變體','同燈的同準靈目／送行煙燈不是拾痕換名',
        at('frames/wn-r3-surveyor-bearer','$.etymology / $.bodyPlan / $.defaultLoadout',[5,60],'六足；同準靈目與送行煙燈；聯隊搶功與支援工錢'),
        at('frames/wl-surveyor-trace','$.bodyPlan / $.defaultLoadout / $.etymology',[6,71],'雙足；千目、雙槍、冕環骸片與灰霧香；帶拓片與勘察員退回'),
        [at('components/fa-shared-bearing','$.slot / $.abilities',[5,15],'sensorMount，fa-lend-bearing'),
         at('components/fa-escort-lantern','$.slot / $.abilities',[5,15],'backMount size2，fa-cover-companion'),
         at('abilities/fa-lend-bearing','$.costs / $.cooldown / $.usesPerBattle / $.target',[3,29],'3AP，CD3，每戰2，0–4格單友'),
         at('abilities/fa-cover-companion','$.costs / $.cooldown / $.usesPerBattle / $.target',[3,29],'3AP，CD3，每戰2，0–3格單友'),
         at('effects/fa-aligned','$.clock / $.contribs',[3,23],'1 ownerTurn；accuracy+8、perception+3'),
         at('effects/fa-escorted','$.clock / $.contribs',[3,23],'2 ownerTurns；evasion+10、accuracy-5')],
        '同B測墟血統，兩者有遠射、觀測與煙護意象。',
        '同燈用3AP與有限次數替單友引準、借煙，煙護有準頭代價；拾痕保留雙槍與古代件共鳴門檻，故事是護勘撤回。場景與能力來源各有分工。',
        '保留同燈及兩件gear引用；介紹中明說照顧單友且非代受傷。勿將拆開的部件／能力／效果檔算四次創作重複。')

    add('G05','同用途不同取捨','停步索與扣足矢都拘束，但新配裝的用途不相同',
        at('components/fw-stayline','$.etymology / $.size / $.pools / $.abilities',[5,15],'size2，不耗矢，短距命中仍傷4'),
        at('components/fw-ankle-pin','$.etymology / $.size / $.pools / $.abilities',[5,27],'size1，4矢，零傷收捕'),
        [at('abilities/fw-stayline-use','$.costs / $.target / $.packets / $.effects',[7,45],'3AP燼8，1–2格，energy4，mx-netted'),
         at('abilities/fw-ankle-pin-use','$.costs / $.target / $.packets / $.effects',[7,38],'3AP一矢，1–3格，無傷，mx-netted'),
         at('frames/wn-r3-needlefish-stay','$.etymology / $.defaultLoadout',[5,47],'新留潮沿用停步索與鳴刃；人類交戰後拒殺、放棄斬首加錢'),
         at('frames/thirdblade-needlefish-ii','$.etymology / $.defaultLoadout',[5,47],'前代曲射／鳴鰭／標敵，側翼護船'),
         at('frames/wm-r7-longspear-keepsake','$.etymology / $.defaultLoadout',[5,13],'新留像補扣足矢前，先由同伴拆部位')],
        '同時帶capture/restraint、同施mx-netted；都被新七輪採作可換裝武器。',
        '停步索用燼換免實體矢，但有傷害且射程短；扣足矢有限彈、無傷、射程較長。留潮是近距拘束與停火取捨，留像是損獸條件完成後收捕。',
        '保留兩件與新機引用，不因同效果id合併。收捕適用性依物種條件，不能把免矢當無代價。')

    add('S01','跨批同骨架刻意變體','疊燈與燈腹過閘不是同一場景的重寫',
        at('species/wm-r7-folded-lamp','$.bodyPlan / $.abilities / $.etymology',[5,63],'同薄翼骨架；kx-wing-dive＋並翼；兩名夜巡者回船後談同住'),
        at('scenarios/fs-01-wing-lantern','$.brief / $.slots.enemy / $.objectives / $.etymology',[5,218],'母體＋兩燈腹；玩家與盟軍守區8輪，敵存活20輪；假想試機配置'),
        [at('species/lantern-keel','$.bodyPlan / $.abilities / $.aiProfile',[5,58],'同C骨架、屬性、池、捕捉與AI；舊主招低掠落珠'),
         at('abilities/kx-wing-dive','$.costs / $.target / $.packets / $.cooldown',[5,33],'3AP，1–4格pierce18，CD2'),
         at('abilities/kx-lantern-keel-drip','$.costs / $.target / $.packets / $.cooldown',[5,40],'3AP，1–4格acid16，CD0')],
        '薄翼、燈光與堤口警戒相似；疊燈沿用燈腹的骨架、併翼及AI。',
        '新種用穿刺主招取代連用酸擊，出現攻擊空窗；舊場景仍點名燈腹而非疊燈，目的為守橋8輪。新故事在交班後處理同住邀請，獸退是勤務背景，無守閘史實被重複宣稱。',
        '保留種與試機場；不自動換場景敵種，否則酸傷與空窗會改變原關卡。領導可優先抽核本組。')

    add('S02','跨批同骨架刻意變體','針扇與砂扇掃腳共享揚砂，仍有新增單體威脅與不同視角',
        at('species/wn-r3-pin-fan','$.bodyPlan / $.abilities / $.aiProfile / $.etymology',[5,63],'D扇腹骨架；飛針＋揚砂，reaper-vanguard；目擊簿對照兩份證詞'),
        at('scenarios/fs-01-fan-feet','$.brief / $.slots / $.objectives',[5,108],'砂扇2＋鉸蟹1；四足試機編隊；玩家eliminate，敵survive30'),
        [at('species/grit-fan','$.abilities / $.aiProfile',[41,57],'只揚砂，swarm-mite'),
         at('abilities/kx-brinepin-prick','$.costs / $.target / $.packets / $.cooldown',[5,40],'2AP，unit1–3格pierce8，CD0'),
         at('abilities/kx-grit-fan-scatter','$.costs / $.target / $.packets / $.cooldown',[5,41],'2AP，cone1–2格kinetic5，CD1')],
        '同D扇腹骨架、基礎屬性與AP；皆有地面扇砂。',
        '針扇多出能打分散目標的單體穿刺，AI也換為reaper-vanguard；舊試機場只列砂扇，不承擔新針雨證詞。新敘事核心是同一隻獸不同時間的目擊誤會與數量未核，不是再寫一場掃腳試機。',
        '保留；若未來加針扇試機，需另審部署與難度，不能把原砂扇場當新種已驗收。')

    add('S03','跨批同題材且正常四檔配套','鹽紗與酸光之外皆採菌撤人，不能據此合併',
        at('species/wl-salt-shroud','$.bodyPlan / $.pools / $.abilities / $.capture / $.etymology',[5,64],'mycel-stalk；9AP regen9；地衣縛足＋落珠；廢鹽棚撤工具後採收'),
        at('scenarios/fs-02-acid-dryline','$.brief / $.slots.enemy / $.objectives / $.etymology',[5,108],'枯爾納乾道採菌人背景；燈芯毯2＋蘆網1，玩家全殲、敵survive30'),
        [at('species/reed-lace','$.bodyPlan / $.pools / $.abilities / $.capture',[5,63],'蘆網骨架，6AP regen5，本能不增；絆步＋落珠，同harvest-only'),
         at('abilities/kx-root-snare','$.target / $.packets / $.effects',[8,29],'1–2格kinetic8並rooted'),
         at('abilities/kx-reed-lace-spit','$.target / $.packets',[14,29],'1–3格acid14'),
         at('abilities/kx-reed-lace-bind','$.target / $.packets / $.effects / $.cooldown',[14,41],'1–4格零傷，kx-reed-lace-caught，CD2'),
         at('monsters/wl-salt-shroud-c','$.species / $.grade',[2,8],'C個體指回鹽紗species'),
         at('frames/wl-bio-salt-shroud','$.pools / $.tags / $.burden',[11,35],'本能池、burden5，但harvest-only；只是活體配套佔位'),
         at('frames/wl-corpse-salt-shroud','$.pools / $.tags / $.burden',[11,24],'空池、corpse、burden0，同物種屍改配套')],
        '濕渠、酸珠、採菌人撤離及只採收題材相似，兩種均有落珠與不可捕條件。',
        '鹽紗換直柱骨架、較高行動池與近距有傷縛足，舊場景是蘆網及燈芯毯的乾道全殲試機，沒有宣告採到鹽紗。四檔是species、個體、活體佔位及屍改分工；活體不可捕與敘事收矢一致。',
        '保留，不把無法同時保核／破核當新bug或把四檔當四個概念。採收取得與屍改實作仍留既定接線／驗收，不以此靜態審閱宣布可取得。')
    t.save()
    print('evidence groups',len(t))


if __name__ == '__main__': make()

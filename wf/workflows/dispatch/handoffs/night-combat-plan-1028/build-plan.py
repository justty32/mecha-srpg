from pathlib import Path
import sys,json
sys.path.insert(0,'wf/tools')
from tabledb import load
root=Path('wf/workflows/dispatch/handoffs/night-combat-plan-1028')
t=load(str(root/'review.json'))
def files(slug):
 return [f'content/base/{kind}/night-ck-{slug}.json' for kind in ['species','bodyplans','monsters','abilities']]+[f'content/base/frames/night-ck-{prefix}-{slug}.json' for prefix in ['bio','corpse']]
def ability(slug,name,ap,kind,rmin,rmax,dmg):
 return dict(id='ability/night-ck-'+slug,name=name,mode='activated',costs=[dict(pool='ap',owner='person',amount=ap)],produces=[],require=[],target=dict(kind=kind,range=dict(min=rmin,max=rmax),los=True,friendly='no'),accuracy=0,packets=[dict(type='pierce',amount=dmg,armorPen=0,crit=0)],effects=[],cooldown=0,tags=['telegraph'],ai={'tactics':{'attack':1}})
a=ability('crookbow','斜弓送棘',4,'unit',3,7,20);a['tags']+=['alien','ranged'];a['essence']='C'
b=ability('keeljaw','沉顎銜節',5,'part',1,1,26);b['tags']+=['beast','melee'];b['essence']='B';b['packets'][0]['armorPen']=0.35;b['partAim']={'allowed':True,'penalty':10};b['ai']={'tactics':{'attack':1,'disable':0.8},'targetPref':{'parts':['locomotion','weaponMount','core']}}
common='species維持必填俗名name；B/C級monster不加個體name/epithet。gradeRange單一等級，telegraph:true，無molt/spawner/territorial；活捕frame只instinct、corpse無instinct且burden0，兩者innateAbilities與species一致、同新bodyplan、repair-or-replace。只展示，不接encounters/rifts/beasts/model/市場；不得把怪獸意識寫成person或寵物。'
rows=[{
'id':'CK01','批次':'CK','類別':'異形怪獸','名稱':'偏弓','白話':'一足撐起偏斜巨弓，棘光越過堤頭；獵機鑽入弓下，牠只能披鏡退步，無法近咬。','grade':'C','檔':files('crookbow'),
'引用':['ability/kx-mirror-turn','effect/kx-mirrored','ability/restrain','aiprofile/guerrilla'],
'輪廓用途':'地月落潮後伏在斷裂艦橋下的不對稱異形，一側弓冠高過獵團旗架，另一側垂鏡衣；遠距單點壓制、近距退避。斷唯一支足後仍能射，敵方若貼到1–2格才形成真正死角。弓冠不是裝配武器，不能捏造斷冠停射。',
'可執行設計':{'species':{'family':'alien','gradeRange':['C'],'baseAttrsByGrade':{'C':{'initiative':9,'perception':6,'accuracy':55,'evasion':8}},'abilities':['ability/night-ck-crookbow','ability/kx-mirror-turn'],'aiProfile':'aiprofile/guerrilla','capture':{'requireIntact':['core'],'requireBroken':['locomotion'],'ability':'ability/restrain','frame':'frame/night-ck-bio-crookbow'},'tags':['kaiju','alien']},'pools':'instinct min0 max100 initial20 regen5 hard inverted；ap min0 max8 initial8 regen8 hard非inverted；bands皆空','ability':a,'bodyplan':{'symmetry':'asymmetric','parts':[{'id':'bow','name':'偏弓冠','hp':[35,55],'types':['chitin','flesh'],'exposure':2,'functions':['weaponMount']},{'id':'low-core','name':'低懸核囊','hp':[60,40],'types':['flesh','organ'],'exposure':0.5,'functions':['core','cockpit']},{'id':'strut','name':'獨撐足','hp':[25,45],'types':['chitin','flesh'],'exposure':1,'functions':['locomotion']},{'id':'veil','name':'側鏡衣','hp':[30,40],'types':['chitin','flesh'],'exposure':2,'functions':[]},{'id':'tail','name':'垂聽尾','hp':[20,30],'types':['chitin','flesh'],'exposure':1,'functions':['sensor']}],'defaults':'最後一層才structural；ablative:true；resist僅bow/veil外層pierce:0.3，其他皆0；thermal全0；passThrough={}；onLayerBroken={}；onBroken/conduct=[]；非核slots=[]；核沿alien-spitter配置restraint2/cockpit1與pilot座。'},'frames':'新bio/corpse各C級，baseAttrs initiative9 perception6、無預裝件；bio burden6、instinct同species，corpse burden0 pools[]；標籤依bio-spitter/corpse-spitter換新俗名。','scope':common},
'代價弱點':'射擊min3無任何近戰或範圍擦邊招；兩格內只可用鏡衣、移動。唯一strut破掉後無法重新拉開；沒有衝鋒/瞬移。兩射花完8AP；鏡衣AP2與移動壓縮射擊。鏡衣提高evasion16而非反射傷害。',
'近似對照':[{'file':'content/base/species/spitter.json','same':'C異形遠射、貼近有死角','difference':'吐棘者單射min2＋球雨min2、三locomotion；本體min3只單射＋自護、唯一locomotion。2格距離由吐棘者仍能打改成完全無傷害招；斷一足即不能退。犧牲球雨換自護，不僅改傷害。'},{'file':'content/base/monsters/exk-spine-rack.json','same':'新匯入遠射具有min3','difference':'背針B保留range1–2推擊及護友、遠招是線；偏弓C無貼身補招、無護友、只單點，逼近是完整攻擊死角而非只避新招。'},{'file':'content/base/species/hollow-sail.json','same':'異形游擊及自護','difference':'空帆既有投擲＋側掠與其部位；偏弓不沿用投擲/側掠，採unit min3攻擊、單足失移動與鏡衣protect。'}],
'AI證據':['src/rules/command.ts:80-92 對unit檢distance>=min，兩格確實不合法，不用line擦近敵。','src/ai/policies/tactical.ts:101-140 產生unit/self候選並checkAbility；guerrilla是既有tactical profile，退避是否有效須自然AI驗證。','src/rules/movement.ts:15-18 任一完整locomotion才能移動；本體只有strut。src/rules/command.ts:24起 innate不隨bow broken消失。'],
'數值帶':{'HP':380,'parts':5,'core':1,'C_HP_band':'300–480','damage':'20/AP4=5；C12–20及AP3–4內；不加命中增益','comparison':'吐棘者380HP、單射18/AP3且有範圍；本案380HP、單射較慢、死角大，用鏡衣與唯一足的取捨補辨識度。'},
'取得':'可拘束但未接營運取得；獨立新species所以捕後新bio保持此能力/骨架，不用partsOverride回原型。','驗證':'CK共同方案：自然出生AP8、無預置鏡衣；AbilityUsed須見新射擊與既有鏡衣；記從遠射到貼近後退/無傷害候選、strut斷後仍有遠射但不能移動。'},
{
'id':'CK02','批次':'CK','類別':'獸族怪獸','名稱':'沉顎','白話':'重顎咬住的是機甲關節，群吼卻會吃掉下一口的餘力；獵團聽見吼聲才敢換列。','grade':'B','檔':files('keeljaw'),
'引用':['ability/kx-star-howl','effect/kx-pack-frenzy','ability/restrain','aiprofile/kx-beast-alpha'],
'輪廓用途':'四足脊獸，重顎垂近甲板、背稜像翻覆艦龍骨。以指定部位的單次重咬逼獵機換列；行進間群吼提高群體準頭。不是推人、搬運、撕下裝備或自動斷肢；不承諾一咬拆件。',
'可執行設計':{'species':{'family':'beast','gradeRange':['B'],'baseAttrsByGrade':{'B':{'initiative':8,'perception':7,'accuracy':60,'evasion':8}},'abilities':['ability/night-ck-keeljaw','ability/kx-star-howl'],'aiProfile':'aiprofile/kx-beast-alpha','capture':{'requireIntact':['core'],'requireBroken':['locomotion','manipulator'],'ability':'ability/restrain','frame':'frame/night-ck-bio-keeljaw'},'tags':['kaiju','beast']},'pools':'instinct min0 max100 initial25 regen7 soft inverted；ap min0 max7 initial7 regen5 hard非inverted；bands皆空','ability':b,'bodyplan':{'symmetry':'bilateral','template':'新bodyplan沿beast-shelf-back五部位形狀、層型、槽/座/函數及resist；不使用既有bodyplan id，不連動修改棧背。','parts':[{'id':'heart','name':'背下核','hp':[60,80,160],'types':['chitin','flesh','organ'],'exposure':0.5,'functions':['core','cockpit']},{'id':'back','name':'翻艦背稜','hp':[100,100],'types':['chitin','flesh'],'exposure':2,'functions':[]},{'id':'jaw','name':'沉顎','hp':[100,140],'types':['chitin','flesh'],'exposure':2,'functions':['manipulator']},{'id':'forefeet','name':'前足','hp':[50,80],'types':['chitin','flesh'],'exposure':1,'functions':['locomotion']},{'id':'hindfeet','name':'後足','hp':[50,80],'types':['chitin','flesh'],'exposure':1,'functions':['locomotion']}],'defaults':'沿beast-shelf-back每層resist/passThrough/結構標記；back外層kinetic0.5、其他chitin kinetic0.3，pierce/thermal/acid/energy皆0；最後層才structural，核restraint2/cockpit1與pilot座。'},'frames':'新bio/corpse各B，baseAttrs initiative8 perception7；bio burden8、instinct同species；corpse burden0 pools[]；能力同species，無預裝件。','cycle':'原生max7，所以5AP重咬＋3AP群吼同回合不可能；若重咬剩2，下次regen5回7。先吼剩4則當回合不能重咬；最多留2AP走近再咬。捕後AP改走駕駛人物池，不聲稱生物機甲仍有原生7AP限制。','scope':common},
'代價弱點':'重咬限定part、penalty10；沒有一般unit攻擊逃過瞄準懲罰。range1、每回合最多一咬；群吼沒有傷害。厚顎提高活捕破manipulator成本，但顎破不封innate咬：這是引擎限制，文字不得誤導。雙足都破才能失移動；全身只有heart是死亡核。',
'近似對照':[{'file':'content/base/species/shelf-back.json','same':'B四足重獸＋同伴支援','difference':'棧背24/AP4、range1–2 unit、9AP可兩次攻擊且護友；沉顎26/AP5、range1限定part且penalty10、7AP/regen5，群吼與咬不能同回合，護身改為群體準頭。背層減120、顎加120，總HP維持1000。'},{'file':'content/base/monsters/exk-spine-rack.json','same':'同為棧背相近五部位骨架','difference':'背針在原species上疊線射並保留推擊護友；沉顎是新species僅指定部位咬＋群吼，零遠攻零護友、不保留棧背招，捕後也不回棧背。'},{'file':'content/base/monsters/exk-cinder-muzzle.json','same':'獸族顎與移動部位代價','difference':'燼吻C疊扇面、後腿唯一locomotion；沉顎B雙足都能走、無範圍/熱傷，主差異是瞄準和AP競爭。'}],
'AI證據':['src/ai/policies/tactical.ts:121-135：partAim.allowed必需；targetPref.parts明列locomotion/weaponMount/core，否則非致命部位可能不生成候選。','src/rules/command.ts:90-92 強制part且完整部位；src/rules/attack.ts:22-31固定套瞄準penalty；layers.ts:26 armorPen逐層分流，不等於無視全部甲直接命中核。','src/rules/pools.ts:82-86 instinct將owner:person成本轉單位池，109-120加regen並夾max；因此7AP上限與5回復真正在原生怪獸生效。','aiprofile/kx-beast-alpha tactical attack1 buff0.8；自然群吼/咬選擇待驗，不預設AI懂得留AP。'],
'數值帶':{'HP':1000,'parts':5,'core':1,'B_HP_band':'800–1400','damage':'26/AP5=5.2，B上緣26/AP3–5帶內；armorPen0.35、固定瞄準-10；無額外效果','comparison':'棧背1000HP、24/AP4、AP9/9；本體總HP相同但背甲減120、顎增120，輸出次數少、狙部位較穩定但不是保證命中。'},
'取得':'可拘束、獨立新species與bio/corpse；僅展示。駕駛AP不同造成捕後節奏差異明列，不能宣稱原生戰鬥數據等於駕駛後。','驗證':'CK共同方案：自然7AP、無預放狂奔；新咬須AI AbilityUsed含part欄，另記群吼一次。每次列AP前後與命中，避免把射不中看成招未選；純1v1不是群吼完整效益證明。'}]
for row in rows:
 if not t.find(id=row['id']): t.add(row)
t.save()
write_rows=[]
for row in t.rows:
 for f in row['檔']: write_rows.append({'batch':row['批次'],'concept':row['id'],'path':f,'id':f.split('/')[-2].rstrip('s')+'/'+Path(f).stem})
# species plural is invariant; abilities plural has irregular spelling
mapping={'abilities':'ability','bodyplans':'bodyplan','species':'species','frames':'frame','components':'component','monsters':'monster','scenarios':'scenario'}
for r in write_rows:r['id']=mapping[r['path'].split('/')[-2]]+'/'+Path(r['path']).stem
for batch,slug in [('CM','night-cm-yard-bells'),('CK','night-ck-broken-keel')]:write_rows.append({'batch':batch,'concept':'showcase','path':f'content/base/scenarios/{slug}.json','id':'scenario/'+slug})
p=root/'write-sets.json';p.write_text(json.dumps({'contract':'wf-table/1','source':'PLAN.md','extracted':'2026-10-28','columns':['batch','concept','path','id'],'rows':[]},ensure_ascii=False,indent=2)+'\n')
w=load(str(p))
for r in write_rows:w.add(r)
w.save()

"""只整理本輪已親自全文核讀的判斷，禁止用來將索引自動升格為全文。"""
import sys,json,hashlib
from pathlib import Path
from audit import ROOT,OUT,save_table
from tabledb import load
cov=load(str(OUT/'coverage.json'))
seen={r['file_path']['$fmt'].split('${gitRoot}/',1)[1]:r for r in cov.rows}
pairs=[]
def item(no,l,r,lf,rf,similar,difference,kind,recommendation='保留兩端；本輪無需內容修改。',support=()):
 for f in [l,r,*support]:assert seen[f]['read_level']=='full_text',f
 def loc(f,fields):
  ls=(ROOT/f).read_text().splitlines()
  result=[]
  for field in fields:
   line=next(i for i,s in enumerate(ls,1) if '"'+field+'"' in s)
   value=json.loads((ROOT/f).read_text()).get(field)
   quote=value[:130] if isinstance(value,str) else json.dumps(value,ensure_ascii=False)[:150]
   result.append({'field':'$.'+field,'line':line,'excerpt':quote})
  return result
 pairs.append({'id':f'W{no:02}','status':'已排除','kind':kind,'confidence':'高（限這組排除判斷）','left_path':{'$fmt':'${gitRoot}/'+l},'left_sha256':seen[l]['sha256'],'left_fields':loc(l,lf),'right_path':{'$fmt':'${gitRoot}/'+r},'right_sha256':seen[r]['sha256'],'right_fields':loc(r,rf),'similarity':similar,'difference':difference,'recommendation':recommendation,'support':[{'file':f,'sha256':seen[f]['sha256'],'read_level':'full_text'} for f in support]})
L='content/lore/'; B='content/base/'
item(1,L+'factions/wn-r2-empty-crown-circle.json',L+'factions/dome-households.json',['scale','summary','body','relations'],['scale','summary','body'], '月面家族、宴廳、受僱管事與金錢各歸各家；新對bigfill文字排序最高0.0420。','穹頂住戶是三股資本的匿名群像；空冠社是少數後輩借廳聚會，收桌爭執呈現反叛仍依賴家財。明示不代表所有住戶、沒有家產支配權，沒有新增統一領導。','正常配套')
item(2,L+'places/wm-r5-nostos-gift-table.json',L+'places/ferry-nostos.json',['region','world','status2108','body'],['kind','status2108','body'],'同一望鄉號、弦月班船、三天航程。','母檔描述船班、分艙與拒載；換禮角是既有乘客艙可收的小桌，情節為返鄉禮物換到自己捨不得送。未增新船、新航路或取消拘束艙禁令。','正常配套')
item(3,L+'places/wm-r5-sendai-rain-drum.json',L+'places/mumbai-resonant-wall.json',['status2108','summary','body'],['status2108','summary','secrets','body'],'地方停留空間、來客互動；新對bigfill文字相似度0.0376。','雨鼓長棚是仙台居民的普通樂器合奏與獨奏意願摩擦；聽壁是孟買門外看紫光的朝聖停留地，迦梨歸屬只列傳聞。活動、物件、地理與超常性皆不同，沒有同一事蹟。','詞彙候選排除')
item(4,L+'factions/wn-r2-sunken-arrow-hunters.json',L+'factions/old-arms-makers.json',['scale','summary','body','relations'],['scale','summary','body'],'凡鐵對人、拆件銷售與修造生意，明示彼此交易。','舊廠是多地企業合稱，供貨無共同軍隊；沉矢是雪梨的受託拆械獵團，具體衝突在整砲被私留轉賣、銷毀承諾和拆件盈餘。它只有受託範圍，不取得全港繳械權。','正常配套')
item(5,L+'places/wm-r5-almaty-blind-books.json',L+'factions/wm-r6-turning-page-caravan.json',['status2108','summary','body'],['scale','summary','body'],'跨第五/六輪，同在阿拉木圖、普通讀物與讀者自行評說。','書閣是固定借還場所，主人與客人對小說品味不合；巡書隊是多組車輛送修和輪讀，人員衝突在搬工失去說書中心地位。讀書活動相連，經營形式與衝突不能互換。','功能互補')
item(6,L+'factions/wm-r6-joined-eaves.json',L+'factions/wm-r6-open-step-workers.json',['scale','summary','body'],['scale','summary','body'],'新非人物lore二字集合排序最高Jaccard=0.0607814761；共備木料/工具、輪值出工、地方許可與未竟改造。','合簷處理整街遮雨與院內採光，留兩翼、拆中央；開階處理手推椅選座和散場通行，守坡板到最後一人離開、永久改階未定。城市、服務對象、材料動作及利益衝突不同。','同題材候選排除')
item(7,B+'frames/wl-anvil-cable.json',B+'frames/wn-r3-anvil-fan.json',['bodyPlan','defaultLoadout','etymology'],['bodyPlan','defaultLoadout','etymology'],'跨第一/三輪，鐵砧II、斷臂血統、相同燼池和勢力。','斷纜是雙足樁/鳴刃近接救出同伴，工人仍要解纜；開扇是四足扇潮矢筒/熔齒鋸，試機情節爭扇面產能與前足檢修工時。型錄前置分別anvil-ii與anvil-trestle-ii，月份2/5，並非同機改名。','同系列',support=[B+'world/models/wl-anvil-cable.json',B+'world/models/wn-r3-anvil-fan.json'])
item(8,B+'frames/wn-r3-anvil-fan.json',B+'frames/wm-r7-anvil-downbeat.json',['bodyPlan','defaultLoadout','etymology'],['bodyPlan','defaultLoadout','etymology'],'跨第三/七輪，同級、同斷臂血統及燼池。','開扇四足、扇射與鋸擊、試工談價；踏拍雙足、門鉤與旋鉚鑿，街區反攻後排練室損毀，改在空地奏鼓。骨架、武具、戰場意圖和情感後果均不同。型錄均明示variant/restricted。','同系列',support=[B+'world/models/wn-r3-anvil-fan.json',B+'world/models/wm-r7-anvil-downbeat.json'])
item(9,B+'frames/wl-surveyor-trace.json',B+'frames/wn-r3-surveyor-bearer.json',['bodyPlan','defaultLoadout','etymology'],['bodyPlan','defaultLoadout','etymology'],'跨第一/三輪，同測墟B、多目血統、護勘與流光池。','拾痕為雙足、千目與雙連吼、古代冕環的共鳴門檻仍在；同燈六足、同準靈目與送行煙燈，以放棄自身出手機會協助友軍，情節是兩隊爭工錢。不能因同血統/護勘用途合併。','同系列',support=[B+'world/models/wl-surveyor-trace.json',B+'world/models/wn-r3-surveyor-bearer.json'])
item(10,B+'species/wl-slant-veil.json',B+'species/wm-r7-riven-torch.json',['bodyPlan','gradeRange','abilities','etymology'],['bodyPlan','gradeRange','abilities','etymology'],'跨第一/七輪，異形、偏披/亮衣與裸臂意象、同stalker AI。','斜帷B級alien-mirror，凝視脈衝與裸手撕裂，敘事重鏡衣裸側及量身拘束；裂炬C級breakwater-clinger，撕裂配遠芒，敘事重敵對獵團臨時合擊與旗位。不是成長前後階段，也無同一具個體衝突。','同族意象排除')
item(11,B+'species/wl-gravel-mane.json',B+'species/wn-r3-turning-foam.json',['bodyPlan','pools','abilities','aiProfile','etymology'],['bodyPlan','pools','abilities','aiProfile','etymology'],'跨第一/三輪，C級獸族，同基礎四項數值並共用foam-jaw-foam。','礫鬃是hound骨架、鏟撞+蝕沫、pack-hunter、守岸拒追；旋沫split-fin骨架、蝕沫+尾擺、guerrilla、本能soft/AP恢復不同，情節是棄採樣匣而撤離。共享一招不等於同戰術或同故事。','刻意變體')
item(12,B+'species/wm-r7-folded-lamp.json',B+'species/lantern-keel.json',['bodyPlan','abilities','aiProfile','etymology'],['bodyPlan','abilities','aiProfile'],'同C級蟲族燈腹骨架、基礎屬性/池/bodyguard AI及gather招。','疊燈第一招為wing-dive；舊燈腹為lantern-keel-drip。疊燈另有夜巡搭檔邀住的具體新敘事。屬共用骨架的招式變體，未達必須合併的語義重複。','刻意變體','保留。只證明資料與敘事有差異；一招差異是否足夠豐富實戰，留整合試玩，不能在本輪代判已平衡。')
item(13,B+'species/wm-r7-riven-torch.json',B+'species/breakwater-clinger.json',['bodyPlan','abilities','etymology'],['bodyPlan','abilities','capture'],'同C級抱樁骨架、屬性/池/AI及rend招。','裂炬第二招hollow-sail-cast；抱樁為breakwater-clinger-drag。新敘事不是舊名稱重貼，而是敵隊爭旗中遭異形打斷。沒有改寫舊種或宣稱級別蛻變。','刻意變體','保留招式變體；實戰辨識度與平衡尚未驗，不把它另開為已證實重複。')
item(14,B+'species/wl-salt-shroud.json',B+'species/stalk.json',['gradeRange','abilities','capture','tags','etymology'],['gradeRange','abilities','capture'],'同菌柱骨架、root-snare、C級基礎數值與mycel-creep AI。','鹽紗只C、根縛+落珠，明示harvest-only和只能採收；菌柱含C/B、根縛+spore-fog且捕獲條件為斷行走。鹽紗core同時要求完好與打壞是封住活捕的表達，敘事與tags一致，不能只因存在bio配套frame就判已可活捕。','刻意變體','保留；本輪只確認內容自洽，不宣稱引擎對harvest-only的動態行為已測。',support=[B+'frames/wl-bio-salt-shroud.json',B+'frames/wl-corpse-salt-shroud.json'])
item(15,L+'places/wl-alpine-common-hearth.json',L+'places/alpine-shell.json',['region','status2108','body'],['kind','status2108','body'],'同阿爾卑斯、家族獵場/學會/圍籬與護衛；新lore對參照文字排序高。','之墟母檔描述家族地契、入場費與封閉墟口；共爐房在圍籬外提供短宿/補靴，濕學徒坐長凳的衝突不解除地契、未開新墟口。把場所活動深化，不是遺跡重建一份。','正常配套')
item(16,L+'places/wn-r2-accra-cross-banner-ground.json',L+'events/accra-open-throat.json',['status2108','summary','body'],['date','consequences','body'],'新對bigfill文字相似度0.0385；阿克拉戰後家屬、讓路與各人自主。','城門放聲是2107-12返城隊越門影，機甲挪出可見天空的通道；墓圃是守區弔唁認屍，各家拆分勝旗、保留敵我旗色，明示不承認另一方政權。場所用途與具體事件不同，不是改名重述。','詞彙候選排除')
pairs[13]['intent_source']={'file':'wf/workflows/dispatch/handoffs/lead-world-life-1027/monsters/REPORT.md','line':73,'excerpt':'鹽紗 capture 要 core 同時 intact、broken，條件互斥，故不可捕；bio frame 是必要配套佔位。'}
save_table('evidence.json',['id','status','kind','confidence','left_path','left_sha256','left_fields','right_path','right_sha256','right_fields','similarity','difference','recommendation','support'],pairs,counts={'confirmed':0,'pending_decision':0,'excluded':len(pairs)},limits='排除僅對這組候選；沒有全庫審完、動態驗收或歷史修復重驗的含義。')
print('evidence_groups',len(pairs))

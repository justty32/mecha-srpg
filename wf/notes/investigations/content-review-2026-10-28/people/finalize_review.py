import json,sys,collections,re,hashlib
from pathlib import Path
sys.dont_write_bytecode=True
sys.path.insert(0,'/mnt/c/code/mine/mecha-srpg/wf/notes/investigations/content-review-2026-10-28/people')
from review_work import ROOT,OUT,SOURCES,rows,table,sha,fmt,load
# All named candidate endpoints were personally read in full in this session.
# a,b,similarity,difference,anchors for each original body,reason for retaining.
PAIRS=[
('wl-amalia-quispe','nayra-sullca','基多工務；成年人是否肯承認不會。','阿瑪莉亞是2066生退役母親，摘兒子店招舊像、向學徒重學扣座；奈拉是2094生未上機學徒，指出救援接件錯誤後仍直接舉手。','叫學徒再做一遍','不是這一枚','保留兩人；學習、年齡、家庭權力與救援功能均不同。'),
('wl-choi-eunsol','wm-r4-bae-hyeonju','同在釜山民間舞臺爭取觀眾，涉及海報與身分。','崔擅用別人的殘肢售票，學員退出後她自行頂場；裴用自己的布獸技藝爭演出與署名，角色紅了而臉仍被遮。','替那條空褲管描了金邊','下一張海報能不能','保留；不能把同地表演都判為利用傷者，也不推定兩人同戲班。'),
('wl-marta-riedler','bruno-azzari','阿爾卑斯山區、內海獵場、碎石坡與勘測者退路。','瑪爾塔是領工錢的嚮導，誇大捷徑後撤回賞錢並步行繞路；布魯諾是新手駕駛，塌石時靠機甲抵崖讓勘測者撤走。','捷徑是自己吹的','練習機靠上崖壁','保留；地理與職業生態共用，具體危機與主要行動不同。'),
('wl-mateo-yupanqui','wn-r2-lin-cangxu','實物圖像與權威版本遭他人挑戰；作者保留自負。','馬特奧的石屋課圖不適用蘆葦村，漏雨後向學生學綁繩；林是有償模型匠，兩種交火姿勢互不作證，仍同時收費。','請孩子再綁一次','沒有用一件替另一件作證','保留；教學適用性與戰史委託的證據爭議不同。'),
('wl-nico-bellini','tessa-rinaldi','熱那亞工坊手藝，工人對自身本事的自負。','尼科磨刃但主要行動是輸投環後自製有利手勢的環再押酒錢；泰莎是外派技師，以補片修回肩甲，已到新加坡接活。','更合自己的手勢','自己的補片按上去','保留；競技小心機與修理救機沒有事蹟衝突。'),
('wl-park-doyun','han-bora','同在慶州古陵外接觸普通來客。','朴是草坡雜役，扣球抵香架損失並鎖球；韓是修鼓人，骸片光下把鼓交還喪親訪客，結構關係連金河娜。','布球鎖進工具櫃','把鼓交還','保留；同地生活圈不等於同一角色，朴文無聽見裏側或改動處容的說法。'),
('wn-r2-tang-wanling','eira-vey','月面富戶廳堂、侍役與有限職權。','唐是婚宴席次承攬者，拆椅、重訂價單並挪配偶送花線；艾拉是領薪管事，實際托住滑幕救同伴且無放款補償權。','兩份價單分開','沒有家族的繼承權','保留；一為婚姻席次與生意衝突，一為受僱者救工。'),
('wn-r2-lin-cangxu','seo-haegyeom','戰爭如何被塑成可看的英雄姿態。','林承接兩種小景並置售賣，不決斷交火真相；徐是守城當事人，在自己的像上掛同伴姓名，仍被換班期待綁住。','底下都留自己的署名','姓名牌一塊塊掛到石肩','保留；作者交易與當事人記憶／輪守不同，非同一雕像事件。'),
('wn-r2-zawadi-mbeki','wl-choi-eunsol','替他人身體做可見形象、個人審美與收入。','札瓦迪成稿先問角鱗露多少，以客人端碗共同試裁，最後爭衣樣獨用權；崔擅用傷腿宣傳，學員抗議退出。札瓦迪舊提案的宣傳抗議動作已被改掉。','量衣時先問對方想露多少','為何不先問他','保留現稿；不拿已退回創作方案當現行重複。'),
('wn-r2-adjoa-senyo','meera-naik','姓名名冊、自己的責任或信念使他人受損，結尾未和解。','阿喬亞在換俘桌被叫破假名，交筆跡但不能證實失蹤者去向；米拉記領湯者名字，因教義拒鐵偶糧與機魂名字，仍在施粥。','寫下自己當年的姓名與筆跡','若說話的是機魂','保留；名冊只是共同物件，換俘責任與施粥排斥的行動鏈不同。'),
('wn-r2-elsie-morrow','zhou-suyan','地圖需要面對現地、舊線不能當最終答案。','艾爾西雙圖皆為本人畫，為親族偏私封路，在田界重走但無裁地權；周是撤退導航，擦去被蝕吞路、示意人群撤離。','兩邊都有她的落款','擦去已被蝕吞掉的一段','保留；日常田權與獸災撤離沒有相同人物或功勞。'),
('wn-r2-maia-raukura','shen-yanqiao','物件傷痕、來歷、費用與自己能證明的界線。','瑪伊雅按打撈約保有普通船鐘，與後人爭歸屬；沈為古代殘片刮漆辨貨，只認原傷而不保證認主或座標。','打撈約壓在畫旁','只簽認親眼見到的原傷','保留；鐘的私有／共同保管與殘片鑑定不等價。'),
('wm-r4-sandro-veiga','kweku-danquah','阿克拉船廚、整體食物拆分與食客。','桑德羅主動參加甜點造型評比，作品塌掉仍按原件受評、散點另賣；奎庫戰時供收容所及傷員熱食，現到吉大港候雇。','也要照原來那件評','傷員衝進廚棚','保留；成名欲與供餐救傷目的不同，不以分食物直接判重。'),
('wm-r4-sandro-veiga','anja-vestli','船廚將一整份食物分給多人。','桑德羅把碎甜船做商品並繼續競技造型；安雅在2090撤站末船撕最後麵餅讓末位先吃，兼醫護且無靠核心不老。','稱了幾包脆餅與糖片','讓排在最末的人先咬一口','保留；有償競賽失敗後的銷售不是撤站配給救援。'),
('wm-r4-mina-voss','wn-r2-tang-wanling','月面伴侶、椅子安排、望地長廊；均保留未滿足。','米娜想與難得渡月的伴侶同看花期，返程已知且花晚開；唐處理他人聯姻席圖，自己的配偶選側門使她改工作線。','已知道還剩幾晚','圖上的送花線挪開','保留；親密相聚錯期與職業控制／個人選席不同，無隱瞞傷勢或同一婚宴。'),
('wm-r4-noura-sayegh','bruno-azzari','好奇、找線索，結局未得到完整答案。','努拉是普通舊書攤主，改公開謎卡終點，錯過對手留續題；布魯諾面對遺跡亮骸片，先救人，辭職試駕守備。','下一道題寫在背面','那道光留在記憶裡','保留；匿名遊戲與古墟未知不是同一神祕事件，也沒有解答裏側。'),
('wm-r4-inez-duarte','juma-kiprop','想選同伴與航向、獵團及船的組織。','伊內絲尚無船、以普通空架試合作且只有一修工約下回；朱瑪2103出洋後已是軛騎團長，負責拘束艙與匯款。','仍沒有自己的船','騎手後來聚成遠牧','保留；籌組野心與既成獵團營運是不同階段，無新團已成立的宣稱。'),
('wm-r4-inez-duarte','molly-van-den-berg','港口團隊、分工、船與團長的期待。','伊內絲借場演練被候選人分派搬架，未成團；茉莉已有約25機與鹽婆，改嚴合約且到一小時必撤。','一個修工的位置','到點必撤','保留；失衡的小召集與成熟獵團規矩不重複，不重開已修一小時規矩。'),
('wm-r4-song-jaeyun','wl-amalia-quispe','成年子女與父母的控制、日常手上技藝。','宋是民船領航想獨釣，父親跟去雙方暗比並空桶回家；阿瑪莉亞是退役母親摘舊像、到兒子店重學扣座，仍擺正工具盒。','父親已把另一根釣竿靠在門邊','工具盒推回桌角','保留；視角、職業、主要欲望與結果不同，父子未被寫成母子換名。'),
('wm-r4-song-jaeyun','seo-haegyeom','仁川工作者想休假，日常責任妨礙私人時間。','宋已休假且和父親釣魚，沒有戰鬥或核心履歷；徐是現役守備領隊，假紙未送、仍查紀念像姓名牌。','中午兩隻桶都空','休假紙還沒送出去','保留；一為家庭陪伴與暗競賽，一為公共英雄期待，無搶同場功勞。'),
('wn-r2-adjoa-senyo','sahen-darim','戰爭之後的交接、受害者要求與未原諒的立場。','阿喬亞需對錯列死者與不追查負責，俘虜由家屬當面辨認；薩赫恩是斷橋倖存者，載兩岸傷員但留回程空船位且不原諒炸橋。','改由家屬逐個上前辨認','仍不原諒炸橋','保留；翻譯責任與渡船糧傷取捨不同，沒有把新短約改成城邦外交史。'),
('wl-nico-bellini','marta-bellini','熱那亞工坊、相同Bellini姓氏，金屬手藝。','尼科2080生磨刃工，投環吃敗仗後磨新環；瑪塔2061生受雇總匠，核款核印出貨，文中僅明示自己與雇主無血親。','再押上自己的酒錢','沒有替港城免帳的權力','保留；姓名、年齡、職務與主要行動均不同，不從同姓推定親屬或重複。'),
('wn-r2-elsie-morrow','wn-r2-maia-raukura','爭議物的兩種來歷／文件、本人有偏向，無自動返還或和解。','艾爾西持本人兩版田界圖，涉及共用步道與親族新門；瑪伊雅持有效打撈約與後人舊畫，爭一口可敲的鐘，願共同保管而不移交。','繩尺還橫在門底','鐘留在岸上','保留；共用權與私人遺物、現地重測與共同敲鐘的行動鏈可辨。'),
('wn-r2-tang-wanling','wn-r2-lin-cangxu','最高二字集合相似候選：月面有償手藝、兩份安排／展桌、顧客爭議。','唐拆婚宴連座保留本人選席，主要衝突是聯姻外觀與同意；林不刪任一款戰史小景，衝突是互異見聞與商業作者自負。','桌旗倒已熨得筆直','兩張桌上投下不同的影子','保留；共享群像基調及付費未解的結構，具體情境與主行動不同。')]
# One anchor above is in a summary rather than body: retain correct field automatically.
def side(name,anchor):
 p=f'content/lore/characters/{name}.json'; raw=(ROOT/p).read_text(); d=json.loads(raw)
 field='body' if anchor in d.get('body','') else 'summary'
 if anchor not in d.get(field,''): raise ValueError((name,anchor))
 lines=raw.splitlines(); ln=next(i for i,x in enumerate(lines,1) if re.match(r'\s*"'+field+r'"\s*:',x))
 return {'content_path':fmt(p),'id':d['id'],'name':d['name'],'sha256':sha(p),'read_level':'full','field':field,'line':ln,'anchor':anchor,'all_fields_read':True}
# Summary anchor is stated slightly differently in the original; exact anchor only.
PAIRS[21]=tuple('自己的酒錢壓住布角' if x=='再押上自己的酒錢' else x for x in PAIRS[21])
E=table('evidence.json',['id','status','classification','confidence','a','b','similarity','difference','recommendation','origin'],{'candidate_limit':50,'confirmed_new_issues':0,'pending_new_decisions':0,'prior_baseline':'10/27 P01/P02 and old C01-C16 excluded from this increment; old content candidates not reopened'})
for i,(a,b,s,d,aa,ab,rec) in enumerate(PAIRS,1):
 E.add({'id':f'PE{i:02}','status':'已排除','classification':'不同人物／主行動不同','confidence':'高','a':side(a,aa),'b':side(b,ab),'similarity':s,'difference':d,'recommendation':rec,'origin':'本輪原檔全文重判；新人物與舊批／新人物跨批，不複製10/27舊16組'})
E.save()
C=load(str(OUT/'coverage.json')); have={x['content_path']['$fmt'].removeprefix('${gitRoot}/'):x for x in C.rows}
for folder in ['content/lore/characters','content/base/persons']:
 for q in sorted((ROOT/folder).glob('*.json')):
  p=str(q.relative_to(ROOT))
  if p not in have:
   d=json.loads(q.read_text()); C.add({'content_path':fmt(p),'content_id':d.get('id',''),'ownership':'reference','source_rows':[],'read_level':'mechanical','sha256':sha(p),'bytes':q.stat().st_size,'notes':'人物參照庫：姓名／別名／正文二字索引，未逐句審閱'}); have[p]=C.rows[-1]
full={f'content/lore/characters/{x}.json' for pair in PAIRS for x in pair[:2]}
full.update(['content/base/world/backgrounds/temilade-akinwale.json','content/base/world/recruit-pools/singapore-savanna-pilots.json'])
for p in full:
 have[p]['read_level']='full'; have[p]['notes']='本人完整讀取本輪現行JSON；字段／行號見evidence' if '/lore/' in p else '本人讀取全字段配套樣本；不作重複人物候選'
for p,v in have.items():
 if '/base/world/recruit-pools/' in p: v['ownership']='pilots-companion-reference'
 elif '/base/world/backgrounds/' in p: v['notes']='148組背景配套；依person欄對應，不假定背景與人物同檔名' if v['read_level']!='full' else v['notes']
 elif v['read_level']!='full': v['notes']='只解析、索引及映射；未逐句審閱'
# Separate source-table fingerprints from content coverage rows.
C.meta.update({'full_files':len(full),'mechanical_files':len(C.rows)-len(full),'content_files':len(C.rows),'primary_mapping_files':536,'pilot_group_files':444,'recruit_pool_references':40,'increment_people':18,'lore_library_files':289,'base_person_library_files':186,'new_name_alias_collisions':0,'new_missing_lore_references':0,'source_tables':[{'table':p,'sha256':sha(p),'rows':len(rows(p))} for p in SOURCES.values()],'baseline_tables':[{'table':p,'sha256':sha(p),'rows':len(rows(p))} for p in ['wf/notes/investigations/content-review-2026-10-27/people.json','wf/notes/investigations/content-review-2026-10-27/content.json']],'head_at_review':'013d51c34f07841128f918228b2e9cc73371f967','pair_selection':'18新人物×其餘288 lore計算二字集合Jaccard，top2僅機械排序；加入姓名職業及創作線最相近索引，保留24組全文候選。new crossbatch PE01,PE03,PE10等均不在舊C01-C16。','matching':'來源列檔名逐一映射536現行檔，缺檔0；背景148個person引用與148 base person一對一；148 lore gameRefs全對齊；40招募池sources聯集恰涵蓋148背景。','limits':'其他全文未讀的舊人物、背景及招募池不宣稱語義完成；無事件年表閉包或全庫設定稽核。'})
C.save()
print('evidence',len(E.rows),'full',len(full),'coverage',len(C.rows),'mechanical',len(C.rows)-len(full))
print('bytes',sum(p.stat().st_size for p in OUT.iterdir() if p.is_file()))

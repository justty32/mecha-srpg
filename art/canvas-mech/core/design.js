import { transform } from './math.js';
import { applyCompactRevision } from './revision.js';

// 全新局部配置；數字僅分配工作包絡，不是輪廓或美術路徑。
const spec = (key, name, purpose, width, height, x = 0, y = 0, children = [], material = 'structure', extra = {}) => ({
  key, name, purpose, size: { width, height }, localTransform: transform(x, y),
  envelope: { x: -width/2, y: -height/2, width, height },
  usableBounds: { x: -width/2+Math.min(2,width/8), y: -height/2+Math.min(2,height/8), width: width-2*Math.min(2,width/8), height: height-2*Math.min(2,height/8) },
  pivot: { x: 0, y: 0 },
  attachments: { center: { x: 0, y: 0 }, top: { x: 0, y: -height/2 }, bottom: { x: 0, y: height/2 }, left: { x: -width/2, y: 0 }, right: { x: width/2, y: 0 } },
  material, children, ...extra,
});
const leaf = (key, name, purpose, w, h, x = 0, y = 0, material = 'armor', extra = {}) => spec(key, name, purpose, w, h, x, y, [], material, extra);
const group = (key, name, purpose, w, h, x, y, children, extra = {}) => spec(key, name, purpose, w, h, x, y, children, 'structure', extra);

function torso() {
  return group('torso','軀幹','容納駕駛艙、腰部及背面散熱',350,470,-10,-100,[
    group('chest','胸艙','低頭弧胸的艙體分配',330,240,0,-100,[
      group('frame','承力框組','銜接胸樑、側肋與肩座',300,200,0,0,[
        leaf('beam','胸樑','跨接胸艙左右主負載',240,28,0,-45,'structure'),
        leaf('rib','側肋','支撐艙殼側緣',32,135,-112,5,'structure'),
        leaf('shoulder-seat','肩座','將肩軸荷重導入胸樑',62,72,112,-35,'structure'),
      ]),
      group('shell','外殼組','容納弧甲與下緣防護面',320,220,0,5,[
        leaf('arc','中央弧甲','弧胸主要防護包絡',190,144,-10,-20),
        leaf('side','側甲','胸艙側邊防護',64,155,119,-2),
        leaf('lower','下緣面','保護胸腹交界',215,34,-5,84),
      ]),
    ]),
    group('waist','腹腰','提供胸髖轉接與腹部防護',240,140,0,115,[
      group('rotation','旋接組','承受腰部旋接負載',210,114,0,-5,[
        leaf('ring','腰環','胸腰旋轉承面',180,24,0,-38,'structure'),
        leaf('segment','腹節','保留屈伸行程',64,67,0,12,'structure'),
        leaf('link','連桿','維持腹節兩端相對行程',18,76,72,5,'structure'),
      ]),
      group('armor','護甲組','保護旋接邊緣',230,130,0,0,[
        leaf('abdomen','腹甲','覆蓋腹節正面',117,88,-15,3),
        leaf('hip-side','髖側片','保護髖部外緣',56,92,84,12),
      ]),
    ]),
    group('back','背散熱','分配後掠散熱鰭及管路',330,400,0,-10,[
      group('support','支架組','承受散熱組重量',260,310,0,0,[
        leaf('spine','背樑','背部負載匯流',45,260,0,5,'structure'),
        leaf('fin-seat','鰭座','固定散熱鰭根部',220,36,0,-100,'structure'),
      ]),
      group('thermal','散熱組','熱流出口與散熱表面',310,370,0,0,[
        leaf('fin','後掠鰭','後掠散熱鰭工作區',112,290,-91,-10,'copper'),
        leaf('duct','導管','將熱流導向鰭根',28,250,61,8,'copper'),
        leaf('vent','排氣口','排出背部熱流',72,46,91,148,'structure'),
      ]),
    ]),
  ]);
}

function head() {
  return group('head','頭','前側固定低頭感測配置',150,140,-25,-382,[
    group('sensor-pod','感測艙','容納頭部光學',138,88,0,-18,[
      group('optics','光學組','保護鏡組並提供感測開口',126,74,0,0,[
        leaf('housing','鏡艙殼','光學保護外殼',122,70,0,0),
        leaf('lens','光學窗','前向感測開口',60,16,-15,7,'amber'),
      ]),
    ]),
    group('neck-seat','頸座','頭部載重轉接',76,43,0,46,[
      group('mechanism','頸機構','限制頭頸轉動',64,35,0,0,[
        leaf('axis','頸軸','頭部俯仰支承',23,31,-14,0,'structure'),
        leaf('collar','頸套','頸軸外圍承面',25,27,17,0,'structure'),
      ]),
    ]),
  ]);
}

function hand() {
  const fingers = [
    ['thumb','拇指',-41,10,25,49], ['index','食指',-5,15,29,58], ['grip','握指',33,15,29,58],
  ].map(([key,name,x,y,w,h]) => group(key,`${name}總成`,'提供獨立握持接觸',w,h,x,y,[
    group('mechanism','指節機構','容納指殼、軸及接觸面',w-2,h-2,0,0,[
      leaf('shell','指殼','指節外部防護',w-6,h-8,0,0),
      leaf('axle','指軸','指節轉動承面',w-8,7,0,-h/2+8,'structure'),
      leaf('belly','指腹','握持接觸面',w-8,h/2,0,h/4-3,'structure'),
    ]),
  ]));
  return group('hand','手','三指夾持與腕部轉接',136,90,8,175,[
    group('palm-wrist','掌腕組','掌面與腕環傳遞握持力',110,43,0,-22,[
      leaf('palm','掌芯','分配三指握力',95,26,0,3,'structure'),
      leaf('wrist','腕環','前臂至掌面的旋接',65,11,0,-14,'structure'),
    ]), ...fingers,
  ]);
}

function arm(side) {
  const near = side === 'near';
  return group(`arm-${side}`,near?'近臂':'遠臂','肩至手的功能分層',180,470,near?240:-235,near?-70:-90,[
    group('shoulder','肩','肩軸與獨立浮甲',144,120,0,-165,[
      group('axis','軸組','肩關節承力',95,86,0,0,[
        leaf('hub','肩軸轂','肩部轉動中心',53,57,-9,0,'structure'),
        leaf('bearing','肩承環','肩部徑向承面',23,70,30,0,'structure'),
      ]),
      group('floating-armor','浮甲組','肩軸外側活動防護',138,100,0,-2,[
        leaf('plate','肩浮甲','獨立畫序的肩部護面',131,92,0,0),
      ]),
    ]),
    group('upper','上臂','傳遞肩肘負載',108,134,0,-55,[
      group('load','承力組','上臂主承力構造',80,124,0,0,[
        leaf('spar','上臂樑','肩肘之間傳力',26,116,-16,0,'structure'),
        leaf('actuator','上臂驅動','提供屈肘驅動',23,99,20,5,'structure'),
      ]),
      group('shell','甲殼組','保護上臂驅動',102,127,0,0,[
        leaf('plate','上臂甲','上臂外殼工作區',96,119,0,0),
      ]),
    ], { attachments: { center:{x:0,y:0}, top:{x:0,y:-67}, bottom:{x:0,y:67}, 'rod-left':{x:-20,y:55}, 'rod-right':{x:20,y:55} } }),
    group('forearm','肘前臂','肘鉸、雙連桿與前臂防護',124,148,5,70,[
      group('hinge','鉸組','容納肘部旋接',83,33,0,-52,[
        leaf('axle','肘軸','肘部旋轉承面',74,27,0,0,'structure'),
      ]),
      group('rods','雙桿組','以兩端接點驅動成對連桿',104,68,0,-38,[
        leaf('left','左連桿','上臂至肘前臂左側連接',Math.hypot(5,45),8,-22.5,-9.5,'structure',{localTransform:transform(-22.5,-9.5,Math.atan2(45,5)*180/Math.PI)}),
        leaf('right','右連桿','上臂至肘前臂右側連接',Math.hypot(5,45),8,17.5,-9.5,'structure',{localTransform:transform(17.5,-9.5,Math.atan2(45,5)*180/Math.PI)}),
      ]),
      group('armor','護甲組','保護前臂下半段',116,62,0,40,[
        leaf('plate','前臂甲','前臂主要防護面',109,57,0,0),
      ]),
    ], { pivot:{x:0,y:-52}, attachments: { center:{x:0,y:0}, top:{x:0,y:-74}, bottom:{x:0,y:74}, 'rod-left':{x:-20,y:-25}, 'rod-right':{x:20,y:-25}, equipment:{x:20,y:25} } }),
    hand(),
  ]);
}

function leg(side) {
  const near = side === 'near';
  return group(`leg-${side}`,near?'近腿':'遠腿','髖至足的功能分層',200,440,near?111:-117,280,[
    group('thigh','髖股','髖接、股框與護甲',142,150,0,-132,[
      group('joint','接組','髖部負載轉接',107,48,0,-46,[leaf('socket','髖接','髖部旋接承面',99,40,0,0,'structure')]),
      group('frame','框組','股部承力樑',79,112,0,16,[leaf('spar','股框','將髖負載傳至膝',70,104,0,0,'structure')]),
      group('armor','甲組','股部外層防護',134,135,0,2,[leaf('plate','股甲','保護股部主框',125,126,0,0)]),
    ], {pivot:{x:0,y:-46}}),
    group('shin','膝脛','寬脛的鉸、伸縮及護甲',159,170,0,24,[
      group('hinge','鉸組','膝關節支承',119,40,0,-60,[leaf('axle','膝軸','承受膝部彎曲負載',111,32,0,0,'structure')]),
      group('telescope','伸縮組','提供膝脛伸縮行程',91,116,0,14,[leaf('strut','脛伸縮桿','連接膝部與踝部',82,108,0,0,'structure')]),
      group('armor','甲組','寬脛外側防護',151,153,0,4,[leaf('plate','寬脛甲','獨立畫序的寬脛護面',143,145,0,0)]),
    ], {pivot:{x:0,y:-60}}),
    group('foot','足','踝、跟與分趾支撐',190,94,4,165,[
      group('ankle','踝組','脛足轉接',86,38,0,-23,[leaf('joint','踝接','足部俯仰承面',78,30,0,0,'structure')]),
      group('heel','跟組','後側支撐',58,42,-58,9,[leaf('pad','跟墊','足跟承壓面',50,34,0,0,'structure')]),
      group('toes','分趾組','三趾分配前足支撐',115,49,33,19,[
        leaf('inner','內趾','內側前足支撐',29,41,-37,0),
        leaf('middle','中趾','中央前足支撐',29,45,0,0),
        leaf('outer','外趾','外側前足支撐',29,38,37,0),
      ]),
    ], {pivot:{x:0,y:-23}}),
  ]);
}

function equipment() {
  return group('equipment','裝備','近側楔盾與遠側短砲',920,500,0,-30,[
    group('shield','盾','分瓣楔盾功能分層',196,276,330,7,[
      group('mount','臂接組','前臂與盾架之間的安裝',90,82,-37,0,[leaf('coupler','盾臂接','將盾負載傳回前臂',82,74,0,0,'structure')]),
      group('frame','骨架組','盾面承力',167,244,0,0,[
        leaf('spine','盾中樑','縱向盾面主負載',30,232,0,0,'structure'),
        leaf('brace','盾橫撐','分配分瓣甲荷重',153,26,0,-24,'structure'),
      ]),
      group('shell','分瓣甲組','分配三瓣楔面防護',188,268,0,0,[
        leaf('center','中瓣甲','盾面中央防護',78,254,0,0),
        leaf('inner','內瓣甲','盾面靠臂側防護',46,215,-65,8),
        leaf('outer','外瓣甲','盾面外緣防護',46,224,65,-5),
      ]),
    ]),
    group('cannon','短砲','遠側短砲功能分層',222,168,-315,70,[
      group('grip','握持組','手掌與砲體耦合',62,64,38,46,[leaf('handle','砲握把','將短砲固定於遠手',54,56,0,0,'structure')]),
      group('receiver','機匣組','砲體核心容納區',137,103,25,-7,[leaf('case','砲機匣','保護砲體機構',129,95,0,0)]),
      group('rail','導軌組','短砲上側導向',167,27,-14,-56,[leaf('guide','砲導軌','保持機匣與砲口對位',159,19,0,0,'structure')]),
      group('muzzle','口組','短砲前端開口',45,68,-86,-3,[leaf('rim','砲口緣','短砲前端保護承面',37,60,0,0,'structure')]),
    ]),
  ]);
}

export function createReefHawkBaseDesign() {
  const root = group('root','礁鷹','固定前側 3/4 的完整分層配置',1120,1120,560,560,[torso(),head(),arm('far'),arm('near'),leg('far'),leg('near'),equipment()]);
  const rigOverrides = {};
  const links = [];
  for (const side of ['far','near']) {
    const a = `root.arm-${side}`, l = `root.leg-${side}`;
    rigOverrides[`${a}.shoulder`] = { limits:{min:-85,max:90} };
    rigOverrides[`${a}.upper`] = { parentId:`${a}.shoulder` };
    rigOverrides[`${a}.forearm`] = { parentId:`${a}.upper`, limits:{min:-5,max:125} };
    rigOverrides[`${a}.hand`] = { parentId:`${a}.forearm` };
    rigOverrides[`${l}.thigh`] = { limits:{min:-65,max:65} };
    rigOverrides[`${l}.shin`] = { parentId:`${l}.thigh`, limits:{min:0,max:90} };
    rigOverrides[`${l}.foot`] = { parentId:`${l}.shin`, limits:{min:-45,max:45} };
    for (const rod of ['left','right']) links.push({ nodeId:`${a}.forearm.rods.${rod}`, start:{nodeId:`${a}.upper`,attachmentId:`rod-${rod}`}, end:{nodeId:`${a}.forearm`,attachmentId:`rod-${rod}`}, restLength:Math.hypot(5,45) });
  }
  rigOverrides['root.equipment.shield'] = { parentId:'root.arm-near.forearm' };
  rigOverrides['root.equipment.cannon'] = { parentId:'root.arm-far.hand' };
  return {
    id:'reef-hawk-2108',
    view:{projection:'fixed-front-three-quarter',width:1120,height:1120,features:['低頭弧胸','後掠散熱鰭','寬脛分趾','近側楔盾','遠側短砲']},
    palette:{armor:{id:'armor',base:'#e0dac9',role:'骨白甲'},structure:{id:'structure',base:'#38313f',role:'深紫灰內構'},copper:{id:'copper',base:'#698c7b',role:'氧化銅散熱'},amber:{id:'amber',base:'#e7ad4b',role:'琥珀光'}},
    root, rigOverrides, links,
    poses:{
      idle:{id:'idle',angles:{}},
      'shield-aim':{id:'shield-aim',angles:{'root.arm-near.shoulder':-65,'root.arm-near.forearm':95,'root.arm-far.shoulder':24,'root.arm-far.forearm':60}},
      'low-brace':{id:'low-brace',angles:{'root.leg-near.thigh':-25,'root.leg-near.shin':60,'root.leg-near.foot':-30,'root.leg-far.thigh':-12,'root.leg-far.shin':25,'root.leg-far.foot':-12}},
    },
  };
}

export function createReefHawkDesign() {
  return applyCompactRevision(createReefHawkBaseDesign());
}

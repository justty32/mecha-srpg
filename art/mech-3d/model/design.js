import {refineDesign} from './refinement.js';
import {group as g,mechanism as m,hull as h,cylinder as c,materials} from './spec.js';
import {torso,head} from './design-torso.js';
import {arm,leg} from './design-limbs.js';
function equipment(){return g('equipment','裝備',[0,2.25,.2],[4.2,2.3,1.4],[
 g('shield','左臂盾',[-1.50,.20,.05],[1.18,1.7,.90],[
  m('mount','盾接架組',[1.1,.6,.8],[h('coupler','盾臂承接架',[.25,0,-.12],[.52,.32,.38],'frame','frame')]),
  m('frame','盾承力組',[.9,1.6,.5],[h('spine','盾中央背架',[0,0,0],[.78,1.42,.20],'frame','frame')]),
  m('shell','盾面組',[1.1,1.65,.65],[
   h('center','盾中央拱甲',[0,0,.16],[.66,1.50,.22],'ceramic','arch'),
   h('left','盾左護翼',[-.36,-.02,.08],[.30,1.23,.32]),
   h('right','盾右護翼',[.36,-.02,.08],[.30,1.23,.32]),
  ]),
 ],{rigParent:'root.arm-left.forearm'}),
 g('staff','右手短杖',[1.12,-.32,-.07],[.8,1.9,.8],[
  m('grip','握持組',[.35,.55,.35],[c('handle','杖握柄',[0,0,0],.09,.48,'y','rubber')]),
  m('body','杖承力組',[.4,1.5,.4],[c('shaft','短杖主幹',[0,.21,0],.075,1.24,'y','steel')],[0,0,0],{boundsCenter:[0,.15,0]}),
  m('ends','杖端組',[.8,1.75,.8],[
   h('head','杖首重殼',[0,.72,0],[.49,.42,.49],'frame','arch'),
   h('pommel','杖尾配重',[0,-.45,0],[.23,.22,.23],'red'),
  ],[0,0,0],{boundsCenter:[0,.15,0]}),
 ],{boundsCenter:[0,.18,0],rigParent:'root.arm-right.hand'}),
]);}
export function createDesign(){return refineDesign({
 id:'heng-yue',version:'1.0.0',materials,
 root:g('root','衡岳',[0,0,0],[5.6,5.2,3.4],[torso(),head(),arm('left'),arm('right'),leg('left'),leg('right'),equipment()],{boundsCenter:[0,2.4,0]}),
 poses:{idle:{},guard:{'root.arm-left':-25,'root.arm-left.forearm':-60,'root.arm-right':15,'root.arm-right.forearm':-45},low:{'root.leg-left':-15,'root.leg-right':-15,'root.leg-left.shin':35,'root.leg-right.shin':35,'root.arm-left.forearm':-30}},
});}

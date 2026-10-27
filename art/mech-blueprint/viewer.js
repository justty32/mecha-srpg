(() => {
  'use strict';
  const data=window.BLUEPRINT, $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg';
  const partial=data.attachments.length<data.orders.orders.length;
  const state={mode:partial?'layout':'assembled',selected:null,hidden:new Set(),solo:null,t:0,playing:false};
  const nodes=new Map(data.layout.nodes.map(n=>[n.id,n])), attachments=new Map(data.attachments.map(a=>[a.id,a]));
  const slots=new Map(data.slots.slots.map(s=>[s.id,s]));
  const bind=data.poses.poses.find(p=>p.id==='bind')||{id:'bind',angles:{}};
  const poses=data.poses.poses.filter(p=>p.id!=='bind');
  const labels={'raise-left':'抬左臂','elbow-left':'屈左肘','knee-left':'屈左膝','raise-right':'抬右臂','elbow-right':'屈右肘','knee-right':'屈右膝'};
  poses.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=labels[p.id]||p.id;$('pose').append(o);});
  function svg(tag,attrs={}) {const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));return e;}
  const mt=m=>`matrix(${m.join(' ')})`;
  function region(parent,r,m,color,fill='none',width=1.5) {for(const p of r){parent.append(svg('polygon',{points:p.map(v=>transformPoint(m,v).join(',')).join(' '),fill,stroke:color,'stroke-width':width,'vector-effect':'non-scaling-stroke'}));}}
  function dot(parent,p,color,r=4) {parent.append(svg('circle',{cx:p[0],cy:p[1],r,fill:color,stroke:'#061018','stroke-width':1}));}
  function ancestor(id,target) {let n=nodes.get(id);while(n){if(n.id===target)return true;n=nodes.get(n.parent);}return false;}
  function visibleLayout(id) {let n=nodes.get(id);if(state.solo&&!ancestor(id,state.solo))return false;while(n){if(state.hidden.has(n.id))return false;n=nodes.get(n.parent);}return true;}
  function visible(slot) {return visibleLayout(nodes.has(slot.semantic)?slot.semantic:attachments.get(slot.attachment)?.layout);}
  function select(id) {state.selected=id;$('selection-title').textContent=id||'選取附件';const a=attachments.get(id),s=data.slots.slots.find(s=>s.attachment===id),order=data.orders.orders.find(o=>o.id===id||o.slot===s?.id);$('selection').textContent=a?JSON.stringify({source:a.source,bone:s?.bone,origin:[0,0],viewBox:a.viewBox,contacts:a.contacts,role:order?.role,material:order?.material},null,2):(nodes.get(id)?JSON.stringify(nodes.get(id),null,2):'點選機體或結構樹。');document.querySelectorAll('[data-select]').forEach(b=>b.classList.toggle('selected',b.dataset.select===id));draw();}
  function tree(parent,parentId) {data.layout.nodes.filter(n=>n.parent===parentId).forEach(n=>{const wrap=document.createElement('div');wrap.className='tree-node';const line=document.createElement('div');line.className='tree-line';const check=document.createElement('input');check.type='checkbox';check.checked=true;check.dataset.visibility=n.id;check.setAttribute('aria-label',`顯示 ${n.id}`);check.onchange=()=>{check.checked?state.hidden.delete(n.id):state.hidden.add(n.id);draw();};const button=document.createElement('button');const a=data.attachments.find(a=>a.layout===n.id);button.dataset.select=a?.id||n.id;button.textContent=`${{machine:'◆',major:'▣',assembly:'◇',part:'·'}[n.level]} ${n.id}`;button.onclick=()=>select(a?.id||n.id);line.append(check,button);wrap.append(line);const child=document.createElement('div');child.className='tree-children';tree(child,n.id);wrap.append(child);parent.append(wrap);});}
  tree($('tree'),null);$('part-count').textContent=`${data.attachments.length}/${data.orders.orders.length} ATTACHMENTS`;
  function target(){return data.poses.poses.find(p=>p.id===$('pose').value)||bind;}
  function draw() {
    const pose=interpolatePose(bind,target(),state.t), worlds=worldMatrices(data.rig.bones,pose), matrices=slotMatrices(data.slots.slots,worlds),stage=$('stage');stage.replaceChildren();
    const exploded=state.mode==='exploded';$('canvas').setAttribute('viewBox',exploded?'0 0 1850 1550':`0 0 ${data.design.canvas.width} ${data.design.canvas.height}`);
    if(state.mode==='layout'){
      data.layout.nodes.filter(n=>n.level!=='machine'&&visibleLayout(n.id)).forEach(n=>region(stage,n.envelope,frameMatrix(n.frame,worlds),n.level==='part'?'#7ee9cf':'#caa473',n.level==='part'?'#488f8720':'#d99d4520',n.level==='major'?3:1));
    } else data.order.base.forEach((id,i)=>{
      const slot=slots.get(id);if(!slot||!visible(slot))return;const a=attachments.get(slot.attachment), fragment=data.fragments[slot.attachment];if(!a||!fragment)return;
      const holder=svg('svg');holder.innerHTML=fragment;let root=null;
      for(const el of [...holder.children]) {if(el.id===`${a.id}--${a.element}`) root=el;stage.append(el);}
      if(!root)return;const m=exploded?explodedMatrix(a.viewBox,i):matrices[id];
      root.setAttribute('transform',mt(m));root.dataset.attachment=a.id;root.classList.toggle('selected',state.selected===a.id);root.addEventListener('click',()=>select(a.id));
      if(exploded){const label=svg('text',{x:(i%8)*220+110,y:Math.floor(i/8)*180+170,'text-anchor':'middle',fill:'#9bbcc9','font-size':12});label.textContent=a.id;stage.append(label);}
      if($('envelopes').checked||state.selected===a.id) {const w=data.orders.orders.find(o=>o.slot===slot.id);if(w)region(stage,w.localEnvelope,m,'#6febd2');}
      if($('contacts').checked||state.selected===a.id){dot(stage,transformPoint(m,[0,0]),'#ffce79',5);a.contacts.forEach(c=>dot(stage,transformPoint(m,c.at),'#f5a8e8',3));}
    });
    if($('skeleton').checked&&!exploded)for(const b of data.rig.bones){const m=worlds[b.id],p=transformPoint(m,[0,0]),end=transformPoint(m,[0,b.length]);stage.append(svg('line',{x1:p[0],y1:p[1],x2:end[0],y2:end[1],stroke:'#f8d888','stroke-width':3,'vector-effect':'non-scaling-stroke'}));dot(stage,p,'#f8d888',6);}
    if($('envelopes').checked&&!exploded&&attachments.has(state.selected)){const a=attachments.get(state.selected),s=data.slots.slots.find(s=>s.attachment===a.id);if(s)for(const sample of sampleTransition(bind,target(),21)){const m=slotMatrices([s],worldMatrices(data.rig.bones,sample))[s.id];region(stage,a.occupancy,m,'#72d9ea30','#72d9ea06',.5);}}
    if(!exploded)for(const d of data.diagnostics){if(!d.region)continue;if(d.pose&&d.pose!==target().id&&!(state.t===0&&d.pose==='bind'))continue;if(d.sample!==undefined&&Math.abs(d.sample-Math.round(state.t*20))>0)continue;region(stage,d.region,identity(),'#ff645f','#ff463b65',2);}
    $('progress').value=String(Math.round(state.t*1000));$('time').textContent=`${Math.round(state.t*100)}%`;
    $('mode-label').textContent=(partial?'PARTIAL · ':'')+{assembled:'ASSEMBLED / 組裝',layout:'CONFIGURATION / 配置',exploded:'ATTACHMENTS / 獨立分件'}[state.mode];
    window.__blueprintState={mode:state.mode,selected:state.selected,pose:target().id,progress:state.t,hidden:[...state.hidden],solo:state.solo,playing:state.playing};
  }
  function pause(){state.playing=false;$('play').textContent='播放';}
  document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{state.mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw();});
  ['skeleton','envelopes','contacts'].forEach(id=>$(id).onchange=draw);
  $('restore').onclick=()=>{state.hidden.clear();state.solo=null;document.querySelectorAll('[data-visibility]').forEach(c=>c.checked=true);draw();};
  $('solo').onclick=()=>{const a=attachments.get(state.selected);state.solo=a?.layout||state.selected;draw();};
  $('pose').onchange=()=>{pause();state.t=matchMedia('(prefers-reduced-motion: reduce)').matches?1:0;draw();};
  $('progress').oninput=()=>{pause();state.t=Number($('progress').value)/1000;draw();};
  $('bind').onclick=()=>{pause();state.t=0;draw();};
  let previous=0;
  function tick(now){if(!state.playing)return;const duration=data.poses.sequence.find(s=>s.to===target().id)?.duration||1500;state.t=Math.min(1,state.t+(now-previous)/Math.max(100,duration));previous=now;if(state.t===1)pause();draw();if(state.playing)requestAnimationFrame(tick);}
  $('play').onclick=()=>{if(state.playing){pause();draw();return;}if(matchMedia('(prefers-reduced-motion: reduce)').matches){state.t=1;draw();return;}if(state.t===1)state.t=0;state.playing=true;$('play').textContent='暫停';previous=performance.now();requestAnimationFrame(tick);};
  const errors=data.diagnostics.filter(d=>d.severity==='error');$('validation-status').textContent=errors.length?`${partial?'未完成 · '+data.attachments.length+'/'+data.orders.orders.length+' 件 · ':'未通過 · '}${errors.length} 項問題（紅區或缺件清單）`:`通過 · ${data.attachments.length} 件來源 / 指定動作 21 點診斷`;$('validation-status').classList.toggle('error',errors.length>0);
  for(const d of data.diagnostics){const li=document.createElement('li'),button=document.createElement('button');button.textContent=`[${d.code}] ${d.ids.join(', ')} · ${d.message}${d.pose?` / ${d.pose} #${d.sample??0}`:''}`;button.onclick=()=>{pause();if(d.pose&&poses.some(p=>p.id===d.pose))$('pose').value=d.pose;state.t=(d.sample??0)/20;select(d.ids.find(id=>attachments.has(id))||d.ids[0]);};li.append(button);$('diagnostics').append(li);}
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));draw();
})();

// 僅將葉內的標準化筆畫換算成局部座標；不呼叫 transform/scale/rotate。
export function trace(ctx, source, bounds) {
  const t = source.match(/[MLQCZ]|-?(?:\d*\.)?\d+/g) ?? [];
  const point = (i) => [bounds.x + Number(t[i]) * bounds.width, bounds.y + Number(t[i+1]) * bounds.height];
  let i = 0;
  ctx.beginPath();
  while (i < t.length) {
    const command = t[i++];
    if (command === 'Z') { ctx.closePath(); continue; }
    const arity = {M:2,L:2,Q:4,C:6}[command];
    if (!arity) throw new Error(`Unknown path token ${command}`);
    let first = true;
    while (i < t.length && !/^[MLQCZ]$/.test(t[i])) {
      if (i + arity > t.length) throw new Error('Truncated leaf path');
      const args = [];
      for (let k=0;k<arity;k+=2) args.push(...point(i+k));
      if (command === 'M' && first) ctx.moveTo(...args);
      else if (command === 'M' || command === 'L') ctx.lineTo(...args);
      else if (command === 'Q') ctx.quadraticCurveTo(...args);
      else ctx.bezierCurveTo(...args);
      i += arity; first = false;
    }
  }
}
function polygon(ctx, points, b) { trace(ctx, `M ${points} Z`, b); }
function ellipse(ctx,b,x,y,rx,ry,fill,stroke) {
  ctx.beginPath(); ctx.ellipse(b.x+x*b.width,b.y+y*b.height,rx*b.width,ry*b.height,0,0,Math.PI*2);
  if(fill) {ctx.fillStyle=fill;ctx.fill();} if(stroke) {ctx.strokeStyle=stroke;ctx.stroke();}
}
function line(ctx,b,path,color,width) { trace(ctx,path,b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke(); }
const tones = {
  armor:['#faf4de','#e0dac9','#b3b3aa','#696875'],
  structure:['#9b96a3','#51495d','#38313f','#171624'],
  copper:['#c2c29c','#799b8e','#4d746e','#294448'],
  amber:['#fff8d0','#f7ce71','#e7ad4b','#92512c'],
};
export function paintProfile(ctx, job, profile, state = {}) {
  const b=job.localGeometry.bounds, s=Math.min(b.width,b.height);
  const palette=tones[job.material.id];
  const stroke=Math.max(.35,Math.min(1.6,s*.025));
  ctx.save();
  try {
    // 葉 bounds 硬邊界也約束高亮和光暈；不裁祖先的靜止區域。
    ctx.beginPath();ctx.rect(b.x,b.y,b.width,b.height);ctx.clip();
    ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=stroke;
    const base=ctx.createLinearGradient(b.x,b.y,b.x+b.width,b.y+b.height*.7);
    base.addColorStop(0,palette[0]);base.addColorStop(.25,job.material.base);base.addColorStop(.66,palette[2]);base.addColorStop(1,palette[3]);
    trace(ctx,profile.outline,b);ctx.fillStyle=base;ctx.fill();
    ctx.save();trace(ctx,profile.outline,b);ctx.clip();
    // 體積暗面與各零件專屬稜面，不額外拆成假零件。
    const shade=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.height);
    shade.addColorStop(0,'rgba(10,9,24,0)');shade.addColorStop(.55,'rgba(10,9,24,0.03)');shade.addColorStop(1,'rgba(10,9,24,0.54)');
    ctx.fillStyle=shade;ctx.fillRect(b.x,b.y,b.width,b.height);
    polygon(ctx,profile.ridge,b);
    const facet=ctx.createLinearGradient(b.x,b.y,b.x+b.width*.7,b.y+b.height);
    facet.addColorStop(0,palette[0]);facet.addColorStop(.6,palette[1]);facet.addColorStop(1,palette[2]);
    ctx.fillStyle=facet;ctx.fill();ctx.strokeStyle=job.material.id==='armor'?'#fff5dd':'#a8a5b0';ctx.lineWidth=stroke*.5;ctx.stroke();
    for(const seam of profile.seams) {
      line(ctx,b,seam,'rgba(20,19,32,.65)',stroke*1.5);
      line(ctx,b,seam,'rgba(183,183,183,.35)',stroke*.45);
    }
    details(ctx,b,profile.detail,stroke,job,state);
    ctx.restore();
    trace(ctx,profile.outline,b);ctx.strokeStyle='#171723';ctx.lineWidth=stroke;ctx.stroke();
    if(state.selected || state.highlighted) {
      trace(ctx,profile.outline,b);ctx.strokeStyle='#ffe6a4';ctx.lineWidth=Math.max(1.1,stroke*1.8);ctx.stroke();
    }
  } finally { ctx.restore(); }
}
function details(ctx,b,type,w,job,state) {
  ctx.lineWidth=w;
  switch(type) {
    case 'hub': case 'socket':
      ellipse(ctx,b,.51,.52,.29,.31,'#211e2b','#b0a7ad');
      ellipse(ctx,b,.51,.52,.21,.23,'#534b60','#151522');
      ellipse(ctx,b,.51,.52,.11,.13,'#797480','#b1a6a4');
      line(ctx,b,'M .41 .41 L .60 .61','#272234',w); break;
    case 'bearing':
      line(ctx,b,'M .26 .31 Q .56 .48 .77 .29','#c2b9bb',w);
      line(ctx,b,'M .23 .69 Q .55 .88 .78 .67','#171420',w*1.3);break;
    case 'axle':
      ellipse(ctx,b,.23,.50,.11,.30,'#2b2536','#a79ea9');
      ellipse(ctx,b,.79,.50,.09,.29,'#1c1928','#7c7389');
      line(ctx,b,'M .39 .40 L .66 .40','#b6b0b5',w*.6);break;
    case 'rod':
      ellipse(ctx,b,.11,.50,.045,.20,'#191827','#aaa3a9');
      ellipse(ctx,b,.89,.50,.045,.20,'#191827','#aaa3a9');
      line(ctx,b,'M .26 .55 L .74 .55','#a6aab6',w*.6);break;
    case 'piston':
      line(ctx,b,'M .45 .12 L .45 .78','#cdcbd0',w*1.2);
      line(ctx,b,'M .34 .49 L .67 .49','#221e2c',w*2);break;
    case 'telescope':
      line(ctx,b,'M .24 .13 L .24 .79','#d4d0cb',w*2);
      line(ctx,b,'M .73 .13 L .73 .79','#b5b3bf',w*2);
      line(ctx,b,'M .17 .71 L .32 .71 M .64 .71 L .81 .71','#1e1929',w*2);break;
    case 'spar':
      line(ctx,b,'M .34 .43 L .46 .59 .65 .43','#161321',w*1.3);break;
    case 'spine':
      for(let i=0;i<5;i++) line(ctx,b,`M .32 ${.23+i*.13} L .69 ${.23+i*.13}`,'#151321',w*1.2);break;
    case 'fin':
      for(let i=0;i<7;i++) line(ctx,b,`M ${.27+i*.035} ${.87-i*.09} L ${.52+i*.042} ${.70-i*.085}`,'#243d40',w*.9);
      line(ctx,b,'M .23 .90 Q .28 .55 .84 .12','#e4d4ac',w*.8);break;
    case 'duct':
      for(let i=0;i<7;i++) line(ctx,b,`M .30 ${.29+i*.075} L .67 ${.30+i*.075}`,'#2d4949',w);break;
    case 'vent':
      polygon(ctx,'.22 .35 .79 .33 .73 .77 .21 .71',b);ctx.fillStyle='#151720';ctx.fill();
      for(let i=0;i<4;i++) line(ctx,b,`M .25 ${.39+i*.09} L .73 ${.38+i*.09}`,'#7c7c84',w);break;
    case 'bellows':
      for(let i=0;i<4;i++) line(ctx,b,`M .26 ${.25+i*.15} L .73 ${.25+i*.15}`,'#171420',w*2);break;
    case 'rubber':
      for(let i=0;i<3;i++) line(ctx,b,`M .28 ${.37+i*.15} L .65 ${.39+i*.15}`,'#171823',w);break;
    case 'palm':
      line(ctx,b,'M .19 .34 L .63 .34','#77717f',w);break;
    case 'chest':
      polygon(ctx,'.48 .30 .64 .23 .74 .28 .63 .40 .48 .44',b);ctx.fillStyle='#3a3646';ctx.fill();
      line(ctx,b,'M .54 .34 L .66 .29','#e9ba66',w*1.2);
      line(ctx,b,'M .28 .21 Q .47 .14 .63 .18','#fff9e6',w*.7);break;
    case 'shoulder':
      polygon(ctx,'.23 .52 .38 .48 .42 .60 .28 .65',b);ctx.fillStyle='#45434f';ctx.fill();
      line(ctx,b,'M .29 .54 L .37 .53','#deb46e',w);break;
    case 'shin':
      polygon(ctx,'.38 .19 .61 .16 .65 .28 .42 .34',b);ctx.fillStyle='#555365';ctx.fill();
      line(ctx,b,'M .44 .24 L .58 .22','#d8b16f',w);break;
    case 'head':
      polygon(ctx,'.24 .56 .71 .40 .83 .48 .68 .66 .36 .77 .20 .67',b);ctx.fillStyle='#211e2b';ctx.fill();
      line(ctx,b,'M .30 .61 L .70 .48','#a78a59',w*.7);break;
    case 'lens': {
      const glow=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.height);
      glow.addColorStop(0,'#fffbd8');glow.addColorStop(.4,'#ffe4a0');glow.addColorStop(1,'#bb6828');
      polygon(ctx,'.13 .31 .78 .15 .86 .31 .80 .59 .23 .82 .12 .61',b);ctx.fillStyle=glow;ctx.fill();
      line(ctx,b,'M .23 .48 L .72 .30','#fffef0',w*1.3);
      line(ctx,b,'M .48 .29 L .51 .64','#a15b2e',w*.8);break;
    }
    case 'shield':
      polygon(ctx,'.39 .27 .50 .22 .61 .30 .52 .44 .41 .40',b);ctx.fillStyle='#4c4857';ctx.fill();
      line(ctx,b,'M .47 .29 L .52 .33 .47 .37','#dfb46d',w);
      line(ctx,b,'M .46 .51 L .49 .73','#aaa9a7',w*.8);break;
    case 'cannon':
      polygon(ctx,'.36 .24 .61 .24 .67 .37 .36 .39',b);ctx.fillStyle='#343040';ctx.fill();
      line(ctx,b,'M .40 .30 L .58 .30','#e7ba70',w);
      line(ctx,b,'M .76 .34 L .76 .51','#272536',w*1.8);break;
    case 'rail':
      line(ctx,b,'M .13 .49 L .86 .49','#b3aeb7',w);
      for(let i=0;i<5;i++) line(ctx,b,`M ${.23+i*.12} .60 L ${.23+i*.12} .80`,'#161321',w);break;
    case 'muzzle':
      ellipse(ctx,b,.53,.55,.29,.33,'#171522','#85818d');
      ellipse(ctx,b,.53,.55,.19,.24,'#070b15','#c29554');
      ellipse(ctx,b,.54,.56,.07,.13,'#f3c476');break;
    case 'armorMark':
      line(ctx,b,'M .34 .29 L .48 .31','#656371',w*1.3);
      line(ctx,b,'M .36 .35 L .47 .36','#999288',w*.7);break;
  }
}

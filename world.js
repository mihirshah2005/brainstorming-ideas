/* ---------- ground ---------- */
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(700, 48),
  new THREE.MeshStandardMaterial({ color:0x111726, roughness:1, metalness:0 })
);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

/* ============================================================
   WORLD HELPERS
   ============================================================ */
const colliders = [];
function addCollider(x1,z1,x2,z2,tag){
  const c = { x1:Math.min(x1,x2), z1:Math.min(z1,z2), x2:Math.max(x1,x2), z2:Math.max(z1,z2), tag:tag||'' };
  colliders.push(c); return c;
}
function blocked(x,z,r){
  if (window.SHIP && !SHIP.active && SHIP.pos.y<5 &&
      Math.abs(x-SHIP.pos.x)<3+r && Math.abs(z-SHIP.pos.z)<4.5+r) return { ship:true };
  for (const c of colliders) if (x>c.x1-r && x<c.x2+r && z>c.z1-r && z<c.z2+r) return c;
  return null;
}

const M = {
  concrete:  new THREE.MeshStandardMaterial({ color:0x3a3e54, roughness:.95 }),
  dark:      new THREE.MeshStandardMaterial({ color:0x272a3c, roughness:.98 }),
  pale:      new THREE.MeshStandardMaterial({ color:0x4c5068, roughness:.9 }),
  paving:    new THREE.MeshStandardMaterial({ color:0x1d2233, roughness:1 }),
  glowTeal:  new THREE.MeshStandardMaterial({ color:0x0a2a24, emissive:0x36ffd9, emissiveIntensity:1.5, roughness:.5 }),
  glowViolet:new THREE.MeshStandardMaterial({ color:0x1d0a2e, emissive:0xa86bff, emissiveIntensity:1.4, roughness:.5 }),
  glowBlue:  new THREE.MeshStandardMaterial({ color:0x0a1430, emissive:0x5e9eff, emissiveIntensity:1.2, roughness:.5 }),
  glowAmber: new THREE.MeshStandardMaterial({ color:0x241806, emissive:0xffd9a0, emissiveIntensity:.85, roughness:.6 }),
  holo:      new THREE.MeshBasicMaterial({ color:0x9feaff, transparent:true, opacity:.20, blending:THREE.AdditiveBlending, depthWrite:false }),
  beam:      new THREE.MeshBasicMaterial({ color:0x6fffe0, transparent:true, opacity:.05, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide })
};
const pulses = [];   // {mat, base, amp, speed, phase}
pulses.push({ mat:M.glowTeal,   base:1.5, amp:.4, speed:.9,  phase:0 });
pulses.push({ mat:M.glowViolet, base:1.4, amp:.4, speed:1.2, phase:2.1 });
pulses.push({ mat:M.glowBlue,   base:1.2, amp:.35, speed:.7, phase:4.0 });

/* ---------- procedural grunge textures ---------- */
function grungeTexture(seed, base, dark, light, streaks){
  const r=mulberry32(seed);
  const cv=document.createElement('canvas'); cv.width=cv.height=256;
  const g=cv.getContext('2d');
  g.fillStyle=base; g.fillRect(0,0,256,256);
  for(let i=0;i<2400;i++){ g.fillStyle=r()<.5?dark:light; g.globalAlpha=.04+r()*.09;
    const sz=1+r()*3; g.fillRect(r()*256,r()*256,sz,sz); }
  if(streaks) for(let i=0;i<24;i++){ g.globalAlpha=.05+r()*.07; g.fillStyle=dark;
    g.fillRect(r()*256,0,1+r()*4,256); }
  g.globalAlpha=1;
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
const concTex=grungeTexture(11,'#8a8f9e','#5a5e6c','#abb0bb',true);
const concBump=grungeTexture(12,'#808080','#383838','#c8c8c8',true);
[M.concrete,M.dark,M.pale].forEach(m=>{ m.map=concTex; m.bumpMap=concBump; m.bumpScale=.02; m.needsUpdate=true; });
const grdTex=grungeTexture(13,'#7d8290','#525662','#9da1ab',false); grdTex.repeat.set(56,56);
const grdBump=grungeTexture(14,'#808080','#2a2a2a','#d6d6d6',false); grdBump.repeat.set(56,56);
ground.material.map=grdTex; ground.material.bumpMap=grdBump; ground.material.bumpScale=.03; ground.material.needsUpdate=true;

function addBox(x, yBase, z, w, h, d, mat, collide=true, ry=0){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x, yBase+h/2, z);
  if (ry) m.rotation.y = ry;
  m.castShadow = Math.abs(x)<240 && Math.abs(z+60)<320;
  m.receiveShadow = true;
  scene.add(m);
  if (collide){
    if (!ry) addCollider(x-w/2, z-d/2, x+w/2, z+d/2);
    else {
      const cs=Math.abs(Math.cos(ry)), sn=Math.abs(Math.sin(ry));
      const ew=(w*cs+d*sn)/2, ed=(w*sn+d*cs)/2;
      addCollider(x-ew, z-ed, x+ew, z+ed);
    }
  }
  return m;
}
function pillar(x,z,r,h,tiltX=0,tiltZ=0,mat=M.concrete){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r*.85,r,h,10), mat);
  m.position.set(x,h/2,z); m.rotation.x=tiltX; m.rotation.z=tiltZ;
  m.castShadow = Math.abs(x)<240 && Math.abs(z+60)<320;
  m.receiveShadow = true;
  scene.add(m);
  addCollider(x-r, z-r, x+r, z+r);
  return m;
}
function path(x1,z1,x2,z2,w=5){
  const dx=x2-x1, dz=z2-z1, len=Math.hypot(dx,dz);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,len), new THREE.MeshStandardMaterial({color:0x1a2030, roughness:1}));
  m.rotation.x=-Math.PI/2; m.rotation.z=-Math.atan2(dx,dz);
  m.position.set((x1+x2)/2, .025, (z1+z2)/2);
  scene.add(m);
}
function locBeam(x,z,color=0x6fffe0){
  const mat = M.beam.clone(); mat.color.setHex(color);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,420,12,1,true), mat);
  b.position.set(x,210,z); scene.add(b); return b;
}

/* ---------- glyph textures ---------- */
function glyphTexture(seed, cols=8, rows=10, color='#cfeaff', alpha=.85){
  const r = mulberry32(seed);
  const cv = document.createElement('canvas'); cv.width=256; cv.height=256;
  const g = cv.getContext('2d');
  g.strokeStyle=color; g.fillStyle=color; g.globalAlpha=alpha; g.lineWidth=2.2; g.lineCap='round';
  const cw=256/cols, ch=256/rows;
  for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){
    if (r()<.18) continue;
    const cx=i*cw+cw/2, cy=j*ch+ch/2, s=Math.min(cw,ch)*.32;
    const k=Math.floor(r()*5);
    g.beginPath();
    if(k===0){ g.arc(cx,cy,s*.7,r()*6.28,r()*6.28+2+r()*3); }
    else if(k===1){ g.moveTo(cx-s,cy+s); g.lineTo(cx,cy-s); g.lineTo(cx+s,cy+s); }
    else if(k===2){ g.moveTo(cx-s,cy); g.lineTo(cx+s,cy); g.moveTo(cx,cy-s); g.lineTo(cx,cy+s*(r()<.5?1:.2)); }
    else if(k===3){ g.moveTo(cx-s,cy-s); g.lineTo(cx+s,cy+s); g.moveTo(cx+s*.4,cy-s); g.lineTo(cx-s*.4,cy+s); }
    else { g.rect(cx-s*.6,cy-s*.6,s*1.2,s*1.2); }
    g.stroke();
    if (r()<.3){ g.beginPath(); g.arc(cx,cy+ch*.36,1.8,0,6.28); g.fill(); }
  }
  const t = new THREE.CanvasTexture(cv); return t;
}
function glyphPanel(w,h,seed,glow=0x9fd8ff){
  const mat = new THREE.MeshBasicMaterial({ map:glyphTexture(seed), transparent:true, color:glow, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat);
}

/* ---------- holographic figures ---------- */
const lookerGroups = [];   // groups that slowly turn toward the player
function holoFigure(h=1.7){
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.16,.30,h*.72,8), M.holo);
  body.position.y = h*.36;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.16,10,8), M.holo);
  head.position.y = h*.82;
  g.add(body, head);
  return g;
}

/* ---------- bioluminescent flora ---------- */
const leaners = [];   // plants that lean toward the player
const glowMats = [M.glowTeal, M.glowViolet, M.glowBlue];
function bioPlant(x,z,s=1){
  const g = new THREE.Group();
  const n = 2 + Math.floor(rng()*4);
  for (let i=0;i<n;i++){
    const h = (0.8+rng()*1.8)*s;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.025*s,.05*s,h,5), M.dark);
    const a = rng()*6.28, t = rng()*.5;
    stem.position.set(Math.cos(a)*.18*s, h/2, Math.sin(a)*.18*s);
    stem.rotation.set(Math.cos(a)*t, 0, Math.sin(a)*t);
    g.add(stem);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry((.06+rng()*.1)*s, 8, 6), glowMats[Math.floor(rng()*3)]);
    bulb.position.set(stem.position.x + Math.sin(stem.rotation.z)*-h*.5, h*.96, stem.position.z + Math.sin(stem.rotation.x)*h*.5);
    g.add(bulb);
  }
  if (rng()<.55){
    const frond = new THREE.Mesh(new THREE.ConeGeometry(.3*s, 1.1*s, 5), glowMats[Math.floor(rng()*3)]);
    frond.position.y = .55*s; frond.scale.y = 1+rng();
    g.add(frond);
  }
  g.position.set(x,0,z);
  scene.add(g);
  leaners.push(g);
  return g;
}
function mossPatch(x,z,r){
  const mat = new THREE.MeshBasicMaterial({ color:0x2dd9b0, transparent:true, opacity:.13, blending:THREE.AdditiveBlending, depthWrite:false });
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14), mat);
  m.rotation.x = -Math.PI/2; m.position.set(x,.03,z);
  scene.add(m); return m;
}

/* ---------- interactables ---------- */
const interactables = [];
function addInteract(x,y,z,fragId){
  const mk = new THREE.Mesh(new THREE.OctahedronGeometry(.30), new THREE.MeshBasicMaterial({ color:0x8effe4 }));
  mk.position.set(x,y,z);
  scene.add(mk);
  interactables.push({ x, y, z, fragId, mesh:mk, collected:false, t:rng()*6 });
}

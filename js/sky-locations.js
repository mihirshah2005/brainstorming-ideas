/* ============================================================
   FLIGHT-ONLY LOCATIONS + REALISM PASS
   Reachable only by ship. Ocean, Breakwater, Tether.
   ============================================================ */

/* ---------- shared ocean shader (reuses the water look) ---------- */
function makeOceanMat(deepHex, shallowHex){
  return new THREE.ShaderMaterial({ transparent:true, fog:false,
    uniforms:{ time:{value:0}, sunDir:{value:sunDir.clone()},
      deep:{value:new THREE.Color(deepHex)}, shallow:{value:new THREE.Color(shallowHex)},
      fogC:{value:new THREE.Color(0x342a52)} },
    vertexShader:
      'uniform float time; varying vec3 vW; varying vec2 vP;\n'+
      'float wv(vec2 p,float t){ return sin(p.x*.18+t*1.0)*.55+cos(p.y*.13+t*.7)*.4+sin((p.x+p.y)*.07-t*.5)*.35; }\n'+
      'void main(){ vec3 p=position; vP=p.xy; p.z+=wv(p.xy,time);\n'+
      ' vW=(modelMatrix*vec4(p,1.)).xyz;\n'+
      ' gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }',
    fragmentShader:
      'uniform float time; uniform vec3 sunDir,deep,shallow,fogC; varying vec3 vW; varying vec2 vP;\n'+
      'float wv(vec2 p,float t){ return sin(p.x*.18+t*1.0)*.55+cos(p.y*.13+t*.7)*.4+sin((p.x+p.y)*.07-t*.5)*.35; }\n'+
      'void main(){ float e=.6;\n'+
      ' float hx=wv(vP+vec2(e,0.),time)-wv(vP-vec2(e,0.),time);\n'+
      ' float hy=wv(vP+vec2(0.,e),time)-wv(vP-vec2(0.,e),time);\n'+
      ' vec3 n=normalize(vec3(-hx/(2.*e),1.,hy/(2.*e)));\n'+
      ' vec3 v=normalize(cameraPosition-vW);\n'+
      ' float fr=pow(1.-max(dot(n,v),0.),4.);\n'+
      ' vec3 r=reflect(-normalize(sunDir),n);\n'+
      ' float spec=pow(max(dot(r,v),0.),48.)*.5;\n'+
      ' vec3 col=mix(deep,shallow,.18+fr*.82)+spec*vec3(.95,1.,.92);\n'+
      ' float d=distance(cameraPosition,vW);\n'+
      ' col=mix(col,fogC,1.-exp(-d*.0042));\n'+
      ' gl_FragColor=vec4(col,.9); }' });
}
const oceanMats = [];

/* ============================================================
   THE BREAKWATER  (0, 560) — far south, over the sea
   ============================================================ */
(function breakwater(){
  const cx=0, cz=560;
  const om = makeOceanMat(0x03161e, 0x16626e);
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(620,520,60,50), om);
  ocean.rotation.x=-Math.PI/2; ocean.position.set(cx, .2, cz); scene.add(ocean);
  oceanMats.push(om);

  // the curved seawall — a ring of angled megaliths
  for (let i=0;i<22;i++){
    const a = -1.1 + i/21*2.2;
    const wx=cx+Math.sin(a)*150, wz=cz-200+Math.cos(a)*150;
    const h = 26 - Math.abs(a)*6 + rng()*4;
    addBox(wx, 0, wz, 14, h, 7, M.concrete, false, -a);
  }
  // the dial
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(13,13,1.2,40), M.pale);
  dial.rotation.x=Math.PI/2; dial.position.set(cx, 16, cz-200); scene.add(dial);
  const dialGlyph = glyphPanel(22, 22, 1601, 0xaed8ff);
  dialGlyph.position.set(cx, 16, cz-198.3); scene.add(dialGlyph);
  for (let i=0;i<12;i++){
    const a=i/12*Math.PI*2;
    const mk=new THREE.Mesh(new THREE.BoxGeometry(.5,2.4,.4), M.glowTeal);
    mk.position.set(cx+Math.cos(a)*11.6, 16+Math.sin(a)*11.6, cz-198.6); scene.add(mk);
  }
  // the watchers — eroded statues facing the sea
  for (let i=0;i<7;i++){
    const sx=cx-54+i*18, sz=cz-150+Math.sin(i)*8;
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.7,2,8), M.dark);
    base.position.set(sx,1,sz); base.castShadow=true; scene.add(base);
    const fig=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.2,6.5,9), M.pale);
    fig.position.set(sx,5.2,sz); fig.rotation.z=(rng()-.5)*.12; fig.castShadow=true; scene.add(fig);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.8,10,8), M.pale);
    head.position.set(sx,9,sz); head.scale.y=1.1; head.castShadow=true; scene.add(head);
  }
  // landing deck behind the wall
  const deck=new THREE.Mesh(new THREE.CircleGeometry(16,28), new THREE.MeshStandardMaterial({color:0x222838,roughness:.9}));
  deck.rotation.x=-Math.PI/2; deck.position.set(cx,12.1,cz-200); deck.receiveShadow=true; scene.add(deck);
  addInteract(cx, 13.5, cz-186, 'f15');
  locBeam(cx, cz-200, 0x7fd8ff);
  // sea spray motes
  const n=240, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){ pos[i*3]=cx+(rng()-.5)*400; pos[i*3+1]=rng()*16; pos[i*3+2]=cz+(rng()-.5)*340; }
  const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(gg,new THREE.PointsMaterial({color:0xbfeaff,size:.5,transparent:true,opacity:.4,depthWrite:false,blending:THREE.AdditiveBlending})));
})();

/* ============================================================
   THE TETHER  (500, -560) — severed orbital elevator
   ============================================================ */
(function tether(){
  const cx=500, cz=-560;
  // anchor base — a vast ruined cylinder
  addBox(cx, 0, cz, 30, 16, 30, M.concrete);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(22,2.2,10,32), M.dark);
  ring.rotation.x=Math.PI/2; ring.position.set(cx,8,cz); ring.castShadow=true; scene.add(ring);
  // the stump — climbs and shears off
  const stump=new THREE.Mesh(new THREE.CylinderGeometry(5,8,520,16), M.pale);
  stump.position.set(cx,260,cz); stump.castShadow=true; scene.add(stump);
  addCollider(cx-8, cz-8, cx+8, cz+8);
  // sheared diagonal cap
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0,5,18,16), M.dark);
  cap.position.set(cx,522,cz); cap.rotation.z=.5; scene.add(cap);
  // climbing rails of light up the stump
  for (let i=0;i<2;i++){
    const rail=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,500,6), M.glowBlue);
    rail.position.set(cx+(i?5.2:-5.2),255,cz); scene.add(rail);
  }
  // the fallen cable — a long arc of segments toward the sea
  let px=cx, py=300, pz=cz;
  for (let i=0;i<40;i++){
    const tt=i/39;
    const nx=cx-tt*560, ny=300*(1-tt*tt)*(1-tt)+2, nz=cz+tt*240;
    const seg=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.2,Math.hypot(nx-px,ny-py,nz-pz)+1), M.dark);
    seg.position.set((px+nx)/2,(py+ny)/2,(pz+nz)/2);
    seg.lookAt(nx,ny,nz); scene.add(seg);
    if (i%5===0){ const b=new THREE.Mesh(new THREE.SphereGeometry(.7,8,6), M.glowAmber); b.position.copy(seg.position); scene.add(b); }
    px=nx; py=ny; pz=nz;
  }
  // beacons on the anchor
  window._tetherBeacons=[];
  for (let i=0;i<4;i++){
    const a=i/4*Math.PI*2;
    const bc=new THREE.Mesh(new THREE.SphereGeometry(.8,8,8), new THREE.MeshBasicMaterial({color:0xff5a3a}));
    bc.position.set(cx+Math.cos(a)*15, 17, cz+Math.sin(a)*15); scene.add(bc);
    window._tetherBeacons.push(bc);
  }
  // landing deck
  const deck=new THREE.Mesh(new THREE.CircleGeometry(14,26), new THREE.MeshStandardMaterial({color:0x222838,roughness:.9}));
  deck.rotation.x=-Math.PI/2; deck.position.set(cx+24,16.1,cz); deck.receiveShadow=true; scene.add(deck);
  addBox(cx+24,0,cz,28,16,4,M.dark,false); // walkway support (visual)
  addInteract(cx+24, 17.5, cz, 'f16');
  const ins=glyphPanel(10,16,1701,0x9fd8ff); ins.position.set(cx,30,cz+15.2); scene.add(ins);
  locBeam(cx, cz, 0xff8a6a);
})();

/* ---------- add the two new sites to map + compass ---------- */
if (window.UI){
  UI.mapLocs.push(['THE BREAKWATER', 0, 560, '#7fd8ff']);
  UI.mapLocs.push(['THE TETHER', 500, -560, '#ff8a6a']);
}
if (typeof compassItems !== 'undefined'){
  // appended dynamically in suit.js scope is not reachable here; compass static list stays city-only
}

/* ---------- per-frame for ocean + beacons ---------- */
window._skyUpdate = function(t){
  for (const m of oceanMats) m.uniforms.time.value=t;
  if (window._tetherBeacons){
    const on = Math.sin(t*2.5)>0;
    for (const b of window._tetherBeacons) b.material.color.setHex(on?0xff5a3a:0x3a0e08);
  }
};

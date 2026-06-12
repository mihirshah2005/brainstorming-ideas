/* ============================================================
   LOCATION 1 — MONUMENT PLAZA  (0, 40)
   ============================================================ */
(function plaza(){
  const cx=0, cz=40;
  const pav = new THREE.Mesh(new THREE.CircleGeometry(40, 36), M.paving);
  pav.rotation.x=-Math.PI/2; pav.position.set(cx,.03,cz); scene.add(pav);

  // broken pillar ring
  for (let i=0;i<14;i++){
    const a = i/14*Math.PI*2;
    if (Math.abs(Math.sin(a))<.25 && Math.cos(a)<0) continue;       // gap toward spire (north)
    if (Math.abs(Math.sin(a))<.25 && Math.cos(a)>0) continue;       // gap toward landing (south)
    const px=cx+Math.cos(a)*31, pz=cz+Math.sin(a)*31;
    const broken = rng()<.4;
    pillar(px,pz,1.1, broken? 2.5+rng()*3 : 10+rng()*5, (rng()-.5)*.1, (rng()-.5)*.1);
    if (broken && rng()<.7){
      addBox(px+1.6, 0, pz+1.2, 2.2,1.1,2.2, M.dark, true, rng());
    }
  }

  // central stele with glowing seams
  addBox(cx, 0, cz, 3.2, 17, 1.4, M.pale);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(.14, 15.6, 1.5), M.glowTeal);
  seam.position.set(cx, 8, cz); scene.add(seam);
  const gp1 = glyphPanel(2.6, 12, 71); gp1.position.set(cx, 8.6, cz+0.76); scene.add(gp1);
  const gp2 = glyphPanel(2.6, 12, 72); gp2.position.set(cx, 8.6, cz-0.76); gp2.rotation.y=Math.PI; scene.add(gp2);

  // census wall (curved suggestion: three angled segments)
  addBox(cx-16, 0, cz-8, 13, 4.4, 1, M.concrete, true, .45);
  addBox(cx-20, 0, cz+3,  11, 4.4, 1, M.concrete, true, .9);
  addBox(cx-10, 0, cz-16, 11, 4.4, 1, M.concrete, true, .1);
  const census = glyphPanel(11.5, 3.6, 99, 0xaed8ff);
  census.position.set(cx-15.7, 2.3, cz-7.5); census.rotation.y=.45+Math.PI/2-1.12; scene.add(census);
  addInteract(cx-13.5, 1.4, cz-5.9, 'f2');

  // welcome obelisk at the south approach
  const ob = new THREE.Mesh(new THREE.CylinderGeometry(.5, 1.5, 8, 4), M.pale);
  ob.position.set(cx, 4, cz+33); ob.rotation.y=Math.PI/4; scene.add(ob);
  addCollider(cx-1.5, cz+31.5, cx+1.5, cz+34.5);
  const obg = glyphPanel(1.6, 5, 7); obg.position.set(cx, 3.4, cz+31.9); scene.add(obg);
  addInteract(cx+1.8, 1.3, cz+32.5, 'f1');

  // the child's instrument
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(.5,.65,1.1,8), M.dark);
  ped.position.set(cx+11, .55, cz+6); scene.add(ped);
  addCollider(cx+10.3, cz+5.3, cx+11.7, cz+6.7);
  const inst = new THREE.Mesh(new THREE.TorusKnotGeometry(.22,.07,48,8), M.glowAmber);
  inst.position.set(cx+11, 1.65, cz+6); scene.add(inst);
  pulses.push({ mat:M.glowAmber, base:.85, amp:.5, speed:2.2, phase:1 });
  addInteract(cx+11, 1.65, cz+6, 'f3');

  // rubble + flora
  for (let i=0;i<8;i++){
    const a=rng()*6.28, d=12+rng()*22;
    addBox(cx+Math.cos(a)*d, 0, cz+Math.sin(a)*d, 1+rng()*2,.5+rng(),1+rng()*2, M.dark, false, rng()*3);
  }
  mossPatch(cx+8, cz-10, 4); mossPatch(cx-6, cz+14, 3);
  locBeam(cx, cz, 0x9fd8ff);
})();

/* ============================================================
   LOCATION 2 — THE DATA SPIRE  (0, -140)
   ============================================================ */
(function spire(){
  const cx=0, cz=-140;
  // plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(44,.5,44), M.paving);
  plinth.position.set(cx,.25,cz); scene.add(plinth);

  // shell walls, 26x26 footprint, door slit on south
  const T=1.6, W=26, H=40;
  addBox(cx, 0, cz-W/2, W+T, H, T, M.concrete);                    // north
  addBox(cx-W/2, 0, cz, T, H, W, M.concrete);                      // west
  addBox(cx+W/2, 0, cz, T, H, W, M.concrete);                      // east
  addBox(cx-8.25, 0, cz+W/2, 9.5+T, H, T, M.concrete);             // south L
  addBox(cx+8.25, 0, cz+W/2, 9.5+T, H, T, M.concrete);             // south R
  addBox(cx, 30, cz+W/2, 7.5, 10, T, M.concrete, false);           // lintel above door

  // ascending tiers — a cathedral of memory
  let y=H;
  const tiers=[[22,26],[18,24],[14,22],[10,20],[7,18],[4.5,16]];
  for (const [w,h] of tiers){ addBox(cx, y, cz, w, h, w, M.concrete, false); y+=h; }
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(.4,1.4,30,8), M.pale);
  needle.position.set(cx, y+15, cz); scene.add(needle);
  const crown = new THREE.Mesh(new THREE.OctahedronGeometry(2.2), M.glowTeal);
  crown.position.set(cx, y+31, cz); scene.add(crown);

  // buttresses
  for (let i=0;i<6;i++){
    const a=i/6*Math.PI*2+.5;
    if (Math.sin(a)>.7) continue;  // keep the door clear
    const bx=cx+Math.cos(a)*19, bz=cz+Math.sin(a)*19;
    const b=addBox(bx,0,bz, 2.4, 34, 6, M.dark, true, -a);
    b.rotation.z = Math.cos(a)*.18; b.rotation.x = -Math.sin(a)*.18;
  }

  // the archive core
  const coreMat = new THREE.MeshStandardMaterial({ color:0x07211c, emissive:0x36ffd9, emissiveIntensity:.5, roughness:.5 });
  pulses.push({ mat:coreMat, base:.5, amp:.14, speed:.7, phase:1.4 });
  const core = new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.8,36,16), coreMat);
  core.position.set(cx, 18, cz); scene.add(core);
  addCollider(cx-2.8, cz-2.8, cx+2.8, cz+2.8);
  const coreLight = new THREE.PointLight(0x46ffd9, .6, 42, 2);
  coreLight.position.set(cx, 9, cz); scene.add(coreLight);

  // interior glyph walls + light shafts
  const gw = glyphPanel(16, 26, 311, 0x8fd8e8); gw.position.set(cx, 16, cz-W/2+T); scene.add(gw);
  for (let i=0;i<3;i++){
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 38), M.beam);
    sh.position.set(cx-6+i*6, 19, cz-2+i*2); sh.rotation.y=.4; scene.add(sh);
  }

  // terminal
  const term = addBox(cx-5.5, 0, cz+4, 1.2, 1.05, .9, M.dark);
  const tscreen = new THREE.Mesh(new THREE.PlaneGeometry(.95,.6), new THREE.MeshBasicMaterial({ color:0x46ffd9, transparent:true, opacity:.5 }));
  tscreen.position.set(cx-5.5, 1.25, cz+4.3); tscreen.rotation.x=-.5; scene.add(tscreen);
  addInteract(cx-5.5, 1.6, cz+4, 'f5');

  // the standing choir
  const choir = new THREE.Group();
  for (let i=0;i<5;i++){
    const f = holoFigure(1.6+rng()*.3);
    const a = -.9 + i*.45;
    f.position.set(Math.cos(a)*4.5, 0, Math.sin(a)*4.5 - 3);
    f.lookAt(0,1,0);
    choir.add(f);
  }
  choir.position.set(cx+4, 0, cz-4);
  scene.add(choir);
  lookerGroups.push(choir);
  addInteract(cx+4, 1.4, cz-6, 'f6');

  // facade inscription
  const ins = glyphPanel(8, 5, 47, 0xbfe8ff);
  ins.position.set(cx, 18, cz+W/2+T*.6); scene.add(ins);
  addInteract(cx-3.2, 1.5, cz+W/2+2.2, 'f4');

  mossPatch(cx+9, cz+9, 3.5);
  bioPlant(cx+10, cz+16, 1.4); bioPlant(cx-12, cz+13, 1.1);
  locBeam(cx, cz, 0x6fffe0);
})();

/* ============================================================
   LOCATION 3 — FLOODED TRANSIT HUB  (140, -20)
   ============================================================ */
let waterMesh;
const WATER = { x1:104, x2:196, z1:-58, z2:18 };
(function transit(){
  const cx=140, cz=-20;
  // water
  const wm = new THREE.ShaderMaterial({ transparent:true, fog:false,
    uniforms:{ time:{value:0}, sunDir:{value:sunDir.clone()},
      deep:{value:new THREE.Color(0x041e28)}, shallow:{value:new THREE.Color(0x14505e)},
      fogC:{value:new THREE.Color(0x342a52)} },
    vertexShader:
      'uniform float time; varying vec3 vW; varying vec2 vP;\n'+
      'float wv(vec2 p,float t){ return sin(p.x*.42+t*1.1)*.07+cos(p.y*.31+t*.8)*.05+sin((p.x+p.y)*.21-t*.6)*.05; }\n'+
      'void main(){ vec3 p=position; vP=p.xy; p.z+=wv(p.xy,time);\n'+
      ' vW=(modelMatrix*vec4(p,1.)).xyz;\n'+
      ' gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }',
    fragmentShader:
      'uniform float time; uniform vec3 sunDir,deep,shallow,fogC; varying vec3 vW; varying vec2 vP;\n'+
      'float wv(vec2 p,float t){ return sin(p.x*.42+t*1.1)*.07+cos(p.y*.31+t*.8)*.05+sin((p.x+p.y)*.21-t*.6)*.05; }\n'+
      'void main(){ float e=.28;\n'+
      ' float hx=wv(vP+vec2(e,0.),time)-wv(vP-vec2(e,0.),time);\n'+
      ' float hy=wv(vP+vec2(0.,e),time)-wv(vP-vec2(0.,e),time);\n'+
      ' vec3 n=normalize(vec3(-hx/(2.*e),1.,hy/(2.*e)));\n'+
      ' vec3 v=normalize(cameraPosition-vW);\n'+
      ' float fr=pow(1.-max(dot(n,v),0.),4.);\n'+
      ' vec3 r=reflect(-normalize(sunDir),n);\n'+
      ' float spec=pow(max(dot(r,v),0.),56.)*.4;\n'+
      ' vec3 col=mix(deep,shallow,.22+fr*.78)+spec*vec3(.95,1.,.92);\n'+
      ' float d=distance(cameraPosition,vW);\n'+
      ' col=mix(col,fogC,1.-exp(-d*.0052));\n'+
      ' gl_FragColor=vec4(col,.72+fr*.2); }' });
  waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(92,76,46,38), wm);
  waterMesh.rotation.x=-Math.PI/2; waterMesh.position.set(150,.32,-20);
  scene.add(waterMesh);

  // hall walls
  addBox(140, 0, -52, 76, 12, 1.8, M.concrete);
  addBox(140, 0,  12, 76, 12, 1.8, M.concrete);
  // partial roofs + one collapsed slab
  addBox(120, 11.5, -20, 28, 1.4, 62, M.dark, false);
  addBox(168, 11.5, -20, 22, 1.4, 62, M.dark, false);
  const fallen = addBox(147, 0, -8, 18, 1.2, 26, M.dark, false, .35);
  fallen.rotation.z = .42; fallen.position.y = 4.4;

  // columns
  for (let i=0;i<6;i++){
    pillar(112+i*11, -38, .9, 11.4, 0, (rng()-.5)*.06, M.pale);
    if (i%2===0) pillar(112+i*11, -2, .9, 11.4, 0, (rng()-.5)*.06, M.pale);
  }

  // platforms (cosmetic, low)
  addBox(140, 0, -34, 70, .4, 7, M.paving, false);
  addBox(140, 0,  -6, 70, .4, 7, M.paving, false);

  // the mag-train, half drowned
  const train = addBox(152, 0, -24, 30, 3.4, 3.2, M.pale, true, .08);
  train.rotation.z = -.07; train.position.y = 1.2;
  const strip = new THREE.Mesh(new THREE.BoxGeometry(30,.35,3.3), M.glowAmber);
  strip.position.set(152, 2.5, -24); strip.rotation.y=.08; strip.rotation.z=-.07; scene.add(strip);

  // departures board
  const board = glyphPanel(11, 4.4, 555, 0xffe2b0);
  board.position.set(136, 6.4, 11); board.rotation.y=Math.PI; scene.add(board);
  window._boardMat = board.material;
  addInteract(136, 1.5, 8.6, 'f7');

  // platform echo — the last crowd
  const crowd = new THREE.Group();
  for (let i=0;i<9;i++){
    const f = holoFigure(1.5+rng()*.4);
    f.position.set((rng()-.5)*7, 0, (rng()-.5)*4);
    f.rotation.y = rng()*6.28;
    crowd.add(f);
  }
  crowd.position.set(122, .4, -34);
  scene.add(crowd);
  lookerGroups.push(crowd);
  addInteract(122, 1.4, -31.5, 'f8');

  // drowned terminal
  const dt = addBox(163, 0, -33, 1.1, 1.5, .9, M.dark);
  const dglow = new THREE.Mesh(new THREE.PlaneGeometry(.8,.5), new THREE.MeshBasicMaterial({ color:0x6fb8d8, transparent:true, opacity:.35 }));
  dglow.position.set(163, 1.45, -32.5); dglow.rotation.x=-.5; scene.add(dglow);
  addInteract(163, 1.9, -33, 'f9');

  // broken entry arch facing the plaza
  pillar(104, -16, 1.3, 13, 0, .08, M.concrete);
  pillar(104, -26, 1.3, 10, 0, -.12, M.concrete);
  addBox(104, 12.2, -21, 2.6, 1.6, 9, M.concrete, false, 0);

  bioPlant(108, -10, 1.6); bioPlant(118, 6, 1.2); bioPlant(170, 8, 1.8);
  mossPatch(112, -8, 5);
  locBeam(cx, cz, 0x5e9eff);
})();

/* ============================================================
   LOCATION 4 — RESIDENTIAL TOWER  (-130, -40)
   ============================================================ */
(function residential(){
  const cx=-130, cz=-40;
  // the great slab
  addBox(cx, 0, cz, 38, 92, 20, M.concrete);
  // a sheared, collapsed wing
  const wing = addBox(cx+26, 0, cz+16, 18, 26, 14, M.dark, true, .22);
  wing.rotation.z=.1;
  // scattered lit windows — some of them still warm
  const winGeo = new THREE.PlaneGeometry(1.1,1.5);
  for (let i=0;i<60;i++){
    const lit = rng()<.30;
    const mat = lit
      ? new THREE.MeshBasicMaterial({ color: rng()<.5?0x46ffd9:0xa86bff, transparent:true, opacity:.5+rng()*.4 })
      : new THREE.MeshBasicMaterial({ color:0x0c0f1a });
    const w = new THREE.Mesh(winGeo, mat);
    const side = rng()<.6 ? 1 : -1;
    w.position.set(cx-17+rng()*34, 4+rng()*84, cz+side*(10.06));
    if (side<0) w.rotation.y=Math.PI;
    scene.add(w);
  }
  // home annex with a door gap (south face)
  const ax=cx+2, az=cz+22;
  addBox(ax, 0, az-4, 12, 4.6, 1, M.pale);              // north wall
  addBox(ax-6, 0, az, 1, 4.6, 9, M.pale);               // west
  addBox(ax+6, 0, az, 1, 4.6, 9, M.pale);               // east
  addBox(ax-4.1, 0, az+4, 3.8, 4.6, 1, M.pale);         // south L
  addBox(ax+4.1, 0, az+4, 3.8, 4.6, 1, M.pale);         // south R  (door gap ~4.4 wide)
  addBox(ax, 4.6, az, 13, .6, 9.6, M.dark, false);      // roof
  addBox(ax-3, 0, az-1.5, 2.6, .6, 1.6, M.dark, false); // bed slab
  addBox(ax+2.5, 0, az-1, 1.4, .8, 1.4, M.dark, false); // table
  // the voice prism
  const prism = new THREE.Mesh(new THREE.TetrahedronGeometry(.22), M.glowViolet);
  prism.position.set(ax+2.5, 1.35, az-1); scene.add(prism);
  addInteract(ax+2.5, 1.35, az-1, 'f10');
  // window glyph on the sill
  const sill = glyphPanel(1.6,.9, 808, 0xd8c8ff);
  sill.position.set(ax-5.4, 1.5, az+1.5); sill.rotation.y=Math.PI/2; scene.add(sill);
  addInteract(ax-4.7, 1.4, az+1.5, 'f11');

  // rubble field + flora
  for (let i=0;i<10;i++){
    const a=rng()*6.28, d=16+rng()*18;
    addBox(cx+Math.cos(a)*d, 0, cz+18+Math.sin(a)*d*.6, 1.5+rng()*3,.6+rng()*1.6,1.5+rng()*2, M.dark, false, rng()*3);
  }
  bioPlant(cx-14, cz+24, 1.5); bioPlant(cx+16, cz+30, 1.2); bioPlant(cx-2, cz+34, 2.0);
  mossPatch(cx+4, cz+28, 6);
  locBeam(cx, cz+20, 0xa86bff);
})();

/* ============================================================
   LOCATION 5 — OVERGROWN RESEARCH DOME  (110, -150)
   ============================================================ */
(function dome(){
  const cx=110, cz=-150, R=26;
  // lattice shell
  const lattice = new THREE.Mesh(
    new THREE.IcosahedronGeometry(R, 1),
    new THREE.MeshStandardMaterial({ color:0x3a4258, roughness:.8, wireframe:true })
  );
  lattice.position.set(cx, 2, cz); scene.add(lattice);
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(R*.985, 24, 16),
    new THREE.MeshBasicMaterial({ color:0x6fd8c8, transparent:true, opacity:.06, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide })
  );
  glass.position.set(cx, 2, cz); scene.add(glass);

  // base ring with western door gap (facing the spire)
  for (let i=0;i<10;i++){
    const a = i/10*Math.PI*2;
    if (Math.abs(a-Math.PI)<.45) continue;            // door gap, west
    const wx=cx+Math.cos(a)*R*.92, wz=cz+Math.sin(a)*R*.92;
    addBox(wx, 0, wz, 2.2, 3.4, 14, M.concrete, true, -a);
  }

  // the first volunteer — a tree of light
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.5,1.1,9,8), M.dark);
  trunk.position.set(cx, 4.5, cz); scene.add(trunk);
  addCollider(cx-1.1, cz-1.1, cx+1.1, cz+1.1);
  for (let i=0;i<26;i++){
    const a=rng()*6.28, r2=1.5+rng()*5.5, hh=7+rng()*6;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.18+rng()*.4, 7, 5), glowMats[Math.floor(rng()*3)]);
    leaf.position.set(cx+Math.cos(a)*r2, hh, cz+Math.sin(a)*r2);
    scene.add(leaf);
  }
  const treeLight = new THREE.PointLight(0x7affd9, 1.1, 45, 2);
  treeLight.position.set(cx, 8, cz); scene.add(treeLight);
  addInteract(cx+2.2, 1.5, cz+1.2, 'f13');

  // dense garden
  for (let i=0;i<26;i++){
    const a=rng()*6.28, d=4+rng()*(R*.7);
    bioPlant(cx+Math.cos(a)*d, cz+Math.sin(a)*d, .8+rng()*1.6);
  }
  mossPatch(cx-6, cz+6, 8); mossPatch(cx+9, cz-7, 6);

  // project log terminal
  const t2 = addBox(cx-9, 0, cz-9, 1.2, 1.05, .9, M.dark);
  const ts2 = new THREE.Mesh(new THREE.PlaneGeometry(.95,.6), new THREE.MeshBasicMaterial({ color:0xa86bff, transparent:true, opacity:.5 }));
  ts2.position.set(cx-9, 1.25, cz-8.6); ts2.rotation.x=-.5; scene.add(ts2);
  addInteract(cx-9, 1.6, cz-9, 'f12');

  // the bench by the door, facing the sunrise
  const bench = addBox(cx-R*.92+3.4, 0, cz+2.5, 2.6,.55,.9, M.pale, true, .12);
  addBox(cx-R*.92+3.4, .55, cz+2.1, 2.6,.7,.18, M.pale, false, .12);
  mossPatch(cx-R*.92+3.6, cz+3.4, 2.2);
  addInteract(cx-R*.92+3.4, 1.1, cz+2.5, 'f14');

  locBeam(cx, cz, 0x46ffd9);
})();

/* ============================================================
   LOCATION 6 — THE FINAL CHAMBER  (0, -300)
   ============================================================ */
let gateL, gateR, gateCollider, gateOpen=false, gateAnim=0;
(function chamber(){
  const cx=0, cz=-300;
  // half-buried mass
  addBox(cx-19, 0, cz, 14, 20, 44, M.dark);                       // west flank
  addBox(cx+19, 0, cz, 14, 20, 44, M.dark);                       // east flank
  addBox(cx, 0, cz-14, 26, 20, 16, M.dark);                       // back mass
  addBox(cx, 16, cz-2, 52, 6, 40, M.dark, false);                 // brow
  const cap = addBox(cx, 19, cz-6, 58, 8, 50, M.concrete, false);
  cap.rotation.x = -.06;
  // side walls of the entry throat
  addBox(cx-7.5, 0, cz+16, 3, 14, 14, M.concrete);
  addBox(cx+7.5, 0, cz+16, 3, 14, 14, M.concrete);

  // the gate
  gateL = addBox(cx-3, 0, cz+10, 6, 13, 1.4, M.pale, false);
  gateR = addBox(cx+3, 0, cz+10, 6, 13, 1.4, M.pale, false);
  gateCollider = addCollider(cx-6.2, cz+9.2, cx+6.2, cz+10.8, 'gate');
  const seamMat = new THREE.MeshStandardMaterial({ color:0x1d0a2e, emissive:0xa86bff, emissiveIntensity:1.6, transparent:true, opacity:1 });
  const seamG = new THREE.Mesh(new THREE.BoxGeometry(.18, 12.4, 1.5), seamMat);
  seamG.position.set(cx, 6.2, cz+10); scene.add(seamG);
  window._gateSeam = seamG;

  // interior — the last voice
  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), new THREE.MeshStandardMaterial({ color:0x14001f, emissive:0xd9b8ff, emissiveIntensity:1.8, roughness:.3 }));
  core.position.set(cx, 4.2, cz-2); scene.add(core);
  window._endCore = core;
  const coreL = new THREE.PointLight(0xc9a8ff, .8, 38, 2);
  coreL.position.set(cx, 5, cz-2); scene.add(coreL);
  // glowing veins on the interior walls
  for (let i=0;i<8;i++){
    const v = new THREE.Mesh(new THREE.BoxGeometry(.1, 8+rng()*8, .1), M.glowViolet);
    v.position.set(cx+(rng()<.5?-11.7:11.7), 6, cz-12+rng()*22);
    scene.add(v);
  }
  addInteract(cx, 4.2, cz-2, 'END');

  // approach causeway markers
  for (let i=0;i<6;i++){
    const mz = -180 - i*18;
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(.5, 2.4,.5), M.glowViolet);
    s1.position.set(-5, 1.2, mz); scene.add(s1);
    const s2 = s1.clone(); s2.position.x = 5; scene.add(s2);
  }
  locBeam(cx, cz, 0xc9a8ff);
})();

/* ============================================================
   WORLD DRESSING — paths, distant ruins, scattered flora, spores
   ============================================================ */
path(0,110, 0,75);  path(0,5, 0,-122);                 // landing → plaza → spire
path(28,30, 104,-16, 4);                               // plaza → transit
path(-28,36, -118,-14, 4);                             // plaza → residential
path(10,-148, 82,-150, 4);                             // spire → dome
path(0,-156, 0,-282, 4);                               // spire → chamber

// landing site
(function landing(){
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(7, 20), new THREE.MeshBasicMaterial({ color:0x050608 }));
  scorch.rotation.x=-Math.PI/2; scorch.position.set(0,.04,120); scene.add(scorch);
  const lander = addBox(4.5, 0, 124, 2.4, 3.4, 2.4, M.pale);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(.12,6,6), new THREE.MeshBasicMaterial({ color:0xff6a4a }));
  blink.position.set(4.5, 3.7, 124); scene.add(blink);
  window._landerBlink = blink;
})();

// distant ruined skyline — silhouettes in the fog, some with lit facades
const facadeMats=[];
for(let i=0;i<5;i++){
  const ft=window.facadeTexture(900+i); ft.repeat.set(2,5);
  facadeMats.push(new THREE.MeshStandardMaterial({map:ft, emissiveMap:ft, emissive:0x223044, emissiveIntensity:1.0, roughness:.9}));
}
for (let i=0;i<46;i++){
  const a=rng()*Math.PI*2, d=240+rng()*260;
  const x=Math.cos(a)*d, z=Math.sin(a)*d;
  if (z>60 && Math.abs(x)<70) continue;                // keep landing approach clear
  const lit = rng()<.45;
  const mat = lit ? facadeMats[Math.floor(rng()*facadeMats.length)] : (rng()<.5?M.dark:M.concrete);
  addBox(x, 0, z, 10+rng()*26, 20+rng()*110, 10+rng()*26, mat, false, rng()*3);
}
// mid-distance broken structures
for (let i=0;i<18;i++){
  const a=rng()*Math.PI*2, d=90+rng()*120;
  const x=Math.cos(a)*d, z=Math.sin(a)*d;
  if (blocked(x,z,16)) continue;
  if (rng()<.5) pillar(x,z, 1+rng()*1.5, 6+rng()*18, (rng()-.5)*.2, (rng()-.5)*.2, M.dark);
  else addBox(x,0,z, 4+rng()*8, 3+rng()*14, 4+rng()*8, M.dark, true, rng()*3);
}
// scattered flora along the walks
for (let i=0;i<70;i++){
  const a=rng()*Math.PI*2, d=20+rng()*230;
  const x=Math.cos(a)*d, z=Math.sin(a)*d-40;
  if (blocked(x,z,3)) continue;
  bioPlant(x, z, .6+rng()*1.6);
  if (rng()<.3) mossPatch(x+2, z+2, 1.5+rng()*3);
}

// drifting spores
function sporeCloud(n, range, y0, y1, size, color, opacity){
  const pos = new Float32Array(n*3);
  for (let i=0;i<n;i++){
    pos[i*3]   = (rng()-.5)*range;
    pos[i*3+1] = y0 + rng()*(y1-y0);
    pos[i*3+2] = (rng()-.5)*range - 80;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent:true, opacity, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true }));
  scene.add(m); return m;
}
const spores1 = sporeCloud(700, 480, .5, 40, .55, 0x7fffe0, .55);
const spores2 = sporeCloud(300, 480, 2, 70, .9, 0xb48cff, .35);

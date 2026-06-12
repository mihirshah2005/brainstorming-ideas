/* ============================================================
   SUIT — astronaut model, torch, scanner, compass
   ============================================================ */
const astro=(function(){
  const g=new THREE.Group();
  const suit=new THREE.MeshStandardMaterial({color:0xc9ced8,roughness:.6,metalness:.15});
  const dk=new THREE.MeshStandardMaterial({color:0x394050,roughness:.7});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.24,.21,.55,10),suit); torso.position.y=1.05; g.add(torso);
  const hips=new THREE.Mesh(new THREE.SphereGeometry(.21,10,8),suit); hips.position.y=.78; g.add(hips);
  const sh=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),suit); sh.position.y=1.32; g.add(sh);
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),suit); helmet.position.y=1.58; g.add(helmet);
  const visor=new THREE.Mesh(new THREE.SphereGeometry(.155,10,8),new THREE.MeshBasicMaterial({color:0x66e8ff}));
  visor.position.set(0,1.585,-.075); visor.scale.set(.78,.55,.7); g.add(visor);
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.34,.46,.18),dk); pack.position.set(0,1.15,.24); g.add(pack);
  const cell=new THREE.Mesh(new THREE.BoxGeometry(.1,.3,.04),M.glowTeal); cell.position.set(0,1.15,.345); g.add(cell);
  for(const sx of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.065,.055,.5,8),suit);
    arm.position.set(sx*.31,1.1,0); arm.rotation.z=sx*.14; g.add(arm);
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.085,.07,.72,8),suit);
    leg.position.set(sx*.12,.38,0); g.add(leg);
  }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  g.visible=false; scene.add(g); return g;
})();

const torch=new THREE.SpotLight(0xfff1d8,0,44,.48,.5,1.2);
const torchTarget=new THREE.Object3D();
scene.add(torch); scene.add(torchTarget); torch.target=torchTarget;
const viewDir=new THREE.Vector3();

let scanCD=0; const scanRings=[];
function scanner(){
  if (scanCD>0 || !locked || endingActive) return;
  scanCD=6;
  tone(1175,.5,.07); tone(880,.9,.05,'sine',.08);
  const m=new THREE.Mesh(new THREE.RingGeometry(.96,1,48),
    new THREE.MeshBasicMaterial({color:0x66ffe0,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2; m.position.set(player.x,.15,player.z);
  scene.add(m); scanRings.push({m,t:0});
  for(const it of interactables){
    if(!it.collected && Math.hypot(it.x-player.x,it.z-player.z)<75){
      it.flash=3; it.mesh.material.depthTest=false; it.mesh.renderOrder=50;
    }
  }
}

const compassEl=document.getElementById('compass');
const compassItems=[];
(function buildCompass(){
  const cards={0:'N',90:'E',180:'S',270:'W'};
  for(let d=0; d<360; d+=15){
    const sp=document.createElement('span');
    sp.className = cards[d]!==undefined ? 'card' : 'tick';
    sp.textContent = cards[d]!==undefined ? cards[d] : '|';
    compassEl.appendChild(sp);
    compassItems.push({el:sp,deg:d,type:'tick'});
  }
  const locs=[['PLAZA',0,40,'#9fd8ff'],['SPIRE',0,-140,'#6fffe0'],['TRANSIT',140,-20,'#7eb8ff'],
              ['HABITAT',-128,-18,'#c9a8ff'],['DOME',110,-150,'#5affc8'],['CHAMBER',0,-300,'#e0b8ff']];
  for(const [n,x,z,c] of locs){
    const sp=document.createElement('span');
    sp.className='locm'; sp.style.color=c;
    sp.innerHTML='&#9670;<div>'+n+'</div>';
    compassEl.appendChild(sp);
    compassItems.push({el:sp,x,z,type:'loc'});
  }
})();
function updateCompass(){
  const heading=((-player.yaw*180/Math.PI)%360+360)%360;
  for(const it of compassItems){
    const deg = it.type==='tick' ? it.deg
      : (Math.atan2(it.x-player.x, -(it.z-player.z))*180/Math.PI+360)%360;
    const delta=((deg-heading+540)%360)-180;
    if (Math.abs(delta)>80){ it.el.style.display='none'; continue; }
    it.el.style.display='block';
    it.el.style.left=(170+delta*2.0)+'px';
    it.el.style.marginLeft='-8px';
  }
}

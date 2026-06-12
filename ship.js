/* ============================================================
   THE SHIP — a recon dart, flyable
   ============================================================ */
const SHIP = (function(){

  /* ---------- landing pad ---------- */
  const padX=-24, padZ=134;
  const pad = new THREE.Mesh(new THREE.CircleGeometry(9, 28),
    new THREE.MeshStandardMaterial({ color:0x232838, roughness:.9 }));
  pad.rotation.x=-Math.PI/2; pad.position.set(padX,.05,padZ);
  pad.receiveShadow=true; scene.add(pad);
  const padRing = new THREE.Mesh(new THREE.RingGeometry(8.2,8.7,28),
    new THREE.MeshBasicMaterial({ color:0x6fffe0, transparent:true, opacity:.25, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide }));
  padRing.rotation.x=-Math.PI/2; padRing.position.set(padX,.08,padZ); scene.add(padRing);

  /* ---------- model ---------- */
  const g = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color:0xb9c2cf, roughness:.42, metalness:.55 });
  const darkMat = new THREE.MeshStandardMaterial({ color:0x2c3242, roughness:.6, metalness:.4 });
  // fuselage
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.9, 3.2, 12), hullMat);
  nose.rotation.x=-Math.PI/2; nose.position.z=-4.0; g.add(nose);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.12, 5.6, 12), hullMat);
  body.rotation.x=Math.PI/2; body.position.z=.4; g.add(body);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(1.12, .72, 1.6, 12), darkMat);
  tail.rotation.x=Math.PI/2; tail.position.z=4.0; g.add(tail);
  // canopy
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(.78, 14, 10), new THREE.MeshStandardMaterial({
    color:0x10303a, roughness:.1, metalness:.3, emissive:0x1d8a92, emissiveIntensity:.5 }));
  canopy.scale.set(.75, .55, 1.5); canopy.position.set(0, .72, -1.7); g.add(canopy);
  // delta wings
  for (const sx of [-1,1]){
    const wing = new THREE.Mesh(new THREE.BoxGeometry(3.6, .14, 2.6), hullMat);
    wing.position.set(sx*2.2, -.1, 1.7);
    wing.rotation.z = sx*-.06; wing.rotation.y = sx*.42;
    g.add(wing);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(.16, .7, 1.2), darkMat);
    tip.position.set(sx*3.8, .12, 2.3); g.add(tip);
    const navLight = new THREE.Mesh(new THREE.SphereGeometry(.09, 6, 6),
      new THREE.MeshBasicMaterial({ color: sx<0?0xff4a3a:0x3aff6a }));
    navLight.position.set(sx*3.8, .5, 2.3); g.add(navLight);
    // engines
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(.42, .5, 1.7, 10), darkMat);
    eng.rotation.x=Math.PI/2; eng.position.set(sx*1.35, -.05, 3.6); g.add(eng);
  }
  // thrust cones
  const thrustMat = new THREE.MeshBasicMaterial({ color:0x7fd8ff, transparent:true, opacity:.0, blending:THREE.AdditiveBlending, depthWrite:false });
  const thrusts=[];
  for (const sx of [-1,1]){
    const tcone = new THREE.Mesh(new THREE.ConeGeometry(.34, 2.6, 10, 1, true), thrustMat);
    tcone.rotation.x=-Math.PI/2; tcone.position.set(sx*1.35, -.05, 5.6);
    g.add(tcone); thrusts.push(tcone);
  }
  const engLight = new THREE.PointLight(0x7fd8ff, 0, 26, 2);
  engLight.position.set(0, 0, 5.2); g.add(engLight);
  // skids
  for (const sx of [-1,1]){
    const skid = new THREE.Mesh(new THREE.BoxGeometry(.18, 1.1, 3.4), darkMat);
    skid.position.set(sx*1.1, -1.15, .6); g.add(skid);
  }
  g.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
  scene.add(g);

  /* ---------- state ---------- */
  const S = {
    mesh:g, pos:new THREE.Vector3(padX, 1.35, padZ),
    yaw:Math.PI*.9, pitch:0, roll:0, throttle:0, speed:0, vy:0,
    active:false, landed:true, yawVel:0
  };
  g.position.copy(S.pos); g.rotation.order='YXZ'; g.rotation.y=S.yaw;

  const fhEl=document.getElementById('flighthud');
  const fhSpd=document.getElementById('fh-spd');
  const fhAlt=document.getElementById('fh-alt');
  const fhThr=document.getElementById('fh-thr');
  const fhHint=document.getElementById('fh-hint');

  let engineOsc=null, engineGain=null;
  function engineStart(){
    if (!actx) return;
    engineOsc=actx.createOscillator(); engineOsc.type='sawtooth'; engineOsc.frequency.value=42;
    const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=240;
    engineGain=actx.createGain(); engineGain.gain.value=.0;
    engineOsc.connect(f); f.connect(engineGain); engineGain.connect(masterG);
    engineOsc.start();
  }
  function engineStop(){ if(engineOsc){ try{engineOsc.stop();}catch(e){} engineOsc=null; engineGain=null; } }

  S.board = function(){
    S.active=true; S.landed=true; S.throttle=0; S.speed=0; S.vy=0;
    astro.visible=false;
    fhEl.style.display='block';
    engineStart();
    tone(330,.5,.08); tone(495,.7,.05,'sine',.15);
    showToast('Recon dart online. W to throttle up.', 4000);
  };
  S.exit = function(){
    S.active=false;
    fhEl.style.display='none';
    engineStop();
    // place the pilot beside the ship
    let ex=S.pos.x+4.4, ez=S.pos.z;
    if (blocked(ex,ez,.7)){ ex=S.pos.x-4.4; }
    if (blocked(ex,ez,.7)){ ex=S.pos.x; ez=S.pos.z+5.8; }
    if (blocked(ex,ez,.7)){ ez=S.pos.z-5.8; }
    player.x=ex; player.z=ez; player.gy=0; player.vy=0;
    tone(262,.4,.07);
  };

  /* ---------- flight model ---------- */
  S.update = function(dt, t){
    // input
    if (S.landed){
      if (keys['KeyW']) S.throttle=Math.min(1, S.throttle+dt*.8);
      if (S.throttle>.25){ S.landed=false; tone(220,1.2,.06); }
    } else {
      if (keys['KeyW']) S.throttle=Math.min(1, S.throttle+dt*.55);
      if (keys['KeyS']) S.throttle=Math.max(0, S.throttle-dt*.7);
      if (keys['KeyX']) S.throttle=Math.max(0, S.throttle-dt*1.6);
    }
    const boost = keys['ShiftLeft'] ? 1.55 : 1;
    const targetSpeed = S.throttle*62*boost;
    S.speed += (targetSpeed-S.speed)*Math.min(1, dt*1.6);

    if (!S.landed){
      // steering
      S.yawVel *= Math.pow(.0001, dt); // damp
      S.pitch = Math.max(-.62, Math.min(.62, S.pitch));
      // vertical thrusters
      if (keys['Space']) S.vy += 26*dt;
      else if (keys['KeyC']) S.vy -= 26*dt;
      else S.vy *= Math.pow(.02, dt);
      S.vy = Math.max(-24, Math.min(24, S.vy));
      // integrate
      const cp=Math.cos(S.pitch);
      const fx=-Math.sin(S.yaw)*cp, fy=Math.sin(S.pitch), fz=-Math.cos(S.yaw)*cp;
      const nx=S.pos.x+fx*S.speed*dt, ny=S.pos.y+(fy*S.speed+S.vy)*dt, nz=S.pos.z+fz*S.speed*dt;
      // structure collision below tower line
      if (ny<45 && blocked(nx,nz,2.4)){
        S.speed*=-.18; S.vy=6; thud(); showToast('Hull contact.', 1600);
      } else { S.pos.set(nx,ny,nz); }
      // bounds
      const minAlt = keys['KeyG'] ? 1.35 : 2.6;
      S.pos.y=Math.max(minAlt, Math.min(240, S.pos.y));
      const dHome=Math.hypot(S.pos.x, S.pos.z+40);
      if (dHome>820){ const k=820/dHome; S.pos.x*=k; S.pos.z=(S.pos.z+40)*k-40; }
      // landing
      if (keys['KeyG'] && S.pos.y<26 && S.speed<22){
        S.speed*=Math.pow(.05, dt); S.throttle=0;
        S.pos.y=Math.max(1.35, S.pos.y-12*dt);
        if (S.pos.y<=1.45 && !blocked(S.pos.x, S.pos.z, 2.2)){
          S.landed=true; S.vy=0; thud();
          showToast('Touchdown. E to disembark.', 3500);
        }
      }
    }
    // visual roll from yaw rate, slight pitch lag
    S.roll += (Math.max(-.7, Math.min(.7, -S.yawVel*26)) - S.roll)*Math.min(1, dt*4);
    g.position.copy(S.pos);
    g.rotation.y=S.yaw; g.rotation.x=S.pitch*.85; g.rotation.z=S.roll;
    // thrust visuals
    const th=S.throttle*(keys['ShiftLeft']?1.4:1);
    thrustMat.opacity=th*.55;
    for (const tc of thrusts) tc.scale.set(1, .5+th*2.6, 1);
    engLight.intensity=th*2.2;
    if (engineGain){ engineGain.gain.value=.015+th*.075; engineOsc.frequency.value=38+th*70+S.speed*.3; }
    // keep player anchored to ship (compass/map/zone cards)
    player.x=S.pos.x; player.z=S.pos.z; player.yaw=S.yaw;
    // chase camera
    const cp2=Math.cos(S.pitch);
    const fx2=-Math.sin(S.yaw)*cp2, fy2=Math.sin(S.pitch), fz2=-Math.cos(S.yaw)*cp2;
    const dx=S.pos.x-fx2*15, dy=S.pos.y-fy2*15+4.6, dz=S.pos.z-fz2*15;
    const kk=1-Math.exp(-dt*4.2);
    camera.position.x+=(dx-camera.position.x)*kk;
    camera.position.y+=(dy-camera.position.y)*kk;
    camera.position.z+=(dz-camera.position.z)*kk;
    const look=new THREE.Vector3(S.pos.x+fx2*12, S.pos.y+fy2*12, S.pos.z+fz2*12);
    camera.lookAt(look);
    if (keys['ShiftLeft'] && S.throttle>.5){
      camera.position.x+=(Math.random()-.5)*.12;
      camera.position.y+=(Math.random()-.5)*.12;
    }
    const tFov=70+S.speed*.28;
    if (Math.abs(tFov-camera.fov)>.1){ camera.fov+=(tFov-camera.fov)*Math.min(1,dt*3); camera.updateProjectionMatrix(); }
    // flight HUD
    fhSpd.textContent=Math.round(S.speed);
    fhAlt.textContent=Math.max(0, Math.round(S.pos.y-1.3));
    fhThr.style.width=(S.throttle*100)+'%';
    fhHint.textContent = S.landed ? 'W THROTTLE UP · E DISEMBARK'
      : (S.pos.y<26 && S.speed<22 ? 'G — LAND HERE' : 'W/S THROTTLE · MOUSE STEER · SHIFT BOOST · SPACE/C VERT · X BRAKE');
    // pad ring pulse
    padRing.material.opacity=.18+Math.sin(t*2)*.08;
  };

  /* ---------- steering input ---------- */
  addEventListener('mousemove', e=>{
    if (!locked || !S.active || S.landed || endingActive) return;
    S.yawVel += -e.movementX*.0000115;
    S.yaw += -e.movementX*.0011;
    S.pitch += -e.movementY*.0011;
  });

  /* ---------- board / exit ---------- */
  addEventListener('keydown', e=>{
    if (e.code!=='KeyE' || !started || endingActive || !locked) return;
    if (S.active){
      if (S.landed) S.exit();
    } else if (!dialogOpen && Math.hypot(player.x-S.pos.x, player.z-S.pos.z)<6 && S.pos.y<4){
      S.board();
    }
  });

  return S;
})();
window.SHIP = SHIP;

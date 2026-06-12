/* ============================================================
   RENDER PIPELINE — EffectComposer: MSAA, UnrealBloom, FX, ACES, SMAA
   + image-based lighting generated from the actual sky
   ============================================================ */

/* ---------- IBL: light the world with its own sky ---------- */
(function buildEnvironment(){
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envSky = sky.clone(); envScene.add(envSky);
  const envSun = sunDisc.clone(); envScene.add(envSun);
  const envHalo = sunHalo.clone(); envScene.add(envHalo);
  const env = pmrem.fromScene(envScene, .035).texture;
  scene.environment = env;
  const seen = new Set();
  scene.traverse(o=>{
    if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !seen.has(o.material)){
      seen.add(o.material);
      o.material.envMapIntensity = .8;
    }
  });
  pmrem.dispose();
})();

const POST=(function(){
  const A = window.ADDONS;
  let w=innerWidth, h=innerHeight;
  const rt = new THREE.WebGLRenderTarget(w, h, { samples: 8, type: THREE.HalfFloatType });
  const composer = new A.EffectComposer(renderer, rt);
  composer.addPass(new A.RenderPass(scene, camera));

  const bloomPass = new A.UnrealBloomPass(new THREE.Vector2(w,h), .55, .65, .68);
  composer.addPass(bloomPass);

  const FXShader = {
    uniforms: { tDiffuse:{value:null}, time:{value:0}, sunUV:{value:new THREE.Vector2(.5,.7)}, sunVis:{value:0} },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:
      'uniform sampler2D tDiffuse; uniform float time,sunVis; uniform vec2 sunUV; varying vec2 vUv;\n'+
      'float rnd(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }\n'+
      'void main(){\n'+
      ' vec2 d=(vUv-.5)*.0026;\n'+
      ' vec3 c; c.r=texture2D(tDiffuse,vUv+d).r; c.g=texture2D(tDiffuse,vUv).g; c.b=texture2D(tDiffuse,vUv-d).b;\n'+
      ' vec2 dir=(sunUV-vUv); vec3 gr=vec3(0.); float il=1.;\n'+
      ' for(int gi=0; gi<12; gi++){ vec2 sp=vUv+dir*(float(gi)/12.)*.55;\n'+
      '   vec3 sc=texture2D(tDiffuse,sp).rgb; float l=dot(sc,vec3(.299,.587,.114));\n'+
      '   gr+=sc*smoothstep(.8,1.5,l)*il; il*=.84; }\n'+
      ' c+=gr*.10*sunVis*vec3(1.,.93,.78);\n'+
      ' float vg=smoothstep(1.3,.5,length(vUv-.5)*1.6); c*=.62+.38*vg;\n'+
      ' c+=(rnd(vUv*vec2(1920.,1080.)+mod(time,10.)*60.)-.5)*.03;\n'+
      ' gl_FragColor=vec4(c,1.); }'
  };
  const fxPass = new A.ShaderPass(FXShader);
  composer.addPass(fxPass);

  const outputPass = new A.OutputPass();
  composer.addPass(outputPass);

  const smaaPass = new A.SMAAPass(w*renderer.getPixelRatio(), h*renderer.getPixelRatio());
  composer.addPass(smaaPass);

  const _sv=new THREE.Vector3();
  function render(t){
    _sv.copy(sunDir).multiplyScalar(950).project(camera);
    fxPass.uniforms.sunUV.value.set(_sv.x*.5+.5, _sv.y*.5+.5);
    fxPass.uniforms.sunVis.value = (_sv.z<1 && Math.abs(_sv.x)<1.3 && Math.abs(_sv.y)<1.3) ? 1 : 0;
    fxPass.uniforms.time.value=t;
    bloomPass.enabled = !window._lowq;
    smaaPass.enabled = !window._lowq;
    composer.render();
  }
  function setSize(W,H){ w=W; h=H; composer.setSize(W,H); }
  return {render,setSize};
})();
window._post=POST;

/* ============================================================
   MAIN LOOP
   ============================================================ */
window.__test = { player, interactables };
const clock=new THREE.Clock();
const upVec=new THREE.Vector3(0,1,0);
const tmpV=new THREE.Vector3();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  const t=clock.elapsedTime;

  if (!endingActive){
    if (window.SHIP && SHIP.active){
      SHIP.update(dt, t);
      promptEl.style.opacity=0;
    } else {
    movePlayer(dt);
    const eyeY = 1.7 - player.crouchK*.62 + player.gy;
    if (moving>0 && onGround) bobT += dt*moving*1.45;
    const bobS=Math.sin(bobT);
    if (bobS<-.92 && bobReady && onGround){ step(); bobReady=false; }
    else if (bobS>0) bobReady=true;
    const bob = onGround ? bobS*Math.min(.055, moving*.007) : 0;
    if (!player.tp){
      camera.position.set(player.x, eyeY+bob, player.z);
      astro.visible=false;
    } else {
      astro.visible=true;
      const cp=Math.cos(player.pitch);
      const fwx=-Math.sin(player.yaw)*cp, fwy=Math.sin(player.pitch), fwz=-Math.cos(player.yaw)*cp;
      camera.position.set(player.x-fwx*4.6, eyeY+1.1-fwy*4.6, player.z-fwz*4.6);
      if (camera.position.y<.4) camera.position.y=.4;
    }
    camera.rotation.y=player.yaw; camera.rotation.x=player.pitch;
    astro.position.set(player.x, player.gy, player.z);
    astro.rotation.y=player.yaw;
    astro.rotation.z=onGround? bobS*.04*(moving>0?1:0) : .06;
    const targetFov = zooming?40:(keys['ShiftLeft']&&moving>0?80:72);
    player.fov += (targetFov-player.fov)*Math.min(1,dt*7);
    if (Math.abs(player.fov-camera.fov)>.05){ camera.fov=player.fov; camera.updateProjectionMatrix(); }
    camera.getWorldDirection(viewDir);
    torch.position.copy(camera.position);
    torchTarget.position.copy(camera.position).addScaledVector(viewDir,12);
    }
    updateCompass();
    for(const p of pulses) p.mat.emissiveIntensity=p.base+Math.sin(t*p.speed+p.phase)*p.amp;
  } else {
    updateEnding(dt,t);
  }

  // markers
  for(const it of interactables){
    it.mesh.rotation.y=t*.8+it.t;
    it.mesh.position.y=it.y+Math.sin(t*1.6+it.t)*.12;
    let s=it.collected?.7:1+Math.sin(t*2.4+it.t)*.12;
    if (it.flash>0){
      it.flash-=dt; s+=.55*Math.min(1,it.flash);
      if (it.flash<=0){ it.mesh.material.depthTest=true; it.mesh.renderOrder=0; }
    }
    it.mesh.scale.setScalar(s);
  }
  // prompt
  if (!endingActive && started && !(window.SHIP && SHIP.active)){
    nearTarget=findNear();
    if (window.SHIP && !SHIP.active && SHIP.pos.y<5 && !dialogOpen && locked &&
        Math.hypot(player.x-SHIP.pos.x, player.z-SHIP.pos.z)<6){
      promptEl.textContent='E  —  BOARD THE RECON DART';
      promptEl.style.opacity=1;
    } else if (nearTarget && !dialogOpen && locked){
      promptEl.textContent = nearTarget.fragId==='END' ? 'E  —  LISTEN'
        : (nearTarget.collected ? 'E  —  READ AGAIN' : 'E  —  EXAMINE');
      promptEl.style.opacity=1;
    } else promptEl.style.opacity=0;
  }
  // holographic groups quietly notice you
  for(const g of lookerGroups){
    const want=Math.atan2(player.x-g.position.x, player.z-g.position.z);
    let d=want-g.rotation.y;
    while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2;
    g.rotation.y+=d*Math.min(1,dt*.4);
  }
  // plants lean toward the visitor
  for(const g of leaners){
    const dx=player.x-g.position.x, dz=player.z-g.position.z;
    const d2=dx*dx+dz*dz;
    let k=0;
    if (d2<100) k=.09*(1-d2/100);
    const dl=Math.sqrt(d2)||1;
    const txr=(dz/dl)*k, tzr=-(dx/dl)*k;
    g.rotation.x+=(txr-g.rotation.x)*Math.min(1,dt*2);
    g.rotation.z+=(tzr-g.rotation.z)*Math.min(1,dt*2);
  }
  // ambient motion
  spores1.rotation.y=t*.006; spores1.position.y=Math.sin(t*.2)*1.2;
  spores2.rotation.y=-t*.004; spores2.position.y=Math.cos(t*.16)*1.6;
  if (waterMesh) waterMesh.material.uniforms.time.value=t;
  if (window._boardMat) window._boardMat.opacity=.55+Math.sin(t*7)*.12+(Math.random()<.02?-.3:0);
  if (window._landerBlink) window._landerBlink.material.color.setHex(Math.sin(t*3)>0?0xff6a4a:0x441208);
  if (window._endCore){ window._endCore.rotation.y=t*.3; window._endCore.rotation.x=t*.17; }
  // the gate
  if (gateOpen && gateAnim<1){
    gateAnim=Math.min(1,gateAnim+dt/4);
    const e=gateAnim*gateAnim*(3-2*gateAnim);
    gateL.position.x=-3-5.8*e; gateR.position.x=3+5.8*e;
    window._gateSeam.material.opacity=1-e;
    window._gateSeam.scale.x=1+e*8;
    if (gateAnim>=1){ gateCollider.x1=99999; gateCollider.x2=99999; }
  }
  if (scanCD>0) scanCD-=dt;
  for (let i=scanRings.length-1;i>=0;i--){
    const r=scanRings[i]; r.t+=dt;
    r.m.scale.setScalar(1+r.t*60);
    r.m.material.opacity=.7*Math.max(0,1-r.t/1.3);
    if (r.t>1.3){ scene.remove(r.m); scanRings.splice(i,1); }
  }
  if (window._skyUpdate) window._skyUpdate(t);
  if (window.UI) UI.update(dt, t);
  for(const m of window._aur) m.uniforms.time.value=t;
  POST.render(t);
}
animate();

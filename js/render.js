/* ============================================================
   POST-PROCESSING — bloom, ACES, chromatic aberration, vignette, grain
   ============================================================ */
const POST=(function(){
  const pars={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};
  let w=innerWidth,h=innerHeight;
  const sceneRT=new THREE.WebGLRenderTarget(w,h,pars);
  const rtA=new THREE.WebGLRenderTarget(w>>1,h>>1,pars);
  const rtB=new THREE.WebGLRenderTarget(w>>1,h>>1,pars);
  const rtC=new THREE.WebGLRenderTarget(w>>2,h>>2,pars);
  const rtD=new THREE.WebGLRenderTarget(w>>2,h>>2,pars);
  const cam2=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const scn2=new THREE.Scene();
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null);
  scn2.add(quad);
  const VS='varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}';
  const brightMat=new THREE.ShaderMaterial({uniforms:{t:{value:null}},vertexShader:VS,fragmentShader:
    'uniform sampler2D t; varying vec2 vUv; void main(){ vec3 c=texture2D(t,vUv).rgb;'+
    ' float l=dot(c,vec3(.299,.587,.114)); gl_FragColor=vec4(c*smoothstep(.62,.95,l),1.);}'});
  const blurMat=new THREE.ShaderMaterial({uniforms:{t:{value:null},dir:{value:new THREE.Vector2(1,0)},res:{value:new THREE.Vector2(w,h)}},vertexShader:VS,fragmentShader:
    'uniform sampler2D t; uniform vec2 dir,res; varying vec2 vUv;\n'+
    'void main(){ vec2 px=dir/res; vec3 s=texture2D(t,vUv).rgb*.227;\n'+
    ' s+=(texture2D(t,vUv+px*1.384).rgb+texture2D(t,vUv-px*1.384).rgb)*.316;\n'+
    ' s+=(texture2D(t,vUv+px*3.230).rgb+texture2D(t,vUv-px*3.230).rgb)*.07;\n'+
    ' gl_FragColor=vec4(s,1.);}'});
  const finalMat=new THREE.ShaderMaterial({uniforms:{t:{value:null},b1:{value:null},b2:{value:null},time:{value:0},strength:{value:.85},sunUV:{value:new THREE.Vector2(.5,.7)},sunVis:{value:0}},vertexShader:VS,fragmentShader:
    'uniform sampler2D t,b1,b2; uniform float time,strength,sunVis; uniform vec2 sunUV; varying vec2 vUv;\n'+
    'vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }\n'+
    'float rnd(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }\n'+
    'void main(){ vec2 d=(vUv-.5)*.004;\n'+
    ' vec3 c; c.r=texture2D(t,vUv+d).r; c.g=texture2D(t,vUv).g; c.b=texture2D(t,vUv-d).b;\n'+
    ' c+=(texture2D(b1,vUv).rgb+texture2D(b2,vUv).rgb)*strength;\n'+
    ' vec2 dir=(sunUV-vUv); vec3 gr=vec3(0.); float il=1.;\n'+
    ' for(int gi=0; gi<10; gi++){ vec2 sp=vUv+dir*(float(gi)/10.)*.6; gr+=texture2D(b1,sp).rgb*il; il*=.85; }\n'+
    ' c+=gr*0.10*sunVis*vec3(1.0,.96,.82);\n'+
    ' c=aces(c*1.22);\n'+
    ' float vg=smoothstep(1.25,.45,length(vUv-.5)*1.6); c*=.34+.66*vg;\n'+
    ' c+=(rnd(vUv*vec2(1920.,1080.)+mod(time,10.)*60.)-.5)*.045*(1.-vg*.5);\n'+
    ' c=pow(c,vec3(1./2.2));\n'+
    ' gl_FragColor=vec4(c,1.);}'});
  function pass(mat,inTex,outRT){ quad.material=mat; if(mat.uniforms.t) mat.uniforms.t.value=inTex;
    renderer.setRenderTarget(outRT); renderer.render(scn2,cam2); }
  const _sv=new THREE.Vector3();
  function render(t){
    _sv.copy(sunDir).multiplyScalar(950).project(camera);
    finalMat.uniforms.sunUV.value.set(_sv.x*.5+.5, _sv.y*.5+.5);
    finalMat.uniforms.sunVis.value = (_sv.z<1 && Math.abs(_sv.x)<1.3 && Math.abs(_sv.y)<1.3) ? 1 : 0;
    renderer.setRenderTarget(sceneRT); renderer.render(scene,camera);
    pass(brightMat,sceneRT.texture,rtA);
    blurMat.uniforms.res.value.set(w>>1,h>>1);
    blurMat.uniforms.dir.value.set(1,0); pass(blurMat,rtA.texture,rtB);
    blurMat.uniforms.dir.value.set(0,1); pass(blurMat,rtB.texture,rtA);
    if (!window._lowq){
      blurMat.uniforms.res.value.set(w>>2,h>>2);
      blurMat.uniforms.dir.value.set(1,0); pass(blurMat,rtA.texture,rtC);
      blurMat.uniforms.dir.value.set(0,1); pass(blurMat,rtC.texture,rtD);
    }
    finalMat.uniforms.t.value=sceneRT.texture;
    finalMat.uniforms.b1.value=rtA.texture;
    finalMat.uniforms.b2.value=(window._lowq?rtA:rtD).texture;
    finalMat.uniforms.time.value=t;
    quad.material=finalMat; renderer.setRenderTarget(null); renderer.render(scn2,cam2);
  }
  function setSize(W,H){ w=W;h=H; sceneRT.setSize(W,H);
    rtA.setSize(W>>1,H>>1); rtB.setSize(W>>1,H>>1); rtC.setSize(W>>2,H>>2); rtD.setSize(W>>2,H>>2); }
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

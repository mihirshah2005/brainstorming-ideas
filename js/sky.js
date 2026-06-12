/* ---------- sky dome ---------- */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite:false, fog:false,
  uniforms: { top:{value:new THREE.Color(0x14102b)}, mid:{value:new THREE.Color(0x3a2f5e)}, low:{value:new THREE.Color(0x2e4a55)} },
  vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top,mid,low; varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = h>0.18 ? mix(mid,top,smoothstep(0.18,0.85,h)) : mix(low,mid,smoothstep(-0.08,0.18,h)); gl_FragColor = vec4(c,1.0); }'
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 24, 16), skyMat);
scene.add(sky);

/* ---------- stars ---------- */
(function stars(){
  const n=1500, pos=new Float32Array(n*3), col=new Float32Array(n*3), r=mulberry32(7);
  for(let i=0;i<n;i++){
    const t=r()*Math.PI*2, ph=Math.acos(2*r()-1), R=1030;
    pos[i*3]=R*Math.sin(ph)*Math.cos(t);
    pos[i*3+1]=Math.abs(R*Math.cos(ph))*(.06+.94*r());
    pos[i*3+2]=R*Math.sin(ph)*Math.sin(t);
    const c=.35+r()*.65, w=r();
    col[i*3]=c*(w<.25?.75:1); col[i*3+1]=c*.93; col[i*3+2]=c*(w>.75?.8:1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size:1.7,sizeAttenuation:false,vertexColors:true,fog:false,transparent:true,opacity:.85,depthWrite:false}));
  scene.add(m);
})();

/* ---------- ringed gas giant ---------- */
(function giant(){
  const cv=document.createElement('canvas'); cv.width=256; cv.height=128;
  const g=cv.getContext('2d'), r=mulberry32(21);
  const bands=['#4a4274','#665a92','#7e6ea6','#9582ba','#564a80','#8a78ac','#6e6098','#a892c6'];
  let y=0;
  while(y<128){ const h=3+r()*9; g.fillStyle=bands[Math.floor(r()*bands.length)]; g.fillRect(0,y,256,h+1); y+=h; }
  const gr=g.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,'rgba(255,255,255,.12)'); gr.addColorStop(.55,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,10,.45)');
  g.fillStyle=gr; g.fillRect(0,0,256,128);
  const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace;
  const planet=new THREE.Mesh(new THREE.SphereGeometry(95,32,24),
    new THREE.MeshStandardMaterial({map:tex,fog:false,roughness:1,metalness:0}));
  planet.position.set(-560,290,-720); planet.rotation.z=.25;
  scene.add(planet);
  const ringMat=new THREE.MeshBasicMaterial({color:0xb6a8d6,fog:false,transparent:true,opacity:.30,side:THREE.DoubleSide,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.RingGeometry(120,178,72),ringMat);
  ring.position.copy(planet.position); ring.rotation.x=1.25; ring.rotation.y=.35;
  scene.add(ring);
  const ring2=new THREE.Mesh(new THREE.RingGeometry(185,200,72),ringMat.clone());
  ring2.material.opacity=.14; ring2.position.copy(planet.position);
  ring2.rotation.x=1.25; ring2.rotation.y=.35;
  scene.add(ring2);
})();

/* ---------- aurora ---------- */
window._aur=[];
for(let i=0;i<3;i++){
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide,
    uniforms:{time:{value:0},seed:{value:i*3.7},c1:{value:new THREE.Color(0x36ffd9)},c2:{value:new THREE.Color(0xa86bff)}},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float time,seed; uniform vec3 c1,c2; varying vec2 vUv;\n'+
      'void main(){ float x=vUv.x*8.+seed;\n'+
      ' float w=sin(x+time*.3)*.5+sin(x*2.3-time*.21)*.25+sin(x*.7+time*.13)*.35;\n'+
      ' float band=smoothstep(.45,.0,abs(vUv.y-.45-w*.18));\n'+
      ' float fade=smoothstep(0.,.15,vUv.y)*smoothstep(1.,.5,vUv.y);\n'+
      ' vec3 col=mix(c1,c2,clamp(vUv.y+w*.3,0.,1.));\n'+
      ' gl_FragColor=vec4(col, band*fade*.22); }'});
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(900,260),mat);
  pl.position.set(-180+i*200, 230+i*45, -840-i*70);
  scene.add(pl); window._aur.push(mat);
}

/* ---------- the wrong sun ---------- */
const sunDir = new THREE.Vector3(0.45, 0.42, -0.79).normalize();
const sunDisc = new THREE.Mesh(
  new THREE.CircleGeometry(72, 40),
  new THREE.MeshBasicMaterial({ color:0xffe9c4, fog:false, transparent:true, opacity:0.95 })
);
sunDisc.position.copy(sunDir).multiplyScalar(950);
sunDisc.lookAt(0,0,0);
scene.add(sunDisc);
const sunHalo = new THREE.Mesh(
  new THREE.CircleGeometry(150, 40),
  new THREE.MeshBasicMaterial({ color:0xc8e8c0, fog:false, transparent:true, opacity:0.16, blending:THREE.AdditiveBlending, depthWrite:false })
);
sunHalo.position.copy(sunDir).multiplyScalar(940);
sunHalo.lookAt(0,0,0);
scene.add(sunHalo);

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0x8a7ac0, 0x223038, 1.15)); // IBL carries the rest
const sunLight = new THREE.DirectionalLight(0xffe2b8, 0.85);
sunLight.position.copy(sunDir).multiplyScalar(400);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048,2048);
sunLight.shadow.camera.left=-260; sunLight.shadow.camera.right=260;
sunLight.shadow.camera.top=260; sunLight.shadow.camera.bottom=-260;
sunLight.shadow.camera.near=80; sunLight.shadow.camera.far=900;
sunLight.shadow.bias=-0.0006;
scene.add(sunLight);
const rimLight = new THREE.DirectionalLight(0x4adfc4, 0.18);
rimLight.position.set(-120, 90, -300);
scene.add(rimLight);

/* ============================================================
   PLAYER
   ============================================================ */
const player = { x:0, y:1.7, z:112, yaw:0, pitch:0, speed:7.2,
  vy:0, gy:0, crouchK:0, fov:72, tp:false };
let onGround=true, zooming=false, moving=0, bobT=0, bobReady=true;
camera.position.set(player.x, player.y, player.z);
camera.rotation.y = player.yaw;

const keys = {};
let locked=false, started=false, dialogOpen=false, endingActive=false;
let collectedCount = 0;
let pendingCollect = null;

addEventListener('keydown', e => {
  keys[e.code]=true;
  if (e.code==='Space' || e.code==='Tab') e.preventDefault();
  if (e.code==='KeyE') onInteractKey();
  if (!started || endingActive) return;
  if (e.code==='Space' && locked && onGround){ player.vy=8.4; onGround=false; }
  if (e.code==='KeyF' && locked){ torch.intensity = torch.intensity>0 ? 0 : 2.4; tone(1320,.07,.04,'square'); }
  if (e.code==='KeyV' && locked){ player.tp=!player.tp; tone(980,.07,.04,'square'); }
  if (e.code==='KeyQ') scanner();
  if (e.code==='Tab') panelEl.classList.toggle('show');
});
addEventListener('keyup', e => keys[e.code]=false);

const titleEl = document.getElementById('title');
const pausedEl = document.getElementById('paused');
titleEl.addEventListener('click', () => {
  if (!started){ started=true; titleEl.classList.add('hidden'); initAudio(); showToast('The lander’s survey marks six structures. Go and see.', 5000); }
  renderer.domElement.requestPointerLock();
});
/* pause-menu clicks are handled in ui.js */
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;
  pausedEl.style.display = (!locked && started && !endingActive) ? 'flex' : 'none';
});
addEventListener('mousemove', e => {
  if (!locked || endingActive) return;
  player.yaw   -= e.movementX*0.0021;
  player.pitch -= e.movementY*0.0021;
  player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch));
});
addEventListener('mousedown', e => {
  if (!locked) return;
  if (e.button===0) onInteractKey();
  if (e.button===2) zooming=true;
});
addEventListener('mouseup', e => { if (e.button===2) zooming=false; });
addEventListener('contextmenu', e => e.preventDefault());

function inWater(){ return player.x>WATER.x1 && player.x<WATER.x2 && player.z>WATER.z1 && player.z<WATER.z2; }
function movePlayer(dt){
  if (!locked || endingActive) return;
  // vertical physics
  if (!onGround || player.vy!==0){
    player.vy -= 24*dt;
    player.gy += player.vy*dt;
    if (player.gy<=0){ player.gy=0; player.vy=0; if(!onGround) thud(); onGround=true; }
  }
  // crouch blend
  const crouching = keys['KeyC']||keys['ControlLeft'];
  player.crouchK += ((crouching?1:0)-player.crouchK)*Math.min(1,dt*8);
  let fx=0, fz=0;
  if (keys['KeyW']) fz-=1; if (keys['KeyS']) fz+=1;
  if (keys['KeyA']) fx-=1; if (keys['KeyD']) fx+=1;
  if (!fx && !fz){ moving=0; return; }
  const len=Math.hypot(fx,fz); fx/=len; fz/=len;
  const sin=Math.sin(player.yaw), cos=Math.cos(player.yaw);
  let dx=(fx*cos + fz*sin), dz=(-fx*sin + fz*cos);
  let sp = player.speed;
  const sprinting = keys['ShiftLeft'] && fz<0;
  if (sprinting) sp*=1.75;
  if (crouching) sp*=.5;
  if (inWater()) sp*=.62;
  moving = sp;
  dx*=sp*dt; dz*=sp*dt;
  const R=.65;
  if (!blocked(player.x+dx, player.z, R)) player.x+=dx;
  if (!blocked(player.x, player.z+dz, R)) player.z+=dz;
  const dHome=Math.hypot(player.x, player.z+40);
  if (dHome>460){ const k=460/dHome; player.x*=k; player.z=(player.z+40)*k-40; }
}

/* ============================================================
   INTERACTION + UI
   ============================================================ */
const promptEl = document.getElementById('prompt');
const counterEl = document.getElementById('counter');
const panelEl = document.getElementById('panel');
const logEl = document.getElementById('log');
const dialogEl = document.getElementById('dialog');
const toastEl = document.getElementById('toast');
let nearTarget = null;

function findNear(){
  let best=null, bd=4.4;
  for (const it of interactables){
    const d = Math.hypot(it.x-player.x, it.z-player.z);
    if (d<bd){ bd=d; best=it; }
  }
  return best;
}
function onInteractKey(){
  if (!started || endingActive) return;
  if (dialogOpen){ if (window.UI && UI.typing()) UI.skipType(); else closeDialog(); return; }
  if (!nearTarget || !locked) return;
  const it = nearTarget;
  if (it.fragId==='END'){
    if (collectedCount>=REQUIRED) startEnding();
    else openDialog(FRAGS.LOCKED, false);
    return;
  }
  const frag = FRAGS[it.fragId];
  openDialog(frag, !it.collected);
  if (!it.collected){ it.collected=true; pendingCollect=it; }
}
function openDialog(frag, isNew){
  dialogOpen=true;
  dialogEl.querySelector('.dloc').textContent = frag.loc;
  dialogEl.querySelector('.dtitle').textContent = frag.title;
  if (window.UI) UI.type(dialogEl.querySelector('.dtext'), frag.text);
  else dialogEl.querySelector('.dtext').textContent = frag.text;
  dialogEl.classList.add('show');
  promptEl.style.opacity=0;
  if (isNew) chime();
}
function closeDialog(){
  dialogOpen=false;
  dialogEl.classList.remove('show');
  if (pendingCollect){
    collectedCount++;
    counterEl.textContent = 'MEMORIES  '+collectedCount+' / '+TOTAL;
    panelEl.classList.add('show');
    const li=document.createElement('li');
    li.textContent = FRAGS[pendingCollect.fragId].title;
    logEl.appendChild(li);
    pendingCollect.mesh.material.color.setHex(0x564d7a);
    pendingCollect = null;
    if (collectedCount===REQUIRED && !gateOpen){
      gateOpen=true;
      swell();
      showToast('Far to the north, beyond the spire, something unseals.', 6000);
    } else if (collectedCount===TOTAL){
      showToast('The city has nothing left to say. Only the chamber remains.', 6000);
    }
  }
}
let toastTimer=null;
function showToast(text, ms){
  toastEl.textContent=text; toastEl.style.opacity=1;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toastEl.style.opacity=0, ms);
}

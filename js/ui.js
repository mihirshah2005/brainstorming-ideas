/* ============================================================
   UI — boot sequence, title cards, holo map, pause menu, typewriter
   ============================================================ */
const UI = {};
(function(){

  /* ---------- suit boot sequence ---------- */
  const bootEl = document.getElementById('boot');
  const BOOT_LINES = [
    'APHELION SURVEY UNIT 7 — ONLINE',
    'ATMOSPHERE: BREATHABLE. IMPOSSIBLY.',
    'GRAVITY: 1.00 G. EXACTLY.',
    'GEOGRAPHY MATCH: EARTH — 99.97%',
    'CONCLUSION: IMPOSSIBLE. PROCEEDING.'
  ];
  let bootStarted=false, bootLine=0, bootChar=0, bootHold=0, bootDone=false;

  /* ---------- location title cards ---------- */
  const tcEl = document.getElementById('titlecard');
  const tcName = tcEl.querySelector('.tcn');
  const tcSub = tcEl.querySelector('.tcs');
  UI.zones = [
    { x:0,    z:40,   r:42, n:'MONUMENT PLAZA',        s:'eleven billion names, none of them graves' },
    { x:0,    z:-140, r:40, n:'THE DATA SPIRE',        s:'they kept everything they could not bear to lose' },
    { x:140,  z:-20,  r:52, n:'THE TRANSIT HUB',       s:'all routes converge' },
    { x:-128, z:-30,  r:46, n:'THE RESIDENTIAL TOWER', s:'the walls are warm' },
    { x:110,  z:-150, r:34, n:'THE RESEARCH DOME',     s:'we are done being brief' },
    { x:0,    z:-295, r:30, n:'THE FINAL CHAMBER',     s:'it waited for you' }
  ];
  let tcTimer=0;

  /* ---------- objective ---------- */
  const objEl = document.getElementById('objective');
  let lastObj='';

  /* ---------- glyph-decode typewriter ---------- */
  const SCRAMBLE = '░▒▓<>/|\\=+*-·';
  let twEl=null, twText='', twShown=0, twActive=false;
  UI.type = (el, text) => { twEl=el; twText=text; twShown=0; twActive=true; el.textContent=''; };
  UI.typing = () => twActive;
  UI.skipType = () => { if (twActive){ twEl.textContent=twText; twActive=false; } };

  /* ---------- holo map ---------- */
  const mapEl = document.getElementById('mapview');
  const mapCv = document.getElementById('mapcanvas');
  const mctx = mapCv.getContext('2d');
  UI.mapOpen = false;
  UI.mapLocs = [
    ['MONUMENT PLAZA', 0, 40, '#9fd8ff'],
    ['DATA SPIRE', 0, -140, '#6fffe0'],
    ['TRANSIT HUB', 140, -20, '#7eb8ff'],
    ['RESIDENTIAL TOWER', -128, -30, '#c9a8ff'],
    ['RESEARCH DOME', 110, -150, '#5affc8'],
    ['FINAL CHAMBER', 0, -300, '#e0b8ff'],
    ['LANDING SITE', 0, 120, '#ff8a6a']
  ];
  UI.toggleMap = () => {
    UI.mapOpen = !UI.mapOpen;
    mapEl.style.display = UI.mapOpen ? 'block' : 'none';
    if (UI.mapOpen){ mapCv.width=innerWidth; mapCv.height=innerHeight; }
    if (typeof tone === 'function') tone(UI.mapOpen?740:520,.08,.04,'square');
  };
  function drawMap(t){
    const w=mapCv.width, h=mapCv.height, cx=w/2, cy=h/2;
    const k = Math.min(w,h)/1750;
    mctx.clearRect(0,0,w,h);
    mctx.fillStyle='rgba(5,4,14,.9)'; mctx.fillRect(0,0,w,h);
    // survey rings
    mctx.strokeStyle='rgba(110,200,190,.14)'; mctx.lineWidth=1;
    for (let r=100; r<=800; r+=100){
      mctx.beginPath(); mctx.arc(cx, cy-40*k, r*k, 0, 6.283); mctx.stroke();
    }
    mctx.strokeStyle='rgba(110,200,190,.10)';
    mctx.beginPath(); mctx.moveTo(cx,0); mctx.lineTo(cx,h); mctx.stroke();
    mctx.beginPath(); mctx.moveTo(0,cy-40*k); mctx.lineTo(w,cy-40*k); mctx.stroke();
    mctx.font='10px Helvetica'; mctx.textAlign='center';
    // locations
    for (const [n,x,z,c] of UI.mapLocs){
      const px=cx+x*k, py=cy+z*k;
      mctx.fillStyle=c;
      mctx.beginPath(); mctx.arc(px,py,4,0,6.283); mctx.fill();
      mctx.globalAlpha=.35+.2*Math.sin(t*2+x);
      mctx.beginPath(); mctx.arc(px,py,9,0,6.283); mctx.strokeStyle=c; mctx.stroke();
      mctx.globalAlpha=1;
      mctx.fillStyle='rgba(220,235,245,.8)';
      mctx.fillText(n, px, py-14);
    }
    // ship
    if (window.SHIP){
      const sx=cx+SHIP.pos.x*k, sy=cy+SHIP.pos.z*k;
      mctx.fillStyle='#ffd9a0';
      mctx.save(); mctx.translate(sx,sy); mctx.rotate(-SHIP.yaw);
      mctx.beginPath(); mctx.moveTo(0,-7); mctx.lineTo(5,6); mctx.lineTo(-5,6); mctx.closePath(); mctx.fill();
      mctx.restore();
      mctx.fillStyle='rgba(255,217,160,.7)'; mctx.fillText('SHIP', sx, sy+18);
    }
    // player arrow
    const px=cx+player.x*k, py=cy+player.z*k;
    mctx.save(); mctx.translate(px,py); mctx.rotate(-player.yaw);
    mctx.fillStyle='#eafff6';
    mctx.beginPath(); mctx.moveTo(0,-8); mctx.lineTo(5,7); mctx.lineTo(0,4); mctx.lineTo(-5,7); mctx.closePath(); mctx.fill();
    mctx.restore();
    mctx.fillStyle='rgba(160,230,210,.55)'; mctx.font='11px Helvetica';
    mctx.fillText('SURVEY CHART — M TO CLOSE', cx, h-26);
  }

  /* ---------- pause menu ---------- */
  const miResume=document.getElementById('mi-resume');
  const miQuality=document.getElementById('mi-quality');
  const miAudio=document.getElementById('mi-audio');
  let quality='high', audioOn=true;
  window._lowq=false;
  miResume.addEventListener('click', ()=> renderer.domElement.requestPointerLock());
  miQuality.addEventListener('click', ()=>{
    quality = quality==='high' ? 'low' : 'high';
    window._lowq = quality!=='high';
    sunLight.castShadow = quality==='high';
    renderer.setPixelRatio(quality==='high' ? Math.min(devicePixelRatio,2) : 1);
    miQuality.textContent='QUALITY — '+quality.toUpperCase();
  });
  miAudio.addEventListener('click', ()=>{
    audioOn=!audioOn;
    if (masterG) masterG.gain.value = audioOn ? .5 : 0;
    miAudio.textContent='AUDIO — '+(audioOn?'ON':'OFF');
  });

  /* ---------- keys ---------- */
  addEventListener('keydown', e=>{
    if (e.code==='KeyM' && started && !endingActive && !dialogOpen) UI.toggleMap();
  });

  /* ---------- reticle ---------- */
  const retEl=document.getElementById('ret');

  /* ---------- per-frame ---------- */
  let zoneCooldown=0;
  UI.update = function(dt, t){
    // boot
    if (started && !bootStarted){ bootStarted=true; bootEl.style.opacity=1; }
    if (bootStarted && !bootDone){
      if (bootHold>0){ bootHold-=dt; }
      else {
        bootChar+=dt*46;
        const line=BOOT_LINES[bootLine];
        const n=Math.min(line.length, Math.floor(bootChar));
        bootEl.textContent=line.slice(0,n);
        if (n>=line.length){
          bootHold=.85; bootChar=0; bootLine++;
          if (bootLine>=BOOT_LINES.length){ bootDone=true; setTimeout(()=>bootEl.style.opacity=0, 2400); }
        }
      }
    }
    // typewriter
    if (twActive){
      twShown+=dt*260;
      const n=Math.min(twText.length, Math.floor(twShown));
      let tail='';
      for (let i=0;i<3 && n+i<twText.length;i++) tail+=SCRAMBLE[(Math.random()*SCRAMBLE.length)|0];
      twEl.textContent=twText.slice(0,n)+tail;
      if (n>=twText.length){ twEl.textContent=twText; twActive=false; }
    }
    if (endingActive){ tcEl.style.opacity=0; objEl.style.opacity=0; bootEl.style.opacity=0; return; }
    // title cards
    if (zoneCooldown>0) zoneCooldown-=dt;
    if (started && zoneCooldown<=0){
      for (const zn of UI.zones){
        if (zn.seen) continue;
        if (Math.hypot(player.x-zn.x, player.z-zn.z)<zn.r){
          zn.seen=true; zoneCooldown=6;
          tcName.textContent=zn.n; tcSub.textContent=zn.s;
          tcEl.style.opacity=1; tcTimer=4.2;
          if (typeof tone==='function'){ tone(392,1.8,.07); tone(587.33,2.4,.05,'sine',.25); }
          break;
        }
      }
    }
    if (tcTimer>0){ tcTimer-=dt; if (tcTimer<=0) tcEl.style.opacity=0; }
    // objective
    if (started){
      let o;
      const flying = window.SHIP && SHIP.active;
      if (collectedCount===0) o='SURVEY THE STRUCTURES';
      else if (collectedCount<REQUIRED) o='RECOVER MEMORIES — '+collectedCount+' / '+TOTAL;
      else if (!gateOpen) o='RECOVER MEMORIES — '+collectedCount+' / '+TOTAL;
      else o='THE CHAMBER IS OPEN — DUE NORTH';
      if (flying) o += '   ·   G LAND';
      if (o!==lastObj){ lastObj=o; objEl.textContent=o; objEl.style.opacity=.85; }
    }
    // reticle near interactable
    if (typeof nearTarget!=='undefined' && nearTarget && locked && !dialogOpen) retEl.classList.add('near');
    else retEl.classList.remove('near');
    // map
    if (UI.mapOpen) drawMap(t);
  };
})();

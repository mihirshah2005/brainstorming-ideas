/* ============================================================
   AUDIO — procedural ambience
   ============================================================ */
let actx=null, masterG=null;
function initAudio(){
  try{
    actx = new (window.AudioContext||window.webkitAudioContext)();
    masterG = actx.createGain(); masterG.gain.value=.5; masterG.connect(actx.destination);
    // drone
    const dg = actx.createGain(); dg.gain.value=.05;
    const lp = actx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=320;
    dg.connect(lp); lp.connect(masterG);
    [[55,'sine'],[82.41,'sine'],[110,'triangle']].forEach(([f,t])=>{
      const o=actx.createOscillator(); o.type=t; o.frequency.value=f;
      o.detune.value=(Math.random()-.5)*8; o.connect(dg); o.start();
    });
    const lfo=actx.createOscillator(); lfo.frequency.value=.045;
    const lfg=actx.createGain(); lfg.gain.value=.028;
    lfo.connect(lfg); lfg.connect(dg.gain); lfo.start();
    // wind
    const len=actx.sampleRate*3;
    const buf=actx.createBuffer(1,len,actx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const src=actx.createBufferSource(); src.buffer=buf; src.loop=true;
    const bp=actx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=420; bp.Q.value=.6;
    const wg=actx.createGain(); wg.gain.value=.025;
    src.connect(bp); bp.connect(wg); wg.connect(masterG); src.start();
    const wlfo=actx.createOscillator(); wlfo.frequency.value=.11;
    const wlg=actx.createGain(); wlg.gain.value=160;
    wlfo.connect(wlg); wlg.connect(bp.frequency); wlfo.start();
  }catch(e){}
}
function tone(freq, dur, vol, type='sine', when=0){
  if(!actx) return;
  const t0=actx.currentTime+when;
  const o=actx.createOscillator(); o.type=type; o.frequency.value=freq;
  const g=actx.createGain();
  g.gain.setValueAtTime(0,t0);
  g.gain.linearRampToValueAtTime(vol,t0+.04);
  g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(g); g.connect(masterG);
  o.start(t0); o.stop(t0+dur+.1);
}
const PENT=[523.25,587.33,659.25,783.99,880];
function chime(){
  const f=PENT[Math.floor(Math.random()*PENT.length)];
  tone(f,1.6,.16); tone(f*.667,2.2,.09,'sine',.12);
}
let stepBuf=null;
function step(){
  if(!actx) return;
  if(!stepBuf){
    const len=actx.sampleRate*.1; stepBuf=actx.createBuffer(1,len,actx.sampleRate);
    const d=stepBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
  }
  const src=actx.createBufferSource(); src.buffer=stepBuf;
  src.playbackRate.value=.7+Math.random()*.5;
  const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=380+Math.random()*240;
  const g=actx.createGain(); g.gain.value = inWater() ? .05 : .028;
  src.connect(f); f.connect(g); g.connect(masterG); src.start();
}
function thud(){ tone(64,.28,.14); step(); }
function swell(){
  if(!actx) return;
  const t0=actx.currentTime;
  const o=actx.createOscillator(); o.frequency.setValueAtTime(82,t0);
  o.frequency.linearRampToValueAtTime(164,t0+3.5);
  const g=actx.createGain();
  g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(.22,t0+2);
  g.gain.linearRampToValueAtTime(0,t0+4.5);
  o.connect(g); g.connect(masterG); o.start(t0); o.stop(t0+5);
  tone(330,4,.06,'sine',1.5);
}

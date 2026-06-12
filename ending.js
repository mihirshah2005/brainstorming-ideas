/* ============================================================
   THE ENDING
   ============================================================ */
const END_LINES = [
'TRAVELER. YOU HAVE BEEN HEARD.',
'You came looking for what erased us.\nNothing erased us.',
'We erased the line between ourselves and the place.',
'The Translation was not a departure. It was an arrival. Into stone. Into water. Into the small blue leaves you walked past without counting.',
'Every wall that seemed to watch you, watched you. The note that bent toward your hand, bent on purpose. The walls were warm because we are the walls.',
'We copied the Earth we lost so we would have a body worth becoming. The city is not where we lived. The city is who.',
'But matter dreams slowly, and rain wears even a mind smooth. Ten thousand years, and we are almost weather now.',
'We stayed awake for one last thing. Not rescue. Witness. To be known by someone, once, before we finish becoming the world.',
'You read our goodbyes. You held the instrument. It learned your hand, too. Stone remembers. It will remember you.',
'It is enough. Thank you.\nYou may keep the memories.',
'We will keep the rain.'
];
const LINE_DUR=5.2;
let endT=0, endCamFrom=null, endCardShown=false, lastLineIdx=-1;
const fadeEl=document.getElementById('fade');
const endlinesEl=document.getElementById('endlines');
const endpEl=document.getElementById('endp');
const endcardEl=document.getElementById('endcard');

function startEnding(){
  endingActive=true;
  document.exitPointerLock();
  document.getElementById('hud').style.display='none';
  panelEl.style.display='none';
  dialogEl.classList.remove('show');
  pausedEl.style.display='none';
  endCamFrom = { px:camera.position.x, py:camera.position.y, pz:camera.position.z };
  endlinesEl.style.display='flex';
  endT=0;
  swell();
}
function updateEnding(dt, t){
  endT+=dt;
  // camera: slow rise and orbit around the last voice
  const core=window._endCore;
  const blend=Math.min(endT/5,1), e=blend*blend*(3-2*blend);
  const ang=endT*.07+.8, rad=Math.min(9+endT*.05,10.5), hgt=Math.min(3+endT*.11,9.5);
  const tx=core.position.x+Math.sin(ang)*rad, ty=hgt+core.position.y, tz=core.position.z+Math.cos(ang)*rad;
  camera.position.set(
    endCamFrom.px+(tx-endCamFrom.px)*e,
    endCamFrom.py+(ty-endCamFrom.py)*e,
    endCamFrom.pz+(tz-endCamFrom.pz)*e
  );
  camera.lookAt(core.position);
  // the city dims as it finishes becoming the world
  const dim=Math.max(0,1-endT/60);
  for(const p of pulses) p.mat.emissiveIntensity=(p.base+Math.sin(t*p.speed+p.phase)*p.amp)*Math.max(.12,dim);
  // lines
  const idx=Math.floor(endT/LINE_DUR);
  const ph=(endT%LINE_DUR)/LINE_DUR;
  if (idx<END_LINES.length){
    if (idx!==lastLineIdx){ lastLineIdx=idx; endpEl.textContent=END_LINES[idx]; if(idx>0) tone(PENT[idx%5]*.5,3,.05); }
    endpEl.style.opacity = ph<.25 ? ph/.25 : (ph>.85 ? (1-ph)/.15 : 1);
  } else {
    endpEl.style.opacity=0;
    if (endT>END_LINES.length*LINE_DUR+1.5){ fadeEl.style.opacity=1; }
    if (endT>END_LINES.length*LINE_DUR+5 && !endCardShown){
      endCardShown=true;
      endlinesEl.style.display='none';
      document.getElementById('endstats').innerHTML=
        'You gathered '+collectedCount+' of '+TOTAL+' memories before the city slept.<br>'+
        'Somewhere behind you, very gently, the lights are going out.';
      endcardEl.style.display='flex';
      requestAnimationFrame(()=>{ endcardEl.style.opacity=1; });
      tone(261.63,6,.1); tone(392,6,.07,'sine',.8); tone(523.25,7,.05,'sine',1.8);
    }
  }
}

'use strict';
/* ============================================================
   ECHOES OF APHELION — a quiet archaeology
   ============================================================ */

const REQUIRED = 10;          // fragments needed to unseal the chamber
const TOTAL = 16;

/* ---------- seeded rng ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const rng = mulberry32(40961);

/* ---------- renderer / scene / camera ---------- */
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.LinearEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2144);
scene.fog = new THREE.FogExp2(0x342a52, 0.0052);

const camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.1, 1500);
camera.rotation.order = 'YXZ';

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (window._post) window._post.setSize(innerWidth, innerHeight);
});

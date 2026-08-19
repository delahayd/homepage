import * as THREE from 'three';
import museumData from '../data/museum.json';

type Exhibit = {title:string;text:string;link?:string;label?:string};
type Room = {id:string;number:string;title:string;subtitle:string;accent:string;position:number[];items:Exhibit[]};

const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const renderer = new THREE.WebGLRenderer({canvas, antialias:false, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#071019');
scene.fog = new THREE.Fog('#071019', 9, 32);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, .1, 60);
camera.position.set(0, 1.65, 16);
camera.rotation.order = 'YXZ';

scene.add(new THREE.HemisphereLight('#b8e5df', '#182026', 1.8));
const warmLight = new THREE.DirectionalLight('#ffd6a0', 1.5);
warmLight.position.set(5, 9, 4);
scene.add(warmLight);

const world = new THREE.Group();
scene.add(world);
const floorMaterial = new THREE.MeshStandardMaterial({color:'#26363a', roughness:.94});
const wallMaterial = new THREE.MeshStandardMaterial({color:'#53625e', roughness:.9});
const darkMaterial = new THREE.MeshStandardMaterial({color:'#10191d', roughness:1});

function box(x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
  mesh.position.set(x,y,z); world.add(mesh); return mesh;
}

box(0,-.15,2,30,.3,32,floorMaterial);
box(0,4.1,2,30,.25,32,darkMaterial);
box(-15,2,2,.4,4.2,32,wallMaterial); box(15,2,2,.4,4.2,32,wallMaterial);
box(0,2,-14,.4,4.2,.4,wallMaterial); box(0,2,18,30,4.2,.4,wallMaterial);
// A central cross creates four galleries while broad openings keep navigation obvious.
[-11,-3,5,13].forEach(z => box(0,2,z,.35,4,5.4,wallMaterial));
[-10,10].forEach(x => { box(x,2,2,9.6,4,.35,wallMaterial); });

const grid = new THREE.GridHelper(30,30,'#5f8b83','#344b4b');
grid.position.y=.01; world.add(grid);

const interactables:{mesh:THREE.Mesh;room:Room;item:Exhibit}[] = [];
function textTexture(room:Room,item:Exhibit,index:number){
  const c=document.createElement('canvas'); c.width=512;c.height=256;
  const ctx=c.getContext('2d')!; ctx.fillStyle='#0b151a';ctx.fillRect(0,0,c.width,c.height);
  ctx.strokeStyle=room.accent;ctx.lineWidth=7;ctx.strokeRect(8,8,496,240);
  ctx.fillStyle=room.accent;ctx.font='22px monospace';ctx.fillText(`${room.number}.${index+1} / ${room.title.toUpperCase()}`,30,48);
  ctx.fillStyle='#edf6f1';ctx.font='bold 36px sans-serif';
  const words=item.title.split(' ');let line='';let y=108;
  words.forEach(word=>{const test=line+word+' ';if(ctx.measureText(test).width>450){ctx.fillText(line,30,y);line=word+' ';y+=43}else line=test});ctx.fillText(line,30,y);
  ctx.fillStyle='#91aaa5';ctx.font='17px monospace';ctx.fillText('APPROACH + PRESS E TO READ',30,220);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearFilter;return texture;
}

(museumData.rooms as Room[]).forEach((room, roomIndex)=>{
  room.items.forEach((item,index)=>{
    const material=new THREE.MeshBasicMaterial({map:textTexture(room,item,index)});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.8),material);
    const [x,y,z]=room.position;
    mesh.position.set(x + (index ? 2.3 : -2.3),y,z);
    if(roomIndex===1||roomIndex===3){mesh.rotation.y=Math.PI/2;mesh.position.set(-14.72,y,z+(index ? 2.3 : -2.3))}
    if(roomIndex===2||roomIndex===4){mesh.rotation.y=-Math.PI/2;mesh.position.set(14.72,y,z+(index ? 2.3 : -2.3))}
    world.add(mesh);interactables.push({mesh,room,item});
    const glow=new THREE.PointLight(room.accent,.85,6);glow.position.copy(mesh.position);glow.position.y+=.4;world.add(glow);
  });
});

const keys=new Set<string>();let yaw=0,pitch=0,active=false,nearby:typeof interactables[number]|null=null;
const intro=document.querySelector<HTMLElement>('#intro')!,panel=document.querySelector<HTMLElement>('#info-panel')!;
const prompt=document.querySelector<HTMLElement>('#prompt')!, minimap=document.querySelector<HTMLElement>('#minimap')!;
function lock(){if(matchMedia('(pointer:fine)').matches) canvas.requestPointerLock();active=true;intro.hidden=true}
document.querySelector('#enter')!.addEventListener('click',lock);
canvas.addEventListener('click',()=>{if(!active)lock();else if(document.pointerLockElement!==canvas&&matchMedia('(pointer:fine)').matches)canvas.requestPointerLock()});
document.addEventListener('pointerlockchange',()=>{active=document.pointerLockElement===canvas;if(!active&&!panel.hidden) return;prompt.textContent=active?'Explore the galleries · E to inspect':'Click to resume'});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas)return;yaw-=e.movementX*.0022;pitch=Math.max(-1.15,Math.min(1.15,pitch-e.movementY*.0022))});
document.addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyE')openNearby();if(e.code==='KeyM'){minimap.hidden=!minimap.hidden;document.querySelector('#map-toggle')!.setAttribute('aria-expanded',String(!minimap.hidden))}});
document.addEventListener('keyup',e=>keys.delete(e.code));
document.querySelector('#map-toggle')!.addEventListener('click',()=>{
  minimap.hidden=!minimap.hidden;
  document.querySelector('#map-toggle')!.setAttribute('aria-expanded',String(!minimap.hidden));
});

function openNearby(){
  if(!nearby)return;const {room,item}=nearby;
  document.querySelector('#panel-room')!.textContent=`Room ${room.number} · ${room.title}`;
  document.querySelector('#panel-title')!.textContent=item.title;
  document.querySelector('#panel-text')!.textContent=item.text;
  const link=document.querySelector<HTMLAnchorElement>('#panel-link')!;
  link.hidden=!item.link;if(item.link){link.href=item.link;link.innerHTML=`${item.label??'Continue'} <span>↗</span>`}
  panel.hidden=false;if(document.pointerLockElement)document.exitPointerLock();
}
function closePanel(){panel.hidden=true;active=true;if(matchMedia('(pointer:fine)').matches)canvas.requestPointerLock()}
document.querySelector('#close-panel')!.addEventListener('click',closePanel);
document.querySelector('#touch-read')!.addEventListener('click',openNearby);
document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(button=>{
  const codes:{[key:string]:string}={forward:'KeyW',backward:'KeyS',left:'ArrowLeft',right:'ArrowRight'};
  const code=codes[button.dataset.move!];button.addEventListener('pointerdown',()=>keys.add(code));button.addEventListener('pointerup',()=>keys.delete(code));button.addEventListener('pointercancel',()=>keys.delete(code));
});

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
  if(active&&panel.hidden){
    if(keys.has('ArrowLeft'))yaw+=dt*1.5;if(keys.has('ArrowRight'))yaw-=dt*1.5;
    const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(-forward.z,0,forward.x);const movement=new THREE.Vector3();
    if(keys.has('KeyW'))movement.add(forward);if(keys.has('KeyS'))movement.sub(forward);if(keys.has('KeyA'))movement.sub(right);if(keys.has('KeyD'))movement.add(right);
    if(movement.lengthSq()){movement.normalize().multiplyScalar(dt*4);const next=camera.position.clone().add(movement);next.x=THREE.MathUtils.clamp(next.x,-14.2,14.2);next.z=THREE.MathUtils.clamp(next.z,-13.2,17.2);camera.position.copy(next)}
  }
  camera.rotation.set(pitch,yaw,0);
  nearby=null;let best=2.8;interactables.forEach(entry=>{const d=camera.position.distanceTo(entry.mesh.position);if(d<best){best=d;nearby=entry}});
  prompt.textContent=nearby?`[ E ] Inspect ${(nearby as typeof interactables[number]).item.title}`:(active?'Explore the galleries · E to inspect':'Click to resume');
  const marker=document.querySelector<HTMLElement>('#map-player')!;marker.style.left=`${((camera.position.x+15)/30)*100}%`;marker.style.top=`${((camera.position.z+14)/32)*100}%`;
  renderer.render(scene,camera);
}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();animate();

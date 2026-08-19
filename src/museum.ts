import * as THREE from 'three';
import museumData from '../data/museum.json';

type Exhibit = {title:string;text:string;link?:string;label?:string};
type Room = {id:string;number:string;title:string;subtitle:string;accent:string;position:number[];items:Exhibit[]};

const rooms=museumData.rooms as Room[];
const canvas=document.querySelector<HTMLCanvasElement>('#scene')!;
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();scene.background=new THREE.Color('#071019');scene.fog=new THREE.Fog('#071019',12,50);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,90);camera.position.set(0,1.65,21);camera.rotation.order='YXZ';
scene.add(new THREE.HemisphereLight('#b8e5df','#182026',1.8));
const warmLight=new THREE.DirectionalLight('#ffd6a0',1.5);warmLight.position.set(5,9,4);scene.add(warmLight);

const world=new THREE.Group();scene.add(world);
const floorMaterial=new THREE.MeshStandardMaterial({color:'#26363a',roughness:.94});
const wallMaterial=new THREE.MeshStandardMaterial({color:'#53625e',roughness:.9});
const darkMaterial=new THREE.MeshStandardMaterial({color:'#10191d',roughness:1});
const solidMeshes:THREE.Mesh[]=[];
function box(x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);world.add(mesh);solidMeshes.push(mesh);return mesh}

// Five pairs of rooms line a central corridor. Open doorways keep the route readable.
box(0,-.15,-3,26,.3,54,floorMaterial);box(0,4.1,-3,26,.25,54,darkMaterial);
box(-13,2,-3,.4,4.2,54,wallMaterial);box(13,2,-3,.4,4.2,54,wallMaterial);
box(0,2,24,26,4.2,.4,wallMaterial);box(0,2,-30,26,4.2,.4,wallMaterial);
const dividers=[21,11,1,-9,-19,-29];
dividers.forEach(z=>{box(-8,2,z,10,4,.35,wallMaterial);box(8,2,z,10,4,.35,wallMaterial)});
const grid=new THREE.GridHelper(52,52,'#5f8b83','#344b4b');grid.position.y=.01;world.add(grid);

const interactables:{mesh:THREE.Mesh;room:Room;item:Exhibit}[]=[];
function textTexture(room:Room,item:Exhibit,index:number){
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d')!;
  ctx.fillStyle='#0b151a';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle=room.accent;ctx.lineWidth=7;ctx.strokeRect(8,8,496,240);
  ctx.fillStyle=room.accent;ctx.font='22px monospace';ctx.fillText(`${room.number}.${index+1} / ${room.title.toUpperCase()}`,30,48);
  ctx.fillStyle='#edf6f1';ctx.font='bold 36px sans-serif';const words=item.title.split(' ');let line='',y=108;
  words.forEach(word=>{const test=line+word+' ';if(ctx.measureText(test).width>450){ctx.fillText(line,30,y);line=word+' ';y+=43}else line=test});ctx.fillText(line,30,y);
  ctx.fillStyle='#91aaa5';ctx.font='17px monospace';ctx.fillText('APPROACH + PRESS E TO READ',30,220);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearFilter;return texture;
}

rooms.forEach(room=>{
  const [x,y,z]=room.position;const left=x<0;
  room.items.forEach((item,index)=>{
    const material=new THREE.MeshBasicMaterial({map:textTexture(room,item,index)});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.8),material);
    mesh.rotation.y=left?Math.PI/2:-Math.PI/2;mesh.position.set(left?-12.72:12.72,y,z+(index?2.2:-2.2));world.add(mesh);interactables.push({mesh,room,item});
    const glow=new THREE.PointLight(room.accent,.85,6);glow.position.copy(mesh.position);glow.position.x+=left?1:-1;glow.position.y+=.4;world.add(glow);
  });
});

type Enemy={group:THREE.Group;health:number;cooldown:number;phase:number;alive:boolean;spawn:THREE.Vector3};
type Projectile={mesh:THREE.Mesh;velocity:THREE.Vector3;life:number};
const enemies:Enemy[]=[];const enemyShots:Projectile[]=[],playerShots:Projectile[]=[];
const darkClothesMaterial=new THREE.MeshStandardMaterial({color:'#25323a',roughness:.9});
const enemyWeaponMaterial=new THREE.MeshStandardMaterial({color:'#8d2632',emissive:'#460811',roughness:.5});
const enemyShotMaterial=new THREE.MeshBasicMaterial({color:'#ff5964'}),playerShotMaterial=new THREE.MeshBasicMaterial({color:'#63f3ff'});
const shotGeometry=new THREE.SphereGeometry(.09,6,6);
const projectileRaycaster=new THREE.Raycaster(),projectileLine=new THREE.Line3(),closestProjectilePoint=new THREE.Vector3();
const enemySpawns=[new THREE.Vector3(-7,1.05,15),new THREE.Vector3(7,1.05,5),new THREE.Vector3(-7,1.05,-5),new THREE.Vector3(7,1.05,-15),new THREE.Vector3(-7,1.05,-25)];
function createEnemy(spawn:THREE.Vector3,index:number){
  const group=new THREE.Group();
  const skin=new THREE.MeshStandardMaterial({color:['#c98e69','#9b6549','#d5a17e'][index%3],roughness:.88});
  const coat=new THREE.MeshStandardMaterial({color:['#d5d9d4','#c9d4d2','#ddd8ca'][index%3],roughness:.84});
  const hairMaterial=new THREE.MeshStandardMaterial({color:['#352a25','#17191b','#6d655c'][index%3],roughness:1});
  const shirt=new THREE.MeshStandardMaterial({color:['#657681','#4d6570','#79817c'][index%3],roughness:.9});
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,position:[number,number,number],rotation:[number,number,number]=[0,0,0])=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);mesh.rotation.set(...rotation);group.add(mesh);return mesh};

  // Faceted anatomy and layered clothing keep the silhouette human without a heavy model file.
  add(new THREE.CylinderGeometry(.33,.43,.72,7),shirt,[0,.12,0]);
  add(new THREE.CylinderGeometry(.39,.52,1.02,7,1,false,0,Math.PI),coat,[0,.02,.015],[0,Math.PI/2,0]);
  add(new THREE.BoxGeometry(.28,.88,.055),coat,[-.25,-.13,.29],[0,0,-.06]);
  add(new THREE.BoxGeometry(.28,.88,.055),coat,[.25,-.13,.29],[0,0,.06]);
  add(new THREE.BoxGeometry(.06,.48,.035),darkClothesMaterial,[0,.2,.315],[0,0,-.12]);

  const head=add(new THREE.SphereGeometry(.285,9,7),skin,[0,.91,.015]);head.scale.set(.92,1.08,.9);
  add(new THREE.ConeGeometry(.055,.14,5),skin,[0,.9,.275],[Math.PI/2,0,0]);
  add(new THREE.SphereGeometry(.055,6,5),skin,[-.27,.91,.015]);add(new THREE.SphereGeometry(.055,6,5),skin,[.27,.91,.015]);
  const hair=add(new THREE.SphereGeometry(.295,9,6,0,Math.PI*2,0,Math.PI*.49),hairMaterial,[0,1.01,.005]);hair.scale.set(.95,1,.92);
  add(new THREE.BoxGeometry(.18,.075,.025),darkClothesMaterial,[-.12,.96,.27]);add(new THREE.BoxGeometry(.18,.075,.025),darkClothesMaterial,[.12,.96,.27]);add(new THREE.BoxGeometry(.065,.025,.025),darkClothesMaterial,[0,.96,.27]);

  const armGeometry=new THREE.CapsuleGeometry(.105,.52,3,6);
  add(armGeometry,coat,[-.43,.18,.13],[-.72,0,-.2]);add(armGeometry,coat,[.43,.18,.13],[-.72,0,.2]);
  add(new THREE.SphereGeometry(.115,7,5),skin,[-.31,-.13,.43]);add(new THREE.SphereGeometry(.115,7,5),skin,[.31,-.13,.43]);
  const legGeometry=new THREE.CapsuleGeometry(.13,.62,3,6);
  add(legGeometry,darkClothesMaterial,[-.19,-.82,0]);add(legGeometry,darkClothesMaterial,[.19,-.82,0]);
  add(new THREE.BoxGeometry(.3,.18,.48),darkClothesMaterial,[-.19,-1.25,.1]);add(new THREE.BoxGeometry(.3,.18,.48),darkClothesMaterial,[.19,-1.25,.1]);

  add(new THREE.CylinderGeometry(.12,.14,.68,8),enemyWeaponMaterial,[0,-.05,.55],[Math.PI/2,0,0]);
  add(new THREE.CylinderGeometry(.19,.19,.11,8),darkClothesMaterial,[0,-.05,.88],[Math.PI/2,0,0]);
  add(new THREE.SphereGeometry(.105,8,6),enemyShotMaterial,[0,-.05,.96]);
  group.position.copy(spawn);group.scale.setScalar(1.08);world.add(group);
  const enemy:Enemy={group,health:3,cooldown:1.2+index*.25,phase:index*1.3,alive:true,spawn:spawn.clone()};group.traverse(object=>object.userData.enemy=enemy);enemies.push(enemy);
}
enemySpawns.forEach(createEnemy);

let audioContext:AudioContext|null=null;
function enableAudio(){audioContext??=new AudioContext();if(audioContext.state==='suspended')audioContext.resume()}
function sound(frequency:number,duration:number,type:OscillatorType='square',volume=.035,slide=0){
  if(!audioContext)return;const now=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,now);osc.frequency.exponentialRampToValueAtTime(Math.max(30,frequency+slide),now+duration);gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain).connect(audioContext.destination);osc.start(now);osc.stop(now+duration);
}
let lastPlayerShot=0,playerHealth=100,firing=false;
const healthDisplay=document.querySelector<HTMLElement>('#player-health')!,enemyDisplay=document.querySelector<HTMLElement>('#enemy-count')!;
function updateCombatHud(){healthDisplay.textContent=String(Math.max(0,playerHealth));enemyDisplay.textContent=String(enemies.filter(enemy=>enemy.alive).length)}
function shoot(){
  if(!active||!panel.hidden||playerHealth<=0)return;const now=performance.now();if(now-lastPlayerShot<180)return;lastPlayerShot=now;sound(190,.09,'square',.045,520);
  const direction=new THREE.Vector3();camera.getWorldDirection(direction);const mesh=new THREE.Mesh(shotGeometry,playerShotMaterial);mesh.position.copy(camera.position).addScaledVector(direction,.65);world.add(mesh);playerShots.push({mesh,velocity:direction.multiplyScalar(24),life:1.4});
}
function revive(){
  playerHealth=100;camera.position.set(0,1.65,21);yaw=0;pitch=0;firing=false;rightClickForward=false;enemyShots.splice(0).forEach(shot=>world.remove(shot.mesh));playerShots.splice(0).forEach(shot=>world.remove(shot.mesh));deathPanel.hidden=true;active=true;updateCombatHud();canvas.requestPointerLock();
}
function damagePlayer(){
  playerHealth=Math.max(0,playerHealth-10);sound(65,.2,'sawtooth',.07,-30);document.body.classList.remove('damage-flash');void document.body.offsetWidth;document.body.classList.add('damage-flash');updateCombatHud();
  if(playerHealth===0){active=false;firing=false;rightClickForward=false;keys.clear();document.exitPointerLock();deathPanel.hidden=false;prompt.textContent='Integrity lost'}
}
updateCombatHud();

const mapRooms=document.querySelector<HTMLElement>('#map-rooms')!;
rooms.forEach(room=>{const marker=document.createElement('span');marker.className=`map-room ${room.position[0]<0?'left':'right'}`;marker.style.top=`${((16-room.position[2])/40)*85}%`;marker.innerHTML=`${room.number}<br>${room.title}`;marker.style.borderColor=room.accent;mapRooms.append(marker)});

const keys=new Set<string>();let yaw=0,pitch=0,active=false,rightClickForward=false,nearby:typeof interactables[number]|null=null;
const intro=document.querySelector<HTMLElement>('#intro')!,panel=document.querySelector<HTMLElement>('#info-panel')!,deathPanel=document.querySelector<HTMLElement>('#death-panel')!;
const prompt=document.querySelector<HTMLElement>('#prompt')!,minimap=document.querySelector<HTMLElement>('#minimap')!;
function enter(){enableAudio();if(playerHealth<=0)return;active=true;intro.hidden=true;prompt.textContent='Arrows to move · Mouse to look · Hold left click to fire';if(document.pointerLockElement!==canvas)canvas.requestPointerLock()}
document.querySelector('#enter')!.addEventListener('click',enter);
document.querySelector('#revive')!.addEventListener('click',revive);
canvas.addEventListener('click',()=>{if(!active)enter()});
canvas.addEventListener('contextmenu',event=>event.preventDefault());
canvas.addEventListener('mousedown',event=>{if(event.button===0){enter();firing=true;shoot()}if(event.button===2){event.preventDefault();enter();rightClickForward=true}});
document.addEventListener('mouseup',event=>{if(event.button===0)firing=false;if(event.button===2)rightClickForward=false});
document.addEventListener('mousemove',event=>{if(document.pointerLockElement!==canvas||!active||!panel.hidden)return;yaw-=event.movementX*.003;pitch=Math.max(-1.15,Math.min(1.15,pitch-event.movementY*.003))});
document.addEventListener('keydown',event=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)&&active){event.preventDefault();keys.add(event.code)}
  if(event.code==='ShiftLeft'||event.code==='ShiftRight'||event.code==='AltLeft'||event.code==='AltRight')keys.add(event.code);
  if(event.code==='KeyE')openNearby();
  if(event.code==='Escape'){active=false;firing=false;rightClickForward=false;keys.clear();prompt.textContent='Click to resume'}
  if(event.code==='KeyM'){minimap.hidden=!minimap.hidden;document.querySelector('#map-toggle')!.setAttribute('aria-expanded',String(!minimap.hidden))}
});
document.addEventListener('keyup',event=>keys.delete(event.code));
document.querySelector('#map-toggle')!.addEventListener('click',()=>{minimap.hidden=!minimap.hidden;document.querySelector('#map-toggle')!.setAttribute('aria-expanded',String(!minimap.hidden))});

function openNearby(){
  if(!nearby)return;const {room,item}=nearby;document.querySelector('#panel-room')!.textContent=`Room ${room.number} · ${room.title}`;
  document.querySelector('#panel-title')!.textContent=item.title;document.querySelector('#panel-text')!.textContent=item.text;const link=document.querySelector<HTMLAnchorElement>('#panel-link')!;
  link.hidden=!item.link;if(item.link){link.href=item.link;link.innerHTML=`${item.label??'Continue'} <span>↗</span>`}panel.hidden=false;firing=false;rightClickForward=false;keys.clear();document.exitPointerLock();
}
function closePanel(){panel.hidden=true;active=true;prompt.textContent='Arrows to move · Mouse to look · Left click to fire';canvas.requestPointerLock()}
document.querySelector('#close-panel')!.addEventListener('click',closePanel);document.querySelector('#touch-read')!.addEventListener('click',openNearby);
document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(button=>{
  const codes:Record<string,string>={forward:'ArrowUp',backward:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};const code=codes[button.dataset.move!];
  button.addEventListener('pointerdown',()=>{enter();keys.add(code)});button.addEventListener('pointerup',()=>keys.delete(code));button.addEventListener('pointercancel',()=>keys.delete(code));
});

function canMove(from:THREE.Vector3,next:THREE.Vector3){
  if(next.x<-12.2||next.x>12.2||next.z<-28.2||next.z>22.2)return false;
  return !dividers.some(z=>Math.abs(next.x)>3.15&&(from.z-z)*(next.z-z)<=0);
}
function wallHitDistance(start:THREE.Vector3,displacement:THREE.Vector3){
  const distance=displacement.length();if(distance===0)return Infinity;projectileRaycaster.set(start,displacement.clone().normalize());projectileRaycaster.near=0;projectileRaycaster.far=distance;return projectileRaycaster.intersectObjects(solidMeshes,false)[0]?.distance??Infinity;
}
const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
  if(active&&panel.hidden){
    const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(-forward.z,0,forward.x),movement=new THREE.Vector3();
    if(keys.has('ArrowUp')||rightClickForward)movement.add(forward);if(keys.has('ArrowDown'))movement.sub(forward);
    const strafing=keys.has('AltLeft')||keys.has('AltRight');if(strafing&&keys.has('ArrowLeft'))movement.sub(right);if(strafing&&keys.has('ArrowRight'))movement.add(right);
    if(!strafing&&keys.has('ArrowLeft'))yaw+=dt*2.2;if(!strafing&&keys.has('ArrowRight'))yaw-=dt*2.2;
    if(movement.lengthSq()){const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');movement.normalize().multiplyScalar(dt*(sprint?11:7));const next=camera.position.clone().add(movement);if(canMove(camera.position,next))camera.position.copy(next)}
    if(firing)shoot();
  }
  camera.rotation.set(pitch,yaw,0);
  enemies.forEach(enemy=>{
    if(!enemy.alive)return;enemy.group.scale.lerp(new THREE.Vector3(1.08,1.08,1.08),Math.min(1,dt*12));enemy.group.position.y=enemy.spawn.y;enemy.group.lookAt(camera.position.x,enemy.group.position.y,camera.position.z);
    if(active&&panel.hidden&&enemy.group.position.distanceTo(camera.position)<18){enemy.cooldown-=dt;if(enemy.cooldown<=0){enemy.cooldown=1.6+Math.random()*.7;const mesh=new THREE.Mesh(shotGeometry,enemyShotMaterial);mesh.position.copy(enemy.group.position).add(new THREE.Vector3(0,.05,0));const velocity=camera.position.clone().add(new THREE.Vector3(0,-.15,0)).sub(mesh.position).normalize().multiplyScalar(8);world.add(mesh);enemyShots.push({mesh,velocity,life:3});sound(115,.12,'square',.025,-55)}}
  });
  for(let index=playerShots.length-1;index>=0;index--){
    const shot=playerShots[index],start=shot.mesh.position.clone(),displacement=shot.velocity.clone().multiplyScalar(dt),wallDistance=wallHitDistance(start,displacement);shot.life-=dt;
    projectileRaycaster.set(start,displacement.clone().normalize());projectileRaycaster.near=0;projectileRaycaster.far=Math.min(displacement.length(),wallDistance);const enemyHit=projectileRaycaster.intersectObjects(enemies.filter(enemy=>enemy.alive).map(enemy=>enemy.group),true)[0];
    if(enemyHit){const enemy=enemyHit.object.userData.enemy as Enemy;enemy.health--;enemy.group.scale.set(1.25,.82,1.25);sound(95,.12,'sawtooth',.035,-45);shot.life=0;if(enemy.health<=0){enemy.alive=false;enemy.group.visible=false;sound(150,.38,'sawtooth',.06,-120);updateCombatHud()}}
    else if(wallDistance<=displacement.length())shot.life=0;else shot.mesh.position.add(displacement);
    if(shot.life<=0){world.remove(shot.mesh);playerShots.splice(index,1)}
  }
  for(let index=enemyShots.length-1;index>=0;index--){
    const shot=enemyShots[index],start=shot.mesh.position.clone(),displacement=shot.velocity.clone().multiplyScalar(dt),wallDistance=wallHitDistance(start,displacement),end=start.clone().add(displacement);shot.life-=dt;
    projectileLine.set(start,end);projectileLine.closestPointToPoint(camera.position,true,closestProjectilePoint);const playerDistance=start.distanceTo(closestProjectilePoint);
    if(closestProjectilePoint.distanceTo(camera.position)<.48&&playerDistance<wallDistance){damagePlayer();shot.life=0}else if(wallDistance<=displacement.length())shot.life=0;else shot.mesh.position.copy(end);
    if(shot.life<=0){world.remove(shot.mesh);enemyShots.splice(index,1)}
  }
  nearby=null;let best=3.1;interactables.forEach(entry=>{const d=camera.position.distanceTo(entry.mesh.position);if(d<best){best=d;nearby=entry}});
  if(playerHealth>0)prompt.textContent=nearby?`[ E ] Inspect ${(nearby as typeof interactables[number]).item.title}`:(active?'Arrows to move · Mouse to look · Hold left click to fire':'Click to resume');
  const mapPlayer=document.querySelector<HTMLElement>('#map-player')!;mapPlayer.style.left=`${((camera.position.x+13)/26)*100}%`;mapPlayer.style.top=`${((24-camera.position.z)/54)*100}%`;
  renderer.render(scene,camera);
}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();animate();

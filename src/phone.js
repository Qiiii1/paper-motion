import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';

export function mountPhone(canvas,getProgress) {
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(28,1,.01,20);
  camera.position.z=3.5;
  scene.add(new THREE.HemisphereLight(0xffffff,0xaca6be,2.2));
  for(const [x,y,power] of [[3,3,3],[-4,1,3.5],[1,-2,2]]){
    const light=new THREE.DirectionalLight(0xffffff,power);
    light.position.set(x,y,3);scene.add(light);
  }
  const pivot=new THREE.Group();scene.add(pivot);
  let model,display,disposed=false;
  const screenNames=['screen-loop-b','screen-editor','screen-library','screen-loop-a'];
  const textures=screenNames.map(name=>{
    const tex=new THREE.TextureLoader().load('/studio/'+name+'.webp',()=>{if(!disposed) draw()});
    tex.colorSpace=THREE.SRGBColorSpace;return tex;
  });
  function draw(){
    if(!model||disposed) return;
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if(!w||!h) return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    const p=getProgress();
    pivot.rotation.y=Math.sin(p*Math.PI*2)*.65 + (1-Math.min(1,p/.27))*2.85;
    pivot.rotation.z=.14*(1-Math.min(1,p/.38))-.045*Math.sin(p*Math.PI*2);
    display.map=textures[Math.min(3,Math.floor(p*4))];
    renderer.render(scene,camera);canvas.style.opacity='1';
  }
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  function free(object){object.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();mesh.material.dispose()}})}
  loader.load('/studio/iphone.glb',({scene:object})=>{
    if(disposed){free(object);return}
    model=object;
    model.traverse(mesh=>{
      if(!mesh.isMesh) return;
      if(mesh.material.name==='Glass') mesh.visible=false;
      if(mesh.material.name!=='Display')return;
      const geom=mesh.geometry;
      // GLB positions are quantized. BufferAttribute getters decode them.
      geom.computeBoundingBox();
      const {min,max}=geom.boundingBox, pos=geom.attributes.position, uv=[];
      for(let i=0;i<pos.count;i++)uv.push((pos.getX(i)-min.x)/(max.x-min.x),(pos.getY(i)-min.y)/(max.y-min.y));
      geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      mesh.material.dispose();display=new THREE.MeshBasicMaterial({map:textures[0],side:THREE.DoubleSide});mesh.material=display;
    });
    const box=new THREE.Box3().setFromObject(model);
    const center=box.getCenter(new THREE.Vector3());model.position.sub(center);
    pivot.scale.setScalar(1.46/(box.max.y-box.min.y));pivot.add(model);draw();
  },undefined,()=>{canvas.style.opacity='0'});
  const resize=new ResizeObserver(draw);resize.observe(canvas);
  return {draw,dispose(){disposed=true;resize.disconnect();if(model)free(model);textures.forEach(t=>t.dispose());renderer.dispose();canvas.style.opacity='0'}};
}

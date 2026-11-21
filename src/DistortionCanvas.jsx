import React,{useEffect,useRef} from 'react';
import { papers } from './papers';
import { loadPages } from './renderer';

const vert = 'attribute vec2 a; varying vec2 uv; void main(){uv=vec2(a.x,-a.y)*0.5+0.5;gl_Position=vec4(a,0.,1.);}';
const frag = `
precision mediump float;
uniform vec2 screen;
uniform sampler2D atlas;
uniform float mode, amount, position;
varying vec2 uv;
vec3 wall(vec2 p) {
  float cols = mix(1.38,3.2,smoothstep(.62,1.8,screen.x/screen.y));
  vec2 tiled = p * vec2(cols,cols*.774*screen.y/screen.x) + vec2(.36,position*.8);
  vec2 index = floor(tiled);
  float tile = mod(index.x+2.*index.y,6.);
  vec2 st = fract(tiled);
  float ink = step(.027,st.x)*step(.027,st.y);
  st = clamp((st-.027)/.973,0.002,0.998);
  return mix(vec3(.055,.05,.055),texture2D(atlas,(st+vec2(mod(tile,3.),floor(tile/3.)))/vec2(3.,2.)).rgb,ink);
}
void main() {
  vec2 p = uv-.5;
  float r = length(p);
  if(mode>2.5) p *= 1.+amount*(r*r*3.8-.63);
  if(mode>1.5 && mode<2.5) p += .065*amount*vec2(sin(p.y*11.+position*4.),cos(p.x*8.));
  if(mode>.5 && mode<1.5) p *= 1.-amount*.35*exp(-3.*r);
  float fringe=mode>.5?amount*(mode<1.5?.055:.024):0.;
  vec2 offset=fringe*(p+vec2(.15,0.));
  vec3 rgb=vec3(wall(p+.5+offset).r,wall(p+.5).g,wall(p+.5-offset).b);
  if(mode>.5 && mode<1.5) rgb+=vec3(.24,.16,.08)*amount*exp(-5.*abs(r-.37));
  gl_FragColor=vec4(rgb*.89,1.);
}`;
export function DistortionCanvas({mode,amount,progress,near}) {
  const node=useRef(null), painter=useRef(null);
  const live=useRef();live.current={mode,amount,progress};
  useEffect(()=>{
    if (!near) return;
    const canvas=node.current, gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
    if (!gl) return;
    let cancelled=false,texture,buf,program,resize;
    loadPages().then(images=>{
      if(cancelled) return;
      const art=document.createElement('canvas');art.width=3*384;art.height=2*496;
      const ctx=art.getContext('2d');
      images.forEach((im,i)=>{
        const x=i%3*384,y=Math.floor(i/3)*496;
        ctx.fillStyle='#fff';ctx.fillRect(x,y,384,496);
        const scale=Math.min(384/im.width,496/im.height),w=im.width*scale,h=im.height*scale;
        ctx.drawImage(im,x+(384-w)/2,y+(496-h)/2,w,h);
        ctx.globalCompositeOperation='multiply';ctx.fillStyle=papers[i][2];ctx.fillRect(x,y,384,496);ctx.globalCompositeOperation='source-over';
      });
      program=gl.createProgram();
      for(const [type,code] of [[gl.VERTEX_SHADER,vert],[gl.FRAGMENT_SHADER,frag]]){
        const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);gl.attachShader(program,s);gl.deleteShader(s);
      }
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
      gl.useProgram(program);
      texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,art);
      buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
      const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
      const u=Object.fromEntries(['screen','amount','mode','position'].map(k=>[k,gl.getUniformLocation(program,k)]));
      painter.current=()=>{
        const d=Math.min(devicePixelRatio,1.6),w=Math.max(1,Math.round(canvas.clientWidth*d)),h=Math.max(1,Math.round(canvas.clientHeight*d));
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
        const v=live.current;gl.uniform2f(u.screen,w,h);gl.uniform1f(u.amount,v.amount/100);gl.uniform1f(u.mode,v.mode);gl.uniform1f(u.position,v.progress);gl.drawArrays(gl.TRIANGLES,0,3);
      };
      resize=new ResizeObserver(painter.current);resize.observe(canvas);painter.current();
    }).catch(()=>{});
    return ()=>{cancelled=true;resize?.disconnect();painter.current=null;gl.deleteTexture(texture||null);gl.deleteBuffer(buf||null);gl.deleteProgram(program||null)};
  },[near]);
  useEffect(()=>{painter.current?.()},[mode,amount,progress]);
  return <div className={'distort-art effect-'+mode} style={{'--strength':amount/100}} aria-hidden="true">
    <div className="poster-fallback">{[...papers,...papers].map(([id],i)=><img key={i} src={'/papers/'+id+'.png'} alt="" loading="lazy"/>)}</div>
    <canvas ref={node}/>
  </div>;
}

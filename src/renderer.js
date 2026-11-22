import { makeProgram } from './glProgram';
import { createOpeningLens } from './openingLens';
import { papers } from './papers';
import { COUNT } from './choreography';

const vertex = `
attribute vec2 uv;
uniform vec2 viewport, size;
uniform vec3 position, rotation;
uniform float camera, bend, cylinder;
uniform mediump float clock, phase;
varying mediump vec2 coord;
varying mediump float shading;
void main() {
  vec2 p = (uv - 0.5) * size;
  float wave = (uv.y * 4.6 + uv.x * 2.5) + clock * 1.7 + phase;
  float edge = uv.y * uv.y * 0.55 + pow(abs(uv.x - 0.5) * 2.0, 2.0) * 0.70;
  float wind = bend*(1.0-cylinder);
  float across = 2.0*uv.x-1.0;
  float z = (sin(wave)*edge*wind + cylinder*bend*across*across)*size.y;
  p.x += sin(wave + 0.85) * edge * size.x * wind * 0.23;
  p.y += cos(wave) * edge * size.y * wind * 0.12;
  vec3 c = cos(rotation), s = sin(rotation);
  vec3 v = vec3(p.x*c.x+z*s.x, p.y, -p.x*s.x+z*c.x);
  v.yz = vec2(v.y*c.y-v.z*s.y, v.y*s.y+v.z*c.y);
  v.xy = vec2(v.x*c.z-v.y*s.z, v.x*s.z+v.y*c.z);
  v += position;
  float perspective = 1.0 - v.z/camera;
  gl_Position = vec4(v.xy * vec2(2.0,-2.0)/viewport, -v.z/camera, perspective);
  coord = uv;
  shading = 0.98 - (0.5 + 0.5*cos(wave)) * edge * wind * 1.3 - cylinder*bend*across*.24;
}`;
const fragment = `
precision mediump float;
uniform sampler2D page;
uniform vec3 paperColor;
uniform vec2 fit;
uniform float glow, phase, clock, negative, lensMix;
varying mediump vec2 coord;
varying mediump float shading;
void main() {
  float offset = (1.0-lensMix) * (0.002 + 0.009 * glow) * (0.25 + abs(coord.x - 0.5));
  vec2 sampleUV = (coord - 0.5)*fit + 0.5;
  vec3 printed = vec3(texture2D(page, sampleUV + vec2(offset,0.)).r,
                      texture2D(page, sampleUV).g,
                      texture2D(page, sampleUV - vec2(offset,0.)).b);
  if (any(lessThan(sampleUV,vec2(0.0))) || any(greaterThan(sampleUV,vec2(1.0)))) printed = vec3(1.0);
  vec3 lightPaper = mix(vec3(0.05,0.075,0.12), paperColor, printed);
  vec3 darkPaper = mix(vec3(0.99,0.94,0.87), paperColor*vec3(0.28,0.29,0.36), printed);
  vec3 base = mix(lightPaper, darkPaper, negative) * shading;
  vec3 plain = base;
  if(lensMix>=1.) {gl_FragColor=vec4(plain,1.); return;}
  float edge = coord.x * 0.68 + coord.y * 0.32;
  float ray = (1.0-edge)*1.7 + glow*1.1 + phase*0.04 + 0.07*sin(clock*0.7);
  vec3 spectrum = 0.5 + 0.5*cos(6.2832*(ray+vec3(0.0,0.31,0.64)));
  float fringe = (1.0-smoothstep(0.01,0.24,abs(edge-glow*0.95))) * (0.15+0.7*glow);
  base = mix(base, spectrum*0.70+0.30, fringe*min(1.,glow*8.));
  float bright = smoothstep(0.27,1.0,glow + (0.30-edge)*0.85);
  gl_FragColor = vec4(mix(mix(base,vec3(1.0),bright),plain,lensMix),1.0);
}`;

export function loadPages() {
  return Promise.all(papers.map(([slug]) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Paper unavailable: ' + slug));
    img.src = '/papers/' + slug + '.png';
  })));
}

// A power-of-two texture gives small moving sheets clean, filtered text.
function textureFor(gl, img) {
  const raster = document.createElement('canvas');
  raster.width = 512; raster.height = 1024;
  const ctx = raster.getContext('2d');
  ctx.drawImage(img, 0, 0, raster.width, raster.height);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

export function createRenderer(canvas, imgs) {
  const options = {alpha:true,antialias:true,powerPreference:'low-power'};
  const gl = canvas.getContext('webgl2',options) || canvas.getContext('webgl',options);
  if (!gl) return null;
  const lens = createOpeningLens(gl);
  const program = makeProgram(gl,vertex,fragment);
  gl.useProgram(program);
  const points = [], faces = [];
  const nx = 12, ny = 16;
  for (let y = 0; y <= ny; y++) {
    for (let x = 0; x <= nx; x++) {
      points.push(x / nx, y / ny);
      if (x < nx && y < ny) {
        const n = y * (nx + 1) + x;
        faces.push(n, n+1, n+nx+1, n+1, n+nx+2, n+nx+1);
      }
    }
  }
  const vertices = gl.createBuffer(), indices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
  const uv = gl.getAttribLocation(program,'uv');
  gl.enableVertexAttribArray(uv);
  gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries('viewport size position rotation camera clock bend phase cylinder glow paperColor negative fit lensMix'.split(' ').map(k => [k,gl.getUniformLocation(program,k)]));
  const textures = imgs.map(img => textureFor(gl,img));
  const colors = papers.map(([, , hex]) => hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255));
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0,0,0,0);
  return {
    draw(poses, w, h, time, light) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER,vertices);
      gl.enableVertexAttribArray(uv);
      gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
      gl.uniform1f(uniforms.lensMix,Math.min(1,light.edge/.9));
      const width = Math.round(w*dpr), height = Math.round(h*dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
        gl.viewport(0,0,width,height);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(uniforms.viewport,w,h);
      gl.uniform1f(uniforms.camera, Math.max(w,h)*1.65);
      gl.uniform1f(uniforms.clock,time);
      poses.forEach(([x,y,z,yaw,pitch,roll,width,bend,glow,height,cylinder=0],i) => {
        if (width < 0.25 || height < 0.25) return;
        const idx = i % imgs.length;
        gl.bindTexture(gl.TEXTURE_2D,textures[idx]);
        gl.uniform3f(uniforms.position,x,y,z);
        gl.uniform3f(uniforms.rotation,yaw,pitch,roll);
        gl.uniform2f(uniforms.size,width,height);
        const fit = (width/height)*(imgs[idx].naturalHeight/imgs[idx].naturalWidth);
        gl.uniform2f(uniforms.fit,Math.max(1,fit),Math.max(1,1/fit));
        gl.uniform1f(uniforms.bend,bend);
        gl.uniform1f(uniforms.cylinder,cylinder);
        gl.uniform1f(uniforms.glow,glow);
        gl.uniform1f(uniforms.phase,i*1.76);
        gl.uniform3fv(uniforms.paperColor,colors[idx]);
        gl.uniform1f(uniforms.negative,Number(idx === 1 || idx === 4));
        gl.drawElements(gl.TRIANGLES,faces.length,gl.UNSIGNED_SHORT,0);
      });
      if(light.edge>0) lens.draw(width,height,dpr,light);
    },
    dispose() {
      lens.dispose();
      textures.forEach(t=>gl.deleteTexture(t));
      gl.deleteBuffer(vertices); gl.deleteBuffer(indices); gl.deleteProgram(program);
    },
  };
}

// A row of narrow strips follows the same cylindrical cross-section on
// devices without WebGL. Flat and wind-blown sheets use a single image.
export function createDOMRenderer(host, imgs) {
  const divisions=8;
  const nodes=Array.from({length:COUNT},(_,i)=>{
    const node=document.createElement('div');
    node.className='fallback-sheet';
    const img=imgs[i%imgs.length].cloneNode();
    img.alt=''; node.append(img);
    const strips=Array.from({length:divisions},(_,j)=>{
      const strip=document.createElement('i');
      strip.style.backgroundImage='url("'+img.src+'")';
      strip.style.backgroundPosition=(j/(divisions-1)*100)+'% center';
      node.append(strip);
      return strip;
    });
    host.append(node);
    return {node,img,strips};
  });
  return {
    draw(poses,w,h,time,light) {
      const camera=Math.max(w,h)*1.65;
      host.style.perspective=camera+'px';
      poses.forEach(([x,y,z,yaw,pitch,roll,width,bend,glow,height,cylinder=0],i)=>{
        const {node,img,strips}=nodes[i];
        node.hidden=width<.25 || height<.25;
        if(node.hidden) return;
        const style=node.style;
        style.width=width+'px'; style.height=height+'px';
        style.transform='translate3d('+x+'px,'+y+'px,'+z+'px) translate(-50%,-50%) rotateZ('+roll+'rad) rotateX('+pitch+'rad) rotateY('+yaw+'rad) skewX('+(1-cylinder)*bend*.3+'rad)';
        const r=Math.hypot(x,y)/(Math.min(w,h)*.1616);
        const exposure=1+light.exposure*Math.exp(-r*r)*.8;
        const curved=Math.abs(bend*cylinder)>.0005;
        img.hidden=curved; img.style.filter='brightness('+exposure+')';
        strips.forEach((strip,j)=>{
          strip.hidden=!curved;
          if(!curved) return;
          const left=j/divisions, right=(j+1)/divisions;
          const z0=(2*left-1)**2*height*bend*cylinder;
          const z1=(2*right-1)**2*height*bend*cylinder;
          const dx=width/divisions;
          strip.style.width=(Math.hypot(dx,z1-z0)+.22)+'px';
          strip.style.transform='translate3d('+left*width+'px,0,'+z0+'px) rotateY('+(-Math.atan2(z1-z0,dx))+'rad)';
          strip.style.filter='brightness('+exposure+')';
        });
      });
    },
    dispose() { host.replaceChildren(); },
  };
}

import { makeProgram } from './glProgram.js';
import { ease } from './choreography.js';

// Scroll distance is measured in viewport heights. These two envelopes were
// sampled separately: the central exposure recedes before the dispersion does.
const exposureCurve = [[0,1],[.12,.9894],[.30,.8276],[.50,.2789],[.72,.0135],[1,0]];
const dispersionCurve = [[0,1],[.12,1],[.30,.9398],[.50,.4745],[.72,.45],[1.8,.45],[2.1,.444],[2.5,.3844]];
const edgeCurve = [[0,1],[1.8,1],[2.1,.9913],[2.5,.9052]];
const noLens = {exposure:0,dispersion:0,edge:0};

export function lensAt(screens) {
  if (screens>=3.2) return noLens;
  const fade = 1-ease(2.5,3.2,screens);
  return {
    exposure: sample(exposureCurve,screens),
    dispersion: fade*sample(dispersionCurve,screens),
    edge: fade*sample(edgeCurve,screens),
  };
}
function sample(keys,x) {
  for (let i=1;i<keys.length;i++) {
    const [end,b]=keys[i];
    if (x<=end) {
      const [start,a]=keys[i-1];
      return a+(b-a)*Math.max(0,(x-start)/(end-start));
    }
  }
  return keys[keys.length-1][1];
}

const vertex=`
attribute vec2 point;
varying highp vec2 uv;
void main() {
  uv=point*.5+.5;
  gl_Position=vec4(point,0.,1.);
}`;
const fragment=`
precision highp float;
precision highp int;
varying highp vec2 uv;
uniform sampler2D scene, softRays;
uniform vec2 resolution;
uniform float pixelRatio;
uniform vec3 strengths;
const vec3 ground=vec3(245.,245.,247.)/255.;

float grain(vec2 pixel) {
  return fract(52.9829189*fract(dot(pixel,vec2(.06711056,.00583715))));
}
vec4 sheet(vec2 pixel) {
  vec2 st=pixel/resolution;
  if(any(lessThan(st,vec2(0.)))||any(greaterThan(st,vec2(1.))))return vec4(0.);
  return texture2D(scene,st);
}
vec3 shade(vec4 ink,float exposure) {
  return ground*(1.-ink.a)+mix(ink.rgb,vec3(ink.a),exposure);
}
vec3 disperse(vec2 position,vec2 offset,float reach,float exposure) {
  if(reach<.75*pixelRatio) return shade(sheet(position),exposure);
#ifdef SOFT_PASS
  const int limit=32;
  float count=clamp(ceil(reach/(1.5*pixelRatio)),4.,32.);
#if __VERSION__ >= 300
  uvec2 h=uvec2(gl_FragCoord.xy)*uvec2(1597334677u,3812015801u);
  float jitter=float((h.x^h.y)*1597334677u)/4294967296.;
#else
  float jitter=grain(gl_FragCoord.xy);
#endif
#else
  const int limit=16;
  float count=clamp(ceil(reach/(3.*pixelRatio)),4.,16.);
  float jitter=grain(gl_FragCoord.xy);
#endif
  vec3 total=vec3(0.), weights=vec3(0.);
  for(int i=0;i<limit;i++){
    if(float(i)>=count) break;
    float t=(float(i)+jitter)/count;
    vec3 ramp=abs(mod(4.*t+vec3(0.,4.,2.),6.)-3.)-1.;
    vec3 weight=mix(vec3(1.),clamp(ramp,0.,1.),.85);
    total+=shade(sheet(position+offset*(t-.5)),exposure)*weight;
    weights+=weight;
  }
  return total/weights;
}
void main() {
  float shortSide=min(resolution.x,resolution.y);
  vec2 radius=(uv-.5)*resolution;
  float r=length(radius)/shortSide;
  vec2 source=radius*(1.-.2*strengths.x*exp(-r*r/.3528));
  float d=length(source)/shortSide;
  float band=(d-.202)/.066;
  float edge=smoothstep(.8,1.,2.*max(abs(uv.x-.5),abs(uv.y-.5)));
  float reach=shortSide*(.0506*strengths.y*exp(-band*band)+.058*strengths.z*edge);
  float exposure=strengths.x*exp(-pow(d/.1616,2.));
  vec2 origin=source+.5*resolution;
  vec2 ray=radius*(reach/max(length(radius),.0001));
#ifdef SOFT_PASS
  vec3 rgb=ground;
  if(reach>=2.*pixelRatio) rgb=disperse(origin,ray,reach,exposure);
#else
  float blend=smoothstep(4.*pixelRatio,8.*pixelRatio,reach);
  vec3 rgb=vec3(0.);
  if(blend<1.) rgb=disperse(origin,ray,reach,exposure);
  if(blend>0.) rgb=mix(rgb,texture2D(softRays,uv).rgb,blend);
  rgb+=(grain(gl_FragCoord.xy+17.)-.5)/255.;
#endif
  gl_FragColor=vec4(rgb,1.);
}`;

export function createOpeningLens(gl) {
  function pass(defines) {
    const program=makeProgram(gl,vertex,defines+fragment);
    const location=key=>gl.getUniformLocation(program,key);
    gl.useProgram(program);
    gl.uniform1i(location('scene'),0);
    gl.uniform1i(location('softRays'),1);
    return {program,point:gl.getAttribLocation(program,'point'),size:location('resolution'),ratio:location('pixelRatio'),strengths:location('strengths')};
  }
  const half=pass('#define SOFT_PASS\n'), full=pass('');
  const triangle=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,triangle);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const framebuffer=gl.createFramebuffer();
  function layer(){
    const tex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return tex;
  }
  const ink=layer(), soft=layer();
  let width=0,height=0;
  function drawPass(pass,ratio,light) {
    gl.useProgram(pass.program);
    gl.enableVertexAttribArray(pass.point);
    gl.vertexAttribPointer(pass.point,2,gl.FLOAT,false,0,0);
    gl.uniform2f(pass.size,width,height);
    gl.uniform1f(pass.ratio,ratio);
    gl.uniform3f(pass.strengths,light.exposure,light.dispersion,light.edge);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  return {
    draw(w,h,ratio,light) {
      const hw=Math.max(1,Math.round(w/2)),hh=Math.max(1,Math.round(h/2));
      gl.activeTexture(gl.TEXTURE0);
      if(width!==w || height!==h){
        width=w;height=h;
        for(const [tex,tw,th] of [[ink,w,h],[soft,hw,hh]]){
          gl.bindTexture(gl.TEXTURE_2D,tex);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,tw,th,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        }
      }
      // Capture the already depth-tested, antialiased sheets, including alpha.
      // Only the card layer goes through this lens; type stays at native resolution.
      gl.bindTexture(gl.TEXTURE_2D,ink);
      gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,w,h);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,null);
      gl.disable(gl.DEPTH_TEST);
      gl.bindBuffer(gl.ARRAY_BUFFER,triangle);
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,soft,0);
      gl.viewport(0,0,hw,hh);
      drawPass(half,ratio,light);
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.bindTexture(gl.TEXTURE_2D,soft);
      gl.viewport(0,0,w,h);
      drawPass(full,ratio,light);
      gl.activeTexture(gl.TEXTURE0);
      gl.enable(gl.DEPTH_TEST);
    },
    dispose(){
      gl.deleteBuffer(triangle);gl.deleteFramebuffer(framebuffer);
      gl.deleteTexture(ink);gl.deleteTexture(soft);
      gl.deleteProgram(half.program);gl.deleteProgram(full.program);
    }
  };
}

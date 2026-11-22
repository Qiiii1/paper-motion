import { ease, COUNT } from './choreography.js';

export const presets = ['Carousels', 'Rings', 'Grids', 'Rolls', 'Fields', 'Reveals', 'Trails'];
export const openingScreens = 5.35;
export const presetStop = i => 0.52 + i * 0.70;
const tau = 2*Math.PI;

function layout(kind,i,t,w,h) {
  const mobile = w <= 679;
  const cx = mobile ? 0 : w*0.215, cy = mobile ? -h*0.21 : 0;
  const size = Math.min(mobile ? w*0.93 : w*0.47, h*0.66);
  let x = 0, y = 0, z = 0, yaw = 0, pitch = 0, roll = 0, width = 0.22;
  let visible = 12, bend = 0.026;
  const angle = i*tau/visible + t*0.28;
  if (kind === 0) {
    x = Math.sin(angle)*0.38; y = Math.cos(angle)*0.07;
    z = Math.cos(angle)*0.38; yaw = angle; width = 0.165;
  } else if (kind === 1) {
    visible = 24;
    const inner = i>=12, r = inner ? 0.216 : 0.405;
    const a = inner ? -angle : angle;
    x = Math.sin(a)*r; y = -Math.cos(a)*r; roll = a; width = inner ? 0.077 : 0.142;
  } else if (kind === 2) {
    visible = 20;
    x = ((i%5)-2)*0.179; y = (Math.floor(i/5)-1.5)*0.235;
    z = Math.sin(t*0.8+i*0.6)*0.05; yaw = 0.22*Math.sin(i+t); width = 0.16;
  } else if (kind === 3) {
    // Four large sheets clear the neighbouring tangent plane throughout a turn.
    visible = 4;
    const a = i*tau/visible + t*0.42;
    y = Math.sin(a)*0.38; z = Math.cos(a)*0.38; pitch = -a; width = 0.49;
  } else if (kind === 4) {
    visible = COUNT;
    const a = i*2.39996+t*0.1, r=Math.sqrt(i/COUNT);
    x = Math.sin(a)*r*.48; y = Math.cos(a)*r*.49;
    z = .28-i*.015; roll = .13*Math.sin(a); width=.025+.25*(1-r);
    bend=.016;
  } else if (kind === 5) {
    visible = 7;
    const phase=(i/visible + t*.058)%1;
    // Advance through an ordered stack. The leading cover travels around its
    // outside edge to return to the rear, leaving the other sheets in order.
    const advance=Math.min(1,phase/.63);
    const back=Math.max(0,(phase-.63)/.37);
    z=-.30+.60*(advance-ease(.29,.71,back));
    x=-.24+.045*(advance-back)+.53*Math.sin(Math.PI*back);
    y=-.025*(advance-back)-.08*Math.sin(Math.PI*back);
    yaw=.19*Math.sin(Math.PI*back);
    width=.32; bend=.012;
  } else {
    visible = 15;
    const a = i*0.28+t*0.42;
    x = Math.sin(a)*0.36; y = .22*Math.cos(a*1.7); z = (i-7)*.046;
    yaw = Math.sin(a)*.23; roll = Math.sin(a*1.6)*.13;
    width = 0.115+i*.008; bend=.022;
  }
  width = i<visible ? width*size : 0;
  return [cx+x*size, cy+y*size,z*size,yaw,pitch,roll,width,bend,0,width*1.32,0];
}
function blend(a,b,f) {
  if (f<=0) return a;
  if (f>=1) return b;
  // Retire spare cards in their own slots before incoming cards enter.
  // Invisible slots have no meaningful world position to interpolate toward.
  if (a[6]===0 || b[6]===0) {
    const arriving=a[6]===0;
    const sheet=arriving ? b : a;
    const scale=arriving ? ease(.28,1,f) : 1-ease(0,.62,f);
    const pose=sheet.slice();
    pose[1]+=(1-scale)*sheet[6]*.10;
    pose[6]*=scale;
    pose[9]*=scale;
    return pose;
  }
  return a.map((v,i)=>{
    const d=b[i]-v;
    return v+(i>=3 && i<=5 ? Math.atan2(Math.sin(d),Math.cos(d)) : d)*f;
  });
}
export function galleryPose(original,i,extra,t,w,h) {
  const cursor = Math.max(0,Math.min(6,(extra-presetStop(0))/0.70));
  const k=Math.floor(cursor);
  const next=layout(Math.min(k+1,6),i,t,w,h);
  const pose=blend(layout(k,i,t,w,h),next,ease(.36,.98,cursor-k));
  const gallery=blend(original,pose,ease(0,.48,extra));
  const fan = i<9 ? Math.min(w,h)*.32 : 0;
  const compact=[(i-4)*fan*.055,Math.sin(i)*fan*.06,(i-4)*fan*.045,0,0,(i-4)*.066,fan,.012,0,fan*1.32,0];
  return blend(gallery,compact,ease(4.86,5.58,extra));
}

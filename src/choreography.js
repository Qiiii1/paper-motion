// Camera space uses CSS pixels, with positive depth towards the viewer.
export const COUNT = 42;
const TAU = Math.PI * 2;
const mix = (a,b,t) => a + (b-a)*t;
export function ease(start,end,value) {
  const t = Math.min(1,Math.max(0,(value-start)/(end-start)));
  return t*t*(3-2*t);
}

// x, y, depth, yaw, pitch, roll, width, bend, exposure, height, cylindrical bend mix
function between(a,b,t) {
  if(t===0) return a;
  if(t===1) return b;
  return a.map((v,k)=>{
    const d=b[k]-v;
    return v+t*(k===3 ? Math.atan2(Math.sin(d),Math.cos(d)) : d);
  });
}

function onRing(angle,radius,width,cy,pitch,roll,radial,bend) {
  const x=radius*Math.sin(angle), z=radius*Math.cos(angle);
  const y=-Math.sin(pitch)*z;
  return [x*Math.cos(roll)-y*Math.sin(roll), cy+x*Math.sin(roll)+y*Math.cos(roll),
    z*Math.cos(pitch),angle+(radial?Math.PI/2:0),pitch,roll,width,bend,0,width*1.32,1];
}

// Grid slots in pickup order. The first visible sheets sit below and left of
// centre. The same sheet identities travel through the mouth of the carousel.
const pickup = [33,25,32,18,17,24,10,23,9,16];
const gateAngle = 2.56; // right of centre, behind the axle

// Collect sheets from the lower left of the grid into two concentric orbits.
// Each paper keeps the same angular slot as the wheel turns.
const focusOuter = [23,25,33,39,40,32,17,9];
const focusInner = [16,24,26,31,38,18,10];

export function focusWheelPose(grid, i, blend, turn, w, h) {
  const outerSlot = focusOuter.indexOf(i);
  const inner = outerSlot < 0;
  const slot = inner ? focusInner.indexOf(i) : outerSlot;
  const base = Math.min(w,h);

  if (slot < 0) {
    const exit = ease(.04 + .08*(i%7)/6,.64,blend);
    const size = 1-ease(.16,1,exit);
    const sheet = grid.slice();
    sheet[0] += exit*w*.40;
    sheet[1] -= exit*h*.52;
    sheet[2] -= exit*base*.30;
    sheet[6] *= size;
    sheet[9] *= size;
    return sheet;
  }

  const count = inner ? focusInner.length : focusOuter.length;
  const start = .24*slot/(count-1) + (inner ? .08 : 0);
  const join = ease(start,start+.65,blend);
  const radius = inner ? .48 : 1;
  const angle = turn + TAU*slot/count + (inner ? .11 : 0);
  const centerX = w < 680 ? -.56*w : -.35*w;
  const width = Math.min(.248*w,.147*h)*(inner ? .53 : 1);
  const roll = angle - Math.PI/2;
  const target = [
    centerX + Math.min(.405*w,.34*h)*radius*Math.cos(angle),
    .005*h + Math.min(.223*h,.56*base)*radius*Math.sin(angle),
    width*(inner ? -.48 : .14),
    -.09*Math.cos(angle), .08*Math.sin(angle),
    grid[5] + Math.atan2(Math.sin(roll-grid[5]),Math.cos(roll-grid[5])),
    width, .017, 0, width*1.32, 1,
  ];
  const sheet = between(grid,target,join);
  const arc = Math.sin(Math.PI*join);
  sheet[1] += arc*base*.12;
  sheet[2] += arc*base*(inner ? -.26 : .22);
  return sheet;
}

export function cardPose(i,p,time,w,h,aspect,flightTime,pointerX=0,spin=0,rowTravel=0) {
  const base=Math.min(w,h), small=w<680;
  const flight=(i/COUNT+flightTime*.041+Math.min(p,.04)*.95+.03)%1;
  const angle=i*2.39996+.15*Math.sin(flightTime*.24+i);
  const radius=.126+.9*Math.pow(flight,.98);
  const size=base*(.038+.33*Math.pow(flight,1.18))*ease(.014,.09,flight);
  const scattered=[Math.cos(angle)*radius*w*1.15,Math.sin(angle)*radius*h*1.05,
    base*(flight-.6)*.22,.7*Math.sin(i*1.6+time*.25),.68*Math.cos(angle+time*.17),
    .72*Math.sin(angle+i*.83+time*.13),size,.1+.035*Math.sin(i+time*.35),
    1-ease(.02,.55,flight),size*aspect,0];

  const gather=ease(.034+(1-flight)*.025,.252+.036*(i%5)/4,p);
  if (gather===0) return scattered;
  // The wheel feeds one fixed outlet. A sheet can only leave after its slot
  // has rotated to the gate, so the left half keeps feeding the wheel.
  const feed=Math.max(0,Math.min(1,(p-.31)/.20));
  const slot=i/COUNT;
  // The research pathway turns the assembled wheel on its axle. The same
  // offset carries into the exit so the mouth stays where the wheel left it.
  const turn=spin*1.55;
  const a=gateAngle+TAU*Math.max(0,slot-feed)+turn;
  const r=base*.395, ringWidth=base*.285;
  const upright=onRing(a,r,ringWidth,0,-.30,0,true,.029);
  if (p<=.31) return between(scattered,upright,gather);

  const col=3-i%7, row=Math.floor(i/7);
  const sw=small?w*.292:w*.167;
  const roll=-.52, tilt=.76, yaw=.34;
  // Translate along the rows in the grid plane before projecting the cards.
  const u=col*sw*1.1+(row%2 ? -rowTravel : rowTravel);
  const v=(row-2.5)*sw*1.32*1.1;
  const dx=u*Math.cos(yaw), dy=u*Math.sin(yaw)*Math.sin(tilt)+v*Math.cos(tilt);
  const dz=-u*Math.sin(yaw)*Math.cos(tilt)+v*Math.sin(tilt);
  const pan=pointerX*w*.12*(1-dz/(Math.max(w,h)*1.65));
  const grid=[dx*Math.cos(roll)-dy*Math.sin(roll)+pan,
    -.21*h+dx*Math.sin(roll)+dy*Math.cos(roll),dz,yaw,tilt,roll,sw,0,0,sw*1.32,1];

  const depart=.31+slot*.20;
  const leaving=ease(depart,depart+.129,p);
  if (leaving<1) {
    const exit=onRing(gateAngle+turn,r,ringWidth,0,-.30,0,true,.029);
    // All cards first rise into the same right-rear lane. They fan out to
    // their grid slots only after clearing the outside of the wheel.
    const lane=[exit[0]+base*.16,exit[1]-base*.51,exit[2]-base*.40,
      .40,.89,-.30,sw*.92,.052,0,sw*.92*1.32,1];
    if (leaving===0) return upright;
    const moving=between(exit,grid,leaving);
    for(const k of [0,1,2]) {
      const f=leaving;
      // Cubic path: the first two control points are behind the same gate.
      moving[k]=(1-f)**3*exit[k]+3*(1-f)**2*f*lane[k]
        +3*(1-f)*f*f*(lane[k]+(lane[k]-exit[k])*.65)+f**3*grid[k];
    }
    moving[7]+=.024*Math.sin(Math.PI*leaving);
    return moving;
  }
  if (p<=.66) return grid;

  const order=pickup.indexOf(i);
  if (order<0) {
    const out=ease(.67,.91,p);
    const spare=grid.slice();
    spare[0]+=out*w*1.45; spare[1]-=out*h*.91; spare[2]-=out*base*.42;
    spare[6]*=1-ease(.47,1,out); spare[9]=spare[6]*1.32;
    return spare;
  }
  const entry=.66+.225*order/(pickup.length-1);
  const join=ease(entry,entry+.104,p);
  const travel=Math.max(0,Math.min(1,(p-.764)/.225))*(pickup.length-1);
  const offset=Math.max(0,travel-order);
  const ringAngle=-1.14+TAU*offset/pickup.length;
  const depth=(1+Math.cos(ringAngle))/2;
  const width=base*(.163+.11*depth);
  const ring=onRing(ringAngle,base*.468,width,0,-.41,-.145,false,
    -width/(8*base*.468*1.32));
  // Frame the whole ring above the text panel without introducing vertical
  // parallax between its front and back rows.
  ring[1]-=h*.218*(1-ring[2]/(Math.max(w,h)*1.65));
  const sheet=between(grid,ring,join);
  const lift=Math.sin(Math.PI*join);
  sheet[1]+=lift*base*.16; sheet[2]+=lift*base*.18;
  return sheet;
}

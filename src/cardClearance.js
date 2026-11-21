// Bound the full wind-deformed mesh in its local coordinate system. The shader's
// maximum edge weight is 1.25. These bounds therefore hold at every wave phase.
function envelope(pose) {
  const [x,y,z,yaw,pitch,roll,width,bend,,height] = pose;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const axes = [
    [cr*cy-sr*sp*sy, sr*cy+cr*sp*sy, -cp*sy],
    [-sr*cp, cr*cp, sp],
    [cr*sy+sr*sp*cy, sr*sy-cr*sp*cy, cp*cy],
  ];
  const wind = 1.25 * Math.abs(bend);
  const half = [width*(0.5 + 0.23*wind), height*(0.5 + 0.12*wind), height*wind];
  // Leave some daylight around the bent edges, including subpixel precision.
  for(let i=0;i<3;i++) half[i]*=1.035;
  return {x,y,z,axes,half,radius:Math.hypot(...half)};
}

function projectedRadius(box,x,y,z) {
  const [u,v,n] = box.axes;
  const [a,b,c] = box.half;
  return a*Math.abs(u[0]*x+u[1]*y+u[2]*z)
       + b*Math.abs(v[0]*x+v[1]*y+v[2]*z)
       + c*Math.abs(n[0]*x+n[1]*y+n[2]*z);
}

// Find a separating plane for each pair of oriented boxes. Keeping the largest
// valid common scale trims only the sheets whose paths are currently too close.
function pairScale(a,b) {
  const dx=b.x-a.x, dy=b.y-a.y, dz=b.z-a.z;
  const reach=a.radius+b.radius;
  if(dx*dx+dy*dy+dz*dz >= reach*reach) return 1;
  let scale=0;
  function probe(x,y,z) {
    const support=projectedRadius(a,x,y,z)+projectedRadius(b,x,y,z);
    if(support>1e-7) {
      const distance=Math.abs(dx*x+dy*y+dz*z);
      scale=Math.max(scale,distance/support);
    }
    return scale>=1;
  }
  for(const axis of a.axes) if(probe(...axis)) return 1;
  for(const axis of b.axes) if(probe(...axis)) return 1;
  for(const u of a.axes) {
    for(const v of b.axes) {
      if(probe(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])) return 1;
    }
  }
  return scale;
}

export function keepCardsApart(poses) {
  const boxes=poses.map(envelope);
  // Let crossing paths bow away from each other before reducing a sheet's
  // footprint. Apply all offsets together so card index never sets priority.
  const offsets=new Float64Array(poses.length*3);
  for(let pass=0;pass<3;pass++) {
    offsets.fill(0);
    let crowded=false;
    for(let i=0;i<boxes.length;i++) {
      if(poses[i][6]<0.25) continue;
      for(let j=i+1;j<boxes.length;j++) {
        if(poses[j][6]<0.25) continue;
        const a=boxes[i], b=boxes[j], fit=pairScale(a,b);
        if(fit>=0.91) continue;
        const dx=b.x-a.x, dy=b.y-a.y, dz=b.z-a.z;
        const span=Math.min(poses[i][6],poses[j][6]);
        const distance=Math.max(span*.16,Math.hypot(dx,dy,dz));
        const push=.48*span*(.91-fit)/distance;
        offsets[i*3]-=dx*push; offsets[j*3]+=dx*push;
        offsets[i*3+1]-=dy*push; offsets[j*3+1]+=dy*push;
        offsets[i*3+2]-=dz*push; offsets[j*3+2]+=dz*push;
        crowded=true;
      }
    }
    if(!crowded) break;
    for(let i=0;i<boxes.length;i++) {
      const x=offsets[i*3], y=offsets[i*3+1], z=offsets[i*3+2];
      const limit=Math.max(.01,poses[i][6]*.15);
      const weight=1/Math.sqrt(1+(x*x+y*y+z*z)/(limit*limit));
      boxes[i].x=poses[i][0]+=x*weight;
      boxes[i].y=poses[i][1]+=y*weight;
      boxes[i].z=poses[i][2]+=z*weight;
    }
  }
  const scales=new Float64Array(poses.length).fill(1);
  for(let i=0;i<boxes.length;i++) {
    if(poses[i][6]<0.25) continue;
    for(let j=i+1;j<boxes.length;j++) {
      if(poses[j][6]<0.25) continue;
      const scale=pairScale(boxes[i],boxes[j]);
      scales[i]=Math.min(scales[i],scale);
      scales[j]=Math.min(scales[j],scale);
    }
  }
  for(let i=0;i<poses.length;i++) {
    poses[i][6]*=scales[i];
    poses[i][9]*=scales[i];
  }
  return poses;
}

// Bound the full wind-deformed mesh in its local coordinate system.
function envelope(pose, camera) {
  const [x, y, z, yaw, pitch, roll, width, bend, , height] = pose;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  const axes = [
    [cr*cy-sr*sp*sy, sr*cy+cr*sp*sy, -cp*sy],
    [-sr*cp, cr*cp, sp],
    [cr*sy+sr*sp*cy, sr*sy-cr*sp*cy, cp*cy],
  ];
  const wind = 1.25 * Math.abs(bend);
  const half = [width*(.5 + .23*wind), height*(.5 + .12*wind), height*wind].map(value => value * 1.035);
  const box = { x, y, z: z - camera, axes, half, factor: 1 };
  const extentX = projectedRadius(box, 1, 0, 0);
  const extentY = projectedRadius(box, 0, 1, 0);
  const extentZ = projectedRadius(box, 0, 0, 1);
  box.near = camera - z - extentZ;
  box.far = camera - z + extentZ;

  // Screen bounds stay fixed when a sheet moves along its projection cone.
  const left = x - extentX, right = x + extentX;
  const top = y - extentY, bottom = y + extentY;
  box.left = left / (left < 0 ? box.near : box.far);
  box.right = right / (right > 0 ? box.near : box.far);
  box.top = top / (top < 0 ? box.near : box.far);
  box.bottom = bottom / (bottom > 0 ? box.near : box.far);
  return box;
}

function projectedRadius(box, x, y, z) {
  const [u, v, n] = box.axes;
  const [a, b, c] = box.half;
  return a * Math.abs(u[0]*x + u[1]*y + u[2]*z)
       + b * Math.abs(v[0]*x + v[1]*y + v[2]*z)
       + c * Math.abs(n[0]*x + n[1]*y + n[2]*z);
}

function depthFactor(front, back, lower) {
  const gap = .01;
  const farDepth = front.far * front.factor + gap;
  if (farDepth <= back.near * lower ||
      front.left >= back.right || front.right <= back.left ||
      front.top >= back.bottom || front.bottom <= back.top) return lower;

  let required = farDepth / back.near;
  function probe(x, y, z) {
    const center = back.x*x + back.y*y + back.z*z;
    const near = Math.abs(center) - projectedRadius(back, x, y, z);
    if (near <= 1e-7) return false;
    const far = (front.x*x + front.y*y + front.z*z) * Math.sign(center) + projectedRadius(front, x, y, z);
    required = Math.min(required, (front.factor * far + gap * Math.hypot(x, y, z)) / near);
    return required <= lower;
  }
  for (const axis of front.axes) if (probe(...axis)) return lower;
  for (const axis of back.axes) if (probe(...axis)) return lower;
  for (const u of front.axes) {
    for (const v of back.axes) {
      if (probe(u[1]*v[2] - u[2]*v[1], u[2]*v[0] - u[0]*v[2], u[0]*v[1] - u[1]*v[0])) return lower;
    }
  }
  return required;
}

export function keepCardsApart(poses, camera) {
  const visible = poses.filter(pose => pose[6] >= .25 && pose[9] >= .25).sort((a, b) => b[2] - a[2]);
  const placed = [];
  for (const pose of visible) {
    const box = envelope(pose, camera);
    for (const front of placed) {
      box.factor = depthFactor(front, box, box.factor);
    }
    placed.push(box);

    if (box.factor === 1) continue;
    // Move away from the eye and expand by the same factor. Every vertex
    // keeps its projected position, including the edges of a curled sheet.
    pose[0] *= box.factor;
    pose[1] *= box.factor;
    pose[2] = camera + box.z * box.factor;
    pose[6] *= box.factor;
    pose[9] *= box.factor;
  }
  return poses;
}

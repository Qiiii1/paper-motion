// All positions use CSS pixels with the origin at the centre of the viewport.
// Positive z points toward the viewer. The renderer bends each sheet locally.
export const COUNT = 42;
const TAU = 2 * Math.PI;
const mix = (a, b, t) => a + (b - a) * t;
export function ease(start, end, value) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
function between(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const result = a.map((v, i) => mix(v, b[i], t));
  // Take the shorter route around the y axis as a sheet turns.
  const delta = b[3] - a[3];
  result[3] = a[3] + Math.atan2(Math.sin(delta), Math.cos(delta)) * t;
  return result;
}

// Pose: x, y, depth, yaw, pitch, roll, width, curvature, light from source.
export function cardPose(i, progress, time, w, h, aspect, flightTime) {
  const small = w < 680;
  const base = Math.min(w, h);
  const drift = flightTime * 0.041 + Math.min(progress, 0.04) * 0.95;
  const flight = (i / COUNT + drift + 0.03) % 1;
  const angle = i * 2.39996 + 0.15 * Math.sin(flightTime * 0.24 + i);
  const radius = Math.pow(flight, 0.96);
  const scatter = [
    Math.cos(angle) * radius * w * 1.15,
    Math.sin(angle) * radius * h * 1.05,
    base * (flight - 0.6) * 0.22,
    0.7 * Math.sin(i * 1.6 + time * 0.25),
    0.68 * Math.cos(angle + time * 0.17),
    0.72 * Math.sin(angle + i * 0.83 + time * 0.13),
    base * (0.038 + 0.33 * Math.pow(flight, 1.18)),
    0.10 + 0.035 * Math.sin(i + time * 0.35),
    1 - ease(0.02, 0.55, flight),
  ];
  const ringWidth = base * (small ? 0.246 : 0.22);
  const ringAngle = TAU * i / COUNT + 0.18 * time + 0.37 + ease(.29,.31,progress) * .18;
  function ring(a, final) {
    const r = base * (small ? 0.318 : 0.36) * (final ? 0.94 : 1);
    return [
      r * Math.sin(a), (final ? -0.205 : 0.008) * h + r * 0.32 * Math.cos(a),
      r * Math.cos(a), Math.PI / 2 + a, 0.015, 0.028 * Math.sin(a),
      ringWidth * (final ? 0.93 : 1), 0.022, 0,
    ];
  }
  const firstRing = ring(ringAngle, false);
  const gather = ease(0.034 + (1 - flight) * 0.025, 0.252 + 0.036 * (i % 5) / 4, progress);
  const orbit = between(scatter, firstRing, gather);

  // Place the grid in camera space. The front row sits lower, appears larger,
  // and the projected row and column vectors follow the edges of the sheets.
  const col = i % 7 - 3, row = Math.floor(i / 7) - 2.5;
  const sw = small ? w * 0.292 : w * 0.167;
  const gap = 1.09;
  const roll = -0.52, tilt = 0.76, yaw = 0.34;
  const u = col * sw * gap, v = row * sw * 1.32 * gap;
  const dx = u * Math.cos(yaw);
  const dy = u * Math.sin(yaw) * Math.sin(tilt) + v * Math.cos(tilt);
  const dz = -u * Math.sin(yaw) * Math.cos(tilt) + v * Math.sin(tilt);
  const grid = [
    dx * Math.cos(roll) - dy * Math.sin(roll),
    -0.21 * h + dx * Math.sin(roll) + dy * Math.cos(roll),
    dz, yaw, tilt, roll, sw, 0.025, 0,
  ];
  const release = (1 + Math.cos(ringAngle)) * 0.5;
  const depart = 0.31 + 0.17 * release + (i % 3) * 0.009;
  const open = ease(depart, depart + 0.104, progress);
  const wall = between(orbit, grid, open);
  const arc = Math.sin(Math.PI * open);
  // Unfold along the outer rim before entering the grid. Successive rows
  // travel at different depths instead of cutting through the ring centre.
  wall[0] += arc * base * (0.25 + 0.32 * Math.sin(ringAngle));
  wall[2] += arc * base * (0.36 * Math.cos(ringAngle) + row * 0.12);
  wall[1] -= arc * base * (0.24 + 0.14 * (1 - release));
  wall[7] += arc * 0.045;

  // Alternate central and peripheral sheets as the grid peels away.
  const distance = Math.hypot(col / 3, row / 2.5);
  const peelOrder = Math.min(distance, Math.abs(1.36 - distance)) * 0.22 + ((i * 11) % 7) * 0.009;
  const close = ease(0.664 + peelOrder, 0.86 + peelOrder * 0.70, progress);
  const endAngle = TAU * ((i * 17) % COUNT) / COUNT + 2.1 + time * 0.15;
  const final = between(wall, ring(endAngle, true), close);
  const lift = Math.sin(Math.PI * close);
  final[0] += Math.sin(i * 2.4) * lift * base * 0.32;
  final[1] -= (0.16 + 0.2 * (i % 5) / 4) * lift * base;
  final[2] += base * 0.38 * lift;
  final[7] += 0.034 * lift;
  // A common mounting size maintains an even grid; retain each image's aspect in its texture.
  final.push(final[6] * mix(aspect, 1.32, gather));
  return final;
}

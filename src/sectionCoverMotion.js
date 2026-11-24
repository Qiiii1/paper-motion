import { cardPose, COUNT, ease, onRing } from './choreography.js';

export const APPROACH_COVER_LEAD = 1.34;
export const COMPARISON_COVER_LEAD = .60;
export const COMPARISON_RING_SETTLE = .76;
const hidden = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Follow the three runs of the illustration. The final sheet to leave is
// near the front left, so it remains visible all the way to the right edge.
const relatedOrder = [12, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  24, 25, 26, 27, 28, 29, 30, 7, 6, 5, 4, 3, 2, 1, 0];
const ribbonRank = new Map(relatedOrder.map((sheet, rank) => [sheet, rank]));
const enterEnd = .38;
const exitStart = .68;

export function relatedTitleReveal(position) {
  return ease(enterEnd, .48, position) * (1 - ease(.58, exitStart, position));
}

function sheetStep(progress, rank) {
  // One new sheet starts each beat. Just its predecessor can still be moving.
  const duration = 1.85;
  const beat = progress * (relatedOrder.length - 1 + duration);
  return ease(rank, rank + duration, beat);
}

export function sectionCoverPoses(part, progress, time, width, height, artHeight = height, offsetY = 0) {
  const base = Math.min(width, artHeight);
  const camera = Math.max(width, height) * 1.65;
  const related = part === 2;
  const poseProgress = related ? .54 : progress;
  const drift = (poseProgress - .48) * (related ? -1 : 1);
  const zoom = 1 + .17 * ease(0, .85, poseProgress);
  const turn = related ? 0 : .48 * ease(0, 1, progress);
  const cosTurn = Math.cos(turn);
  const sinTurn = Math.sin(turn);
  const pivotY = .48 * artHeight - height / 2 + offsetY;

  function sheet(i, x, y, depth, size, yaw, pitch, roll) {
    const shift = Math.sin((related ? 0 : time) * .64 + i * .55);
    const z = base * depth;
    const scale = 1 - z / camera;
    const w = size * base * zoom * scale;
    const cameraX = ((x - .5) * zoom + .16 * drift) * width * scale;
    const cameraY = (((y - .48) * zoom + .48 - .12 * drift + .009 * shift) * artHeight - height / 2 + offsetY) * scale;
    // Turn the ribbon and the paper faces around the same camera-space axis.
    const localY = cameraY - pivotY;
    let travelX = 0, travelY = 0, curl = 0;
    if (related) {
      const rank = ribbonRank.get(i);
      const enter = sheetStep(progress / enterEnd, rank);
      const leave = sheetStep((progress - exitStart) / (1 - exitStart), relatedOrder.length - 1 - rank);
      if (enter === 0 || leave === 1) return hidden.slice();
      // Move each sheet from just outside the top to its own slot, then
      // across the right edge. Account for its size and camera depth.
      const enterMargin = w * (rank === 0 ? .53 : .9);
      const exitMargin = w * (rank === 0 ? .62 : .9);
      travelY = (1 - enter) * (-height * .5 * scale - enterMargin - cameraY);
      travelX = leave * (width * .5 * scale + exitMargin - cameraX);
      curl = Math.sin(Math.PI * enter) + Math.sin(Math.PI * leave);
    }
    return [
      travelX + cameraX * cosTurn - localY * sinTurn,
      travelY + pivotY + cameraX * sinTurn + localY * cosTurn,
      z, yaw + .17 * drift + .05 * shift, pitch + .10 * curl, roll + .09 * drift + turn,
      w, .045 + .013 * shift + .075 * curl, .06 + .15 * ease(.35, .85, poseProgress), w * 1.32, 1,
    ];
  }

  return Array.from({ length: COUNT }, (_, i) => {
    if (i < 8) {
      const s = i / 7;
      return sheet(i, .38 + .68 * s, .26 - .31 * s, -.16 + .39 * s,
        .23 - .055 * s, .37 + .14 * s, .13, -.49 + .15 * s);
    }
    if (i >= 11 && i < 23) {
      const s = (i - 11) / 11;
      return sheet(i, .03 + .89 * s, .78 - .20 * s + .055 * Math.sin(s * Math.PI),
        .48 - .69 * s, .39 - .19 * s, -.29 - 1.1 * Math.sin(s * Math.PI), .03 - .34 * s, -.14 + .26 * s);
    }
    if (i >= 24 && i < 31) {
      const s = (i - 24) / 6;
      return sheet(i, .70 + .40 * s, .51 - .33 * s, -.30 + .24 * s,
        .22 + .11 * s, -.99 + .61 * s, .21 + .18 * s, -.23 - .37 * s);
    }
    return hidden.slice();
  });
}

const comparisonSheets = 24;

export function comparisonRingPoses(progress, width, height, plateTop = height, turn = 0) {
  const base = Math.min(width, height);
  const radius = Math.min(width * .54, height * .62);
  const camera = Math.max(width, height) * 1.65;
  // The same ring rises above the reading plate. Correct for perspective
  // so the front and rear sheets move upward by the same screen distance.
  const lift = Math.max(0, height - plateTop);
  const center = height * .38 - lift * .28;
  const beat = progress * (comparisonSheets + 1);
  return Array.from({ length: COUNT }, (_, index) => {
    if (index >= comparisonSheets) return hidden.slice();
    const landing = ease(index, index + 2, beat);
    if (landing === 0) return hidden.slice();

    const angle = turn - .5 * Math.PI + .016 + 2 * Math.PI * index / comparisonSheets;
    const pose = onRing(angle, radius, base * .31, 0, -.135, 0, true, .064);
    const scale = 1 - pose[2] / camera;
    const settledY = pose[1] + (center - height / 2) * scale;
    const startY = -height * .5 * scale - pose[9] * .6;
    const curl = Math.sin(Math.PI * landing);
    pose[1] = startY + (settledY - startY) * landing;
    pose[4] += .18 * curl;
    pose[7] += .095 * curl;
    pose[8] = .21 + .30 * curl;
    return pose;
  });
}

export function researchGapPaperPoses(ring, progress, time, width, height, aspects) {
  if (progress === 0) return ring;
  const gathered = ease(0, .38, progress);
  return ring.map((pose, index) => {
    const scattered = cardPose(index, 0, time, width, height, aspects[index % aspects.length], time);
    if (progress === 1) return scattered;

    const start = .18 + (index % 8) * .023;
    const spread = ease(start, start + .56, progress);
    const origin = pose.slice();
    origin[0] *= 1 - gathered * .88;
    origin[1] *= 1 - gathered;
    origin[2] *= 1 - gathered * .80;
    origin[6] *= 1 - gathered * .67;
    origin[9] *= 1 - gathered * .67;
    return origin.map((value, axis) => {
      const change = scattered[axis] - value;
      const delta = axis >= 3 && axis <= 5 ? Math.atan2(Math.sin(change), Math.cos(change)) : change;
      return value + spread * delta;
    });
  });
}

export function blendSectionCover(poses, ribbons, progress, base) {
  if (progress === 0) return poses;
  if (progress === 1) return ribbons;

  return poses.map((pose, index) => {
    const ribbon = ribbons[index];
    const stagger = (index % 5) * .04;
    const join = ease(stagger, .84 + stagger, progress);
    if (ribbon[6] === 0) {
      // The remaining papers draw back through the deck instead of jumping
      // to the origin of an unused ribbon slot.
      const out = pose.slice();
      out[1] -= base * .22 * join;
      out[2] -= base * .46 * join;
      out[6] *= 1 - join;
      out[9] *= 1 - join;
      return out;
    }
    const blended = pose.map((value, k) => {
      const delta = ribbon[k] - value;
      return value + join * (k >= 3 && k <= 5 ? Math.atan2(Math.sin(delta), Math.cos(delta)) : delta);
    });
    blended[2] += Math.sin(Math.PI * join) * (index % 2 === 0 ? 1 : -1) * base * .10;
    return blended;
  });
}

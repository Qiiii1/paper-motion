export const LITERATURE_CARD_COUNT = 24;

const slots = LITERATURE_CARD_COUNT / 2;
const slotAngle = 360 / slots;
const gateAngle = 90;
const outerRadius = 38;
const innerRadius = 21;
const feedTime = .375;
const approachTime = .62;
const arcPeak = .64;
const arcEnd = .94;
const entryProfiles = [
  { arc: -10, pace: .68, tilt: -18 },
  { arc: 9, pace: -.57, tilt: 15 },
  { arc: -5, pace: -.34, tilt: -9 },
  { arc: 7, pace: .45, tilt: 13 },
  { arc: 0, pace: 0, tilt: 0 },
];
const mix = (from, to, amount) => from + (to - from) * amount;
const clamp = value => Math.max(0, Math.min(1, value));

function smooth(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export function literatureSlot(index) {
  return (3 - Math.floor(index / 2) + slots) % slots;
}

export function literatureTurn(progress) {
  const time = progress * slots;
  const slot = Math.floor(time);
  const step = time - slot;
  return slotAngle * (slot + .22 * step + .78 * smooth((step - .7) / .3));
}

export function literatureCardPose(index, progress, turn = literatureTurn(progress)) {
  const inner = index % 2 === 0;
  const feed = clamp((progress * slots - Math.floor(index / 2) - (inner ? 0 : feedTime)) / feedTime);
  const approach = clamp(feed / approachTime);
  const profile = entryProfiles[index % entryProfiles.length];
  const taper = approach * (1 - approach);
  const traveled = smooth(approach + profile.pace * taper);
  // Center the bend near the visible edge, then straighten before the gate.
  const arc = smooth(traveled / arcPeak) * (1 - smooth((traveled - arcPeak) / (arcEnd - arcPeak)));
  const joined = smooth((feed - approachTime) / (1 - approachTime));
  const angle = literatureSlot(index) * slotAngle + turn;
  const radians = angle * Math.PI / 180;
  const radius = inner ? innerRadius : outerRadius;
  const gateX = 50 + outerRadius;
  const angleFromGate = Math.atan2(Math.sin(radians - Math.PI / 2), Math.cos(radians - Math.PI / 2)) * 180 / Math.PI;

  return {
    // Both rings use the same gate. Seat the inner card first while the
    // corresponding slot on the outer ring is still empty.
    x: mix(gateX, 50 + Math.sin(radians) * radius, joined),
    y: mix(50, 50 - Math.cos(radians) * radius, joined) + profile.arc * arc,
    angle: gateAngle + angleFromGate * joined + profile.tilt * arc,
    travel: 1 - traveled,
    opacity: smooth(feed / .35),
  };
}

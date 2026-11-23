export const LITERATURE_CARD_COUNT = 24;

const slots = LITERATURE_CARD_COUNT / 2;
const slotAngle = 360 / slots;
const gateAngle = 90;
const outerRadius = 38;
const innerRadius = 21;
const feedTime = .375;
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
  const joined = smooth((feed - .62) / .38);
  const angle = literatureSlot(index) * slotAngle + turn;
  const radians = angle * Math.PI / 180;
  const radius = inner ? innerRadius : outerRadius;
  const gateX = 50 + outerRadius;
  const angleFromGate = Math.atan2(Math.sin(radians - Math.PI / 2), Math.cos(radians - Math.PI / 2)) * 180 / Math.PI;

  return {
    // Both rings use the same gate. Seat the inner card first while the
    // corresponding slot on the outer ring is still empty.
    x: mix(gateX, 50 + Math.sin(radians) * radius, joined),
    y: mix(50, 50 - Math.cos(radians) * radius, joined),
    angle: gateAngle + angleFromGate * joined,
    travel: 1 - smooth(feed / .62),
    opacity: smooth(feed / .35),
  };
}

// Filter visual progress while leaving the browser in charge of scrolling.
export function followScroll(current, target, seconds, distance) {
  if (Math.abs(target - current) * distance < 0.75) return target;
  return current + (target - current) * (1 - Math.exp(-22 * seconds));
}

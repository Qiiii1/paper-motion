// Filter visual progress while leaving the browser in charge of scrolling.
export function followScroll(current, target, seconds, distance, response = 22) {
  if (Math.abs(target - current) * distance < 0.75) return target;
  return current + (target - current) * (1 - Math.exp(-response * seconds));
}

export function viewportProgress(top, height, from, to) {
  return Math.max(0, Math.min(1, (from - top / height) / (from - to)));
}

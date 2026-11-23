import { followScroll } from './scrollProgress';

export function createSmoothWheel() {
  let frame = 0;
  let current, target, expected, previous;

  function cancel() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function scroll(now) {
    if (window.scrollY !== expected) {
      cancel();
      return;
    }
    const seconds = Math.min(.05, (now - previous) / 1000);
    previous = now;
    current = followScroll(current, target, seconds, 1);
    window.scrollTo({ top: current, behavior: 'instant' });
    expected = window.scrollY;
    frame = current === target ? 0 : requestAnimationFrame(scroll);
  }

  function move(event) {
    const mode = event.deltaMode;
    if (!event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey
      || Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      || event.target?.closest?.('input, select, textarea, [contenteditable]')) return;

    const viewport = document.scrollingElement;
    const unit = mode === WheelEvent.DOM_DELTA_LINE ? 16
      : mode === WheelEvent.DOM_DELTA_PAGE ? viewport.clientHeight : 1;
    event.preventDefault();
    if (!frame) {
      current = target = expected = window.scrollY;
      previous = performance.now();
      frame = requestAnimationFrame(scroll);
    }
    target = Math.max(0, Math.min(viewport.scrollHeight - viewport.clientHeight, target + event.deltaY * unit));
  }

  return { move, cancel };
}

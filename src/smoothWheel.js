const wheelGain = .68;
const wheelResponse = 29;

export function createSmoothWheel() {
  let frame = 0;
  let velocity = 0;
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
    const seconds = Math.max(0, Math.min(.05, (now - previous) / 1000));
    previous = now;
    // A critically damped spring eases both the start and the stop.
    const offset = current - target;
    const momentum = velocity + wheelResponse * offset;
    const decay = Math.exp(-wheelResponse * seconds);
    current = target + (offset + momentum * seconds) * decay;
    velocity = (velocity - wheelResponse * momentum * seconds) * decay;
    if (Math.abs(target - current) <= .5) current = target;
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
    const pageMode = mode === WheelEvent.DOM_DELTA_PAGE;
    const unit = pageMode ? viewport.clientHeight : mode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
    const delta = event.deltaY * unit * (pageMode ? 1 : wheelGain);
    const maxPending = pageMode ? viewport.clientHeight : Math.min(125, viewport.clientHeight * .16);
    event.preventDefault();
    if (!frame || window.scrollY !== expected) {
      cancel();
      current = target = expected = window.scrollY;
      velocity = 0;
      previous = performance.now();
      frame = requestAnimationFrame(scroll);
    }

    // Don't carry an unfinished scroll in the old direction into a reversal.
    const pending = target - current;
    const queued = Math.sign(delta) === Math.sign(pending) ? pending + delta : delta;
    const next = current + Math.max(-maxPending, Math.min(maxPending, queued));
    target = Math.max(0, Math.min(viewport.scrollHeight - viewport.clientHeight, next));
    const distance = target - current;
    const direction = Math.sign(distance);
    // Clear velocity on reversal and keep the spring inside the new target.
    velocity = direction * Math.max(0, Math.min(direction * velocity, wheelResponse * Math.abs(distance)));
  }

  return { move, cancel };
}

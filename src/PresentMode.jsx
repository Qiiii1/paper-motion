import React, { useEffect, useRef, useState } from 'react';
import { Expand, Shrink } from 'lucide-react';

// Full-screen presentation control. Hidden while the pointer is idle so the
// page reads as a bare surface; the F key does the same thing.
export function PresentMode() {
  const [presenting, setPresenting] = useState(false);
  const [awake, setAwake] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    const sync = () => setPresenting(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    const wake = () => {
      setAwake(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAwake(false), 2400);
    };
    wake();
    for (const event of ['pointermove', 'pointerdown', 'keydown']) {
      window.addEventListener(event, wake, { passive: true });
    }
    return () => {
      clearTimeout(timer.current);
      for (const event of ['pointermove', 'pointerdown', 'keydown']) {
        window.removeEventListener(event, wake);
      }
    };
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {});
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const node = event.target;
      if (node instanceof HTMLElement && (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName))) return;
      if (event.key !== 'f' && event.key !== 'F') return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const Icon = presenting ? Shrink : Expand;
  return <button type="button"
    className={'present-mode' + (awake ? ' is-awake' : '') + (presenting ? ' is-presenting' : '')}
    onClick={toggle} aria-pressed={presenting}
    aria-label={presenting ? 'Leave full screen' : 'Present in full screen'}
    title={presenting ? 'Leave full screen (F)' : 'Full screen (F)'}>
    <Icon aria-hidden="true" size={16} strokeWidth={1.9} />
  </button>;
}

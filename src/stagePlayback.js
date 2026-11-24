import { useCallback, useEffect, useRef, useState } from 'react';
import { pageY, reducedMotion } from './research';
import { createSmoothWheel } from './smoothWheel';
import { APPROACH_COVER_LEAD, COMPARISON_COVER_LEAD } from './sectionCoverMotion';

export function useStagePlayback(track) {
  const controls = useRef(null);
  const [active, setActive] = useState('opening');
  const [playing, setPlaying] = useState(false);
  const step = useCallback(direction => controls.current?.step(direction), []);
  const jump = useCallback(id => controls.current?.jump(id), []);

  useEffect(() => {
    const root = track.current;
    const smoothWheel = createSmoothWheel();
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    let stops, frame = 0, run = null, down = null, dragged = false;

    function measure() {
      const next = [...root.querySelectorAll('[data-chapter]')].map(node => {
        const layout = node.closest('.example-layout');
        if (!layout) return { node, at: pageY(node) };
        const scene = layout.parentElement;
        const hold = pageY(layout) - pageY(scene);
        return { node, at: Math.min(pageY(node) - hold, pageY(scene.querySelector('.example-exit-start'))) };
      });
      if (run && next.some((stop, i) => Math.abs(stop.at - stops[i].at) > 1)) cancel();
      stops = next;
      sync();
    }

    function sync() {
      const current = stops.findLastIndex(stop => stop.at <= window.scrollY + 4);
      setActive(stops[Math.max(0, current)].node.id);
    }

    function cancel() {
      cancelAnimationFrame(frame);
      run = null;
      setPlaying(false);
    }

    function onScroll() {
      if (run && window.scrollY !== run.expected) cancel();
      sync();
    }

    function render(now) {
      if (window.scrollY !== run.expected) {
        cancel();
        sync();
        return;
      }
      const elapsed = Math.min(1, (now - run.started) / run.duration);
      const eased = elapsed * elapsed * (3 - 2 * elapsed);
      window.scrollTo({ top: run.from + (run.to - run.from) * eased, behavior: 'instant' });
      run.expected = window.scrollY;
      if (elapsed < 1) frame = requestAnimationFrame(render);
      else if (run.transition) {
        const { to, duration } = run.transition;
        run = { from: run.expected, to, duration, expected: run.expected, started: now };
        frame = requestAnimationFrame(render);
      }
      else {
        cancel();
        sync();
      }
    }

    function advance(direction) {
      if (run) return;
      smoothWheel.cancel();
      const from = window.scrollY;
      const current = Math.max(0, stops.findLastIndex(stop => stop.at <= from + 4));
      const target = stops[current + direction];
      if (!target) return;
      const arrival = target.node.querySelector('[data-scene-arrival]');
      const to = arrival ? pageY(arrival) : target.at;
      if (reducedMotion()) {
        window.scrollTo({ top: to, behavior: 'instant' });
        sync();
        return;
      }
      const runway = target.node.previousElementSibling;
      const connectedCover = direction > 0 && target.node.hasAttribute('data-approach-cover');
      const comparisonCover = direction > 0 && target.node.hasAttribute('data-comparison-cover');
      const questionsCover = direction > 0 && target.node.hasAttribute('data-questions-cover');
      const designCover = direction > 0 && target.node.hasAttribute('data-design-cover');
      const literature = target.node.classList.contains('literature-chapter');
      const supportDeparture = direction > 0 && target.node.matches('.research-gap')
        ? runway?.querySelector('.research-support-departure')
        : null;
      const gapDeparture = questionsCover ? runway?.querySelector('.research-gap-outro') : null;
      const questionsDeparture = designCover ? runway?.querySelector('.questions-outro') : null;
      const example = direction > 0 && runway?.matches('.example-chapter') ? runway : null;
      // Play straight through the last outgoing sheet and the first incoming
      // Literature Map sheet, without an ease-to-stop at the empty boundary.
      const firstStop = example ? pageY(example.querySelector('.example-exit-start'))
        : supportDeparture ? pageY(supportDeparture) - window.innerHeight
        : gapDeparture ? pageY(gapDeparture) - runway.firstElementChild.offsetHeight
        : questionsDeparture ? pageY(questionsDeparture) - window.innerHeight
        : literature ? to
        : comparisonCover ? target.at - COMPARISON_COVER_LEAD * target.node.firstElementChild.offsetHeight
        : arrival ? target.at
        : connectedCover ? to - APPROACH_COVER_LEAD * window.innerHeight
        : direction > 0 && target.node.id !== 'chapter-02' && runway?.matches('.motion-runway')
        ? pageY(runway) : to;
      const transitionTime = example ? 2720 : questionsCover || designCover ? 2450 : comparisonCover ? 2100 : supportDeparture ? 1850 : arrival ? 1480 : connectedCover ? 1320
        : target.node.id === 'chapter-03' ? 1800 : 1360;
      const separateTransition = firstStop > from + 24 && firstStop < to - 24;
      const destination = separateTransition ? firstStop : to;
      const distance = Math.abs(destination - from) / window.innerHeight;
      let duration = Math.min(720, 380 + distance * 125);
      if (!separateTransition) {
        if (target.node.matches('.research-questions, #research-design')) {
          duration = 1520;
        } else if (target.node.matches('.research-support')) {
          duration = 1420;
        } else if (questionsCover || designCover) {
          duration = 2380;
        } else if (literature || target.node.hasAttribute('data-related-cover')) {
          duration = Math.min(3700, 1000 + distance * 1150);
        } else if (arrival || target.node.hasAttribute('data-motion')) {
          duration = Math.min(1800, 940 + distance * 300);
        } else if (connectedCover) {
          duration = 920;
        }
      }
      run = {
        from, to: destination, duration, expected: from, started: performance.now(),
        transition: separateTransition ? { to, duration: transitionTime } : null,
      };
      setPlaying(true);
      frame = requestAnimationFrame(render);
    }

    function direct(id) {
      const stop = stops.find(entry => entry.node.id === id);
      if (!stop) return;
      cancel();
      smoothWheel.cancel();
      const url = new URL(location.href);
      url.hash = id;
      history.replaceState(null, '', url);
      stop.node.querySelector('h2')?.focus({ preventScroll: true });
      const arrival = stop.node.querySelector('[data-scene-arrival]');
      window.scrollTo({ top: arrival ? pageY(arrival) : stop.at, behavior: 'auto' });
      sync();
    }

    function pointerDown(event) {
      smoothWheel.cancel();
      down = [event.clientX, event.clientY];
      dragged = false;
    }

    function pointerMove(event) {
      if (down && Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 8) dragged = true;
    }

    function pointerEnd() {
      down = null;
    }

    function wheel(event) {
      if (run && event.deltaY && !event.ctrlKey) cancel();
      if (!motionPreference.matches) smoothWheel.move(event);
    }

    motionPreference.addEventListener('change', smoothWheel.cancel);

    function pointerCancel(event) {
      pointerEnd();
      if (run && event.pointerType === 'touch') cancel();
    }

    function click(event) {
      if (event.defaultPrevented) return;
      const stageStep = event.target.closest('button[data-stage-step]');
      if (stageStep) {
        advance(Number(stageStep.dataset.stageStep));
        return;
      }
      if (event.target.closest('a,button,select,label,summary')) return;
      if (!event.target.closest('[data-play-surface]') || (event.detail > 0 && dragged)) return;
      if (!window.getSelection()?.toString()) advance(1);
    }

    function control(event) {
      if (run && event.target.closest('a,button,select,label,summary') && !event.target.closest('[data-playback]')) cancel();
    }

    function key(event) {
      if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.target.closest('button,a,input,select,textarea,summary,[contenteditable]')) return;
      if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      advance(event.key === 'ArrowLeft' ? -1 : 1);
    }

    controls.current = { step: advance, jump: direct };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerEnd);
    window.addEventListener('pointercancel', pointerCancel);
    window.addEventListener('click', click);
    window.addEventListener('click', control, true);
    window.addEventListener('keydown', key);
    window.addEventListener('hashchange', cancel);

    return () => {
      cancelAnimationFrame(frame);
      smoothWheel.cancel();
      motionPreference.removeEventListener('change', smoothWheel.cancel);
      controls.current = null;
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('pointerdown', pointerDown);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerEnd);
      window.removeEventListener('pointercancel', pointerCancel);
      window.removeEventListener('click', click);
      window.removeEventListener('click', control, true);
      window.removeEventListener('keydown', key);
      window.removeEventListener('hashchange', cancel);
    };
  }, [track]);

  return { active, playing, step, jump };
}

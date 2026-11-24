import React, { useEffect, useRef, useState } from 'react';
import { cardPose, COUNT, ease, focusWheelPose } from './choreography';
import { lensAt } from './openingLens';
import { galleryPose, openingScreens, presetStop } from './presets';
import { loadPages, createRenderer, createDOMRenderer } from './renderer';
import { followScroll } from './scrollProgress';
import { pageY } from './research';
import { APPROACH_COVER_LEAD, blendSectionCover, sectionCoverPoses } from './sectionCoverMotion';

function phaseAt(scenes, y) {
  let previous = scenes[0];
  for (const next of scenes.slice(1)) {
    // Native scrolling can round a fractional chapter anchor to a CSS pixel.
    if (y + 1 >= next.at) {
      previous = next;
      continue;
    }
    const progress = Math.max(0, (y - next.from) / Math.max(1, next.at - next.from));
    return previous.pose + (next.pose - previous.pose) * progress;
  }
  return previous.pose;
}

export function PaperStage({ track, lang }) {
  const stage = useRef(null), canvas = useRef(null), fallback = useRef(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const root = track.current;
    const host = stage.current, surface = canvas.current;
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    let stopped = false, artworkFailed = false, frame = 0, previous = 0, time = 0, flight = 0, formation = 0;
    let progress, renderer, images, w, h, scenes, windows, ladder, background, stack, focus;
    let pointerTarget = 0, pointerX = 0, rowTravel = 0;

    function queue() {
      if (!frame && !stopped && !document.hidden) frame = requestAnimationFrame(tick);
    }

    function resize() {
      w = host.clientWidth;
      h = host.clientHeight;
      scenes = [...root.querySelectorAll('[data-motion]')].map((node, index) => ({
        at: pageY(node),
        from: index < 2 ? 0 : pageY(node.previousElementSibling),
        pose: Number(node.dataset.motion),
      }));
      windows = [...root.querySelectorAll('[data-play-surface]:not([data-art-covered])')].filter(node => node.offsetHeight > 0).map(node => {
        const top = pageY(node);
        return [top, top + node.offsetHeight];
      });
      const approach = root.querySelector('[data-approach]');
      ladder = approach && { top: pageY(approach), span: Math.max(1, approach.offsetHeight - h) };
      const cover = root.querySelector('[data-approach-cover]');
      if (cover) {
        const top = pageY(cover);
        background = { top, end: top + cover.offsetHeight, span: Math.max(1, cover.offsetHeight - h) };
      }
      const stacked = root.querySelector('[data-stack]');
      stack = stacked && {
        top: pageY(stacked),
        height: stacked.offsetHeight,
        pose: Number(stacked.dataset.motion),
      };
      const focusNode = root.querySelector('[data-focus-scene]');
      if (focusNode) {
        const pinHeight = focusNode.firstElementChild.offsetHeight;
        focus = {
          node: focusNode,
          lenses: [...focusNode.querySelectorAll('.focus-lens')],
          top: pageY(focusNode),
          span: Math.max(1, focusNode.offsetHeight - pinHeight),
          overhang: Math.max(0, pinHeight - h),
          ready: focus?.ready ?? false,
          reading: focus?.reading ?? 0,
          exit: focus?.exit ?? 0,
          travel: focus?.travel ?? 0,
          active: focus?.active,
        };
      }
      queue();
    }

    function tick(now) {
      frame = 0;
      const y = window.scrollY;
      const visible = windows.some(([top, bottom]) => top < y + h && bottom > y);
      host.toggleAttribute('data-art-idle', !visible);
      if (!visible) {
        previous = 0;
        return;
      }
      const dt = previous ? Math.min(.055, (now - previous) / 1000) : 0;
      previous = now;
      const motion = !motionPreference.matches;
      const inStack = stack && y >= stack.top && y + 1 < stack.top + stack.height;
      const target = inStack ? stack.pose : phaseAt(scenes, y);
      progress = motion && dt && !inStack ? followScroll(progress, target, dt, h * openingScreens) : target;
      pointerX = motion ? pointerX + (pointerTarget - pointerX) * (1 - Math.exp(-dt * 9)) : 0;
      const p = Math.min(1, progress);
      const gridPhase = stack?.pose ?? .64;
      const wheel = Math.max(0, (p - gridPhase) / (1 - gridPhase));
      let turn = 0;
      if (focus) {
        const reading = Math.max(0, Math.min(1, (y - focus.top) / focus.span));
        focus.reading = motion && dt ? followScroll(focus.reading, reading, dt, focus.span) : reading;
        // Start the staggered entrance once the cards have settled and the scene is pinned.
        const inPosition = y + 1 >= focus.top;
        const ready = motion
          ? Boolean((renderer || artworkFailed) && wheel >= .98 && (inPosition || focus.ready))
          : inPosition;
        if (ready !== focus.ready) {
          focus.node.toggleAttribute('data-focus-ready', ready);
          focus.ready = ready;
        }
        const departure = motion ? Math.max(0, y - focus.top - focus.span) : 0;
        const hold = Math.min(departure, focus.overhang);
        const exit = Math.min(1, (departure - hold) / (h * .45));
        // When the pin is taller than the viewport, let its lower copy come
        // into view during the lens sequence and hold that offset on exit.
        const readingShift = focus.overhang * ease(.06, .76, focus.reading);
        const travel = hold + exit * h * .45 - readingShift;
        if (exit !== focus.exit) {
          focus.node.style.setProperty('--focus-exit', exit);
          focus.node.toggleAttribute('data-focus-exiting', exit > 0);
          focus.exit = exit;
        }
        if (travel !== focus.travel) {
          focus.node.style.setProperty('--focus-travel', travel + 'px');
          focus.travel = travel;
        }
        // Reserve a short reading hold at the start and a longer hold on the
        // last lens before releasing the sticky scene.
        const lensProgress = ready ? Math.max(0, Math.min(1, (focus.reading - .04) / .80)) : 0;
        turn = motion ? lensProgress * Math.PI * .72 : 0;
        const active = Math.min(focus.lenses.length - 1, Math.floor(lensProgress * focus.lenses.length));
        if (active !== focus.active) {
          focus.lenses[focus.active]?.removeAttribute('aria-current');
          focus.lenses[active]?.setAttribute('aria-current', 'step');
          focus.active = active;
        }
      }
      if (motion) queue();
      if (!renderer) return;

      const extra = Math.max(0, (progress - 1) * openingScreens);
      const cursor = (extra - presetStop(0)) / .70;
      const resting = Math.abs(progress - target) < .0001;
      if (motion) {
        time += dt;
        flight += dt * (1 - ease(.014, .033, p));
        if (resting && (extra === 0 || (cursor >= -.03 && cursor % 1 <= .35))) formation += dt;
      }
      const pathway = ladder ? ease(.255, .30, p) * (1 - ease(.31, .42, p)) : 0;
      const scale = 1 - (w >= 680 ? .46 : 0) * pathway;
      const lift = h * (.14 * ease(.14, .29, p) * (1 - ease(.31, .54, p))
        + (w >= 680 ? .20 * ease(0, .48, extra) : 0)
        + (w >= 680 ? .13 : .14) * pathway);
      const spin = ladder ? Math.max(0, Math.min(1, (y - ladder.top) / ladder.span)) : 0;
      const travelTarget = motion && stack
        ? ease(stack.top, stack.top + Math.max(1, stack.height - h), y) * w * .24
        : 0;
      rowTravel = motion && dt ? followScroll(rowTravel, travelTarget, dt, 1) : travelTarget;
      const center = w >= 680 ? w * .215 * ease(0, .48, extra) : 0;
      let poses = Array.from({ length: COUNT }, (_, i) => {
        const img = images[i % images.length];
        const grid = cardPose(i, Math.min(p, gridPhase), formation, w, h,
          img.naturalHeight / img.naturalWidth, flight, inStack || wheel > 0 ? 0 : pointerX, spin, rowTravel);
        const opening = wheel > 0 ? focusWheelPose(grid, i, wheel, turn, w, h) : grid;
        const pose = extra > 0 ? galleryPose(opening, i, extra, formation, w, h) : opening;
        if (pathway) {
          for (const k of [0, 1, 2, 6, 9]) pose[k] *= scale;
        }
        pose[0] -= center;
        pose[1] -= lift;
        return pose;
      });
      let light = lensAt(progress * openingScreens);
      if (background) {
        const blend = motion
          ? ease(background.top - APPROACH_COVER_LEAD * h, background.top - .10 * h, y) *
            (1 - ease(background.end - .68 * h, background.end + .28 * h, y))
          : Number(y + 1 >= background.top && y < background.end);
        if (blend > 0) {
          const travel = motion ? Math.max(0, Math.min(1, (y - background.top) / background.span)) : .46;
          const shift = motion ? Math.min(0, background.end - h - y) : 0;
          const ribbons = sectionCoverPoses(1, travel, time, w, h, h * .68, shift);
          poses = blendSectionCover(poses, ribbons, blend, Math.min(w, h));
          light = { exposure: light.exposure * (1 - blend) + .16 * blend,
            dispersion: light.dispersion * (1 - blend), edge: light.edge * (1 - blend) };
        }
      }
      renderer.draw(poses, w, h, time, light);
    }

    function point(event) {
      pointerTarget = event.pointerType === 'mouse' && event.target.closest('[data-play-surface]')
        ? Math.max(-1, Math.min(1, ((event.clientX - host.getBoundingClientRect().left) / w) * 2 - 1))
        : 0;
    }

    function resetPointer() {
      pointerTarget = 0;
    }

    function visibility() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      queue();
    }

    function useFallback(event) {
      event?.preventDefault();
      renderer?.dispose();
      renderer = images && createDOMRenderer(fallback.current, images);
      surface.hidden = true;
      queue();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    observer.observe(host);
    const focusPin = root.querySelector('.focus-pin');
    if (focusPin) observer.observe(focusPin);
    resize();
    loadPages().then(loaded => {
      if (stopped) return;
      images = loaded;
      try { renderer = createRenderer(surface, images); } catch (error) { console.warn(error); }
      if (!renderer) useFallback();
      queue();
    }).catch(() => {
      if (stopped) return;
      artworkFailed = true;
      setLoadError(true);
      queue();
    });

    root.addEventListener('pointermove', point);
    root.addEventListener('pointerleave', resetPointer);
    window.addEventListener('scroll', queue, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    motionPreference.addEventListener('change', visibility);
    surface.addEventListener('webglcontextlost', useFallback);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer?.dispose();
      root.removeEventListener('pointermove', point);
      root.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('scroll', queue);
      document.removeEventListener('visibilitychange', visibility);
      motionPreference.removeEventListener('change', visibility);
      surface.removeEventListener('webglcontextlost', useFallback);
    };
  }, [track]);

  return <div className="stage" ref={stage}>
    <canvas className="scene" ref={canvas} aria-hidden="true" />
    <div ref={fallback} className="fallback" aria-hidden="true" />
    {loadError && <p className="load-error" role="status">{lang === 'en' ? 'The paper artwork could not load.' : '纸页素材加载失败。'}</p>}
  </div>;
}

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ease } from './choreography';
import { lensAt } from './openingLens';
import { PartCoverArtwork, ResearchPartCover } from './ResearchPartCover';
import { ResearchGap } from './ResearchGap';
import { ResearchSupportDiagram } from './ResearchSupportDiagram';
import { followScroll, viewportProgress } from './scrollProgress';
import { COMPARISON_COVER_LEAD, COMPARISON_RING_SETTLE, comparisonRingPoses, researchGapPaperPoses } from './sectionCoverMotion';

function gapProgressAt(scene) {
  const travel = scene.getBoundingClientRect().height - scene.firstElementChild.offsetHeight;
  return ease(0, Math.max(1, travel), -scene.getBoundingClientRect().top);
}

function departureAt(layout, markerTop) {
  const travel = layout.bottom - markerTop;
  const progress = ease(.12, 1, travel / Math.max(1, layout.distance));
  return { readingComplete: travel >= 0, progress, slide: progress * (layout.viewport - layout.top) };
}

export function ResearchComparison() {
  const section = useRef(null);
  const plate = useRef(null);
  const backdrop = useRef(null);
  const departure = useRef(null);
  const layout = useRef(null);
  const gap = useRef(null);
  const gapClock = useRef(null);
  const [near, setNear] = useState(false);

  const describePaperFrame = useCallback((width, height, motion, artworkTop, aspects, now) => {
    const landing = gap.current.getBoundingClientRect();
    if (!motion) {
      const ring = comparisonRingPoses(1, width, height);
      return landing.top > 1 ? { poses: ring } : {
        poses: researchGapPaperPoses(ring, 1, .62, width, height, aspects),
        light: lensAt(0),
      };
    }

    const cover = section.current.previousElementSibling;
    const coverTop = cover.getBoundingClientRect().top;
    const progress = viewportProgress(coverTop, height, COMPARISON_COVER_LEAD, -COMPARISON_RING_SETTLE);
    const { band, top } = layout.current;
    const exit = departureAt(layout.current, departure.current.getBoundingClientRect().top);
    const plateY = exit.readingComplete ? top + exit.slide : plate.current.getBoundingClientRect().top;
    const plateTop = Math.max(band, plateY - artworkTop);
    const turn = Math.PI * ease(COMPARISON_RING_SETTLE * height, cover.offsetHeight - height + band, -coverTop);
    const exitTurn = Math.PI * .9 * exit.progress;
    const ring = comparisonRingPoses(progress, width, height, plateTop, turn + exitTurn);
    const gapProgress = gapProgressAt(gap.current);
    const spread = ease(0, .86, gapProgress);
    const animate = gapProgress > .76 && landing.bottom > 0;
    if (!animate) gapClock.current = null;
    if (spread === 0) return { poses: ring };

    if (animate) {
      const clock = gapClock.current ?? { time: 0, last: now };
      clock.time += Math.min(.055, (now - clock.last) / 1000);
      clock.last = now;
      gapClock.current = clock;
    }
    const drift = gapClock.current?.time ?? 0;
    const time = .62 + drift * ease(.76, 1, gapProgress);
    const opening = lensAt(0);
    return {
      poses: researchGapPaperPoses(ring, spread, time, width, height, aspects),
      light: {
        edge: opening.edge * spread,
        dispersion: opening.dispersion * spread,
        exposure: .16 + (opening.exposure - .16) * spread,
      },
      time,
      animate,
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: '15% 0px' });
    observer.observe(backdrop.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const scene = section.current;
    const groups = [...scene.querySelectorAll('[data-support-copy], [data-support-layer]')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const reveal = groups.map(() => 0);
    let frame = 0;
    let previousTime;
    let slide = 0;
    let gapPosition;

    function measure() {
      const viewport = window.innerHeight;
      const height = plate.current.getBoundingClientRect().height;
      const band = parseFloat(getComputedStyle(scene).paddingTop);
      const top = Math.min(band, viewport - height);
      layout.current = { viewport, band, top, bottom: top + height, distance: departure.current.offsetHeight };
      plate.current.style.setProperty('--support-pin-top', top + 'px');
      queue();
    }

    function update(now) {
      frame = 0;
      const { viewport } = layout.current;
      const introReady = scene.getBoundingClientRect().top <= 1;
      const exit = departureAt(layout.current, departure.current.getBoundingClientRect().top);
      const freeze = motion.matches || exit.readingComplete;
      const nextSlide = motion.matches ? 0 : exit.slide;
      const seconds = previousTime === undefined ? 1 / 60 : Math.min(.05, (now - previousTime) / 1000);
      let moving = false;
      for (const [index, group] of groups.entries()) {
        const kind = group.dataset.supportCopy;
        let next = 1;
        if (!freeze) {
          const box = group.getBoundingClientRect();
          const progress = kind === 'intro' ? Number(introReady) : kind === 'note'
            ? viewportProgress(box.bottom - slide, viewport, 1.14, .975)
            : viewportProgress(box.top - slide, viewport, .99, .70);
          const ready = index === 0 ? 1 : ease(kind === 'intro' ? .46 : .24, kind === 'intro' ? .88 : .70, reveal[index - 1]);
          const target = Math.min(ease(0, 1, progress), ready);
          next = followScroll(reveal[index], target, seconds, 140, kind === 'intro' ? 8 : 12);
          moving ||= next !== target;
        }
        if (next !== reveal[index]) group.style.setProperty('--support-reveal', next);
        reveal[index] = next;
      }
      if (nextSlide !== slide) {
        plate.current.style.setProperty('--support-slide', nextSlide + 'px');
        slide = nextSlide;
      }
      const nextGapPosition = motion.matches ? 1 : gapProgressAt(gap.current);
      if (nextGapPosition !== gapPosition) {
        gap.current.style.setProperty('--gap-progress', nextGapPosition);
        gapPosition = nextGapPosition;
      }
      previousTime = moving ? now : undefined;
      if (moving) queue();
    }

    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(measure);
    resize.observe(scene);
    resize.observe(plate.current);
    resize.observe(gap.current);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', measure);
    motion.addEventListener('change', measure);
    measure();

    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', measure);
      motion.removeEventListener('change', measure);
    };
  }, []);

  return <div className="comparison-sequence">
    <div className="comparison-backdrop" ref={backdrop} aria-hidden="true">
      <PartCoverArtwork part={3} near={near} describeFrame={describePaperFrame} />
    </div>
    <ResearchPartCover part={3} />
    <section ref={section} className="research-support" id="research-support" data-chapter data-art-covered
      aria-labelledby="research-support-title">
      <div className="research-support-plate" ref={plate}>
        <header className="research-support-intro">
          <div className="research-support-title" data-support-copy="intro">
            <div className="research-support-copy-mask">
              <h2 className="research-support-copy-rise" id="research-support-title" tabIndex={-1}>
                Research Support &amp; Limits
              </h2>
            </div>
          </div>
          <div className="research-support-copy-mask" data-support-copy="intro">
            <h3 className="research-support-copy-rise">
              Prior work <ArrowRight aria-hidden="true" /> Support <ArrowRight aria-hidden="true" />{' '}
              <span>Open Questions</span>
            </h3>
          </div>
          <div className="research-support-copy-mask research-support-description" data-support-copy="intro">
            <p className="research-support-copy-rise">Existing methods lead to three questions this study will test.</p>
          </div>
        </header>
        <ResearchSupportDiagram />
        <footer className="research-support-note">
          <div className="research-support-copy-mask" data-support-copy="note">
            <p className="research-support-copy-rise">
              Evaluation must also consider record burden <a className="citation" href="#ref-13">[13]</a>, user control,
              and whether the interface matches actual execution <a className="citation" href="#ref-14">[14–15]</a>.
            </p>
          </div>
        </footer>
      </div>
      <span className="research-support-departure" ref={departure} aria-hidden="true" />
    </section>
    <ResearchGap scene={gap} />
  </div>;
}

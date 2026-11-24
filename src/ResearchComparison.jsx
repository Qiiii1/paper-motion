import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Citation } from './Citation';
import { ease } from './choreography';
import { lensAt } from './openingLens';
import { PartCoverArtwork, ResearchPartCover } from './ResearchPartCover';
import { ResearchGap } from './ResearchGap';
import { ResearchQuestions, questionsDeparture } from './ResearchQuestions';
import { ResearchDesign, ResearchProcess } from './ResearchStudy';
import { ResearchSupportDiagram } from './ResearchSupportDiagram';
import { followScroll, viewportProgress } from './scrollProgress';
import {
  COMPARISON_COVER_LEAD, COMPARISON_RING_SETTLE, blendSectionCover, comparisonRingPoses,
  departGapPapers, questionsCoverPoses, researchGapPaperPoses, sectionCoverPoses, studyCoverPoses, studyOpeningRing,
} from './sectionCoverMotion';

function gapPositionAt(scene, top) {
  const outro = scene.lastElementChild;
  const travel = outro.offsetTop - scene.firstElementChild.offsetHeight;
  return {
    entrance: ease(0, Math.max(1, travel), -top),
    exit: Math.max(0, Math.min(1, (-top - travel) / Math.max(1, outro.offsetHeight))),
  };
}

const fadeEnd = .36;
const landingEnd = .93;

function departureAt(layout, markerTop) {
  const travel = layout.bottom - markerTop;
  const phase = travel / Math.max(1, layout.distance);
  return {
    readingComplete: travel >= 0,
    fade: ease(.06, fadeEnd, phase),
    landing: Math.max(0, Math.min(1, (phase - fadeEnd) / (landingEnd - fadeEnd))),
    turn: Math.PI * .12 * ease(landingEnd, 1, phase),
  };
}

export function ResearchComparison() {
  const section = useRef(null);
  const plate = useRef(null);
  const backdrop = useRef(null);
  const departure = useRef(null);
  const layout = useRef(null);
  const gap = useRef(null);
  const gapClock = useRef(null);
  const questions = useRef(null);
  const design = useRef(null);
  const process = useRef(null);
  const [near, setNear] = useState(false);

  const describePaperFrame = useCallback((width, height, motion, artworkTop, aspects, now) => {
    const designCover = design.current.previousElementSibling;
    const designBounds = designCover.getBoundingClientRect();
    const { questionsBand, studyBand } = layout.current;
    if (designBounds.top <= 0) {
      const processTop = process.current.getBoundingClientRect().top - artworkTop;
      if (processTop < height) {
        return { poses: sectionCoverPoses(6, .10, 0, width, height, height * .65, processTop - height * .49) };
      }
      const designPlate = design.current.firstElementChild.getBoundingClientRect().top - artworkTop;
      const coverProgress = -designBounds.top / Math.max(1, designBounds.height - height);
      const flatten = motion ? ease(height * 1.13, studyBand + 1, designPlate) : Number(designPlate <= studyBand + 1);
      return {
        poses: studyCoverPoses(motion ? coverProgress / .40 : 1, flatten, width, height, questionsBand),
        time: coverProgress * 4,
      };
    }

    const landing = gap.current.getBoundingClientRect();
    const questionsCover = gap.current.nextElementSibling;
    const coverBounds = questionsCover.getBoundingClientRect();
    const coverProgress = -coverBounds.top / Math.max(1, coverBounds.height - height);
    // Give the first incoming sheet room to cross the edge as the last
    // outgoing sheets finish leaving the opposite side of the frame.
    const ribbonProgress = (coverProgress + .038) / .438;

    if (coverBounds.top <= 0) {
      const departure = motion ? questionsDeparture(questions.current, height) : 0;
      if (departure > 0) return { poses: studyOpeningRing(departure, width, height, questionsBand) };
      const plateTop = questions.current.firstElementChild.getBoundingClientRect().top - artworkTop;
      const ribbons = questionsCoverPoses(motion ? ribbonProgress : 1, width, height);
      const merge = motion ? ease(height, questionsBand, plateTop) : Number(plateTop <= questionsBand + 1);
      const turn = Math.PI * (.13 + .37 * merge);
      const ringTop = Math.max(questionsBand, plateTop) - height * .20 * merge;
      const ring = comparisonRingPoses(1, width, height, ringTop, turn);
      return {
        poses: blendSectionCover(ribbons, ring, merge, Math.min(width, height)),
        time: coverProgress * 4,
      };
    }

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
    const { band } = layout.current;
    const exit = departureAt(layout.current, departure.current.getBoundingClientRect().top);
    const plateTop = Math.max(band, plate.current.getBoundingClientRect().top - artworkTop);
    const turn = Math.PI * ease(COMPARISON_RING_SETTLE * height, cover.offsetHeight - height + band, -coverTop);
    const ring = exit.readingComplete
      ? comparisonRingPoses(exit.landing, width, height, height, turn + Math.PI * .9 + exit.turn)
      : comparisonRingPoses(progress, width, height, plateTop, turn);
    const { entrance, exit: gapExit } = gapPositionAt(gap.current, landing.top);
    const spread = ease(0, .86, entrance);
    const animate = entrance > .76 && gapExit === 0;
    if (entrance <= .76) gapClock.current = null;
    if (spread === 0) return { poses: ring };

    if (animate) {
      const clock = gapClock.current ?? { time: 0, last: now };
      clock.time += Math.min(.055, (now - clock.last) / 1000);
      clock.last = now;
      gapClock.current = clock;
    }
    const drift = gapClock.current?.time ?? 0;
    const time = .62 + drift * ease(.76, 1, entrance);
    const opening = lensAt(0);
    const scattered = researchGapPaperPoses(ring, spread, time, width, height, aspects);
    let poses = gapExit > .31 ? departGapPapers(scattered, (gapExit - .31) / .69, width, height) : scattered;
    if (gapExit > 0 && ribbonProgress > 0) {
      const ribbons = questionsCoverPoses(ribbonProgress, width, height);
      poses = poses.map((pose, index) => pose[6] > 0 ? pose : ribbons[index]);
    }
    const light = spread * (1 - ease(.88, 1, gapExit));
    return {
      poses,
      light: {
        edge: opening.edge * light,
        dispersion: opening.dispersion * light,
        exposure: .16 + (opening.exposure - .16) * light,
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
    let fade;
    let gapPosition;
    let gapHold;

    function measure() {
      const viewport = window.innerHeight;
      const height = plate.current.getBoundingClientRect().height;
      const band = parseFloat(getComputedStyle(scene).paddingTop);
      const top = Math.min(0, viewport - height);
      const bottom = top + height;
      const questionsBand = parseFloat(getComputedStyle(questions.current).paddingTop);
      const studyBand = parseFloat(getComputedStyle(design.current).paddingTop);
      layout.current = { viewport, band, bottom, questionsBand, studyBand, distance: departure.current.offsetHeight };
      plate.current.style.setProperty('--support-pin-top', top + 'px');
      scene.parentElement.style.setProperty('--gap-overlap', bottom + 'px');
      scene.parentElement.style.setProperty('--questions-overlap', gap.current.firstElementChild.offsetHeight + 'px');
      queue();
    }

    function update(now) {
      frame = 0;
      const { viewport } = layout.current;
      const introReady = scene.getBoundingClientRect().top <= 1;
      const exit = departureAt(layout.current, departure.current.getBoundingClientRect().top);
      const freeze = motion.matches || exit.readingComplete;
      const nextFade = motion.matches ? 0 : exit.fade;
      const seconds = previousTime === undefined ? 1 / 60 : Math.min(.05, (now - previousTime) / 1000);
      let moving = false;
      for (const [index, group] of groups.entries()) {
        const kind = group.dataset.supportCopy;
        let next = 1;
        if (!freeze) {
          const box = group.getBoundingClientRect();
          const progress = kind === 'intro' ? Number(introReady) : kind === 'note'
            ? viewportProgress(box.bottom, viewport, 1.14, .975)
            : viewportProgress(box.top, viewport, .99, .70);
          const ready = index === 0 ? 1 : ease(kind === 'intro' ? .46 : .24, kind === 'intro' ? .88 : .70, reveal[index - 1]);
          const target = Math.min(ease(0, 1, progress), ready);
          next = followScroll(reveal[index], target, seconds, 140, kind === 'intro' ? 8 : 12);
          moving ||= next !== target;
        }
        if (next !== reveal[index]) group.style.setProperty('--support-reveal', next);
        reveal[index] = next;
      }
      if (nextFade !== fade) {
        plate.current.style.setProperty('--support-opacity', 1 - nextFade);
        plate.current.toggleAttribute('data-support-cleared', nextFade === 1);
        fade = nextFade;
      }
      const { entrance, exit: gapExit } = gapPositionAt(gap.current, gap.current.getBoundingClientRect().top);
      const nextGapPosition = motion.matches ? 1 : entrance;
      const nextGapHold = motion.matches ? 1 : 1 - ease(0, .31, gapExit);
      if (nextGapPosition !== gapPosition) {
        gap.current.style.setProperty('--gap-progress', nextGapPosition);
        gapPosition = nextGapPosition;
      }
      if (nextGapHold !== gapHold) {
        gap.current.style.setProperty('--gap-hold', nextGapHold);
        gapHold = nextGapHold;
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
              Evaluation must also consider record burden <Citation>[13]</Citation>, user control,
              and whether the interface matches actual execution <Citation>[14–15]</Citation>.
            </p>
          </div>
        </footer>
      </div>
      <span className="research-support-departure" ref={departure} aria-hidden="true" />
    </section>
    <ResearchGap scene={gap} />
    <ResearchPartCover part={5} />
    <ResearchQuestions scene={questions} />
    <ResearchPartCover part={6} />
    <ResearchDesign scene={design} />
    <ResearchProcess scene={process} />
  </div>;
}

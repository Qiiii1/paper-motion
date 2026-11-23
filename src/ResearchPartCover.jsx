import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { ease } from './choreography';
import { keepCardsApart } from './cardClearance';
import { createDOMRenderer, createRenderer, loadPages } from './renderer';
import { relatedTitleReveal, sectionCoverPoses } from './sectionCoverMotion';
import { viewportProgress } from './scrollProgress';
import { useScrollScene } from './scrollScene';

const light = { edge: 0, exposure: .16 };
const parts = [
  { id: 'part-01', number: '01', title: ['Research', 'Background'] },
  { id: 'part-02', number: '02', title: ['Related', 'Research'] },
  { id: 'part-03', number: '03', title: ['Comparison', '& critique'] },
];

function PartCoverArtwork({ part, near, progress }) {
  const picture = useRef(null);
  const canvas = useRef(null);
  const fallback = useRef(null);
  const scroll = useRef(progress);
  const requestDraw = useRef(null);
  useLayoutEffect(() => {
    scroll.current = progress;
    requestDraw.current?.();
  }, [progress]);

  useEffect(() => {
    if (!near) return;
    const host = picture.current;
    const surface = canvas.current;
    const htmlArtwork = fallback.current;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let renderer, pages, frame = 0, stopped = false;

    function draw(timestamp) {
      frame = 0;
      if (!renderer) return;
      const motion = !media.matches;
      const w = host.clientWidth, h = host.clientHeight;
      const position = motion ? scroll.current : .54;
      const time = motion ? (part === 2 ? position * 4 : timestamp / 1000) : 0;
      const poses = sectionCoverPoses(part, position, time, w, h);
      renderer.draw(keepCardsApart(poses), w, h, time, light);
      if (motion && part !== 2) queue();
    }
    function queue() {
      if (!frame && !stopped) frame = requestAnimationFrame(draw);
    }
    function useFallback(event) {
      event?.preventDefault();
      if (!pages) return;
      renderer?.dispose();
      surface.hidden = true;
      renderer = createDOMRenderer(htmlArtwork, pages);
      queue();
    }
    requestDraw.current = queue;
    const resize = new ResizeObserver(queue);
    resize.observe(host);
    media.addEventListener('change', queue);
    surface.addEventListener('webglcontextlost', useFallback);
    loadPages().then(images => {
      if (stopped) return;
      pages = images;
      try { renderer = createRenderer(surface, images); } catch (error) { console.warn(error); }
      surface.hidden = !renderer;
      if (!renderer) useFallback();
      queue();
    }).catch(error => { if (!stopped) console.warn(error); });
    return () => {
      stopped = true;
      requestDraw.current = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      renderer?.dispose();
      media.removeEventListener('change', queue);
      surface.removeEventListener('webglcontextlost', useFallback);
    };
  }, [near, part]);

  return <div className="part-cover-art" ref={picture} aria-hidden="true">
    <canvas className="scene" ref={canvas} />
    <div className="fallback" ref={fallback} />
  </div>;
}

export function ResearchPartCover({ part }) {
  const { id, number, title } = parts[part - 1];
  const { root, progress, position, near, top } = useScrollScene();
  const connected = part === 1;
  const related = part === 2;
  const entry = viewportProgress(top, window.innerHeight, .42, .06);
  const titleProgress = related
    ? relatedTitleReveal(position)
    : Math.min(entry, 1 - ease(.86, 1, progress));
  return <section className="part-cover" id={id} ref={root} data-chapter data-play-surface
    data-approach-cover={connected ? '' : undefined} data-art-covered={!connected ? '' : undefined}
    data-related-cover={related ? '' : undefined}
    data-related-active={related && top <= 0 ? '' : undefined}
    data-related-reading={related && titleProgress > 0 ? '' : undefined}
    aria-labelledby={id + '-title'} style={{ '--part-reveal': titleProgress }}>
    <div className="part-cover-pin">
      {!connected && <PartCoverArtwork part={part} near={near} progress={related ? position : progress} />}
      <h2 className="part-cover-title" id={id + '-title'} aria-label={title.join(' ')} tabIndex={-1}>
        {title.map(line => <span key={line}><span>{line}</span></span>)}
      </h2>
      <span className="part-cover-number" aria-hidden="true">{number}</span>
      <nav className="part-cover-nav" aria-label="Part navigation">
        <button type="button" className="part-cover-back" aria-label="Previous scene" data-playback data-stage-step="-1">←</button>
        <button type="button" data-playback data-stage-step="1">Next scene <span aria-hidden="true">→</span></button>
      </nav>
    </div>
    {related && <span id="related-research-ready" className="related-arrival" data-scene-arrival aria-hidden="true" />}
  </section>;
}

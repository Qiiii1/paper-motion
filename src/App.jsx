import React, { useLayoutEffect, useRef } from 'react';
import { PaperStage } from './PaperStage';
import { OpeningCover, ResearchChapters } from './ResearchContent';
import { edition, messages, pageY } from './research';
import { useStagePlayback } from './stagePlayback';

export function App() {
  const track = useRef(null);
  useStagePlayback(track);

  useLayoutEffect(() => {
    const hash = location.hash;
    const target = document.getElementById(hash === '#presets' ? 'chapter-05' : hash.slice(1));
    if (!target) return;
    const input = new AbortController();
    let frame;
    const stop = () => {
      input.abort();
      cancelAnimationFrame(frame);
    };
    const arrival = target.querySelector('[data-scene-arrival]') ?? target;
    const align = () => window.scrollTo({ top: pageY(arrival), behavior: 'instant' });
    align();
    for (const event of ['wheel', 'pointerdown', 'keydown']) {
      window.addEventListener(event, stop, { passive: true, signal: input.signal });
    }
    // Earlier sticky plates remeasure when fonts settle. Align after that layout.
    document.fonts.ready.then(() => {
      if (input.signal.aborted) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (location.hash === hash) align();
          stop();
        });
      });
    });
    return stop;
  }, []);

  return <main>
    <div className="research-track" ref={track}>
      <PaperStage track={track} lang="en" />
      <div className="research-flow">
        <OpeningCover edition={edition} ui={messages} />
        <ResearchChapters edition={edition} ui={messages} lang="en" />
      </div>
    </div>
  </main>;
}

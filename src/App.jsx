import React, { useLayoutEffect, useRef } from 'react';
import { PaperStage } from './PaperStage';
import { OpeningCover, ResearchChapters } from './ResearchContent';
import { edition, messages } from './research';
import { useStagePlayback } from './stagePlayback';

export function App() {
  const track = useRef(null);
  useStagePlayback(track);

  useLayoutEffect(() => {
    const hash = location.hash;
    const target = document.getElementById(hash === '#presets' ? 'chapter-05' : hash.slice(1));
    if (!target) return;
    const input = new AbortController();
    const stop = () => input.abort();
    const arrival = target.querySelector('[data-scene-arrival]') ?? target;
    const align = () => arrival.scrollIntoView({ behavior: 'instant' });
    align();
    for (const event of ['wheel', 'pointerdown', 'keydown']) {
      window.addEventListener(event, stop, { passive: true, signal: input.signal });
    }
    // Earlier chapters can change height as the heading font loads.
    document.fonts.ready.then(() => {
      if (!input.signal.aborted && location.hash === hash) align();
      stop();
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

import React, { useLayoutEffect, useRef, useState } from 'react';
import { ease } from './choreography';
import { useScrollScene } from './scrollScene';
import { number } from './research';

// The research pathway is pinned while the reader moves through its six
// movements. The arrow slides down the ladder, and the ring of pages above it
// turns with the same scroll distance.
export function ResearchApproach({ id, title, steps, phase }) {
  const { root, progress, near, top, bottom } = useScrollScene();
  const list = useRef(null);
  const [tops, setTops] = useState([]);
  const position = Math.max(0, Math.min(steps.length - 1, progress * steps.length));
  const index = Math.floor(position);
  const current = Math.min(steps.length - 1, Math.floor(position + .5));
  const fraction = position - index;

  useLayoutEffect(() => {
    const measure = () => {
      if (list.current) setTops([...list.current.children].map(node => node.offsetTop));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (list.current) observer.observe(list.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [steps.length]);

  const height = window.innerHeight;
  const lift = Math.max(0, Math.min(height, top));
  const enter = ease(.38 * height, 0, top);
  const exit = ease(1.28 * height, .98 * height, bottom);
  // Finish reversing the text inside fixed masks before the plate uncovers
  // the foreground of the chapter cover.
  const depart = ease(.86 * height, .24 * height, bottom);
  const reveal = Math.min(enter, 1 - exit);

  const from = tops[index] ?? 0;
  const to = tops[Math.min(tops.length - 1, index + 1)] ?? from;
  const arrow = from + (to - from) * fraction;

  return <section className="research-chapter approach-chapter" id={id} ref={root}
    data-chapter data-motion={phase} data-approach data-play-surface aria-labelledby={id + '-title'}>
    <div className="approach-pin">
      <div className="approach-plate" data-approach-exiting={exit > 0 ? '' : undefined} style={{
        '--approach-reveal': reveal,
        transform: `translateY(calc(${lift}px + ${depart * 100}% + ${depart * 9}svh))`,
        visibility: !near || depart === 1 ? 'hidden' : undefined,
      }}>
        <div className="approach-type">
          <div className="approach-mask">
            <h2 className="approach-rise" id={id + '-title'} tabIndex={-1}>{title}</h2>
          </div>
          <div className="approach-mask approach-list-mask">
            <div className="approach-list approach-rise">
              <span className="approach-arrow" aria-hidden="true" style={{transform: 'translateY(' + arrow + 'px)'}}>→</span>
              <ol className="approach-steps" ref={list}>
                {steps.map((step, i) => <li key={step}
                  className={i === current ? 'is-active' : i < current ? 'is-past' : undefined}
                  aria-current={i === current ? 'step' : undefined}>
                  <span className="approach-number">{number(i + 1)}</span>
                  <span className="approach-label">{step}</span>
                </li>)}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

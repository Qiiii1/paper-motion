import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useScrollScene } from './scrollScene';
import { number } from './research';

// The research pathway is pinned while the reader moves through its six
// movements. The arrow slides down the ladder, and the ring of pages above it
// turns with the same scroll distance.
export function ResearchApproach({ id, title, steps, phase }) {
  const { root, progress, top } = useScrollScene();
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

  // The slab rides up with the section while it enters, then holds perfectly
  // still; at the end of the pinned span it dissolves instead of sliding away.
  const lift = Math.max(0, Math.min(window.innerHeight, top));
  const exit = Math.max(0, Math.min(1, (progress - .94) / .06));

  const from = tops[index] ?? 0;
  const to = tops[Math.min(tops.length - 1, index + 1)] ?? from;
  const arrow = from + (to - from) * fraction;

  return <section className="research-chapter approach-chapter" id={id} ref={root}
    data-chapter data-motion={phase} data-approach data-play-surface aria-labelledby={id + '-title'}>
    <div className="approach-pin">
      <div className="approach-plate" style={{transform: 'translateY(' + lift + 'px)', opacity: 1 - exit, pointerEvents: exit > .5 ? 'none' : undefined}}>
        <div className="approach-type">
          <h2 id={id + '-title'} tabIndex={-1}>{title}</h2>
          <div className="approach-list">
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
  </section>;
}

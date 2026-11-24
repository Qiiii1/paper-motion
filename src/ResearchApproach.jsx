import React, { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ease } from './choreography';
import { useScrollScene } from './scrollScene';
import { number } from './research';

// The arrow follows the pinned contents while the ring turns above it.
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
    data-chapter data-motion={phase} data-approach data-play-surface aria-labelledby={id + '-title'}
    style={{ '--approach-steps': steps.length }}>
    <div className="approach-pin">
      <div className="approach-plate" data-approach-exiting={exit > 0 ? '' : undefined} style={{
        '--approach-reveal': reveal,
        transform: `translateY(calc(${lift}px + ${depart * 100}% + ${depart * 9}svh))`,
        visibility: !near || depart === 1 ? 'hidden' : undefined,
      }}>
        <div className="approach-type">
          <div className="approach-mask">
            <h2 className="approach-rise" id={id + '-title'} tabIndex={-1} data-title-reveal>{title}</h2>
          </div>
          <div className="approach-mask approach-list-mask">
            <nav className="approach-list approach-rise" aria-labelledby={id + '-title'}>
              <ArrowRight className="approach-arrow" aria-hidden="true" style={{transform: 'translateY(' + arrow + 'px)'}} />
              <ol className="approach-steps" ref={list} role="list">
                {steps.map(({ label, target }, i) => <li key={target}
                  className={i === current ? 'is-active' : i < current ? 'is-past' : undefined}
                  aria-current={i === current ? 'step' : undefined}>
                  <a href={'#' + target} data-stage-link>
                    <span className="approach-number">{number(i + 1)}</span>
                    <span className="approach-label">{label}</span>
                  </a>
                </li>)}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

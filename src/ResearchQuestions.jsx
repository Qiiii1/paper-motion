import React, { useLayoutEffect, useRef } from 'react';
import { ease } from './choreography';
import { viewportProgress } from './scrollProgress';

export function questionsDeparture(section, height) {
  const { top, height: travel } = section.lastElementChild.getBoundingClientRect();
  return Math.max(0, Math.min(1, (height - top) / Math.max(1, travel)));
}

function Reveal({ children, intro }) {
  return <div className="questions-mask" data-questions-reveal={intro}>
    <div className="questions-rise" data-title-reveal={intro === 0 ? '' : undefined}>{children}</div>
  </div>;
}

export function ResearchQuestions({ scene }) {
  const plate = useRef(null);

  useLayoutEffect(() => {
    const node = plate.current;
    const groups = [...node.querySelectorAll('.questions-mask')];
    const previous = groups.map(() => 0);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    function update() {
      frame = 0;
      const height = window.innerHeight;
      const { top, bottom } = node.getBoundingClientRect();
      if (top > height || bottom < 0) return;
      const departure = motion.matches ? 0 : questionsDeparture(scene.current, height);
      node.style.setProperty('--questions-hold', 1 - ease(0, .53, departure));
      node.style.setProperty('--questions-plate-alpha', 1 - ease(.26, .84, departure));
      node.toggleAttribute('data-questions-cleared', departure >= .84);
      const end = Math.max(.27, node.offsetTop / height);
      const entrance = viewportProgress(top, height, .69, end) * 1.62;
      const finish = viewportProgress(bottom, height, 1.12, 1.002);
      const reveal = groups.map(group => {
        const intro = group.dataset.questionsReveal;
        const progress = intro === undefined
          ? Math.min(Math.max(viewportProgress(group.getBoundingClientRect().top, height, .99, .908), finish), entrance - .60)
          : entrance - Number(intro);
        return motion.matches ? 1 : ease(0, 1, progress);
      });
      reveal.forEach((value, index) => {
        if (previous[index] !== value) groups[index].style.setProperty('--questions-reveal', value);
        previous[index] = value;
      });
    }

    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function measure() {
      node.style.setProperty('--questions-pin-top', Math.min(0, window.innerHeight - node.offsetHeight) + 'px');
      queue();
    }

    const resize = new ResizeObserver(measure);
    resize.observe(node);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', measure);
    motion.addEventListener('change', queue);
    measure();
    update();
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', measure);
      motion.removeEventListener('change', queue);
    };
  }, [scene]);

  return <section ref={scene} className="research-questions" id="research-questions"
    aria-labelledby="research-questions-title" data-chapter data-art-covered>
    <div className="questions-plate" ref={plate}>
      <div className="questions-copy">
        <header className="questions-heading">
          <Reveal intro={0}>
            <h2 id="research-questions-title" tabIndex={-1}>Research<br />Questions</h2>
          </Reveal>
          <Reveal intro={.22}><p className="questions-subtitle">Before action, after action</p></Reveal>
          <div className="questions-preface">
            <Reveal intro={.4}><h3>Before / After</h3></Reveal>
            <Reveal intro={.59}><p>The study separates judgment before execution from verification after execution.</p></Reveal>
          </div>
        </header>
        <Reveal><h3 className="questions-kicker">One task change / Two moments of judgment</h3></Reveal>
        <div className="questions-moment questions-before">
          <Reveal>
            <div className="questions-moment-label">
              <span aria-hidden="true">01</span>
              <p>Before<br />execution</p>
            </div>
          </Reveal>
          <Reveal><h3>Where should<br />we intervene?</h3></Reveal>
          <Reveal><p className="questions-detail">Compare a node + dependency view with a linear list while holding task information, editing, and preview functions constant.</p></Reveal>
        </div>
        <div className="questions-moment questions-after">
          <Reveal>
            <div className="questions-moment-label">
              <p>After<br />execution</p>
              <span aria-hidden="true">02</span>
            </div>
          </Reveal>
          <Reveal><h3>Was the change<br />carried out?</h3></Reveal>
          <Reveal><p className="questions-detail">Show changes to plans and outputs. Test detection of missed edits, overreach, and unnecessary reruns.</p></Reveal>
        </div>
        <footer className="questions-note">
          <Reveal><p>Both comparisons must keep task information and relevant functions aligned.</p></Reveal>
        </footer>
      </div>
    </div>
    <span className="questions-outro" aria-hidden="true" />
  </section>;
}

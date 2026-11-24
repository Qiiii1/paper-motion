import React, { useLayoutEffect, useRef } from 'react';
import { Binoculars, Target } from 'lucide-react';
import { papers, paperTints } from './papers';
import { ease } from './choreography';
import { LITERATURE_CARD_COUNT, literatureCardPose, literatureSlot, literatureTurn } from './literatureOrbit';
import { viewportProgress } from './scrollProgress';
import { publicAsset } from './publicAsset';

const strands = [
  ['Organize', 'Conversation review, topic structuring, information retrieval.', 'Helps users find relevant content.'],
  ['Trace', 'Sources, process records, and traceability.', 'Helps users inspect the grounds of AI outputs.'],
  ['Evolve', 'Goals, constraints, and plans co-evolve.', 'Explains why modifications continue over time.'],
  ['Intervene', 'Intermediate edits, feedback, debugging, and control.', 'Helps users implement modifications.'],
];

const sheets = Array.from({ length: LITERATURE_CARD_COUNT }, (_, index) => {
  const texture = literatureSlot(index) % 6;
  return {
    slug: papers[texture][0],
    dark: texture === 1 || texture === 4,
    inner: index % 2 === 0,
    color: paperTints[texture],
  };
});

function LiteratureReveal({ className = '', children }) {
  return <div className={`literature-copy-mask ${className}`} data-literature-reveal>
    <div className="literature-rise">{children}</div>
  </div>;
}

function Strand({ index }) {
  const [label, description, outcome] = strands[index];
  return <article className="literature-strand" data-strand={label.toLowerCase()}>
    <LiteratureReveal>
      <h4>{label}</h4>
      <p>{description}</p>
      <p className="literature-outcome">{outcome}</p>
    </LiteratureReveal>
  </article>;
}

export function ResearchLiterature({ id, phase }) {
  const root = useRef(null);
  const orbit = useRef(null);
  useLayoutEffect(() => {
    const scene = root.current;
    const layout = scene.firstElementChild;
    const cards = [...orbit.current.children];
    const summaries = [...layout.querySelectorAll('.literature-summary')];
    const copy = [...scene.querySelectorAll('[data-literature-reveal]')].filter(node => !node.closest('.literature-summary'));
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previous;
    let held = 0;
    function write(element, property, value) {
      if (element.style.getPropertyValue(property) !== value) {
        element.style.setProperty(property, value);
      }
    }
    function update() {
      frame = 0;
      const height = window.innerHeight;
      const { top, bottom, height: sceneHeight } = scene.getBoundingClientRect();
      // Start as the map comes into view below the preceding chapter.
      const arrival = Math.max(0, height * .94 - top);
      const next = motion.matches ? 1 : viewportProgress(top, height, .94, .01);
      if (next === previous && (arrival === 0 || bottom < 0)) return;
      const layoutHeight = layout.offsetHeight;
      const exitLength = sceneHeight - layoutHeight;
      const hold = !motion.matches && exitLength > 1
        ? Math.min(exitLength, Math.max(0, height - top - layoutHeight))
        : 0;
      const correction = hold - held;
      const textProgress = copy.map(node => viewportProgress(node.getBoundingClientRect().top + correction, height, .97, .77));
      // The last row completes its reveal as it comes fully into view.
      const summaryProgress = summaries.map(summary =>
        viewportProgress(summary.getBoundingClientRect().bottom + correction, height, 1.10, .995));
      held = hold;
      write(scene, '--literature-hold', hold + 'px');
      summaries.forEach((summary, index) => write(summary, '--literature-text-progress', String(summaryProgress[index])));
      write(scene, '--literature-rewind', String(exitLength > 1 ? 1 - ease(.15, 1, hold / exitLength) : 1));
      scene.toggleAttribute('data-literature-exiting', hold > 0);
      if (next !== previous) {
        const firstCardIn = motion.matches ? 1 : ease(0, Math.min(11, height * .016), arrival);
        const turn = literatureTurn(next);
        cards.forEach((card, index) => {
          const { x, y, angle, travel, opacity } = literatureCardPose(index, next, turn);
          write(card, '--orbit-x', x + '%');
          write(card, '--orbit-y', y + '%');
          write(card, '--orbit-angle', angle + 'deg');
          write(card, '--orbit-travel', String(travel));
          write(card, '--orbit-show', String(index === 0 ? firstCardIn : opacity));
        });
        previous = next;
      }
      const titleTravel = Math.min(56, height * .082);
      const titleStep = Math.min(1, arrival / titleTravel);
      write(scene, '--literature-title-in', String(motion.matches ? 1 : 1 - (1 - titleStep) ** 2));
      copy.forEach((node, index) => write(node, '--literature-text-progress', String(textProgress[index])));
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    const resize = new ResizeObserver(queue);
    resize.observe(scene.parentElement);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    motion.addEventListener('change', queue);
    update();
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      motion.removeEventListener('change', queue);
    };
  }, []);

  return <section className="research-chapter literature-chapter" ref={root} id={id}
    data-chapter data-motion={phase} data-art-covered aria-labelledby={id + '-title'}>
    <div className="literature-layout">
      <header className="literature-hero" data-play-surface data-art-covered>
        <div className="literature-title-mask">
          <h2 id={id + '-title'} tabIndex={-1} data-title-reveal>Literature Map</h2>
        </div>
        <div className="literature-orbit" ref={orbit} aria-hidden="true">
          {sheets.map(({ slug, dark, inner, color }, index) => <span key={index} className="literature-paper"
            data-inner={inner ? '' : undefined} data-dark={dark ? '' : undefined} style={{ '--orbit-color': color }}>
            <img src={publicAsset('papers/' + slug + '.png')} alt="" decoding="async" />
          </span>)}
        </div>
      </header>

      <div className="literature-inquiry">
        <LiteratureReveal className="literature-inquiry-heading"><h3>Four lines of inquiry</h3></LiteratureReveal>
        <div className="literature-pair">
          <Strand index={0} />
          <Strand index={1} />
        </div>
        <div className="literature-network" role="img"
          aria-label="Organize, trace, intervene, and evolve surround the research question.">
          <div className="literature-core"><LiteratureReveal>The research question</LiteratureReveal></div>
          {strands.map(([label]) => <div className="literature-node" key={label}
            data-strand={label.toLowerCase()}><LiteratureReveal>{label}</LiteratureReveal></div>)}
        </div>
        <div className="literature-pair">
          <Strand index={2} />
          <Strand index={3} />
        </div>

        <aside className="literature-summary literature-synthesis">
          <Target aria-hidden="true" />
          <LiteratureReveal><h4>Synthesis</h4></LiteratureReveal>
          <LiteratureReveal><p>The four lines together provide a research foundation for task understanding and modification in long conversations.</p></LiteratureReveal>
        </aside>
        <aside className="literature-summary literature-gap">
          <Binoculars aria-hidden="true" />
          <LiteratureReveal><h4>Research Gap</h4></LiteratureReveal>
          <LiteratureReveal className="literature-gap-detail">
            <p><strong>Information → Scope → Verification</strong></p>
            <p>How to connect information relations, the scope of changes, and execution verification.</p>
          </LiteratureReveal>
        </aside>
      </div>
    </div>
  </section>;
}

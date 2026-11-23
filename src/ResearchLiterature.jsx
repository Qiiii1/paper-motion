import React, { useLayoutEffect, useRef } from 'react';
import { Target } from 'lucide-react';
import { papers } from './papers';
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

const orbitColors = ['#ff7252', '#28334e', '#e9e1ce', '#bdd1a9', '#292640', '#77b9d0'];
const sheets = Array.from({ length: LITERATURE_CARD_COUNT }, (_, index) => {
  const texture = literatureSlot(index) % 6;
  return {
    slug: papers[texture][0],
    dark: texture === 1 || texture === 4,
    inner: index % 2 === 0,
    color: orbitColors[texture],
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
    const runway = scene.previousElementSibling;
    const coverPin = runway.previousElementSibling.querySelector('.part-cover-pin');
    const layout = scene.firstElementChild;
    const cards = [...orbit.current.children];
    const synthesis = layout.querySelector('.literature-synthesis');
    const copy = [...scene.querySelectorAll('[data-literature-reveal]')].filter(node => !synthesis.contains(node));
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
      // The last pinned cover frame and the first orbit frame share a scroll position.
      const handoff = runway.getBoundingClientRect().top - coverPin.getBoundingClientRect().height;
      const arrival = Math.max(0, -handoff);
      const from = top - handoff;
      const next = motion.matches ? 1 : viewportProgress(top, height, from / height, .01);
      if (next === previous && (handoff > 0 || bottom < 0)) return;
      // Compensate for the page moving until the stationary gate is in its
      // normal reading position. The ring then leaves in the document flow.
      const lift = next > 0 && !motion.matches ? Math.min(0, -top) : 0;
      const layoutHeight = layout.offsetHeight;
      const exitLength = sceneHeight - layoutHeight;
      const hold = !motion.matches && exitLength > 1
        ? Math.min(exitLength, Math.max(0, height - top - layoutHeight))
        : 0;
      const correction = hold - held;
      const textProgress = copy.map(node => viewportProgress(node.getBoundingClientRect().top + correction, height, .97, .77));
      // The last row completes its reveal as it comes fully into view.
      const synthesisIn = viewportProgress(synthesis.getBoundingClientRect().bottom + correction, height, 1.08, .99);
      held = hold;
      write(scene, '--literature-hold', hold + 'px');
      write(synthesis, '--literature-text-progress', String(synthesisIn));
      write(scene, '--literature-rewind', String(exitLength > 1 ? 1 - hold / exitLength : 1));
      scene.toggleAttribute('data-literature-exiting', hold > 0);
      if (next !== previous) {
        const firstCardIn = motion.matches ? 1 : ease(0, Math.min(11, height * .016), arrival);
        write(scene, '--literature-progress', String(next));
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
      write(scene, '--literature-lift', lift + 'px');
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
          <h2 id={id + '-title'} tabIndex={-1}>Literature Map</h2>
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
          <LiteratureReveal><p>Together, these four lines of inquiry explain how users understand and modify tasks in long conversations.</p></LiteratureReveal>
        </aside>
      </div>
    </div>
  </section>;
}

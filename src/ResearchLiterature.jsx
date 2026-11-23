import React, { useLayoutEffect, useRef } from 'react';
import { Binoculars, Target } from 'lucide-react';
import { papers } from './papers';
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

export function ResearchLiterature({ id, phase, children }) {
  const root = useRef(null);
  const orbit = useRef(null);
  useLayoutEffect(() => {
    const scene = root.current;
    const cards = [...orbit.current.children];
    const copy = [...scene.querySelectorAll('[data-literature-reveal]')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let previous;
    function write(element, property, value) {
      if (element.style.getPropertyValue(property) !== value) {
        element.style.setProperty(property, value);
      }
    }
    function update() {
      frame = 0;
      const height = window.innerHeight;
      const { top, bottom } = scene.getBoundingClientRect();
      const next = motion.matches ? 1 : viewportProgress(top, height, .97, .01);
      if (next === previous && (top > height || bottom < 0)) return;
      // Compensate for the page moving until the stationary gate is in its
      // normal reading position. The ring then leaves in the document flow.
      const lift = next > 0 && !motion.matches ? Math.min(0, -top) : 0;
      const textProgress = copy.map(node => viewportProgress(node.getBoundingClientRect().top, height, .97, .71));
      if (next !== previous) {
        write(scene, '--literature-progress', String(next));
        const turn = literatureTurn(next);
        cards.forEach((card, index) => {
          const { x, y, angle, travel, opacity } = literatureCardPose(index, next, turn);
          write(card, '--orbit-x', x + '%');
          write(card, '--orbit-y', y + '%');
          write(card, '--orbit-angle', angle + 'deg');
          write(card, '--orbit-travel', String(travel));
          write(card, '--orbit-show', String(opacity));
        });
        previous = next;
      }
      write(scene, '--literature-lift', lift + 'px');
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
        <aside className="literature-summary literature-gap">
          <Binoculars aria-hidden="true" />
          <LiteratureReveal><h4>Research Gap</h4></LiteratureReveal>
          <LiteratureReveal>
            <strong>Information → Scope → Verification</strong>
            <p>How can users connect information relationships, the scope of changes, and verification of what actually changed?</p>
          </LiteratureReveal>
        </aside>
        <details className="literature-details">
          <summary>Literature review details</summary>
          <LiteratureReveal className="chapter-copy">{children}</LiteratureReveal>
        </details>
      </div>
    </div>
  </section>;
}

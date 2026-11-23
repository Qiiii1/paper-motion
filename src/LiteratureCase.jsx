import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, CircleHelp, Layers3, Search, Sparkles, Target } from 'lucide-react';
import { publicAsset } from './publicAsset';
import { viewportProgress } from './scrollProgress';

const articles = [
  { name: 'Sensecape', file: 'sensecape-paper', size: [638, 747], hook: <>From chat to<br />spatial knowledge</>, intro: 'Sensecape turns LLM conversation output into movable information objects and supports organization across levels.' },
  { name: 'Provenance', file: 'node-flow-paper', size: [605, 744], hook: <>Trace the work<br />behind the output</> },
  { name: 'Interactive Debugging', file: 'ai-chains-paper', size: [737, 744], hook: <>Edit the middle.<br />Test the effect.</> },
];

const stripCount = 24;
const stripPositions = Array.from({ length: stripCount }, (_, i) => ({
  '--strip-index': i,
  '--strip-position': (i + .5) / stripCount - .5,
}));

const wallTiles = [
  [-1, -1, 'papers/identity'], [0, -1, 'papers/trust'], [1, -1, 'papers/reflection'],
  [-1, 0, 'papers/decisions'], [1, 0, 'literature/node-flow-paper'],
  [-1, 1, 'papers/convergence'], [0, 1, 'literature/ai-chains-paper'], [1, 1, 'papers/team'],
];

function asset(file) {
  return publicAsset('literature/' + file + '.png');
}

function ease(value, start, end) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

function Rise({ children, className = '' }) {
  return <div className={'case-mask ' + className} data-case-reveal>
    <div className="case-rise">{children}</div>
  </div>;
}

function ReelSheet({ article, current }) {
  const [width, height] = article.size;
  const source = asset(article.file);
  return <span className="case-sheet" data-current={current ? '' : undefined}
    style={{ '--strip-count': stripCount, '--paper-image': 'url("' + source + '")' }}>
    <img className="case-page" src={source} width={width} height={height} alt="" decoding="async" />
    <span className="case-strips">
      {stripPositions.map((style, index) => <span className="case-strip" key={index} style={style} />)}
    </span>
  </span>;
}

function CaseArt({ index, titleId }) {
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const { name, hook, intro } = articles[index];
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    const sheets = [...canvas.querySelectorAll('.case-sheet')];
    const tiles = [...canvas.querySelectorAll('.case-tile')];
    const pin = scene.firstElementChild;
    const heading = pin.firstElementChild;
    const body = scene.nextElementSibling;
    const masks = [...body.querySelectorAll('[data-case-reveal]')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    function update() {
      frame = 0;
      const { top, height } = scene.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (top >= viewport || top + height + body.offsetHeight <= 0) return;

      const span = height - pin.offsetHeight;
      const progress = motion.matches || span <= 0 ? 1 : Math.max(0, Math.min(1, -top / span));
      const focus = index === 0 ? ease(progress, .07, .72) : 1;
      const rotation = index === 0
        ? -.64 * (1 - ease(progress, .41, .8))
        : index - 1 + ease(progress, .07, .72);
      const text = ease(progress, .73, .98);
      const distanceToFront = Math.abs(rotation - Math.round(rotation));
      const pitchStep = 1.18 + .04 * (1 - ease(distanceToFront, .025, .30));
      const wall = 1 - focus;
      if (index === 0) {
        canvas.style.setProperty('--case-wall-bleed', (heading.offsetTop + heading.offsetHeight + 12) * wall + 'px');
      }
      const { width, height: artHeight } = canvas.getBoundingClientRect();
      const faceWidth = Math.min(width * .76, artHeight * .66, 430);
      const faceHeight = faceWidth * 1.18;
      const radius = faceHeight * .94;
      const gridWidth = Math.min(width * .72, artHeight * .66, 500);
      const gridHeight = gridWidth * articles[0].size[1] / articles[0].size[0];
      const panX = Math.min(width * .095, gridWidth * .18) * wall;
      const panY = -gridHeight * .055 * wall;

      scene.style.setProperty('--case-heading', ease(progress, index === 0 ? .64 : .55, .87));
      scene.style.setProperty('--case-hook', text);
      scene.style.setProperty('--case-intro', ease(progress, .82, 1));
      canvas.style.setProperty('--case-focus', focus);

      tiles.forEach((tile, slot) => {
        const [column, row] = wallTiles[slot];
        const spread = 1 + focus * .58;
        tile.style.width = gridWidth + 'px';
        tile.style.height = gridHeight + 'px';
        tile.style.opacity = String(wall);
        tile.style.transform = `translate3d(${panX + column * (gridWidth + 9) * spread}px, ${panY + row * (gridHeight + 9) * spread}px, 0)`;
      });

      sheets.forEach((sheet, slot) => {
        const distance = slot - rotation;
        const theta = distance * pitchStep;
        const featured = index === 0 && slot === 0;
        const roll = featured ? ease(focus, .1, .83) : 1;
        // Keep both sheets square to the viewer as they exchange the foremost slot.
        const curl = featured || motion.matches ? 0 : ease(Math.abs(distance), .5, .96);
        const pitch = theta * roll * curl;
        const y = Math.sin(theta) * radius * roll + (featured ? panY : 0);
        const z = (Math.cos(theta) - 1) * radius * roll;
        const grid = featured ? wall : 0;
        const zoom = featured ? 1 + .12 * Math.sin(Math.PI * ease(focus, 0, .83)) : 1;
        const [imageWidth, imageHeight] = articles[slot].size;
        const aspect = imageWidth / imageHeight;
        const availableWidth = faceWidth + (gridWidth - faceWidth) * grid;
        const availableHeight = faceHeight + (gridHeight - faceHeight) * grid;
        const sheetWidth = Math.min(availableWidth, availableHeight * aspect) * zoom;
        const sheetHeight = sheetWidth / aspect;
        const bendAngle = curl * sheetHeight / radius;
        const bendRadius = curl > 0 ? radius / curl : 0;
        const visibility = featured ? 1
          : motion.matches ? Number(slot === index)
          : (1 - ease(Math.abs(distance), 1.05, 1.55)) * ease(focus, .83, 1);
        sheet.style.width = sheetWidth + 'px';
        sheet.style.height = sheetHeight + 'px';
        sheet.style.transform = `translate3d(${featured ? panX : 0}px, ${y}px, ${z}px) rotateX(${-pitch}rad)`;
        sheet.toggleAttribute('data-flat', curl === 0);
        sheet.style.setProperty('--sheet-pitch', pitch + 'rad');
        sheet.style.setProperty('--sheet-bend', bendAngle + 'rad');
        sheet.style.setProperty('--sheet-radius', bendRadius + 'px');
        sheet.style.setProperty('--strip-height', 2 * Math.sin(bendAngle / (2 * stripCount)) * bendRadius + 'px');
        sheet.style.setProperty('--sheet-visible', visibility);
      });

      masks.forEach(mask => {
        const reveal = motion.matches ? 1 : viewportProgress(mask.getBoundingClientRect().top, viewport, .98, .77);
        mask.style.setProperty('--case-reveal', reveal);
      });
    }

    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(queue);
    resize.observe(scene);
    resize.observe(canvas);
    resize.observe(body);
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
  }, [index]);

  return <div className="case-runway" ref={sceneRef} data-first={index === 0 ? '' : undefined}>
    <div className="case-pin" data-play-surface data-art-covered>
      <header className="case-mask">
        <h2 className="case-rise case-title" id={titleId} tabIndex={-1}>
          <span>0{index + 1} - </span>{name}
        </h2>
      </header>
      <div className="case-art" ref={canvasRef} aria-hidden="true">
        {index === 0 && wallTiles.map(([, , file]) => <span className="case-tile" key={file}>
          <img src={publicAsset(file + '.png')} alt="" decoding="async" />
        </span>)}
        {articles.map((article, slot) => <ReelSheet key={article.file} article={article} current={index === slot} />)}
      </div>
      <div className="case-hero-copy">
        <div className="case-mask"><h3 className="case-rise case-hook">{hook}</h3></div>
        <div className="case-mask case-mark"><span className="case-rise" /></div>
        {intro && <div className="case-mask"><p className="case-rise case-intro">{intro}</p></div>}
      </div>
    </div>
    <span className="case-arrival" data-scene-arrival aria-hidden="true" />
  </div>;
}

const figureSizes = {
  'sensecape-interface': [350, 110],
  'node-flow-interface': [350, 230],
  'provenance-types': [158, 121],
  'provenance-analysis': [158, 121],
  'ai-chains-interface': [350, 180],
  'agdebugger-interface': [350, 209],
};

function Figure({ file, alt, children }) {
  const [width, height] = figureSizes[file];
  return <figure className="case-figure">
    <img src={asset(file)} alt={alt} width={width} height={height} decoding="async" />
    {children && <figcaption>{children}</figcaption>}
  </figure>;
}

function Section({ title, children }) {
  return <section className="case-section">
    <Rise><h4>{title}</h4></Rise>
    <Rise>{children}</Rise>
  </section>;
}

function Callout({ icon: Icon, tone, title, children }) {
  return <div className="case-callout" data-tone={tone}>
    <Icon aria-hidden="true" />
    <strong>{title}</strong>
    <div>{children}</div>
  </div>;
}

function Sensecape() {
  return <>
    <Rise><ol className="case-flow" aria-label="Chat to canvas to hierarchy">
      {['Chat', 'Canvas', 'Hierarchy'].map((word, index) => <li key={word}>
        {index > 0 && <ArrowRight aria-hidden="true" />}{word}
      </li>)}
    </ol></Rise>
    <Section title="Key Idea">
      <div className="case-key"><Layers3 aria-hidden="true" /><ul>
        <li>Move from linear chat to spatial information objects.</li>
        <li>Explore and group topics, and switch between levels.</li>
        <li>Revisit and organize complex information.</li>
      </ul></div>
    </Section>
    <Section title="Actual Sensecape Interface">
      <Figure file="sensecape-interface" alt="Sensecape showing a spatial canvas on the left and a hierarchy view on the right." />
    </Section>
    <Section title="How the space is built">
      <div className="case-branch">
        <strong>Moving to<br />San Francisco</strong>
        <ul>{['Cost of living', 'Location', 'Transportation'].map(label => <li key={label}>{label}</li>)}</ul>
      </div>
    </Section>
    <div className="case-pair">
      <Section title="Key Interactions">
        <ol className="case-interactions">
          {[
            ['Expand', 'Explore related information.'],
            ['Capture', 'Save content as movable objects.'],
            ['Dive', 'Inspect a topic at a deeper level.'],
            ['Overview', 'See the whole information space.'],
          ].map(([label, description], i) => <li key={label}>
            <span>0{i + 1}</span><strong>{label}</strong><small>{description}</small>
          </li>)}
        </ol>
      </Section>
      <Section title="Study Evidence">
        <div className="case-stat"><strong>12</strong><span>participants</span></div>
        <div className="case-stat"><strong>10 / 12</strong><span>used the hierarchy view</span></div>
      </Section>
    </div>
    <Rise><Callout icon={Sparkles} tone="peach" title="Research Implication">Make information movable so users have a way to inspect the task.</Callout></Rise>
    <Rise><Callout icon={Target} tone="navy" title="Evidence Boundary">Two items can share a topic without depending on one another during execution.</Callout></Rise>
    <Rise><p className="case-note"><a href="#ref-05">[5]</a> Suh et al., UIST 2023. Sensecape: Enabling Multilevel Exploration and Sensemaking with Large Language Models.</p></Rise>
  </>;
}

function Provenance() {
  return <>
    <Section title="Core Idea / Node Flow [3]">
      <p className="case-statement">Record the prompt,<br />the operation,<br />and the output.</p>
    </Section>
    <Rise>
      <Figure file="node-flow-interface" alt="Node Flow canvas with linked image outputs and a workflow editor open on the right.">
        Yu et al. (2024), Figure 7. Workflow UI after backtracking. The right panel edits the workflow. <a href="#ref-03">[3]</a>
      </Figure>
    </Rise>
    <Section title="Research Implication">
      <div className="case-pair case-tiles">
        <div><Layers3 aria-hidden="true" /><strong>Process Record</strong><p>Keep prompts, operations, and intermediate actions visible.</p></div>
        <div><Search aria-hidden="true" /><strong>Later Inspection</strong><p>Show how outputs were generated so users can check later changes.</p></div>
      </div>
    </Section>
    <Section title="Original Research Figures">
      <div className="case-pair case-source-figures">
        <Figure file="provenance-types" alt="Table of provenance information types, including data, visualization, interaction, insight, and rationale." />
        <Figure file="provenance-analysis" alt="Diagram showing what visual analytics provenance records and how it is analyzed." />
      </div>
      <Callout icon={CircleHelp} tone="peach" title="Still Unresolved">
        Is an earlier condition still valid?<br />Which later outputs depend on it?<br />How can the user verify the change?
      </Callout>
    </Section>
    <Rise><p className="case-note"><a href="#ref-03">[3]</a> Yu et al., DRS 2024, Fig. 7. · <a href="#ref-09">[9]</a> Ragan et al., TVCG 2016, Table 1 excerpt. · <a href="#ref-10">[10]</a> Xu et al., CGF 2020, Fig. 1. The research implication is this study’s interpretation.</p></Rise>
  </>;
}

function Debugging() {
  return <>
    <Section title="Inspect → Edit → Rerun">
      <p>See the step. Change the step. Check the result.</p>
      <Figure file="ai-chains-interface" alt="AI Chains compares an unchained prompt with editable intermediate steps in a prompt chain.">
        AI Chains · Fig. 1 <a href="#ref-06">[6]</a>
      </Figure>
      <p>Editable prompt steps make the chain inspectable.</p>
    </Section>
    <Section title="AGDebugger · Reset and Test [7]">
      <Figure file="agdebugger-interface" alt="AGDebugger compares execution traces before and after resetting an earlier message.">
        Reset an earlier message, then compare outcomes.
      </Figure>
    </Section>
    <Section title="The Intervention Loop">
      <div className="case-loop" role="img" aria-label="Control the task by showing, locating, editing, and rerunning a step.">
        <strong>Control<br />the task</strong>
        {['Show', 'Locate', 'Edit', 'Rerun'].map(label => <span key={label}>{label}</span>)}
      </div>
    </Section>
    <Rise><p className="case-statement case-closing">Control the process.<br />Check the outcome.</p></Rise>
    <Section title="Still to Test">
      <div className="case-pair case-tests"><strong>Right scope?</strong><strong>Real effect?</strong></div>
    </Section>
    <Rise><p className="case-note"><a href="#ref-06">[6]</a> AI Chains · <a href="#ref-07">[7]</a> AGDebugger. Compare the updated output with the intended change to verify the fix.</p></Rise>
  </>;
}

const caseBodies = [Sensecape, Provenance, Debugging];

export function LiteratureCase({ id, index, children }) {
  const Body = caseBodies[index];
  return <section className="research-chapter literature-case" id={id} data-chapter data-art-covered aria-labelledby={id + '-title'}>
    <CaseArt index={index} titleId={id + '-title'} />
    <div className="case-body">
      <Body />
      {children}
    </div>
  </section>;
}

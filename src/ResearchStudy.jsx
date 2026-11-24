import React, { useLayoutEffect, useRef } from 'react';
import { ease } from './choreography';
import { publicAsset } from './publicAsset';
import { viewportProgress } from './scrollProgress';
import './researchStudy.css';

function StudyReveal({ children, className = '' }) {
  return <div className={'study-mask ' + className} data-study-reveal>
    <div className="study-rise">{children}</div>
  </div>;
}

function StudyChapter({ scene, id, title, children }) {
  const plate = useRef(null);

  useLayoutEffect(() => {
    const node = plate.current;
    const groups = [...node.querySelectorAll('[data-study-reveal]')];
    const previous = groups.map(() => 1);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function update() {
      frame = 0;
      const height = window.innerHeight;
      const { top, bottom } = node.getBoundingClientRect();
      const finish = viewportProgress(bottom, height, 1.10, 1.002);
      const complete = motion.matches || finish === 1 ? 1 : top >= height ? 0 : null;
      const values = groups.map(group => complete ?? ease(0, 1,
        Math.max(finish, viewportProgress(group.getBoundingClientRect().top, height, .99, .82))));
      values.forEach((value, index) => {
        if (previous[index] !== value) groups[index].style.setProperty('--study-reveal', value);
        previous[index] = value;
      });
    }

    const resize = new ResizeObserver(queue);
    resize.observe(node);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    motion.addEventListener('change', queue);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      motion.removeEventListener('change', queue);
    };
  }, []);

  return <section ref={scene} id={id} className="study-chapter" data-chapter data-art-covered aria-labelledby={id + '-title'}>
    <div ref={plate} className="study-plate">
      <div className="study-copy">
        <StudyReveal className="study-page-title"><h2 id={id + '-title'} tabIndex={-1}>{title}</h2></StudyReveal>
        {children}
      </div>
    </div>
  </section>;
}

const setting = [
  { tone: 'coral', label: <>Linked<br />steps</> },
  { tone: 'green', label: <>Saved<br />intermediate<br />outputs</> },
  { tone: 'yellow', label: <>Changing goals<br />or constraints</> },
  { tone: 'blue', label: <>Result<br />checks</> },
];

const methods = [
  {
    tone: 'yellow', title: 'Interviews & task walkthroughs', caption: 'Find user difficulties',
    label: 'One real revision', detail: 'Use chat and drafts to trace what changed and how it was checked.',
  },
  {
    tone: 'blue', title: 'Co-design & prototype iteration', caption: 'Build a prototype',
    label: 'Prototype exercise', detail: 'Sketch where to see affected steps and changes to outputs.',
  },
  {
    tone: 'coral', title: 'Controlled comparisons', caption: 'Test UI formats',
    label: 'Four trials per person', detail: 'One task per interface in each comparison. Rotate order and cases.',
  },
];

function SettingDiagram() {
  return <div className="study-setting-diagram">
    <svg viewBox="0 0 342 286" preserveAspectRatio="none" aria-hidden="true">
      <path d="M53 65 Q158 5 264 61 T306 209 Q218 285 74 225 Q12 183 53 65Z" fill="none" stroke="#ebe2d8" strokeWidth="7" />
      <path d="M54 64 173 142" stroke="#fabcae" strokeWidth="18" />
      <path d="M270 59 173 142" stroke="#dce8d2" strokeWidth="21" />
      <path d="M63 231 173 142" stroke="#fae4ac" strokeWidth="18" />
      <path d="M288 219 173 142" stroke="#d7edf0" strokeWidth="21" />
    </svg>
    <strong className="study-setting-center">Desktop<br />AI-assisted<br />design tasks</strong>
    {setting.map(({ tone, label }) => <span key={tone} className={'study-setting-node study-' + tone}>{label}</span>)}
  </div>;
}

function MethodsDiagram() {
  return <div className="study-methods">
    <svg className="study-method-track" viewBox="0 0 342 390" preserveAspectRatio="none" aria-hidden="true">
      <path d="M204 107c-20 24-52 14-59 33l-16 12m-1 81c36 29 45 18 70 37" fill="none" stroke="#81938b" strokeWidth="1.4" />
      <path d="m127 152 8 3-2-8zm75 120-5-8-4 6z" fill="#81938b" />
    </svg>
    {methods.map(({ tone, title, caption, label, detail }) => <div key={title} className="study-method-row">
      <StudyReveal className="study-method-note">
        <h4>{label}</h4><p>{detail}</p>
      </StudyReveal>
      <StudyReveal className="study-method-disc-slot">
        <div className={'study-method-disc study-' + tone}><strong>{title}</strong><span>{caption}</span></div>
      </StudyReveal>
    </div>)}
  </div>;
}

export function ResearchDesign({ scene }) {
  return <StudyChapter scene={scene} id="research-design" title="Research Design">
    <section className="study-section">
      <StudyReveal><h3>Participants</h3></StudyReveal>
      <StudyReveal className="study-participant-intro">
        <p>We plan to recruit <strong>generative AI users</strong> with experience revising requirements, preserving outputs, and checking results in design projects.</p>
      </StudyReveal>
      <StudyReveal>
        <div className="study-participant-pair">
          <strong>Design<br />students</strong>
          <strong>Design<br />professionals</strong>
        </div>
        <p className="study-participant-skills">Revise requirements · Preserve outputs · Check results</p>
      </StudyReveal>
    </section>
    <section className="study-section">
      <StudyReveal><h3>Setting</h3></StudyReveal>
      <StudyReveal><SettingDiagram /></StudyReveal>
      <StudyReveal className="study-example-tasks">
        <h4>Example tasks</h4>
        <p>Organize research materials, compare concepts, and revise design reports.</p>
      </StudyReveal>
    </section>
    <section className="study-section">
      <StudyReveal><h3>Methods</h3></StudyReveal>
      <MethodsDiagram />
    </section>
    <section className="study-section study-fieldwork">
      <StudyReveal><h3>Formative fieldwork</h3></StudyReveal>
      <StudyReveal>
        <h4>Contextual inquiry</h4>
        <p>Observe an active AI-assisted design task. Ask what changed, what should stay, and how the designer checks the result.</p>
      </StudyReveal>
      <StudyReveal>
        <h4>Artifact-based interview</h4>
        <p>Replay a real revision using chat and draft versions. Code what prompted the change, what informed the decision, and how the result was verified.</p>
      </StudyReveal>
    </section>
    <StudyReveal className="study-note">
      <p>Formative research will determine the final tasks and materials. Sample size will depend on the study aims, pilot results, and analysis needs.</p>
    </StudyReveal>
  </StudyChapter>;
}

const steps = [
  ['Review real tasks', 'Interviews and task walkthroughs', 'review-tasks'],
  ['Map issues and needs', 'Code judgments, actions, and verification strategies', 'map-issues'],
  ['Design the interaction', 'Co-design and refine a testable prototype', 'design-interaction'],
  ['Compare interfaces', 'Test scope judgment and result verification', 'compare-interfaces'],
];

function ProcessRoute() {
  return <div className="study-process">
    <svg className="study-process-track" viewBox="0 0 342 505" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="study-route-color" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f1cb6c" /><stop offset="1" stopColor="#ff765a" />
        </linearGradient>
      </defs>
      <path d="M254 55C369 76 300 142 214 120S54 143 62 205 270 253 289 314 74 367 73 411 106 483 122 493"
        fill="none" stroke="url(#study-route-color)" strokeWidth="5" strokeLinecap="round" strokeDasharray="16 12" />
    </svg>
    <ol>
      {steps.map(([title, description, image], index) => <li key={image}>
        <StudyReveal className="study-step-copy">
          <span className="study-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <h3>{title}</h3><p>{description}</p>
        </StudyReveal>
        <StudyReveal className="study-step-media">
          <img src={publicAsset('study/' + image + '.png')} width="80" height="80" alt="" />
        </StudyReveal>
      </li>)}
    </ol>
  </div>;
}

const comparisons = [
  {
    timing: 'Before execution', title: 'Judge edit scope', left: <>Linear<br />task list</>, right: <>Dependency<br />graph</>,
    same: <>Same<br />information</>, controls: 'Same task and relationship information, editing and preview features.',
    goal: <>Find the <strong>direct edit target</strong>, <strong>affected steps</strong>, and <strong>outputs to keep</strong>.</>,
    measures: 'Accuracy · Omissions · Wrong selections · Time · Workload',
  },
  {
    timing: 'After execution', title: 'Verify actual changes', left: <>Standard<br />version view</>, right: <>Linked change<br />markers</>,
    same: <>Same<br />records</>, controls: 'Same versions and action logs.',
    goal: <>Find <strong>missed edits</strong>, <strong>out-of-scope changes</strong>, and <strong>unnecessary reruns</strong>.</>,
    measures: <>Detection rate · False alarms · Time to locate<br />Verification accuracy · Correction success · Workload</>,
  },
];

function Comparison({ comparison, later }) {
  const { timing, title, left, right, same, controls, goal, measures } = comparison;
  return <section className={'study-trial' + (later ? ' study-trial-after' : '')}>
    <StudyReveal><p className="study-trial-timing">{timing}</p><h4>{title}</h4></StudyReveal>
    <StudyReveal>
      <div className="study-trial-diagram">
        <svg viewBox="0 0 342 96" preserveAspectRatio="none" aria-hidden="true">
          <ellipse className="study-trial-outline" cx="170" cy="49" rx="144" ry="38" transform="rotate(-7 170 49)" />
          <ellipse className="study-trial-left" cx="85" cy="50" rx="67" ry="33" transform="rotate(8 85 50)" />
          <ellipse className="study-trial-right" cx="252" cy="48" rx="68" ry="32" transform="rotate(-12 252 48)" />
          <ellipse className="study-trial-dots" cx="171" cy="48" rx="150" ry="33" transform="rotate(8 171 48)" />
          <path d="M88 31q36-15 83 6 44-22 80-8" className="study-trial-connector" />
          <circle cx="88" cy="31" r="4" /><circle cx="171" cy="37" r="6" /><circle cx="251" cy="29" r="4" />
          <circle cx="171" cy="37" r="2" className="study-trial-center-dot" />
        </svg>
        <div className="study-trial-labels"><strong>{left}</strong><span>{same}</span><strong>{right}</strong></div>
      </div>
    </StudyReveal>
    <StudyReveal className="study-trial-notes">
      <dl><dt>Controls</dt><dd>{controls}</dd><dt>Goal</dt><dd>{goal}</dd></dl>
      <p>{measures}</p>
    </StudyReveal>
  </section>;
}

export function ResearchProcess({ scene }) {
  return <StudyChapter scene={scene} id="research-process" title="Research Process">
    <ProcessRoute />
    <section className="study-process-comparisons">
      <StudyReveal><h3>Two controlled comparisons</h3></StudyReveal>
      <StudyReveal className="study-experiment">
        <h4>Counterbalanced within-participant study</h4>
        <p>Each participant completes four trials across two comparisons. Use matched tasks and rotate interface order and task assignment across participants.</p>
        <p>Score against a preset answer key. Use fixed output versions and action logs in the verification trials.</p>
      </StudyReveal>
      {comparisons.map((comparison, index) => <Comparison key={comparison.timing} comparison={comparison} later={index === 1} />)}
    </section>
    <StudyReveal className="study-note">
      <p>Pilot-test task difficulty, balance condition order,<br className="study-mobile-break" /> and anonymize study materials.</p>
    </StudyReveal>
  </StudyChapter>;
}

import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, UserRound } from 'lucide-react';
import { chapterId } from './research';
import { viewportProgress } from './scrollProgress';
import { publicAsset } from './publicAsset';

const questions = [
  ['Which rule changed?', 'sand'],
  ['Which modules use it?', 'mint'],
  ['Which outputs change or stay?', 'coral'],
  ['What only needs checking?', 'green'],
];
const flow = [
  ['See links', 'sand'],
  ['Choose scope', 'mint'],
  ['Preview change', 'coral'],
  ['Continue with AI', 'green'],
  ['Compare results', 'sand'],
];
const fanPapers = [
  ['identity', 'navy'],
  ['convergence', 'coral'],
  ['decisions', 'green'],
  ['reflection', 'blue'],
];
const changes = [
  ['Direct edit', 'Remove sign-up reward logic.', 'coral'],
  ['Downstream', 'Update ledger, copy and tests.', 'blue'],
  ['Preserve', 'Keep invite codes, referral links and catalog.', 'green'],
  ['Check only', 'Verify first-payment trigger & duplicates.', 'navy'],
];
const verification = [
  'Was any required update missed?',
  'Was anything outside scope changed?',
  'Was any unnecessary rerun executed?',
  'Do the updated outputs satisfy the new condition?',
];
const failures = [
  ['Missed', 'Page copy changes, but sign-up still pays.', 'sand'],
  ['Overreach', 'Removing the sign-up reward also removes the first-payment reward.', 'mint'],
  ['Rerun', 'Invite codes or links are regenerated.', 'green'],
];

function Document({ tone }) {
  return <span className="example-document" data-tone={tone}><i /><i /><i /><i /></span>;
}

function Storefront() {
  return <div className="example-shop" role="img" aria-label="Shopping Mart storefront and customer">
    <Document tone="blue" />
    <Document tone="coral" />
    <div className="example-store" aria-hidden="true">
      <span>Shopping Mart</span>
      <div><i /><i /><i /><i /></div>
    </div>
    <UserRound className="example-customer" aria-hidden="true" />
  </div>;
}

function ExampleSection({ id, title, className, children }) {
  return <section id={id} className={`example-section ${className ?? ''}`} data-chapter={id ? '' : undefined} data-example-reveal>
    <div className="example-mask"><h3 className="example-rise" id={id ? id + '-title' : undefined}>{title}</h3></div>
    <div className="example-mask example-body-mask">
      <div className="example-rise example-section-copy">{children}</div>
    </div>
  </section>;
}

export function ResearchExample({ id, phase, children }) {
  const chapter = useRef(null);
  const hero = useRef(null);

  useLayoutEffect(() => {
    const scene = chapter.current;
    const layout = scene.firstElementChild;
    const header = hero.current;
    const groups = [...scene.querySelectorAll('[data-example-reveal]')];
    const progress = new Map();
    let frame = 0;
    let held = 0;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    function setProgress(element, value) {
      if (progress.get(element) !== value) {
        element.style.setProperty('--example-progress', value);
        progress.set(element, value);
      }
    }
    function update() {
      frame = 0;
      const height = window.innerHeight;
      const { top, bottom, height: sceneHeight } = scene.getBoundingClientRect();
      if (top > height || bottom < 0) return;
      const layoutHeight = layout.getBoundingClientRect().height;
      const exitSpan = sceneHeight - layoutHeight;
      const hold = motion.matches ? 0 : Math.max(0, Math.min(exitSpan, height - top - layoutHeight));
      const remaining = exitSpan > 0 ? 1 - hold / exitSpan : 1;
      const correction = hold - held;
      // Pin the masks while their local entrance progress runs back to zero.
      const entry = viewportProgress(header.getBoundingClientRect().top + correction, height, .78, .16);
      const groupProgress = groups.map(group => Math.min(entry, viewportProgress(group.getBoundingClientRect().top + correction, height, 1.01, .79)));
      if (hold !== held) {
        scene.style.setProperty('--example-hold', hold + 'px');
        scene.style.setProperty('--example-rewind', remaining);
        scene.toggleAttribute('data-example-exiting', hold > 0);
        held = hold;
      }
      setProgress(header, entry);
      groups.forEach((group, index) => setProgress(group, groupProgress[index]));
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

  return <section id={id} className="research-chapter example-chapter" ref={chapter} data-chapter data-motion={phase}
    data-art-covered data-play-surface aria-labelledby={id + '-title'}>
    <div className="example-layout">
      <header className="example-header" ref={hero}>
        <div className="example-mask">
          <h2 className="example-rise" id={id + '-title'} tabIndex={-1}>For Example</h2>
        </div>
        <div className="example-fan" aria-hidden="true">
          {fanPapers.map(([slug, tone]) => <span className="example-paper" key={slug} data-tone={tone}>
            <img src={publicAsset('papers/' + slug + '.png')} alt="" decoding="async" />
          </span>)}
        </div>
        <div className="example-mask example-deck">
          <p className="example-rise">One Rule.<br />Many<br className="example-mobile-break" /> Effects.</p>
        </div>
        <div className="example-mask example-intro">
          <p className="example-rise">A single rule change in an AI-assisted e-commerce task spreads across modules, outputs, scope decisions and result verification.</p>
        </div>
      </header>

      <div className="example-story">
        <ExampleSection title="User Scenario" className="example-scenario">
          <div className="example-scenario-grid">
            <Storefront />
            <div className="example-scenario-copy">
              <blockquote>
                Cancel the sign-up reward, and only issue a reward after the first successful payment.
              </blockquote>
              <p>One request affects many modules. “Done” does not prove every change was correct.</p>
            </div>
          </div>
        </ExampleSection>

        <ExampleSection title="Questions for the User">
          <ul className="example-notes example-questions">
            {questions.map(([label, tone]) => <li key={label} data-tone={tone}>{label}</li>)}
          </ul>
        </ExampleSection>

        <ExampleSection title="Visualization Flow" className="example-workflow">
          <p>From locating affected content to checking the result.</p>
          <ol className="example-notes example-steps">
            {flow.map(([label, tone], i) => <li key={label} data-tone={tone}>
              <span>{label}</span>
              {i < flow.length - 1 && <ArrowRight aria-hidden="true" />}
            </li>)}
          </ol>
        </ExampleSection>

        <ExampleSection title="Research Focus" className="example-takeaway">
          <p>Judge the impact before the edit.<br />Verify the result after.</p>
          <p>Help users estimate scope before modification and inspect the actual result afterward.</p>
        </ExampleSection>
      </div>

      <div id={chapterId(7)} className="example-followup">
        <ExampleSection id={chapterId(8)} title="Defining the Modification Scope">
          <div className="example-scope-grid">
            <div className="example-scope-fan" aria-hidden="true">
              {['navy', 'coral', 'blue', 'green'].map(tone => <Document key={tone} tone={tone} />)}
            </div>
            <dl className="example-scope-list">
              {changes.map(([label, text, tone]) => <div key={label} data-tone={tone}>
                <dt>{label}</dt><dd>{text}</dd>
              </div>)}
            </dl>
          </div>
          <aside className="example-scope-risks">
            <strong>Two risks: under-change and over-change.</strong>
            <ul>
              <li>Old conditions still affect later outputs.</li>
              <li>Unrelated content changes and valid work is overwritten.</li>
            </ul>
          </aside>
          <p className="example-scope-terms">Local modification · Impact scope · Output preservation</p>
        </ExampleSection>

        <ExampleSection id={chapterId(9)} title="Result Verification" className="example-verification">
          <p>“Modified” does not guarantee that the change was implemented correctly.</p>
          <ol className="example-verification-chain">
            {[
              ['What the user wanted', 'sand'],
              ['What the system actually changed', 'mint'],
              ['Do they match?', 'coral'],
            ].map(([label, tone], index) => <li key={label} data-tone={tone}>
              <span>{label}</span>
              {index < 2 && <ArrowRight aria-hidden="true" />}
            </li>)}
          </ol>
          <ul className="example-checklist">
            {verification.map(question => <li key={question}>{question}</li>)}
          </ul>
        </ExampleSection>

        <ExampleSection title="Three Failure Cases">
          <ul className="example-failures">
            {failures.map(([title, text, tone]) => <li key={title} data-tone={tone}>
              <h4>{title}</h4><p>{text}</p>
            </li>)}
          </ul>
        </ExampleSection>

        <ExampleSection title="Research Gap" className="example-gap">
          <p>Users may still struggle to judge whether a modification truly took effect after editing. <a className="citation" href="#ref-07">[7]</a></p>
          <p>Shopping Mart and its original reward mechanism come from Web-Bench <a className="citation" href="#ref-16">[16]</a>. The rule change and failure cases are illustrative examples. Web-Bench does not report these outcomes or study real users’ long AI conversations.</p>
        </ExampleSection>
      </div>

      <div className="example-mask" data-example-reveal>
        <details className="example-details example-rise">
          <summary>Scenario and research details</summary>
          <div className="chapter-copy">{children}</div>
        </details>
      </div>
    </div>
  </section>;
}

import React from 'react';
import { FileText, Layers3, Network, SlidersHorizontal, Target } from 'lucide-react';
import { useScrollScene } from './scrollScene';

const elements = [
  ['goals', Target],
  ['constraints', SlidersHorizontal],
  ['materials', FileText],
  ['plan', Network],
  ['outputs', Layers3],
];

const english = [
  ['Goals', 'What the current task aims to achieve.'],
  ['Constraints', 'What conditions must be satisfied.'],
  ['Materials', 'Which inputs and evidence are used.'],
  ['Plan', 'Which steps are planned to complete the task.'],
  ['Outputs', 'Intermediate or final products already produced.'],
];

export function ResearchScope({ id, phase, lang, title, blocks }) {
  const { root, progress, top, near } = useScrollScene();
  const isEnglish = lang === 'en';
  const [intro, table, boundary] = blocks;
  const labels = isEnglish ? english : table.rows.slice(1);
  const active = progress < .055
    ? -1
    : Math.min(elements.length - 1, Math.floor((progress - .055) / .83 * elements.length));
  const ready = near && top <= window.innerHeight * .045;

  return <section id={id} className="research-chapter scope-chapter" ref={root}
    data-chapter data-motion={phase} data-art-covered data-play-surface
    data-scope-ready={ready ? '' : undefined} aria-labelledby={id + '-title'}>
    <div className="scope-pin">
      <header className="scope-header">
        <div className="scope-mask">
          <h2 className="scope-enter" id={id + '-title'} tabIndex={-1}>
            {isEnglish ? <>Research<br />Scope</> : title}
          </h2>
        </div>
        <div className="scope-mask scope-intro">
          <p className="scope-enter">{isEnglish
            ? 'The “context” is the task context that users can understand, inspect, and modify.'
            : intro.text}</p>
        </div>
      </header>

      <figure className="scope-diagram" aria-labelledby={id + '-context'}>
        <figcaption className="scope-core">
          <div className="scope-mask">
            <div className="scope-enter">
              <h3 id={id + '-context'}>{isEnglish ? 'Context' : '上下文'}</h3>
              <p>{isEnglish ? 'Task context users can inspect and modify.' : '用户可以检查和修改的任务上下文。'}</p>
            </div>
          </div>
        </figcaption>
        <ol className="scope-elements" data-tracking={active >= 0 ? '' : undefined}>
          {elements.map(([kind, Icon], i) => <li key={kind} className={`scope-node scope-${kind}`}
            aria-current={i === active ? 'step' : undefined} style={{'--scope-order': i}}>
            <span className="scope-dot" aria-hidden="true" />
            <div className="scope-mask">
              <div className="scope-enter scope-node-copy">
                <Icon aria-hidden="true" />
                <h3>{labels[i][0]}</h3>
                <p>{labels[i][1]}</p>
              </div>
            </div>
          </li>)}
        </ol>
      </figure>
    </div>
    <p className="scope-boundary">{boundary.text}</p>
  </section>;
}

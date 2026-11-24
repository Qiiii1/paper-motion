import React from 'react';
import { FileText, Layers3, Network, SlidersHorizontal, Target } from 'lucide-react';
import { useScrollScene } from './scrollScene';

const diagramWidth = 390;
const diagramHeight = 640;
const core = { x: 195.5, y: 365.5, radius: 79.5 };
const elements = [
  { kind: 'goals', Icon: Target, x: 204.5, y: 129.5, radius: 80.5, halo: [204, 112, 112], joint: [199, 288] },
  { kind: 'constraints', Icon: SlidersHorizontal, x: 60.5, y: 256.5, radius: 69.5, halo: [41, 251, 97], joint: [129, 321] },
  { kind: 'materials', Icon: FileText, x: 337.5, y: 270.5, radius: 67.5, halo: [362, 266, 104], joint: [266, 329] },
  { kind: 'plan', Icon: Network, x: 75.5, y: 507.5, radius: 72.5, halo: [66.5, 518.5, 97.5], joint: [141, 424.5] },
  { kind: 'outputs', Icon: Layers3, x: 303.5, y: 519.5, radius: 77.5, halo: [312, 534, 106], joint: [233, 435] },
];

const english = [
  ['Goals', 'What the current task aims to achieve.'],
  ['Constraints', 'What conditions must be satisfied.'],
  ['Materials', 'Which inputs and evidence are used.'],
  ['Plan', 'Which steps are planned to complete the task.'],
  ['Outputs', 'Intermediate or final products already produced.'],
];

function positionLabel({ x, y, radius }) {
  return {
    left: (x / diagramWidth * 100) + '%',
    top: (y / diagramHeight * 100) + '%',
    width: (radius * 2 / diagramWidth * 100) + '%',
  };
}

function ScopeArtwork({ active }) {
  return <svg className="scope-artwork" viewBox={`0 0 ${diagramWidth} ${diagramHeight}`} aria-hidden="true">
    {elements.map(({ kind, halo: [x, y, radius] }, i) => <circle key={kind}
      className={'scope-halo scope-' + kind} data-muted={active >= 0 && active !== i ? '' : undefined}
      cx={x} cy={y} r={radius} />)}
    <circle className="scope-guide" cx={core.x} cy={core.y} r="90" />
    {elements.map(({ kind, x, y, joint: [endX, endY] }) => <path key={kind}
      className={'scope-connector scope-' + kind} d={`M${x} ${y}L${endX} ${endY}`} />)}
    <circle className="scope-disc-core" cx={core.x} cy={core.y} r={core.radius} />
    {elements.map(({ kind, x, y, radius, joint: [jointX, jointY] }, i) => <g key={kind}
      className={'scope-' + kind} data-muted={active >= 0 && active !== i ? '' : undefined}>
      <circle className="scope-disc" cx={x} cy={y} r={radius} />
      <circle className="scope-joint" cx={jointX} cy={jointY} r="4.6" />
    </g>)}
  </svg>;
}

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
        <figcaption className="scope-core" style={positionLabel(core)}>
          <div className="scope-mask">
            <div className="scope-enter">
              <h3 id={id + '-context'}>{isEnglish ? 'Context' : '上下文'}</h3>
              <p>{isEnglish ? <>Task context users<br />can inspect and modify.</> : '用户可以检查和修改的任务上下文。'}</p>
            </div>
          </div>
        </figcaption>
        <ScopeArtwork active={active} />
        <ol className="scope-elements" role="list">
          {elements.map(({ kind, Icon, ...location }, i) => <li key={kind} className={`scope-node scope-${kind}`}
            aria-current={i === active ? 'step' : undefined} data-muted={active >= 0 && active !== i ? '' : undefined}
            style={{ ...positionLabel(location), '--scope-order': i }}>
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

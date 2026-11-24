import React from 'react';
import { Box, ChartNoAxesColumnIncreasing, Flag, Layers3, Pencil, Rocket, Users } from 'lucide-react';
import { ResearchPartCover } from './ResearchPartCover';
import { StudyChapter, StudyReveal } from './ResearchStudy';
import { paperTints, papers } from './papers';
import './researchClosing.css';

const contributions = [
  {
    title: 'Review', copy: 'Connect four research areas and clarify evidence limits.',
    tone: 'review',
  },
  {
    title: 'Theory', copy: 'Test a framework for change, dependency, scope, and verification.',
    tone: 'theory',
  },
  {
    title: 'Design', copy: 'Guide local edits, preservation, and result checks.',
    tone: 'design',
  },
];

const steps = [
  { title: 'Literature review', Icon: Layers3, tone: 'blue', inset: 42 },
  { title: 'Formative study', Icon: Users, tone: 'navy', inset: 46 },
  { title: 'Co-design', Icon: Pencil, tone: 'sage', inset: 49 },
  { title: 'Prototype iteration', Icon: Box, tone: 'sand', inset: 49 },
  { title: 'Comparative evaluation', Icon: ChartNoAxesColumnIncreasing, tone: 'blue', inset: 46 },
  { title: 'Real-task pilot', Icon: Rocket, tone: 'coral', inset: 41 },
];

const motifMarks = {
  review: <>
    <path d="m-20 6 20 10L20 6 0-4Z" fill="currentColor" opacity=".18" />
    <path d="m-23-2 23 11L23-2 0-13Z" fill="currentColor" opacity=".28" />
    <path d="m-24-11 24 11 24-11L0-22Z" fill="var(--closing-tint)" stroke="currentColor" strokeWidth="1.7" />
    <path d="m-24-11 24 11 24-11" fill="none" stroke="currentColor" strokeWidth="3.5" opacity=".63" />
  </>,
  theory: <>
    <path d="M-11 18l1-10a14 14 0 1 1 24-14l4 8-4 2-1 9H5l1 7Z" fill="currentColor" />
    <path d="m-1-14 2 2 4-1 2 3 3 1v4L7-4 6 0 2-1l-3 2-3-2v-3l-3-2 1-4 3-1Z" fill="var(--closing-tint)" />
    <circle cx="1" cy="-6.5" r="3.3" fill="currentColor" />
  </>,
  design: <>
    <rect x="-20" y="-14" width="39" height="29" rx="1.5" fill="var(--closing-tint)" stroke="currentColor" strokeOpacity=".28" />
    <path d="M-20-9h39M-15 9H9" stroke="currentColor" strokeWidth="1.25" opacity=".55" />
    <circle cx="-16" cy="-11.5" r="1" fill="currentColor" /><circle cx="-13" cy="-11.5" r="1" fill="currentColor" />
    <path d="M-15-5h10V5h-10zM-1-4h14v2H-1zm0 5h15v2H-1zM9 5l14 5-5 2-2 6Z" fill="currentColor" />
  </>,
};

function ContributionMotif({ tone }) {
  return <div className="contribution-motif" aria-hidden="true">
    <svg viewBox="0 0 200 180" fill="none">
      <g className="contribution-orbits">
        <path d="M25 46A77 77 0 0 1 160 37M25 133a77 77 0 0 0 136 9" opacity=".20" strokeWidth="1" />
        <path d="M26 71a64 64 0 0 1 132-5m-1 38a64 64 0 0 1-112 35" opacity=".39" strokeWidth="1.5" />
        <path d="M39 55a56 56 0 0 1 89-9m21 37a56 56 0 0 1-100 42" opacity=".38" strokeWidth="4" />
        <path d="M49 70a44 44 0 1 1 7 50M56 143a66 66 0 0 1-19-92" opacity=".56" strokeWidth="1.5" />
        <path d="M50 105a43 43 0 0 0 85 0m-13-52a45 45 0 0 0-52-2" opacity=".19" strokeWidth="7" />
        <path d="M17 116 189 63M16 50l148 87M44 154l78-118" opacity=".31" strokeWidth="1" />
        <circle cx="66" cy="49" r="2.4" opacity=".55" /><circle cx="45" cy="112" r="2" opacity=".55" />
        <circle cx="116" cy="118" r="2.4" opacity=".65" />
      </g>
      <g className="contribution-glyph" transform="translate(96 90)">{motifMarks[tone]}</g>
    </svg>
  </div>;
}

const wheelCenter = [-33, 195];
const wheelRadius = 191;
const guideYs = [38, 93, 155, 220, 285, 341];
const iconAngles = [-59, -37, -11, 13, 37, 61];
const arcPoint = (radius, degrees) => {
  const angle = degrees * Math.PI / 180;
  return [wheelCenter[0] + radius * Math.cos(angle), wheelCenter[1] + radius * Math.sin(angle)];
};
const sector = (start, end) => {
  const inner = 114, outer = 173;
  return `M${arcPoint(inner, start)}L${arcPoint(outer, start)} A${outer},${outer} 0 0,1 ${arcPoint(outer, end)}L${arcPoint(inner, end)} A${inner},${inner} 0 0,0 ${arcPoint(inner, start)}Z`;
};

function Roadmap() {
  return <div className="closing-roadmap">
    <svg className="roadmap-wheel" viewBox="0 0 390 390" preserveAspectRatio="none" aria-hidden="true">
      <circle className="roadmap-rim" cx={wheelCenter[0]} cy={wheelCenter[1]} r={wheelRadius} strokeWidth="2" />
      <circle className="roadmap-track" cx={wheelCenter[0]} cy={wheelCenter[1]} r="111" strokeWidth="3" />
      <circle className="roadmap-ticks" cx={wheelCenter[0]} cy={wheelCenter[1]} r="97" strokeWidth="15"
        strokeDasharray="2 7" />
      <circle className="roadmap-track" cx={wheelCenter[0]} cy={wheelCenter[1]} r="73" strokeWidth="3" />
      <Flag x="9" y="181" width="23" height="23" strokeWidth="1.8" />
      <path className="roadmap-arrow" d="m77 362 12-14-17 4 7 3Z" />
      {steps.map(({ title, tone, Icon, inset }, index) => {
        const start = -78 + 26 * index;
        const [x, y] = arcPoint(151, iconAngles[index]);
        const dotY = guideYs[index];
        const dotX = wheelCenter[0] + Math.sqrt(wheelRadius ** 2 - (dotY - wheelCenter[1]) ** 2);
        const labelY = 20.5 + 67 * index;
        return <g key={title} data-roadmap-tone={tone}>
          <path className="roadmap-sector" d={sector(start, start + 26)} strokeWidth="2" />
          <Icon x={x - 13} y={y - 13} width="26" height="26" strokeWidth="1.8" />
          <path className="roadmap-guide" d={`M${dotX} ${dotY} L${dotX + 23} ${labelY} H${3.9 * inset}`}
            strokeWidth=".85" />
          <circle className="roadmap-junction" cx={dotX} cy={dotY} r="5.3" strokeWidth="1.8" />
        </g>;
      })}
    </svg>
    <ol role="list">
      {steps.map(({ title, inset, tone }, index) => <li key={title} data-roadmap-tone={tone}
        style={{ '--step-inset': inset + '%' }}>
        <StudyReveal>
          <span className="roadmap-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <strong>{title}</strong>
        </StudyReveal>
      </li>)}
    </ol>
  </div>;
}

function Contributions() {
  return <StudyChapter id="contributions" title={<>Expected<br />Contributions<br />&amp; Next Steps</>}>
    <ol className="contribution-list" role="list">
      {contributions.map(({ title, copy, tone }, index) => <li key={title} className={'contribution-' + tone}>
        <ContributionMotif tone={tone} />
        <StudyReveal className="contribution-copy">
          <h3><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{title}</h3>
          <p>{copy}</p>
        </StudyReveal>
      </li>)}
    </ol>
    <section aria-labelledby="closing-roadmap-title">
      <StudyReveal className="closing-roadmap-title">
        <p>Next Steps</p>
        <h3 id="closing-roadmap-title">Six steps from evidence to use</h3>
      </StudyReveal>
      <Roadmap />
    </section>
    <StudyReveal className="closing-question">
      <p>Where should users edit—and how can they verify the change?</p>
    </StudyReveal>
  </StudyChapter>;
}

const driftingPapers = [
  { paper: 2, x: 43, y: 2.1, width: 18, turn: 12 },
  { paper: 5, x: 96, y: 5.9, width: 20, turn: -16 },
  { paper: 3, x: 75, y: 65, width: 14, turn: -28 },
  { paper: 0, x: 4, y: 81, width: 24, turn: 17 },
  { paper: 5, x: 85, y: 91, width: 31, turn: -26 },
];

function ReferencePapers() {
  return <div className="reference-papers" aria-hidden="true">
    {driftingPapers.map(({ paper, x, y, width, turn }) => <svg className="reference-paper" key={y}
      viewBox="0 0 120 138" style={{ '--paper-x': x + '%', '--paper-y': y + '%',
        '--paper-w': width + '%', '--paper-turn': turn + 'deg' }}>
      <path d="M3 1Q57 6 117 1l-4 132Q54 138 1 127Z" fill={paperTints[paper]} />
      <path d="M3 1Q57 6 117 1l-1 19Q61 16 3 24Z" fill="#fff" opacity=".25" />
      <text x="10" y="19" fontSize="6" fontWeight="750" fill="#162331" textLength="99" lengthAdjust="spacingAndGlyphs">
        {papers[paper][1].split(' ').slice(0, 5).join(' ')}
      </text>
      <path d="M10 28h98m-98 4h91m-91 7h52m-52 6h95m-95 5h87m-87 5h76m-76 8h97m-97 5h88m-88 5h98m-98 5h89m-89 5h96m-96 4h88m-88 5h95m-95 5h91m-91 13h98m-98 4h89m-89 5h57"
        fill="none" stroke="#1e2b39" strokeWidth="1.35" opacity=".40" />
    </svg>)}
  </div>;
}

function Reference({ references }) {
  return <StudyChapter id="references" title="Reference" backdrop={<ReferencePapers />}>
    <ol className="closing-references" role="list">
      {references.blocks.filter(block => block.kind === 'ref').map(({ citation, shortCitation, url }) => {
        const copy = shortCitation ?? citation.replace(/^\[\d+\] /, '');
        const [body, doi] = copy.split(' DOI: ');
        const label = citation.slice(0, citation.indexOf(']') + 1);
        return <li key={url} id={'reference-' + label.slice(1, -1)}>
          <StudyReveal>
            <p>{label} {body}{' '}
              {url.startsWith('https://arxiv.org/') && <><a href={url} target="_blank" rel="noreferrer">{url}</a>.{' '}</>}
              {doi && <>DOI: <a href={url.startsWith('https://doi.org/') ? url : 'https://doi.org/' + doi.replace(/\.$/, '')}
                target="_blank" rel="noreferrer">{doi.replace(/\.$/, '')}</a>.</>}
            </p>
          </StudyReveal>
        </li>;
      })}
    </ol>
  </StudyChapter>;
}

export function ResearchClosing({ references }) {
  return <>
    <ResearchPartCover part={7} />
    <Contributions />
    <Reference references={references} />
  </>;
}

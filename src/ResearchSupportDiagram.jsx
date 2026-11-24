import React, { useId } from 'react';
import './researchSupportDiagram.css';

const palette = {
  blue: { line: '#25c9f1', pale: '#e4f8fd', top: '#8de8ff', left: '#4edaff', right: '#13b9e7' },
  coral: { line: '#ff8763', pale: '#fff2ea', top: '#ffc6b2', left: '#ff9c7e', right: '#fc7652' },
  green: { line: '#92db62', pale: '#effae9', top: '#c4efaa', left: '#abe879', right: '#83ce51' },
  gray: { line: '#b8c7d9', pale: '#edf3f8', top: '#dce5f0', left: '#c3d0e0', right: '#aebdd1' },
};

const stages = [
  {
    number: '01',
    title: 'Prior Research',
    summary: 'Foundational methods and systems.',
    labels: [
      { tone: 'blue', x: 81, title: ['Node Flow'], body: ['Team design [3]'], target: [117, 161] },
      { tone: 'coral', x: 237, title: ['Chains +', 'Debug'], body: ['AI Chains /', 'AGDebugger [6–7]'], target: [237, 158] },
      { tone: 'green', x: 391, title: ['Provenance'], body: ['Frameworks', '[9–10]'], target: [371, 160] },
    ],
  },
  {
    number: '02',
    title: 'What It Enables',
    summary: 'Capabilities supported by prior work.',
    labels: [
      { tone: 'blue', x: 76, title: ['Relationships'], body: ['Task steps +', 'links'], target: [118, 182] },
      { tone: 'coral', x: 236, title: ['Intervention'], body: ['Inspect · edit ·', 'rerun'], target: [233, 175] },
      { tone: 'green', x: 396, title: ['History'], body: ['Sources · actions ·', 'states'], target: [351, 182] },
    ],
  },
  {
    number: '03',
    title: 'Still to Verify',
    summary: 'Questions that remain and need testing.',
    labels: [
      { tone: 'blue', x: 78, title: ['Scope'], body: ['What is', 'affected?'], target: [113, 186] },
      { tone: 'coral', x: 236, title: ['Decision'], body: ['Edit, check or', 'keep?'], target: [236, 173] },
      { tone: 'green', x: 391, title: ['Outcome'], body: ['Did change', 'land?'], target: [354, 186] },
    ],
  },
];

const nodes = [
  { x: 65, y: 180, tone: 'blue' }, { x: 91, y: 200, tone: 'blue' },
  { x: 118, y: 182, tone: 'blue', major: true }, { x: 150, y: 166, tone: 'blue' },
  { x: 157, y: 185, tone: 'blue' }, { x: 150, y: 206, tone: 'blue' },
  { x: 191, y: 185, tone: 'coral' }, { x: 233, y: 175, tone: 'coral', major: true },
  { x: 273, y: 191, tone: 'coral' },
  { x: 191, y: 200, tone: 'gray' }, { x: 234, y: 214, tone: 'gray' }, { x: 278, y: 154, tone: 'gray' },
  { x: 318, y: 167, tone: 'green' }, { x: 311, y: 187, tone: 'green' },
  { x: 351, y: 182, tone: 'green', major: true }, { x: 320, y: 208, tone: 'green' },
  { x: 375, y: 200, tone: 'green' }, { x: 402, y: 178, tone: 'green' },
];

const edges = [
  [2, 0], [2, 1], [2, 3], [2, 4], [2, 6, 'gray'], [3, 7, 'gray'],
  [6, 7], [7, 8], [7, 11, 'gray'], [11, 12, 'gray'],
  [5, 9, 'gray'], [9, 10], [8, 10, 'gray'], [8, 13, 'gray'],
  [14, 12], [14, 13], [14, 15], [14, 16], [14, 17],
];

const platePath = 'M1 181 176 121 236 141 291 121 467 181 285 245 236 227 181 245Z';

function Definitions({ prefix }) {
  return <defs>
    <linearGradient id={prefix + '-reveal'} x2="0%" y2="100%">
      <stop offset="83%" stopColor="white" />
      <stop offset="100%" stopColor="white" stopOpacity="0" />
    </linearGradient>
    <linearGradient id={prefix + '-plate-fill'} x2="0%" y2="100%">
      <stop stopColor="#fcfdff" stopOpacity=".35" />
      <stop offset="100%" stopColor="#fff" stopOpacity=".6" />
    </linearGradient>
    <pattern id={prefix + '-grid'} width="19" height="19" patternUnits="userSpaceOnUse"
      patternTransform="matrix(1 .35 -1 .35 236 103)">
      <path d="M0 0H19 M0 0V19" fill="none" stroke="#dbe7f2" strokeWidth="1" />
    </pattern>
    {['blue', 'coral', 'green'].map(tone => <linearGradient key={tone}
      id={prefix + '-arrow-' + tone} x2="0%" y2="100%">
      <stop stopColor={palette[tone].line} stopOpacity="0" />
      <stop offset="80%" stopColor={palette[tone].line} stopOpacity=".92" />
      <stop offset="100%" stopColor={palette[tone].line} />
    </linearGradient>)}
  </defs>;
}

function Platform({ prefix }) {
  return <>
    <path d={platePath} transform="translate(0 7)" fill="#ebf1f7" stroke="#e0e8f1" />
    <path d={platePath} fill={`url(#${prefix}-plate-fill)`} stroke="#e0e9f3" />
    <path d={platePath} fill={`url(#${prefix}-grid)`} opacity=".44" />
  </>;
}

function Footprint({ tone, x, y, breadth, depth }) {
  return <path d={`M${x - breadth} ${y} ${x} ${y - depth} ${x + breadth} ${y} ${x} ${y + depth}Z`}
    fill={palette[tone].pale} />;
}

function Cube({ tone, x, y, size }) {
  const light = palette[tone];
  const depth = size * .35;
  const height = size * 1.03;
  return <g transform={`translate(${x} ${y})`}>
    <path d={`M${-size} ${-height} 0 ${depth - height} 0 ${depth} ${-size} 0Z`} fill={light.left} />
    <path d={`M0 ${depth - height} ${size} ${-height} ${size} 0 0 ${depth}Z`} fill={light.right} />
    <path d={`M${-size} ${-height} 0 ${-height - depth} ${size} ${-height} 0 ${depth - height}Z`} fill={light.top} />
  </g>;
}

function PriorResearch() {
  return <>
    <Footprint tone="blue" x={106} y={182} breadth={49} depth={16} />
    <Footprint tone="coral" x={236} y={190} breadth={74} depth={25} />
    <Footprint tone="green" x={359} y={182} breadth={50} depth={17} />
    <Cube tone="blue" x={119} y={173} size={15} />
    <Cube tone="blue" x={91} y={184} size={15} />
    <Cube tone="coral" x={237} y={175} size={18} />
    <Cube tone="coral" x={201} y={192} size={17} />
    <Cube tone="coral" x={272} y={192} size={17} />
    <Cube tone="green" x={371} y={175} size={16} />
    <Cube tone="green" x={345} y={187} size={15} />
  </>;
}

function Capabilities() {
  return <>
    {edges.map(([from, to, tone = nodes[from].tone]) => <line key={`${from}-${to}`}
      x1={nodes[from].x} y1={nodes[from].y} x2={nodes[to].x} y2={nodes[to].y}
      stroke={palette[tone].line} strokeWidth="1.35" />)}
    {nodes.map(({ x, y, tone, major }) => <g key={`${x}-${y}`}>
      <ellipse cx={x} cy={y + 1.1} rx={major ? 10 : 6.5} ry={major ? 4.4 : 2.8} fill={palette[tone].line} />
      <ellipse cx={x} cy={y - .4} rx={major ? 9.5 : 6} ry={major ? 3.6 : 2.4} fill={palette[tone].top} />
    </g>)}
  </>;
}

function OpenQuestions() {
  return <>
    <Footprint tone="blue" x={112} y={200} breadth={40} depth={13} />
    <Footprint tone="coral" x={236} y={185} breadth={41} depth={14} />
    <Footprint tone="green" x={354} y={200} breadth={43} depth={14} />
    <Cube tone="gray" x={171} y={173} size={9} />
    <Cube tone="gray" x={306} y={171} size={9} />
    <Cube tone="blue" x={113} y={198} size={19} />
    <Cube tone="coral" x={236} y={185} size={19} />
    <Cube tone="green" x={354} y={198} size={19} />
    <Cube tone="gray" x={185} y={221} size={9} />
    <Cube tone="gray" x={286} y={221} size={9} />
  </>;
}

function DownArrows({ prefix, y }) {
  return <g transform={`translate(0 ${y})`}>
    {['blue', 'coral', 'green'].map((tone, index) => <path key={tone}
      transform={`translate(${139 + 98 * index} 0)`}
      d="M-24 0Q-9 9-6 27H-14L0 41 14 27H6Q9 9 24 0Z"
      fill={`url(#${prefix}-arrow-${tone})`} />)}
  </g>;
}

function Label({ label, top, platformTop }) {
  const { x, tone, title, body, target } = label;
  const color = palette[tone];
  const height = title.length === 2 ? 60 : 52;
  return <g>
    <line x1={x} y1={top + height - 5} x2={target[0]} y2={target[1] + platformTop}
      stroke={color.line} strokeWidth="1.2" />
    <rect x={x - 55} y={top} width="110" height={height} rx="10" fill={color.pale}
      stroke={color.line} strokeOpacity=".43" />
    <svg className="support-layer-label-copy" x={x - 55} y={top} width="110" height={height} overflow="hidden">
      <g className="support-svg-copy-rise">
        <text x="55" y={title.length === 2 ? 13 : 17} className="support-node-title">
          {title.map((line, index) => <tspan key={line} x="55" dy={index * 12}>{line}</tspan>)}
        </text>
        <text x="55" y={title.length === 2 ? 39 : 32} className="support-node-copy">
          {body.map((line, index) => <tspan key={line} x="55" dy={index * 11}>{line}</tspan>)}
        </text>
      </g>
    </svg>
  </g>;
}

const stageLayout = [
  { header: 7, width: 237, labels: 71, platform: 0, arrow: 233 },
  { header: 288, width: 252, labels: 350, platform: 259, arrow: 492 },
  { header: 546, width: 252, labels: 609, platform: 528 },
];
const stageArt = [PriorResearch, Capabilities, OpenQuestions];

function DiagramStage({ index, prefix }) {
  const { number, title, summary, labels } = stages[index];
  const layout = stageLayout[index];
  const Art = stageArt[index];
  const top = layout.header - 1;
  const height = (stageLayout[index + 1]?.header ?? 781) - top;
  const revealDistance = height + 64;
  const maskId = prefix + '-layer-' + number;
  return <g data-support-layer>
    <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y={top} width="470" height={height}>
      <rect className="support-reveal-mask" x="0" y={top - revealDistance}
        width="470" height={revealDistance} fill={`url(#${prefix}-reveal)`}
        style={{ '--support-reveal-distance': revealDistance + 'px' }} />
    </mask>
    <g className="support-layer-art" mask={`url(#${maskId})`}>
      <g transform={`translate(0 ${layout.platform})`}>
        <Platform prefix={prefix} />
        <Art />
      </g>
      {layout.arrow && <DownArrows prefix={prefix} y={layout.arrow} />}
      <g transform={`translate(235 ${layout.header})`}>
        <rect x={-layout.width / 2} width={layout.width} height="49" rx="11" fill="white" fillOpacity=".65" stroke="#cbd9e9" />
        <rect x={-layout.width / 2 + 31} y="8" width="5" height="16" rx="1"
          fill={index === 2 ? palette.coral.line : palette.blue.line} />
        <svg className="support-layer-heading-copy" x={-layout.width / 2}
          width={layout.width} height="49" overflow="hidden">
          <g className="support-svg-copy-rise">
            <text x={layout.width / 2 + 4} y="21" className="support-stage-title">{number}　{title}</text>
            <text x={layout.width / 2} y="39" className="support-stage-copy">{summary}</text>
          </g>
        </svg>
      </g>
      {labels.map(label => <Label key={label.tone} label={label} top={layout.labels} platformTop={layout.platform} />)}
    </g>
  </g>;
}

export function ResearchSupportDiagram() {
  const prefix = useId();

  return <figure className="research-support-figure">
    <svg className="research-support-diagram" viewBox="0 0 470 780" role="img"
      aria-labelledby={prefix + '-title'} aria-describedby={prefix + '-description'}>
      <title id={prefix + '-title'}>From prior research to open questions</title>
      <desc id={prefix + '-description'}>
        Node Flow supports showing task relationships. AI Chains and AGDebugger support inspecting, editing, and rerunning steps.
        Provenance frameworks help track sources, actions, and states. Three questions remain.
        What does a change affect? Should the user edit, check, or keep it? Did the change take effect?
      </desc>
      <Definitions prefix={prefix} />
      {stages.map(({ number }, index) => <DiagramStage key={number} index={index} prefix={prefix} />)}
    </svg>
  </figure>;
}

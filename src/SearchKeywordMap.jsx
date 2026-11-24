import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { CodeXml, Layers3, Network, RefreshCw, SlidersHorizontal, Users } from 'lucide-react';
import { ease } from './choreography';
import { useScrollScene } from './scrollScene';
import './searchKeywordMap.css';

function keyword(x, y, rx, ...lines) {
  return { x, y, rx, ry: 4.9 + 2.35 * lines.length, lines };
}

function topic(x, y, rx, ry, lines, keywords) {
  return { x, y, rx, ry, lines, keywords };
}

const hub = {
  x: 194, y: 422, rx: 57, ry: 62, Icon: Layers3,
  lines: ['Context', 'Understanding &', 'Intervention in', 'Ongoing AI', 'Tasks'],
};

const themes = [
  {
    x: 136, y: 282, rx: 34, ry: 33, Icon: Layers3,
    lines: ['Context &', 'Memory'],
    colors: ['#dff5ff', '#83d4f3', '#b7ebfa', '#eef9fd', '#8ed7f4', '#75a9ca'],
    topics: [
      topic(76, 215, 27, 21, ['Long-term', 'Conversational', 'Memory'], [
        keyword(34, 186, 20, 'Cross-session', 'Reasoning'), keyword(70, 172, 17, 'Temporal', 'Reasoning'),
        keyword(104, 181, 17, 'Knowledge', 'Updating'),
      ]),
      topic(166, 212, 27, 20, ['Long-context', 'Use'], [
        keyword(157, 171, 17, 'Information', 'Position'), keyword(190, 160, 18, 'Multi-', 'document', 'QA'),
        keyword(217, 179, 17, 'Key-value', 'Retrieval'),
      ]),
      topic(72, 273, 25, 18, ['Information', 'Organization'], [
        keyword(24, 250, 18, 'Information', 'Seeking'), keyword(24, 271, 19, 'Meaning', 'Construction'),
        keyword(26, 293, 19, 'Abstraction', 'Levels'),
      ]),
    ],
  },
  {
    x: 249, y: 274, rx: 37, ry: 35, Icon: Network,
    lines: ['Process', 'Representation', '& Traceability'],
    colors: ['#f1face', '#caed8c', '#e8f6c8', '#f5fae9', '#c3e986', '#adce70'],
    topics: [
      topic(301, 206, 24, 16, ['Provenance'], [
        keyword(343, 173, 19, 'Analytic', 'Provenance'), keyword(351, 194, 19, 'Interaction', 'History'),
        keyword(351, 213, 18, 'Source', 'Records'),
      ]),
      topic(313, 265, 20, 16, ['Visual', 'Forms'], [
        keyword(359, 243, 20, 'Node-based', 'Interface'), keyword(363, 262, 20, 'Interaction', 'Diagram'),
        keyword(364, 280, 22, 'Temporal', 'Visualization'),
      ]),
      topic(307, 323, 24, 16, ['Intermediate', 'Process'], [
        keyword(359, 300, 18, 'Prompt', 'Chaining'), keyword(360, 320, 21, 'Intermediate', 'Results'),
        keyword(360, 338, 20, 'Responsive', 'Units'),
      ]),
    ],
  },
  {
    x: 105, y: 420, rx: 32, ry: 34, Icon: Users,
    lines: ['User', 'Understanding', '& Evaluation'],
    colors: ['#ffdfcb', '#ff9f73', '#ffdac9', '#fff4ee', '#ffad86', '#d89270'],
    topics: [
      topic(72, 366, 24, 16, ['Understanding', '& Control'], [
        keyword(26, 342, 20, 'System', 'Transparency'), keyword(24, 361, 20, 'Controllability'),
        keyword(25, 380, 22, 'Sense of', 'Collaboration'),
      ]),
      topic(57, 445, 19, 16, ['Judgment &', 'Reliance'], [
        keyword(20, 426, 18, 'Explainable', 'AI'), keyword(18, 446, 17, 'Overreliance'),
        keyword(19, 470, 18, 'Cognitive', 'Forcing', 'Functions'),
      ]),
    ],
  },
  {
    x: 273, y: 440, rx: 30, ry: 30, Icon: SlidersHorizontal,
    lines: ['User', 'Intervention &', 'Debugging'],
    colors: ['#fff6db', '#ffe08b', '#ffedbb', '#fffaed', '#f5df9b', '#d6c478'],
    topics: [
      topic(318, 386, 22, 16, ['Guidance &', 'Control'], [
        keyword(363, 363, 20, 'Monitoring'), keyword(366, 378, 17, 'Guidance'),
        keyword(370, 394, 17, 'Message', 'Editing'), keyword(369, 410, 18, 'Message', 'Reset'),
      ]),
      topic(330, 446, 23, 16, ['Workflow', 'Construction'], [
        keyword(371, 430, 18, 'Visual', 'Programming'), keyword(372, 448, 17, 'Prompt', 'Templates'),
        keyword(370, 466, 18, 'Iterative', 'Refinement'),
      ]),
      topic(322, 498, 23, 16, ['Result', 'Comparison'], [
        keyword(370, 485, 18, 'Model', 'Selection'), keyword(369, 503, 19, 'Hypothesis', 'Testing'),
        keyword(370, 521, 18, 'Error', 'Localization'),
      ]),
    ],
  },
  {
    x: 129, y: 583, rx: 37, ry: 36, Icon: CodeXml, dark: true,
    lines: ['Software', 'Tasks &', 'Execution', 'Feedback'],
    colors: ['#4e668a', '#233653', '#aebfde', '#f0f3fb', '#8fa6c7', '#17273e'],
    topics: [
      topic(75, 542, 25, 18, ['Interactive', 'Programming'], [
        keyword(26, 521, 19, 'Execution', 'Feedback'), keyword(25, 541, 21, 'Execution', 'Environment'),
        keyword(25, 562, 20, 'Error', 'Propagation'),
      ]),
      topic(74, 627, 25, 22, ['Software', 'Engineering', 'Agents'], [
        keyword(26, 608, 19, 'Code', 'Editing'), keyword(25, 630, 21, 'Repository', 'Navigation'),
        keyword(27, 652, 19, 'Test', 'Execution'),
      ]),
    ],
  },
  {
    x: 226, y: 605, rx: 37, ry: 36, Icon: RefreshCw,
    lines: ['Change', 'Impact &', 'Consistency'],
    colors: ['#d9faf5', '#8aebda', '#baf4ec', '#edfafa', '#7ce1d3', '#78c7bd'],
    topics: [
      topic(284, 565, 24, 16, ['Requirement', 'Relations'], [
        keyword(338, 546, 21, 'Requirements', 'Traceability'), keyword(339, 565, 18, 'Trace', 'Links'),
        keyword(339, 585, 21, 'Requirements', 'Metamodel'),
      ]),
      topic(296, 621, 23, 16, ['Change', 'Propagation'], [
        keyword(349, 613, 19, 'Change', 'Impact', 'Analysis'), keyword(349, 636, 21, 'Propagated', 'Changes'),
      ]),
      topic(279, 675, 24, 16, ['Consistency', 'Checking'], [
        keyword(332, 664, 19, 'False', 'Positive', 'Impact'), keyword(332, 689, 20, 'Conflicting', 'Changes'),
      ]),
    ],
  },
];

function MapLabel({ node, size, offset = 0 }) {
  const leading = size * 1.14;
  const baseline = node.y + offset - (node.lines.length - 1) * leading / 2 + size * .34;
  return <text x={node.x} y={baseline} fontSize={size}>
    {node.lines.map((line, i) => <tspan key={line} x={node.x} dy={i ? leading : 0}>{line}</tspan>)}
  </text>;
}

function MapDisc({ node, fill, size, progress = 1, shadow }) {
  const { x, y, rx, ry, Icon, dark } = node;
  const scale = .7 + .3 * progress;
  return <g className={`keyword-disc${dark ? ' keyword-disc-dark' : ''}`} opacity={progress}
    transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
    {shadow && <ellipse cx={x + 3.5} cy={y} rx={rx} ry={ry} fill={shadow} />}
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={fill} />
    {Icon && <g className="keyword-disc-icon" transform={`translate(${x - 8} ${y - ry * .72})`}>
      <Icon size={16} strokeWidth={1.55} aria-hidden="true" />
    </g>}
    <MapLabel node={node} size={size} offset={Icon ? ry * .22 : 0} />
  </g>;
}

function edgePoint(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const radius = Math.hypot(dx / from.rx, dy / from.ry);
  return { x: from.x + dx / radius, y: from.y + dy / radius };
}

function MapLink({ from, to, color, progress, width, junction = false }) {
  const { x, y } = edgePoint(from, to);
  const midX = (x + to.x) / 2, midY = (y + to.y) / 2;
  const bend = Math.abs(to.y - y) > Math.abs(to.x - x)
    ? `${x} ${midY} ${to.x} ${midY}`
    : `${midX} ${y} ${midX} ${to.y}`;
  return <g aria-hidden="true">
    <path className="keyword-link" d={`M${x} ${y} C${bend} ${to.x} ${to.y}`} opacity={progress > 0 ? 1 : 0}
      strokeWidth={width} stroke={color} pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - progress} />
    {junction && <circle className="keyword-joint" cx={x} cy={y} r="4" fill={color} opacity={progress} />}
  </g>;
}

function KeywordBranch({ theme, order, progress, gradient }) {
  const [,, topicColor, leafColor, line, shadow] = theme.colors;
  const delay = order * .027;
  const branch = .09 + delay;
  return <g role="group" aria-label={theme.lines.join(' ')}>
    <MapLink from={hub} to={theme} color={line} width="1.55" junction
      progress={ease(branch, branch + .16, progress)} />
    {theme.topics.map((item, i) => {
      const fork = .29 + delay + .019 * i;
      return <g key={item.x + '-' + item.y}>
        <MapLink from={theme} to={item} color={line} width="1.05"
          progress={ease(fork, fork + .14, progress)} />
        {item.keywords.map((term, j) => {
          const leaf = .47 + delay + .018 * i + .013 * j;
          return <g key={term.lines.join(' ')}>
            <MapLink from={item} to={term} color={line} width=".72" progress={ease(leaf, leaf + .12, progress)} />
            <MapDisc node={term} fill={leafColor} size={4.95} progress={ease(leaf + .075, leaf + .17, progress)} />
          </g>;
        })}
        <MapDisc node={item} fill={topicColor} size={6.65} progress={ease(fork + .095, fork + .19, progress)} />
      </g>;
    })}
    <MapDisc node={theme} fill={`url(#${gradient})`} size={theme.dark ? 8.4 : 8.7} shadow={shadow}
      progress={ease(branch + .11, branch + .24, progress)} />
  </g>;
}

function KeywordArtwork({ progress }) {
  const id = useId();
  return <svg className="keyword-diagram" viewBox="0 134 390 568" role="group" aria-labelledby={id + '-title'}>
    <title id={id + '-title'}>Six branches of the search keyword map</title>
    <defs>
      {themes.map(({ colors, x }, i) => <linearGradient key={x} id={id + '-theme-' + i} x2=".26" y2="1">
        <stop stopColor={colors[0]} /><stop offset="100%" stopColor={colors[1]} />
      </linearGradient>)}
    </defs>
    <MapDisc node={hub} size={10.7} fill="#fafafa" shadow="#e4e4e4" />
    {themes.map((theme, i) => <KeywordBranch key={theme.x} theme={theme} order={i}
      progress={progress} gradient={id + '-theme-' + i} />)}
  </svg>;
}

function HeaderPapers() {
  return <svg className="keyword-header-papers" viewBox="0 0 390 164" aria-hidden="true">
    <g transform="translate(-9 25) rotate(20 25 30)" opacity=".7">
      <path d="M0 0Q17 5 57 0L49 59Q17 63 0 56Z" fill="#f6aa93" />
      <path d="M4 12L51 15M4 22L50 27M4 32L48 37" stroke="#b67166" strokeOpacity=".26" strokeWidth="2" />
      <path d="M0 0L7 3 3 56 0 56Z" fill="#e5c0fa" />
    </g>
    <g transform="translate(207 20) rotate(13 9 13)" opacity=".62">
      <path d="M0 0H20L19 27 0 24Z" fill="#d9d4c5" />
      <path d="M3 6H17M3 9H16M3 14H17M3 17H15" stroke="#a39d8a" strokeOpacity=".42" />
    </g>
    <g transform="translate(276 39) rotate(11 16 11)" opacity=".6">
      <path d="M0 1Q10 6 27 7Q33 13 35 26Q18 26 9 21Q3 14 0 1Z" fill="#9bc1ca" />
      <path d="M6 10Q16 16 29 17M9 16Q16 21 31 22" fill="none" stroke="#618b98" strokeOpacity=".48" />
    </g>
    <path d="M303 161Q316 133 343 127L362 128Q344 142 303 161Z" fill="#e8f3f8" opacity=".52" />
  </svg>;
}

export function SearchKeywordMap() {
  const { root, progress, top } = useScrollScene();
  const layout = useRef(null);
  const [overhang, setOverhang] = useState(0);
  const height = window.innerHeight;
  useLayoutEffect(() => {
    const content = layout.current;
    const pin = content.parentElement;
    const measure = () => setOverhang(Math.max(0, content.offsetHeight - pin.clientHeight));
    const resize = new ResizeObserver(measure);
    resize.observe(content);
    resize.observe(pin);
    measure();
    return () => resize.disconnect();
  }, []);

  return <section id="search-keyword-map" className="keyword-chapter" ref={root}
    data-chapter data-art-covered aria-labelledby="search-keyword-map-title"
    style={{
      '--keyword-heading': ease(height * .83, height * .11, top),
      '--keyword-notes': ease(.83, .92, progress),
      '--keyword-pan': -overhang * ease(.72, .97, progress) + 'px',
    }}>
    <div className="keyword-pin">
      <div className="keyword-layout" ref={layout}>
        <header className="keyword-header">
          <HeaderPapers />
          <div className="keyword-title-mask">
            <h2 id="search-keyword-map-title" tabIndex={-1} data-title-reveal>Search<br />Keyword Map</h2>
          </div>
        </header>
        <figure className="keyword-figure"><KeywordArtwork progress={progress} /></figure>
        <footer className="keyword-note-mask">
          <div className="keyword-notes">
            <h3>Four thematic search areas</h3>
            <p>Context &amp; memory · Process &amp; traceability · Intervention &amp; debugging · Change impact &amp; consistency</p>
            <h3>Two supporting areas</h3>
            <p>Software tasks &amp; execution feedback · User understanding &amp; evaluation</p>
          </div>
        </footer>
      </div>
    </div>
    <div className="keyword-travel" aria-hidden="true" />
  </section>;
}

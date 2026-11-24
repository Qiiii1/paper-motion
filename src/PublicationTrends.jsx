import React, { useId } from 'react';
import { StudyChapter, StudyReveal } from './ResearchStudy';
import { useScrollScene } from './scrollScene';
import './publicationTrends.css';

const firstYear = 2016;
const yearCount = 11;
const themes = [
  {
    label: 'Context & memory', chartLabel: ['Context & Memory'], total: 53,
    values: [1, 2, 1, 1, 4, 3, 2, 6, 12, 8, 13], depth: .12, fill: '#3974ad', ink: '#315d99',
  },
  {
    label: 'Process & traceability', chartLabel: ['Process Representation &', 'Traceability'], total: 32,
    // Two yearly labels are obscured by the front layer in the supplied chart.
    values: [2, 1, 4, 6, 2, 4, 4, null, 3, null, 5], depth: .34, fill: '#9fd19b', ink: '#497749',
  },
  {
    label: 'Intervention & debugging', chartLabel: ['User Intervention &', 'Debugging'], total: 63,
    values: [2, 3, 2, 3, 6, 7, 7, 5, 2, 9, 17], depth: .53, fill: '#ff9478', ink: '#a5533f',
  },
  {
    label: 'Change impact & consistency', chartLabel: ['Change Impact &', 'Consistency'], total: 103,
    // The partially covered 2025 point accounts for the remaining nine hits.
    values: [10, 5, 12, 7, 15, 12, 8, 5, 7, 9, 13], depth: .94, fill: '#70d4d9', ink: '#2b7479',
  },
];
const maxHits = Math.max(...themes.map(({ total }) => total));

function SearchHits({ top }) {
  // The totals climb with the reader: bars fill and the numbers count up as the
  // block rises into view, then hold at their real values.
  const viewport = typeof window === 'undefined' ? 800 : window.innerHeight;
  const climb = Math.max(0, Math.min(1, (viewport * .95 - top) / (viewport * .70)));
  const grow = climb * climb * (3 - 2 * climb);
  return <div className="trends-counts">
    <p className="trends-kicker">Initial Search · Four Themes</p>
    <div className="trends-count-columns">
      <div className="trends-total">
        <strong>{Math.round(250 * grow)}</strong>
        <span>unique search<br />records</span>
      </div>
      <div className="trends-hits">
        <p className="trends-kicker">Search Hits by Theme</p>
        <dl>
          {themes.map(({ label, total, fill, ink }) => <div className="trends-hit" key={label}
            style={{ '--trend-fill': fill, '--trend-ink': ink, '--trend-width': (total / maxHits * 100 * grow) + '%' }}>
            <dt>{label}<span className="trends-bar" aria-hidden="true" /></dt>
            <dd>{Math.round(total * grow)}</dd>
          </div>)}
        </dl>
      </div>
    </div>
  </div>;
}

function plotPoint(index, value, depth) {
  const year = index / (yearCount - 1);
  const nearX = 34 + 220 * year;
  const farX = 137 + 188 * year;
  const nearY = 157 + 42 * year;
  const farY = 87 + 41 * year;
  return [
    nearX + (farX - nearX) * depth,
    nearY + (farY - nearY) * depth - value * (6.12 - .72 * depth),
  ];
}

function pointRuns(values) {
  const runs = [[]];
  values.forEach((value, i) => {
    const run = runs.at(-1);
    if (value !== null) run.push({ value, i });
    else if (run.length) runs.push([]);
  });
  return runs.filter(run => run.length);
}

function Series({ theme, gradient }) {
  const { depth, fill, values, label } = theme;
  return <g aria-label={label}>
    {pointRuns(values).map(run => {
      const points = run.map(({ i, value }) => plotPoint(i, value, depth));
      const first = plotPoint(run[0].i, 0, depth);
      const last = plotPoint(run.at(-1).i, 0, depth);
      const line = points.map(point => point.join(',')).join(' ');
      return <g key={run[0].i}>
        {run.length > 1 && <>
          <polygon points={`${first.join(',')} ${line} ${last.join(',')}`} fill={`url(#${gradient})`} />
          <polyline points={line} fill="none" stroke={fill} strokeWidth="1.15" strokeLinejoin="round" />
        </>}
        {run.map(({ value, i }, index) => {
          const [x, y] = points[index];
          const [, base] = plotPoint(i, 0, depth);
          return <g key={i} role="img" aria-label={`${firstYear + i}, ${value} records`}>
            <line x1={x} x2={x} y1={y} y2={base} stroke={fill} strokeOpacity=".19" strokeWidth=".7" />
            <rect x={x - 1.35} y={y - 1.35} width="2.7" height="2.7" fill="white" stroke={fill} strokeWidth=".75" />
            <text x={x} y={y - 3.9} className="trends-point-label">{value}</text>
          </g>;
        })}
      </g>;
    })}
  </g>;
}

function TrendChart() {
  const id = useId();
  const floor = [plotPoint(0, 0, 0), plotPoint(10, 0, 0), plotPoint(10, 0, 1), plotPoint(0, 0, 1)];
  const farCorner = plotPoint(0, 16, 1);
  const farRight = plotPoint(10, 16, 1);
  const roof = [plotPoint(0, 20, 0), farCorner, farRight, floor[2]];
  return <figure className="trends-figure">
    <svg viewBox="0 0 390 215" className="trends-chart" role="group"
      aria-labelledby={id + '-title'} aria-describedby={id + '-note'}>
      <title id={id + '-title'}>Number of records by year and research topic</title>
      <desc id={id + '-note'}>The two process and traceability values covered by foreground layers in the reference are left blank.</desc>
      <defs>
        {themes.map(({ fill }, index) => <linearGradient key={fill} id={id + '-fill-' + index} x2="0" y2="1">
          <stop stopColor={fill} stopOpacity=".45" />
          <stop offset="100%" stopColor={fill} stopOpacity=".07" />
        </linearGradient>)}
      </defs>

      <g aria-hidden="true">
        <polygon points={floor.map(point => point.join(',')).join(' ')} fill="#fafafb" stroke="#e2e5e8" strokeWidth=".65" />
        <polyline points={roof.map(point => point.join(',')).join(' ')} fill="none" stroke="#eceeef" strokeWidth=".65" />
        <path d={`M${farCorner}L${floor[3]}`} stroke="#eceeef" strokeWidth=".65" />
        <text x="10" y="11" className="trends-axis-title">Number of Records</text>
      </g>

      {themes.map((theme, index) => ({ theme, index })).reverse().map(({ theme, index }) =>
        <Series key={theme.label} theme={theme} gradient={id + '-fill-' + index} />
      )}

      <g className="trends-axes" aria-hidden="true">
        <path d={`M${plotPoint(0, 20, 0)}L${floor[0]}L${floor[1]}L${floor[2]}`} />
        {Array.from({ length: 11 }, (_, index) => {
          const value = index * 2;
          const [x, y] = plotPoint(0, value, 0);
          return <g key={value}>
            <path d={`M${x - 2.6} ${y}H${x}`} />
            <text x={x - 4} y={y + 1.7} textAnchor="end">{value}</text>
          </g>;
        })}
        {Array.from({ length: yearCount }, (_, index) => {
          const [x, y] = plotPoint(index, 0, 0);
          return <g key={index}>
            <path d={`M${x} ${y}v2.2`} />
            <text x={x} y={y + 8.7} textAnchor="middle">{firstYear + index}{index === yearCount - 1 ? '*' : ''}</text>
          </g>;
        })}
        {themes.map(({ chartLabel, depth }) => {
          const [x, y] = plotPoint(yearCount - 1, 0, depth);
          return <g key={depth}>
            <path d={`M${x} ${y}l3 1`} />
            <text x={x + 7} y={y - 1.5} className="trends-axis-topic">
              {chartLabel.map((line, i) => <tspan key={line} x={x + 7} dy={i ? 7.4 : 0}>{line}</tspan>)}
            </text>
          </g>;
        })}
        <text x="127" y="212" className="trends-axis-title" textAnchor="middle">Year</text>
        <text x="373" y="212" className="trends-axis-title" textAnchor="end">Research Topic</text>
      </g>
    </svg>
    <figcaption>
      <ul className="trends-legend" role="list">
        {themes.map(({ chartLabel, fill }) => <li key={fill} style={{ '--trend-fill': fill }}>
          {chartLabel.join(' ')}
        </li>)}
      </ul>
    </figcaption>
  </figure>;
}

export function PublicationTrends() {
  const { root, top } = useScrollScene();
  return <StudyChapter scene={root} id="publication-trends" title={<>Publication<br />Trends</>}>
    <StudyReveal className="trends-count-mask"><SearchHits top={top} /></StudyReveal>
    <StudyReveal className="trends-figure-mask"><TrendChart /></StudyReveal>
    <StudyReveal className="trends-takeaway-mask">
      <p className="trends-takeaway">
        From retrieval to review: compare how <strong>relevant studies represent information</strong>,
        {' '}<strong>support user actions</strong>, and <strong>handle changing task requirements</strong>.
      </p>
    </StudyReveal>
    <StudyReveal className="trends-sources">
      <h3>Literature Sources</h3>
      <p>
        Records were retrieved through <a href="https://openalex.org" target="_blank" rel="noreferrer">OpenAlex</a> from
        selected journals and conferences in design research, human–computer interaction, visualization, and
        software engineering, including Design Studies, Designing, Design Science, CHI, DRS, UIST, IUI, IEEE TVCG,
        IEEE TSE, and ICSE.
      </p>
    </StudyReveal>
  </StudyChapter>;
}

import React, { useId } from 'react';
import { Layers, RefreshCw, SlidersHorizontal } from 'lucide-react';

function Lines({ x, y, leading, lines, className }) {
  return <text x={x} y={y} className={className}>
    {lines.map((line, index) => <tspan key={line} x={x} dy={index === 0 ? 0 : leading}>{line}</tspan>)}
  </text>;
}

export function ResearchGap({ scene }) {
  const id = useId();
  return <section ref={scene} className="research-gap" id="research-gap" aria-labelledby="research-gap-title"
    data-chapter data-play-surface data-art-covered>
    <div className="research-gap-pin">
      <h2 id="research-gap-title" className="research-gap-accessible" tabIndex={-1}>Research Gap</h2>
      <svg className="research-gap-diagram" viewBox="0 0 390 784" role="img"
        aria-labelledby={id + '-title'} aria-describedby={id + '-description'}>
        <title id={id + '-title'}>Research Gap diagram</title>
        <desc id={id + '-description'}>
          Intervention scope and post-intervention validation intersect. The study asks when interventions are effective,
          how to define the modification scope, and how expected changes correspond to actual changes in subsequent plans and outputs.
        </desc>
        <defs>
          <clipPath id={id + '-scope'}><circle cx="192" cy="296" r="155" /></clipPath>
          <radialGradient id={id + '-intersection'}>
            <stop stopColor="#68cabe" />
            <stop offset="100%" stopColor="#9ce8dc" />
          </radialGradient>
          <linearGradient id={id + '-arrow'} x2="0" y2="1">
            <stop stopColor="#ff815d" stopOpacity="0" />
            <stop offset="85%" stopColor="#ff815d" />
          </linearGradient>
        </defs>

        <g className="research-gap-enter" style={{ '--gap-start': .14 }}>
          <text x="30" y="58" className="research-gap-heading">Research Gap</text>
        </g>
        <g className="research-gap-enter" style={{ '--gap-start': .26 }}>
          <circle cx="192" cy="296" r="155" fill="#dff7ff" fillOpacity=".94" stroke="#39cfff" strokeWidth="2" />
          <circle cx="192" cy="495" r="161" fill="#e7f8e6" fillOpacity=".94" stroke="#75d450" strokeWidth="2" />
          <circle cx="192" cy="495" r="161" clipPath={`url(#${id}-scope)`} fill={`url(#${id}-intersection)`} />
        </g>

        <g className="research-gap-enter research-gap-copy" style={{ '--gap-start': .36 }}>
          <circle cx="192" cy="181" r="22" fill="#92e6f9" />
          <g transform="translate(179 168)"><SlidersHorizontal size={26} strokeWidth={1.9} /></g>
          <text x="192" y="229" className="research-gap-label">Intervention Scope</text>
          <Lines x={95} y={252} leading={16.2} className="research-gap-detail research-gap-left" lines={[
            'Insufficient evidence for when',
            'and under what conditions',
            'interventions are effective,',
            'and the modification scope',
            'is hard to define.',
          ]} />
        </g>
        <g className="research-gap-enter research-gap-copy" style={{ '--gap-start': .46 }}>
          <Lines x={192} y={375} leading={27} className="research-gap-intersection" lines={['Research', 'Intersection']} />
        </g>
        <g className="research-gap-enter research-gap-copy" style={{ '--gap-start': .52 }}>
          <circle cx="192" cy="460" r="20" fill="#b9edab" />
          <g transform="translate(180 448)"><RefreshCw size={24} strokeWidth={2.2} /></g>
          <Lines x={192} y={500} leading={25} className="research-gap-label" lines={[
            'Post-intervention',
            'Validation',
          ]} />
          <Lines x={192} y={547} leading={17} className="research-gap-detail" lines={[
            'Lack of evidence on how expected',
            'changes correspond to actual',
            'changes in subsequent plans',
            'and intermediate outputs.',
          ]} />
        </g>

        <g className="research-gap-enter research-gap-copy" style={{ '--gap-start': .63 }}>
          <path d="M171 627H213Q199 638 198 657H209L192 674 175 657H186Q185 638 171 627Z"
            fill={`url(#${id}-arrow)`} />
          <rect x="13" y="680" width="358" height="90" rx="45" fill="#fff2e1" stroke="#ffd7af" />
          <circle cx="53" cy="711" r="23" fill="#f9dcb5" />
          <g transform="translate(39 697)"><Layers size={28} strokeWidth={1.6} /></g>
          <path d="M89 691V756" stroke="#f6dcc0" />
          <text x="103" y="706" className="research-gap-core research-gap-left">Core Research Gap</text>
          <Lines x={104} y={725} leading={15} className="research-gap-caption research-gap-left" lines={[
            'A systematic understanding and validation',
            'of the intervention range, and how it leads to',
            'actual changes in the design process.',
          ]} />
        </g>
      </svg>
    </div>
    <span className="research-gap-arrival" data-scene-arrival aria-hidden="true" />
    <span className="research-gap-travel" aria-hidden="true" />
    <span className="research-gap-outro" aria-hidden="true" />
  </section>;
}

import React from 'react';
import { useScrollScene } from './scrollScene';

const sourceDiagram = 'https://www.figma.com/design/tWHBzltNkViVr2PJgnZrKf?node-id=307-2';

const copy = {
  zh: {
    title: '对话地图的交互', label: '产品原型', source: '查看完整交互图',
    map: '对话地图', nodes: ['目标', '关键资料', '讨论分支', '阶段结论'], added: '新问答', outdated: '已标记过时',
    steps: [
      ['查看原文', '从地图回到原对话', '点选节点，展开摘要、原文、来源轮次和关联节点。'],
      ['修正内容', '在原节点上标记变化', '修正信息，或标记过时与暂不相关。地图随即更新该节点的状态。'],
      ['继续提问', '把新问答接入地图', '先核对本轮附带的背景，再发送问题。新问答会作为新节点接回地图。'],
    ],
  },
  en: {
    title: 'Working with the conversation map', label: 'Product prototype', source: 'Open the full interaction diagram',
    map: 'Conversation map', nodes: ['Goal', 'Key materials', 'Discussion branch', 'Interim conclusion'], added: 'New exchange', outdated: 'Marked outdated',
    steps: [
      ['Find source', 'Return to the original conversation', 'Select a node to reveal its summary, source message, turn and related nodes.'],
      ['Correct', 'Mark a change on the original node', 'Correct the information or mark it as outdated or irrelevant. The map updates the node’s status.'],
      ['Follow up', 'Connect a new exchange', 'Review the context that will accompany the question. Once sent, the new exchange joins the map as a node.'],
    ],
  },
};

export const prototypeTitle = lang => copy[lang].title;

export function PrototypeSequence({ lang }) {
  const { root, progress, seek } = useScrollScene();
  const current = Math.min(2, Math.floor(progress * 3));
  const ui = copy[lang];
  const [, title, description] = ui.steps[current];
  return <section id="prototype" className="prototype-chapter" data-chapter ref={root} aria-labelledby="prototype-title">
    <div className="prototype-pin">
      <div className="prototype-layout">
        <header className="chapter-title">
          <p className="chapter-kicker">{ui.label}</p>
          <h2 id="prototype-title" tabIndex={-1}>{ui.title}</h2>
          <a className="prototype-source" href={sourceDiagram} target="_blank" rel="noreferrer">{ui.source} ↗</a>
        </header>
        <div className="prototype-example">
          <div className="prototype-steps" role="group" aria-label={ui.label}>
            {ui.steps.map(([label], i) => <button key={i} aria-pressed={current === i} onClick={() => seek((i + .13) / 3)}>{label}</button>)}
          </div>
          <div className="prototype-map" data-step={current}>
            <p className="map-title">{ui.map}</p>
            <ol className="map-nodes">
              {ui.nodes.map((node, i) => <li key={i} className={i === 1 ? 'map-target' : undefined}>
                <span>{node}</span>
                {i === 1 && <small className="map-status" aria-hidden={current !== 1}>{ui.outdated}</small>}
              </li>)}
              <li className="map-new" aria-hidden={current !== 2}>{ui.added}</li>
            </ol>
            <div className="map-detail" key={current}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

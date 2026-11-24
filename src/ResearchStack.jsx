import React from 'react';
import { ease } from './choreography';
import { useScrollScene } from './scrollScene';

const copy = {
  zh: {
    title: ['从一次性回答', '到持续任务'],
    cards: [
      ['初始目标', '一个具体的任务被提出。'],
      ['资料来源', '文献、截图与已有草稿。'],
      ['工作假设', '为了推进而先行的判断。'],
      ['修改意见', '对早期结论的修订与撤销。'],
      ['中间产物', '阶段性结论与半成品。'],
    ],
    task: '当前任务',
    triad: ['保留', '更新', '丢弃'],
    headline: ['信息都在。', '但哪些仍然有效？'],
    body: [
      '随着对话变长，早期要求、临时假设、修改意见与中间产物共同构成任务背景。',
      '信息仍然保存在对话中，但当前应该采用什么、舍弃什么，并不容易判断。长上下文研究提示：信息存在于输入中，不等于模型能在每个位置稳定使用它[2]。',
    ],
    keywords: '关键词',
    tags: ['多轮交互', '任务延续', '条件变化', '历史信息'],
  },
  en: {
    title: ['From one-off answers', 'to ongoing work'],
    cards: [
      ['INITIAL GOAL', 'A concrete task is proposed.'],
      ['SOURCE MATERIAL', 'Papers, screenshots and earlier drafts.'],
      ['WORKING ASSUMPTIONS', 'Provisional choices made to keep moving.'],
      ['REVISION NOTES', 'Amendments and retractions of earlier calls.'],
      ['INTERMEDIATE OUTPUTS', 'Half-finished results and drafts.'],
    ],
    task: 'CURRENT TASK',
    triad: ['KEEP', 'UPDATE', 'DISCARD'],
    headline: ['Information is present.', 'But what still matters?'],
    body: [
      'As a conversation grows, earlier requirements, temporary assumptions, revisions and intermediate outputs all become part of the task context.',
      'Information stays in the conversation, but it is hard to judge what should be retained, updated or left behind. Long-context research suggests that information appearing in the input does not guarantee reliable use at every position [2].',
    ],
    keywords: 'KEYWORDS',
    tags: ['MULTI-TURN INTERACTION', 'TASK CONTINUITY', 'CHANGING CONSTRAINTS', 'HISTORICAL CONTEXT'],
  },
};

// Six scroll steps: the first five stack one task-context layer at a time, the
// sixth replaces the diagram with the question the layers raise.
export function ResearchStack({ id, phase, lang }) {
  const { root, progress, top, bottom } = useScrollScene();
  const text = copy[lang];
  const stepPos = progress * 6;
  const stage = Math.min(5, Math.floor(stepPos));
  const frac = Math.max(0, Math.min(1, stepPos - stage));
  // The caption sweeps through a clipped slot at the start of every step: the
  // incoming line rises in from the bottom edge while the outgoing one leaves
  // through the top, then it holds still for the rest of the step.
  const travel = Math.max(0, Math.min(1, frac / .32));
  const rise = (1 - travel) * 100;
  const leave = -travel * 100;
  const shown = Math.min(4, stage);
  // The closing block climbs out of the bottom edge of the plate once the sixth
  // step starts; nothing fades in at its final position.
  const infoT = Math.max(0, Math.min(1, (stepPos - 4.7) / .6));
  const infoLift = (1 - infoT) * (typeof window === 'undefined' ? 0 : window.innerHeight);
  // Hold the last reading step, then move the whole plate below the viewport
  // during the unpinned tail. The grid begins reforming at the next runway.
  const lift = Math.max(0, Math.min(window.innerHeight, top));
  const titleProgress = ease(.38 * window.innerHeight, 0, top);
  const exit = ease(.70 * window.innerHeight, 0, bottom);

  return <section id={id} className="research-chapter stack-chapter" ref={root}
    data-chapter data-motion={phase} data-stack data-play-surface aria-labelledby={id + '-title'}>
    <div className="stack-pin">
      <div className="stack-plate" style={{'--stack-lift': lift + 'px', '--stack-exit': exit,
        visibility: exit === 1 ? 'hidden' : undefined, pointerEvents: exit > .5 ? 'none' : undefined}}>
        <div className="stack-title-mask" style={{ '--title-progress': titleProgress }}>
          <h2 id={id + '-title'} tabIndex={-1} className="stack-title" data-title-reveal>
            {text.title.map(line => <span key={line}>{line}</span>)}
          </h2>
        </div>
        <div className="stack-body">
          <div className="stack-diagram" data-stage={stage} aria-hidden={stage === 5}
            style={{opacity: 1 - Math.min(1, infoT * 1.5)}}>
            <ol className="stack-cards">
              {text.cards.map(([label, note], i) => <li key={label} className="stack-card"
                data-visible={i <= shown} data-tone={i} style={{'--i': i}}>
                <span className="stack-swatch" aria-hidden="true" />
                <span className="stack-label">{label}</span>
                <span className="stack-lines" aria-hidden="true"><i /><i /></span>
              </li>)}
            </ol>
            <div className="stack-caption-slot">
              {stage > 0 && stage < 5 && travel > 0 && <p className="stack-caption" aria-hidden="true"
                style={{transform: 'translateY(' + leave + '%)'}}>
                {text.cards[Math.min(4, stage - 1)][1]}
              </p>}
              <p className="stack-caption" style={{transform: 'translateY(' + rise + '%)'}}>
                {text.cards[Math.min(4, Math.max(0, stage))][1]}
              </p>
            </div>
            <div className="stack-flow" data-visible={stage >= 4}>
              <span className="stack-stem" aria-hidden="true" />
              <p className="stack-task">{text.task}</p>
              <span className="stack-rail" aria-hidden="true"><i /><i /><i /></span>
              <ul className="stack-triad">
                {text.triad.map((item, i) => <li key={item} data-tone={i}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="stack-info" aria-hidden={stage !== 5}
            style={{transform: 'translateY(' + infoLift + 'px)', pointerEvents: infoT > .5 ? undefined : 'none'}}>
            <p className="stack-headline"><span className="stack-bar" aria-hidden="true" />
              {text.headline[0]}<br />{text.headline[1]}</p>
            {text.body.map(paragraph => <p key={paragraph} className="stack-copy">{paragraph}</p>)}
            <p className="stack-tag-label">{text.keywords}</p>
            <ul className="stack-tags">{text.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

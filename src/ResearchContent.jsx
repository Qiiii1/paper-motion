import React, { Fragment } from 'react';
import { chapterId, count, motion, number } from './research';
import { PrototypeSequence, prototypeTitle } from './PrototypeSequence';
import { ResearchStack } from './ResearchStack';
import { ResearchApproach } from './ResearchApproach';
import { ResearchScope } from './ResearchScope';
import { ResearchExample } from './ResearchExample';
import { ResearchLiterature } from './ResearchLiterature';
import { LiteratureCase } from './LiteratureCase';
import { ResearchPartCover } from './ResearchPartCover';

function Copy({ text }) {
  return text.split(/(\[\d+(?:[–,-]\d+)*\])/g).map((part, index) => {
    const reference = /^\[(\d+)/.exec(part);
    return reference
      ? <a key={index} className="citation" href={'#ref-' + number(reference[1])}>{part}</a>
      : <Fragment key={index}>{part}</Fragment>;
  });
}

function ResearchTable({ rows }) {
  const [header, ...entries] = rows;
  return <table className={'chapter-table columns-' + header.length}>
    <thead><tr>{header.map((item, i) => <th key={i} scope="col">{item}</th>)}</tr></thead>
    <tbody>{entries.map((row, i) => <tr key={i}>
      <th scope="row">{row[0]}</th>
      {row.slice(1).map((cell, j) => <td key={j}>{cell}</td>)}
    </tr>)}</tbody>
  </table>;
}

function Paragraph({ block }) {
  const prefix = /^[^：:。.!?]{1,47}[：:]/.exec(block.text)?.[0];
  const content = prefix
    ? <><strong>{prefix}</strong><Copy text={block.text.slice(prefix.length)} /></>
    : <Copy text={block.text} />;
  if (block.kind === 'sub') return <h3>{content}</h3>;
  if (block.kind === 'quote') return <blockquote>{content}</blockquote>;
  return <p className={block.kind === 'note' ? 'chapter-note' : block.kind === 'lead' ? 'chapter-lead' : undefined}>{content}</p>;
}

const focusCopy = {
  zh: {
    title: '研究定位',
    subtitle: 'AI 时代的设计研究',
    label: '三个相互交织的视角',
    lenses: [
      ['AI 与设计实践', '理解并调整 AI 的参与方式'],
      ['设计知识', '表达并追溯任务关系'],
      ['人的判断', '决定哪些内容应修改、保留和核对'],
    ],
    conclusion: '让任务关系可见、可操作。',
    source: '节点流与节点式 AI 工具研究提供了设计参照 [3–4]。',
  },
  en: {
    title: 'Research Focus',
    subtitle: <>Design Research<br />in the Age of AI</>,
    label: 'Three intersecting lenses',
    lenses: [
      ['AI & Design Practice', 'Understand and adjust AI participation'],
      ['Design Knowledge', 'Express and trace task relationships'],
      ['Human Judgment', 'Choose what to change, preserve, and verify'],
    ],
    conclusion: 'Make task relationships visible and actionable.',
    source: 'Node-flow and node-based AI research offer design references [3–4].',
  },
};

function ResearchFocus({ id, phase, lang }) {
  const text = focusCopy[lang];
  return <section className="research-chapter focus-chapter" id={id}
    data-chapter data-motion={phase} data-focus-scene data-play-surface aria-labelledby={id + '-title'}>
    <div className="focus-pin">
      <header className="focus-header">
        <div className="focus-mask">
          <h2 className="focus-enter" id={id + '-title'} tabIndex={-1}>{text.title}</h2>
        </div>
        <div className="focus-mask focus-subtitle">
          <p className="focus-enter">{text.subtitle}</p>
        </div>
      </header>
      <div className="focus-mask focus-lenses">
        <div className="focus-enter">
          <p className="focus-label" id={id + '-label'}>{text.label}</p>
          <ol aria-labelledby={id + '-label'}>
            {text.lenses.map(([title, copy], i) => <li className="focus-lens" key={title}>
              <span className="focus-number" aria-hidden="true">{number(i + 1)}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>)}
          </ol>
        </div>
      </div>
      <footer className="focus-footer">
        <div className="focus-mask"><p className="focus-enter focus-conclusion">{text.conclusion}</p></div>
        <div className="focus-mask"><p className="focus-enter focus-source"><Copy text={text.source} /></p></div>
      </footer>
    </div>
  </section>;
}

export function OpeningCover({ edition, ui }) {
  const { chapters } = edition;
  return <header className="research-cover" id="opening" data-chapter data-motion={0} data-play-surface>
    <a href={'#' + chapterId(2)} className="skip-link">{ui.skip}</a>
    <div className="cover-type">
      <p className="cover-label">{ui.eyebrow}</p>
      <h1 aria-label={edition.title}>
        {ui.mastTitle.map((line, index) => <span key={line} className={index > 1 ? 'cover-end' : undefined}>{line}</span>)}
      </h1>
      <div className="cover-deck">
        {chapters[0].blocks.map(block => <p key={block.kind}>{block.text}</p>)}
      </div>
    </div>
  </header>;
}

export function ResearchChapters({ edition, ui, lang }) {
  return <>
    {edition.chapters.slice(1).map(({ title, blocks, steps, layout }, index) => {
      const chapter = index + 2;
      if (chapter >= 7 && chapter <= 9) return null;
      const id = chapterId(chapter);
      const phase = motion.get(chapter);
      return <Fragment key={id}>
        {chapter === 3 && <ResearchPartCover part={1} />}
        {chapter === 10 && <ResearchPartCover part={2} />}
        {chapter === 15 && <ResearchPartCover part={3} />}
        {chapter === 20 && <PrototypeSequence lang={lang} />}
        {phase !== undefined && <div className={'motion-runway runway-' + chapter}
          data-art-covered={chapter === 10 ? '' : undefined} data-play-surface aria-hidden="true" />}
        {steps
          ? <ResearchApproach id={id} title={title} steps={steps} phase={phase} />
          : layout === 'stack'
          ? <ResearchStack id={id} phase={phase} lang={lang} />
          : chapter === 4
          ? <ResearchFocus id={id} phase={phase} lang={lang} />
          : chapter === 5
          ? <ResearchScope id={id} phase={phase} lang={lang} title={title} blocks={blocks} />
          : chapter === 6
          ? <ResearchExample id={id} phase={phase}>
            {edition.chapters.slice(5, 9).map(entry => <section key={entry.title}>
              <h4>{entry.title}</h4>
              {entry.blocks.map((block, i) => <Paragraph key={i} block={block} />)}
            </section>)}
          </ResearchExample>
          : chapter === 10
          ? <ResearchLiterature id={id} phase={phase} />
          : chapter >= 11 && chapter <= 13
          ? <LiteratureCase id={id} index={chapter - 11}>
            <details className="literature-details">
              <summary>{chapter === 13 ? 'Study notes and literature comparison' : 'Study notes'}</summary>
              <div className="chapter-copy">
                {blocks.map((block, i) => <Paragraph key={i} block={block} />)}
                {chapter === 13 && edition.chapters[9].blocks.map((block, i) => block.kind === 'table'
                  ? <ResearchTable key={i} rows={block.rows} />
                  : <Paragraph key={i} block={block} />)}
              </div>
            </details>
          </LiteratureCase>
          : <section className="research-chapter" id={id} data-chapter data-motion={phase} aria-labelledby={id + '-title'}>
            {phase !== undefined && <div className={'motion-window window-' + chapter} data-play-surface aria-hidden="true" />}
            <div className="reading-panel">
              <div className="reading-grid">
                <header className="chapter-title">
                  <p className="chapter-kicker">{number(chapter)} / {count}{ui.groups[chapter] && <span>{ui.groups[chapter]}</span>}</p>
                  <h2 id={id + '-title'} tabIndex={-1}>{title}</h2>
                </header>
                <div className="chapter-copy">
                  {blocks.map((block, i) => block.kind === 'table'
                    ? <ResearchTable key={i} rows={block.rows} />
                    : <Paragraph key={i} block={block} />)}
                </div>
              </div>
            </div>
          </section>}
      </Fragment>;
    })}
    <section className="research-chapter reference-chapter" id="references" data-chapter aria-labelledby="references-title">
      <div className="reading-panel">
        <div className="reading-grid">
          <header className="chapter-title">
            <p className="chapter-kicker">01–16</p>
            <h2 id="references-title" tabIndex={-1}>{edition.references.title}</h2>
          </header>
          <div className="chapter-copy">
            {edition.references.blocks.map((block, i) => {
              if (block.kind !== 'ref') return <Paragraph key={i} block={block} />;
              const [, index, citation] = /^\[(\d+)\] (.+)$/.exec(block.citation);
              return <article className="reference-entry" id={'ref-' + number(index)} key={index}>
                <p><span className="reference-number">[{index}]</span> {citation}</p>
                {block.translation && <p className="reference-meta">{block.translation}</p>}
                <a href={block.url} target="_blank" rel="noreferrer">{block.url}</a>
                {block.extra && <p className="reference-meta">{block.extra}</p>}
              </article>;
            })}
            <a className="return-link" href="#opening">↑ {ui.back}</a>
          </div>
        </div>
      </div>
    </section>
  </>;
}

export function ResearchNavigation({ edition, ui, lang, switchLanguage, playback }) {
  const { active, playing, step, jump } = playback;
  return <nav className="research-nav" aria-label={ui.navigation}>
    <button className="language-switch" onClick={switchLanguage} aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文版'} lang={lang === 'zh' ? 'en' : 'zh-CN'}>{lang === 'zh' ? 'EN' : '中文'}</button>
    <label className="chapter-picker">
      <span aria-hidden="true">{ui.contents} <span>⌄</span></span>
      <select aria-label={ui.contents} value={active} onChange={event => jump(event.target.value)}>
        {edition.chapters.map(({ title }, i) => <Fragment key={i}>
          {i === 19 && <option value="prototype">{prototypeTitle(lang)}</option>}
          <option value={chapterId(i + 1)}>{number(i + 1)} {title}</option>
        </Fragment>)}
        <option value="references">{ui.references}</option>
      </select>
    </label>
    <div className="chapter-steps">
      {active !== 'opening' && <button data-playback aria-label={ui.previous} aria-disabled={playing} onClick={() => step(-1)}>←</button>}
      {active !== 'references' && <button data-playback className="next-chapter" aria-disabled={playing} onClick={() => step(1)}>
        {active === 'opening' ? ui.start : ui.next} <span aria-hidden="true">→</span>
      </button>}
    </div>
  </nav>;
}

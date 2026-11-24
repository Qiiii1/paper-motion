import React from 'react';
import { edition } from './research';

const sources = new Map(edition.references.blocks.filter(block => block.kind === 'ref').map(block => [
  /^\[(\d+)\]/.exec(block.citation)[1],
  block.url,
]));

function SourceLink({ number, children }) {
  const url = sources.get(number);
  return url ? <a className="citation" href={url} target="_blank" rel="noreferrer">{children}</a> : children;
}

export function Citation({ children }) {
  const parts = children.split(/(\d+)/);
  if (parts.length === 3) return <SourceLink number={parts[1]}>{children}</SourceLink>;
  return <>{parts.map((part, index) => index % 2 === 1
    ? <SourceLink key={index} number={part}>{part}</SourceLink>
    : part)}</>;
}

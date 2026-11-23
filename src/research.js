import en from './research.en.json';
import { openingScreens, presetStop } from './presets';

export const edition = en;

export const messages = {
  eyebrow: 'Design research', contents: 'Chapters', navigation: 'Chapter navigation',
  previous: 'Previous chapter', next: 'Next chapter', start: 'Start reading',
  references: 'References', back: 'Back to the opening', skip: 'Skip to the research overview',
  groups: { 2: 'Background and scope', 6: 'Changing conditions and verification', 10: 'Related work', 15: 'Comparison and research gaps', 20: 'Research questions and design', 25: 'Evaluation and contributions' },
  mastTitle: ['Visualizing Context', 'and Correcting', 'Deviations in Long', 'AI Conversations'],
};

export const count = edition.chapters.length;
export const number = index => String(index).padStart(2, '0');
export const chapterId = chapter => chapter === 1 ? 'opening' : 'chapter-' + number(chapter);

// The original three formations and seven presets lead into relevant sections of the research.
const presetChapters = [5, 6, 10, 15, 20, 25, 28];
export const motion = new Map([[1, 0], [2, .30], [3, .64], [4, 1],
  ...presetChapters.map((chapter, i) => [chapter, 1 + presetStop(i) / openingScreens])]);

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const pageY = element => element.getBoundingClientRect().top + window.scrollY;

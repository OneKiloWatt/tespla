import type { Subject, SubjectId } from './types';

/**
 * 中学校で習う標準教科（デフォルト）。
 * ユーザーは自分で科目を追加できるが、追加分は別途データソースで管理する想定。
 */
export const SUBJECTS: Subject[] = [
  { id: 'jp',    label: '国語',     color: 'var(--color-subj-jp)' },
  { id: 'math',  label: '数学',     color: 'var(--color-subj-math)' },
  { id: 'en',    label: '英語',     color: 'var(--color-subj-en)' },
  { id: 'sci',   label: '理科',     color: 'var(--color-subj-sci)' },
  { id: 'soc',   label: '社会',     color: 'var(--color-subj-soc)' },
  { id: 'music', label: '音楽',     color: 'var(--color-subj-music)' },
  { id: 'art',   label: '美術',     color: 'var(--color-subj-art)' },
  { id: 'pe',    label: '保健体育', color: 'var(--color-subj-pe)' },
  { id: 'tech',  label: '技術',     color: 'var(--color-subj-tech)' },
  { id: 'home',  label: '家庭',     color: 'var(--color-subj-home)' },
];

const SUBJECTS_MAP: Record<string, Subject> = Object.fromEntries(
  SUBJECTS.map(s => [s.id, s])
);

export function subjectById(id: SubjectId | string): Subject {
  return SUBJECTS_MAP[id] ?? { id, label: id, color: '#888' };
}

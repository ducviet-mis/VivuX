'use client';

import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type AdminLessonOption = {
  id: string;
  grade: number;
  chapter: string;
  title: string;
  chapter_sort_order?: number | null;
  sort_order?: number | null;
};

type Props = {
  lessons: AdminLessonOption[];
  value: string;
  onChange: (id: string) => void;
  idPrefix: string;
};

const chapterName = (lesson: AdminLessonOption) => lesson.chapter?.trim() || 'Chưa phân chương';

export function AdminLessonPicker({ lessons, value, onChange, idPrefix }: Props) {
  const [grade, setGrade] = useState('');
  const [chapter, setChapter] = useState('');

  useEffect(() => {
    const selected = lessons.find((lesson) => lesson.id === value);
    if (selected) {
      setGrade(String(selected.grade));
      setChapter(chapterName(selected));
    }
  }, [lessons, value]);

  const grades = useMemo(() => Array.from(new Set(lessons.map((lesson) => lesson.grade))).sort((a, b) => a - b), [lessons]);
  const chapters = useMemo(() => {
    const byName = new Map<string, number>();
    lessons.filter((lesson) => String(lesson.grade) === grade).forEach((lesson) => {
      const name = chapterName(lesson);
      const order = lesson.chapter_sort_order ?? Number.MAX_SAFE_INTEGER;
      byName.set(name, Math.min(byName.get(name) ?? Number.MAX_SAFE_INTEGER, order));
    });
    return Array.from(byName.entries()).sort(([nameA, orderA], [nameB, orderB]) => orderA - orderB || nameA.localeCompare(nameB, 'vi'));
  }, [grade, lessons]);
  const chapterLessons = useMemo(() => lessons
    .filter((lesson) => String(lesson.grade) === grade && chapterName(lesson) === chapter)
    .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title, 'vi')),
  [chapter, grade, lessons]);

  return (
    <div className="grid gap-4 sm:grid-cols-3" aria-label="Chọn lớp, chương và bài học">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-grade`}>Lớp</Label>
        <Select value={grade} onValueChange={(next) => { setGrade(next); setChapter(''); onChange(''); }}>
          <SelectTrigger id={`${idPrefix}-grade`} className="h-11 bg-surface"><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
          <SelectContent>{grades.map((item) => <SelectItem key={item} value={String(item)}>Lớp {item}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-chapter`}>Chương</Label>
        <Select value={chapter} onValueChange={(next) => { setChapter(next); onChange(''); }} disabled={!grade || chapters.length === 0}>
          <SelectTrigger id={`${idPrefix}-chapter`} className="h-11 bg-surface"><SelectValue placeholder={grade ? 'Chọn chương' : 'Chọn lớp trước'} /></SelectTrigger>
          <SelectContent>{chapters.map(([name]) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-lesson`}>Bài</Label>
        <Select value={value} onValueChange={onChange} disabled={!chapter || chapterLessons.length === 0}>
          <SelectTrigger id={`${idPrefix}-lesson`} className="h-11 bg-surface"><SelectValue placeholder={chapter ? 'Chọn bài học' : 'Chọn chương trước'} /></SelectTrigger>
          <SelectContent>{chapterLessons.map((lesson) => <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';
import { ReadingGuide } from '@/components/shared/reading-guide';
import { TheoryContent } from './theory-content';
import styles from './theory-reader.module.css';

const STORAGE_KEY = 'flydo.theory.reader.v1';
type Preferences = { theme: 'light' | 'paper' | 'dark'; size: 'small' | 'default' | 'large'; spacing: 'normal' | 'relaxed' };
const DEFAULTS: Preferences = { theme: 'dark', size: 'default', spacing: 'relaxed' };

export function TheoryReader({ title, summary, chapter, grade, content }: {
  title: string; summary: string; chapter: string; grade: number; content: string;
}) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();
  const bodyId = useId().replace(/:/g, '') + '-theory-body';

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        setPreferences({
          theme: ['light', 'paper', 'dark'].includes(saved.theme) ? saved.theme : DEFAULTS.theme,
          size: ['small', 'default', 'large'].includes(saved.size) ? saved.size : DEFAULTS.size,
          spacing: ['normal', 'relaxed'].includes(saved.spacing) ? saved.spacing : DEFAULTS.spacing,
        });
      } else setPreferences((value) => ({ ...value, theme: resolvedTheme === 'light' ? 'light' : 'dark' }));
    } catch { /* Reading remains usable when browser storage is unavailable. */ }
    setReady(true);
  }, [resolvedTheme]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Session-only preference. */ }
  }

  return (
    <div className="study-reading-layout">
    <ReadingGuide targetId={bodyId} contentKey={content} />
    <article className={styles.reader} data-theme={preferences.theme} data-size={preferences.size} data-spacing={preferences.spacing} aria-label="Nội dung lý thuyết">
      <div className={styles.column}>
        <div className={styles.toolbar}>
          <span className={styles.eyebrow}>Lớp {grade} · {chapter}</span>
          <details className={styles.settings} onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}>
            <summary aria-label="Tùy chỉnh cách đọc">Aa</summary>
            <div className={styles.panel}>
              <p className={styles.panelTitle}>Tùy chỉnh cách đọc</p>
              <fieldset disabled={!ready}><legend>Giao diện</legend><div className={styles.choices}>
                {([{ value: 'light', label: 'Sáng dịu' }, { value: 'paper', label: 'Giấy ngà' }, { value: 'dark', label: 'Tối dịu' }] as const).map(({ value, label }) => <button key={value} type="button" aria-pressed={preferences.theme === value} onClick={() => update('theme', value)}>{label}</button>)}
              </div></fieldset>
              <fieldset disabled={!ready}><legend>Cỡ chữ</legend><div className={styles.choices}>
                {([{ value: 'small', label: 'Nhỏ' }, { value: 'default', label: 'Mặc định' }, { value: 'large', label: 'Lớn' }] as const).map(({ value, label }) => <button key={value} type="button" aria-pressed={preferences.size === value} onClick={() => update('size', value)}>{label}</button>)}
              </div></fieldset>
              <fieldset disabled={!ready}><legend>Khoảng cách dòng</legend><div className={styles.choices}>
                {([{ value: 'normal', label: 'Vừa' }, { value: 'relaxed', label: 'Thoáng' }] as const).map(({ value, label }) => <button key={value} type="button" aria-pressed={preferences.spacing === value} onClick={() => update('spacing', value)}>{label}</button>)}
              </div></fieldset>
              <p className={styles.hint}>Tự lưu trên trình duyệt này. Chỉ áp dụng cho vùng đọc.</p>
            </div>
          </details>
        </div>
        <header className={styles.header}>
          <h1>{title}</h1>
          {summary && <p>{summary}</p>}
        </header>
        <div id={bodyId} className={styles.body}><TheoryContent html={content} className="theory-prose" /></div>
      </div>
    </article>
    </div>
  );
}

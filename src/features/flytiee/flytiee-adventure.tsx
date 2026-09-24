'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, Check, CheckCircle2, ChevronDown, CircleHelp, LockKeyhole, RotateCcw, Sparkles, Star, X } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { MathRenderer, formatOptionMath } from '@/features/practice/components/math-renderer';
import { GeometryDiagram } from '@/features/geometry/components/geometry-diagram';
import type { GeometryDiagram as GeometryDiagramData } from '@/features/geometry/types';
import { FlytieeBird } from './flytiee-bird';
import { FlytieeCoin } from './flytiee-coin';
import { ChestArt } from './flytiee-chest-art';
import type { FlytieeChestTier } from './types';
import type { useFlytiee } from './use-flytiee';
import styles from './flytiee-adventure.module.css';

type Controller = ReturnType<typeof useFlytiee>;
type Level = 1 | 2 | 3;
type CatalogLesson = { id: string; grade: number; chapter: string; title: string; question_count: number };
type AdventureAnswer = { question_id: string; selected: number; correct: boolean; correct_answer: number; solution: string };
type AdventureRun = {
  id: string;
  play_date: string;
  level: Level;
  lesson_id: string;
  question_ids: string[];
  answers: AdventureAnswer[];
  status: 'active' | 'failed' | 'won' | 'claimed';
  reward_kind: 'coins' | 'chest' | null;
  reward_amount: number | null;
  reward_chest_tier: FlytieeChestTier | null;
  reward_index: number | null;
};
type BankQuestion = { id: string; content: string; options: string[]; diagram: GeometryDiagramData | null };
type Prize = { label: string; chance: number; tone: string; coins?: number; chest?: FlytieeChestTier };

const DOORS: Record<Level, { name: string; subtitle: string; note: string; symbol: string }> = {
  1: { name: 'Vườn Mây', subtitle: 'Khởi đầu êm ái', note: 'Level 1 · Nhận biết', symbol: '✦' },
  2: { name: 'Thư viện Trăng', subtitle: 'Một chút thử thách', note: 'Level 2 · Thông hiểu', symbol: '☾' },
  3: { name: 'Đỉnh Sao', subtitle: 'Tỏa sáng thật rực rỡ', note: 'Level 3 · Vận dụng', symbol: '✧' },
};

const PRIZES: Record<Level, Prize[]> = {
  1: [
    { label: '10 xu', chance: 40, tone: '#92e0e6', coins: 10 },
    { label: '15 xu', chance: 35, tone: '#8c9dff', coins: 15 },
    { label: '20 xu', chance: 20, tone: '#f8ce80', coins: 20 },
    { label: 'Rương đồng', chance: 5, tone: '#d6a27a', chest: 'bronze' },
  ],
  2: [
    { label: '15 xu', chance: 35, tone: '#b6adf7', coins: 15 },
    { label: '25 xu', chance: 30, tone: '#87d5e7', coins: 25 },
    { label: '35 xu', chance: 20, tone: '#f9d68d', coins: 35 },
    { label: 'Rương đồng', chance: 12, tone: '#d6a27a', chest: 'bronze' },
    { label: 'Rương bạc', chance: 3, tone: '#d6e9ff', chest: 'silver' },
  ],
  3: [
    { label: '20 xu', chance: 30, tone: '#8ddfe6', coins: 20 },
    { label: '30 xu', chance: 30, tone: '#a5a3ff', coins: 30 },
    { label: '45 xu', chance: 20, tone: '#f7ca75', coins: 45 },
    { label: 'Rương đồng', chance: 12, tone: '#d6a27a', chest: 'bronze' },
    { label: 'Rương bạc', chance: 7, tone: '#d6e9ff', chest: 'silver' },
    { label: 'Rương vàng', chance: 1, tone: '#ffe7a1', chest: 'gold' },
  ],
};

function vietnamDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function GateArt({ level }: { level: Level }) {
  const id = `flytiee-gate-${level}`;
  return (
    <svg className={styles.gateArt} viewBox="0 0 300 300" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-frame`} x1="40" y1="26" x2="260" y2="268" gradientUnits="userSpaceOnUse">
          <stop stopColor={level === 1 ? '#cef9f0' : level === 2 ? '#dcd6ff' : '#ffe6a6'} />
          <stop offset=".47" stopColor={level === 1 ? '#78cbdd' : level === 2 ? '#9b9af1' : '#d6aeef'} />
          <stop offset="1" stopColor={level === 1 ? '#4c75a7' : level === 2 ? '#675ca7' : '#b782db'} />
        </linearGradient>
        <linearGradient id={`${id}-inside`} x1="150" y1="52" x2="150" y2="255" gradientUnits="userSpaceOnUse">
          <stop stopColor={level === 1 ? '#2a789d' : level === 2 ? '#565995' : '#535495'} />
          <stop offset="1" stopColor={level === 1 ? '#14264e' : level === 2 ? '#1c2450' : '#211c51'} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}><stop stopColor={level === 1 ? '#b9faff' : level === 2 ? '#dad1ff' : '#ffe0a1'} stopOpacity=".92" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="150" cy="266" rx="112" ry="17" fill="#071535" opacity=".3" />
      <path d="M32 251V132C32 66 84 24 150 24s118 42 118 108v119H32Z" fill={`url(#${id}-frame)`} stroke="#fff" strokeOpacity=".58" strokeWidth="2" />
      <path d="M47 248V133c0-57 45-95 103-95s103 38 103 95v115H47Z" fill="#2c386f" stroke="#fff" strokeOpacity=".32" strokeWidth="2" />
      <path d="M62 246V135c0-49 37-81 88-81s88 32 88 81v111H62Z" fill={`url(#${id}-inside)`} stroke="#dceaff" strokeOpacity=".44" strokeWidth="2" />
      <ellipse cx="150" cy="149" rx="90" ry="100" fill={`url(#${id}-glow)`} opacity=".6" />
      <path d="M65 245h170" stroke="#f9f4ff" strokeOpacity=".72" strokeWidth="5" strokeLinecap="round" />
      <path d="M39 256h222M65 267h170" stroke="#d8d7ff" strokeOpacity=".68" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 216c22-15 44-20 70-20s48 5 70 20" stroke="#fff" strokeOpacity=".18" strokeWidth="2" />
      <path d="M150 68v133" stroke="#f0efff" strokeOpacity=".24" strokeWidth="2" />
      <circle cx="150" cy="137" r="48" fill="#fff" fillOpacity=".08" stroke="#fff" strokeOpacity=".46" />
      <circle cx="150" cy="137" r="34" stroke="#fff" strokeOpacity=".28" strokeDasharray="3 6" />
      <text x="150" y="155" textAnchor="middle" fontFamily="Georgia, serif" fontSize="54" fill="#fff" opacity=".94">{DOORS[level].symbol}</text>
      <circle cx="222" cy="180" r="6" fill="#fff4cc" stroke="#fff" strokeWidth="2" />
      <path d="M38 193h18M244 193h18M71 84l-10-9M229 84l10-9" stroke="#fff" strokeOpacity=".65" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 58v16m-8-8h16M263 77v13m-7-6h14M217 18v12m-6-6h12" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="62" cy="34" r="3" fill="#fff" /><circle cx="256" cy="35" r="2" fill="#fff" />
    </svg>
  );
}

function prizeGradient(prizes: Prize[]) {
  const sliceDegrees = 360 / prizes.length;
  const stops = prizes.map((prize, index) =>
    `${prize.tone} ${index * sliceDegrees}deg ${(index + 1) * sliceDegrees}deg`,
  );
  return `conic-gradient(${stops.join(', ')})`;
}

function prizeCenter(prizes: Prize[], index: number) {
  return (index + 0.5) * (360 / prizes.length);
}

export function FlytieeAdventure({ flytiee }: { flytiee: Controller }) {
  const user = useAuthStore((state) => state.user);
  const [level, setLevel] = useState<Level>(1);
  const [catalog, setCatalog] = useState<CatalogLesson[]>([]);
  const [lessonId, setLessonId] = useState('');
  const [run, setRun] = useState<AdventureRun | null>(null);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');
  const [currentDay, setCurrentDay] = useState(vietnamDate);
  const spinTimer = useRef<number | null>(null);
  const doorTimer = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDay(vietnamDate()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const loadQuestions = useCallback(async (next: AdventureRun) => {
    const { data, error: loadError } = await getSupabaseClient()
      .from('practice_questions').select('id, content, options, diagram').in('id', next.question_ids);
    if (loadError) throw loadError;
    const map = new Map((data ?? []).map((question: BankQuestion) => [question.id, question]));
    const ordered = next.question_ids.map((id) => map.get(id)).filter((question): question is BankQuestion => Boolean(question));
    if (ordered.length !== 5) throw new Error('Một câu hỏi trong lượt này đã được thay đổi. Vui lòng liên hệ hỗ trợ.');
    setQuestions(ordered);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    const load = async () => {
      setLoading(true);
      const { data, error: loadError } = await getSupabaseClient()
        .from('flytiee_adventure_runs').select('*').eq('user_id', user.id).eq('play_date', currentDay).maybeSingle();
      if (!alive) return;
      if (loadError) {
        setError(loadError.code === '42P01' || loadError.code === 'PGRST205'
          ? 'Kỳ thú chưa được kích hoạt. Chủ web cần chạy tệp flytiee-adventure.sql trên Supabase.'
          : loadError.message);
      } else if (data) {
        setError('');
        const next = data as AdventureRun;
        setRun(next);
        setLevel(next.level);
        setViewIndex(Math.min(next.answers.length, 4));
        setShowSummary(next.status !== 'active');
        try { await loadQuestions(next); } catch (loadQuestionError) { if (alive) setError((loadQuestionError as Error).message); }
        if (next.status === 'claimed') void flytiee.reloadProfile();
      } else {
        setError('');
        setRun(null);
        setQuestions([]);
        setViewIndex(0);
        setShowSummary(false);
      }
      if (alive) setLoading(false);
    };
    void load();
    return () => {
      alive = false;
      if (spinTimer.current) window.clearTimeout(spinTimer.current);
      if (doorTimer.current) window.clearTimeout(doorTimer.current);
    };
  // Load once for this user's visit. Other changes are handled by RPC responses.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentDay, loadQuestions]);

  useEffect(() => {
    if (run) return;
    let alive = true;
    setCatalogLoading(true);
    setLessonId('');
    const load = async () => {
      const { data, error: catalogError } = await getSupabaseClient().rpc('flytiee_adventure_catalog', { p_level: level });
      if (!alive) return;
      if (catalogError) setError(catalogError.code === 'PGRST202'
        ? 'Kỳ thú chưa được kích hoạt. Chủ web cần chạy tệp flytiee-adventure.sql trên Supabase.'
        : catalogError.message);
      else { setCatalog((data ?? []) as CatalogLesson[]); setError(''); }
      setCatalogLoading(false);
    };
    void load();
    return () => { alive = false; };
  }, [level, run]);

  const grouped = useMemo(() => {
    const map = new Map<number, Map<string, CatalogLesson[]>>();
    for (const item of catalog) {
      if (!map.has(item.grade)) map.set(item.grade, new Map());
      const chapters = map.get(item.grade)!;
      if (!chapters.has(item.chapter)) chapters.set(item.chapter, []);
      chapters.get(item.chapter)!.push(item);
    }
    return map;
  }, [catalog]);

  const selectedLesson = catalog.find((lesson) => lesson.id === lessonId);
  const current = questions[viewIndex];
  const answer = run?.answers[viewIndex];
  const prizes = PRIZES[run?.level ?? level];

  const begin = async () => {
    if (!lessonId || busy) return;
    setBusy(true);
    setError('');
    const { data, error: beginError } = await getSupabaseClient().rpc('flytiee_adventure_start', { p_level: level, p_lesson_id: lessonId });
    if (beginError) {
      setError(beginError.message);
      setBusy(false);
    } else {
      const next = data as AdventureRun;
      setOpening(true);
      try { await loadQuestions(next); } catch (loadError) { setError((loadError as Error).message); }
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      doorTimer.current = window.setTimeout(() => {
        setRun(next);
        setViewIndex(Math.min(next.answers.length, 4));
        setShowSummary(next.status !== 'active');
        setOpening(false);
        setBusy(false);
        doorTimer.current = null;
      }, reducedMotion ? 0 : 520);
    }
  };

  const chooseAnswer = async (selected: number) => {
    if (!run || answer || busy) return;
    setBusy(true);
    setError('');
    const { data, error: answerError } = await getSupabaseClient().rpc('flytiee_adventure_answer', { p_selected: selected });
    if (answerError) setError(answerError.message);
    else setRun(data as AdventureRun);
    setBusy(false);
  };

  const goNext = () => {
    if (viewIndex < 4) setViewIndex((index) => index + 1);
    else setShowSummary(true);
  };

  const spin = async () => {
    if (!run || run.status !== 'won' || busy) return;
    setBusy(true);
    setError('');
    const { data, error: spinError } = await getSupabaseClient().rpc('flytiee_adventure_spin');
    if (spinError) { setError(spinError.message); setBusy(false); return; }
    const next = data as AdventureRun;
    setRun(next);
    void flytiee.reloadProfile();
    setBusy(false);
    const target = 360 * 6 + (360 - prizeCenter(PRIZES[next.level], next.reward_index ?? 0));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRotation(target);
      return;
    }
    setSpinning(true);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setRotation(target)));
    spinTimer.current = window.setTimeout(() => { setSpinning(false); spinTimer.current = null; }, 4500);
  };

  const completed = Boolean(run && run.status !== 'active' && showSummary);
  const rewardLabel = run?.reward_kind === 'coins' ? `${run.reward_amount} xu`
    : run?.reward_chest_tier === 'gold' ? 'Rương vàng'
      : run?.reward_chest_tier === 'silver' ? 'Rương bạc' : 'Rương đồng';

  return (
    <div className={styles.world}>
      <section className={styles.hero} aria-labelledby="adventure-title">
        <div className={styles.heroStars} aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}><Sparkles size={16} aria-hidden="true" /> Mỗi ngày một chuyến đi</span>
          <h2 id="adventure-title">Kỳ thú cùng FlyTiee</h2>
          <p>Ba cánh cửa. Năm câu hỏi. Một khoảnh khắc bất ngờ dành cho bạn.</p>
          <div className={styles.heroMeta}>
            <span><Star size={15} aria-hidden="true" /> 1 lượt mỗi ngày</span>
            <span><CheckCircle2 size={15} aria-hidden="true" /> Đúng 5/5 để quay</span>
          </div>
        </div>
        <div className={styles.heroBird} aria-hidden="true"><FlytieeBird mood="happy" profile={flytiee.profile} /></div>
      </section>

      {error && <div className={styles.error} role="alert"><CircleHelp size={18} aria-hidden="true" />{error}</div>}

      {loading ? <div className={styles.loading} role="status"><span className={styles.loadingOrb} />Đang mở bản đồ Kỳ thú…</div> : !run ? (
        <>
          <div className={styles.sectionHeading}>
            <div><span className={styles.step}>01 / CHỌN CÁNH CỬA</span><h3>Bạn muốn khám phá nơi nào?</h3></div>
            <span className={styles.todayPill}>Lượt hôm nay còn sẵn</span>
          </div>
          <div className={styles.doorGrid} role="group" aria-label="Chọn độ khó Kỳ thú">
            {([1, 2, 3] as Level[]).map((item) => (
              <button key={item} type="button" className={styles.doorCard} data-level={item} data-selected={level === item} data-opening={opening && level === item} disabled={busy} onClick={() => setLevel(item)} aria-pressed={level === item}>
                <span className={styles.doorGlow} aria-hidden="true" />
                <span className={styles.doorNumber}>CỬA 0{item}</span>
                <GateArt level={item} />
                <span className={styles.doorName}>{DOORS[item].name}</span>
                <span className={styles.doorSubtitle}>{DOORS[item].subtitle}</span>
                <span className={styles.doorLevel}>{DOORS[item].note}</span>
                <span className={styles.doorReward}>{item === 3 ? 'Có cơ hội nhận rương vàng' : item === 2 ? 'Có cơ hội nhận rương bạc' : 'Có cơ hội nhận rương đồng'}</span>
              </button>
            ))}
          </div>

          <section className={styles.preparation} aria-labelledby="adventure-lesson-title">
            <div className={styles.preparationHead}>
              <div><span className={styles.step}>02 / CHỌN BÀI HỌC</span><h3 id="adventure-lesson-title">Bài nào sẽ dẫn lối hôm nay?</h3><p>Chỉ hiện bài Tự luyện có ít nhất 5 câu Level {level} hợp lệ.</p></div>
              <span className={styles.selectedDoor}><Sparkles size={16} aria-hidden="true" />{DOORS[level].name}</span>
            </div>
            <label className={styles.lessonLabel} htmlFor="flytiee-adventure-lesson">Bài học Tự luyện</label>
            <div className={styles.selectWrap}>
              <select id="flytiee-adventure-lesson" value={lessonId} disabled={busy || catalogLoading || catalog.length === 0} onChange={(event) => setLessonId(event.target.value)}>
                <option value="">{catalogLoading ? 'Đang tìm bài học…' : catalog.length ? 'Chọn lớp, chương và bài học' : 'Chưa có bài đủ 5 câu ở Level này'}</option>
                {Array.from(grouped.entries()).map(([grade, chapters]) => Array.from(chapters.entries()).map(([chapter, lessons]) => (
                  <optgroup key={`${grade}-${chapter}`} label={`Lớp ${grade} · ${chapter}`}>
                    {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title} · {lesson.question_count} câu</option>)}
                  </optgroup>
                )))}
              </select>
              <ChevronDown size={18} aria-hidden="true" />
            </div>
            {selectedLesson && <p className={styles.lessonSummary}><Check size={16} aria-hidden="true" />Lớp {selectedLesson.grade} · {selectedLesson.chapter} · {selectedLesson.question_count} câu để bốc ngẫu nhiên</p>}
            <div className={styles.previewRewards}>
              <span>Quà trong vòng quay {DOORS[level].name}</span>
              <div>{PRIZES[level].map((prize) => <span key={prize.label} title={`Tỉ lệ ${prize.chance}%`}>{prize.coins ? <FlytieeCoin /> : <Star size={16} aria-hidden="true" />}{prize.label}<b>{prize.chance}%</b></span>)}</div>
            </div>
            <div className={styles.preparationBottom}>
              <p><LockKeyhole size={16} aria-hidden="true" />Lượt chỉ được dùng khi bạn bấm Bắt đầu. Sai một câu sẽ không mở vòng quay hôm nay.</p>
              <button type="button" className={styles.primaryButton} disabled={!lessonId || busy} onClick={() => void begin()}>{busy ? 'Đang mở cửa…' : 'Bắt đầu chuyến đi'}<ArrowRight size={18} aria-hidden="true" /></button>
            </div>
          </section>
        </>
      ) : !completed && current ? (
        <section className={styles.challenge} data-level={run.level} aria-labelledby="adventure-question-title">
          <div className={styles.challengeTop}>
            <div><span className={styles.step}>ĐANG KHÁM PHÁ · {DOORS[run.level].name.toUpperCase()}</span><h3 id="adventure-question-title">Câu hỏi {viewIndex + 1} / 5</h3></div>
            <span className={styles.scorePill}><Star size={16} aria-hidden="true" />{run.answers.filter((item) => item.correct).length}/5 chính xác</span>
          </div>
          <div className={styles.progressTrack} aria-label={`Đã trả lời ${run.answers.length} trên 5 câu`}>
            {Array.from({ length: 5 }, (_, index) => <span key={index} data-state={run.answers[index] ? run.answers[index].correct ? 'correct' : 'wrong' : index === viewIndex ? 'current' : 'waiting'}>{run.answers[index] ? run.answers[index].correct ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" /> : index + 1}</span>)}
          </div>
          <div className={styles.questionBody}>
            <div className={styles.questionText}><MathRenderer content={current.content} /></div>
            <GeometryDiagram data={current.diagram ?? undefined} />
            <div className={styles.options}>
              {current.options.map((option, index) => (
                <button key={index} type="button" className={styles.option} data-state={answer ? index === answer.correct_answer ? 'correct' : index === answer.selected ? 'wrong' : 'dim' : 'idle'} disabled={Boolean(answer) || busy} onClick={() => void chooseAnswer(index)} aria-pressed={answer?.selected === index}>
                  <span className={styles.optionLetter}>{'ABCD'[index] ?? index + 1}</span>
                  <span className={styles.optionText}><MathRenderer content={formatOptionMath(option)} /></span>
                  {answer && index === answer.correct_answer && <CheckCircle2 size={20} aria-label="Đáp án đúng" />}
                </button>
              ))}
            </div>
            {answer && <div className={styles.feedback} data-correct={answer.correct} role="status">
              <div className={styles.feedbackTitle}>{answer.correct ? 'Chính xác! Một ngôi sao đã sáng lên.' : 'Chưa đúng rồi. Cùng FlyTiee xem lại nhé.'}</div>
              {!answer.correct && <p>Đáp án đúng: {'ABCD'[answer.correct_answer]}</p>}
              {answer.solution && <div className={styles.solution}><MathRenderer content={answer.solution} variant="solution" /></div>}
              <button type="button" className={styles.nextButton} onClick={goNext}>{viewIndex === 4 ? 'Xem kết quả' : 'Đến câu tiếp theo'}<ArrowRight size={17} aria-hidden="true" /></button>
            </div>}
            {!answer && <p className={styles.questionHint}>{busy ? 'Đang ghi nhận câu trả lời…' : 'Chọn một đáp án để xem kết quả ngay.'}</p>}
          </div>
        </section>
      ) : !completed ? <div className={styles.loading} role="status"><span>Chưa tải được bộ câu hỏi của lượt chơi.</span><button type="button" className={styles.nextButton} onClick={() => void loadQuestions(run).catch((loadError: Error) => setError(loadError.message))}>Thử tải lại</button></div> : run.status === 'failed' ? (
        <section className={styles.finalPanel} data-result="failed">
          <div className={styles.finalSymbol}><RotateCcw size={38} aria-hidden="true" /></div>
          <span className={styles.step}>CHUYẾN ĐI HÔM NAY</span>
          <h3>Hôm nay mình đã đi rất xa!</h3>
          <p>Bạn đúng {run.answers.filter((item) => item.correct).length}/5 câu. Cửa vòng quay chỉ mở khi đúng cả 5, nhưng những gì học được vẫn ở lại với bạn.</p>
          <div className={styles.finalNote}>Một lượt Kỳ thú mới sẽ đến vào 00:00 ngày mai (giờ Việt Nam).</div>
        </section>
      ) : (
        <section className={styles.wheelScene} data-level={run.level} aria-labelledby="adventure-wheel-title">
          <div className={styles.wheelHeading}>
            <span className={styles.step}>{run.status === 'claimed' && !spinning ? 'QUÀ ĐÃ VÀO KHO' : 'ĐÃ VƯỢT QUA 5/5 CÂU'}</span>
            <h3 id="adventure-wheel-title">{run.status === 'claimed' && !spinning ? 'Một món quà dành cho bạn!' : `Vòng quay ${DOORS[run.level].name}`}</h3>
            <p>{run.status === 'claimed' && !spinning ? 'Cảm ơn bạn đã đồng hành cùng FlyTiee hôm nay.' : 'Cánh cửa đã mở. Chạm để khám phá phần quà của bạn.'}</p>
          </div>
          {run.status === 'claimed' && !spinning ? (
            <div className={styles.prizeReveal} role="status">
              <span className={styles.revealHalo} aria-hidden="true" />
              <span className={styles.revealParticles} aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</span>
              {run.reward_kind === 'coins' ? <FlytieeCoin className={styles.revealCoin} /> : run.reward_chest_tier ? <ChestArt tier={run.reward_chest_tier} className={styles.revealChest} /> : null}
              <span className={styles.revealEyebrow}>PHẦN THƯỞNG KỲ THÚ</span>
              <strong>{rewardLabel}</strong>
              <p>{run.reward_kind === 'coins' ? 'Xu đã được cộng vào ví FlyTiee.' : 'Rương đã được chuyển vào Kho rương FlyTiee.'}</p>
            </div>
          ) : (
            <>
              <div className={styles.wheelOuter}>
                <span className={styles.wheelPointer} aria-hidden="true" />
                <div className={styles.wheelRotor} data-spinning={spinning} style={{ background: prizeGradient(prizes), transform: `rotate(${rotation}deg)` }}>
                  {prizes.map((prize, index) => <span key={index} className={styles.wheelLabel} style={{ '--slice-angle': `${prizeCenter(prizes, index)}deg` } as CSSProperties}>{prize.coins ? <FlytieeCoin /> : <Star size={16} aria-hidden="true" />}{prize.label}</span>)}
                </div>
                <span className={styles.wheelHub}><Sparkles size={26} aria-hidden="true" /></span>
              </div>
              <button type="button" className={styles.spinButton} disabled={busy || spinning || run.status !== 'won'} onClick={() => void spin()}>{busy ? 'Đang chuẩn bị quà…' : spinning ? 'Vòng quay đang xoay…' : 'Quay nhận quà'}<Sparkles size={20} aria-hidden="true" /></button>
              <div className={styles.odds}><span>Tỉ lệ phần thưởng</span><p>Các ô trên vòng quay bằng nhau để dễ nhìn; xác suất nhận quà theo tỉ lệ bên dưới.</p><div>{prizes.map((prize, index) => <span key={index}><i style={{ background: prize.tone }} />{prize.label} <b>{prize.chance}%</b></span>)}</div></div>
            </>
          )}
          <p className={styles.tomorrow}>Lượt mới bắt đầu lúc 00:00 ngày mai (giờ Việt Nam).</p>
        </section>
      )}
    </div>
  );
}

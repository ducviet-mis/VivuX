export type Grade = { id: number; label: string; chapters: Chapter[] };
export type Chapter = { id: string; title: string; lessons: Lesson[] };
export type Lesson = { id: string; title: string; questions?: Question[] };
export type Question = { id: string; content: string; options: string[]; correctAnswer: number; solution: string; hasMath: boolean; difficultyLevel: number };
export type PracticeState = { currentQuestion: number; answers: Record<string, number>; results: Record<string, boolean> };

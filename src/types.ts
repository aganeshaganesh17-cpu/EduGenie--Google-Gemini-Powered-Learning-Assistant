export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  submitted: Record<number, boolean>;
  score?: number;
}

export interface ReferenceFile {
  filename: string;
  description: string;
  language: string;
  code: string;
}

export type ActiveTab = 'dashboard' | 'focus' | 'code' | 'saved';

export type FocusModule = 'qa' | 'explain' | 'summarize' | 'quiz' | 'learn';

export interface SavedItem {
  id: string;
  module: FocusModule;
  title: string;
  content: string;
  date: string;
}

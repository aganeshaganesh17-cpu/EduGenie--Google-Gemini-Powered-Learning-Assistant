import React, { useState } from 'react';
import { FocusModule } from '../types';
import { QASection } from './QASection';
import { ExplanationSection } from './ExplanationSection';
import { SummarySection } from './SummarySection';
import { QuizSection } from './QuizSection';
import { LearningPathSection } from './LearningPathSection';
import { HelpCircle, Lightbulb, AlignLeft, GraduationCap, Compass } from 'lucide-react';

interface FocusModeViewProps {
  onSaveToNotebook: (title: string, content: string) => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({ onSaveToNotebook }) => {
  const [selectedTask, setSelectedTask] = useState<FocusModule>('qa');

  const tasks: { id: FocusModule; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'qa',
      label: 'QnA (Ask Questions)',
      icon: <HelpCircle className="w-4 h-4 text-blue-600" />,
      desc: 'Ask direct academic or general knowledge questions for concise, smart answers.',
    },
    {
      id: 'explain',
      label: 'Explain (Concept Simplifier)',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
      desc: 'Break down complex topics into simple, relatable language for learners.',
    },
    {
      id: 'quiz',
      label: 'Quiz (Assessment Generator)',
      icon: <GraduationCap className="w-4 h-4 text-purple-600" />,
      desc: 'Generate interactive 4-option MCQs to test comprehension with instant feedback.',
    },
    {
      id: 'summarize',
      label: 'Summary (Passage Condenser)',
      icon: <AlignLeft className="w-4 h-4 text-teal-600" />,
      desc: 'Condense long paragraphs into clear, digestible revision summaries.',
    },
    {
      id: 'learn',
      label: 'Recommend Path (Structured Syllabus)',
      icon: <Compass className="w-4 h-4 text-indigo-600" />,
      desc: 'Get an adaptive multi-tier learning roadmap with timelines and resources.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dropdown Task Selector (as required by Milestone 3 Activity 3.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Task Module (Activity 3.1 Task Dropdown):
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTask(t.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                selectedTask === t.id
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="shrink-0">{t.icon}</div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate">{t.label.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-500 truncate">{t.label.split('(')[1]?.replace(')', '')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Render Focused Section */}
      <div>
        {selectedTask === 'qa' && <QASection onSaveToNotebook={onSaveToNotebook} />}
        {selectedTask === 'explain' && <ExplanationSection onSaveToNotebook={onSaveToNotebook} />}
        {selectedTask === 'summarize' && <SummarySection onSaveToNotebook={onSaveToNotebook} />}
        {selectedTask === 'quiz' && <QuizSection onSaveToNotebook={onSaveToNotebook} />}
        {selectedTask === 'learn' && <LearningPathSection onSaveToNotebook={onSaveToNotebook} />}
      </div>
    </div>
  );
};

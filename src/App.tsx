/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ScenarioBanner } from './components/ScenarioBanner';
import { QASection } from './components/QASection';
import { ExplanationSection } from './components/ExplanationSection';
import { SummarySection } from './components/SummarySection';
import { QuizSection } from './components/QuizSection';
import { LearningPathSection } from './components/LearningPathSection';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { FocusModeView } from './components/FocusModeView';
import { NotebookView } from './components/NotebookView';
import { ActiveTab, SavedItem } from './types';
import { Sparkles, GraduationCap, CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem('edugenie_notebook');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Scenario trigger states
  const [qaTopic, setQaTopic] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [learnTopic, setLearnTopic] = useState('');

  const qaRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const learnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('edugenie_notebook', JSON.stringify(savedItems));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [savedItems]);

  const handleSaveToNotebook = (title: string, content: string, moduleType: any = 'qa') => {
    const newItem: SavedItem = {
      id: Date.now().toString(),
      module: moduleType,
      title,
      content,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    setSavedItems((prev) => [newItem, ...prev]);
  };

  const handleRemoveSaved = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearSaved = () => {
    setSavedItems([]);
  };

  const handleSelectScenario = (type: 'qa' | 'quiz' | 'learn', query: string) => {
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }

    if (type === 'qa') {
      setQaTopic(query);
      setTimeout(() => {
        qaRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'quiz') {
      setQuizTopic(query);
      setTimeout(() => {
        quizRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (type === 'learn') {
      setLearnTopic(query);
      setTimeout(() => {
        learnRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/40 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Welcome Hero (Faithful to Fig. EDUGENIE on pages 11-13) */}
        <div className="text-center space-y-1.5 pt-2 pb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI-Powered Educational Assistant</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
            <span>Welcome to EduGenie</span>
            <span className="text-2xl">🧠✨</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Your personal AI tutor for learning support!
          </p>
        </div>

        {/* 1-Click Test Scenarios from Project Brief */}
        <ScenarioBanner onSelectScenario={handleSelectScenario} />

        {/* TAB 1: ALL MODULES DASHBOARD VIEW (Screenshots from PDF pages 11-16) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Q&A Module */}
            <div ref={qaRef}>
              <QASection
                key={`qa-${qaTopic}`}
                initialQuestion={qaTopic}
                onSaveToNotebook={(t, c) => handleSaveToNotebook(t, c, 'qa')}
              />
            </div>

            {/* 2. Explanation Module */}
            <div>
              <ExplanationSection
                onSaveToNotebook={(t, c) => handleSaveToNotebook(t, c, 'explain')}
              />
            </div>

            {/* 3. Summarization Module */}
            <div>
              <SummarySection
                onSaveToNotebook={(t, c) => handleSaveToNotebook(t, c, 'summarize')}
              />
            </div>

            {/* 4. Quiz Generation Module */}
            <div ref={quizRef}>
              <QuizSection
                key={`quiz-${quizTopic}`}
                initialTopic={quizTopic}
                onSaveToNotebook={(t, c) => handleSaveToNotebook(t, c, 'quiz')}
              />
            </div>

            {/* 5. Learning Recommendations Module */}
            <div ref={learnRef}>
              <LearningPathSection
                key={`learn-${learnTopic}`}
                initialTopic={learnTopic}
                onSaveToNotebook={(t, c) => handleSaveToNotebook(t, c, 'learn')}
              />
            </div>
          </div>
        )}

        {/* TAB 2: FOCUS MODE / TASK DROPDOWN VIEW (Milestone 3 Activity 3.1) */}
        {activeTab === 'focus' && (
          <div className="animate-fadeIn">
            <FocusModeView onSaveToNotebook={handleSaveToNotebook} />
          </div>
        )}

        {/* TAB 3: PYTHON ARCHITECTURE & CODE EXPLORER */}
        {activeTab === 'code' && (
          <div className="animate-fadeIn">
            <ArchitectureViewer />
          </div>
        )}

        {/* TAB 4: NOTEBOOK / SAVED ITEMS */}
        {activeTab === 'saved' && (
          <div className="animate-fadeIn">
            <NotebookView
              savedItems={savedItems}
              onRemoveItem={handleRemoveSaved}
              onClearAll={handleClearSaved}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">EduGenie Learning Assistant</span>
            <span>•</span>
            <span>Google Gemini 3.8 Flash</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>FastAPI & Node Compatible Endpoints Active</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

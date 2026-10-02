import React, { useState } from 'react';
import { HelpCircle, Send, Loader2, CheckCircle2, XCircle, RotateCcw, Award, Bookmark, GraduationCap } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizSectionProps {
  initialTopic?: string;
  onSaveToNotebook?: (title: string, content: string) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  initialTopic = '',
  onSaveToNotebook,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const presets = [
    'Pythagoras theorem',
    'Solar System',
    'World War II',
    'Cell Biology',
    'SQL Databases',
  ];

  const handleGenerateQuiz = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = (customTopic !== undefined ? customTopic : topic).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setQuestions([]);
    setUserAnswers({});
    setCheckedQuestions({});
    setSaved(false);

    try {
      // Calls the /quiz endpoint (POST /quiz { text })
      const res = await fetch('/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, count: 3 }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuestions(data.quiz);
      } else {
        throw new Error('Received invalid quiz format from server.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during quiz generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIndex: number, option: string) => {
    if (checkedQuestions[qIndex]) return; // lock once checked
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleCheckQuestion = (qIndex: number) => {
    if (!userAnswers[qIndex]) return;
    setCheckedQuestions((prev) => ({ ...prev, [qIndex]: true }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setCheckedQuestions({});
  };

  // Calculate score if all checked
  const totalQuestions = questions.length;
  const totalChecked = Object.keys(checkedQuestions).length;
  const correctCount = questions.reduce((acc, q, idx) => {
    if (checkedQuestions[idx] && userAnswers[idx] === q.answer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const isCompleted = totalQuestions > 0 && totalChecked === totalQuestions;

  const handleSave = () => {
    if (questions.length === 0 || !onSaveToNotebook) return;
    const summary = questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q.question}\nOptions: ${q.options.join(', ')}\nAnswer: ${q.answer}\n`
      )
      .join('\n');
    onSaveToNotebook(`Quiz: ${topic}`, summary);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Generate a Quiz:
            </h3>
            <p className="text-xs text-slate-500">
              Quiz Generation Module (<code className="text-purple-600">POST /quiz</code>)
            </p>
          </div>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Sample topics:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setTopic(preset);
              handleGenerateQuiz(undefined, preset);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-200 transition-colors text-[11px]"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleGenerateQuiz(e)} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            id="quizText"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Pythagoras theorem or paste a study topic..."
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Quiz...</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4" />
              <span>Generate Quiz</span>
            </>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Interactive Quiz Output (styled faithfully to PDF screenshots on pages 11, 14) */}
      {questions.length > 0 && (
        <div className="mt-5 space-y-5 animate-fadeIn">
          {/* Quiz Top Action Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Quiz on "{topic}":</span>
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-medium">
                3 Questions
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetQuiz}
                title="Reset answers"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              {onSaveToNotebook && (
                <button
                  onClick={handleSave}
                  title="Save Quiz to Notebook"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-700 px-2 py-1 rounded-md hover:bg-purple-50 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{saved ? 'Saved!' : 'Save'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Questions list */}
          {questions.map((q, idx) => {
            const isChecked = checkedQuestions[idx];
            const selectedOpt = userAnswers[idx];
            const isCorrect = selectedOpt === q.answer;

            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 transition-all hover:border-slate-300"
              >
                <p className="font-semibold text-sm sm:text-base text-slate-800 mb-3">
                  <span className="text-purple-600 font-bold mr-1.5">Q{idx + 1}:</span>
                  {q.question}
                </p>

                {/* 4 Options Radio Group */}
                <div className="space-y-2 mb-3.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === opt;
                    const isOptionCorrect = opt === q.answer;

                    let optionStyle =
                      'border-slate-200 bg-white hover:border-purple-300 text-slate-700';

                    if (isChecked) {
                      if (isOptionCorrect) {
                        optionStyle = 'border-green-400 bg-green-50/70 text-green-900 font-medium';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'border-rose-400 bg-rose-50/70 text-rose-900 line-through';
                      } else {
                        optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-400';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-purple-500 bg-purple-50/60 text-purple-900 font-medium ring-1 ring-purple-500';
                    }

                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelectOption(idx, opt)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-xs sm:text-sm ${optionStyle}`}
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          checked={isSelected}
                          disabled={isChecked}
                          onChange={() => handleSelectOption(idx, opt)}
                          className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500 accent-purple-600"
                        />
                        <span className="flex-1 leading-snug">{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Question Action & Feedback */}
                {!isChecked ? (
                  <button
                    onClick={() => handleCheckQuestion(idx)}
                    disabled={!selectedOpt}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="pt-2">
                    {isCorrect ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>✅ Correct!</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium space-y-1">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>❌ Incorrect. Correct answer: <strong className="underline">{q.answer}</strong></span>
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-red-700 font-normal pl-6">
                            Reason: {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quiz Completion Banner */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Quiz Completed! You scored {correctCount} of {totalQuestions} ({Math.round((correctCount / totalQuestions) * 100)}%)
                  </h4>
                  <p className="text-xs text-slate-500">
                    {correctCount === totalQuestions
                      ? 'Outstanding work! You have completely mastered this concept.'
                      : 'Great effort! Review the correct solutions above to strengthen your understanding.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

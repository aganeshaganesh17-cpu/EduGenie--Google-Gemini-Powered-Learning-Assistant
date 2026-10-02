import React, { useState } from 'react';
import { HelpCircle, Send, Loader2, Copy, Check, Volume2, Bookmark, Sparkles } from 'lucide-react';

interface QASectionProps {
  initialQuestion?: string;
  onSaveToNotebook?: (title: string, content: string) => void;
}

export const QASection: React.FC<QASectionProps> = ({ initialQuestion = '', onSaveToNotebook }) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const presets = [
    'Which is the largest ocean?',
    'Why is the sky blue?',
    'What causes ocean tides?',
    'How do airplanes fly?',
  ];

  const handleSubmit = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const query = (customQ !== undefined ? customQ : question).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      // Calls the /qa endpoint (compatible with both FastAPI spec and Express proxy)
      const res = await fetch(`/qa?question=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch answer.');
      }

      setAnswer(data.answer);
    } catch (err: any) {
      setError(err.message || 'An error occurred while asking question.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!answer || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    if (!answer || !onSaveToNotebook) return;
    onSaveToNotebook(question || 'Q&A Answer', answer);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Ask EduGenie a Question:
            </h3>
            <p className="text-xs text-slate-500">
              Q&A Module powered by Gemini API (<code className="text-blue-600">GET /qa</code>)
            </p>
          </div>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Try asking:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setQuestion(preset);
              handleSubmit(undefined, preset);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors text-[11px]"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Why is the sky blue?"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Get Answer</span>
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

      {/* Answer Output Container (styled exactly like the EduGenie screenshots) */}
      {answer && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Answer:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                title="Listen to answer"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  speaking ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">
                  {speaking ? 'Stop' : 'Listen'}
                </span>
              </button>
              <button
                onClick={handleCopy}
                title="Copy answer"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] hidden sm:inline">
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
              {onSaveToNotebook && (
                <button
                  onClick={handleSave}
                  title="Save to Notebook"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 text-xs flex items-center gap-1 transition-colors"
                >
                  {saved ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">
                    {saved ? 'Saved' : 'Save'}
                  </span>
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

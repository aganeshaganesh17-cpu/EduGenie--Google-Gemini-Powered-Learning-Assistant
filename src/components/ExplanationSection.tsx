import React, { useState } from 'react';
import { Lightbulb, Send, Loader2, Copy, Check, Volume2, Bookmark, BookOpen } from 'lucide-react';

interface ExplanationSectionProps {
  initialTopic?: string;
  onSaveToNotebook?: (title: string, content: string) => void;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  initialTopic = '',
  onSaveToNotebook,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState('school student');
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const presets = [
    'Photosynthesis',
    'quantum computing',
    'Binary Search Algorithm',
    'Black Holes',
    'Blockchain',
  ];

  const handleSubmit = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = (customTopic !== undefined ? customTopic : topic).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      // Calls the /explain endpoint (POST /explain { topic })
      const res = await fetch('/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query, level }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate explanation.');
      }

      setExplanation(data.explanation);
    } catch (err: any) {
      setError(err.message || 'An error occurred during explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!explanation || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(explanation);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    if (!explanation || !onSaveToNotebook) return;
    onSaveToNotebook(`Explanation: ${topic}`, explanation);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Need an Explanation?
            </h3>
            <p className="text-xs text-slate-500">
              Concept Explanation Module (<code className="text-amber-600">POST /explain</code>)
            </p>
          </div>
        </div>

        {/* Level selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 hidden sm:inline">Audience:</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="school student">School Student</option>
            <option value="beginner">Beginner / Self-Learner</option>
            <option value="high school student">High School</option>
            <option value="college undergraduate">College / In-Depth</option>
          </select>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Examples:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setTopic(preset);
              handleSubmit(undefined, preset);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 border border-slate-200 transition-colors text-[11px]"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Photosynthesis, quantum computing, or binary search..."
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Explaining...</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              <span>Explain</span>
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

      {/* Explanation Output */}
      {explanation && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Explanation:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                title="Listen to explanation"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  speaking ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">
                  {speaking ? 'Stop' : 'Listen'}
                </span>
              </button>
              <button
                onClick={handleCopy}
                title="Copy explanation"
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
                  {saved ? <Check className="w-3.5 h-3.5 text-amber-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">
                    {saved ? 'Saved' : 'Save'}
                  </span>
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

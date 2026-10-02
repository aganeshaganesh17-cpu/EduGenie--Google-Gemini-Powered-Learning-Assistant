import React, { useState } from 'react';
import { AlignLeft, Send, Loader2, Copy, Check, Volume2, Bookmark, FileText, Sparkles } from 'lucide-react';

interface SummarySectionProps {
  initialText?: string;
  onSaveToNotebook?: (title: string, content: string) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  initialText = '',
  onSaveToNotebook,
}) => {
  const [text, setText] = useState(initialText);
  const [format, setFormat] = useState<'paragraph' | 'bullets'>('paragraph');
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const presets = [
    {
      title: 'The Industrial Revolution (from doc)',
      content:
        'The Industrial Revolution, which began in Great Britain in the late 18th century, marked a monumental turning point in human history. It saw society transition from agrarian, handicraft economies dominated by manual labor to mechanized manufacturing powered by industrial engines. Innovations like James Watt’s steam engine revolutionized transportation and factory production. While it fueled tremendous economic growth, expanded global trade, and accelerated urbanization, it also brought harsh working conditions, child labor, and environmental pollution that required extensive social reform.',
    },
    {
      title: 'Photosynthesis in Plants',
      content:
        'Photosynthesis is the biochemical process by which green plants, algae, and certain bacteria convert sunlight, water, and carbon dioxide into chemical energy in the form of glucose, while releasing oxygen as a vital byproduct. Taking place inside specialized cellular organelles called chloroplasts with the aid of chlorophyll pigments, this complex light-dependent and light-independent reaction forms the fundamental energetic foundation of nearly all terrestrial and aquatic food chains.',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const content = (customContent !== undefined ? customContent : text).trim();
    if (!content) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      // Calls the /summarize endpoint (POST /summarize { text, format })
      const res = await fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, format }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to summarize text.');
      }

      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'An error occurred during summarization.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!summary || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    if (!summary || !onSaveToNotebook) return;
    const titleSnippet = text.slice(0, 30).trim() + '...';
    onSaveToNotebook(`Summary: ${titleSnippet}`, summary);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const originalWordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const summaryWordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  const reduction =
    originalWordCount > 0 && summaryWordCount > 0
      ? Math.max(0, Math.round(((originalWordCount - summaryWordCount) / originalWordCount) * 100))
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
            <AlignLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Summarize a Paragraph:
            </h3>
            <p className="text-xs text-slate-500">
              Summarization Module (<code className="text-teal-600">POST /summarize</code>)
            </p>
          </div>
        </div>

        {/* Format toggle */}
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFormat('paragraph')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              format === 'paragraph' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Paragraph
          </button>
          <button
            type="button"
            onClick={() => setFormat('bullets')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              format === 'bullets' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Bullet Points
          </button>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Load sample text:</span>
        {presets.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => {
              setText(preset.content);
              handleSubmit(undefined, preset.content);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 transition-colors text-[11px]"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-2">
        <div className="relative">
          <textarea
            id="summaryText"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste long content to summarize..."
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-800 transition-all placeholder:text-slate-400 resize-y"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
            <span>{originalWordCount} words</span>
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Summarize</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Summary Output */}
      {summary && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 transition-all animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Summary:
              </span>
              {reduction > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                  {reduction}% more concise ({summaryWordCount} words)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                title="Listen to summary"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  speaking ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">
                  {speaking ? 'Stop' : 'Listen'}
                </span>
              </button>
              <button
                onClick={handleCopy}
                title="Copy summary"
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
                  {saved ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">
                    {saved ? 'Saved' : 'Save'}
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
};

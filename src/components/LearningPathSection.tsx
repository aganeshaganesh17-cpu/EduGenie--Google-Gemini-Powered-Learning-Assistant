import React, { useState } from 'react';
import { Compass, Send, Loader2, Copy, Check, Bookmark, CheckSquare, Square, Download } from 'lucide-react';

interface LearningPathSectionProps {
  initialTopic?: string;
  onSaveToNotebook?: (title: string, content: string) => void;
}

export const LearningPathSection: React.FC<LearningPathSectionProps> = ({
  initialTopic = '',
  onSaveToNotebook,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const presets = [
    'SQL',
    'Linear Regression',
    'Web Development with React',
    'Python for Data Science',
    'Data Structures & Algorithms',
  ];

  const handleSubmit = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = (customTopic !== undefined ? customTopic : topic).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setCopied(false);
    setSaved(false);
    setCompletedItems({});

    try {
      // Calls the /learn/recommendations endpoint (GET or POST)
      const res = await fetch(`/learn/recommendations?topic=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate learning path.');
      }

      setRecommendation(data.recommendation);
    } catch (err: any) {
      setError(err.message || 'An error occurred while building the learning path.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!recommendation) return;
    navigator.clipboard.writeText(recommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!recommendation) return;
    const blob = new Blob([recommendation], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-learning-roadmap.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!recommendation || !onSaveToNotebook) return;
    onSaveToNotebook(`Learning Path: ${topic}`, recommendation);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleChecklist = (itemKey: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  // Format line helper
  const renderFormattedLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={index} className="h-2" />;
    }

    // Level Header (e.g. ## Level I: or **I. Beginner Level**)
    if (
      trimmed.startsWith('## ') ||
      trimmed.startsWith('### ') ||
      (trimmed.startsWith('**') && (trimmed.includes('Level') || trimmed.includes('Phase')))
    ) {
      const cleanHeader = trimmed.replace(/[#*]/g, '').trim();
      return (
        <div key={index} className="mt-4 mb-2 pt-3 border-t border-slate-200">
          <h4 className="text-sm font-bold text-indigo-900 bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            {cleanHeader}
          </h4>
        </div>
      );
    }

    // Estimated time tag
    if (trimmed.toLowerCase().includes('estimated time:')) {
      const timeClean = trimmed.replace(/[*_()]/g, '').trim();
      return (
        <div key={index} className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
          ⏱️ {timeClean}
        </div>
      );
    }

    // Subheadings like Key Topics or Resources
    if (
      trimmed.startsWith('**Key Topics') ||
      trimmed.startsWith('**Resources') ||
      trimmed.startsWith('**Adaptive Learning Tips') ||
      trimmed.startsWith('*Key Topics')
    ) {
      const cleanSub = trimmed.replace(/[*:]/g, '').trim();
      return (
        <h5 key={index} className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-3 mb-1.5">
          {cleanSub}:
        </h5>
      );
    }

    // Bullet points (with interactive checkability)
    if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      const bulletText = trimmed.replace(/^[*-\s]+/, '').replace(/[*_]/g, '').trim();
      const isChecked = !!completedItems[`${index}-${bulletText}`];

      return (
        <div
          key={index}
          onClick={() => toggleChecklist(`${index}-${bulletText}`)}
          className={`flex items-start gap-2 py-1 px-2 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm group ${
            isChecked ? 'bg-indigo-50/50 text-slate-400 line-through' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <span className="mt-0.5 text-indigo-600 shrink-0">
            {isChecked ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            )}
          </span>
          <span className="leading-relaxed">{bulletText}</span>
        </div>
      );
    }

    // Normal paragraph
    return (
      <p key={index} className="text-xs sm:text-sm text-slate-700 my-1 leading-relaxed">
        {trimmed.replace(/[*_]/g, '')}
      </p>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Get Learning Recommendations:
            </h3>
            <p className="text-xs text-slate-500">
              Personalized Learning Path (<code className="text-indigo-600">GET /learn/recommendations</code>)
            </p>
          </div>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Curated topics:</span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setTopic(preset);
              handleSubmit(undefined, preset);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors text-[11px]"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            id="learningTopic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. SQL, Linear Regression, Machine Learning..."
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Building Path...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              <span>Get Recommendations</span>
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

      {/* Learning Path Output */}
      {recommendation && (
        <div className="mt-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Learning Recommendations for "{topic}":
              </span>
              <span className="text-[11px] text-slate-500">
                Click any topic item to toggle checkmark as you study
              </span>
            </div>

            <div className="flex items-center gap-1 self-start sm:self-auto">
              <button
                onClick={handleDownload}
                title="Download Markdown Roadmap"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 text-xs flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleCopy}
                title="Copy Roadmap text"
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
                  {saved ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">
                    {saved ? 'Saved' : 'Save'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {recommendation.split('\n').map((line, idx) => renderFormattedLine(line, idx))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Bookmark, Trash2, Download, Copy, Calendar, Sparkles } from 'lucide-react';
import { SavedItem } from '../types';

interface NotebookViewProps {
  savedItems: SavedItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  savedItems,
  onRemoveItem,
  onClearAll,
}) => {
  const handleExportAll = () => {
    if (savedItems.length === 0) return;
    const exportText = savedItems
      .map(
        (item) =>
          `# ${item.title}\nDate: ${item.date}\nModule: ${item.module.toUpperCase()}\n\n${item.content}\n\n---\n`
      )
      .join('\n');

    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edugenie-study-notes-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyItem = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Student Study Notebook
            </h3>
            <p className="text-xs text-slate-500">
              Saved answers, explanations, quizzes, and roadmaps for quick offline revision
            </p>
          </div>
        </div>

        {savedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Notes</span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-700 text-sm">Your Notebook is Empty</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the "Save" bookmark button on any Q&A answer, concept explanation, summary, or learning roadmap to store it here for revision!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    {item.module}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">{item.title}</h4>
                <div className="text-xs text-slate-600 line-clamp-4 font-mono bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3 whitespace-pre-wrap">
                  {item.content}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => handleCopyItem(item.content)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 text-xs flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

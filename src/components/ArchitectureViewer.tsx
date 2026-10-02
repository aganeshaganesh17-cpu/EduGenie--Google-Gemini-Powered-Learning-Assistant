import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal, Network, ArrowRight, Download } from 'lucide-react';
import { referenceFiles } from '../data/referenceCode';

export const ArchitectureViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('main.py');
  const [copied, setCopied] = useState(false);

  const currentFile = referenceFiles.find((f) => f.filename === activeFile) || referenceFiles[0];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename.replace('/', '_');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Visual System Architecture Diagram Card (Reproduced faithfully from PDF page 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              EduGenie System Architecture
            </h3>
            <p className="text-xs text-slate-500">
              Interactive representation of the architectural workflow from the project specification
            </p>
          </div>
        </div>

        {/* Diagram Flow */}
        <div className="bg-gradient-to-b from-slate-50 to-indigo-50/30 p-4 sm:p-6 rounded-xl border border-slate-200 flex flex-col items-center gap-3">
          {/* Step 1 */}
          <div className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xs">
            Start (User opens EduGenie)
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />

          {/* Step 2 */}
          <div className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 shadow-xs text-center">
            <strong>Frontend:</strong> User Input (Question / Concept / Text / Quiz Topic)
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />

          {/* Step 3 - Backend Router */}
          <div className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm text-center">
            <strong>FastAPI / Node Backend:</strong> Route to respective module endpoint
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />

          {/* Step 4 - Endpoints Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 w-full text-center">
            <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-xs">
              <span className="block text-[11px] font-bold text-blue-700">Q&A Module</span>
              <code className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">/qa</code>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs">
              <span className="block text-[11px] font-bold text-amber-700">Explanation</span>
              <code className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">/explain</code>
            </div>
            <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-xs">
              <span className="block text-[11px] font-bold text-purple-700">Quiz Generation</span>
              <code className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">/quiz</code>
            </div>
            <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-xs">
              <span className="block text-[11px] font-bold text-teal-700">Summarization</span>
              <code className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">/summarize</code>
            </div>
            <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-xs">
              <span className="block text-[11px] font-bold text-indigo-700">Learning Path</span>
              <code className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">/learn/recommendations</code>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />

          {/* Step 5 */}
          <div className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 shadow-xs text-center">
            <strong>Frontend:</strong> Display Results (Answers, explanations, quiz questions, roadmaps)
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />

          {/* Step 6 */}
          <div className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-xs">
            End (Results shown, user interacts again)
          </div>
        </div>
      </div>

      {/* Code Repository Browser */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Repo Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Python FastAPI & Model Modules Explorer
              </h3>
              <p className="text-xs text-slate-500">
                Inspect the exact files specified in Milestone 1 & 2 of the project brief
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* File Tabs & Code Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[420px]">
          {/* File sidebar */}
          <div className="border-r border-slate-200 bg-slate-50/70 p-2 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Project Files
            </div>
            {referenceFiles.map((file) => (
              <button
                key={file.filename}
                onClick={() => setActiveFile(file.filename)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                  activeFile === file.filename
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{file.filename}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-3 bg-slate-950 p-4 sm:p-5 flex flex-col justify-between overflow-x-auto text-slate-200">
            {currentFile && (
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    <span className="text-blue-400">{currentFile.filename}</span>
                    <span>•</span>
                    <span className="text-slate-500">{currentFile.description}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                    {currentFile.language}
                  </span>
                </div>
                <pre className="font-mono text-xs text-slate-200 whitespace-pre leading-relaxed overflow-x-auto">
                  {currentFile.code}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

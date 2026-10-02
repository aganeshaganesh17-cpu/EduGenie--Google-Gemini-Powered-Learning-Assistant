import React from 'react';
import { Compass, HelpCircle, GraduationCap, ArrowRight } from 'lucide-react';

interface ScenarioBannerProps {
  onSelectScenario: (type: 'qa' | 'quiz' | 'learn', query: string) => void;
}

export const ScenarioBanner: React.FC<ScenarioBannerProps> = ({ onSelectScenario }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            Featured Student Scenarios (From Project Brief)
          </h2>
          <p className="text-xs text-slate-600">
            Click any scenario to instantly autofill and test EduGenie's core modules:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Scenario 1 */}
        <button
          onClick={() => onSelectScenario('qa', 'Which is the largest ocean?')}
          className="group text-left p-3.5 bg-white rounded-xl border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-blue-700 mb-1">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Scenario 1: Q&A
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                /qa
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
              "Which is the largest ocean?"
            </p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Student asks a factual geography question and gets a concise, accurate answer.
            </p>
          </div>
          <div className="mt-2.5 flex items-center text-[11px] font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Test Q&A</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={() => onSelectScenario('quiz', 'The Pythagoras Theorem')}
          className="group text-left p-3.5 bg-white rounded-xl border border-purple-200/80 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-purple-700 mb-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Scenario 2: Quiz
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                /quiz
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium group-hover:text-purple-600 transition-colors">
              "The Pythagoras Theorem"
            </p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Generates 3 interactive MCQs to assess understanding with instant grading and corrections.
            </p>
          </div>
          <div className="mt-2.5 flex items-center text-[11px] font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>Generate Quiz</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={() => onSelectScenario('learn', 'SQL')}
          className="group text-left p-3.5 bg-white rounded-xl border border-indigo-200/80 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 mb-1">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                Scenario 3: Learning Path
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                /learn
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium group-hover:text-indigo-600 transition-colors">
              "SQL: Zero to Hero"
            </p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Structured multi-tier study plan with timelines, topics, resources, and adaptive tips.
            </p>
          </div>
          <div className="mt-2.5 flex items-center text-[11px] font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>Explore Path</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </button>
      </div>
    </div>
  );
};

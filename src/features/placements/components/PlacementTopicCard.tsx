import React from 'react';
import { PlacementTopic } from '../types/placement';
import { BookOpen, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  topic: PlacementTopic;
  onSelect: (topicId: string) => void;
}

export const PlacementTopicCard: React.FC<Props> = ({ topic, onSelect }) => {
  const difficultyColors = {
    BEGINNER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    EASY: 'bg-green-50 text-green-700 border-green-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HARD: 'bg-rose-50 text-rose-700 border-rose-200',
    ADVANCED: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div
      onClick={() => onSelect(topic.id)}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
            {topic.category.replace('_', ' ')}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              difficultyColors[topic.difficulty] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {topic.difficulty}
          </span>
        </div>

        <h4 className="font-semibold text-slate-900 text-base mb-1.5 line-clamp-1 hover:text-blue-600">
          {topic.name}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {topic.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            {topic.concepts.length} Concepts
          </span>
          <span className="flex items-center gap-1 font-medium">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            {topic.common_questions.length} Questions
          </span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700">
          <span>Study</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};

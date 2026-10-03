import React from 'react';
import { TopicPerformance } from '../types/quiz';
import { Button } from '../../../components/ui/button';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface WeakAreaCardProps {
  topic: TopicPerformance | string;
  onGenerateRevision?: (topicName: string) => void;
}

export const WeakAreaCard: React.FC<WeakAreaCardProps> = ({ topic, onGenerateRevision }) => {
  const isObject = typeof topic === 'object';
  const topicName = isObject ? topic.topic_name : topic;
  const accuracy = isObject ? topic.accuracy : 45;

  return (
    <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">Concept Needs Practice</span>
        </div>

        <h4 className="font-semibold text-slate-900 dark:text-white text-base">
          {topicName}
        </h4>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          Recent assessment performance is {accuracy}%. Targeted adaptive questions will reinforce core principles.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-800/40 flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
          Accuracy: {accuracy}%
        </span>
        {onGenerateRevision && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1 border-amber-300 hover:bg-amber-100/50 dark:border-amber-700"
            onClick={() => onGenerateRevision(topicName)}
          >
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Revise
          </Button>
        )}
      </div>
    </div>
  );
};

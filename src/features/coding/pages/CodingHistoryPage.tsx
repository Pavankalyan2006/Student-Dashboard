import * as React from 'react';
import { CodingHistory } from '../components/CodingHistory';
import { ArrowLeft } from 'lucide-react';

interface CodingHistoryPageProps {
  onNavigate?: (path: string) => void;
}

export const CodingHistoryPage: React.FC<CodingHistoryPageProps> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/coding')}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Coding Lab</span>
        </button>
      </div>

      <div className="h-[75vh]">
        <CodingHistory onClose={() => navigate('/coding/editor')} />
      </div>
    </div>
  );
};

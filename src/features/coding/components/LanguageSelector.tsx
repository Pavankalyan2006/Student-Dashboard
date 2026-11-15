import React from 'react';
import { useLanguageAvailability } from '../hooks/useLanguageAvailability';
import { CodingLanguage } from '../types/coding';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import { Code2, ChevronDown } from 'lucide-react';

interface LanguageOption {
  id: CodingLanguage;
  name: string;
  badge: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'python', name: 'Python 3', badge: 'py' },
  { id: 'javascript', name: 'JavaScript (Node.js)', badge: 'js' },
  { id: 'cpp', name: 'C++ (G++ 17)', badge: 'cpp' },
  { id: 'c', name: 'C (GCC, C11)', badge: 'c' },
  { id: 'java', name: 'Java (OpenJDK)', badge: 'java' },
];

export const LanguageSelector: React.FC<{ disabled?: boolean; onChangeLanguage?: (lang: CodingLanguage) => void }> = ({
  disabled,
  onChangeLanguage,
}) => {
  const language = useCodingEditorStore((s) => s.language);
  const setLanguage = useCodingEditorStore((s) => s.setLanguage);
  // Which languages can run, and where (server sandbox, browser sandbox, or not at all).
  const availability = useLanguageAvailability();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as CodingLanguage;
    setLanguage(selected);
    if (onChangeLanguage) {
      onChangeLanguage(selected);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-300 dark:border-slate-700">
        <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <select
          value={language}
          onChange={handleChange}
          disabled={disabled}
          className="appearance-none bg-transparent pr-4 font-semibold cursor-pointer focus:outline-none disabled:opacity-50"
          aria-label="Select Programming Language"
        >
          {LANGUAGES.map((l) => (
            <option
              key={l.id}
              value={l.id}
              disabled={availability[l.id]?.available === false}
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              {availability[l.id]?.runs === 'browser' ? l.name.replace(' (Node.js)', '') : l.name}
              {availability[l.id]?.runs === 'browser'
                ? ' (runs in your browser)'
                : availability[l.id]?.available === false
                  ? availability[l.id]?.detail === 'sandbox_unavailable'
                    ? ' (running code is off on this server)'
                    : ' (not installed on server)'
                  : ''}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 pointer-events-none" />
      </div>
    </div>
  );
};

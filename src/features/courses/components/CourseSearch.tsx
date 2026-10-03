import * as React from 'react';
import { Search, X } from 'lucide-react';

export function CourseSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [localText, setLocalText] = React.useState(value);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localText);
    }, 300);
    return () => clearTimeout(timer);
  }, [localText, onChange]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder="Search courses by name, code, topic, or skills..."
        className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-[#E4E7EC] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-2xs"
      />
      {localText && (
        <button
          onClick={() => {
            setLocalText('');
            onChange('');
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

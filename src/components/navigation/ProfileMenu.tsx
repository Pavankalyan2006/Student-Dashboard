import * as React from 'react';
import { User, TrendingUp, Settings, LogOut, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function ProfileMenu({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { student, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      onNavigate('/login');
    } catch {
      toast.error('Logout error occurred');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-100 xl:pr-2.5"
          aria-label="Student profile menu"
        >
          <Avatar className="h-8 w-8 ring-1 ring-slate-200">
            {student?.avatar_url && <AvatarImage src={student.avatar_url} alt={student.name} />}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-[11px] font-bold text-white">
              {getInitials(student?.name)}
            </AvatarFallback>
          </Avatar>
          {student?.name && (
            <span className="hidden max-w-[140px] truncate text-[13px] font-semibold text-slate-800 xl:inline">
              {student.display_name || student.name.split(' ')[0]}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 p-1.5 shadow-lg border border-slate-200 bg-white" align="end" sideOffset={8}>
        {/* Profile Card Summary */}
        <div className="px-2.5 py-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-semibold text-slate-900 truncate">{student?.display_name || student?.name || 'Signed in'}</h4>
          </div>
          {student?.display_name && student?.name && student.display_name !== student.name && (
            <p className="text-[10px] text-slate-600 truncate">{student.name}</p>
          )}
          {student?.email && <p className="text-xs text-slate-500 truncate">{student.email}</p>}
          {student?.branch && (
            <div className="mt-1 text-[10px] font-medium text-slate-600 bg-slate-50 p-1 rounded border border-slate-100 truncate">
              {student.branch} · Sem {student.semester}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onNavigate('/profile')}>
          <User className="mr-2 h-3.5 w-3.5 text-slate-500" />
          <span>Student Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onNavigate('/progress')}>
          <TrendingUp className="mr-2 h-3.5 w-3.5 text-slate-500" />
          <span>Academic Progress</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onNavigate('/settings')}>
          <Settings className="mr-2 h-3.5 w-3.5 text-slate-500" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} danger>
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

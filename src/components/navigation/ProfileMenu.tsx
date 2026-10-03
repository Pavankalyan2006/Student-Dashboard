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
  const { student, logout, isSuperAdmin } = useAuth();

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
          className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          aria-label="Student profile menu"
        >
          <Avatar className="h-8 w-8 ring-1 ring-[#E4E7EC]">
            {student?.avatar_url && <AvatarImage src={student.avatar_url} alt={student.name} />}
            <AvatarFallback>{getInitials(student?.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-1.5 shadow-lg border border-[#E4E7EC] bg-white" align="end">
        {/* Profile Card Summary */}
        <div className="px-2.5 py-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#101828] truncate">{student?.name || 'B.Tech Student'}</h4>
            {isSuperAdmin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                Admin
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#667085] truncate">{student?.email || 'student@btech.edu'}</p>
          {student?.branch && (
            <div className="mt-1 text-[10px] font-medium text-[#475467] bg-slate-50 p-1 rounded border border-slate-100 truncate">
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

        {isSuperAdmin && (
          <DropdownMenuItem onClick={() => onNavigate('/admin')}>
            <ShieldCheck className="mr-2 h-3.5 w-3.5 text-amber-600" />
            <span className="font-semibold text-amber-900">Admin Platform Shell</span>
          </DropdownMenuItem>
        )}

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

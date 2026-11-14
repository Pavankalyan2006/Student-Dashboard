// src/features/mock-interviews/components/ScheduleInterviewModal.tsx
// Modal for scheduling future AI practice interview sessions

import React, { useState } from 'react';
import { X, Calendar, Clock, Sparkles, Bell } from 'lucide-react';
import { MockInterviewCategory } from '../types/mockInterviewTypes';
import { mockInterviewApi } from '../api/mockInterviewApi';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

export const ScheduleInterviewModal: React.FC<Props> = ({ isOpen, onClose, onScheduled }) => {
  const [category, setCategory] = useState<MockInterviewCategory>('TECHNICAL');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please pick a date and time.');
      return;
    }
    setIsSubmitting(true);
    try {
      await mockInterviewApi.scheduleInterview({
        category,
        target_role: targetRole,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        reminder_minutes_before: reminderMinutes,
      });
      toast.success(`Practice session scheduled for ${scheduledDate} at ${scheduledTime}!`);
      onScheduled();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule practice session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="hero-brand text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-base">Schedule Practice Session</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-300 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Interview Track</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TECHNICAL">Technical CS Fundamentals</option>
              <option value="CODING">Live Coding Round</option>
              <option value="DSA">Data Structures & Algorithms</option>
              <option value="SQL">SQL & Database Interview</option>
              <option value="SYSTEM_DESIGN">System Design Interview</option>
              <option value="HR">HR & Cultural Fit</option>
              <option value="BEHAVIORAL">Behavioral (STAR Method)</option>
              <option value="RESUME">Resume-Based Defense</option>
              <option value="INTERNSHIP">Internship Screening</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Engineering Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Development Engineer"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time (Local)</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reminder Notification</label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutes before session</option>
              <option value={30}>30 minutes before session</option>
              <option value={60}>1 hour before session</option>
              <option value={1440}>1 day before session</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Save Practice Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

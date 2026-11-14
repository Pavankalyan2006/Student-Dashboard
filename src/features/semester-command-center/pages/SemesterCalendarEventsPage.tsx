// src/features/semester-command-center/pages/SemesterCalendarEventsPage.tsx
// Academic Calendar & Event Engine (Section 7 & 8)

import * as React from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  FileCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { PageContainer, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { SemesterCommandCenterLayout } from '../components/SemesterCommandCenterLayout';
import { semesterCommandCenterApi } from '../../../api/semesterCommandCenterApi';
import {
  AcademicEvent,
  AcademicEventType,
  AcademicSemesterConfig,
} from '../../../types/semesterCommandCenter';
import { toast } from 'sonner';

interface SemesterCalendarEventsPageProps {
  onNavigate?: (path: string) => void;
}

export function SemesterCalendarEventsPage({ onNavigate }: SemesterCalendarEventsPageProps) {
  const [events, setEvents] = React.useState<AcademicEvent[]>([]);
  const [config, setConfig] = React.useState<AcademicSemesterConfig | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = React.useState<string>('ALL');
  const [loading, setLoading] = React.useState(true);

  // Add Event Modal State
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [eventForm, setEventForm] = React.useState({
    title: '',
    event_type: 'SLIP_TEST' as AcademicEventType,
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '11:00 AM',
    priority: 'HIGH' as const,
    syllabus_scope: '',
    notes: '',
    status: 'UPCOMING' as const,
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, eventList] = await Promise.all([
        semesterCommandCenterApi.getOverview(),
        semesterCommandCenterApi.getEvents(),
      ]);
      setConfig(overviewData.config);
      setEvents(eventList);
    } catch (err: any) {
      toast.error('Failed to load academic events: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      toast.error('Please enter an event title and date.');
      return;
    }

    try {
      const created = await semesterCommandCenterApi.addEvent(eventForm);
      toast.success(`Event "${created.title}" added to academic calendar!`);
      setShowAddModal(false);
      setEventForm({
        title: '',
        event_type: 'SLIP_TEST',
        date: new Date().toISOString().split('T')[0],
        start_time: '10:00 AM',
        end_time: '11:00 AM',
        priority: 'HIGH',
        syllabus_scope: '',
        notes: '',
        status: 'UPCOMING',
      });
      await loadData();
    } catch (err: any) {
      toast.error('Failed to add event: ' + err.message);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (selectedFilter === 'ALL') return true;
    return ev.event_type === selectedFilter;
  });

  if (loading && events.length === 0) {
    return (
      <PageContainer>
        <LoadingState message="Loading semester academic calendar..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SemesterCommandCenterLayout currentTab="calendar" config={config} onNavigate={onNavigate}>
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Semester Academic Calendar & Events</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-mono">
                  AcademicEventEngine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full 16-week timetable covering slip tests, quizzes, internal minors, lab practicals, and university finals.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Event Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="SLIP_TEST">Slip Tests</option>
                  <option value="MINOR_1">Minor 1</option>
                  <option value="MINOR_2">Minor 2</option>
                  <option value="END_SEMESTER">End Semester</option>
                  <option value="QUIZ">Quizzes</option>
                  <option value="LAB_EXAM">Lab Exams</option>
                  <option value="ASSIGNMENT">Assignments</option>
                  <option value="HOLIDAY">Holidays / Breaks</option>
                </select>
              </div>

              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Academic Event
              </Button>
            </div>
          </div>

          {/* Chronological Event Cards */}
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <EmptyState
                title="No events matching this filter"
                description="Add your upcoming slip test, lab viva, or minor examination dates to keep your study stream synchronized."
                action={
                  <Button
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Academic Event
                  </Button>
                }
              />
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-200 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 font-mono">
                        {new Date(ev.date).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{ev.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-indigo-700 font-semibold border border-slate-200">
                          {(ev.event_type || 'ACADEMIC_EVENT').replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            ev.priority === 'CRITICAL'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : ev.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {ev.priority}
                        </span>
                      </div>

                      {ev.syllabus_scope && (
                        <p className="text-xs text-slate-700">
                          <strong>Syllabus Scope:</strong> {ev.syllabus_scope}
                        </p>
                      )}

                      {ev.notes && <p className="text-xs text-slate-500">{ev.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 text-xs">
                    {ev.start_time && (
                      <span className="text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {ev.start_time} {ev.end_time && `- ${ev.end_time}`}
                      </span>
                    )}

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        ev.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL: ADD EVENT */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Add Academic Event
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="border-slate-200 text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleAddEventSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. OS Slip Test on Semaphores"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                    <select
                      value={eventForm.event_type}
                      onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="SLIP_TEST">Slip Test</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="MINOR_1">Minor 1</option>
                      <option value="MINOR_2">Minor 2</option>
                      <option value="MINOR_3">Minor 3</option>
                      <option value="LAB_EXAM">Lab Exam</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="END_SEMESTER">End Semester</option>
                      <option value="PROJECT_REVIEW">Project Review</option>
                      <option value="HOLIDAY">Holiday / Break</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time (Optional)</label>
                    <input
                      type="text"
                      value={eventForm.start_time}
                      onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                      placeholder="e.g. 10:00 AM"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={eventForm.priority}
                      onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Syllabus Scope</label>
                  <input
                    type="text"
                    value={eventForm.syllabus_scope}
                    onChange={(e) => setEventForm({ ...eventForm, syllabus_scope: e.target.value })}
                    placeholder="e.g. Units 3 & 4 or specific topics"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    value={eventForm.notes}
                    onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                    placeholder="e.g. Weightage details, formula sheet permitted, etc."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                    Schedule Event
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SemesterCommandCenterLayout>
    </PageContainer>
  );
}

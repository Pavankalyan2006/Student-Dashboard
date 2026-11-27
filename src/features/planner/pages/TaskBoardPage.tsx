import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlarmClock, CalendarClock, CheckCircle2, Circle, GripVertical, KanbanSquare, ListTodo, Loader2, Plus, Search, Trash2, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader, MetricCard, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { AnimatePresence, ProgressRing, celebrate, motion, originOf } from '../../../components/motion';
import { cn } from '../../../lib/utils';
import { boardSummary, type BoardTask, type TaskPriority, type TaskStatus } from '../../../../server/services/plannerService';
import { newPlannerId, todayISO, useTaskBoard } from '../usePlanner';

const COLUMNS: { id: TaskStatus; title: string; icon: React.ReactNode; accent: string; empty: string }[] = [
  { id: 'todo', title: 'To do', icon: <Circle className="h-4 w-4" />, accent: 'bg-slate-400', empty: 'Nothing waiting. Add a task above.' },
  { id: 'doing', title: 'In progress', icon: <Loader2 className="h-4 w-4" />, accent: 'bg-blue-500', empty: 'Drag a task here when you start it.' },
  { id: 'done', title: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, accent: 'bg-emerald-500', empty: 'Finished tasks land here.' },
];

const PRIORITY: Record<TaskPriority, { label: string; chip: string; dot: string }> = {
  high: { label: 'High', chip: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  medium: { label: 'Medium', chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', chip: 'bg-slate-50 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
};

const field =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

type Filter = 'all' | 'high' | 'soon';

function dueLabel(due: string | null, today: string) {
  if (!due) return null;
  if (due < today) return { text: 'Overdue', tone: 'text-rose-600' };
  if (due === today) return { text: 'Due today', tone: 'text-amber-600' };
  const days = Math.round((Date.parse(due) - Date.parse(today)) / 86_400_000);
  if (days === 1) return { text: 'Tomorrow', tone: 'text-slate-600' };
  if (days < 7) return { text: `In ${days} days`, tone: 'text-slate-600' };
  return { text: new Date(due + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), tone: 'text-slate-500' };
}

export function TaskBoardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { query, save } = useTaskBoard();
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [due, setDue] = React.useState('');
  const [filter, setFilter] = React.useState<Filter>('all');
  const [search, setSearch] = React.useState('');
  const [editing, setEditing] = React.useState<BoardTask | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  // While dragging, the board is shown from this local copy so cards move between columns smoothly.
  const [dragTasks, setDragTasks] = React.useState<BoardTask[] | null>(null);
  const dragFrom = React.useRef<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (query.isLoading) return <PageContainer><LoadingState message="Loading your task board…" /></PageContainer>;
  if (query.isError || !query.data)
    return <PageContainer><ErrorState message="Your task board could not be loaded." onRetry={() => query.refetch()} /></PageContainer>;

  const board = query.data;
  const tasks = dragTasks ?? board.tasks;
  const today = todayISO();
  const summary = boardSummary(board.tasks, today);

  const persist = (next: BoardTask[]) => save.mutate({ ...board, tasks: next });

  const visible = (t: BoardTask) => {
    if (search && !`${t.title} ${t.tag} ${t.notes}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'high') return t.priority === 'high';
    if (filter === 'soon') return !!t.due && Date.parse(t.due) - Date.parse(today) <= 3 * 86_400_000;
    return true;
  };

  const markDone = (task: BoardTask, el: Element | null, all: BoardTask[]) => {
    celebrate(originOf(el));
    const left = all.filter((t) => t.status !== 'done' && t.id !== task.id).length;
    toast.success(`"${task.title}" done`, { description: left ? `${left} task${left === 1 ? '' : 's'} left` : 'Your board is clear. Nice work!' });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    // A "#tag" in the title becomes the task's tag.
    const tagMatch = t.match(/#([\w-]{1,40})/);
    const task: BoardTask = {
      id: newPlannerId(),
      title: t.replace(/#[\w-]{1,40}/, '').trim() || t,
      notes: '',
      status: 'todo',
      priority,
      due: due || null,
      tag: tagMatch ? tagMatch[1] : '',
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    persist([task, ...board.tasks]);
    setTitle('');
    setDue('');
  };

  const toggleDone = (task: BoardTask, el: Element | null) => {
    const done = task.status !== 'done';
    const next = board.tasks.map((t) =>
      t.id === task.id ? { ...t, status: (done ? 'done' : 'todo') as TaskStatus, completed_at: done ? new Date().toISOString() : null } : t
    );
    persist(next);
    if (done) markDone(task, el, board.tasks);
  };

  // ---------- Drag and drop ----------
  const columnOf = (id: string, list: BoardTask[]): TaskStatus | null =>
    (COLUMNS.find((c) => c.id === id)?.id as TaskStatus) ?? list.find((t) => t.id === id)?.status ?? null;

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
    setDragTasks(board.tasks);
    dragFrom.current = board.tasks.find((t) => t.id === e.active.id)?.status ?? null;
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over || !dragTasks) return;
    const from = columnOf(String(active.id), dragTasks);
    const to = columnOf(String(over.id), dragTasks);
    if (!from || !to || from === to) return;
    setDragTasks((list) => {
      if (!list) return list;
      const moving = list.find((t) => t.id === active.id);
      if (!moving) return list;
      const rest = list.filter((t) => t.id !== active.id);
      const overIndex = rest.findIndex((t) => t.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : rest.length;
      return [...rest.slice(0, insertAt), { ...moving, status: to }, ...rest.slice(insertAt)];
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    let list = dragTasks ?? board.tasks;
    if (over && active.id !== over.id) {
      const a = list.findIndex((t) => t.id === active.id);
      const b = list.findIndex((t) => t.id === over.id);
      if (a >= 0 && b >= 0 && list[a].status === list[b].status) list = arrayMove(list, a, b);
    }
    const moved = list.find((t) => t.id === active.id);
    const startedIn = dragFrom.current;
    list = list.map((t) =>
      t.id === active.id ? { ...t, completed_at: t.status === 'done' ? t.completed_at ?? new Date().toISOString() : null } : t
    );
    setActiveId(null);
    setDragTasks(null);
    dragFrom.current = null;
    const changed = JSON.stringify(list.map((t) => [t.id, t.status])) !== JSON.stringify(board.tasks.map((t) => [t.id, t.status]));
    if (changed) persist(list);
    if (moved && moved.status === 'done' && startedIn !== 'done') {
      markDone(moved, document.querySelector(`[data-task-id="${moved.id}"]`), board.tasks);
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
    setDragTasks(null);
    dragFrom.current = null;
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Task Board"
        description="Everything on your plate in one board. Drag cards from To do to Done as you go. Tip: type #tag in a title to tag it."
        icon={<KanbanSquare className="h-6 w-6" />}
        actions={
          <Button variant="outline" className="gap-2" onClick={() => onNavigate('/deadlines')}>
            <CalendarClock className="h-4 w-4" /> Deadlines
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Open tasks" value={summary.open} hint={`${summary.total} in total`} icon={<ListTodo />} tone="brand" />
        <MetricCard label="Due today" value={summary.dueToday} hint={summary.dueToday ? 'Finish these first' : 'Nothing due today'} icon={<AlarmClock />} tone="warning" />
        <MetricCard label="Overdue" value={summary.overdue} hint={summary.overdue ? 'Past their due date' : 'All on time'} icon={<Flame />} tone={summary.overdue ? 'warning' : 'success'} />
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
          <ProgressRing value={summary.percent} size={64} stroke={7} barClassName="stroke-emerald-500">
            <span className="text-sm font-bold tabular-nums text-slate-900">{summary.percent}%</span>
          </ProgressRing>
          <div>
            <p className="text-[13px] font-medium text-slate-600">Completed</p>
            <p className="text-xs text-slate-500">{summary.done} of {summary.total} tasks</p>
          </div>
        </div>
      </div>

      {/* Quick add */}
      <form onSubmit={addTask} className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={cn(field, 'pl-9')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task… e.g. Finish DBMS assignment #dbms"
            aria-label="New task title"
            data-testid="task-title"
          />
        </div>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2.5 sm:flex">
          <select className={cn(field, 'sm:w-32')} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} aria-label="Priority">
            <option value="high">High priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input type="date" className={cn(field, 'min-w-0 sm:w-40')} value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
          <Button type="submit" disabled={!title.trim()} data-testid="task-add">Add</Button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Filter tasks">
          {([
            ['all', 'All'],
            ['high', 'High priority'],
            ['soon', 'Due in 3 days'],
          ] as [Filter, string][]).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={cn('relative rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors', filter === id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800')}
            >
              {filter === id && <motion.span layoutId="task-filter-pill" className="absolute inset-0 rounded-md bg-white shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className={cn(field, 'pl-9')} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks" aria-label="Search tasks" />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            const shown = colTasks.filter(visible);
            return (
              <Column key={col.id} col={col} count={colTasks.length}>
                <SortableContext items={shown.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence initial={false}>
                    {shown.map((t) => (
                      <SortableTask key={t.id} task={t} today={today} onOpen={() => setEditing(t)} onToggle={(el) => toggleDone(t, el)} />
                    ))}
                  </AnimatePresence>
                </SortableContext>
                {shown.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-500">
                    {colTasks.length ? 'No tasks match the filter.' : col.empty}
                  </p>
                )}
              </Column>
            );
          })}
        </div>
        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22,1,0.36,1)' }}>
          {activeTask ? <TaskCard task={activeTask} today={today} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>Change the details, or remove the task.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!editing.title.trim()) return;
                const prev = board.tasks.find((t) => t.id === editing.id);
                const next = board.tasks.map((t) =>
                  t.id === editing.id ? { ...editing, completed_at: editing.status === 'done' ? editing.completed_at ?? new Date().toISOString() : null } : t
                );
                persist(next);
                if (prev && prev.status !== 'done' && editing.status === 'done') markDone(editing, null, board.tasks);
                setEditing(null);
              }}
            >
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-slate-700">Title</span>
                <input autoFocus className={field} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </label>
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-slate-700">Notes</span>
                <textarea className={cn(field, 'h-24 resize-none py-2')} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Optional details, links, steps…" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Status</span>
                  <select className={field} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as TaskStatus })}>
                    {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Priority</span>
                  <select className={field} value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value as TaskPriority })}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Due date</span>
                  <input type="date" className={field} value={editing.due ?? ''} onChange={(e) => setEditing({ ...editing, due: e.target.value || null })} />
                </label>
                <label className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Tag</span>
                  <input className={field} value={editing.tag} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} placeholder="e.g. dbms" />
                </label>
              </div>
              <DialogFooter className="gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-auto gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => {
                    persist(board.tasks.filter((t) => t.id !== editing.id));
                    setEditing(null);
                    toast('Task removed');
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={!editing.title.trim()}>Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function Column({ col, count, children }: { col: (typeof COLUMNS)[number]; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <section
      ref={setNodeRef}
      aria-label={col.title}
      className={cn(
        'flex min-h-[260px] flex-col rounded-xl border bg-slate-50/70 p-3 transition-[background-color,border-color,box-shadow] duration-200',
        isOver ? 'border-blue-300 bg-blue-50/60 shadow-[inset_0_0_0_2px_rgb(94_110_239_/_0.15)]' : 'border-slate-200'
      )}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={cn('h-2 w-2 rounded-full', col.accent)} />
        <h2 className="text-sm font-semibold text-slate-800">{col.title}</h2>
        <motion.span key={count} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="ml-auto rounded-full bg-white px-2 py-px text-xs font-semibold text-slate-600 ring-1 ring-slate-200 tabular-nums">
          {count}
        </motion.span>
      </header>
      <div className="flex flex-1 flex-col gap-2.5">{children}</div>
    </section>
  );
}

function SortableTask({ task, today, onOpen, onToggle }: { task: BoardTask; today: string; onOpen: () => void; onToggle: (el: Element | null) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
    >
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && 'opacity-40')} data-task-id={task.id}>
        <TaskCard task={task} today={today} onOpen={onOpen} onToggle={onToggle} handleProps={{ ...attributes, ...listeners }} />
      </div>
    </motion.div>
  );
}

function TaskCard({
  task,
  today,
  onOpen,
  onToggle,
  handleProps,
  overlay,
}: {
  task: BoardTask;
  today: string;
  onOpen?: () => void;
  onToggle?: (el: Element | null) => void;
  handleProps?: Record<string, any>;
  overlay?: boolean;
}) {
  const done = task.status === 'done';
  const dueInfo = done ? null : dueLabel(task.due, today);
  const p = PRIORITY[task.priority];
  return (
    <div
      className={cn(
        'group relative flex gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition-[box-shadow,border-color] hover:border-slate-300 hover:shadow-md',
        overlay && 'rotate-[2deg] cursor-grabbing border-blue-300 shadow-xl',
        done && 'bg-slate-50/80'
      )}
    >
      <span className={cn('absolute inset-y-2 left-0 w-[3px] rounded-r-full', p.dot)} aria-hidden="true" />
      <motion.button
        type="button"
        whileTap={{ scale: 0.8 }}
        onClick={(e) => onToggle?.(e.currentTarget)}
        aria-label={done ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
        className={cn('mt-0.5 shrink-0 rounded-full transition-colors', done ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500')}
      >
        {done ? <CheckCircle2 className="h-[18px] w-[18px]" /> : <Circle className="h-[18px] w-[18px]" />}
      </motion.button>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className={cn('text-[13.5px] font-medium leading-snug text-slate-900', done && 'text-slate-500 line-through decoration-slate-400')}>{task.title}</p>
        {task.notes && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{task.notes}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className={cn('rounded-md px-1.5 py-px font-semibold ring-1 ring-inset', p.chip)}>{p.label}</span>
          {task.tag && <span className="rounded-md bg-violet-50 px-1.5 py-px font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">#{task.tag}</span>}
          {dueInfo && (
            <span className={cn('flex items-center gap-1 font-medium', dueInfo.tone)}>
              <CalendarClock className="h-3 w-3" /> {dueInfo.text}
            </span>
          )}
        </div>
      </button>
      <button
        type="button"
        {...handleProps}
        aria-label={`Drag "${task.title}"`}
        className="-mr-1 shrink-0 cursor-grab touch-none self-start rounded p-0.5 text-slate-300 opacity-60 transition-opacity hover:bg-slate-100 hover:text-slate-500 group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

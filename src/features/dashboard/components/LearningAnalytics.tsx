import * as React from 'react';
import { BarChart3, Clock, Binary } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DashboardAnalytics } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function LearningAnalytics({ analytics }: { analytics: DashboardAnalytics }) {
  const chartData = analytics.weekly_study_minutes.map((item) => ({
    day: item.day,
    hours: parseFloat((item.minutes / 60).toFixed(1)),
    problems: item.problems_solved,
  }));

  const totalMinutes = analytics.weekly_study_minutes.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalProblems = analytics.weekly_study_minutes.reduce((acc, curr) => acc + curr.problems_solved, 0);

  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Weekly Study Activity</CardTitle>
            <p className="text-xs text-slate-500">Hours dedicated to coursework and lab problem solving</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span className="tabular-nums">{totalHours} hrs</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Binary className="h-3.5 w-3.5 text-amber-600" />
            <span className="tabular-nums">{totalProblems} problems</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAF2" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#647089' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#647089' }}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm text-xs">
                        <div className="font-bold text-slate-900 mb-1">{label}</div>
                        <div className="text-slate-600 tabular-nums">
                          Study Time: <span className="font-semibold text-slate-900">{data.hours} hours</span>
                        </div>
                        <div className="text-slate-600 tabular-nums">
                          Problems Solved: <span className="font-semibold text-amber-700">{data.problems}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="hours" fill="#6957E8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

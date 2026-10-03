import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  type?: 'area' | 'bar';
  color?: string;
  dataKey?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  unit?: string;
  className?: string;
}

export function ChartCard({
  title,
  description,
  data,
  type = 'area',
  color = '#2563EB',
  dataKey = 'value',
  secondaryDataKey,
  secondaryColor = '#4F46E5',
  unit = '',
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#667085' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickFormatter={(v) => `${v}${unit}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-[#E4E7EC] bg-white p-2.5 shadow-sm text-xs">
                          <div className="font-semibold text-[#101828] mb-1">{label}</div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 tabular-nums text-[#475467]">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>
                                {entry.name || 'Value'}: {entry.value}
                                {unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${title})`}
                />
                {secondaryDataKey && (
                  <Area
                    type="monotone"
                    dataKey={secondaryDataKey}
                    stroke={secondaryColor}
                    strokeWidth={2}
                    fill="transparent"
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#667085' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickFormatter={(v) => `${v}${unit}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-[#E4E7EC] bg-white p-2.5 shadow-sm text-xs">
                          <div className="font-semibold text-[#101828] mb-1">{label}</div>
                          <div className="text-[#475467] tabular-nums">
                            Score: {payload[0]?.value}
                            {unit}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

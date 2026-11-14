import * as React from 'react';
import { Skeleton } from '../../../components/ui/feedback';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Bar Skeleton */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl hidden md:block" />
      </div>

      {/* AI Hero Skeleton */}
      <div className="h-44 rounded-2xl bg-slate-900/10 border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-6 w-80" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* Continue Learning Skeleton */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
        <div className="space-y-3 flex-1 max-w-xl">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg hidden sm:block" />
      </div>

      {/* Primary Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Courses Grid Skeleton */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          </div>

          {/* Today's Tasks Skeleton */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>

        {/* Right Rail Skeleton */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

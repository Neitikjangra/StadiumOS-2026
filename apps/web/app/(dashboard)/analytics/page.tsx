'use client';

import dynamic from "next/dynamic";

const AnalyticsDashboard = dynamic(() => import("@/components/analytics").then(m => ({ default: m.AnalyticsDashboard })), { loading: () => <div className="h-64 bg-surface-alt animate-pulse rounded-xl" /> });

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Performance metrics and operational intelligence</p>
        </div>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}

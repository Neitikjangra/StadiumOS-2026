"use client";

import dynamic from "next/dynamic";

const RoutingAdmin = dynamic(() => import("@/components/routing/RoutingAdmin").then(m => ({ default: m.RoutingAdmin })), { loading: () => <div className="h-64 bg-surface-alt animate-pulse rounded-xl" />, ssr: false });

export default function RoutingPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Routing & Optimization</h1>
          <p className="page-subtitle">Optimize fan flow and wayfinding across venues</p>
        </div>
      </div>
      <RoutingAdmin />
    </div>
  );
}

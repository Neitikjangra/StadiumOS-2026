"use client";

import dynamic from "next/dynamic";

const RoutingAdmin = dynamic(() => import("@/components/routing/RoutingAdmin").then(m => ({ default: m.RoutingAdmin })), { loading: () => <div className="h-64 bg-surface-alt animate-pulse rounded-xl" />, ssr: false });

export default function RoutingPage() {
  return (
    <div className="h-full">
      <RoutingAdmin />
    </div>
  );
}

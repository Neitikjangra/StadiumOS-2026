import DashboardShell from "@/components/layout/DashboardShell";

export default function RoutingLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

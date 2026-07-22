import DashboardShell from "@/components/layout/DashboardShell";

export default function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

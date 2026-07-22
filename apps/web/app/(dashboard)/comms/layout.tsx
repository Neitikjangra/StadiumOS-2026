import DashboardShell from "@/components/layout/DashboardShell";

export default function CommsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

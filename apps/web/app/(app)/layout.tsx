import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell-grid">
      <AppSidebar />
      <div className="min-w-0">
        <TopNavbar />
        <main className="px-6 pb-10 pt-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

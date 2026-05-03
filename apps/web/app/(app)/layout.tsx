import { AppSidebar } from "@/components/layout/app-sidebar";
import { Footer } from "@/components/layout/footer";
import { TopNavbar } from "@/components/layout/top-navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell-grid">
      <AppSidebar />
      <div className="flex min-w-0 flex-col">
        <TopNavbar />
        <main className="flex-1 px-6 pb-10 pt-6 lg:px-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

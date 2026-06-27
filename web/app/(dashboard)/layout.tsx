import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AuthGate from "@/components/layout/AuthGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen relative bg-dots">
        <Sidebar />
        <TopBar />
        <main className="ml-[260px] pt-24 min-h-screen relative z-10 px-gutter pb-xl flex flex-col gap-gutter">
          {children}
        </main>
      </div>
    </AuthGate>
  );
}

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import ReportButton from "@/components/app/ReportButton";
import MobileTabBar from "@/components/app/MobileTabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-screen" style={{ background: "#050505" }}>
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 min-h-screen md:ml-[240px] pb-[calc(56px+env(safe-area-inset-bottom,0px))] md:pb-0 overflow-x-hidden">
        {children}
      </main>

      <MobileTabBar />
<ReportButton />

    </div>
  );
}

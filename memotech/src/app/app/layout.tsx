import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-screen" style={{ background: "#050505" }}>
      <Sidebar />
      <main className="flex-1 min-h-screen" style={{ marginLeft: 240 }}>
        {children}
      </main>
    </div>
  );
}
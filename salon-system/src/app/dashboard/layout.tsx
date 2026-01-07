import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* 1. Sidebar (Fixed Width: w-64) */}
      <Sidebar />

      {/* 2. Main Wrapper - Pushes content right by w-64 (16rem) */}
      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
        
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
        
      </div>
    </div>
  );
}
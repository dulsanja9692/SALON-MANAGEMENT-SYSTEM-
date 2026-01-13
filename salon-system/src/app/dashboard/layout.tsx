import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar is fixed width */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content scrolls independently */}
      <main className="flex-1 h-screen overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
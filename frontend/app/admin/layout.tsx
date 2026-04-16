import Sidebar from "../components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 min-h-[calc(100vh-3.5rem)] overflow-auto">
        {children}
      </main>
    </div>
  );
}

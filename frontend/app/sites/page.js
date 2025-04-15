import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="p-4">
        <h1 className="text-4xl mb-4 font-medium">Sites</h1>
      </main>
    </ProtectedRoute>
  );
}

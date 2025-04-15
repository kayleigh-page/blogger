import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="p-4">
        <h1 className="text-4xl mb-4 font-medium">Blogger</h1>
      </main>
    </ProtectedRoute>
  );
}

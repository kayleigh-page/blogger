export default function DashboardLayout({ children }) {
  return (
    <main>
      <h1 className="text-4xl font-medium">Sites</h1>
      <div>{children}</div>
    </main>
  );
}

// app/(main)/layout.tsx
import { Navbar } from "@/components/layout/Navbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Si no hay sesión, mandamos al login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}

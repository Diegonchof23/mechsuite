export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      {children}
    </div>
  );
}
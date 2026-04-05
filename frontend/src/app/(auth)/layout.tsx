import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-lg font-semibold mb-8">
        Identification ID
      </Link>
      <div className="w-full max-w-sm bg-background border border-border rounded-xl p-8 shadow-sm">
        {children}
      </div>
      <Link
        href="/"
        className="mt-6 text-sm text-muted hover:text-foreground"
      >
        Back to home
      </Link>
    </div>
  );
}

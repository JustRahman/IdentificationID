import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { AppIcon } from "@/components/app/icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Logo className="mb-8" />
        <div className="w-full max-w-[400px] bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          {children}
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500 text-center max-w-lg">
          <AppIcon name="shield" className="w-3.5 h-3.5 text-slate-400" />
          Official registry operated by Global Product Identification Inc., Canada.
        </p>
        <Link href="/" className="mt-3 text-sm text-slate-500 hover:text-slate-900">
          Back to home
        </Link>
      </div>
    </div>
  );
}

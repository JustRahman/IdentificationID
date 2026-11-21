import Link from "next/link";

/** Small grey breadcrumb: Home / Registry / Name. Last item is the current page. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-slate-300" aria-hidden="true">/</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-slate-900 transition-colors">{it.label}</Link>
            ) : (
              <span className="text-slate-700 truncate max-w-[16rem] sm:max-w-md" aria-current="page">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

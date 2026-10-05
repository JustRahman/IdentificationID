/**
 * Minimal Markdown renderer for legal documents (server component).
 * Supports: #/##/### headings, paragraphs, "- " lists, **bold**, "---" rules,
 * and auto-links e-mail addresses and identificationid.com URLs.
 */
import type { ReactNode } from "react";

const INLINE = /(\*\*[^*]+\*\*|[A-Za-z0-9._%+-]+@identificationid\.com|identificationid\.com(?:\/[A-Za-z0-9/_-]*)?)/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(INLINE);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (/^[A-Za-z0-9._%+-]+@identificationid\.com$/.test(part)) {
      return <a key={key} href={`mailto:${part}`} className="text-accent hover:underline">{part}</a>;
    }
    if (/^identificationid\.com/.test(part)) {
      const p = part.replace(/^identificationid\.com/, "") || "/";
      return <a key={key} href={p} className="text-accent hover:underline">{part}</a>;
    }
    return part;
  });
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function LegalMarkdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const k = `p${blocks.length}`;
      blocks.push(<p key={k}>{inline(para.join(" "), k)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const k = `l${blocks.length}`;
      blocks.push(
        <ul key={k} className="list-disc pl-5 space-y-1">
          {list.map((item, i) => <li key={i}>{inline(item, `${k}-${i}`)}</li>)}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      flushPara(); flushList();
      const level = m[1].length;
      const text = m[2];
      const k = `h${blocks.length}`;
      if (level === 1) blocks.push(<h2 key={k} id={slugify(text)} className="text-xl font-semibold text-foreground pt-4">{text}</h2>);
      else if (level === 2) blocks.push(<h2 key={k} id={slugify(text)} className="text-base font-semibold text-foreground pt-4 scroll-mt-20">{text}</h2>);
      else blocks.push(<h3 key={k} id={slugify(text)} className="text-sm font-semibold text-foreground pt-2">{text}</h3>);
      continue;
    }
    if (line === "---") { flushPara(); flushList(); blocks.push(<hr key={`r${blocks.length}`} className="border-border" />); continue; }
    if (line.startsWith("- ")) { flushPara(); list.push(line.slice(2)); continue; }
    flushList();
    para.push(line);
  }
  flushPara(); flushList();

  return <div className="space-y-3 text-sm leading-relaxed text-muted">{blocks}</div>;
}

/** Section headings ("## ...") for a table of contents. */
export function legalToc(source: string): { id: string; text: string }[] {
  return source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^##\s+/.test(l))
    .map((l) => {
      const text = l.replace(/^##\s+/, "");
      return { id: slugify(text), text };
    });
}

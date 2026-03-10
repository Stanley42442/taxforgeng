import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export const TableOfContents = ({ items }: TableOfContentsProps) => (
  <nav className="rounded-xl border border-border bg-card p-5 mb-8" aria-label="Table of contents">
    <div className="flex items-center gap-2 mb-3">
      <List className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">In This Article</h2>
    </div>
    <ol className={`space-y-1 ${items.length >= 6 ? 'sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0' : ''}`}>
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors flex items-baseline gap-2 rounded px-2 py-1"
          >
            <span className="text-xs text-muted-foreground/60 font-mono">{i + 1}.</span>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

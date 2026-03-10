import { User, Calendar } from 'lucide-react';

interface AuthorBoxProps {
  date: string;
  updated?: string;
  author?: string;
}

export const AuthorBox = ({ date, updated, author = 'TaxForge NG Team' }: AuthorBoxProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3 mb-8">
    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground">
      <User className="h-5 w-5" />
    </div>
    <div className="border-l border-border pl-4">
      <p className="text-sm font-semibold text-foreground">{author}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Published {date}
        </span>
        {updated && <span>· Updated {updated}</span>}
      </div>
    </div>
  </div>
);

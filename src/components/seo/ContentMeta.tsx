import { Calendar } from 'lucide-react';

interface ContentMetaProps {
  published: string;
  publishedLabel: string;
  updated?: string;
  updatedLabel?: string;
}

export const ContentMeta = ({ published, publishedLabel, updated, updatedLabel }: ContentMetaProps) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
    <Calendar className="h-4 w-4" aria-hidden="true" />
    <span>
      Published: <time dateTime={published}>{publishedLabel}</time>
    </span>
    {updated && updatedLabel && (
      <span>
        | Updated: <time dateTime={updated}>{updatedLabel}</time>
      </span>
    )}
  </div>
);

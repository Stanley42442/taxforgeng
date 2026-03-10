import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
}

export const BlogCard = ({ slug, title, excerpt, date, category, readTime, featured }: BlogPostMeta) => (
  <Link
    to={`/blog/${slug}`}
    className={`rounded-xl border bg-card flex flex-col transition-all group ${
      featured
        ? 'md:col-span-2 border-t-2 border-t-primary border-border p-8 hover:shadow-lg'
        : 'border-border p-6 hover:shadow-md'
    } hover:border-primary/40`}
  >
    <div className="flex items-center gap-2 mb-3">
      <Badge variant="outline" className="text-xs">{category}</Badge>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" /> {readTime}
      </span>
    </div>
    <h3 className={`font-bold text-foreground mb-2 group-hover:text-primary transition-colors ${featured ? 'text-xl' : 'text-lg'}`}>
      {title}
    </h3>
    <p className="text-sm text-muted-foreground mb-4 flex-grow">{excerpt}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{date}</span>
      <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
        Read <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  </Link>
);

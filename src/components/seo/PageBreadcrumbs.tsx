import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface BreadcrumbStep {
  label: string;
  href?: string;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbStep[];
}

export const PageBreadcrumbs = ({ items }: PageBreadcrumbsProps) => (
  <Breadcrumb className="mb-6">
    <BreadcrumbList>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <BreadcrumbItem key={index}>
            {isLast ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link to={item.href || '/'}>{item.label}</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        );
      })}
    </BreadcrumbList>
  </Breadcrumb>
);

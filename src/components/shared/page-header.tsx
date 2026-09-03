import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl break-words text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface WidgetCardProps {
  title?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export function WidgetCard({
  title,
  icon: Icon,
  iconColor = "text-primary",
  children,
  className,
  headerAction,
  noPadding = false,
}: WidgetCardProps) {
  return (
    <Card
      className={cn(
        "widget-card",
        className
      )}
    >
      {title && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn("p-2 rounded-xl bg-primary/10", iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          {headerAction}
        </CardHeader>
      )}
      <CardContent className={cn(noPadding && "p-0", !title && "pt-6")}>
        {children}
      </CardContent>
    </Card>
  );
}

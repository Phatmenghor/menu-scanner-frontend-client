import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  viewAllLink,
  viewAllText = "View All",
  className,
}: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6",
        className
      )}
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />}
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {viewAllLink && (
        <Link href={viewAllLink}>
          <Button variant="outline" className="gap-2 group">
            {viewAllText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      )}
    </div>
  );
};

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper = ({
  children,
  className,
}: SectionWrapperProps) => {
  return <section className={cn("mb-12", className)}>{children}</section>;
};

interface GridWrapperProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const GridWrapper = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 6,
  className,
}: GridWrapperProps) => {
  const gridCols = cn(
    "grid",
    cols.default === 1 && "grid-cols-1",
    cols.default === 2 && "grid-cols-2",
    cols.default === 3 && "grid-cols-3",
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`,
    className
  );

  return <div className={gridCols}>{children}</div>;
};

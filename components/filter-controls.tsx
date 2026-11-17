"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClearFilterButton({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0"
      aria-label={`Rimuovi filtro ${label}`}
      onClick={onClear}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}

export function MobileFilters({
  activeCount,
  children,
  className,
}: {
  activeCount: number;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="sm:hidden"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {open ? "Nascondi filtri" : "Filtri"}
        {activeCount > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>
      <div className={cn(open ? "grid gap-3" : "hidden", "sm:contents", className)}>{children}</div>
    </>
  );
}

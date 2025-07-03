"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface BaseTableRowProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function BaseTableRow({ isExpanded, onToggle, children }: BaseTableRowProps) {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
      {children}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
} 
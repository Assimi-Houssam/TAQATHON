import React from "react";
import { Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Column, ColumnVisibilityState } from "../types";

interface ColumnVisibilityToggleProps<T> {
  columns: Column<T>[];
  columnVisibility: ColumnVisibilityState<T>;
  onColumnVisibilityChange: (columnVisibility: ColumnVisibilityState<T>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * ColumnVisibilityToggle - Controls for showing/hiding table columns
 * 
 * Features:
 * - Dropdown with checkboxes for each column
 * - Show/hide all functionality
 * - Persist column visibility state
 * - Only show hideable columns
 */
export function ColumnVisibilityToggle<T>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  open,
  onOpenChange,
}: ColumnVisibilityToggleProps<T>) {
  const hideableColumns = columns.filter(col => col.enableHiding !== false);
  
  if (hideableColumns.length === 0) {
    return null;
  }

  const visibleCount = hideableColumns.filter(col => 
    columnVisibility[col.id] !== false
  ).length;

  const handleToggleColumn = (columnId: string, checked: boolean) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnId]: checked,
    });
  };

  const handleShowAll = () => {
    const newVisibility = { ...columnVisibility };
    hideableColumns.forEach(col => {
      newVisibility[col.id] = true;
    });
    onColumnVisibilityChange(newVisibility);
  };

  const handleHideAll = () => {
    const newVisibility = { ...columnVisibility };
    hideableColumns.forEach(col => {
      newVisibility[col.id] = false;
    });
    onColumnVisibilityChange(newVisibility);
  };

  return (
    <DropdownMenu 
      open={open}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Additional Columns ({visibleCount}/{hideableColumns.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Show/Hide All buttons */}
        <div className="flex gap-1 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowAll}
            className="h-6 px-2 text-xs flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Show All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHideAll}
            className="h-6 px-2 text-xs flex-1"
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Hide All
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Individual column toggles */}
        {hideableColumns.map((column) => {
          const isVisible = columnVisibility[column.id] !== false;
          const toggleColumn = () => {
            handleToggleColumn(column.id, !isVisible);
          };
          
          return (
            <DropdownMenuItem
              key={column.id}
              onClick={(e) => {
                e.preventDefault();
                toggleColumn();
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center w-full">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={isVisible}
                  onCheckedChange={(checked) => 
                    handleToggleColumn(column.id, checked as boolean)
                  }
                  className="mr-2"
                />
                <label
                  htmlFor={`column-${column.id}`}
                  className="flex-1 cursor-pointer"
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   e.stopPropagation();
                  // }}
                >
                  {column.header}
                </label>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
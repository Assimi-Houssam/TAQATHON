import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownToLine } from "lucide-react";
import { FaFileExcel, FaFileCode, FaFileCsv, FaPrint } from "react-icons/fa";

interface ExportMenuProps {
  onExportXLSX: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
}

export const ExportMenu = ({
  onExportXLSX,
  onExportJSON,
  onExportCSV,
  onPrint,
}: ExportMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="outline"
        className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-200"
      >
        <ArrowDownToLine className="h-4 w-4 mr-2 opacity-50" />
        Export
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      align="end" 
      className="w-48 p-1 bg-background/95 backdrop-blur-sm border-border/50"
    >
      {[
        { label: "Excel", onClick: onExportXLSX, icon: FaFileExcel },
        { label: "JSON", onClick: onExportJSON, icon: FaFileCode },
        { label: "CSV", onClick: onExportCSV, icon: FaFileCsv },
        { label: "Print", onClick: onPrint, icon: FaPrint },
      ].map((item, index) => (
        <DropdownMenuItem
          key={index}
          onClick={item.onClick}
          className="cursor-pointer px-3 py-2 hover:bg-accent/50 rounded-sm transition-colors duration-150"
        >
          <item.icon className="mr-2 h-4 w-4 opacity-50" />
          <span className="text-sm">{item.label}</span>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
); 
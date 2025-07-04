import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownToLine } from "lucide-react";
import { FaFileExport, FaPrint } from "react-icons/fa";

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
        className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all duration-300"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-shimmer transition-opacity" />
        <ArrowDownToLine className="h-4 w-4 mr-2" />
        Export Statistics
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      align="end" 
      className="w-56 p-2 bg-white/90 backdrop-blur-xl border-gray-100/50 rounded-xl shadow-xl"
    >
      {[
        { label: "Export as XLSX", onClick: onExportXLSX, icon: FaFileExport },
        { label: "Export as JSON", onClick: onExportJSON, icon: FaFileExport },
        { label: "Export as CSV", onClick: onExportCSV, icon: FaFileExport },
        { label: "Print Statistics", onClick: onPrint, icon: FaPrint },
      ].map((item, index) => (
        <DropdownMenuItem
          key={index}
          onClick={item.onClick}
          className="cursor-pointer px-4 py-2.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 my-0.5"
        >
                      <item.icon className="mr-3 h-4 w-4 text-blue-600" />
          <span className="text-gray-700">{item.label}</span>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
); 
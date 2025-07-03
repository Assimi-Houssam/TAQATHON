import { Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ReferenceBadgeProps {
  label: string
  value: string
}

export function ReferenceBadge({ label, value }: ReferenceBadgeProps) {
  return (
    <div className="flex items-center space-x-1 rounded-lg bg-zinc-50/50 border border-zinc-100/50 px-3 py-1.5 text-xs">
      <span className="font-medium text-zinc-500">{label}:</span>
      <span className="font-semibold text-zinc-900">{value}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-2 hover:bg-zinc-100/50 transition-colors"
            onClick={() => navigator.clipboard.writeText(value)}
          >
            <Copy className="h-3 w-3 text-zinc-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Copy reference</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
} 
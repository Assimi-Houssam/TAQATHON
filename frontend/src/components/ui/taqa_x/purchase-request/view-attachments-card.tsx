import { Button } from "@/components/ui/button";
import { CustomCard } from "@/components/ui/taqa_x/custom-card";
import { Download, Paperclip } from "lucide-react";

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

interface ViewAttachmentsCardProps {
  title: string;
  attachments: Attachment[];
}

export function ViewAttachmentsCard({
  title,
  attachments,
}: ViewAttachmentsCardProps) {
  return (
    <CustomCard title={title}>
      <div className="grid grid-cols-2 gap-4">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Paperclip className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">{attachment.name}</p>
                <p className="text-sm text-gray-500">{attachment.size}</p>
              </div>
            </div>
            {attachment.url && (
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 hover:bg-blue-100 hover:text-blue-900 text-blue-500"
                onClick={() => window.open(attachment.url, "_blank")}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    </CustomCard>
  );
}

import { Attachment } from "@/components/ui/taqa_x/purchase-request/view-attachments-card";
import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function useAttachments(
  attachments: string[] | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["attachments", attachments],
    queryFn: async () => {
      if (!attachments) return [];

              const attachmentPromises = attachments.map(async (id) => {
        try {
          // TODO: Backend needs to implement /documents/:id endpoint for file metadata
          // For now, fallback to direct download URL
          return {
            id,
            name: `Attachment ${id}`,
            size: "Unknown",
            url: `${process.env.NEXT_PUBLIC_API_URL}/anomaly/download-attachment/${id}`,
          };
        } catch (error) {
          console.error(`Error fetching attachment ${id}:`, error);
          return null;
        }
      });

      return (await Promise.all(attachmentPromises)).filter(
        (a): a is Attachment => a !== null
      );
    },
    enabled,
  });
}

import { apiClient } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function StartChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chat_name,
      chat_description,
      chat_members,
      chat_type,
    }: {
      chat_name: string;
      chat_description: string;
      chat_members: number[];
      chat_type: string;
    }) => {
      const { data } = await apiClient.post(`/chats`, {
        chat_name,
        chat_description,
        chat_members,
        chat_type,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["CreateChat"] });
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });
}

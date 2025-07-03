import { apiClient } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Message, User } from "@/types/entities";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sender_id,
      chatId,
      content,
      sender,
    }: {
      sender_id: number;
      chatId: number;
      content: string;
      sender: User;
    }) => {
      const { data } = await apiClient.post(`/messages/chat/${chatId}`, {
        sender_id,
        content,
      });
      return data as Message;
    },
    onMutate: async ({ chatId, content, sender }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["messages", chatId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(["messages", chatId]);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: Date.now(), // Temporary ID
        content,
        sender,
        created_at: new Date(),
      };

      // Optimistically update the messages
      queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) => {
        return [...old, optimisticMessage];
      });

      return { previousMessages };
    },
    onError: (error, variables, context) => {
      // Revert the optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", variables.chatId], context.previousMessages);
      }
      
      if (error instanceof Error) {
        toast.error(`Failed to send message: ${error.message}`);
      } else {
        toast.error("Failed to send message");
      }
    },
    onSuccess: (newMessage, variables) => {
      // Update the messages with the actual server response
      queryClient.setQueryData<Message[]>(["messages", variables.chatId], (old = []) => {
        const filtered = old.filter(msg => msg.id !== Date.now()); // Remove optimistic message
        return [...filtered, newMessage];
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["messages", variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] }); // Update chat list for last message
    },
  });
}

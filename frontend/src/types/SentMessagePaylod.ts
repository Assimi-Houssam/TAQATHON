interface SentMessage {
  chat_id: number;
  message: {
    sender_id: number;
    content: string;
  };
}

export type { SentMessage };
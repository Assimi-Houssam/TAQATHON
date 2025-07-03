import { SentMessage } from "@/types/SentMessagePaylod";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface OnlineStatusEvents {
  onStatusChange?: (userId: number, status: "online" | "offline") => void;
  onTypingChange?: (userId: number, chatId: number, isTyping: boolean) => void;
}

interface Data {
  userId: number;
  status: "online" | "offline";
}

interface TypingData {
  userId: number;
  chatId: number;
  isTyping: boolean;
}

class SocketService {
  private static instance: SocketService;
  private chat_socket: Socket | null = null;
  private status_socket: Socket | null = null;
  private onlineUsers: Set<number> = new Set();
  private typingUsers: Map<number, Set<number>> = new Map(); // chatId -> Set of typing userIds
  private statusListeners: OnlineStatusEvents = {};
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 1000;

  private readonly CHAT_SOCKET_URL =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:4800";
  private readonly STATUS_SOCKET_URL =
    process.env.NEXT_PUBLIC_STATUS_URL || "http://localhost:4801";

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private handleReconnect(socket: Socket, socketType: "chat" | "status") {
    this.reconnectAttempts++;
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        console.log(`Attempting to reconnect ${socketType} socket...`);
        socket.connect();
      }, this.RECONNECT_DELAY * this.reconnectAttempts);
    } else {
      toast.error(
        `Failed to reconnect to ${socketType} after multiple attempts`
      );
    }
  }

  connect(token: string) {
    if (!this.chat_socket) {
      this.chat_socket = io(`${this.CHAT_SOCKET_URL}/chats`, {
        auth: { token },
        transports: ["websocket"],
        autoConnect: false,
        reconnection: false, // We'll handle reconnection manually
      });

      try {
        this.chat_socket.connect();

        this.chat_socket.on("connect", () => {
          console.log("Chat socket connected");
          this.reconnectAttempts = 0;
        });

        this.chat_socket.on("connect_error", (error) => {
          console.error("Chat socket connection error:", error);
          toast.error("Error connecting to chat");
          if (error.message.includes("authentication")) {
            this.disconnect();
          } else {
            this.handleReconnect(this.chat_socket!, "chat");
          }
        });

        this.chat_socket.on("disconnect", (reason) => {
          console.log("Chat socket disconnected:", reason);
          if (reason === "io server disconnect") {
            // Disconnected by server, attempt to reconnect
            this.handleReconnect(this.chat_socket!, "chat");
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error connecting to chat");
        }
      }
    }

    if (!this.status_socket) {
      this.status_socket = io(`${this.STATUS_SOCKET_URL}/status`, {
        auth: { token },
        transports: ["websocket"],
        autoConnect: false,
        reconnection: false,
      });

      this.status_socket.connect();

      this.status_socket.on("connect", () => {
        console.log("Status socket connected");
        this.reconnectAttempts = 0;
      });

      this.status_socket.on("connect_error", (error) => {
        console.error("Status socket connection error:", error);
        this.handleReconnect(this.status_socket!, "status");
      });

      this.status_socket.on("statusChange", ({ userId, status }: Data) => {
        if (status === "online") {
          this.onlineUsers.add(userId);
        } else {
          this.onlineUsers.delete(userId);
          // Clear typing status when user goes offline
          this.typingUsers.forEach((users, chatId) => {
            if (users.has(userId)) {
              users.delete(userId);
              this.statusListeners.onTypingChange?.(userId, chatId, false);
            }
          });
        }
        this.statusListeners.onStatusChange?.(userId, status);
      });

      this.status_socket.on(
        "typing",
        ({ userId, chatId, isTyping }: TypingData) => {
          let chatTypingUsers = this.typingUsers.get(chatId);
          if (!chatTypingUsers) {
            chatTypingUsers = new Set();
            this.typingUsers.set(chatId, chatTypingUsers);
          }

          if (isTyping) {
            chatTypingUsers.add(userId);
          } else {
            chatTypingUsers.delete(userId);
          }

          this.statusListeners.onTypingChange?.(userId, chatId, isTyping);
        }
      );
    }

    return this.chat_socket;
  }

  disconnect() {
    if (this.chat_socket) {
      this.chat_socket.disconnect();
      this.chat_socket = null;
    }
    if (this.status_socket) {
      this.status_socket.disconnect();
      this.status_socket = null;
    }
    this.onlineUsers.clear();
    this.typingUsers.clear();
  }

  getSocket(): Socket | null {
    return this.chat_socket;
  }

  emit(event: string, data: SentMessage) {
    if (this.chat_socket?.connected) {
      this.chat_socket.emit(event, data);
    } else {
      console.warn("Socket is not connected. Message not sent:", {
        event,
        data,
      });
      toast.error("Error sending message");
    }
  }

  emitTyping(chatId: number, userId: number, isTyping: boolean) {
    if (this.status_socket?.connected) {
      this.status_socket.emit("typing", { chatId, userId, isTyping });
    }
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  getTypingUsers(chatId: number): Set<number> {
    return this.typingUsers.get(chatId) || new Set();
  }

  onStatusChange(
    callback: (userId: number, status: "online" | "offline") => void
  ) {
    this.statusListeners.onStatusChange = callback;
  }

  onTypingChange(
    callback: (userId: number, chatId: number, isTyping: boolean) => void
  ) {
    this.statusListeners.onTypingChange = callback;
  }

  removeStatusListeners() {
    this.statusListeners = {};
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    if (this.chat_socket) {
      this.chat_socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.chat_socket) {
      this.chat_socket.off(event);
    }
  }
}

export const socketService = SocketService.getInstance();

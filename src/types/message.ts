export interface Message {
      id: string;
      senderId: string;
      receiverId: string;
      content: string;
      timestamp: Date;
      read: boolean;
    }

    export interface Conversation {
      id: string;
      participants: string[];
      lastMessage?: {
        content: string;
        timestamp: Date;
        senderId: string;
      };
      updatedAt: Date;
    }

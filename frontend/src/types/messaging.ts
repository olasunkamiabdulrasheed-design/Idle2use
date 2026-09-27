export interface Conversation {
  id: number;
  participants: number[];
  participant_names: string[];
  title: string;
  last_message: {
    body: string;
    sender: string;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  sender_username: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface UserOption {
  id: number;
  username: string;
}

/** Stage 8: conversations + messages API. */

import type { Conversation, Message, UserOption } from "../types/messaging";
import { authedRequest } from "./client";

export function listConversations(): Promise<Conversation[]> {
  return authedRequest("/api/conversations/");
}

export function createConversation(otherUserId: number): Promise<Conversation> {
  return authedRequest("/api/conversations/", {
    method: "POST",
    body: JSON.stringify({ participants: [otherUserId] }),
  });
}

export function listMessages(conversationId: number): Promise<Message[]> {
  return authedRequest(`/api/conversations/${conversationId}/messages/`);
}

export function sendMessage(conversationId: number, body: string): Promise<Message> {
  return authedRequest(`/api/conversations/${conversationId}/messages/`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function listUsers(): Promise<UserOption[]> {
  return authedRequest("/api/auth/users/");
}

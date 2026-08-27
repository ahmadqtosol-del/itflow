/**
 * Real API-backed message service.
 *
 * All message/conversation data comes from the FastAPI backend.
 * No mock fallback is used.
 */

import { apiClient } from './client';

function adaptMessage(m) {
  if (!m) return null;

  return {
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    body: m.body,
    read: Boolean(m.read),
    createdAt: m.created_at,

    // Keep original backend object available if needed.
    _raw: m,
  };
}

function adaptConversation(c) {
  if (!c) return null;

  const unreadCount = Number(c.unread_count || 0);

  return {
    id: c.id,

    otherUserId: c.other_user_id,

    participant: {
      id: c.other_user_id,
      name: c.other_user_name || 'Unknown User',
      department: c.other_user_department || '',
      avatarColor: c.other_user_avatar_color,
      status: c.other_user_status,
    },

    lastMessage: c.last_message || '',
    lastMessageAt: c.last_message_at,
    unreadCount,
    updatedAt: c.updated_at,

    unread: unreadCount > 0,

    online: ['Active', 'Available', 'Online'].includes(
      c.other_user_status,
    ),
  };
}

export const messageService = {
  /**
   * Get users available for direct messaging.
   */
  async listDirectory() {
    const res = await apiClient.get('/directory');

    if (!Array.isArray(res)) {
      return [];
    }

    return res;
  },

  /**
   * Get all conversations belonging to the current user.
   */
  async listConversations() {
    const res = await apiClient.get('/conversations');

    if (!Array.isArray(res)) {
      return [];
    }

    return res
      .map(adaptConversation)
      .filter(Boolean);
  },

  /**
   * Get an existing 1:1 conversation or create one.
   */
  async getOrCreateConversation(otherUserId) {
    if (!otherUserId) {
      throw new Error('A recipient is required.');
    }

    const res = await apiClient.post('/conversations', {
      other_user_id: otherUserId,
    });

    return adaptConversation(res);
  },

  /**
   * Get all messages in a conversation.
   */
  async listMessages(conversationId) {
    if (!conversationId) {
      return [];
    }

    const res = await apiClient.get(
      `/conversations/${conversationId}/messages`,
    );

    if (!Array.isArray(res)) {
      return [];
    }

    return res
      .map(adaptMessage)
      .filter(Boolean);
  },

  /**
   * Send a message.
   *
   * The backend response is the authoritative persisted message.
   */
  async send(conversationId, body) {
    if (!conversationId) {
      throw new Error('Conversation ID is required.');
    }

    const trimmedBody = String(body || '').trim();

    if (!trimmedBody) {
      throw new Error('Message cannot be empty.');
    }

    const res = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      {
        body: trimmedBody,
      },
    );

    const message = adaptMessage(res);

    if (!message) {
      throw new Error('The server returned an invalid message.');
    }

    return message;
  },

  /**
   * Mark all unread messages in a conversation as read.
   *
   * The backend intentionally returns HTTP 204 No Content.
   * Therefore this method does not expect a response body.
   */
  async markRead(conversationId) {
    if (!conversationId) {
      return;
    }

    await apiClient.post(
      `/conversations/${conversationId}/read`,
      {},
    );

    return true;
  },
};
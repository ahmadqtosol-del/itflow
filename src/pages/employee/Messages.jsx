import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Edit } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import UserAvatar from '../../components/common/UserAvatar';
import MessageList from '../../components/messages/MessageList';
import MessageComposer from '../../components/messages/MessageComposer';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';

import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

import { messageService } from '../../services/api/messageService';
import { wsClient } from '../../services/websocket/wsClient';

import { timeAgo } from '../../utils/format';
import { cn } from '../../utils/cn';

function getUserAvatarColor(user) {
  return user?.avatarColor ?? user?.avatar_color;
}

function getParticipantName(conversation) {
  return conversation?.participant?.name || 'Unknown user';
}

function getParticipantDepartment(conversation) {
  return (
    conversation?.participant?.department ||
    conversation?.participant?.role ||
    ''
  );
}

/* -------------------------------------------------------------------------- */
/* New Conversation Modal                                                     */
/* -------------------------------------------------------------------------- */

function NewConversationModal({
  open,
  onClose,
  onSelect,
}) {
  const [directory, setDirectory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch('');
      return undefined;
    }

    let cancelled = false;

    setLoading(true);

    messageService
      .listDirectory()
      .then((users) => {
        if (cancelled) return;

        setDirectory(
          Array.isArray(users) ? users : [],
        );
      })
      .catch(() => {
        if (!cancelled) {
          setDirectory([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const normalizedSearch = search
    .trim()
    .toLowerCase();

  const filtered = directory.filter((user) => {
    if (!user) return false;

    if (!normalizedSearch) {
      return true;
    }

    const name = String(user.name || '').toLowerCase();
    const department = String(
      user.department || '',
    ).toLowerCase();
    const role = String(
      user.role || '',
    ).toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      department.includes(normalizedSearch) ||
      role.includes(normalizedSearch)
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Message"
      size="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium"
          style={{
            color: 'var(--text-secondary)',
          }}
        >
          Cancel
        </button>
      }
    >
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or department…"
        />

        {loading ? (
          <p
            className="py-4 text-center text-sm"
            style={{
              color: 'var(--text-muted)',
            }}
          >
            Loading…
          </p>
        ) : filtered.length === 0 ? (
          <p
            className="py-4 text-center text-sm"
            style={{
              color: 'var(--text-muted)',
            }}
          >
            No users found.
          </p>
        ) : (
          <div className="max-h-72 space-y-0.5 overflow-y-auto">
            {filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onSelect(user);
                  onClose();
                }}
                className="focus-ring flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left"
                style={{
                  background: 'transparent',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background =
                    'var(--bg-elevated)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background =
                    'transparent';
                }}
              >
                <UserAvatar
                  name={user.name || 'User'}
                  color={getUserAvatarColor(user)}
                  size="sm"
                />

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    style={{
                      color:
                        'var(--text-primary)',
                    }}
                  >
                    {user.name ||
                      'Unknown user'}
                  </p>

                  <p
                    className="truncate text-xs"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    {user.department ||
                      user.role ||
                      ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Employee Messages                                                         */
/* -------------------------------------------------------------------------- */

export default function Messages() {
  const user = useAuthStore((state) => state.user);
  const pushToast = useUiStore((state) => state.pushToast);

  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const messageIds = useRef(new Set());
  const requestIdRef = useRef(0);

  /* ---------------------------------------------------------------------- */
  /* Load conversations                                                     */
  /* ---------------------------------------------------------------------- */

  const loadConversations = useCallback(async () => {
    const all =
      await messageService.listConversations();

    const safeConversations = Array.isArray(all)
      ? all
      : [];

    setConversations(safeConversations);

    return safeConversations;
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadConversations()
      .then((all) => {
        if (cancelled) return;

        if (all.length > 0) {
          setActiveId((current) => current || all[0].id);
        }
      })
      .catch((error) => {
        if (cancelled) return;

        pushToast({
          type: 'error',
          title: 'Failed to load conversations',
          message:
            error?.message ||
            'Unable to load conversations.',
        });

        setConversations([]);
      });

    return () => {
      cancelled = true;
    };
  }, [loadConversations, pushToast]);

  /* ---------------------------------------------------------------------- */
  /* Load messages                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      messageIds.current.clear();
      return undefined;
    }

    const requestId =
      ++requestIdRef.current;

    let cancelled = false;

    messageIds.current.clear();
    setMessages([]);

    messageService
      .listMessages(activeId)
      .then((loadedMessages) => {
        if (
          cancelled ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        const safeMessages =
          Array.isArray(loadedMessages)
            ? loadedMessages
            : [];

        const ids = new Set();

        safeMessages.forEach((message) => {
          if (message?.id != null) {
            ids.add(String(message.id));
          }
        });

        messageIds.current = ids;

        setMessages(safeMessages);

        messageService
          .markRead(activeId)
          .catch(() => {});

        setConversations((previous) =>
          (previous || []).map((conversation) =>
            conversation.id === activeId
              ? {
                  ...conversation,
                  unread: false,
                  unreadCount: 0,
                }
              : conversation,
          ),
        );
      })
      .catch((error) => {
        if (
          cancelled ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        pushToast({
          type: 'error',
          title: 'Failed to load messages',
          message:
            error?.message ||
            'Unable to load messages.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [activeId, pushToast]);

  /* ---------------------------------------------------------------------- */
  /* WebSocket                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const unsubscribe = wsClient.on(
      'MESSAGE_CREATED',
      (payload) => {
        if (!payload) return;

        const conversationId =
          payload.conversation_id ??
          payload.conversationId;

        const messageId =
          payload.message_id ??
          payload.messageId;

        const senderId =
          payload.sender_id ??
          payload.senderId;

        const body =
          payload.body ??
          payload.text ??
          '';

        const createdAt =
          payload.created_at ??
          payload.createdAt ??
          new Date().toISOString();

        /*
         * Do not add an already-persisted message again.
         */
        if (
          messageId != null &&
          messageIds.current.has(
            String(messageId),
          )
        ) {
          return;
        }

        if (conversationId === activeId) {
          const newMessage = {
            id:
              messageId ??
              `ws-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,
            conversationId,
            senderId,
            senderName:
              payload.sender_name ??
              payload.senderName,
            body,
            read: false,
            createdAt,
          };

          if (messageId != null) {
            messageIds.current.add(
              String(messageId),
            );
          }

          setMessages((previous) => {
            const duplicate =
              previous.some(
                (message) =>
                  message.id ===
                  newMessage.id,
              );

            if (duplicate) {
              return previous;
            }

            return [
              ...previous,
              newMessage,
            ];
          });

          messageService
            .markRead(conversationId)
            .catch(() => {});

          setConversations((previous) =>
            (previous || []).map((conversation) =>
              conversation.id ===
              conversationId
                ? {
                    ...conversation,
                    unread: false,
                    unreadCount: 0,
                  }
                : conversation,
            ),
          );
        }

        /*
         * Refresh sidebar so lastMessage and unread
         * state remain accurate.
         */
        messageService
          .listConversations()
          .then((all) => {
            const safeConversations =
              Array.isArray(all)
                ? all
                : [];

            setConversations(
              safeConversations.map(
                (conversation) =>
                  conversation.id ===
                  activeId
                    ? {
                        ...conversation,
                        unread: false,
                        unreadCount: 0,
                      }
                    : conversation,
              ),
            );
          })
          .catch(() => {});
      },
    );

    return unsubscribe;
  }, [activeId]);

  /* ---------------------------------------------------------------------- */
  /* Send message                                                           */
  /* ---------------------------------------------------------------------- */

  const handleSend = useCallback(
    async (text) => {
      const value = text?.trim();

      if (
        !activeId ||
        !value ||
        sending ||
        !user?.id
      ) {
        return;
      }

      const optimisticId =
        `opt-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      const optimisticMessage = {
        id: optimisticId,
        conversationId: activeId,
        senderId: user.id,
        senderName: user.name,
        body: value,
        read: true,
        createdAt:
          new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        optimisticMessage,
      ]);

      setSending(true);

      try {
        const persisted =
          await messageService.send(
            activeId,
            value,
          );

        if (!persisted?.id) {
          throw new Error(
            'The server returned an invalid message.',
          );
        }

        messageIds.current.add(
          String(persisted.id),
        );

        setMessages((previous) =>
          previous.map((message) =>
            message.id === optimisticId
              ? persisted
              : message,
          ),
        );

        messageService
          .listConversations()
          .then((all) => {
            setConversations(
              Array.isArray(all)
                ? all
                : [],
            );
          })
          .catch(() => {});
      } catch (error) {
        setMessages((previous) =>
          previous.filter(
            (message) =>
              message.id !==
              optimisticId,
          ),
        );

        pushToast({
          type: 'error',
          title: 'Message not sent',
          message:
            error?.message ||
            'Unable to send the message.',
        });
      } finally {
        setSending(false);
      }
    },
    [activeId, sending, user, pushToast],
  );

  /* ---------------------------------------------------------------------- */
  /* New conversation                                                       */
  /* ---------------------------------------------------------------------- */

  const handleSelectUser = useCallback(
    async (selectedUser) => {
      if (!selectedUser?.id) {
        return;
      }

      try {
        const conversation =
          await messageService.getOrCreateConversation(
            selectedUser.id,
          );

        setConversations((previous) => {
          const current =
            previous || [];

          const existing =
            current.find(
              (item) =>
                item.id ===
                conversation.id,
            );

          if (existing) {
            return current;
          }

          return [
            conversation,
            ...current,
          ];
        });

        setActiveId(conversation.id);
      } catch (error) {
        pushToast({
          type: 'error',
          title: 'Could not open conversation',
          message:
            error?.message ||
            'Unable to open conversation.',
        });
      }
    },
    [pushToast],
  );

  /* ---------------------------------------------------------------------- */
  /* Derived state                                                          */
  /* ---------------------------------------------------------------------- */

  const normalizedSearch = search
    .trim()
    .toLowerCase();

  const list = (
    conversations || []
  ).filter((conversation) => {
    if (!normalizedSearch) {
      return true;
    }

    const name =
      getParticipantName(
        conversation,
      ).toLowerCase();

    const department =
      getParticipantDepartment(
        conversation,
      ).toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      department.includes(normalizedSearch)
    );
  });

  const active = (
    conversations || []
  ).find(
    (conversation) =>
      conversation.id === activeId,
  );

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Communicate directly with your IT support team."
      />

      {!conversations ? (
        <LoadingState rows={3} />
      ) : (
        <div
          className="flex h-[560px] overflow-hidden rounded-[var(--radius-lg)] border"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-surface)',
          }}
        >
          {/* Sidebar */}

          <div
            className="flex w-64 shrink-0 flex-col border-r"
            style={{
              borderColor:
                'var(--border)',
            }}
          >
            <div
              className="border-b p-3"
              style={{
                borderColor:
                  'var(--border)',
              }}
            >
              <div className="flex items-center gap-2">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search…"
                />

                <button
                  type="button"
                  onClick={() =>
                    setNewMsgOpen(true)
                  }
                  className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                  style={{
                    background:
                      'var(--accent)',
                    color: '#fff',
                  }}
                  title="New message"
                  aria-label="New message"
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {list.length === 0 && (
                <p
                  className="px-4 py-6 text-center text-xs"
                  style={{
                    color:
                      'var(--text-muted)',
                  }}
                >
                  No conversations.{' '}
                  <button
                    type="button"
                    onClick={() =>
                      setNewMsgOpen(true)
                    }
                    className="focus-ring underline"
                    style={{
                      color:
                        'var(--accent)',
                    }}
                  >
                    Start one
                  </button>
                </p>
              )}

              {list.map((conversation) => {
                const participant =
                  conversation.participant;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      setActiveId(
                        conversation.id,
                      )
                    }
                    className={cn(
                      'flex w-full items-start gap-2.5 border-b px-3.5 py-3 text-left',
                    )}
                    style={{
                      borderColor:
                        'var(--border-soft)',
                      background:
                        conversation.id ===
                        activeId
                          ? 'var(--accent-soft)'
                          : 'transparent',
                    }}
                  >
                    <UserAvatar
                      name={
                        participant?.name ||
                        'Unknown user'
                      }
                      color={getUserAvatarColor(
                        participant,
                      )}
                      size="sm"
                      status={
                        conversation.online
                          ? 'Available'
                          : 'Offline'
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="truncate text-sm font-medium"
                          style={{
                            color:
                              'var(--text-primary)',
                          }}
                        >
                          {getParticipantName(
                            conversation,
                          )}
                        </p>

                        <span
                          className="shrink-0 text-[10px]"
                          style={{
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          {conversation.updatedAt
                            ? timeAgo(
                                conversation.updatedAt,
                              )
                            : ''}
                        </span>
                      </div>

                      <p
                        className="truncate text-xs"
                        style={{
                          color:
                            conversation.unread
                              ? 'var(--text-primary)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {conversation.lastMessage ||
                          'No messages yet'}
                      </p>
                    </div>

                    {conversation.unread && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background:
                            'var(--accent)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thread */}

          <div className="flex min-w-0 flex-1 flex-col">
            {active ? (
              <>
                <div
                  className="flex items-center gap-3 border-b px-5 py-3.5"
                  style={{
                    borderColor:
                      'var(--border)',
                  }}
                >
                  <UserAvatar
                    name={getParticipantName(
                      active,
                    )}
                    color={getUserAvatarColor(
                      active.participant,
                    )}
                    size="sm"
                    status={
                      active.online
                        ? 'Available'
                        : 'Offline'
                    }
                  />

                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-medium"
                      style={{
                        color:
                          'var(--text-primary)',
                      }}
                    >
                      {getParticipantName(
                        active,
                      )}
                    </p>

                    <p
                      className="truncate text-xs"
                      style={{
                        color:
                          active.online
                            ? 'var(--low)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {active.online
                        ? 'Online'
                        : 'Offline'}
                    </p>
                  </div>
                </div>

                <MessageList
                  messages={messages}
                  currentUserId={user?.id}
                />

                <MessageComposer
                  onSend={handleSend}
                  disabled={
                    sending ||
                    !user?.id
                  }
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <p
                    className="text-sm"
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    Select a conversation or
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setNewMsgOpen(true)
                    }
                    className="focus-ring mt-2 text-sm font-medium"
                    style={{
                      color:
                        'var(--accent)',
                    }}
                  >
                    start a new message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <NewConversationModal
        open={newMsgOpen}
        onClose={() =>
          setNewMsgOpen(false)
        }
        onSelect={handleSelectUser}
      />
    </div>
  );
}
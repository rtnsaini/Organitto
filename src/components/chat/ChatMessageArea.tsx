import { useState, useEffect, useRef } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MessageComposer from './MessageComposer';
import ChatMessage from './ChatMessage';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

interface ChatMessageAreaProps {
  room: any;
  teamMembers: any[];
}

export default function ChatMessageArea({ room, teamMembers }: ChatMessageAreaProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (room) {
      fetchMessages();
      subscribeToMessages();
      subscribeToTyping();
      markRoomAsRead();
    }
  }, [room?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', room.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`room_${room.id}_messages`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          markRoomAsRead();
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages(prev => prev.map(msg =>
            msg.id === payload.new.id ? payload.new : msg
          ));
        }
      )
      .on('postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const subscribeToTyping = () => {
    const subscription = supabase
      .channel(`room_${room.id}_typing`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_status',
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from('chat_typing_status')
            .select('*')
            .eq('room_id', room.id)
            .eq('is_typing', true)
            .neq('user_id', user?.id || '');

          setTypingUsers(data || []);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markRoomAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_room_members')
        .update({
          last_read_at: new Date().toISOString(),
        })
        .eq('room_id', room.id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking room as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const getDateSeparator = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) return 'Today';
    if (isYesterday(messageDate)) return 'Yesterday';
    return format(messageDate, 'MMMM dd, yyyy');
  };

  const shouldShowDateSeparator = (currentMsg: any, prevMsg: any) => {
    if (!prevMsg) return true;
    return !isSameDay(new Date(currentMsg.created_at), new Date(prevMsg.created_at));
  };

  const getSenderName = (senderId: string) => {
    const member = teamMembers.find(m => m.id === senderId);
    if (senderId === user?.id) return 'You';
    return member?.full_name || member?.email?.split('@')[0] || 'Unknown';
  };

  const getTypingUserNames = () => {
    return typingUsers
      .map(tu => {
        const member = teamMembers.find(m => m.id === tu.user_id);
        return member?.full_name || member?.email?.split('@')[0] || 'Someone';
      })
      .join(', ');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b-2 border-white/40 p-6 bg-gradient-to-r from-white/60 to-cream/40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-sage/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/50">
              {room.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-2xl font-bold text-primary truncate drop-shadow-sm">
                {room.name}
              </h3>
              {room.description && (
                <p className="text-sm text-dark-brown/70 truncate font-medium">{room.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-xl border border-white/50 shadow-md backdrop-blur-sm">
            <Users className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="text-sm text-primary font-bold">
              {teamMembers.length} partner{teamMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-cream/40 to-white/30"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-5">
            {messages.map((message, index) => (
              <div key={message.id}>
                {shouldShowDateSeparator(message, messages[index - 1]) && (
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-brown/20 to-transparent"></div>
                    <span className="text-xs font-bold text-dark-brown/50 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-white/50">
                      {getDateSeparator(message.created_at)}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-brown/20 to-transparent"></div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {message.sender_id !== user?.id && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-sage to-secondary flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg border-2 border-white/30">
                      {getSenderName(message.sender_id)[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className={`flex-1 ${message.sender_id === user?.id ? 'ml-auto' : ''}`}>
                    {message.sender_id !== user?.id && (
                      <div className="text-sm font-bold text-primary mb-2 ml-1">
                        {getSenderName(message.sender_id)}
                      </div>
                    )}
                    <ChatMessage
                      message={message}
                      isOwnMessage={message.sender_id === user?.id}
                      onDelete={() => fetchMessages()}
                      onEdit={() => fetchMessages()}
                    />
                  </div>

                  {message.sender_id === user?.id && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-sage to-secondary flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg border-2 border-white/30">
                      {getSenderName(message.sender_id)[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-sage/10 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-xl border-2 border-white/50">
                {room.icon}
              </div>
              <h4 className="font-heading text-2xl font-bold text-primary mb-3">
                No messages yet
              </h4>
              <p className="text-dark-brown/60 font-medium text-lg">
                Start the conversation with your team!
              </p>
            </div>
          </div>
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mt-6 border-2 border-white/50">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm text-dark-brown/70 font-medium">
              {getTypingUserNames()} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-8 p-4 bg-gradient-to-br from-primary to-sage text-white rounded-2xl shadow-2xl hover:shadow-[0_8px_30px_rgba(139,69,19,0.4)] transition-all z-10 hover:scale-110 active:scale-95 border-2 border-white/30"
        >
          <ChevronDown className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}

      <MessageComposer roomId={room.id} onMessageSent={fetchMessages} />
    </div>
  );
}

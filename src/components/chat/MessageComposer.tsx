import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface MessageComposerProps {
  roomId: string;
  onMessageSent: () => void;
}

const EMOJI_LIST = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '✅', '👏', '💡', '🌟', '🙏', '💯'];

export default function MessageComposer({ roomId, onMessageSent }: MessageComposerProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      updateTypingStatus(false);
    };
  }, [roomId]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!user) return;

    try {
      if (isTyping) {
        await supabase
          .from('chat_typing_status')
          .upsert({
            room_id: roomId,
            user_id: user.id,
            is_typing: true,
            last_typing_time: new Date().toISOString(),
          }, {
            onConflict: 'room_id,user_id'
          });
      } else {
        await supabase
          .from('chat_typing_status')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.trim()) {
      updateTypingStatus(true);
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 3000);
    } else {
      updateTypingStatus(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!message.trim() || !user || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);
    updateTypingStatus(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      const mentions = extractMentions(messageText);

      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: roomId,
            sender_id: user.id,
            message_text: messageText,
            message_type: 'text',
            mentions: mentions,
          },
        ]);

      if (error) throw error;
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    setMessage(newMessage);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t-2 border-white/40 bg-gradient-to-br from-white/70 to-cream/50 p-6 backdrop-blur-sm">
      <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white/80 border-2 border-white/60 rounded-2xl focus-within:border-primary/40 focus-within:shadow-xl transition-all shadow-lg backdrop-blur-sm">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              rows={1}
              className="w-full px-5 py-4 bg-transparent resize-none focus:outline-none text-dark-brown placeholder:text-dark-brown/40 font-medium"
              style={{ maxHeight: '200px' }}
            />

            <div className="flex items-center gap-2 px-5 pb-4">
              <button
                type="button"
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-dark-brown/60 hover:text-primary hover:scale-110 active:scale-95"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" strokeWidth={2} />
              </button>

              <button
                type="button"
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-dark-brown/60 hover:text-primary hover:scale-110 active:scale-95"
                title="Attach image"
              >
                <ImageIcon className="w-5 h-5" strokeWidth={2} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-dark-brown/60 hover:text-primary hover:scale-110 active:scale-95"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" strokeWidth={2} />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-white/60 p-4 grid grid-cols-6 gap-2">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="text-2xl hover:bg-primary/10 rounded-xl p-2 transition-all hover:scale-125 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1"></div>

              {message.length > 0 && (
                <span className="text-xs text-dark-brown/50 font-semibold bg-dark-brown/5 px-3 py-1.5 rounded-lg">
                  {message.length} chars
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="p-5 bg-gradient-to-br from-primary via-sage to-secondary text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 border-2 border-white/30 shadow-xl"
            title="Send message"
          >
            <Send className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 flex flex-wrap gap-2 text-xs text-dark-brown/50">
            <span className="bg-white/60 px-3 py-1.5 rounded-lg font-medium border border-white/40">
              <span className="font-mono text-primary font-semibold">@username</span> to mention
            </span>
            <span className="bg-white/60 px-3 py-1.5 rounded-lg font-medium border border-white/40">
              <span className="font-mono text-primary font-semibold">**text**</span> for bold
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

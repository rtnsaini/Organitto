import { useState } from 'react';
import { Edit, Trash2, MoreVertical, ThumbsUp, Heart, Check } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessageProps {
  message: any;
  isOwnMessage: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🔥'];

export default function ChatMessage({ message, isOwnMessage, onDelete, onEdit }: ChatMessageProps) {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message_text);

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', message.id);

      if (error) throw error;
      onDelete();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          message_text: editText.trim(),
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      if (error) throw error;
      setIsEditing(false);
      onEdit();
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const reactions = message.reactions || {};
      const userReactions = reactions[emoji] || [];

      const newReactions = { ...reactions };
      if (userReactions.includes(user.id)) {
        newReactions[emoji] = userReactions.filter((id: string) => id !== user.id);
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }
      } else {
        newReactions[emoji] = [...userReactions, user.id];
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: newReactions })
        .eq('id', message.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatMessageText = (text: string) => {
    let formatted = text;

    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-dark-brown/10 px-1 rounded">$1</code>');
    formatted = formatted.replace(/@(\w+)/g, '<span class="bg-accent/20 text-accent font-semibold px-1 rounded">@$1</span>');

    return formatted;
  };

  const reactions = message.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(([_, users]: [string, any]) => users.length > 0);

  return (
    <div
      className={`group relative ${isOwnMessage ? 'flex justify-end' : 'flex justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex-1 max-w-2xl ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`flex items-center gap-2 mb-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-dark-brown/50 font-semibold">
            {format(new Date(message.created_at), 'h:mm a')}
          </span>
          {message.is_edited && (
            <span className="text-xs text-dark-brown/40 italic bg-dark-brown/5 px-2 py-0.5 rounded-full">edited</span>
          )}
        </div>

        <div className="relative">
          {isEditing ? (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-5 shadow-xl">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 bg-cream/30 border-2 border-white/60 rounded-xl focus:outline-none focus:border-primary resize-none font-medium text-dark-brown"
                rows={3}
                autoFocus
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleEdit}
                  className="px-5 py-2 bg-gradient-to-br from-primary to-sage text-white rounded-xl text-sm font-bold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.message_text);
                  }}
                  className="px-5 py-2 bg-white border-2 border-dark-brown/20 text-dark-brown rounded-xl text-sm font-bold hover:bg-dark-brown/5 transition-all hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`rounded-2xl px-5 py-4 shadow-lg transition-all ${
                  isOwnMessage
                    ? 'bg-gradient-to-br from-primary via-sage to-secondary text-white border-2 border-white/30'
                    : 'bg-white/90 backdrop-blur-sm border-2 border-white/60 text-dark-brown'
                }`}
              >
                <div
                  className={`text-base leading-relaxed break-words font-medium ${isOwnMessage ? 'text-white' : 'text-dark-brown'}`}
                  dangerouslySetInnerHTML={{ __html: formatMessageText(message.message_text) }}
                />
              </div>

              {showActions && isOwnMessage && (
                <div className="absolute -top-4 right-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-white/60 flex gap-2 p-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-all hover:scale-110 active:scale-95"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5 text-primary" strokeWidth={2} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all hover:scale-110 active:scale-95"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {reactionEntries.length > 0 && (
          <div className={`flex flex-wrap gap-2 mt-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {reactionEntries.map(([emoji, users]: [string, any]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all hover:scale-110 active:scale-95 shadow-md ${
                  users.includes(user?.id)
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400'
                    : 'bg-white/90 backdrop-blur-sm border-2 border-white/60 hover:border-primary/40'
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-dark-brown">{users.length}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-xl hover:scale-125 active:scale-95 transition-all p-1.5 hover:bg-white/60 rounded-xl backdrop-blur-sm"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

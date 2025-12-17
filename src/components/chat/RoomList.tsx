import { useState, useEffect } from 'react';
import { Users, Hash, MessageCircle, Plus, Search, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';

interface RoomListProps {
  onSelectRoom: (room: any) => void;
  selectedRoomId: string | null;
  onNewChat: () => void;
  onNewGroup: () => void;
}

export default function RoomList({ onSelectRoom, selectedRoomId, onNewChat, onNewGroup }: RoomListProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchAllUsers();
      subscribeToRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_user_rooms')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const roomsWithUsers = await Promise.all(
        (data || []).map(async (room) => {
          if (room.is_direct && room.participant_ids?.length === 2) {
            const otherUserId = room.participant_ids.find((id: string) => id !== user.id);
            const { data: otherUser } = await supabase
              .from('users')
              .select('id, name, email, role')
              .eq('id', otherUserId)
              .maybeSingle();

            return {
              ...room,
              display_name: otherUser?.name || otherUser?.email?.split('@')[0] || 'User',
              display_icon: '👤',
              other_user: otherUser
            };
          }
          return {
            ...room,
            display_name: room.name,
            display_icon: room.icon
          };
        })
      );

      setRooms(roomsWithUsers);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('approval_status', 'approved')
        .neq('id', user?.id || '');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const subscribeToRooms = () => {
    const subscription = supabase
      .channel('user_rooms')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const formatLastMessageTime = (date: string | null) => {
    if (!date) return '';
    const msgDate = new Date(date);
    if (isToday(msgDate)) return format(msgDate, 'h:mm a');
    if (isYesterday(msgDate)) return 'Yesterday';
    return format(msgDate, 'MMM d');
  };

  const getRoomIcon = (room: any) => {
    if (room.type === 'direct') return '👤';
    if (room.type === 'group') return '👥';
    if (room.type === 'team') return '🏢';
    return room.display_icon || '💬';
  };

  const filteredRooms = rooms.filter(room =>
    room.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white/50 to-cream/30">
      <div className="p-4 border-b border-white/40">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-brown/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/80 border-2 border-white/60 rounded-xl focus:outline-none focus:border-primary/40 text-sm font-medium placeholder:text-dark-brown/40"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-br from-primary to-sage text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <button
            onClick={onNewGroup}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white/80 border-2 border-primary/20 text-primary rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="p-2">
            {filteredRooms.map((room) => (
              <button
                key={room.room_id}
                onClick={() => onSelectRoom(room)}
                className={`w-full p-3 rounded-xl mb-2 transition-all text-left ${
                  selectedRoomId === room.room_id
                    ? 'bg-gradient-to-br from-primary/20 to-sage/10 border-2 border-primary/30 shadow-lg'
                    : 'bg-white/60 border-2 border-white/40 hover:border-primary/20 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-sage/10 flex items-center justify-center text-2xl border-2 border-white/50">
                      {getRoomIcon(room)}
                    </div>
                    {room.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-bold text-primary truncate text-sm">
                          {room.display_name}
                        </h3>
                        {room.other_user?.role === 'admin' && (
                          <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-dark-brown/50 font-medium flex-shrink-0 ml-2">
                        {formatLastMessageTime(room.last_message_at)}
                      </span>
                    </div>

                    {room.last_message_text && (
                      <p className="text-xs text-dark-brown/60 truncate font-medium">
                        {room.last_message_text}
                      </p>
                    )}

                    {!room.last_message_text && room.type === 'direct' && (
                      <p className="text-xs text-dark-brown/40 italic">
                        Start a conversation
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-sage/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-primary/40" />
            </div>
            <p className="text-sm text-dark-brown/60 font-medium text-center mb-4">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <button
              onClick={onNewChat}
              className="px-4 py-2 bg-gradient-to-br from-primary to-sage text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
            >
              Start a conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

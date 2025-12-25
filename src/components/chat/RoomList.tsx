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
  const [showAllUsers, setShowAllUsers] = useState(false);

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
      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const roomsWithDetails = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { data: membership } = await supabase
            .from('chat_room_members')
            .select('last_read_at')
            .eq('room_id', room.id)
            .eq('user_id', user.id)
            .maybeSingle();

          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message_text, created_at, sender_id')
            .eq('room_id', room.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: unreadMessages } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .neq('sender_id', user.id)
            .eq('is_deleted', false)
            .gt('created_at', membership?.last_read_at || '1970-01-01');

          if (room.is_direct && room.participant_ids?.length === 2) {
            const otherUserId = room.participant_ids.find((id: string) => id !== user.id);
            const { data: otherUser } = await supabase
              .from('users')
              .select('id, name, email, role')
              .eq('id', otherUserId)
              .maybeSingle();

            return {
              room_id: room.id,
              name: room.name,
              type: room.type,
              is_direct: room.is_direct,
              participant_ids: room.participant_ids,
              icon: room.icon,
              description: room.description,
              unread_count: unreadMessages?.count || 0,
              last_message_text: lastMessage?.message_text || null,
              last_message_at: lastMessage?.created_at || null,
              display_name: otherUser?.name || otherUser?.email?.split('@')[0] || 'User',
              display_icon: '👤',
              other_user: otherUser
            };
          }
          return {
            room_id: room.id,
            name: room.name,
            type: room.type,
            is_direct: room.is_direct,
            participant_ids: room.participant_ids,
            icon: room.icon,
            description: room.description,
            unread_count: unreadMessages?.count || 0,
            last_message_text: lastMessage?.message_text || null,
            last_message_at: lastMessage?.created_at || null,
            display_name: room.name,
            display_icon: room.icon || '💬'
          };
        })
      );

      roomsWithDetails.sort((a, b) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return dateB - dateA;
      });

      setRooms(roomsWithDetails);
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

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_chat', {
        other_user_id: userId
      });

      if (error) throw error;

      const { data: roomData } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', data)
        .maybeSingle();

      if (roomData) {
        const otherUserId = roomData.participant_ids.find((id: string) => id !== user?.id);
        const { data: otherUser } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('id', otherUserId)
          .maybeSingle();

        const fullRoomData = {
          room_id: roomData.id,
          name: roomData.name,
          type: roomData.type,
          is_direct: roomData.is_direct,
          participant_ids: roomData.participant_ids,
          icon: roomData.icon,
          description: roomData.description,
          unread_count: 0,
          last_message_text: null,
          last_message_at: null,
          display_name: otherUser?.name || otherUser?.email?.split('@')[0] || 'User',
          display_icon: '👤',
          other_user: otherUser
        };

        onSelectRoom(fullRoomData);
        setShowAllUsers(false);
        fetchRooms();
      }
    } catch (error) {
      console.error('Error creating/opening chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white/50 to-cream/30">
      <div className="p-5 border-b-2 border-white/40 space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/10 to-sage/10 rounded-xl">
            <Search className="w-5 h-5 text-primary" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-[4.5rem] pr-5 py-4 bg-white/90 border-2 border-white/60 rounded-2xl focus:outline-none focus:border-primary/50 focus:shadow-xl focus:bg-white transition-all text-base font-semibold placeholder:text-dark-brown/40 shadow-lg backdrop-blur-sm hover:border-primary/30"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              showAllUsers
                ? 'bg-gradient-to-br from-primary via-sage to-secondary text-white shadow-xl hover:shadow-2xl border-2 border-white/30 hover:scale-105 active:scale-95'
                : 'bg-white/90 border-2 border-primary/30 text-primary shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            <Users className="w-4 h-4" strokeWidth={2.5} />
            <span>Users</span>
          </button>
          <button
            onClick={onNewGroup}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/90 border-2 border-primary/30 text-primary rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showAllUsers && (
        <div className="border-b-2 border-white/40 bg-white/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-dark-brown/70 uppercase tracking-wider">
              All Users ({allUsers.length})
            </h3>
            <button
              onClick={() => setShowAllUsers(false)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Show Chats
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : showAllUsers ? (
          <div className="p-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUserClick(u.id)}
                  className="w-full p-3 rounded-xl mb-2 transition-all text-left bg-white/60 border-2 border-white/40 hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-sage to-secondary flex items-center justify-center text-white font-bold text-lg border-2 border-white/50">
                      {(u.name || u.email)?.[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-primary truncate text-sm">
                          {u.name || u.email?.split('@')[0] || 'User'}
                        </h3>
                        {u.role === 'admin' && (
                          <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-dark-brown/60 truncate font-medium">
                        {u.email}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary/60" />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-sage/10 flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-primary/40" />
                </div>
                <p className="text-sm text-dark-brown/60 font-medium text-center">
                  No users found
                </p>
              </div>
            )}
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

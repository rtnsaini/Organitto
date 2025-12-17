import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatMessageArea from '../components/chat/ChatMessageArea';
import RoomList from '../components/chat/RoomList';
import NewChatModal from '../components/chat/NewChatModal';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FloatingLeaves } from '../components/ui/FloatingLeaves';

export default function Chat() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const handleSelectRoom = async (room: any) => {
    setSelectedRoom(room);
    await fetchRoomMembers(room.room_id);
  };

  const fetchRoomMembers = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_room_members')
        .select(`
          user_id,
          role,
          joined_at
        `)
        .eq('room_id', roomId);

      if (error) throw error;

      const membersWithDetails = await Promise.all(
        (data || []).map(async (member) => {
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', member.user_id)
            .maybeSingle();

          return {
            ...member,
            ...userData
          };
        })
      );

      setRoomMembers(membersWithDetails);
    } catch (error) {
      console.error('Error fetching room members:', error);
    }
  };

  const handleChatCreated = async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_user_rooms')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', user?.id || '')
      .maybeSingle();

    if (data && !error) {
      await handleSelectRoom(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-cream relative overflow-hidden">
      <FloatingLeaves />

      <div className="relative z-10 h-screen flex p-6 gap-4">
        <div className="w-96 glass-card rounded-3xl border-2 border-white/50 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          <div className="bg-gradient-to-br from-primary via-sage to-secondary p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                  <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-white drop-shadow-lg">Messages</h2>
                  <p className="text-xs text-white/90 font-medium">Your conversations</p>
                </div>
              </div>
            </div>
          </div>

          <RoomList
            onSelectRoom={handleSelectRoom}
            selectedRoomId={selectedRoom?.room_id || null}
            onNewChat={() => setShowNewChatModal(true)}
            onNewGroup={() => setShowCreateGroupModal(true)}
          />
        </div>

        <div className="flex-1 flex flex-col glass-card rounded-3xl border-2 border-white/50 shadow-2xl overflow-hidden backdrop-blur-xl">
          {selectedRoom ? (
            <ChatMessageArea
              room={{
                id: selectedRoom.room_id,
                name: selectedRoom.display_name,
                icon: selectedRoom.display_icon,
                description: selectedRoom.description,
                type: selectedRoom.type,
                is_direct: selectedRoom.is_direct
              }}
              teamMembers={roomMembers}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white/50 to-cream/30">
              <div className="text-center p-12">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-sage/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <MessageCircle className="w-16 h-16 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-4xl font-bold text-primary mb-4">
                  Select a conversation
                </h3>
                <p className="text-dark-brown/60 text-lg font-medium max-w-md mb-6">
                  Choose a conversation from the list or start a new chat with your team.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-6 py-3 bg-gradient-to-br from-primary to-sage text-white rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    New Chat
                  </button>
                  <button
                    onClick={() => setShowCreateGroupModal(true)}
                    className="px-6 py-3 bg-white border-2 border-primary/20 text-primary rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    New Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleChatCreated}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={handleChatCreated}
        />
      )}
    </div>
  );
}

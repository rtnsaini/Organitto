import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import Header from '../components/Header';
import ChatMessageArea from '../components/chat/ChatMessageArea';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FloatingLeaves } from '../components/ui/FloatingLeaves';

const TEAM_CHAT_ID = '00000000-0000-0000-0000-000000000001';

export default function Chat() {
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomAndMembers();
  }, [user]);

  const fetchRoomAndMembers = async () => {
    if (!user) return;

    try {
      const { data: roomData, error: roomError } = await supabase
        .from('chat_room_list')
        .select('*')
        .eq('id', TEAM_CHAT_ID)
        .eq('user_id', user.id)
        .maybeSingle();

      if (roomError) throw roomError;

      if (roomData) {
        setRoom(roomData);
      }

      const { data: membersData, error: membersError } = await supabase
        .from('team_chat_members')
        .select('*');

      if (membersError) throw membersError;
      setTeamMembers(membersData || []);

    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-cream">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-cream relative overflow-hidden">
      <FloatingLeaves />
      <Header />

      <div className="relative z-10 h-[calc(100vh-73px)] flex">
        <div className="w-80 glass-card border-r-2 border-primary/10 flex flex-col">
          <div className="p-6 border-b-2 border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">👥</div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-gradient">Team Chat</h2>
                <p className="text-sm text-dark-brown/60">Common chat for all partners</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-bold text-dark-brown/60 uppercase tracking-wider mb-3 px-2">
              Team Members ({teamMembers.length})
            </h3>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 rounded-xl transition-all ${
                    member.id === user?.id
                      ? 'bg-primary/10 border-2 border-primary/20'
                      : 'bg-white border-2 border-transparent hover:border-primary/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-sage flex items-center justify-center text-white font-bold text-lg">
                      {(member.full_name || member.email)?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-primary truncate">
                        {member.full_name || member.email?.split('@')[0] || 'Partner'}
                        {member.id === user?.id && (
                          <span className="ml-2 text-xs text-primary/60 font-normal">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-dark-brown/60 truncate">
                        {member.role || member.email}
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white flex-shrink-0" title="Online"></div>
                  </div>
                </div>
              ))}
            </div>

            {teamMembers.length === 0 && (
              <div className="text-center py-8 px-4">
                <Users className="w-12 h-12 text-dark-brown/20 mx-auto mb-3" />
                <p className="text-sm text-dark-brown/40">No team members found</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t-2 border-primary/10 bg-white">
            <div className="text-center">
              <p className="text-xs text-dark-brown/40">
                All partners can see and send messages
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col glass-card">
          {room ? (
            <ChatMessageArea room={room} teamMembers={teamMembers} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="font-heading text-3xl font-bold text-primary mb-3">
                  Team Chat Unavailable
                </h3>
                <p className="text-primary/60 text-lg font-medium">
                  Unable to load the team chat room
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

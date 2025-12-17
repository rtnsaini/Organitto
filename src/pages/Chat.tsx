import { useState, useEffect } from 'react';
import { Users, MessageCircle, Crown } from 'lucide-react';
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
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-cream relative overflow-hidden">
      <FloatingLeaves />

      <div className="relative z-10 h-screen flex p-6">
        <div className="w-96 glass-card rounded-3xl border-2 border-white/50 shadow-2xl flex flex-col overflow-hidden mr-6 backdrop-blur-xl">
          <div className="bg-gradient-to-br from-primary via-sage to-secondary p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                  <MessageCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-heading text-3xl font-bold text-white drop-shadow-lg">Team Chat</h2>
                  <p className="text-sm text-white/90 font-medium">Collaborate with your team</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white/50 to-cream/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-dark-brown/70 uppercase tracking-wider">
                Team Members
              </h3>
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-sm font-bold text-primary">{teamMembers.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`group p-4 rounded-2xl transition-all duration-300 ${
                    member.id === user?.id
                      ? 'bg-gradient-to-br from-primary/20 to-sage/10 border-2 border-primary/30 shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm border-2 border-white/50 hover:border-primary/20 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-sage to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {(member.full_name || member.email)?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-md" title="Online"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-primary truncate text-base">
                          {member.full_name || member.email?.split('@')[0] || 'Partner'}
                        </div>
                        {member.role === 'admin' && (
                          <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        {member.id === user?.id && (
                          <span className="text-xs text-white bg-primary/80 px-2 py-0.5 rounded-full font-semibold">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-dark-brown/60 truncate font-medium mt-0.5">
                        {member.role === 'admin' ? 'Administrator' : member.role || 'Team Member'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {teamMembers.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-sage/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-primary/40" />
                </div>
                <p className="text-sm text-dark-brown/50 font-medium">No team members found</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t-2 border-white/50 bg-gradient-to-br from-white/60 to-cream/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-sage/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-dark-brown/60 font-medium text-left">
                This is a shared team space. All partners can view and send messages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col glass-card rounded-3xl border-2 border-white/50 shadow-2xl overflow-hidden backdrop-blur-xl">
          {room ? (
            <ChatMessageArea room={room} teamMembers={teamMembers} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white/50 to-cream/30">
              <div className="text-center p-12">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-sage/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <MessageCircle className="w-16 h-16 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-4xl font-bold text-primary mb-4">
                  Team Chat Unavailable
                </h3>
                <p className="text-dark-brown/60 text-lg font-medium max-w-md">
                  Unable to load the team chat room. Please try refreshing the page.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

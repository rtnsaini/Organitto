import { useState, useEffect } from 'react';
import { X, Search, Crown, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface NewChatModalProps {
  onClose: () => void;
  onChatCreated: (roomId: string) => void;
}

export default function NewChatModal({ onClose, onChatCreated }: NewChatModalProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter(u =>
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('approval_status', 'approved')
        .neq('id', user?.id || '')
        .order('name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (otherUserId: string) => {
    if (!user || creating) return;

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_chat', {
        user1_id: user.id,
        user2_id: otherUserId
      });

      if (error) throw error;
      onChatCreated(data);
      onClose();
    } catch (error) {
      console.error('Error creating direct chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-brown/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border-2 border-white/50">
        <div className="p-6 border-b-2 border-white/40 bg-gradient-to-r from-primary/10 to-sage/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-sage rounded-2xl flex items-center justify-center text-white shadow-lg">
                <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">New Chat</h2>
                <p className="text-sm text-dark-brown/60 font-medium">Start a conversation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-xl transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-dark-brown/60" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-brown/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/80 border-2 border-white/60 rounded-xl focus:outline-none focus:border-primary/40 text-sm font-medium placeholder:text-dark-brown/40"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => createDirectChat(u.id)}
                  disabled={creating}
                  className="w-full p-4 rounded-2xl bg-white/60 border-2 border-white/60 hover:border-primary/30 hover:shadow-lg transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-sage to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {(u.name || u.email)?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-primary text-base truncate">
                          {u.name || u.email?.split('@')[0] || 'User'}
                        </h3>
                        {u.role === 'admin' && (
                          <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-dark-brown/60 truncate font-medium">
                        {u.email}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageCircle className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-sage/10 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-sm text-dark-brown/60 font-medium text-center">
                {searchQuery ? 'No users found' : 'No users available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

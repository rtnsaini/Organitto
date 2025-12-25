import { useState, useEffect } from 'react';
import { X, Search, Crown, Users, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated: (roomId: string) => void;
}

export default function CreateGroupModal({ onClose, onGroupCreated }: CreateGroupModalProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState('');
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

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const createGroup = async () => {
    if (!user || creating || !groupName.trim() || selectedUsers.size === 0) return;

    setCreating(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert([
          {
            name: groupName.trim(),
            type: 'group',
            is_direct: false,
            created_by: user.id,
            icon: '👥'
          }
        ])
        .select()
        .single();

      if (roomError) throw roomError;

      const members = [
        { room_id: room.id, user_id: user.id, role: 'admin' },
        ...Array.from(selectedUsers).map(userId => ({
          room_id: room.id,
          user_id: userId,
          role: 'member'
        }))
      ];

      const { error: membersError } = await supabase
        .from('chat_room_members')
        .insert(members);

      if (membersError) throw membersError;

      onGroupCreated(room.id);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = groupName.trim().length > 0 && selectedUsers.size > 0;

  return (
    <div className="fixed inset-0 bg-dark-brown/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border-2 border-white/50">
        <div className="p-6 border-b-2 border-white/40 bg-gradient-to-r from-primary/10 to-sage/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-sage rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Users className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Create Group</h2>
                <p className="text-sm text-dark-brown/60 font-medium">
                  {selectedUsers.size} member{selectedUsers.size !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-xl transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 text-dark-brown/60" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-5 py-4 bg-white/90 border-2 border-white/60 rounded-2xl focus:outline-none focus:border-primary/50 focus:shadow-xl focus:bg-white transition-all text-base font-bold placeholder:text-dark-brown/40 mb-4 shadow-lg backdrop-blur-sm hover:border-primary/30"
            maxLength={50}
          />

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/10 to-sage/10 rounded-xl">
              <Search className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[4.5rem] pr-5 py-4 bg-white/90 border-2 border-white/60 rounded-2xl focus:outline-none focus:border-primary/50 focus:shadow-xl focus:bg-white transition-all text-base font-semibold placeholder:text-dark-brown/40 shadow-lg backdrop-blur-sm hover:border-primary/30"
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
              {filteredUsers.map((u) => {
                const isSelected = selectedUsers.has(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-gradient-to-br from-primary/20 to-sage/10 border-primary/40 shadow-lg'
                        : 'bg-white/60 border-white/60 hover:border-primary/20 hover:shadow-md'
                    }`}
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
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-dark-brown/30'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
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

        <div className="p-6 border-t-2 border-white/40 bg-gradient-to-r from-white/60 to-cream/40">
          <button
            onClick={createGroup}
            disabled={!canCreate || creating}
            className="w-full py-3 bg-gradient-to-br from-primary via-sage to-secondary text-white rounded-2xl font-bold text-base hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

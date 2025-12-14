import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PremiumButton } from '../components/ui';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  role: string;
}

interface ApprovedUser extends PendingUser {
  approved_by: string | null;
  approved_at: string | null;
  approver_name?: string;
}

interface RejectedUser extends PendingUser {
  rejection_reason: string | null;
}

export default function UserApprovals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<RejectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: pending } = await supabase
        .from('users')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      const { data: approved } = await supabase
        .from('users')
        .select(`
          *,
          approver:approved_by(name)
        `)
        .eq('approval_status', 'approved')
        .order('approved_at', { ascending: false });

      const { data: rejected } = await supabase
        .from('users')
        .select('*')
        .eq('approval_status', 'rejected')
        .order('created_at', { ascending: false });

      setPendingUsers(pending || []);
      setApprovedUsers(
        (approved || []).map(u => ({
          ...u,
          approver_name: u.approver?.name || 'Unknown'
        }))
      );
      setRejectedUsers(rejected || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          approval_status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'account_approved',
        title: 'Account Approved',
        message: 'Your Organitto account has been approved! You can now login.',
        read: false
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (user: PendingUser) => {
    setSelectedUser(user);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(selectedUser.id);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          approval_status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedUser.id,
        type: 'account_rejected',
        title: 'Registration Not Approved',
        message: `Your registration was not approved. Reason: ${rejectionReason}`,
        read: false
      });

      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectionReason('');
      await fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const filterUsers = <T extends PendingUser>(users: T[]) => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-colored">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">User Approval Management</h1>
              <p className="text-dark-brown/70 font-medium mt-1">Review and manage user registrations</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 rounded-button font-bold transition-all duration-300 ${
                  activeTab === 'pending'
                    ? 'bg-gradient-primary text-white shadow-colored'
                    : 'glass-card text-primary hover:shadow-md'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Pending ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-6 py-3 rounded-button font-bold transition-all duration-300 ${
                  activeTab === 'approved'
                    ? 'bg-gradient-primary text-white shadow-colored'
                    : 'glass-card text-primary hover:shadow-md'
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Approved ({approvedUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-6 py-3 rounded-button font-bold transition-all duration-300 ${
                  activeTab === 'rejected'
                    ? 'bg-gradient-primary text-white shadow-colored'
                    : 'glass-card text-primary hover:shadow-md'
                }`}
              >
                <XCircle className="w-4 h-4 inline mr-2" />
                Rejected ({rejectedUsers.length})
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-float w-full pl-12"
              />
            </div>
          </div>

          {activeTab === 'pending' && (
            <div className="space-y-4">
              {filterUsers(pendingUsers).length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No pending approvals</p>
                </div>
              ) : (
                filterUsers(pendingUsers).map((user) => (
                  <div key={user.id} className="glass-card p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-primary">{user.name}</h3>
                            <p className="text-sm text-primary/60">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="ml-13 space-y-1">
                          <p className="text-sm text-primary/70">
                            <span className="font-semibold">Email:</span> {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-primary/70">
                              <span className="font-semibold">Phone:</span> {user.phone}
                            </p>
                          )}
                          <p className="text-sm text-primary/70">
                            <span className="font-semibold">Registered:</span> {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <PremiumButton
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          variant="primary"
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </PremiumButton>
                        <button
                          onClick={() => openRejectModal(user)}
                          disabled={actionLoading === user.id}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-button hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="space-y-4">
              {filterUsers(approvedUsers).length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No approved users</p>
                </div>
              ) : (
                filterUsers(approvedUsers).map((user) => (
                  <div key={user.id} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-primary">{user.name}</h3>
                        <p className="text-sm text-primary/60">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-13 space-y-1">
                      <p className="text-sm text-primary/70">
                        <span className="font-semibold">Email:</span> {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-sm text-primary/70">
                          <span className="font-semibold">Phone:</span> {user.phone}
                        </p>
                      )}
                      <p className="text-sm text-green-600 font-semibold">
                        Approved by {user.approver_name} on {user.approved_at ? formatDate(user.approved_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="space-y-4">
              {filterUsers(rejectedUsers).length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No rejected users</p>
                </div>
              ) : (
                filterUsers(rejectedUsers).map((user) => (
                  <div key={user.id} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-primary">{user.name}</h3>
                        <p className="text-sm text-primary/60">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-13 space-y-1">
                      <p className="text-sm text-primary/70">
                        <span className="font-semibold">Email:</span> {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-sm text-primary/70">
                          <span className="font-semibold">Phone:</span> {user.phone}
                        </p>
                      )}
                      {user.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50/50 rounded-lg border border-red-200">
                          <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{user.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-8 max-w-md w-full animate-scale-in">
            <h2 className="text-2xl font-bold text-primary mb-4">Reject Registration</h2>
            <p className="text-primary/70 mb-6">
              Are you sure you want to reject <span className="font-bold">{selectedUser.name}</span>'s registration?
            </p>
            <div className="mb-6">
              <label className="block text-sm font-bold text-primary mb-3">
                Rejection Reason (Required)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-float w-full h-32 resize-none"
                placeholder="Explain why this registration is being rejected..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedUser(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-6 py-3 glass-card text-primary font-bold rounded-button hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading === selectedUser.id}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-button hover:shadow-lg disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

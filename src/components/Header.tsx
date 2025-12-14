import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, MessageCircle, Bell, ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadChatCount] = useState(3);

  const notificationCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      if (user.role === 'admin') {
        fetchPendingUsersCount();
      }

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, user?.role]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchPendingUsersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending');

      if (error) throw error;
      setPendingUsersCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending users count:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Search for:', searchQuery);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>

        <div className="logo desktop-only">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Organitto</span>
        </div>

        <div className="search-bar desktop-only">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="search-kbd">⌘ K</kbd>
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-icon-btn"
          onClick={() => navigate('/chat')}
          title="Chat"
        >
          <MessageCircle size={18} />
          {unreadChatCount > 0 && (
            <span className="header-badge">{unreadChatCount}</span>
          )}
        </button>

        <div className="header-dropdown-container">
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="header-badge">{notificationCount}</span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="header-dropdown-overlay"
                onClick={() => setShowNotifications(false)}
              />
              <div className="header-dropdown notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  {notificationCount > 0 && (
                    <span className="dropdown-badge">{notificationCount} new</span>
                  )}
                </div>
                <div className="dropdown-body">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                      >
                        <div className={`notification-dot ${!notification.is_read ? 'active' : ''}`} />
                        <div className="notification-content">
                          <p className="notification-title">{notification.title}</p>
                          <p className="notification-message">{notification.message}</p>
                          <p className="notification-time">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-empty">
                      <Bell size={32} />
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
                <div className="dropdown-footer">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="header-dropdown-container">
          <button
            className="user-menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name desktop-only">{user?.name}</span>
            <ChevronDown size={16} className="desktop-only" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="header-dropdown-overlay"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="header-dropdown user-dropdown">
                <div className="dropdown-header user-header">
                  <div className="user-avatar large">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <div className="user-info-name">{user?.name}</div>
                    <div className="user-info-email">{user?.email}</div>
                    {user?.role && (
                      <div className="user-info-role">
                        <Shield size={12} />
                        <span>{user.role}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-body">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/admin/user-approvals');
                      }}
                    >
                      <Shield size={18} />
                      <span>User Approvals</span>
                      {pendingUsersCount > 0 && (
                        <span className="dropdown-badge">{pendingUsersCount}</span>
                      )}
                    </button>
                  )}
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-body">
                  <button className="dropdown-item danger" onClick={handleSignOut}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

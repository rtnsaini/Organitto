import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Bell, User, Settings, LogOut, Menu, X, Shield, ChevronDown, Package, FlaskConical, FileCheck, MessageCircle, Moon, Sun, LayoutDashboard, DollarSign, Calculator, Users, Layers, Wheat, ClipboardCheck, MessagesSquare } from 'lucide-react';
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

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFinanceMenu, setShowFinanceMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const notificationCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const savedTheme = localStorage.getItem('organitto-theme');
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.style.transition = 'background-color 0.3s ease-in-out, color 0.3s ease-in-out';
  }, []);

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

      const usersChannel = supabase
        .channel('users_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
          },
          () => {
            if (user.role === 'admin') {
              fetchPendingUsersCount();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(usersChannel);
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

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('organitto-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('organitto-theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Finance',
      path: '/finance',
      icon: DollarSign,
      submenu: [
        { name: 'Add Expense', path: '/expenses/add' },
        { name: 'Expense List', path: '/expenses' },
        { name: 'Reports', path: '/expenses/reports' },
        { name: 'Investments', path: '/investments' },
      ]
    },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Vendors', path: '/vendors', icon: Users },
    { name: 'Batches', path: '/batches', icon: Layers },
    { name: 'Ingredients', path: '/ingredients', icon: Wheat },
    { name: 'Compliance', path: '/compliance', icon: ClipboardCheck },
    { name: 'Chat', path: '/chat', icon: MessagesSquare },
  ];

  if (user?.role === 'admin') {
    navLinks.push({
      name: 'User Approvals',
      path: '/admin/user-approvals',
      icon: Shield,
      badge: pendingUsersCount > 0 ? pendingUsersCount : undefined
    } as any);
  }

  const isActive = (path: string) => location.pathname === path;
  const isFinanceActive = () => location.pathname.startsWith('/expenses') || location.pathname.startsWith('/investments') || location.pathname === '/finance';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-[12px] bg-[rgba(255,255,255,0.95)] border-b border-[rgba(0,0,0,0.06)]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-[60px]">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="text-xl">🌿</div>
            <span className="text-[1.25rem] font-semibold text-[#2D5016] heading-serif">Organitto</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <div key={link.path} className="relative">
                  {link.submenu ? (
                    <>
                      <button
                        onMouseEnter={() => setShowFinanceMenu(true)}
                        onMouseLeave={() => setShowFinanceMenu(false)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 flex items-center gap-1.5 text-[0.875rem] ${
                          isFinanceActive()
                            ? 'bg-[#E8F5E9] text-[#2D5016]'
                            : 'text-[#6B7280] hover:text-[#2D5016] hover:bg-[rgba(45,80,22,0.05)]'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{link.name}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${showFinanceMenu ? 'rotate-180' : ''}`} />
                      </button>
                      {showFinanceMenu && (
                        <div
                          onMouseEnter={() => setShowFinanceMenu(true)}
                          onMouseLeave={() => setShowFinanceMenu(false)}
                          className="absolute top-full left-0 mt-2 w-56 glass-card border border-white/20 overflow-hidden z-50 animate-slide-down shadow-soft-lg"
                        >
                          {link.submenu.map((sublink) => (
                            <Link
                              key={sublink.path}
                              to={sublink.path}
                              className={`block px-5 py-3.5 text-sm font-semibold transition-all duration-300 hover:translate-x-1 ${
                                isActive(sublink.path)
                                  ? 'bg-gradient-primary/15 text-primary border-l-4 border-primary shadow-sm'
                                  : 'text-dark-brown hover:bg-gradient-primary/10 hover:text-primary hover:border-l-4 hover:border-primary/30'
                              }`}
                            >
                              {sublink.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 flex items-center gap-1.5 text-[0.875rem] ${
                        isActive(link.path)
                          ? 'bg-[#E8F5E9] text-[#2D5016]'
                          : 'text-[#6B7280] hover:text-[#2D5016] hover:bg-[rgba(45,80,22,0.05)]'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{link.name}</span>
                      {(link as any).badge && (
                        <span className="ml-1 px-1.5 py-0.5 bg-gradient-gold text-primary-dark text-[0.625rem] font-semibold rounded-full animate-pulse">
                          {(link as any).badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[rgba(0,0,0,0.06)] text-[#6B7280] hover:bg-[#F5F7F5] hover:text-[#2D5016] hover:border-[rgba(0,0,0,0.08)] transition-all duration-150"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-96 glass-card border border-white/20 overflow-hidden z-20 animate-slide-down">
                    <div className="p-4 bg-gradient-mesh border-b border-primary/10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-primary text-lg">Notifications</h3>
                        {notificationCount > 0 && (
                          <span className="px-2.5 py-1 bg-gradient-gold text-primary-dark text-xs font-bold rounded-full">
                            {notificationCount} new
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer ${
                              !notification.is_read ? 'bg-gold/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !notification.is_read ? 'bg-gold' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-primary text-sm">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-primary/10">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        className="w-full text-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[rgba(0,0,0,0.06)] text-[#6B7280] hover:bg-[#2D5016] hover:text-white hover:border-[#2D5016] transition-all duration-150"
              title="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-[rgba(45,80,22,0.05)] transition-all duration-150"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D5016] to-[#4A7C3B] flex items-center justify-center text-white font-semibold text-xs">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-[#1A1A1A]">{user?.name}</p>
                  <p className="text-[0.625rem] text-[#6B7280] capitalize">{user?.role}</p>
                </div>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 glass-card border border-white/20 overflow-hidden z-20 animate-slide-down">
                    <div className="p-5 bg-gradient-mesh border-b border-primary/10">
                      <p className="font-bold text-primary text-lg">{user?.name}</p>
                      <p className="text-sm text-primary/70 font-medium">{user?.email}</p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-gold rounded-full shadow-sm">
                        <Shield className="w-4 h-4 text-primary-dark" />
                        <span className="text-xs font-bold text-primary-dark capitalize">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-primary hover:bg-primary/5 rounded-button transition-all duration-300 font-semibold group"
                      >
                        <Settings className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-secondary hover:bg-secondary/10 rounded-button transition-all duration-300 font-semibold group"
                      >
                        <LogOut className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-dark-brown hover:bg-primary/10 rounded-lg transition-all duration-300"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <nav className="lg:hidden py-4 border-t-2 border-primary/10 animate-slide-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <div key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => !link.submenu && setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 group ${
                        isActive(link.path) || (link.name === 'Finance' && isFinanceActive())
                          ? 'bg-gradient-primary text-white shadow-colored scale-105'
                          : 'text-primary hover:bg-gradient-primary/10 hover:shadow-soft hover:scale-105 hover:translate-x-1'
                      }`}
                    >
                      {Icon && (
                        <Icon className={`w-5 h-5 transition-transform duration-300 ${
                          isActive(link.path) || (link.name === 'Finance' && isFinanceActive())
                            ? ''
                            : 'group-hover:scale-110 group-hover:rotate-3'
                        }`} />
                      )}
                      <span>{link.name}</span>
                      {(link as any).badge && (
                        <span className="ml-auto px-2 py-0.5 bg-gradient-gold text-primary-dark text-xs font-bold rounded-full shadow-sm animate-pulse">
                          {(link as any).badge}
                        </span>
                      )}
                    </Link>
                    {link.submenu && (
                      <div className="ml-4 mt-2 flex flex-col gap-2 pl-4 border-l-2 border-primary/20">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.path}
                            to={sublink.path}
                            onClick={() => setShowMobileMenu(false)}
                            className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:translate-x-1 ${
                              isActive(sublink.path)
                                ? 'bg-gradient-primary/15 text-primary border-l-4 border-primary shadow-sm'
                                : 'text-dark-brown/80 hover:bg-gradient-primary/10 hover:text-primary hover:border-l-4 hover:border-primary/30'
                            }`}
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

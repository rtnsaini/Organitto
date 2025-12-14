import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Bell, User, Settings, LogOut, Menu, X, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFinanceMenu, setShowFinanceMenu] = useState(false);
  const notificationCount = 3;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    {
      name: 'Finance',
      path: '/finance',
      submenu: [
        { name: 'Add Expense', path: '/expenses/add' },
        { name: 'Expense List', path: '/expenses' },
        { name: 'Reports', path: '/expenses/reports' },
        { name: 'Investments', path: '/investments' },
      ]
    },
    { name: 'Products', path: '/products' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Vendors', path: '/vendors' },
    { name: 'Documents', path: '/documents' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isFinanceActive = () => location.pathname.startsWith('/expenses') || location.pathname.startsWith('/investments') || location.pathname === '/finance';

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/20 shadow-glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-gold blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <img
                src="/whatsapp_image_2025-10-29_at_11.28.27.jpeg"
                alt="Organitto - The Organic Choice"
                className="h-12 md:h-14 w-auto object-contain logo-transparent relative z-10 transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.path} className="relative">
                {link.submenu ? (
                  <>
                    <button
                      onMouseEnter={() => setShowFinanceMenu(true)}
                      onMouseLeave={() => setShowFinanceMenu(false)}
                      className={`px-5 py-2.5 rounded-button font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                        isFinanceActive()
                          ? 'bg-gradient-primary text-white shadow-colored'
                          : 'text-primary hover:bg-primary/5 hover:shadow-sm'
                      }`}
                    >
                      {link.name}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFinanceMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showFinanceMenu && (
                      <div
                        onMouseEnter={() => setShowFinanceMenu(true)}
                        onMouseLeave={() => setShowFinanceMenu(false)}
                        className="absolute top-full left-0 mt-2 w-52 glass-card border border-white/20 overflow-hidden z-50 animate-slide-down"
                      >
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.path}
                            to={sublink.path}
                            className={`block px-4 py-3 text-sm font-medium transition-all duration-300 ${
                              isActive(sublink.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-dark-brown hover:bg-primary/10 hover:text-primary'
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
                    className={`px-5 py-2.5 rounded-button font-semibold transition-all duration-300 relative overflow-hidden group ${
                      isActive(link.path)
                        ? 'bg-gradient-primary text-white shadow-colored'
                        : 'text-primary hover:bg-primary/5 hover:shadow-sm'
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {!isActive(link.path) && (
                      <span className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="relative p-2.5 text-primary hover:bg-primary/5 rounded-button transition-all duration-300 group">
              <Bell className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-gold text-primary-dark text-xs font-bold rounded-full flex items-center justify-center shadow-glow animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-primary/5 rounded-button transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-colored ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-primary">{user?.name}</p>
                  <p className="text-xs text-primary/60 capitalize font-medium">{user?.role}</p>
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
          <nav className="lg:hidden py-4 border-t-2 border-primary/10">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => !link.submenu && setShowMobileMenu(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      isActive(link.path) || (link.name === 'Finance' && isFinanceActive())
                        ? 'bg-primary text-cream shadow-soft'
                        : 'text-dark-brown hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                  {link.submenu && (
                    <div className="ml-4 mt-2 flex flex-col gap-2">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.path}
                          to={sublink.path}
                          onClick={() => setShowMobileMenu(false)}
                          className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            isActive(sublink.path)
                              ? 'bg-primary/20 text-primary'
                              : 'text-dark-brown/70 hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  FlaskConical,
  Calculator,
  Users,
  Package,
  Leaf,
  ShieldCheck,
  UserCheck,
  MessageCircle,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  path?: string;
  active?: boolean;
  badge?: number;
  hasDropdown?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
}

const NavItem = ({
  icon,
  label,
  path,
  active,
  badge,
  hasDropdown,
  isOpen,
  onClick,
  isSubItem
}: NavItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <button
      className={`nav-item ${active ? 'active' : ''} ${isSubItem ? 'sub-item' : ''}`}
      onClick={handleClick}
    >
      {icon && <span className="nav-icon">{icon}</span>}
      <span className="nav-label">{label}</span>
      {badge && badge > 0 && <span className="nav-badge">{badge}</span>}
      {hasDropdown && (
        <ChevronRight className={`nav-chevron ${isOpen ? 'open' : ''}`} />
      )}
    </button>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [financeOpen, setFinanceOpen] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;
  const isFinanceActive = () =>
    location.pathname.startsWith('/expenses') ||
    location.pathname.startsWith('/investments') ||
    location.pathname === '/finance';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo mobile-only">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Organitto</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              path="/dashboard"
              active={isActive('/dashboard')}
            />

            <NavItem
              icon={<Wallet size={18} />}
              label="Finance"
              hasDropdown
              isOpen={financeOpen}
              onClick={() => setFinanceOpen(!financeOpen)}
              active={isFinanceActive()}
            />
            {financeOpen && (
              <div className="nav-dropdown">
                <NavItem
                  label="Add Expense"
                  path="/expenses/add"
                  isSubItem
                  active={isActive('/expenses/add')}
                />
                <NavItem
                  label="Expense List"
                  path="/expenses"
                  isSubItem
                  active={isActive('/expenses')}
                />
                <NavItem
                  label="Reports"
                  path="/expenses/reports"
                  isSubItem
                  active={isActive('/expenses/reports')}
                />
                <NavItem
                  label="Investments"
                  path="/investments"
                  isSubItem
                  active={isActive('/investments')}
                />
              </div>
            )}

            <NavItem
              icon={<FlaskConical size={18} />}
              label="Products"
              path="/products"
              active={isActive('/products')}
            />

            <NavItem
              icon={<Calculator size={18} />}
              label="Cost Calculator"
              path="/calculator"
              active={isActive('/calculator')}
            />

            <NavItem
              icon={<Users size={18} />}
              label="Vendors"
              path="/vendors"
              active={isActive('/vendors')}
            />

            <NavItem
              icon={<Package size={18} />}
              label="Batches"
              path="/batches"
              active={isActive('/batches')}
            />

            <NavItem
              icon={<Leaf size={18} />}
              label="Ingredients"
              path="/ingredients"
              active={isActive('/ingredients')}
            />

            <NavItem
              icon={<ShieldCheck size={18} />}
              label="Compliance"
              path="/compliance"
              active={isActive('/compliance')}
            />

            <NavItem
              icon={<MessageCircle size={18} />}
              label="Team Chat"
              path="/chat"
              active={isActive('/chat')}
            />

            {user?.role === 'admin' && (
              <NavItem
                icon={<UserCheck size={18} />}
                label="User Approvals"
                path="/admin/user-approvals"
                active={isActive('/admin/user-approvals')}
                badge={pendingUsersCount}
              />
            )}
          </div>

          <div className="nav-section nav-section-bottom">
            <NavItem
              icon={<Settings size={18} />}
              label="Settings"
              path="/settings"
              active={isActive('/settings')}
            />
            <NavItem
              icon={<LogOut size={18} />}
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
    </>
  );
}

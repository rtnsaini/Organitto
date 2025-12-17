import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Receipt, Package, Layers, DollarSign, FileText } from 'lucide-react';

interface QuickAction {
  icon: typeof Receipt;
  label: string;
  path: string;
  color: string;
  bgGradient: string;
}

const quickActions: QuickAction[] = [
  {
    icon: Receipt,
    label: 'Add Expense',
    path: '/expenses/new',
    color: 'text-orange-500',
    bgGradient: 'from-orange-500/20 to-orange-600/10'
  },
  {
    icon: Package,
    label: 'Add Product',
    path: '/products',
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-500/20 to-emerald-600/10'
  },
  {
    icon: Layers,
    label: 'Add Batch',
    path: '/batches',
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/20 to-blue-600/10'
  },
  {
    icon: DollarSign,
    label: 'Record Sale',
    path: '/expenses/new',
    color: 'text-green-500',
    bgGradient: 'from-green-500/20 to-green-600/10'
  },
  {
    icon: FileText,
    label: 'Quick Note',
    path: '/chat',
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/20 to-purple-600/10'
  },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleActionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-dark-brown/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-10 flex flex-col-reverse gap-3 mb-5">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleActionClick(action.path)}
                  className="group flex items-center justify-end gap-3 animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="glass-card px-5 py-3 font-semibold text-dark-brown whitespace-nowrap shadow-xl border border-cream/20 backdrop-blur-md">
                    {action.label}
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${action.bgGradient} backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer border-2 border-white/30 glass-card`}>
                    <Icon className={`w-8 h-8 ${action.color} drop-shadow-lg`} strokeWidth={2.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 w-20 h-20 bg-gradient-to-br from-primary via-sage to-secondary rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-[0_0_30px_rgba(139,69,19,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/30 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 rounded-2xl"></div>
        {isOpen ? (
          <X className="w-9 h-9 text-white relative z-10 drop-shadow-lg" strokeWidth={3} />
        ) : (
          <Plus className="w-9 h-9 text-white relative z-10 drop-shadow-lg" strokeWidth={3} />
        )}
      </button>

      {!isOpen && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-pulse shadow-lg"></div>
      )}
    </div>
  );
}

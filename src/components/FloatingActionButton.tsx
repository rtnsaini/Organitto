import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Receipt, Package, Layers, DollarSign, FileText } from 'lucide-react';

interface QuickAction {
  icon: typeof Receipt;
  label: string;
  path: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { icon: Receipt, label: 'Add Expense', path: '/expenses/new', color: 'from-secondary to-accent' },
  { icon: Package, label: 'Add Product', path: '/products', color: 'from-primary to-sage' },
  { icon: Layers, label: 'Add Batch', path: '/batches', color: 'from-sage to-primary' },
  { icon: DollarSign, label: 'Record Sale', path: '/expenses/new', color: 'from-accent to-secondary' },
  { icon: FileText, label: 'Quick Note', path: '/chat', color: 'from-primary to-accent' },
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
            className="fixed inset-0 bg-dark-brown/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-10 flex flex-col-reverse gap-4 mb-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleActionClick(action.path)}
                  className="group flex items-center gap-4 animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="glass-card px-4 py-2 font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-glow hidden md:block">
                    {action.label}
                  </span>
                  <div className={`w-14 h-14 md:w-12 md:h-12 bg-gradient-to-br ${action.color} rounded-full flex items-center justify-center shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-110 cursor-pointer`}>
                    <Icon className="w-6 h-6 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-10 w-16 h-16 md:w-14 md:h-14 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        <div className="absolute inset-0 bg-gradient-gold opacity-0 hover:opacity-20 rounded-full transition-opacity duration-300"></div>
        {isOpen ? (
          <X className="w-7 h-7 md:w-6 md:h-6 text-white relative z-10" strokeWidth={3} />
        ) : (
          <Plus className="w-7 h-7 md:w-6 md:h-6 text-white relative z-10" strokeWidth={3} />
        )}
      </button>

      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
      )}
    </div>
  );
}

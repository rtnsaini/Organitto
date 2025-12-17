import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AddInvoiceModalProps {
  vendorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const statuses = ['pending', 'paid', 'overdue'];

export default function AddInvoiceModal({ vendorId, onClose, onSuccess }: AddInvoiceModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: '',
    status: 'pending',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoiceNumber || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please fill in required fields (Invoice Number and Amount)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('vendor_invoices').insert([
        {
          vendor_id: vendorId,
          invoice_number: formData.invoiceNumber,
          date: formData.date,
          due_date: formData.dueDate,
          amount: parseFloat(formData.amount),
          status: formData.status,
          notes: formData.notes || null,
          created_by: user?.id,
        },
      ]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('Error adding invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-2xl w-full">
        <div className="border-b-2 border-dark-brown/5 px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-primary">Add Invoice</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-brown/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Invoice Number <span className="text-soft-red">*</span>
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-2024-001"
                required
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Amount <span className="text-soft-red">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Invoice Date <span className="text-soft-red">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Due Date <span className="text-soft-red">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or comments..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none resize-none"
              />
            </div>
          </div>
        </form>

        <div className="bg-cream/90 border-t-2 border-dark-brown/5 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-dark-brown/10 text-dark-brown font-semibold rounded-xl hover:bg-dark-brown/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-sage to-primary text-white font-semibold rounded-xl hover:shadow-soft-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AddPriceItemModalProps {
  vendorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const units = ['kg', 'g', 'L', 'mL', 'pieces', 'box', 'packet', 'bottle', 'jar', 'other'];

export default function AddPriceItemModal({ vendorId, onClose, onSuccess }: AddPriceItemModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    unit: 'kg',
    price: '',
    moq: '',
    leadTime: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName || !formData.price || parseFloat(formData.price) <= 0) {
      alert('Please fill in required fields (Product Name and Price)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('vendor_prices').insert([
        {
          vendor_id: vendorId,
          product_name: formData.productName,
          category: formData.category || null,
          unit: formData.unit,
          price: parseFloat(formData.price),
          moq: formData.moq || null,
          lead_time: formData.leadTime ? parseInt(formData.leadTime) : null,
          notes: formData.notes || null,
          created_by: user?.id,
        },
      ]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error adding price item:', error);
      alert('Error adding price item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-2xl w-full">
        <div className="border-b-2 border-dark-brown/5 px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-primary">Add Price Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-brown/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Product/Service Name <span className="text-soft-red">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="e.g., Organic Neem Powder"
                required
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Herbs, Oils, Packaging"
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Unit <span className="text-soft-red">*</span>
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Price per Unit <span className="text-soft-red">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Minimum Order Quantity (MOQ)
              </label>
              <input
                type="text"
                value={formData.moq}
                onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                placeholder="e.g., 100 kg"
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Lead Time (days)
              </label>
              <input
                type="number"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                placeholder="e.g., 7"
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or specifications..."
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
            {loading ? 'Adding...' : 'Add Price Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

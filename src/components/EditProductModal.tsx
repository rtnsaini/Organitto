import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: string, productData: any) => Promise<void>;
  product: any;
  users: any[];
}

const categories = [
  'Skincare',
  'Hair Care',
  'Wellness & Supplements',
  'Oral Care',
  'Personal Care',
  'Home Care',
  'Other',
];

const productTypes = [
  'Face Wash',
  'Shampoo',
  'Oil',
  'Powder',
  'Tablet',
  'Capsule',
  'Gel',
  'Cream',
  'Soap',
  'Serum',
  'Mask',
  'Scrub',
  'Lotion',
  'Other',
];

const stages = [
  { value: 'idea', label: '🌱 Idea' },
  { value: 'research', label: '🔍 Research' },
  { value: 'formula', label: '⚗️ Formula Creation' },
  { value: 'testing', label: '🧪 Testing' },
  { value: 'packaging', label: '📦 Packaging Design' },
  { value: 'printing', label: '🖨️ Printing' },
  { value: 'production', label: '🏭 Production' },
  { value: 'ready', label: '🚀 Ready to Launch' },
  { value: 'launched', label: '✅ Launched' },
];

export default function EditProductModal({ isOpen, onClose, onSubmit, product, users }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    product_type: '',
    current_stage: 'idea',
    priority: 'medium',
    target_launch_date: '',
    description: '',
    assigned_partners: [] as string[],
    image_url: '',
    progress: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        product_type: product.product_type || '',
        current_stage: product.current_stage || 'idea',
        priority: product.priority || 'medium',
        target_launch_date: product.target_launch_date || '',
        description: product.description || '',
        assigned_partners: product.assigned_partners || [],
        image_url: product.image_url || '',
        progress: product.progress || 0,
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(product.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePartner = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_partners: prev.assigned_partners.includes(userId)
        ? prev.assigned_partners.filter(id => id !== userId)
        : [...prev.assigned_partners, userId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-accent to-secondary p-6 rounded-t-2xl flex items-center justify-between">
          <h3 className="font-heading text-3xl font-bold text-white">Edit Product</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-dark-brown mb-2">
              Product Name <span className="text-soft-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Neem Face Wash"
              className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Category <span className="text-soft-red">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Product Type
              </label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Select type</option>
                {productTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Current Stage
              </label>
              <select
                value={formData.current_stage}
                onChange={(e) => setFormData({ ...formData, current_stage: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {stages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Target Launch Date
              </label>
              <input
                type="date"
                value={formData.target_launch_date}
                onChange={(e) => setFormData({ ...formData, target_launch_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-brown mb-2">
              Progress
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-accent min-w-[60px]">{formData.progress}%</span>
            </div>
            <div className="w-full h-3 bg-dark-brown/10 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-sage to-accent transition-all duration-300"
                style={{ width: `${formData.progress}%` }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-brown mb-2">
              Priority
            </label>
            <div className="flex gap-4">
              {[
                { value: 'high', label: 'High', color: 'bg-soft-red' },
                { value: 'medium', label: 'Medium', color: 'bg-accent' },
                { value: 'low', label: 'Low', color: 'bg-sage' },
              ].map(priority => (
                <label
                  key={priority.value}
                  className={`flex-1 cursor-pointer ${
                    formData.priority === priority.value
                      ? `${priority.color} text-white`
                      : 'bg-dark-brown/5 text-dark-brown'
                  } px-4 py-3 rounded-xl font-semibold text-center transition-all duration-300 hover:scale-105`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="sr-only"
                  />
                  {priority.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-brown mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe the product concept..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-brown mb-2">
              Assign Team Members
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {users.map(user => (
                <label
                  key={user.id}
                  className={`cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    formData.assigned_partners.includes(user.id)
                      ? 'border-accent bg-accent/10'
                      : 'border-dark-brown/10 hover:border-accent/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.assigned_partners.includes(user.id)}
                    onChange={() => togglePartner(user.id)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-dark-brown">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-brown mb-2">
              Product Image URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="button"
                className="px-6 py-3 bg-cream border-2 border-dark-brown/10 rounded-xl hover:bg-dark-brown/5 transition-colors flex items-center gap-2 text-dark-brown font-semibold"
              >
                <Upload className="w-5 h-5" />
                Upload
              </button>
            </div>
            {formData.image_url && (
              <div className="mt-3">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-dark-brown/10"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-dark-brown/5 text-dark-brown font-semibold rounded-xl hover:bg-dark-brown/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sage to-primary text-white font-semibold rounded-xl hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

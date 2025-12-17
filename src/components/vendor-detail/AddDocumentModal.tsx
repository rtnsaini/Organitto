import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AddDocumentModalProps {
  vendorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  { id: 'contracts', label: 'Contracts & Agreements' },
  { id: 'gst', label: 'GST Certificate' },
  { id: 'certifications', label: 'Quality Certifications' },
  { id: 'catalogs', label: 'Product Catalogs' },
  { id: 'reports', label: 'Test Reports' },
  { id: 'other', label: 'Other Documents' },
];

export default function AddDocumentModal({ vendorId, onClose, onSuccess }: AddDocumentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fileName: '',
    category: 'other',
    description: '',
    fileUrl: '',
    fileSize: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fileName) {
      alert('Please enter a document name');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('vendor_documents').insert([
        {
          vendor_id: vendorId,
          file_name: formData.fileName,
          category: formData.category,
          description: formData.description || null,
          file_url: formData.fileUrl || null,
          file_size: formData.fileSize,
          uploaded_by: user?.id,
        },
      ]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Error adding document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-2xl w-full">
        <div className="border-b-2 border-dark-brown/5 px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-primary">Upload Document</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-brown/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Document Name <span className="text-soft-red">*</span>
              </label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                placeholder="e.g., GST Certificate 2024"
                required
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Category <span className="text-soft-red">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Document URL (Optional)
              </label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://example.com/document.pdf"
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none"
              />
              <p className="text-xs text-dark-brown/60 mt-1">
                You can provide a link to the document stored elsewhere
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-brown mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Document description or notes..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-dark-brown/10 rounded-xl focus:border-accent focus:outline-none resize-none"
              />
            </div>

            <div className="border-2 border-dashed border-dark-brown/20 rounded-xl p-8 text-center bg-cream/30">
              <Upload className="w-12 h-12 text-dark-brown/40 mx-auto mb-3" />
              <p className="text-sm text-dark-brown/60 mb-2">
                File upload functionality coming soon
              </p>
              <p className="text-xs text-dark-brown/40">
                For now, you can provide a document URL above
              </p>
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
            {loading ? 'Adding...' : 'Add Document'}
          </button>
        </div>
      </div>
    </div>
  );
}

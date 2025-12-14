import { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comments?: string, reason?: string) => void;
  type: 'approve' | 'reject';
  expense: {
    category: string;
    subcategory?: string;
    amount: number;
    expense_date: string;
    payment_mode: string;
  };
  loading?: boolean;
}

const REJECTION_REASONS = [
  'Duplicate entry',
  'Insufficient proof',
  'Incorrect amount',
  'Wrong category',
  'Not a business expense',
  'Missing receipt',
  'Other (specify below)',
];

export default function ApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  expense,
  loading = false,
}: ApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'reject') {
      const reason = selectedReason === 'Other (specify below)' ? customReason : selectedReason;
      if (!reason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      onConfirm(undefined, reason);
    } else {
      onConfirm(comments);
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className={`p-6 border-b-2 ${type === 'approve' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {type === 'approve' ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900">
                  {type === 'approve' ? 'Approve Expense' : 'Reject Expense'}
                </h2>
                <p className="text-sm text-gray-600">
                  {type === 'approve' ? 'Confirm approval of this expense' : 'Please provide a reason'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Expense Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold text-gray-900">
                  {getCategoryLabel(expense.category)}
                  {expense.subcategory && ` - ${expense.subcategory}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-orange-600 text-xl">
                  ₹{expense.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(expense.expense_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-semibold text-gray-900 uppercase">
                  {expense.payment_mode.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {type === 'reject' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reason for Rejection <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-300"
                >
                  <option value="">Select a reason</option>
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {selectedReason === 'Other (specify below)' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Specify Reason
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please provide detailed reason..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-300 resize-none"
                  />
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  The submitter will be notified of this rejection and the reason provided.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments or notes..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300 resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'approve'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white'
                  : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white'
              }`}
            >
              {loading ? 'Processing...' : type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

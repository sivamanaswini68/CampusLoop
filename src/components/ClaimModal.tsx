import React, { useState } from 'react';
import { X, ShieldCheck, Calendar, FileText, Send, Sparkles, AlertCircle } from 'lucide-react';
import { CampusItem, UserProfile } from '../types';
import { submitClaim } from '../services/campusService';

interface ClaimModalProps {
  item: CampusItem | null;
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [proofOrReason, setProofOrReason] = useState('');
  const [borrowDates, setBorrowDates] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofOrReason.trim()) {
      setError('Please provide the required details or proof.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await submitClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemType: item.type,
        ownerId: item.userId,
        ownerName: item.userDisplayName,
        claimantId: currentUser.uid,
        claimantName: currentUser.displayName,
        claimantEmail: currentUser.email,
        claimantPhotoURL: currentUser.photoURL,
        claimantDepartment: currentUser.department || 'Student',
        proofOrReason: proofOrReason.trim(),
        borrowDates: borrowDates.trim() || 'Standard lending period',
      });

      onSuccess();
    } catch (err: any) {
      console.error('Failed to submit claim:', err);
      setError('Could not submit request. Please verify your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFoundItem = item.type === 'found';
  const isLendItem = item.type === 'lend';
  const isLostItem = item.type === 'lost';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {isFoundItem
                  ? 'Claim Ownership of Found Item'
                  : isLendItem
                  ? 'Request to Borrow Item'
                  : isLostItem
                  ? 'I Found This Item'
                  : 'Submit Request'}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{item.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Context box */}
          {isFoundItem && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 text-emerald-900">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Proof of Ownership Required
              </p>
              {item.securityQuestion ? (
                <p className="text-emerald-800">
                  <strong>Question from finder:</strong> "{item.securityQuestion}"
                </p>
              ) : (
                <p className="text-emerald-800">
                  Please describe identifying features, serial numbers, scratches, wallpaper, or contents that only the true owner would know.
                </p>
              )}
            </div>
          )}

          {isLendItem && (
            <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 text-xs space-y-1 text-violet-900">
              <p className="font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                Borrowing Details & Return Promise
              </p>
              <p className="text-violet-800">
                Lenders rely on high community trust. Specify the dates you need this item and your commitment to return it safely.
              </p>
            </div>
          )}

          {/* Dates input if lending item */}
          {isLendItem && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Requested Dates / Duration
              </label>
              <input
                type="text"
                placeholder="e.g. Oct 2 - Oct 5 (Midterm Exam week)"
                value={borrowDates}
                onChange={(e) => setBorrowDates(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          )}

          {/* Details / Proof */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isFoundItem
                ? 'Your Ownership Proof / Answer'
                : isLendItem
                ? 'Reason for Borrowing & Pickup Note'
                : 'Message & Contact Details for Finder'}
            </label>
            <textarea
              rows={4}
              required
              placeholder={
                isFoundItem
                  ? "Describe specific details (e.g., 'The lock screen wallpaper is a picture of my Golden Retriever, serial # begins with SC-40...')"
                  : isLendItem
                  ? "Explain why you need this item and your preferred campus pickup spot (e.g. Science Quad or Library)..."
                  : "Explain where you spotted or safely placed their lost item..."
              }
              value={proofOrReason}
              onChange={(e) => setProofOrReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition leading-relaxed resize-none"
            />
          </div>

          {/* Claimant Profile preview */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Submitting as:</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <img
                src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                alt={currentUser.displayName}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{currentUser.displayName}</span>
              <span className="text-emerald-600 font-bold">({currentUser.trustScore} Trust)</span>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !proofOrReason.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

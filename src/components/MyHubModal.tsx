import React, { useState } from 'react';
import {
  X,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Share2,
  PackageCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { CampusItem, Claim, UserProfile } from '../types';
import { updateClaimStatus } from '../services/campusService';

interface MyHubModalProps {
  currentUser: UserProfile;
  myItems: CampusItem[];
  claims: Claim[];
  onClose: () => void;
  onSelectItem: (item: CampusItem) => void;
}

export const MyHubModal: React.FC<MyHubModalProps> = ({
  currentUser,
  myItems,
  claims,
  onClose,
  onSelectItem,
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'myClaims' | 'myListings' | 'history'>('incoming');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Incoming requests are claims where current user is the item owner
  const incomingClaims = claims.filter((c) => c.ownerId === currentUser.uid);
  // My claims are claims where current user is the claimant
  const myClaims = claims.filter((c) => c.claimantId === currentUser.uid);

  const pendingIncoming = incomingClaims.filter((c) => c.status === 'pending');
  const activeIncoming = incomingClaims.filter((c) => c.status === 'approved');

  const pendingMyClaims = myClaims.filter((c) => c.status === 'pending');
  const activeBorrowed = myClaims.filter((c) => c.status === 'approved');
  const completedHistory = claims.filter(
    (c) => c.status === 'returned' || c.status === 'rejected' || c.status === 'cancelled'
  );

  const handleUpdateStatus = async (
    claim: Claim,
    newStatus: 'approved' | 'rejected' | 'returned'
  ) => {
    try {
      setActionLoadingId(claim.id);
      await updateClaimStatus(
        claim.id,
        claim.itemId,
        claim.itemType,
        newStatus,
        claim.claimantId,
        claim.claimantName
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update request status. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">My Campus Hub</h3>
              <p className="text-xs text-slate-500">
                Track your active listings, borrowed gear, and incoming requests
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'incoming'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Incoming Requests</span>
            {pendingIncoming.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {pendingIncoming.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('myClaims')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'myClaims'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Borrows & Claims</span>
            {activeBorrowed.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                {activeBorrowed.length} active
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('myListings')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === 'myListings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Listings ({myItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Activity History</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* TAB 1: INCOMING REQUESTS ON MY ITEMS */}
          {activeTab === 'incoming' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Manage requests submitted by peers for items you posted</span>
                <span className="font-semibold text-slate-700">{incomingClaims.length} Total</span>
              </div>

              {incomingClaims.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No incoming requests yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    When someone claims a found item you reported or asks to borrow your equipment, you'll review and approve them here.
                  </p>
                </div>
              ) : (
                incomingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              claim.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : claim.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : claim.status === 'returned'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {claim.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                            {claim.itemTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Received {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Claimant info */}
                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{claim.claimantName}</p>
                          <p className="text-[11px] text-slate-500">{claim.claimantDepartment}</p>
                        </div>
                        <img
                          src={claim.claimantPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${claim.claimantId}`}
                          alt={claim.claimantName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      </div>
                    </div>

                    {/* Proof or Reason */}
                    <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-100">
                      <p className="font-semibold text-slate-900 mb-1">
                        {claim.itemType === 'found' ? 'Provided Proof:' : 'Borrow Reason / Note:'}
                      </p>
                      <p className="whitespace-pre-wrap">{claim.proofOrReason}</p>
                      {claim.borrowDates && (
                        <p className="text-[11px] text-violet-700 font-medium mt-1">
                          📅 Requested timeline: {claim.borrowDates}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      {claim.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(claim, 'rejected')}
                            disabled={actionLoadingId === claim.id}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(claim, 'approved')}
                            disabled={actionLoadingId === claim.id}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Request</span>
                          </button>
                        </>
                      )}

                      {claim.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(claim, 'returned')}
                          disabled={actionLoadingId === claim.id}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Confirm Returned & Boost Trust Score</span>
                        </button>
                      )}

                      {claim.status === 'returned' && (
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Successfully Returned
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: MY BORROWS & CLAIMS */}
          {activeTab === 'myClaims' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Items you have requested to borrow or claimed as your lost item
              </div>

              {myClaims.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Share2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No active borrows or claims</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Find items in the catalog to borrow or submit a claim if you spot your lost item.
                  </p>
                </div>
              ) : (
                myClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{claim.itemTitle}</h4>
                        <p className="text-xs text-slate-500">Owner: {claim.ownerName}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          claim.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : claim.status === 'returned'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {claim.status === 'approved' ? 'Active / In Possession' : claim.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600">
                      <p><strong>Your submission:</strong> {claim.proofOrReason}</p>
                      {claim.borrowDates && (
                        <p className="text-[11px] text-slate-500 mt-1">Requested timeline: {claim.borrowDates}</p>
                      )}
                    </div>

                    {/* Return Action */}
                    {claim.status === 'approved' && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-indigo-600 font-medium">
                          Please return on time to keep your high trust score!
                        </span>
                        <button
                          onClick={() => handleUpdateStatus(claim, 'returned')}
                          disabled={actionLoadingId === claim.id}
                          className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Mark as Handed Back</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: MY LISTINGS */}
          {activeTab === 'myListings' && (
            <div className="space-y-3">
              {myItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No items posted yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Post an item you lost, found on campus, or want to share with others.
                  </p>
                </div>
              ) : (
                myItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white shadow-xs cursor-pointer transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                            {item.type[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate max-w-[200px] sm:max-w-md">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.location} • Status: <strong className="capitalize">{item.status}</strong>
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: ACTIVITY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Log of completed item returns, resolved lost & found claims, and past activity
              </div>

              {completedHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No completed activity yet. As items are returned and resolved, they will appear here.
                </div>
              ) : (
                completedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.itemTitle}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.status === 'returned'
                            ? `Successfully returned between ${item.ownerName} & ${item.claimantName}`
                            : `Request marked ${item.status}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  Send,
  MessageSquare,
  Gift,
  HelpCircle,
  PackageCheck,
  Share2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { CampusItem, ItemMessage, UserProfile } from '../types';
import {
  deleteCampusItem,
  flagCampusItem,
  sendItemMessage,
  subscribeToItemMessages
} from '../services/campusService';

interface ItemDetailsModalProps {
  item: CampusItem | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenClaim: (item: CampusItem) => void;
  onOpenAuth: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  currentUser,
  onClose,
  onOpenClaim,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [messages, setMessages] = useState<ItemMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!item) return;
    const unsub = subscribeToItemMessages(item.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [item?.id]);

  if (!item) return null;

  const isOwner = currentUser?.uid === item.userId;
  const isAdmin = currentUser?.role === 'admin';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendItemMessage(item.id, {
        itemId: item.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhotoURL: currentUser.photoURL,
        recipientId: item.userId,
        text: newMessage.trim(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFlag = async () => {
    if (flagged) return;
    try {
      await flagCampusItem(item.id, item.flagsCount || 0);
      setFlagged(true);
    } catch (err) {
      console.error('Failed to flag item:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      setIsDeleting(true);
      await deleteCampusItem(item.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const typeConfig = {
    lost: { label: 'Lost Item', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    found: { label: 'Found Item', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    lend: { label: 'Lending Item', color: 'text-violet-700 bg-violet-50 border-violet-200' },
    borrow_request: { label: 'Borrow Request', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  };

  const currentType = typeConfig[item.type] || typeConfig.lost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${currentType.color}`}>
              {currentType.label}
            </span>
            <span className="text-xs text-slate-500 font-medium capitalize">
              • {item.category.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {(isOwner || isAdmin) && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Delete Listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 border-b-2 font-semibold transition ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Item Details
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-4 border-b-2 font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Campus Discussion ({messages.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              
              {/* Image Preview if available */}
              {item.imageUrl && (
                <div className="rounded-xl overflow-hidden max-h-72 bg-slate-100 border border-slate-200">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover max-h-72"
                  />
                </div>
              )}

              {/* Title & Status */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h2>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    Status: {item.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {item.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Reported: {item.date}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Item Description
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Found Item Info / Security Question prompt */}
              {item.type === 'found' && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs sm:text-sm">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Ownership Verification Requirement</span>
                  </div>
                  {item.securityQuestion ? (
                    <p className="text-xs text-emerald-800">
                      <strong className="font-semibold">Security Question: </strong>
                      "{item.securityQuestion}"
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-800">
                      The finder will verify unique markings, serial numbers, or lock-screen details before handing over.
                    </p>
                  )}
                  {item.pickupLocation && (
                    <p className="text-xs text-emerald-900 pt-1 font-medium">
                      📍 Safely stored at: <strong>{item.pickupLocation}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Lost Item Reward */}
              {item.type === 'lost' && item.reward && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                  <Gift className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Offered Finder Reward:</p>
                    <p className="text-xs text-amber-800 font-medium">{item.reward}</p>
                  </div>
                </div>
              )}

              {/* Lend Item info */}
              {item.type === 'lend' && item.borrowDurationDays && (
                <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-violet-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-violet-900">Borrow Duration Guidelines:</p>
                    <p className="text-xs text-violet-800 font-medium">
                      Maximum standard lending duration is {item.borrowDurationDays} days. Please return in same clean condition.
                    </p>
                  </div>
                </div>
              )}

              {/* Currently Borrowed Notice */}
              {item.status === 'borrowed' && item.currentBorrowerName && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-900">
                    Currently borrowed by: {item.currentBorrowerName}
                  </span>
                  {item.dueDate && (
                    <span className="text-purple-700">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* Poster Profile */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.userPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.userId}`}
                    alt={item.userDisplayName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.userDisplayName}</p>
                    <p className="text-[11px] text-slate-500">
                      Campus Student {item.userCampusId ? `• ID: ${item.userCampusId}` : ''}
                    </p>
                  </div>
                </div>

                {!isOwner && (
                  <button
                    onClick={handleFlag}
                    disabled={flagged}
                    className="text-xs text-slate-400 hover:text-amber-600 flex items-center gap-1 transition"
                    title="Report inappropriate listing"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{flagged ? 'Reported' : 'Report'}</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Item Safe Discussion Chat Tab */
            <div className="space-y-4">
              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Safe Campus Inquiry: Communicate publicly or ask questions regarding this listing without sharing private contact info.
                </span>
              </div>

              {/* Messages list */}
              <div className="space-y-3 min-h-[220px] max-h-[320px] overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No questions or messages yet. Be the first to ask!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMsgOwner = msg.senderId === currentUser?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMsgOwner ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMsgOwner && (
                          <img
                            src={msg.senderPhotoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderId}`}
                            alt={msg.senderName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                          />
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-xs ${
                            isMsgOwner
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className={`font-bold text-[11px] ${isMsgOwner ? 'text-indigo-100' : 'text-slate-900'}`}>
                              {msg.senderName}
                            </span>
                            <span className={`text-[10px] ${isMsgOwner ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input box */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder={currentUser ? "Ask a question about this item..." : "Sign in to post a message"}
                  disabled={!currentUser || isSending}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!currentUser || isSending || !newMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isOwner ? 'You posted this item' : 'CampusLoop Verified Listing'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
            >
              Close
            </button>

            {/* Action buttons */}
            {!isOwner && item.status !== 'closed' && item.status !== 'claimed' && item.status !== 'returned' && (
              <button
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth();
                  } else {
                    onOpenClaim(item);
                  }
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-sm hover:shadow transition flex items-center gap-1.5 ${
                  item.type === 'found'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : item.type === 'lend'
                    ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20'
                    : item.type === 'lost'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {item.type === 'found' && (
                  <>
                    <PackageCheck className="w-4 h-4" />
                    <span>Claim Ownership</span>
                  </>
                )}
                {item.type === 'lend' && (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Request to Borrow</span>
                  </>
                )}
                {item.type === 'lost' && (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>I Found This!</span>
                  </>
                )}
                {item.type === 'borrow_request' && (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Offer to Lend</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

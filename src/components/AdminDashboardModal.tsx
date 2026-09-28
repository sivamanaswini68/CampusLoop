import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  Users,
  Trash2,
  Megaphone,
  CheckCircle2,
  Ban,
  UserCheck,
  Package,
  Plus
} from 'lucide-react';
import { Announcement, CampusItem, UserProfile } from '../types';
import {
  createAnnouncement,
  deleteAnnouncement,
  deleteCampusItem,
  getAllUsers,
  toggleUserBan,
  updateCampusItem,
  verifyUserCampusStatus
} from '../services/campusService';

interface AdminDashboardModalProps {
  currentUser: UserProfile;
  items: CampusItem[];
  announcements: Announcement[];
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  currentUser,
  items,
  announcements,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'flagged' | 'users' | 'announcements' | 'allItems'>('flagged');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annUrgency, setAnnUrgency] = useState<'info' | 'warning' | 'alert'>('info');
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  // Flagged items
  const flaggedItems = items.filter((i) => i.isFlagged || (i.flagsCount && i.flagsCount > 0));

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const list = await getAllUsers();
      setUsersList(list);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDismissFlag = async (item: CampusItem) => {
    try {
      await updateCampusItem(item.id, {
        isFlagged: false,
        flagsCount: 0,
      });
    } catch (err) {
      console.error('Failed to dismiss flag:', err);
    }
  };

  const handleDeleteListing = async (itemId: string) => {
    if (!window.confirm('Delete this listing permanently as an administrator?')) return;
    try {
      await deleteCampusItem(itemId);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleToggleBan = async (user: UserProfile) => {
    try {
      await toggleUserBan(user.uid, !user.isBanned);
      setUsersList((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, isBanned: !u.isBanned } : u))
      );
    } catch (err) {
      console.error('Failed to toggle ban:', err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    try {
      setIsSubmittingAnn(true);
      await createAnnouncement({
        title: annTitle.trim(),
        message: annMessage.trim(),
        urgency: annUrgency,
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
        active: true,
      });
      setAnnTitle('');
      setAnnMessage('');
    } catch (err) {
      console.error('Failed to create announcement:', err);
    } finally {
      setIsSubmittingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Campus Administration</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Moderator Console
                </span>
              </div>
              <p className="text-xs text-slate-300">Logged in as {currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('flagged')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'flagged'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Reported Items ({flaggedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-teal-500" />
            <span>Broadcast Notices ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('allItems')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'allItems'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>All Catalog Items ({items.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* TAB 1: FLAGGED ITEMS */}
          {activeTab === 'flagged' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Items reported by community members for inappropriate content or spam
              </div>

              {flaggedItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No reported items!</p>
                  <p className="text-xs text-slate-400 mt-1">CampusLoop listings are clean and safe.</p>
                </div>
              ) : (
                flaggedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase">
                          {item.flagsCount || 1} Reports
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Posted by {item.userDisplayName} ({item.userEmail}) • Location: {item.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDismissFlag(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Listing</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Registered campus students and moderators</span>
                <button
                  onClick={loadUsers}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Refresh Users
                </button>
              </div>

              {loadingUsers ? (
                <div className="text-center py-10 text-xs text-slate-400">Loading student directory...</div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3">Student</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Trust Score</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList.map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-50/70">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`}
                                  alt={u.displayName}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{u.displayName}</p>
                                  <p className="text-[11px] text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-slate-600">{u.department || 'N/A'}</td>
                            <td className="p-3 font-semibold text-emerald-600">⭐ {u.trustScore}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3">
                              {u.isBanned ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  Banned
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleToggleBan(u)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                    u.isBanned
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  }`}
                                >
                                  {u.isBanned ? 'Unban' : 'Ban User'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BROADCAST NOTICES */}
          {activeTab === 'announcements' && (
            <div className="space-y-5">
              {/* Form to post announcement */}
              <form onSubmit={handleCreateAnnouncement} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-teal-600" />
                  Post Official Campus Broadcast
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Title: e.g. Library Lost & Found Hours Extended"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <select
                      value={annUrgency}
                      onChange={(e) => setAnnUrgency(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="alert">Alert (Rose)</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Broadcast message visible to all students at top banner..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingAnn}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish Broadcast</span>
                  </button>
                </div>
              </form>

              {/* List of active announcements */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase">Current Announcements</h5>
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{ann.title}</span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 rounded bg-slate-100 text-slate-600">
                          {ann.urgency}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{ann.message}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                      title="Remove announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ALL CATALOG ITEMS */}
          {activeTab === 'allItems' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Administrative overview of all {items.length} items across campus
              </div>

              <div className="space-y-2 max-h-[450px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {item.type}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-sm">{item.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.location} • By {item.userDisplayName} • Status: {item.status}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Award,
  BookOpen,
  Building,
  Phone,
  Check,
  Star,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { updateUserProfile } from '../services/campusService';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (updated: Partial<UserProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  onUpdate,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [campusId, setCampusId] = useState(user.campusId || '');
  const [department, setDepartment] = useState(user.department || '');
  const [dormOrBuilding, setDormOrBuilding] = useState(user.dormOrBuilding || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const departments = [
    'Computer Science & AI',
    'Electrical & Computer Engineering',
    'Mechanical Engineering',
    'Business & Finance',
    'Biology & Pre-Med',
    'Chemistry & Biochemistry',
    'Arts, Design & Architecture',
    'Psychology & Social Sciences',
    'Literature & Communications',
    'Mathematics & Statistics',
    'General Studies',
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updates = {
        displayName: displayName.trim(),
        campusId: campusId.trim(),
        department,
        dormOrBuilding: dormOrBuilding.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      };
      await updateUserProfile(user.uid, updates);
      onUpdate(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Could not update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header with Avatar & Trust Score */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
              alt={user.displayName}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{user.displayName}</h3>
                {user.role === 'admin' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-300" />
                    Student
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100">{user.email}</p>
              
              {/* Trust score pill */}
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/20 text-xs font-semibold text-teal-300">
                <Star className="w-3.5 h-3.5 fill-teal-300 text-teal-300" />
                <span>{user.trustScore} Trust Points</span>
                <span className="text-[10px] text-indigo-200 font-normal ml-1">• Reliable Citizen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges strip */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified Campus Account
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Award className="w-3 h-3 text-indigo-600" />
            Campus Contributor
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Returner Badge
          </span>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student ID #
              </label>
              <input
                type="text"
                placeholder="e.g. STU-8492"
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone / Reach
              </label>
              <input
                type="text"
                placeholder="e.g. (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dorm / Campus Residence
              </label>
              <input
                type="text"
                placeholder="e.g. North Hall 304"
                value={dormOrBuilding}
                onChange={(e) => setDormOrBuilding(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Bio / Campus Note
            </label>
            <textarea
              rows={2}
              placeholder="e.g. CS Sophomore, willing to share lab equipment & graphing calculators!"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

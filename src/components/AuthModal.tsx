import React, { useState } from 'react';
import { X, ShieldCheck, LogIn, Sparkles, User, AlertCircle } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';
import { syncUserProfile } from '../services/campusService';
import { UserProfile } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await loginWithGoogle();
      if (user) {
        const profile = await syncUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        onLoginSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // If popup was blocked or closed by user
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing.');
      } else {
        setError(err.message || 'Unable to sign in with Google. You can also use a quick campus demo account below.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick campus demo login for easy testing between 2 students or admin
  const handleDemoStudentLogin = async (role: 'student_alex' | 'student_maya' | 'admin_user') => {
    try {
      setLoading(true);
      setError(null);
      let demoData = {
        uid: 'demo_alex_99',
        email: 'alex.rivera@campus.edu',
        displayName: 'Alex Rivera',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      };

      if (role === 'student_maya') {
        demoData = {
          uid: 'demo_maya_42',
          email: 'maya.patel@campus.edu',
          displayName: 'Maya Patel',
          photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        };
      } else if (role === 'admin_user') {
        // Bootstrapped admin email from runtime: sivamanaswini68@gmail.com
        demoData = {
          uid: 'admin_siva_01',
          email: 'sivamanaswini68@gmail.com',
          displayName: 'Campus Admin (Sivamanaswini)',
          photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        };
      }

      const profile = await syncUserProfile(demoData);
      onLoginSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError('Failed to log in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">CampusLoop Sign In</h3>
              <p className="text-[11px] text-slate-500">Student & Admin Campus Access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          <div>
            <h4 className="font-bold text-lg text-slate-900">Welcome to CampusLoop</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
              Join your campus network to report lost gear, claim found belongings, and borrow items reliably.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Google Auth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl shadow-xs text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center gap-3 transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          {/* Quick Demo Student Switcher for Reviewers */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              — Quick Reviewer Demo Accounts —
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleDemoStudentLogin('student_alex')}
                disabled={loading}
                className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition text-center"
              >
                Alex Rivera
                <span className="block text-[10px] font-normal text-indigo-500">Student</span>
              </button>

              <button
                onClick={() => handleDemoStudentLogin('student_maya')}
                disabled={loading}
                className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold border border-teal-200 transition text-center"
              >
                Maya Patel
                <span className="block text-[10px] font-normal text-teal-500">Student</span>
              </button>

              <button
                onClick={() => handleDemoStudentLogin('admin_user')}
                disabled={loading}
                className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 transition text-center"
                title="Logs in as sivamanaswini68@gmail.com with Admin role"
              >
                Campus Admin
                <span className="block text-[10px] font-normal text-purple-500">sivamanaswini68</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

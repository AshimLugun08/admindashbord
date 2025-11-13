// src/components/AdminLogin.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router'; // 🔑 Import useNavigate

// 🛑 Define the full URL for Google OAuth initiation
const BACKEND_GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL}/auth/google`;

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate(); // 🔑 Initialize hook
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // ✅ SUCCESS: Redirect user to the dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      // Safely handle the error object which is 'unknown'
      setError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                placeholder="admin@example.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Local Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Separator and Google OAuth Link */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-300"></span></div>
                <div className="relative bg-white px-3 text-sm text-slate-500">OR</div>
            </div>
            
            {/* 🔑 Google Sign-In Link */}
            <a 
                href={BACKEND_GOOGLE_AUTH_URL}
                className="w-full flex items-center justify-center space-x-2 border border-slate-300 bg-white text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-50 transition"
            >
                {/* Simple SVG for Google logo */}
                <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 7.917-11.303 7.917-6.762 0-12.263-5.454-12.263-12.158 0-6.704 5.501-12.158 12.263-12.158 3.109 0 5.867 1.258 8.003 3.327l5.657-5.657C34.04 5.92 29.308 4 24 4 12.955 4 4 13.111 4 24s8.955 20 20 20c11.452 0 19.167-7.318 19.167-19.5 0-1.377-.184-2.73-.393-4.083z" fill="#4285F4"/><path d="M6.306 14.691L14.072 21.01H24v-8h-8.157l-9.537 1.681z" fill="#34A853"/><path d="M24 44c11.452 0 19.167-7.318 19.167-19.5 0-1.377-.184-2.73-.393-4.083H24v8h11.303c-1.649 4.657-6.08 7.917-11.303 7.917-6.762 0-12.263-5.454-12.263-12.158 0-6.704 5.501-12.158 12.263-12.158 3.109 0 5.867 1.258 8.003 3.327l5.657-5.657C34.04 5.92 29.308 4 24 4 12.955 4 4 13.111 4 24s8.955 20 20 20z" fill="#FBBC05"/><path d="M43.611 20.083H24V12.983h19.611c-.209-1.353-.393-2.706-.393-4.083 0-12.182-7.715-19.5-19.167-19.5C12.955 4 4 13.111 4 24s8.955 20 20 20c11.452 0 18.423-7.29 19.167-18.083z" fill="#EA4335"/></svg>
                <span>Continue with Google</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
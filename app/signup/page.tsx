'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { authService } from '@/lib/auth';
import { Paintbrush, Lock, Mail, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authService.signUp(email, password, name, phone);
      if (res.success) {
        setSuccess(res.message);
        
        // Clear inputs on success
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');

        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2000);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-[#D4CBB3] rounded-none p-8 relative overflow-hidden shadow-sm">
        {/* Decorative gold stripe */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C5A059]" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-none bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#8B1E2A] mb-3">
            <Paintbrush className="w-8 h-8 text-[#C5A059]" />
          </div>
          <h1 className="font-heading text-3xl font-light italic text-[#1A1A1A]">
            Join <span className="text-[#8B1E2A] font-bold not-italic">New Mughal</span>
          </h1>
          <p className="text-[#554D4D] text-xs uppercase tracking-widest font-mono mt-2">Register for updates & custom palettes</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-none mb-4 text-left"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-none mb-4 flex items-start gap-2 text-left"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C5A059]">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#D4CBB3] rounded-none bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#8B1E2A] transition-all"
                placeholder="Prince Akbar"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C5A059]">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#D4CBB3] rounded-none bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#8B1E2A] transition-all"
                placeholder="akbar@mughal.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C5A059]">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#D4CBB3] rounded-none bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#8B1E2A] transition-all"
                placeholder="+92 300 1234567"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C5A059]">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#D4CBB3] rounded-none bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#8B1E2A] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B1E2A] text-white py-3 rounded-none font-bold tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:opacity-55 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4 text-[#C5A059]" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#554D4D]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#8B1E2A] hover:text-[#C5A059] font-bold transition-all"
            >
              Sign In Instead
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

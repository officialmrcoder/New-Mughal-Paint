'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { authService } from '@/lib/auth';
import { Paintbrush, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authService.resetPassword(email);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
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
            Reset <span className="text-[#8B1E2A] font-bold not-italic">Password</span>
          </h1>
          <p className="text-[#554D4D] text-xs uppercase tracking-widest font-mono mt-2">Request a decree link to recover your access</p>
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
            className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-none mb-4 text-left"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleReset} className="space-y-4 text-left">
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
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B1E2A] text-white py-3 rounded-none font-bold tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:opacity-55"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <ArrowRight className="w-4 h-4 text-[#C5A059]" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B1E2A] hover:text-[#C5A059] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { authService } from '@/lib/auth';
import { Paintbrush, Lock, Mail, ArrowRight, Shield, User } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if they were redirected because of authorization issues
  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized_admin_access') {
      setTimeout(() => {
        setError('You must have Administrator privileges to access that section.');
      }, 0);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        setSuccess(res.message);
        
        // Brief delay for beautiful success state transition
        setTimeout(() => {
          const redirectPath = searchParams.get('redirect') || '/';
          router.push(redirectPath);
          router.refresh();
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to pre-fill credentials in mock mode
  const handlePrefill = (type: 'customer' | 'admin') => {
    if (type === 'admin') {
      setEmail('admin@newmughal.com');
      setPassword('admin');
    } else {
      setEmail('customer@test.com');
      setPassword('password');
    }
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-[#D4CBB3] rounded-none p-8 relative overflow-hidden shadow-sm">
      {/* Decorative gold stripe */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C5A059]" />

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-none bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#8B1E2A] mb-4">
          <Paintbrush className="w-8 h-8 text-[#C5A059]" />
        </div>
        <h1 className="font-heading text-3xl font-light italic text-[#1A1A1A]">
          <span className="text-[#8B1E2A] font-bold not-italic">New Mughal</span> Paint
        </h1>
        <p className="text-[#554D4D] text-xs uppercase tracking-widest font-mono mt-2">Log in to your account</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-none mb-6 text-left"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-none mb-6 text-left"
        >
          {success}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-5 text-left">
        <div>
          <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-2">
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
              className="w-full pl-10 pr-4 py-2.5 border-2 border-[#D4CBB3] rounded-none bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#8B1E2A] transition-all"
              placeholder="emperor@mughal.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#8B1E2A] hover:text-[#C5A059] font-bold tracking-wider transition-all uppercase"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C5A059]">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-[#D4CBB3] rounded-none bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#8B1E2A] transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8B1E2A] text-white py-3 rounded-none font-bold tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:opacity-55"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4 text-[#C5A059]" />
        </button>
      </form>

      <div className="mt-8 pt-6 border-t-2 border-dashed border-[#D4CBB3] text-center">
        <p className="text-[10px] text-[#554D4D] font-bold uppercase tracking-widest mb-3">Quick Login</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handlePrefill('customer')}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#8B1E2A] text-[10px] font-bold uppercase tracking-wider rounded-none border-2 border-[#D4CBB3] hover:bg-[#F5F1E9] transition-all"
          >
            <User className="w-3.5 h-3.5 text-[#C5A059]" />
            Customer
          </button>
          <button
            onClick={() => handlePrefill('admin')}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#8B1E2A] text-[10px] font-bold uppercase tracking-wider rounded-none border-2 border-[#D4CBB3] hover:bg-[#F5F1E9] transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
            Admin
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-[#554D4D]">
          New to Mughal Paints?{' '}
          <Link
            href="/signup"
            className="text-[#8B1E2A] hover:text-[#C5A059] font-bold transition-all"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-center p-8 bg-white border-2 border-[#D4CBB3] rounded-none">
          <p className="text-[#8B1E2A] font-heading font-medium tracking-widest uppercase">Entering Royal Hall...</p>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </main>
  );
}

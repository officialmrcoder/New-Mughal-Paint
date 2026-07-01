'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService, UserProfile } from '@/lib/auth';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Heart,
  Lock
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Profile edit form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUserData = async () => {
    setLoading(true);
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login?redirect=/account');
      return;
    }

    setUser(currentUser);
    setName(currentUser.name);
    setPhone(currentUser.phone);
    setAddress(currentUser.address || '');

    // Load orders count
    if (isSupabaseConfigured()) {
      try {
        const { data, error: orderErr } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', currentUser.id);

        if (!orderErr && data) {
          setOrdersCount(data.length);
        }
      } catch (e) {
        console.error('Error fetching Supabase orders count:', e);
      }
    } else {
      const mockDb = getMockDatabase();
      const userOrders = mockDb.orders.filter((o: any) => o.user_id === currentUser.id);
      setOrdersCount(userOrders.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUserData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await authService.updateProfile({
        ...user,
        name,
        phone,
        address
      });

      if (res.success) {
        setMessage(res.message);
        // Reload details
        const refreshed = await authService.getCurrentUser();
        if (refreshed) {
          setUser(refreshed);
        }
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold font-mono">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* Welcome Dashboard Block */}
        {user && (
          <div className="bg-[#1A1A1A] text-[#EBE4D5] rounded-none p-8 relative overflow-hidden border-b-4 border-[#C5A059] shadow-sm">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10 text-left">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold font-mono">
                  MY ACCOUNT
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-light italic text-[#FAF6EE] leading-none">
                  Welcome, <span className="text-[#C5A059] font-bold not-italic">{user.name}</span>
                </h1>
                <p className="text-xs text-[#9E8E81] flex items-center gap-1.5 font-light">
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" /> {user.email} • {user.role === 'admin' ? 'Admin' : 'Customer'}
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-none text-center min-w-24">
                  <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono">Past Orders</span>
                  <span className="font-heading text-2xl font-bold text-[#C5A059]">{ordersCount}</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-none text-center min-w-24">
                  <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono">Profile Status</span>
                  <span className="font-heading text-xs font-bold text-green-400 flex items-center justify-center gap-1 mt-1.5 uppercase font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Toggle Dashboard */}
        <div className="border-b-2 border-[#D4CBB3] flex gap-6">
          <Link
            href="/account"
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#8B1E2A]"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#C5A059]" />
              PROFILE
            </span>
            <motion.div layoutId="account-tab-border" className="absolute bottom-0 left-0 w-full h-1 bg-[#8B1E2A]" />
          </Link>
          <Link
            href="/account/orders"
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#9E8E81] hover:text-[#554D4D]"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
              ORDERS ({ordersCount})
            </span>
          </Link>
          <Link
            href="/account/wishlist"
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#9E8E81] hover:text-[#554D4D]"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C5A059]" />
              WISHLIST
            </span>
          </Link>
        </div>

        {/* Profile Body Contents */}
        <div className="pt-2 text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-[#D4CBB3] rounded-none p-6 md:p-8 shadow-sm space-y-6"
          >
            <div>
              <h3 className="font-heading text-lg font-bold text-[#8B1E2A] uppercase tracking-wider font-serif italic">Profile Information</h3>
              <p className="text-xs text-[#554D4D] mt-1">Manage your name, phone number and delivery address</p>
            </div>

            {message && (
              <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-none flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-none flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-2 font-mono">
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
                      required
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-[#D4CBB3] bg-white text-sm focus:outline-none focus:border-[#8B1E2A]"
                      placeholder="Emperor Shah Jahan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-2 font-mono">
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
                      required
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-[#D4CBB3] bg-white text-sm focus:outline-none focus:border-[#8B1E2A]"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554D4D] uppercase tracking-wider mb-2 font-mono">
                  Delivery Address
                </label>
                <div className="relative">
                  <span className="absolute top-3.5 left-3 text-[#C5A059]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#D4CBB3] bg-white text-sm focus:outline-none focus:border-[#8B1E2A]"
                    placeholder="Specify your house address, building/complex coordinates..."
                  />
                </div>
              </div>

              <div className="pt-2 text-left">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#8B1E2A] text-white px-6 py-3 rounded-none text-xs font-bold tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors disabled:opacity-55"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

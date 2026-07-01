'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Expand order items accordion
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadUserData = async () => {
    setLoading(true);
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    setUser(currentUser);

    // Load orders
    if (isSupabaseConfigured()) {
      try {
        const { data, error: orderErr } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            total_amount,
            address,
            payment_method,
            created_at,
            order_items(
              id,
              quantity,
              price,
              product:products(name, image_url),
              shade:product_shades(shade_name, color_code)
            )
          `)
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!orderErr && data) {
          setOrders(data);
        }
      } catch (e) {
        console.error('Error fetching Supabase orders:', e);
      }
    } else {
      // Mock Mode fallback
      const mockDb = getMockDatabase();
      const userOrders = mockDb.orders.filter((o: any) => o.user_id === currentUser.id);
      setOrders(userOrders);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUserData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleOrderAccordion = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusLabelColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold font-mono">Loading Orders...</p>
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
                  ORDER HISTORY
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-light italic text-[#FAF6EE] leading-none">
                  Your <span className="text-[#C5A059] font-bold not-italic">Orders</span>
                </h1>
                <p className="text-xs text-[#9E8E81] font-light">
                  View all your past and current orders.
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-none text-center min-w-24">
                  <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono">Past Orders</span>
                  <span className="font-heading text-2xl font-bold text-[#C5A059]">{orders.length}</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-none text-center min-w-24">
                  <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono">Profile Status</span>
                  <span className="font-heading text-xs font-bold text-green-400 flex items-center justify-center gap-1 mt-1.5 uppercase font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> SECURE
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
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#9E8E81] hover:text-[#554D4D]"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#C5A059]" />
              ROYAL PROFILE
            </span>
          </Link>
          <Link
            href="/account/orders"
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#8B1E2A]"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
              HISTORICAL ORDERS ({orders.length})
            </span>
            <motion.div layoutId="account-tab-border" className="absolute bottom-0 left-0 w-full h-1 bg-[#8B1E2A]" />
          </Link>
          <Link
            href="/account/wishlist"
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#9E8E81] hover:text-[#554D4D]"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C5A059]" />
              SAVED WISHLIST
            </span>
          </Link>
        </div>

        {/* Orders List Contents */}
        <div className="pt-2 text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-left"
          >
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white border-2 border-[#D4CBB3] rounded-none space-y-3 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-[#C5A059] mx-auto stroke-[1.5]" />
                <p className="font-heading text-lg font-semibold text-[#1A1A1A] font-serif italic">No Historical Orders</p>
                <p className="text-xs text-[#554D4D]">Embellish your home with our luxury catalog to place your first order!</p>
                <div className="pt-3">
                  <Link 
                    href="/products"
                    className="inline-flex bg-[#8B1E2A] text-white px-5 py-2 font-bold text-xs tracking-widest uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822]"
                  >
                    View Catalog
                  </Link>
                </div>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                return (
                  <div 
                    key={order.id}
                    className="bg-white border-2 border-[#D4CBB3] rounded-none overflow-hidden shadow-sm"
                  >
                    {/* Accordion Header */}
                    <div 
                      onClick={() => toggleOrderAccordion(order.id)}
                      className="p-5 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                    >
                      <div className="space-y-1 text-left">
                        <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">ORDER ID: {order.id}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A1A1A] text-sm">PKR {Number(order.total_amount).toLocaleString()}</span>
                          <span className="text-[11px] text-gray-400">•</span>
                          <span className="text-xs text-[#554D4D] flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" /> {orderDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 border text-[10px] font-bold uppercase rounded-none ${getStatusLabelColor(order.status)}`}>
                          {order.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="border-t-2 border-[#D4CBB3] bg-[#FAF8F5] p-5 space-y-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-extrabold text-[#8B1E2A] uppercase tracking-widest mb-2 font-mono">Items Dispensed</p>
                          
                          <div className="space-y-2.5">
                            {order.order_items?.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="flex justify-between items-center bg-white p-3 border-2 border-[#D4CBB3] rounded-none">
                                <div className="flex items-center gap-3">
                                  {item.shade && (
                                    <span 
                                      className="w-4 h-4 rounded-none border border-black/15 shrink-0 block animate-fadeIn"
                                      style={{ backgroundColor: item.shade.color_code }}
                                    />
                                  )}
                                  <div className="text-left">
                                    <p className="text-xs font-bold text-[#1A1A1A]">{item.product?.name || 'Mughal Paint Formulation'}</p>
                                    <p className="text-[10px] text-[#8B1E2A] font-semibold mt-0.5">
                                      Shade: {item.shade?.shade_name || 'Base Paint'}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-extrabold text-[#1A1A1A]">PKR {Number(item.price * item.quantity).toLocaleString()}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">PKR {Number(item.price).toLocaleString()} x {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <hr className="border-[#D4CBB3]" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#554D4D]">
                          <div>
                            <p className="font-extrabold text-[#8B1E2A] uppercase tracking-widest text-[10px] mb-1 font-mono">Dispatch Address</p>
                            <p className="text-neutral-700 font-light leading-relaxed">{order.address}</p>
                          </div>
                          <div>
                            <p className="font-extrabold text-[#8B1E2A] uppercase tracking-widest text-[10px] mb-1 font-mono">Payment & Status Details</p>
                            <p className="text-neutral-700 font-light">Method: {order.payment_method.toUpperCase()}</p>
                            <p className="text-neutral-700 font-light mt-0.5">Status: <strong className="text-neutral-800 font-bold">{order.status.toUpperCase()}</strong></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

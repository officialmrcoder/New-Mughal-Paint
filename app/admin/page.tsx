'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from './AdminProvider';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Users, 
  ArrowUpRight, 
  Activity, 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  Inbox
} from 'lucide-react';

export default function AdminOverview() {
  const { showToast } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        let ordersCount = 0;
        let revenue = 0;
        let productsCount = 0;
        let customersCount = 0;
        let latestOrders: any[] = [];
        let latestCustomers: any[] = [];

        if (isSupabaseConfigured()) {
          // 1. Products count
          const { count: prodCount, error: prodErr } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
          productsCount = prodCount || 0;

          // 2. Customers count (role = 'user')
          const { data: custData, error: custErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'user');
          customersCount = custData?.length || 0;
          latestCustomers = custData?.slice(0, 5) || [];

          // 3. Orders & Revenue
          const { data: ords, error: ordErr } = await supabase
            .from('orders')
            .select(`
              *,
              profiles(name, email)
            `)
            .order('created_at', { ascending: false });

          if (ords) {
            ordersCount = ords.length;
            revenue = ords.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
            latestOrders = ords.slice(0, 5);
          }
        } else {
          const mockDb = getMockDatabase();
          
          // Products
          productsCount = mockDb.products.length;

          // Customers (exclude roles that are 'admin')
          const customers = mockDb.users.filter((u: any) => u.role !== 'admin');
          customersCount = customers.length;
          latestCustomers = customers.slice(0, 5);

          // Orders
          const ords = mockDb.orders;
          ordersCount = ords.length;
          revenue = ords.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
          latestOrders = ords.slice(0, 5);
        }

        setMetrics({
          totalOrders: ordersCount,
          totalRevenue: revenue,
          totalProducts: productsCount,
          totalCustomers: customersCount,
        });
        setRecentOrders(latestOrders);
        setRecentCustomers(latestCustomers);
      } catch (err) {
        console.error('Error fetching dashboard overview data:', err);
        showToast('Failed to sync complete system metrics.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [showToast]);

  const cards = [
    {
      title: 'Revenue',
      value: `PKR ${metrics.totalRevenue.toLocaleString()}`,
      description: 'Total order revenue',
      icon: DollarSign,
      color: 'bg-[#8B1E2A]/5 border-[#8B1E2A]/30 text-[#8B1E2A]',
      iconColor: 'text-[#8B1E2A]'
    },
    {
      title: 'Orders',
      value: metrics.totalOrders.toString(),
      description: 'Total orders placed',
      icon: ShoppingBag,
      color: 'bg-[#C5A059]/10 border-[#C5A059]/40 text-[#554D4D]',
      iconColor: 'text-[#C5A059]'
    },
    {
      title: 'Products',
      value: metrics.totalProducts.toString(),
      description: 'Active products',
      icon: Package,
      color: 'bg-stone-100 border-stone-300 text-stone-800',
      iconColor: 'text-stone-600'
    },
    {
      title: 'Customers',
      value: metrics.totalCustomers.toString(),
      description: 'Registered customers',
      icon: Users,
      color: 'bg-amber-50/50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent animate-spin" />
        <p className="text-xs font-mono font-bold text-[#8B1E2A] uppercase tracking-widest">Gathering Palace Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Greeting Banner */}
      <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 relative overflow-hidden border-b-4 border-[#C5A059] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-extrabold font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            SYSTEM OVERVIEW
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl italic font-light text-[#FAF6EE]">
            Dashboard
          </h1>
          <p className="text-xs text-neutral-400 font-light">
            Overview of orders, products, customers and revenue.
          </p>
        </div>
        <div className="relative z-10 px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-left font-mono">
          <span className="block text-[8px] text-[#C5A059] uppercase font-bold tracking-widest">Server Time (UTC)</span>
          <span className="text-xs font-bold text-white">{new Date().toISOString().substring(11, 19)} UTC</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-6 border-2 rounded-none bg-white flex flex-col justify-between shadow-sm relative overflow-hidden group ${card.color}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    {card.title}
                  </span>
                  <div className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
                    {card.value}
                  </div>
                </div>
                <div className={`p-2 bg-white/60 border border-neutral-200 shrink-0 ${card.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200/50 flex justify-between items-center text-[10px]">
                <span className="text-neutral-500 font-light">{card.description}</span>
                <span className="font-bold flex items-center gap-0.5 text-[#C5A059] font-mono uppercase tracking-wider">
                  Live <TrendingUp className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Stats Bento Layout (Recent orders & Recent citizens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Bento: Recent Orders (8 Cols) */}
        <div className="lg:col-span-8 bg-white border-2 border-[#D4CBB3] rounded-none p-6 space-y-4 shadow-sm flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-[#D4CBB3]">
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#8B1E2A]" />
                Recent Orders
              </h3>
              <p className="text-[11px] text-[#554D4D] font-light">Latest orders placed by customers.</p>
            </div>
            <Link 
              href="/admin/orders" 
              className="text-[10px] font-bold text-[#8B1E2A] hover:text-[#C5A059] uppercase tracking-widest flex items-center gap-1 transition-colors font-mono"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400 space-y-2">
                <Inbox className="w-10 h-10 stroke-1 text-[#C5A059]" />
                <p className="text-xs font-bold uppercase tracking-wider font-mono">No recent orders registered</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] font-bold text-[#8B1E2A] uppercase tracking-wider">
                    <th className="py-3 px-2 font-mono">Order ID</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-2 font-mono text-[10px] font-bold text-neutral-400">
                        {ord.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-bold text-[#1A1A1A]">{ord.profiles?.name || 'Mughal Client'}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{ord.profiles?.email || 'No email'}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded-none text-[9px] font-extrabold uppercase border font-mono ${
                          ord.status === 'delivered' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : ord.status === 'cancelled'
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-[#8B1E2A] font-mono">
                        PKR {ord.total_amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Bento: Recent Customers (4 Cols) */}
        <div className="lg:col-span-4 bg-white border-2 border-[#D4CBB3] rounded-none p-6 space-y-4 shadow-sm flex flex-col">
          <div className="pb-3 border-b-2 border-dashed border-[#D4CBB3]">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C5A059]" />
              New Customers
            </h3>
            <p className="text-[11px] text-[#554D4D] font-light">Latest verified registrants.</p>
          </div>

          <div className="flex-1 space-y-3 divide-y divide-neutral-100">
            {recentCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-neutral-400 space-y-2">
                <Inbox className="w-10 h-10 stroke-1 text-[#C5A059]" />
                <p className="text-xs font-bold uppercase tracking-wider font-mono">No customers found</p>
              </div>
            ) : (
              recentCustomers.map((cust, idx) => (
                <div key={cust.id || idx} className="flex items-center gap-3 pt-3 first:pt-0">
                  <div className="w-8 h-8 rounded-none bg-stone-100 border border-stone-200 text-neutral-700 flex items-center justify-center text-xs font-bold font-mono">
                    {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#1A1A1A] truncate">{cust.name || 'Anonymous Client'}</p>
                    <p className="text-[10px] text-neutral-400 truncate font-mono">{cust.email || 'N/A'}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 hover:text-[#8B1E2A] shrink-0" />
                </div>
              ))
            )}
          </div>
          
          <Link
            href="/admin/customers"
            className="w-full text-center py-2.5 mt-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-bold text-[10px] tracking-wider uppercase transition-colors rounded-none"
          >
            Review Customer Base
          </Link>
        </div>
      </div>
    </div>
  );
}

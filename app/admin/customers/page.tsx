'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from '../AdminProvider';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag,
  Clock,
  User,
  ShieldAlert,
  Trash2
} from 'lucide-react';

export default function AdminCustomers() {
  const { showToast } = useAdmin();
  
  // Data States
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"? This action cannot be undone.`)) return;
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        showToast('Customer deleted from Supabase.');
      } else {
        const mockDb = getMockDatabase();
        mockDb.users = mockDb.users.filter((u: any) => u.id !== id);
        showToast('Customer deleted.');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer.', 'error');
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        // Fetch all profiles (exclude admins)
        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .neq('role', 'admin');

        if (profError) throw profError;

        // Fetch all orders to compute placed counts
        const { data: orders, error: ordError } = await supabase
          .from('orders')
          .select('user_id');

        if (ordError) throw ordError;

        if (profiles) {
          // Map profiles with order count
          const mapped = profiles.map((p) => {
            const userOrdersCount = orders ? orders.filter((o) => o.user_id === p.id).length : 0;
            return {
              ...p,
              ordersPlaced: userOrdersCount
            };
          });
          setCustomers(mapped);
        }
      } else {
        // Sandbox Mock Mode
        const mockDb = getMockDatabase();
        const profiles = mockDb.users.filter((u: any) => u.role !== 'admin');
        const orders = mockDb.orders;

        const mapped = profiles.map((p: any) => {
          const userOrdersCount = orders.filter((o: any) => o.user_id === p.id).length;
          return {
            ...p,
            ordersPlaced: userOrdersCount
          };
        });
        setCustomers(mapped);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error syncing customer directory.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const filteredCustomers = customers.filter((c) => {
    const name = c.name || 'Anonymous Customer';
    const email = c.email || '';
    const phone = c.phone || '';
    const address = c.address || '';
    
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#8B1E2A] flex items-center gap-2">
          <Users className="w-6 h-6 text-[#C5A059]" />
          Customers
        </h1>
        <p className="text-xs text-[#554D4D] font-light">
          View and manage registered customers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-[#D4CBB3] p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, email, contact phone, delivery address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border-2 border-[#D4CBB3] rounded-none focus:outline-none focus:border-[#8B1E2A] bg-[#FAF8F5] text-neutral-800"
          />
        </div>

        {/* Aggregate Stats Label */}
        <div className="px-4 py-2 bg-[#FAF8F5] border-2 border-[#D4CBB3] text-xs font-mono font-bold text-stone-600 uppercase flex items-center gap-1.5 shrink-0">
          <Users className="w-4 h-4 text-[#C5A059]" />
          Registered Client Count: {filteredCustomers.length}
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-mono font-bold uppercase text-[#8B1E2A] tracking-wider">Syncing citizen logs...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-[#D4CBB3] space-y-3">
          <Users className="w-12 h-12 text-[#C5A059] mx-auto" />
          <h4 className="font-bold text-neutral-850 uppercase tracking-widest text-sm">No customers registered</h4>
          <p className="text-xs text-[#554D4D] font-light">Try expanding your filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#D4CBB3] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#FAF8F5] border-b-2 border-[#D4CBB3] text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest">
                <th className="py-4 px-6 w-12 text-center">Initial</th>
                <th className="py-4 px-6">Customer Details</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Phone Contact</th>
                <th className="py-4 px-6">Delivery Address</th>
                <th className="py-4 px-6 text-center w-36">Orders</th>
                <th className="py-4 px-6 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4CBB3]/40 text-xs text-neutral-700">
              {filteredCustomers.map((cust) => {
                const name = cust.name || 'Anonymous Customer';
                return (
                  <tr key={cust.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-10 h-10 bg-[#FAF6EE] border border-[#D4CBB3] flex items-center justify-center text-xs font-bold text-[#8B1E2A] font-mono shadow-inner rounded-none">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-neutral-850 text-sm flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {name}
                      </div>
                      <span className="text-[9px] text-[#C5A059] font-mono uppercase tracking-widest block mt-0.5">
                        Client ID: {cust.id.substring(0, 8).toUpperCase()}...
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {cust.email || <span className="italic text-stone-300">N/A</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        {cust.phone || <span className="italic text-stone-300">N/A</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs leading-relaxed font-light text-stone-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>{cust.address || <span className="italic text-stone-300">No address logged</span>}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1 bg-[#8B1E2A]/5 border border-[#8B1E2A]/20 py-1.5 px-3 rounded-none text-center max-w-[100px] mx-auto font-mono text-[11px] font-bold text-[#8B1E2A]">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
                        {cust.ordersPlaced}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteCustomer(cust.id, name)}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-none border border-transparent hover:border-red-100 transition-all"
                        title="Delete customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from '../AdminProvider';
import { 
  ShoppingBag, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  MapPin, 
  DollarSign, 
  CreditCard,
  User,
  Inbox,
  Sparkles
} from 'lucide-react';

export default function AdminOrders() {
  const { showToast } = useAdmin();

  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interactive UI state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            profiles(name, email, phone),
            order_items(
              id, quantity, price,
              products(name, image_url),
              product_shades(shade_name, color_code)
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setOrders(data);
      } else {
        const mockDb = getMockDatabase();
        // Transform mock orders to match Supabase format (order_items + profiles)
        const transformed = mockDb.orders.map((o: any) => {
          const customer = mockDb.users.find((u: any) => u.id === o.user_id);
          return {
            ...o,
            profiles: customer ? { name: customer.name, email: customer.email, phone: customer.phone } : { name: 'Guest', email: '', phone: '' },
            order_items: (o.items || []).map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              products: item.product ? { name: item.product.name, image_url: item.product.image_url } : null,
              product_shades: item.shade ? { shade_name: item.shade.shade_name, color_code: item.shade.color_code } : null
            }))
          };
        });
        setOrders(transformed);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error syncing incoming orders log.', 'error');
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);

        if (error) throw error;
        showToast('Order status updated on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        mockDb.orders = mockDb.orders.map((o: any) => 
          o.id === orderId ? { ...o, status: newStatus } : o
        );
        showToast(`Status updated to: ${newStatus.toUpperCase()}`);
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // Search and Filter calculations
  const filteredOrders = orders.filter((ord) => {
    const custName = ord.profiles?.name || 'Customer';
    const custEmail = ord.profiles?.email || '';
    const matchesSearch = 
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#8B1E2A] flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#C5A059]" />
          Orders
        </h1>
        <p className="text-xs text-[#554D4D] font-light">
          Manage customer orders, track status, and update shipping information.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-[#D4CBB3] p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by ID, customer, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border-2 border-[#D4CBB3] rounded-none focus:outline-none focus:border-[#8B1E2A] bg-[#FAF8F5] text-neutral-800"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] border-2 border-[#D4CBB3] px-3 py-2 text-xs font-bold text-neutral-700">
          <span className="text-[#C5A059] uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer uppercase tracking-wider font-bold"
          >
            <option value="all">ALL DISPATCHES</option>
            <option value="pending">PENDING</option>
            <option value="processing">PROCESSING</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-mono font-bold uppercase text-[#8B1E2A] tracking-wider">Loading dispatch queues...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-[#D4CBB3] space-y-3">
          <ShoppingBag className="w-12 h-12 text-[#C5A059] mx-auto" />
          <h4 className="font-bold text-neutral-850 uppercase tracking-widest text-sm">No dispatches registered</h4>
          <p className="text-xs text-[#554D4D] font-light">Try expanding your filters or search parameters.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#D4CBB3] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b-2 border-[#D4CBB3] text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest">
                <th className="py-4 px-6 w-12 text-center">Info</th>
                <th className="py-4 px-6 font-mono">Order ID</th>
                <th className="py-4 px-6">Customer & Contact</th>
                <th className="py-4 px-6 text-right">Commission Total</th>
                <th className="py-4 px-6">Status Parameters</th>
                <th className="py-4 px-6">Placed Date</th>
              </tr>
            </thead>
            <tbody className="text-xs text-neutral-700 divide-y divide-[#D4CBB3]/40">
              {filteredOrders.map((ord) => {
                const isExpanded = expandedOrderId === ord.id;
                const custName = ord.profiles?.name || 'Customer';
                const custEmail = ord.profiles?.email || 'N/A';
                const custPhone = ord.profiles?.phone || 'N/A';
                
                return (
                  <React.Fragment key={ord.id}>
                    {/* Row Item */}
                    <tr 
                      className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-stone-50' : ''}`}
                      onClick={() => toggleExpand(ord.id)}
                    >
                      <td className="py-4 px-6 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#8B1E2A] mx-auto" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#C5A059] mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-[10px] font-bold text-stone-400">
                        #{ord.id.substring(0, 8).toUpperCase()}...
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-neutral-850 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          {custName}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5 ml-5">{custEmail}</div>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-[#8B1E2A] font-mono text-sm">
                        PKR {ord.total_amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatusWithToast(ord.id, e.target.value)}
                          className={`text-[10px] font-extrabold uppercase border px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E2A] font-mono cursor-pointer ${
                            ord.status === 'delivered'
                              ? 'border-emerald-300 text-emerald-800 bg-emerald-50'
                              : ord.status === 'cancelled'
                              ? 'border-red-300 text-red-800 bg-red-50'
                              : 'border-amber-300 text-amber-800 bg-amber-50'
                          }`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="processing">PROCESSING</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-stone-500 font-mono text-[10px] uppercase">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                    </tr>

                    {/* Expandable Invoice / Items Detail Row */}
                    {isExpanded && (
                      <tr className="bg-[#FAF8F5]">
                        <td colSpan={6} className="py-6 px-10 border-t border-b border-[#D4CBB3]">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-in slide-in-from-top-2 duration-150">
                            
                            {/* Products / Invoice column (7 columns) */}
                            <div className="lg:col-span-7 space-y-4">
                              <div className="flex items-center gap-1.5 pb-2 border-b border-[#D4CBB3]">
                                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                                <h4 className="text-[11px] font-bold text-[#8B1E2A] uppercase tracking-wider">
                                  Purchased Painting Formula List
                                </h4>
                              </div>

                              <div className="space-y-2.5">
                                {ord.order_items && ord.order_items.length > 0 ? (
                                  ord.order_items.map((item: any) => (
                                    <div 
                                      key={item.id} 
                                      className="bg-white p-3.5 border border-[#D4CBB3] flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-3">
                                        {item.products?.image_url && (
                                          <div className="w-12 h-12 border border-[#D4CBB3] shrink-0 overflow-hidden bg-white">
                                            <img src={item.products.image_url} alt={item.products?.name || ''} className="w-full h-full object-cover" />
                                          </div>
                                        )}
                                        <div>
                                          <p className="font-bold text-neutral-850 text-xs">
                                            {item.products?.name || 'Product'}
                                          </p>
                                          <p className="text-[10px] mt-0.5">
                                            {item.product_shades ? (
                                              <span className="text-[#8B1E2A] font-bold">
                                                Shade: {item.product_shades.shade_name}{' '}
                                                <span className="font-mono text-[9px] uppercase">({item.product_shades.color_code})</span>
                                              </span>
                                            ) : (
                                              <span className="text-stone-400 font-mono">Base</span>
                                            )}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="text-right font-mono text-[11px] space-y-0.5">
                                        <p className="text-stone-500">
                                          PKR {Number(item.price).toLocaleString()} x {item.quantity}
                                        </p>
                                        <p className="font-extrabold text-[#1A1A1A]">
                                          PKR {(Number(item.price) * item.quantity).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 bg-white border border-[#D4CBB3] text-stone-500 font-light italic text-center">
                                    No product details available
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Dispatch parameters column (5 columns) */}
                            <div className="lg:col-span-5 space-y-4 lg:border-l lg:border-[#D4CBB3] lg:pl-8">
                              <div className="flex items-center gap-1.5 pb-2 border-b border-[#D4CBB3]">
                                <MapPin className="w-4 h-4 text-[#C5A059]" />
                                <h4 className="text-[11px] font-bold text-[#8B1E2A] uppercase tracking-wider">
                                  Delivery target specs
                                </h4>
                              </div>

                              <div className="space-y-3.5 text-xs">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                                    Recipient Contact
                                  </span>
                                  <p className="font-bold text-[#1A1A1A]">{custName}</p>
                                  <p className="text-[#554D4D] font-mono mt-0.5">📞 {custPhone}</p>
                                </div>

                                <div>
                                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                                    Shipping Target Address
                                  </span>
                                  <p className="text-neutral-700 leading-relaxed font-light">{ord.address}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
                                  <div>
                                    <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block mb-0.5">
                                      Pay Method
                                    </span>
                                    <span className="font-bold text-neutral-800 flex items-center gap-1 font-mono text-[10px] uppercase">
                                      <CreditCard className="w-3.5 h-3.5 text-[#C5A059]" />
                                      {ord.payment_method === 'cod' ? 'CASH ON DELIV.' : ord.payment_method.toUpperCase()}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider block mb-0.5">
                                      System Stamp
                                    </span>
                                    <span className="font-mono text-[9px] text-stone-400 block font-bold">
                                      {ord.id.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  function handleUpdateOrderStatusWithToast(id: string, status: string) {
    handleUpdateStatus(id, status);
  }
}

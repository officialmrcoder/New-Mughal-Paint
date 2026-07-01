'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { isSupabaseConfigured, supabase, getMockDatabase } from '@/lib/supabase';
import { authService, UserProfile } from '@/lib/auth';
import { CheckCircle2, ShoppingBag, MapPin, CreditCard, Sparkles, Calendar, Receipt, Info } from 'lucide-react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        if (isSupabaseConfigured()) {
          // Fetch order details
          const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

          if (orderData) {
            setOrder(orderData);

            // Fetch order items joined with products and shades
            const { data: itemsData } = await supabase
              .from('order_items')
              .select(`
                id,
                quantity,
                price,
                product:products(name, image_url),
                shade:product_shades(shade_name, color_code)
              `)
              .eq('order_id', orderId);

            if (itemsData) {
              setOrderItems(itemsData);
            }
          }
        } else {
          // Fallback to Mock Database / LocalStorage
          const mockDb = getMockDatabase();
          const foundOrder = mockDb.orders.find((o: any) => o.id === orderId);
          if (foundOrder) {
            setOrder({
              id: foundOrder.id,
              created_at: foundOrder.created_at,
              status: foundOrder.status,
              total_amount: foundOrder.total_amount,
              address: foundOrder.address,
              payment_method: foundOrder.payment_method
            });
            setOrderItems(foundOrder.items || []);
          }
        }
      } catch (err) {
        console.error('Error loading order confirmation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto space-y-4">
        <h2 className="font-heading text-2xl font-bold text-[#8B1E2A]">Order Not Found</h2>
        <p className="text-sm text-[#554D4D] font-light">
          The order could not be found. Please check your account for order details.
        </p>
        <div className="pt-4">
          <Link 
            href="/account" 
            className="inline-flex bg-[#8B1E2A] text-white px-6 py-2.5 font-bold text-xs tracking-widest uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822]"
          >
            My Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      
      {/* Celebration Banner */}
      <div className="bg-white border-2 border-[#D4CBB3] p-8 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#8B1E2A]" />
        
        {/* Animated Celebration Ring */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
          <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#C5A059] font-bold">Order Confirmed</span>
          <h2 className="font-heading text-2xl sm:text-4xl font-light italic text-[#1A1A1A]">
            Order Placed Successfully!
          </h2>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#8B1E2A] to-transparent w-48 mx-auto mt-2" />
        </div>

        <p className="text-xs text-[#554D4D] font-light max-w-md mx-auto">
          Your order has been placed successfully. You can track its status from your account.
        </p>

        {/* Order ID Tag */}
        <div className="inline-block bg-[#FAF8F5] border border-[#D4CBB3] px-5 py-2.5 font-mono text-xs">
          <span className="text-neutral-400 mr-1.5 uppercase font-bold">Order ID:</span>
          <strong className="text-[#8B1E2A] font-black">{order.id}</strong>
        </div>
      </div>

      {/* Details breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Settlement & Shipping Info */}
        <div className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm relative space-y-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#8B1E2A]" />
          <h4 className="font-mono text-xs font-bold text-[#8B1E2A] uppercase tracking-wider">
            Order Details
          </h4>
          
          <div className="space-y-3.5 text-xs text-[#554D4D]">
            <div className="flex gap-2.5 items-start">
              <Calendar className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-neutral-400 font-bold uppercase">Order Date:</span>
                <span className="font-semibold text-neutral-900">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Pending Dispatch'}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-neutral-400 font-bold uppercase">Royal Destination:</span>
                <span className="font-semibold text-neutral-900 leading-relaxed block mt-0.5">
                  {order.address}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <CreditCard className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] text-neutral-400 font-bold uppercase">Settlement Option:</span>
                <span className="font-mono font-bold text-[#8B1E2A] uppercase bg-[#8B1E2A]/5 border border-[#8B1E2A]/10 px-2 py-0.5 inline-block mt-0.5 text-[10px]">
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery (COD)' : '🏦 Bank Transfer Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm relative space-y-4 flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]" />
          <div>
            <h4 className="font-mono text-xs font-bold text-[#8B1E2A] uppercase tracking-wider mb-3">
              Pigment Formulation Summary
            </h4>
            
            <div className="divide-y divide-[#EBE4D5] max-h-[160px] overflow-y-auto pr-1">
              {orderItems.map((item, idx) => (
                <div key={item.id || idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    {item.shade?.color_code && (
                      <span 
                        className="w-3 h-3 rounded-full border border-neutral-300 block"
                        style={{ backgroundColor: item.shade.color_code }}
                      />
                    )}
                    <span className="font-medium text-[#1A1A1A]">
                      {item.product?.name || 'Bespoke Paint'} 
                      {item.shade?.shade_name ? ` (${item.shade.shade_name})` : ''}
                    </span>
                    <span className="text-gray-400 text-[10px]">x{item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-800">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#D4CBB3] border-dashed flex justify-between items-baseline mt-4">
            <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Decree Total Settled</span>
            <span className="text-xl font-black text-[#C5A059] font-mono">
              PKR {Number(order.total_amount).toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Next Steps for Bank Transfer */}
      {order.payment_method === 'bank_transfer' && (
        <div className="p-5 bg-amber-50/40 border-2 border-[#C5A059] text-left text-xs space-y-3 shadow-sm animate-fadeIn">
          <div className="flex gap-2 text-[#8B1E2A] font-bold items-center font-mono uppercase tracking-wider">
            <Info className="w-4 h-4 text-[#C5A059]" /> Bank Settlement Requirement
          </div>
          <p className="text-[#554D4D] font-light leading-relaxed">
            Since you chose **Bank Transfer**, your custom mix formulation status remains pending verification. Please make a payment of <strong className="text-[#8B1E2A]">PKR {Number(order.total_amount).toLocaleString()}</strong> to the details below, then send a screenshot of the transfer receipt to our Whatsapp <strong className="text-[#8B1E2A]">+92 300 1234567</strong> or email us at <strong className="text-[#8B1E2A]">treasury@newmughalpaint.com</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#D4CBB3] font-mono text-[11px] bg-white/50 p-3 mt-1">
            <div>
              <span className="block text-[10px] text-neutral-400 font-bold">Account Title:</span>
              <strong className="text-[#1A1A1A]">NEW MUGHAL PAINT ENTERPRISES</strong>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-400 font-bold">Bank Name:</span>
              <strong className="text-[#1A1A1A]">HABIB BANK LIMITED (HBL)</strong>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-400 font-bold">Account Number:</span>
              <strong className="text-[#1A1A1A]">0123-456789-012</strong>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-400 font-bold">IBAN / Swift:</span>
              <strong className="text-[#1A1A1A]">PK96HABB01234567890123</strong>
            </div>
          </div>
        </div>
      )}

      {/* Button controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#8B1E2A] hover:text-[#721822] tracking-wider uppercase transition-colors p-3.5 border border-[#D4CBB3] bg-white rounded hover:bg-[#FAF8F5]"
        >
          <ShoppingBag className="w-4 h-4 text-[#C5A059]" /> BACK TO CATALOG
        </Link>
        
        <Link
          href="/account"
          className="bg-[#8B1E2A] text-white py-3.5 px-8 font-bold tracking-widest text-xs uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <Receipt className="w-4 h-4 text-[#C5A059]" /> TRACK DISPATCH STATUS
        </Link>
      </div>

    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Reconstructing Mughal Decree Elements...</p>
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

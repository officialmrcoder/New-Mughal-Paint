'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { authService, UserProfile } from '@/lib/auth';
import { cartService, CartItem } from '@/lib/cart';
import { emitCartUpdated } from '@/lib/events';
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'bank_transfer'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          router.push('/login?redirect=/checkout');
          return;
        }
        setUser(currentUser);
        setAddress(currentUser.address || '');

        const items = await cartService.getItems(currentUser.id);
        if (items.length === 0) {
          router.push('/cart');
          return;
        }
        setCartItems(items);
      } catch (err: any) {
        setError(err.message || 'Error initializing checkout data.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!address.trim()) {
      setError('Please provide a complete delivery address for dispatch.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await cartService.checkout(user.id, address, paymentMethod, cartItems);
      if (res.success && res.orderId) {
        emitCartUpdated();
        router.push(`/checkout/confirmation?orderId=${res.orderId}`);
      } else {
        setError(res.message || 'Checkout failed. Please try again.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Loading checkout...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Breadcrumbs */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono tracking-wider">
            <Link href="/" className="hover:text-[#8B1E2A] transition-colors">HOME</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-[#8B1E2A] transition-colors">CART</Link>
            <span>/</span>
            <span className="text-[#8B1E2A] font-bold uppercase">CHECKOUT</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-light italic text-[#1A1A1A] mt-2">
            Checkout
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-[#8B1E2A] to-transparent w-48 mt-1" />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded text-left">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side (7 columns) */}
          <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6 text-left">
            
            {/* Delivery Address Card */}
            <div className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm relative space-y-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#8B1E2A]" />
              <h3 className="font-heading text-lg font-bold text-[#8B1E2A] uppercase tracking-wider font-mono">
                1. Delivery Address
              </h3>
              <p className="text-xs text-[#554D4D] font-light">
                Enter your delivery address for order shipment.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-2 font-mono">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, Appartment/Suite, Sector, City, Postal Code..."
                  className="w-full p-3 border-2 border-[#D4CBB3] rounded bg-[#FAF8F5] text-sm text-[#2C2520] focus:outline-none focus:border-[#8B1E2A] transition-colors font-sans"
                />
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm relative space-y-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#8B1E2A]" />
              <h3 className="font-heading text-lg font-bold text-[#8B1E2A] uppercase tracking-wider font-mono">
                2. Payment Method
              </h3>
              <p className="text-xs text-[#554D4D] font-light">
                Choose how you wish to process the settlement for your bespoke catalog batch.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cash on Delivery */}
                <label 
                  className={`border-2 p-4 flex gap-3 items-start cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-[#8B1E2A] bg-red-50/20' 
                      : 'border-[#D4CBB3] hover:border-[#8B1E2A]/50 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#8B1E2A] mt-1"
                  />
                  <div>
                    <span className="font-mono text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#C5A059]" /> CASH ON DELIVERY
                    </span>
                    <p className="text-[10px] text-[#554D4D] font-light mt-1">
                      Settle your bill directly with cash when the courier dispatches your buckets.
                    </p>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label 
                  className={`border-2 p-4 flex gap-3 items-start cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer' 
                      ? 'border-[#8B1E2A] bg-red-50/20' 
                      : 'border-[#D4CBB3] hover:border-[#8B1E2A]/50 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="accent-[#8B1E2A] mt-1"
                  />
                  <div>
                    <span className="font-mono text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#C5A059]" /> BANK TRANSFER
                    </span>
                    <p className="text-[10px] text-[#554D4D] font-light mt-1">
                      Transfer directly to our bank account. Details shown below.
                    </p>
                  </div>
                </label>

              </div>

              {/* Dynamic Bank Account Information Box */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 bg-amber-50/40 border border-[#C5A059] rounded text-xs space-y-3 animate-fadeIn">
                  <div className="flex gap-2 text-[#8B1E2A] font-bold items-center font-mono uppercase tracking-wider">
                    <Info className="w-4 h-4 text-[#C5A059]" /> Bank Account Details
                  </div>
                  <p className="text-[#554D4D] font-light">
                    Please transfer the exact total amount to our verified bank account coordinates. Send a copy of your bank transaction receipt to <strong className="text-[#8B1E2A]">treasury@newmughalpaint.com</strong> or WhatsApp it to <strong className="text-[#8B1E2A]">+92 300 1234567</strong> along with your Order ID.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#D4CBB3] font-mono text-[11px]">
                    <div>
                      <span className="block text-[10px] text-neutral-400 font-bold uppercase">Account Title:</span>
                      <strong className="text-[#1A1A1A]">NEW MUGHAL PAINT ENTERPRISES</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-400 font-bold uppercase">Bank Name:</span>
                      <strong className="text-[#1A1A1A]">HABIB BANK LIMITED (HBL)</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-400 font-bold uppercase">Account Number:</span>
                      <strong className="text-[#1A1A1A]">0123-456789-012</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-neutral-400 font-bold uppercase">IBAN / Swift:</span>
                      <strong className="text-[#1A1A1A]">PK96HABB01234567890123</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Back to Cart & Submit Button Group */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#8B1E2A] hover:text-[#721822] tracking-wider uppercase transition-colors p-3 border border-[#D4CBB3] bg-white rounded hover:bg-[#FAF8F5]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Cart
              </Link>
              
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#8B1E2A] text-white py-3.5 px-6 font-bold tracking-widest text-xs uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>

          </form>

          {/* Checkout Items Summary Sidebar (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-4 text-left relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]" />
              
              <h3 className="font-heading text-lg font-bold text-[#8B1E2A] uppercase tracking-wider font-mono">
                Order Review
              </h3>
              <div className="h-0.5 bg-[#FAF8F5] w-full" />

              <div className="divide-y divide-[#EBE4D5] max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
                  return (
                    <div key={item.id} className="py-3 flex gap-3 items-center text-xs">
                      <div className="w-10 h-10 bg-[#FAF8F5] border border-[#D4CBB3] relative overflow-hidden shrink-0 pl-1 flex items-center justify-center">
                        {item.product?.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-[#8B1E2A]">Paint</span>
                        )}
                        {item.shade && (
                          <div 
                            className="absolute bottom-0 inset-x-0 h-1"
                            style={{ backgroundColor: item.shade.color_code }}
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#1A1A1A] truncate">{item.product?.name}</h4>
                        {item.shade ? (
                          <span className="text-[10px] text-[#8B1E2A] font-bold font-mono">
                            {item.shade.shade_name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Base</span>
                        )}
                        <span className="text-gray-400 mx-1.5">•</span>
                        <span className="text-gray-600 font-bold">x {item.quantity}</span>
                      </div>

                      <div className="font-mono font-bold text-neutral-800 text-right">
                        PKR {(price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-[#D4CBB3] border-dashed border-t my-4" />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#554D4D]">
                  <span>Formulation Volume</span>
                  <span className="font-bold font-mono">{cartCount} Bucket(s)</span>
                </div>
                <div className="flex justify-between text-[#554D4D]">
                  <span>Shipping & Routing</span>
                  <span className="text-green-700 font-bold font-mono">FREE (ROYAL COURIER)</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Total Due</span>
                  <span className="text-xl font-extrabold text-[#C5A059] font-mono">
                    PKR {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Secure certification info box */}
            <div className="bg-[#FAF8F5] border border-[#D4CBB3] p-4 flex items-start gap-3 text-left">
              <ShieldCheck className="w-6 h-6 text-[#C5A059] shrink-0 stroke-[1.5]" />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">ROYAL COMPLIANCE STANDARD</h4>
                <p className="text-[10px] text-[#554D4D] font-light">
                  Our products are fresh custom formulations. The pigments undergo rigorous quality testing before packaging.
                </p>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

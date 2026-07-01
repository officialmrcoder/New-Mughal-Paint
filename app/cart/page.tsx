'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { authService, UserProfile } from '@/lib/auth';
import { cartService, CartItem } from '@/lib/cart';
import { emitCartUpdated, subscribeToCart } from '@/lib/events';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check and load cart
  useEffect(() => {
    const checkAuthAndLoadCart = async () => {
      setLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          router.push('/login?redirect=/cart');
          return;
        }
        setUser(currentUser);
        const items = await cartService.getItems(currentUser.id);
        setCartItems(items);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading your cart.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadCart();

    // Subscribe to cart changes
    const unsubscribe = subscribeToCart(async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const items = await cartService.getItems(currentUser.id);
        setCartItems(items);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const handleUpdateQty = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    
    try {
      await cartService.updateQuantity(itemId, newQty, user?.id);
      // Items will be refreshed via the subscribeToCart event listener
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remove this item from your cart?')) return;
    try {
      await cartService.removeFromCart(itemId, user?.id);
      // Items will be refreshed via the subscribeToCart event listener
    } catch (err: any) {
      alert(err.message || 'Failed to remove item.');
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Loading cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Breadcrumb / Title */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono tracking-wider">
            <Link href="/" className="hover:text-[#8B1E2A] transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#8B1E2A] font-bold uppercase">SHOPPING CART</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-light italic text-[#1A1A1A] mt-2">
            Royal Shopping Cart
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-[#8B1E2A] to-transparent w-48 mt-1" />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded text-left">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white border-2 border-[#D4CBB3] p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-[#FAF8F5] border border-[#D4CBB3] rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10 text-[#C5A059] stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold text-[#8B1E2A]">Your Cart is Currently Empty</h2>
              <p className="text-sm text-[#554D4D] font-light max-w-md mx-auto">
                No custom Mughal paint shades or formulations have been added to your order dispatch yet. Let&apos;s find your perfect royal color palette!
              </p>
            </div>
            <div className="pt-2">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-[#8B1E2A] text-white px-8 py-3.5 font-bold text-xs tracking-widest uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors"
              >
                EXPLORE PALETTE CATALOG <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border-2 border-[#D4CBB3] shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#FAF8F5] border-b border-[#D4CBB3] text-xs font-bold uppercase tracking-wider text-[#554D4D] font-mono text-left">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total Price</div>
                </div>

                <div className="divide-y divide-[#EBE4D5]">
                  {cartItems.map((item) => {
                    const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
                    const itemTotal = price * item.quantity;
                    
                    return (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center text-left relative">
                        
                        {/* Selected Shade Color Indicator Bar */}
                        {item.shade && (
                          <div 
                            className="absolute top-0 left-0 w-1.5 h-full"
                            style={{ backgroundColor: item.shade.color_code }}
                          />
                        )}

                        {/* Product Info (Col-span 6) */}
                        <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                          <div className="w-20 h-20 bg-[#FAF8F5] border border-[#D4CBB3] relative overflow-hidden shrink-0 pl-2">
                            {item.product?.image_url ? (
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#8B1E2A]/10 flex items-center justify-center text-[#8B1E2A] font-bold text-xs">Paint</div>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <h3 className="font-heading text-base font-bold text-[#1A1A1A] line-clamp-1">
                              {item.product?.name}
                            </h3>
                            {item.shade ? (
                              <div className="inline-flex items-center gap-1.5 bg-[#FAF8F5] border border-[#D4CBB3] px-2.5 py-1 rounded-full">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 block"
                                  style={{ backgroundColor: item.shade.color_code }}
                                />
                                <span className="text-[10px] font-bold text-[#8B1E2A] font-mono">
                                  SHADE: {item.shade.shade_name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-gray-400">Base Coat</span>
                            )}
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-800 font-bold tracking-wider uppercase pt-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>

                        {/* Unit Price (Col-span 2) */}
                        <div className="col-span-1 md:col-span-2 text-left md:text-center">
                          <span className="inline-block md:hidden text-xs font-bold uppercase text-neutral-400 mr-2">Unit Price:</span>
                          <span className="text-sm font-bold text-[#554D4D] font-mono">
                            PKR {price.toLocaleString()}
                          </span>
                        </div>

                        {/* Quantity (Col-span 2) */}
                        <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                          <span className="inline-block md:hidden text-xs font-bold uppercase text-neutral-400 mr-2 self-center">Quantity:</span>
                          <div className="flex items-center border border-[#D4CBB3] bg-white rounded">
                            <button 
                              onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                              disabled={item.quantity <= 1}
                              className="p-1.5 hover:bg-[#FAF8F5] disabled:opacity-30 text-[#6B5E55] transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 font-mono font-bold text-xs text-[#1A1A1A]">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                              className="p-1.5 hover:bg-[#FAF8F5] text-[#6B5E55] transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Total Price (Col-span 2) */}
                        <div className="col-span-1 md:col-span-2 text-left md:text-right">
                          <span className="inline-block md:hidden text-xs font-bold uppercase text-neutral-400 mr-2">Total:</span>
                          <span className="text-base font-extrabold text-[#C5A059] font-mono">
                            PKR {itemTotal.toLocaleString()}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Shopping Button */}
              <div className="text-left">
                <Link 
                  href="/products" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1E2A] hover:text-[#721822] tracking-wider uppercase transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> CONTINUE SELECTING SHADES
                </Link>
              </div>
            </div>

            {/* Checkout / Summary Panel (4 cols on desktop) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Order Summary Card */}
              <div className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-6 text-left relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#8B1E2A]" />
                
                <h3 className="font-heading text-lg font-bold text-[#8B1E2A] uppercase tracking-wider font-mono">
                  Order Summary
                </h3>
                <div className="h-0.5 bg-[#FAF8F5] w-full" />

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between text-[#554D4D]">
                    <span>Total Formulation Volume</span>
                    <span className="font-bold">{cartCount} Bucket(s)</span>
                  </div>
                  <div className="flex justify-between text-[#554D4D]">
                    <span>Standard Shipping</span>
                    <span className="text-green-700 font-bold">FREE (ROYAL DELIVERY)</span>
                  </div>
                  <div className="flex justify-between text-[#554D4D]">
                    <span>Government Excise Tax</span>
                    <span className="font-bold">INCLUDED</span>
                  </div>
                  
                  <div className="h-px bg-[#D4CBB3] border-dashed border-t my-4" />
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Royal Total Due</span>
                    <span className="text-2xl font-black text-[#C5A059] font-mono">
                      PKR {cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/checkout"
                    className="w-full bg-[#8B1E2A] text-white py-3.5 px-6 font-bold tracking-widest text-xs uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <CreditCard className="w-4 h-4 text-[#C5A059]" />
                    PROCEED TO CHECKOUT
                  </Link>
                </div>
              </div>

              {/* Secure Checkout Badge */}
              <div className="bg-[#FAF8F5] border border-[#D4CBB3] p-4 flex items-start gap-3 text-left">
                <ShieldCheck className="w-6 h-6 text-[#C5A059] shrink-0 stroke-[1.5]" />
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">SECURE TRANSACTION SYSTEMS</h4>
                  <p className="text-[10px] text-[#554D4D] font-light">
                    Every Mughal order is authorized securely. Direct dealer routing keeps pricing and paint mixes highly accurate.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

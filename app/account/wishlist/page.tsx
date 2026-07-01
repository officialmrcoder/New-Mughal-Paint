'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, UserProfile } from '@/lib/auth';
import { cartService } from '@/lib/cart';
import { wishlistService, WishlistItem } from '@/lib/wishlist';
import { emitCartUpdated } from '@/lib/events';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Trash2, 
  Paintbrush, 
  ShoppingCart,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const loadUserDataAndWishlist = async () => {
    setLoading(true);
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login?redirect=/account/wishlist');
      return;
    }

    setUser(currentUser);

    // Load wishlist
    const items = await wishlistService.getItems(currentUser.id);
    setWishlistItems(items);

    // Load cart count for stats
    const cartItems = await cartService.getItems(currentUser.id);
    setCartCount(cartItems.length);

    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUserDataAndWishlist();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRemoveFromWishlist = async (wishItemId: string) => {
    if (!confirm('Are you sure you want to discard this saved formulation from your wishlist?')) return;
    try {
      await wishlistService.removeFromWishlist(wishItemId, user?.id);
      // Update state local list
      setWishlistItems(prev => prev.filter(item => item.id !== wishItemId));
      setFeedback('Saved formulation removed from your wishlist.');
    } catch (err: any) {
      alert(err.message || 'Failed to remove from wishlist.');
    }
  };

  const handleAddToCartFromWishlist = async (item: WishlistItem) => {
    if (!user) return;
    setFeedback(null);
    setFeedbackError(null);

    try {
      await cartService.addToCart(user.id, item.product_id, item.shade_id, 1);
      emitCartUpdated();
      setFeedback(`Added 1x ${item.product?.name} (${item.shade?.shade_name || 'Base'}) to your royal cart!`);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to add item to cart.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold font-mono">Loading Your Royal Curations...</p>
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
                  WELCOME TO YOUR COURT
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-light italic text-[#FAF6EE] leading-none">
                  Salutations, <span className="text-[#C5A059] font-bold not-italic">{user.name}</span>
                </h1>
                <p className="text-xs text-[#9E8E81] flex items-center gap-1.5 font-light">
                  <Mail className="w-3.5 h-3.5 text-[#C5A059]" /> {user.email} • 🛡️ {user.role === 'admin' ? 'Royal Administrator' : 'Royal Court Customer'}
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-none text-center min-w-24">
                  <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono">Wishlist Count</span>
                  <span className="font-heading text-2xl font-bold text-[#C5A059]">{wishlistItems.length}</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-none text-center min-w-24">
                  <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-mono">Cart Count</span>
                  <span className="font-heading text-2xl font-bold text-[#C5A059]">{cartCount}</span>
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
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#9E8E81] hover:text-[#554D4D]"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
              HISTORICAL ORDERS
            </span>
          </Link>
          <Link
            href="/account/wishlist"
            className="pb-4 text-xs font-bold tracking-widest transition-all relative uppercase text-[#8B1E2A]"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C5A059]" />
              SAVED WISHLIST ({wishlistItems.length})
            </span>
            <motion.div layoutId="account-tab-border" className="absolute bottom-0 left-0 w-full h-1 bg-[#8B1E2A]" />
          </Link>
        </div>

        {/* Wishlist Body Contents */}
        <div className="space-y-6 text-left">
          
          <div>
            <h3 className="font-heading text-lg font-bold text-[#8B1E2A] uppercase tracking-wider font-serif italic">Saved Formulations Collection</h3>
            <p className="text-xs text-[#554D4D] mt-1">Direct access to your carefully selected pigments, tints, and wall formulations</p>
          </div>

          {feedback && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs rounded-none flex items-center gap-2 font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>{feedback}</span>
            </div>
          )}

          {feedbackError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-none flex items-center gap-2 font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{feedbackError}</span>
            </div>
          )}

          {wishlistItems.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-[#D4CBB3] rounded-none space-y-3 shadow-sm">
              <Heart className="w-12 h-12 text-[#C5A059] mx-auto stroke-[1.5]" />
              <p className="font-heading text-lg font-semibold text-[#1A1A1A]">Your Wishlist is Empty</p>
              <p className="text-xs text-[#554D4D] font-light">Explore our catalog and save paint formulations for your project reviews.</p>
              <div className="pt-3">
                <Link 
                  href="/products"
                  className="inline-flex bg-[#8B1E2A] text-white px-6 py-2.5 font-bold text-xs tracking-widest uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-all"
                >
                  EXPLORE TINTS & SHADES
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {wishlistItems.map((item) => {
                  const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border-2 border-[#D4CBB3] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4"
                    >
                      {/* Left border shade color ribbon */}
                      {item.shade && (
                        <div 
                          className="absolute top-0 left-0 w-2 h-full"
                          style={{ backgroundColor: item.shade.color_code }}
                        />
                      )}

                      <div className="flex gap-4">
                        {/* Image preview */}
                        <div className="w-16 h-16 bg-[#FAF8F5] border border-[#D4CBB3] pl-1 relative overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-[#8B1E2A] font-bold">Mughal</span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="font-bold text-[#1A1A1A] text-sm truncate">{item.product?.name}</h4>
                          <p className="text-[11px] text-[#554D4D] font-light line-clamp-1">{item.product?.description}</p>
                          
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {item.shade ? (
                              <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#D4CBB3] px-2 py-0.5">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 block"
                                  style={{ backgroundColor: item.shade.color_code }}
                                />
                                <span className="text-[9px] font-bold text-[#8B1E2A] font-mono">
                                  {item.shade.shade_name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-mono text-gray-400">Base Coat</span>
                            )}
                            <span className="text-xs font-black text-[#C5A059] font-mono">
                              PKR {price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls bar */}
                      <div className="pt-3 border-t border-[#D4CBB3] border-dashed flex gap-2.5">
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="p-2 border-2 border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-100 bg-white transition-colors"
                          title="Discard Saved Shade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {item.shade && (
                          <Link
                            href={`/visualizer?color=${encodeURIComponent(item.shade.color_code)}`}
                            className="flex-1 bg-white hover:bg-[#FAF8F5] text-[#8B1E2A] py-2 border-2 border-[#D4CBB3] text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Paintbrush className="w-3.5 h-3.5 text-[#C5A059]" />
                            VISUALIZE
                          </Link>
                        )}

                        <button
                          onClick={() => handleAddToCartFromWishlist(item)}
                          className="flex-1 bg-[#8B1E2A] text-white py-2 px-3 text-[10px] font-bold tracking-wider uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-[#C5A059]" />
                          ADD TO CART
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}

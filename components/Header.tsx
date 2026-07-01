'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { authService, UserProfile } from '@/lib/auth';
import { cartService, CartItem } from '@/lib/cart';
import { subscribeToCart, subscribeToUser, emitCartUpdated, emitUserUpdated } from '@/lib/events';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X, 
  Trash2, 
  Minus, 
  Plus, 
  Paintbrush, 
  ShoppingBag as CartIcon 
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Checkout flow state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutOrderId, setCheckoutOrderId] = useState('');

  const loadUserAndCart = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    const items = await cartService.getItems(currentUser?.id);
    setCartItems(items);
    if (currentUser) {
      setAddress(currentUser.address || '');
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadUserAndCart();
    }, 0);

    const unsubCart = subscribeToCart(async () => {
      const currentUser = await authService.getCurrentUser();
      const items = await cartService.getItems(currentUser?.id);
      setCartItems(items);
    });

    const unsubUser = subscribeToUser(() => {
      loadUserAndCart();
    });

    return () => {
      unsubCart();
      unsubUser();
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCartItems([]);
    emitUserUpdated();
    emitCartUpdated();
    router.push('/');
    router.refresh();
  };

  const handleUpdateQty = async (id: string, newQty: number) => {
    await cartService.updateQuantity(id, newQty, user?.id);
  };

  const handleRemove = async (id: string) => {
    await cartService.removeFromCart(id, user?.id);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsCartOpen(false);
      router.push('/login?redirect=/');
      return;
    }

    if (!address.trim()) {
      alert('Please specify your royal delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await cartService.checkout(user.id, address, paymentMethod, cartItems);
      if (res.success) {
        setCheckoutOrderId(res.orderId || '');
        setCheckoutSuccess(true);
        setCartItems([]);
        emitCartUpdated();
      } else {
        alert('Checkout error: ' + res.message);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    setCheckoutSuccess(false);
    setCheckoutOrderId('');
    setIsCartOpen(false);
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#8B1E2A] h-[90px] w-full flex items-center justify-between px-6 sm:px-12 border-b-4 border-[#C5A059] shadow-md">
        <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#C5A059] rotate-45 border border-white shrink-0 flex items-center justify-center transition-transform group-hover:rotate-90">
              <span className="font-serif font-black text-[#8B1E2A] text-sm -rotate-45 group-hover:rotate-0 transition-transform">NMP</span>
            </div>
            <div className="ml-2 text-left">
              <h1 className="text-white text-lg sm:text-2xl font-serif tracking-widest uppercase font-bold leading-none">
                New Mughal Paint
              </h1>
              <span className="block text-[9px] text-[#C5A059] uppercase font-mono tracking-widest mt-1">
                Premium Paints Since 2000
              </span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-white/80 text-[10px] xl:text-[11px] uppercase tracking-[0.15em] font-bold">
            <Link href="/" className="hover:text-[#C5A059] transition-colors">
              HOME
            </Link>
            <Link href="/products" className="hover:text-[#C5A059] transition-colors">
              PRODUCTS
            </Link>
            <Link href="/visualizer" className="hover:text-[#C5A059] transition-colors">
              VISUALIZER
            </Link>
            <Link href="/about" className="hover:text-[#C5A059] transition-colors">
              ABOUT
            </Link>
            <Link href="/contact" className="hover:text-[#C5A059] transition-colors">
              CONTACT
            </Link>
            <Link href="/dealers" className="hover:text-[#C5A059] transition-colors flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              DEALERS
            </Link>
          </nav>

          {/* User Controls & Cart Badge */}
          <div className="flex items-center gap-4">
            
            {/* Dealer icon for mobile */}
            <Link href="/dealers" className="lg:hidden text-white/80 hover:text-white p-2" title="Dealers">
              <MapPin className="w-5 h-5" />
            </Link>

            {/* Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded hover:bg-white/10 text-white/90 hover:text-white transition-all"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#C5A059] text-[#8B1E2A] text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-[#8B1E2A]"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Auth section */}
            <div className="hidden sm:flex items-center gap-4 border-l border-white/20 pl-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-white">{user.name}</span>
                    <span className="text-[10px] text-[#C5A059] uppercase font-bold tracking-wider font-mono leading-none">
                      {user.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  
                  {/* Avatar / Actions drop */}
                  <div className="relative group">
                    <button className="w-9 h-9 bg-[#C5A059] text-[#8B1E2A] font-serif font-black text-xs flex items-center justify-center border border-white hover:scale-105 transition-all">
                      {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </button>
                    
                    {/* Hover dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#FDFBF7] border border-[#D4CBB3] rounded shadow-xl py-2 hidden group-hover:block z-50">
                      <a href="/account" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#554D4D] hover:bg-[#8B1E2A]/5 hover:text-[#8B1E2A] transition-colors">
                        <User className="w-4 h-4" />
                        Account
                      </a>
                      {user.role === 'admin' && (
                        <a href="/admin" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#8B1E2A] hover:bg-[#8B1E2A]/5 transition-colors">
                          <ShieldAlert className="w-4 h-4" />
                          Admin Panel
                        </a>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-[#D4CBB3] mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <a 
                  href="/login" 
                  className="text-white/80 hover:text-white cursor-pointer uppercase text-[10px] tracking-widest font-bold border border-white/20 px-4 py-2 hover:bg-white/5 transition-all"
                >
                  SIGN IN
                </a>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white/90 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FDFBF7] border-b border-[#EBE4D5] px-4 py-6 space-y-4 shadow-lg absolute w-full left-0 z-30 overflow-hidden"
          >
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[#6B5E55] hover:text-[#8B1E2A]"
            >
              HOME
            </Link>
            <Link 
              href="/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[#6B5E55] hover:text-[#8B1E2A]"
            >
              PRODUCTS
            </Link>
            <Link 
              href="/visualizer" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[#6B5E55] hover:text-[#8B1E2A]"
            >
              VISUALIZER
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[#6B5E55] hover:text-[#8B1E2A]"
            >
              ABOUT
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[#6B5E55] hover:text-[#8B1E2A]"
            >
              CONTACT
            </Link>
            <Link 
              href="/dealers" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-semibold text-[#6B5E55] hover:text-[#8B1E2A] flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-[#C5A059]" />
              FIND DEALER
            </Link>
            <hr className="border-[#EBE4D5]" />
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B1E2A]/10 text-[#8B1E2A] font-bold text-xs flex items-center justify-center">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2C2520]">{user.name}</p>
                    <p className="text-[10px] text-[#C5A059] uppercase font-bold">{user.role} role</p>
                  </div>
                </div>
                <Link 
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-xs font-semibold text-[#6B5E55] hover:text-[#8B1E2A]"
                >
                  Royal Account / My Orders
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-xs font-bold text-[#8B1E2A]"
                  >
                    🛡️ Admin Console
                  </Link>
                )}
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block text-xs font-semibold text-red-600 hover:underline"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center bg-[#8B1E2A] text-white py-2.5 rounded-none text-sm font-semibold tracking-wider border-b-2 border-r-2 border-[#C5A059]"
              >
                SIGN IN
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer Slide-Over */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Slide-over panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-[#FDFBF7] shadow-2xl z-50 flex flex-col border-l border-[#EBE4D5]"
            >
              <div className="p-6 border-b border-[#EBE4D5] flex justify-between items-center bg-[#F3ECE0]">
                <div className="flex items-center gap-2">
                  <CartIcon className="w-5 h-5 text-[#8B1E2A]" />
                  <h2 className="font-heading text-xl font-bold text-[#8B1E2A]">Cart</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-[#6B5E55]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 text-[#9E8E81] space-y-3">
                    <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5] text-[#D4AF37]/50" />
                    <p className="font-heading text-lg font-medium text-[#6B5E55]">Your cart is empty</p>
                    <p className="text-xs">Add products to your cart to get started.</p>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
                    return (
                      <div key={item.id} className="flex gap-4 p-3 bg-white border border-[#EBE4D5] rounded-xl relative overflow-hidden shadow-sm">
                        {/* Selected Shade Colour Indicator */}
                        {item.shade && (
                          <div 
                            className="absolute top-0 left-0 w-2.5 h-full"
                            style={{ backgroundColor: item.shade.color_code }}
                            title={`Shade: ${item.shade.shade_name}`}
                          />
                        )}
                        <div className="w-16 h-16 rounded-lg bg-[#FAF8F5] relative overflow-hidden shrink-0 border border-neutral-100 pl-2">
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
                        <div className="flex-1 space-y-1">
                          <h4 className="text-xs font-bold text-[#2C2520] line-clamp-1">{item.product?.name}</h4>
                          {item.shade ? (
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-neutral-300 block"
                                style={{ backgroundColor: item.shade.color_code }}
                              />
                              <span className="text-[10px] font-semibold text-[#8B1E2A]">{item.shade.shade_name}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400">Base Paint</span>
                          )}
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-xs font-extrabold text-[#AA8B2C]">PKR {price.toLocaleString()}</span>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 border border-[#EBE4D5] rounded bg-[#FAF8F5] px-1 py-0.5">
                              <button 
                                onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                className="p-0.5 text-[#6B5E55] hover:text-[#8B1E2A]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-1 text-neutral-800">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                className="p-0.5 text-[#6B5E55] hover:text-[#8B1E2A]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="text-neutral-400 hover:text-red-500 self-start p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Subtotal & Action */}
              {cartItems.length > 0 && (
                <div className="p-6 bg-[#F3ECE0] border-t border-[#EBE4D5] space-y-4">
                  <div className="flex justify-between text-sm font-semibold text-[#6B5E55]">
                    <span>Items Count</span>
                    <span>{cartCount} Buckets</span>
                  </div>
                  <div className="flex justify-between font-heading text-lg font-bold text-[#8B1E2A]">
                    <span>Total</span>
                    <span>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  
                  {user ? (
                    <button 
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full bg-[#8B1E2A] hover:bg-[#6B141E] text-white py-3 rounded-lg font-semibold tracking-wider text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      PROCEED TO CHECKOUT
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <a 
                        href={`/login?redirect=/`}
                        onClick={() => setIsCartOpen(false)}
                        className="block w-full text-center bg-[#8B1E2A] hover:bg-[#6B141E] text-white py-3 rounded-lg font-semibold tracking-wider text-sm transition-all shadow-md"
                      >
                        LOG IN TO CHECKOUT
                      </a>
                      <p className="text-[10px] text-center text-[#9E8E81]">Guest checkout is disabled. Create a royal account to secure your orders.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal Overlay */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FDFBF7] rounded-xl border border-[#EBE4D5] shadow-2xl max-w-lg w-full p-6 relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#8B1E2A]">Checkout</h3>
                  <p className="text-xs text-[#6B5E55] mt-1">Enter your delivery address to place the order</p>
                </div>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1 rounded-full hover:bg-black/5 text-[#6B5E55]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {checkoutSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading text-lg font-bold text-green-800">Order Placed!</h4>
                  <p className="text-xs text-[#6B5E55]">
                    Your order <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono font-bold text-[#8B1E2A]">{checkoutOrderId}</code> has been placed! Check your account for order tracking.
                  </p>
                  <button 
                    onClick={closeCheckoutModal}
                    className="bg-[#8B1E2A] hover:bg-[#6B141E] text-white px-6 py-2 rounded-lg text-xs font-semibold tracking-wider"
                  >
                    CONTINUE EXPLORING
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
                  <div className="p-3.5 bg-[#F3ECE0]/50 rounded-lg border border-[#EBE4D5] text-xs space-y-2">
                    <p className="font-semibold text-[#8B1E2A] uppercase tracking-wider">Order Summary</p>
                    <div className="space-y-1">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-neutral-700">
                          <span className="line-clamp-1">{item.product?.name} ({item.shade?.shade_name || 'Base'}) x {item.quantity}</span>
                          <span className="font-semibold text-neutral-900">PKR {((item.shade?.price_override ?? item.product?.base_price ?? 0) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <hr className="border-[#EBE4D5]" />
                    <div className="flex justify-between font-bold text-sm text-[#8B1E2A]">
                      <span>Total Due</span>
                      <span>PKR {cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E55] uppercase tracking-wider mb-2">
                      Delivery Address
                    </label>
                    <textarea 
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="Enter house details, street number, sector/city..."
                      className="w-full p-3 border border-[#EBE4D5] rounded-lg bg-[#FAF8F5] text-sm text-[#2C2520] focus:outline-none focus:ring-2 focus:ring-[#8B1E2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E55] uppercase tracking-wider mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 p-3 border border-[#8B1E2A]/20 rounded-lg bg-[#8B1E2A]/5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="payment" 
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-[#8B1E2A]"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-[#8B1E2A]">COD</p>
                          <p className="text-[10px] text-gray-500">Cash On Delivery</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg opacity-60 cursor-not-allowed">
                        <input 
                          type="radio" 
                          name="payment" 
                          disabled
                          className="accent-[#8B1E2A]"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-400">Card Payment</p>
                          <p className="text-[10px] text-gray-400">Currently Disabled</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="flex-1 py-2.5 border border-[#EBE4D5] hover:bg-black/5 text-xs font-bold text-[#6B5E55] rounded-lg transition-colors"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#8B1E2A] hover:bg-[#6B141E] text-white py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { authService, UserProfile } from '@/lib/auth';
import { cartService } from '@/lib/cart';
import { emitCartUpdated } from '@/lib/events';
import { 
  Palette, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Flame, 
  Layers, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Eye,
  Paintbrush,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [shades, setShades] = useState<any[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [selectedProductShades, setSelectedProductShades] = useState<Record<string, string>>({});
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visualizerRoom, setVisualizerRoom] = useState<'living' | 'bedroom' | 'office'>('living');
  const [visualizerColor, setVisualizerColor] = useState('#8B1E2A');
  const [visualizerColorName, setVisualizerColorName] = useState('Mughal Maroon');

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      try {
        const [catRes, prodRes, shadeRes, bannerRes] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('products').select('*'),
          supabase.from('product_shades').select('*'),
          supabase.from('banners').select('*').eq('active', true)
        ]);

        if (!catRes.error && catRes.data) setCategories(catRes.data);
        if (!prodRes.error && prodRes.data) setProducts(prodRes.data);
        if (!shadeRes.error && shadeRes.data) {
          setShades(shadeRes.data);
          // Pre-select first shade for each product
          const initialShades: Record<string, string> = {};
          (prodRes.data || []).forEach((prod: any) => {
            const prodShades = (shadeRes.data || []).filter((s: any) => s.product_id === prod.id);
            if (prodShades.length > 0) initialShades[prod.id] = prodShades[0].id;
          });
          setSelectedProductShades(initialShades);
        }
        if (!bannerRes.error && bannerRes.data) setBanners(bannerRes.data);
      } catch (e) {
        console.error('Error fetching data from Supabase:', e);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = async (productId: string) => {
    setAddingToCartId(productId);
    setCartSuccessMessage(null);
    const selectedShadeId = selectedProductShades[productId];
    const activeSh = shades.find(s => s.id === selectedShadeId);
    const prod = products.find(p => p.id === productId);

    try {
      await cartService.addToCart(user?.id, productId, selectedShadeId, 1);
      setCartSuccessMessage(`Added 1x ${prod?.name || 'paint'} (${activeSh?.shade_name || 'Selected Shade'}) to your cart.`);
      emitCartUpdated();
      setTimeout(() => setAddingToCartId(null), 1000);
    } catch (e: any) {
      console.error(e);
      setAddingToCartId(null);
    }
  };

  const featuredProducts = products.slice(0, 6);

  const nextSlide = () => {
    if (featuredProducts.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % featuredProducts.length);
    setCartSuccessMessage(null);
  };

  const prevSlide = () => {
    if (featuredProducts.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    setCartSuccessMessage(null);
  };

  const getVisibleProducts = () => {
    if (featuredProducts.length === 0) return [];
    const count = Math.min(featuredProducts.length, 3);
    const items = [];
    for (let i = 0; i < count; i++) {
      const idx = (carouselIndex + i) % featuredProducts.length;
      items.push(featuredProducts[idx]);
    }
    return items;
  };

  const visibleProducts = getVisibleProducts();

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />

      {/* Hero Section */}
      {banners.length > 0 ? (
        <section className="relative overflow-hidden bg-[#FAF8F5] text-[#2D2424] border-b-4 border-[#C5A059] flex flex-col lg:flex-row items-stretch min-h-[560px]">
          <div className="w-full lg:w-[58%] py-20 sm:py-24 px-6 sm:px-12 md:px-16 flex flex-col justify-center relative bg-[#FDFBF7]">
            <div className="absolute top-10 left-6 sm:left-12 md:left-16 w-20 h-1 bg-[#C5A059]" />
            <div className="space-y-6 text-left max-w-2xl mt-4 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 text-[#8B1E2A] text-xs font-bold uppercase tracking-widest rounded-none">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                Mughal Masterpiece Series
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeBannerIndex} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="space-y-5">
                  <h1 className="text-3xl sm:text-5xl font-serif leading-[1.1] text-[#1A1A1A] font-bold">{banners[activeBannerIndex].title}</h1>
                  <p className="text-sm sm:text-base text-[#554D4D] max-w-xl leading-relaxed font-light">{banners[activeBannerIndex].subtitle}</p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link href={banners[activeBannerIndex].link} className="bg-[#8B1E2A] text-white px-8 py-4 text-xs uppercase tracking-widest font-bold border-r-4 border-b-4 border-[#C5A059] hover:bg-[#721822] transition-all inline-flex items-center gap-2">
                      EXPLORE FORMULAS <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/visualizer" className="border-2 border-[#C5A059] text-[#8B1E2A] bg-white px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-[#8B1E2A]/5 transition-all inline-flex items-center gap-2">
                      STUDIO VISUALIZER <Palette className="w-4 h-4 text-[#C5A059]" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-6 left-6 sm:left-12 md:left-16 flex items-center gap-4 z-10">
              <div className="flex gap-1.5">
                {banners.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveBannerIndex(idx)} className={`w-2.5 h-2.5 transition-all rounded-none ${activeBannerIndex === idx ? 'bg-[#8B1E2A] w-6' : 'bg-stone-300'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)} className="p-1 border border-[#D4CBB3] hover:border-[#8B1E2A] bg-white text-stone-700"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setActiveBannerIndex((prev) => (prev + 1) % banners.length)} className="p-1 border border-[#D4CBB3] hover:border-[#8B1E2A] bg-white text-stone-700"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[42%] border-t lg:border-t-0 lg:border-l border-[#D4CBB3] relative min-h-[380px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img key={activeBannerIndex} src={banners[activeBannerIndex].image_url} alt={banners[activeBannerIndex].title} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="w-full h-full object-cover" />
            </AnimatePresence>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-[#FDFBF7] border-b-4 border-[#C5A059] flex flex-col lg:flex-row items-stretch">
          <div className="w-full lg:w-[58%] py-16 sm:py-24 px-6 sm:px-12 md:px-16 flex flex-col justify-center relative">
            <div className="absolute top-10 left-6 sm:left-12 md:left-16 w-20 h-1 bg-[#C5A059]" />
            <div className="space-y-6 text-left max-w-2xl mt-4">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl font-serif leading-[1.05] text-[#1A1A1A] font-light italic">
                Colours Fit for <br /><span className="text-[#8B1E2A] font-bold not-italic">Mughal Royalty</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm sm:text-base text-[#554D4D] max-w-md leading-relaxed font-light">
                Immerse your space in the grandeur of Mughal castles. Our silk emulsions, weather guards, and gold metallic accents bring timeless luxury to your walls.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 pt-4">
                <Link href="/products" className="bg-[#8B1E2A] text-white px-8 py-4 text-xs uppercase tracking-widest font-bold border-r-4 border-b-4 border-[#C5A059] hover:bg-[#721822] transition-all inline-flex items-center gap-2">
                  EXPLORE CATALOG <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/visualizer" className="border-2 border-[#C5A059] text-[#8B1E2A] bg-white px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-[#8B1E2A]/5 transition-all inline-flex items-center gap-2">
                  STUDIO VISUALIZER <Palette className="w-4 h-4 text-[#C5A059]" />
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="w-full lg:w-[42%] bg-[#F5F1E9] border-t lg:border-t-0 lg:border-l border-[#D4CBB3] py-16 px-12 flex flex-col justify-center items-center min-h-[460px]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="w-[220px] h-[260px] rounded-t-full shadow-2xl border-[12px] border-white flex items-center justify-center transition-all" style={{ backgroundColor: visualizerColor }}>
              <span className="text-white font-serif text-xl font-bold text-center px-4 drop-shadow">{visualizerColorName}</span>
            </motion.div>
            <div className="grid grid-cols-4 gap-3 mt-8">
              {[{ name: 'Royal Maroon', hex: '#8B1E2A' }, { name: 'Oudh Gold', hex: '#C5A059' }, { name: 'Forest Dew', hex: '#3A4D39' }, { name: 'Ivory', hex: '#EAE7D9' }].map(item => (
                <div key={item.name} className="cursor-pointer text-center" onClick={() => { setVisualizerColor(item.hex); setVisualizerColorName(item.name); }}>
                  <div className="aspect-square border-2 border-white shadow-sm" style={{ backgroundColor: item.hex }} />
                  <span className="text-[8px] mt-1 block uppercase text-[#554D4D] font-mono truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-heading text-3xl sm:text-4xl font-light italic text-[#1A1A1A]">Browse by <span className="text-[#8B1E2A] font-bold not-italic">Category</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'interior', title: 'Interior Emulsions', desc: 'Silk, velvet, and matte emulsions for elegant walls.', icon: Sparkles },
            { id: 'exterior', title: 'Exterior Shields', desc: 'Weather barriers built to resist UV and monsoons.', icon: ShieldCheck },
            { id: 'metallic', title: 'Metallic Finishes', desc: 'Gold, bronze, and copper coatings for royal luster.', icon: Flame },
            { id: 'wood-finish', title: 'Wood Finishes', desc: 'Premium lacquers and enamels for wood surfaces.', icon: Layers }
          ].map((sc) => {
            const IconComp = sc.icon;
            return (
              <Link key={sc.id} href={`/products?category=${sc.id}`} className="group bg-white border-2 border-[#D4CBB3] p-6 hover:border-[#8B1E2A] hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 flex items-center justify-center group-hover:bg-[#8B1E2A]">
                    <IconComp className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#8B1E2A] transition-colors">{sc.title}</h3>
                    <p className="text-xs text-[#554D4D] font-light leading-relaxed mt-1">{sc.desc}</p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[#8B1E2A] uppercase tracking-wider gap-1">
                  <span>View Category</span><ArrowUpRight className="w-3.5 h-3.5 text-[#C5A059]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#FAF8F5] border-y-2 border-[#D4CBB3] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-light italic text-[#1A1A1A]">Featured <span className="text-[#8B1E2A] font-bold not-italic">Products</span></h2>
            <div className="flex gap-2">
              <button onClick={prevSlide} className="w-10 h-10 bg-white border-2 border-[#D4CBB3] hover:border-[#8B1E2A] flex items-center justify-center transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextSlide} className="w-10 h-10 bg-white border-2 border-[#D4CBB3] hover:border-[#8B1E2A] flex items-center justify-center transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          {cartSuccessMessage && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-semibold">{cartSuccessMessage}</div>
          )}

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-[#D4CBB3]">
              <div className="w-8 h-8 border-2 border-[#8B1E2A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleProducts.map((prod) => {
                const productShades = shades.filter(s => s.product_id === prod.id);
                const selectedShadeId = selectedProductShades[prod.id];
                const activeShade = productShades.find(s => s.id === selectedShadeId);
                const price = activeShade?.price_override ?? prod.base_price;
                return (
                  <motion.div key={prod.id} className="bg-white border-2 border-[#D4CBB3] hover:border-[#8B1E2A] hover:shadow-lg transition-all flex flex-col overflow-hidden">
                    <div className="relative aspect-[4/3] bg-[#F5F1E9] overflow-hidden">
                      {activeShade && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-black/75 text-white text-[9px] font-bold">
                          <span className="w-2.5 h-2.5 block" style={{ backgroundColor: activeShade.color_code }} />
                          {activeShade.shade_name.toUpperCase()}
                        </div>
                      )}
                      <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-[#1A1A1A]">{prod.name}</h3>
                        <p className="text-xs text-[#554D4D] font-light leading-relaxed line-clamp-2 mt-1">{prod.description}</p>
                      </div>
                      {productShades.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {productShades.map(sh => (
                            <button key={sh.id} onClick={() => setSelectedProductShades(prev => ({ ...prev, [prod.id]: sh.id }))} className={`w-6 h-6 border flex items-center justify-center transition-all ${selectedShadeId === sh.id ? 'border-[#8B1E2A] scale-110' : 'border-[#D4CBB3]'}`} style={{ backgroundColor: sh.color_code }} title={sh.shade_name}>
                              {selectedShadeId === sh.id && <Check className="w-3 h-3 text-white" />}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="pt-3 border-t border-[#D4CBB3]/60 flex items-center justify-between">
                        <span className="text-base font-extrabold text-[#8B1E2A] font-mono">PKR {Number(price).toLocaleString()}</span>
                        <div className="flex gap-2">
                          <Link href={`/products/${prod.id}`} className="p-2 border-2 border-[#D4CBB3] hover:border-[#8B1E2A] transition-colors"><Eye className="w-4 h-4 text-[#554D4D]" /></Link>
                          <button onClick={() => handleAddToCart(prod.id)} disabled={addingToCartId === prod.id} className="bg-[#8B1E2A] text-white px-3.5 py-2.5 font-bold uppercase text-[10px] border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:opacity-60 flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
                            {addingToCartId === prod.id ? 'ADDING...' : 'ADD'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center pt-4">
            <Link href="/products" className="bg-[#8B1E2A] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors inline-block">
              VIEW ALL PRODUCTS ({products.length})
            </Link>
          </div>
        </div>
      </section>

      {/* Visualizer CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <h2 className="font-heading text-3xl sm:text-4xl font-light italic text-[#1A1A1A]">
          Visualize Your <span className="text-[#8B1E2A] font-bold not-italic">Castle Walls</span>
        </h2>
        <p className="text-sm text-[#554D4D] font-light max-w-xl mx-auto">Try our color visualizer tool to see how shades look on your walls before you buy.</p>
        <Link href="/visualizer" className="bg-[#8B1E2A] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors inline-flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-[#C5A059]" /> LAUNCH VISUALIZER
        </Link>
      </section>

      <Footer />
    </div>
  );
}
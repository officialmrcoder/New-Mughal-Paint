'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Search, SlidersHorizontal, ArrowUpDown, Layers, ShoppingBag, Eye, Palette } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shades, setShades] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // low-to-high, high-to-low, newest
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      let fetchedProducts: any[] = [];
      let fetchedCategories: any[] = [];
      let fetchedShades: any[] = [];

      if (isSupabaseConfigured()) {
        try {
          const [prodRes, catRes, shadeRes] = await Promise.all([
            supabase.from('products').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('product_shades').select('*')
          ]);

          if (!prodRes.error && prodRes.data) fetchedProducts = prodRes.data;
          if (!catRes.error && catRes.data) fetchedCategories = catRes.data;
          if (!shadeRes.error && shadeRes.data) fetchedShades = shadeRes.data;
        } catch (e) {
          console.error('Error fetching catalog from Supabase:', e);
        }
      }

      // If Supabase failed or isn't configured, use sandbox local database
      if (fetchedProducts.length === 0 || fetchedCategories.length === 0) {
        const mockDb = getMockDatabase();
        fetchedProducts = mockDb.products;
        fetchedCategories = mockDb.categories;
        fetchedShades = mockDb.shades;
      }

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setShades(fetchedShades);
      setLoading(false);
    };

    loadCatalog();
  }, []);

  // Filter and Sort calculations
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'low-to-high') {
      return Number(a.base_price) - Number(b.base_price);
    } else if (sortBy === 'high-to-low') {
      return Number(b.base_price) - Number(a.base_price);
    } else {
      // Default to Newest (created_at descending or simple ID comparison as fallback)
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA || b.id.localeCompare(a.id);
    }
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Page title section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8B1E2A]/5 border border-[#8B1E2A]/20 text-[#8B1E2A] text-xs font-bold uppercase tracking-widest rounded-none">
            <Palette className="w-3.5 h-3.5 text-[#C5A059]" />
            Shahi Paint Catalog
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-light italic text-[#1A1A1A]">
            The Royal <span className="text-[#8B1E2A] font-bold not-italic">Color Collections</span>
          </h1>
          <p className="text-sm text-[#554D4D] font-light leading-relaxed">
            Browse through our Mughal-inspired color formulations. Crafted with weatherproofing shield tech and breathable polymers for maximum life.
          </p>
        </div>

        {/* Catalog Control Dashboard */}
        <div className="bg-[#F5F1E9] border-2 border-[#D4CBB3] rounded-none p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
              <Search className="h-4 w-4" />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by paint model, formula or features..."
              className="w-full pl-10 pr-4 py-2 border-2 border-[#D4CBB3] rounded-none bg-white text-sm focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
            
            {/* Category selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#554D4D] font-mono shrink-0 hidden sm:inline">Collection:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-bold border-2 border-[#D4CBB3] rounded-none px-3 py-2 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#8B1E2A]"
              >
                <option value="all">ALL COLLECTIONS</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Sorting selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#554D4D] font-mono shrink-0 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold border-2 border-[#D4CBB3] rounded-none px-3 py-2 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#8B1E2A]"
              >
                <option value="newest">NEWEST ARRIVALS</option>
                <option value="low-to-high">PRICE: LOW TO HIGH</option>
                <option value="high-to-low">PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid Section */}
        {loading ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Summoning Shahi Formulations...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-[#D4CBB3] rounded-none space-y-3">
            <ShoppingBag className="w-12 h-12 text-[#C5A059] mx-auto stroke-[1.5]" />
            <p className="font-heading text-lg font-semibold text-[#1A1A1A]">No Shahi Paints Match Your Filter</p>
            <p className="text-xs text-[#554D4D]">Try clearing your search query or choosing another collection category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((prod, idx) => {
              const cat = categories.find(c => c.id === prod.category_id);
              const prodShades = shades.filter(s => s.product_id === prod.id);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={prod.id}
                  className="bg-white border-2 border-[#D4CBB3] rounded-none overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:border-[#8B1E2A] hover:shadow-md"
                >
                  <div className="relative aspect-video w-full bg-neutral-100 overflow-hidden border-b-2 border-[#D4CBB3]">
                    <img 
                      src={prod.image_url || 'https://picsum.photos/seed/paint/600/400'} 
                      alt={prod.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest border border-white/10 font-mono">
                      {cat?.name || 'Mughal Blend'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 text-left">
                      <h3 className="font-heading text-lg font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#8B1E2A] transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#554D4D] font-light line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Show preview of linked shades */}
                    {prodShades.length > 0 && (
                      <div className="space-y-1.5 text-left pt-2 border-t border-dashed border-[#D4CBB3]/50">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                          Available Colors ({prodShades.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {prodShades.slice(0, 5).map(shade => (
                            <span 
                              key={shade.id}
                              className="w-4.5 h-4.5 rounded-none border border-neutral-300 block shadow-sm"
                              style={{ backgroundColor: shade.color_code }}
                              title={shade.shade_name}
                            />
                          ))}
                          {prodShades.length > 5 && (
                            <span className="text-[10px] font-bold text-neutral-400 font-mono self-center pl-1">
                              +{prodShades.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t-2 border-[#F5F1E9] flex items-center justify-between">
                      <div className="text-left">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400 font-mono">Base Price Starting</span>
                        <span className="text-sm font-extrabold text-[#C5A059] font-mono">
                          PKR {Number(prod.base_price).toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/products/${prod.id}`}
                        className="bg-[#8B1E2A] hover:bg-[#721822] text-white px-4 py-2.5 rounded-none text-xs font-bold tracking-widest border-b-2 border-r-2 border-[#C5A059] flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        VIEW DETAILS
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

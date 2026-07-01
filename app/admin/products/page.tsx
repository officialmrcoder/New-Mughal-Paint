'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from '../AdminProvider';
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  Filter, 
  ArrowUpDown,
  FileImage,
  Sparkles
} from 'lucide-react';

export default function AdminProducts() {
  const { showToast } = useAdmin();
  const router = useRouter();
  
  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc'>('name');

  // Modal / Form States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form Values
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data: catData } = await supabase.from('categories').select('*');
        const { data: prodData } = await supabase.from('products').select('*');
        
        if (catData) setCategories(catData);
        if (prodData) setProducts(prodData);
      } else {
        const mockDb = getMockDatabase();
        setCategories(mockDb.categories);
        setProducts(mockDb.products);
      }
    } catch (err) {
      console.error('Error loading products/categories:', err);
      showToast('Error syncing product databases.', 'error');
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create local preview
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice) {
      showToast('Name and Base Price are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl || 'https://picsum.photos/seed/paint/600/400';

      if (isSupabaseConfigured()) {
        // Handle file upload to Supabase storage if file is selected
        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, imageFile);

          if (uploadError) {
            console.error('Supabase storage upload error:', uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          finalImageUrl = publicUrl;
        }

        // Insert into database
        const { error: insertError } = await supabase
          .from('products')
          .insert({
            name,
            category_id: categoryId ? categoryId : null,
            description,
            base_price: parseFloat(basePrice),
            image_url: finalImageUrl
          });

        if (insertError) throw insertError;
        showToast('Royal product added successfully to Supabase!');
      } else {
        // Mock Add
        if (imageFile) {
          // Keep the object URL preview for mock mode
          finalImageUrl = imageUrl;
        } else {
          finalImageUrl = `https://picsum.photos/seed/${encodeURIComponent(name)}/600/400`;
        }

        const mockDb = getMockDatabase();
        const newProduct = {
          id: 'prod-' + Math.random().toString(36).substring(2, 9),
          name,
          category_id: categoryId,
          description,
          base_price: parseFloat(basePrice),
          image_url: finalImageUrl,
          created_at: new Date().toISOString()
        };

        mockDb.products = [...mockDb.products, newProduct];
        showToast('Product added successfully!');
      }

      // Reset Form & Close
      setName('');
      setCategoryId('');
      setDescription('');
      setBasePrice('');
      setImageFile(null);
      setImageUrl('');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred while saving product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This is permanent.`)) return;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        showToast('Product successfully deleted.');
      } else {
        const mockDb = getMockDatabase();
        mockDb.products = mockDb.products.filter((p: any) => p.id !== id);
        // Also remove shades linked to this product in mock db to remain clean
        mockDb.shades = mockDb.shades.filter((s: any) => s.product_id !== id);
        showToast('Product deleted.');
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred while deleting.', 'error');
    }
  };

  // Filter & Search & Sort computation
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = categoryFilter === 'all' || p.category_id === categoryFilter;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price_asc') return Number(a.base_price) - Number(b.base_price);
      if (sortBy === 'price_desc') return Number(b.base_price) - Number(a.base_price);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-5">
        <div className="text-left">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#8B1E2A] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#C5A059]" />
            Products & Shades
          </h1>
          <p className="text-xs text-[#554D4D] font-light">
            Manage products, prices, categories, and shades.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAddOpen(true);
            if (categories.length > 0 && !categoryId) {
              setCategoryId(categories[0].id);
            }
          }}
          className="bg-[#8B1E2A] text-white px-5 py-3 text-xs uppercase tracking-widest font-bold border-r-2 border-b-2 border-[#C5A059] hover:bg-[#721822] transition-colors flex items-center gap-2"
        >
           <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-[#D4CBB3] p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search paint formulas by name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border-2 border-[#D4CBB3] rounded-none focus:outline-none focus:border-[#8B1E2A] bg-[#FAF8F5] text-neutral-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border-2 border-[#D4CBB3] px-3 py-2 text-xs font-bold text-neutral-700">
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              <option value="all">ALL COLLECTIONS</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border-2 border-[#D4CBB3] px-3 py-2 text-xs font-bold text-neutral-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A059]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              <option value="name">SORT BY NAME</option>
              <option value="price_asc">PRICE: LOW TO HIGH</option>
              <option value="price_desc">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-mono font-bold uppercase text-[#8B1E2A] tracking-wider">Syncing Vault...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-[#D4CBB3] space-y-3">
          <Package className="w-12 h-12 text-[#C5A059] mx-auto" />
          <h4 className="font-bold text-neutral-850 uppercase tracking-widest text-sm">No formulas matched</h4>
          <p className="text-xs text-[#554D4D] font-light">Try expanding your filters or search terms.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#D4CBB3] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#FAF8F5] border-b-2 border-[#D4CBB3] text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest">
                <th className="py-4 px-6 w-24">Showcase</th>
                <th className="py-4 px-6">Name & Description</th>
                <th className="py-4 px-6">Collection</th>
                <th className="py-4 px-6 text-right">Base Price (PKR)</th>
                <th className="py-4 px-6 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4CBB3]/40 text-xs text-neutral-700">
              {filteredProducts.map((prod) => {
                const cat = categories.find(c => c.id === prod.category_id);
                return (
                  <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-14 h-14 bg-neutral-100 border border-[#D4CBB3] overflow-hidden shadow-inner relative">
                        <img 
                          src={prod.image_url} 
                          alt={prod.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-1 max-w-sm">
                      <div className="font-bold text-sm text-[#1A1A1A]">{prod.name}</div>
                      <p className="text-[11px] text-[#554D4D] font-light line-clamp-2 leading-relaxed">
                        {prod.description || 'No formula details logged.'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 border border-[#C5A059]/40 bg-[#C5A059]/5 text-[#8B1E2A] text-[9px] font-extrabold uppercase tracking-wider font-mono">
                        {cat?.name || 'Base Paint'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-sm text-[#1A1A1A] font-mono">
                      PKR {prod.base_price.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="p-2 text-stone-600 hover:text-[#8B1E2A] hover:bg-[#8B1E2A]/5 border border-[#D4CBB3] rounded-none bg-white transition-colors flex items-center gap-1 font-bold text-[10px] tracking-wider uppercase font-mono"
                          title="Manage Shades & Product"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#C5A059]" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Dialog Modal overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] border-4 border-[#C5A059] p-6 max-w-lg w-full relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-[#8B1E2A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b-2 border-dashed border-[#D4CBB3] mb-5 text-left">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
              <div>
                <h3 className="font-heading text-lg font-bold text-[#8B1E2A] uppercase tracking-wider">
                  Log New Paint Formula
                </h3>
                <p className="text-[10px] text-[#554D4D] font-light">Introduce a new colour collection to the catalog.</p>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mughal Gold Metallic Enamel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                    Target Collection
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
                  >
                    <option value="">No Category (Base)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                    Base Price (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="3500"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                  Formula Details / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Weather shield protections, environmental compliance, wall coverage metrics, chemical binders..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
                />
              </div>

              {/* Image Upload Input */}
              <div>
                <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                  Formula Showcase Image
                </label>
                <div className="border-2 border-dashed border-[#D4CBB3] p-4 flex flex-col items-center justify-center bg-stone-50/50 hover:bg-stone-50 transition-colors text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {imageUrl ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="w-16 h-16 border border-[#D4CBB3] overflow-hidden">
                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                        <FileImage className="w-3.5 h-3.5" />
                        IMAGE FILE STAGED
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-stone-500">
                      <Upload className="w-6 h-6 text-[#C5A059] mx-auto mb-1" />
                      <p className="text-xs font-bold uppercase tracking-wider">Upload or Drag Image</p>
                      <p className="text-[9px] font-light">{'Staged to "product-images" Supabase storage'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 border-2 border-stone-300 hover:bg-stone-50 py-3 font-bold text-xs uppercase tracking-widest text-stone-600 rounded-none transition-colors"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#8B1E2A] text-white py-3 font-bold text-xs uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:bg-stone-300 disabled:border-stone-400 transition-colors text-center"
                >
                  {isSubmitting ? 'UPLOADING...' : 'SAVE TO SYSTEM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

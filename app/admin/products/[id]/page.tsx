'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from '../../AdminProvider';
import { 
  ArrowLeft, 
  Palette, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  Upload, 
  FileImage,
  Layers,
  Settings
} from 'lucide-react';

interface Params {
  id: string;
}

export default function EditProductPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useAdmin();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [shadingActionLoading, setShadingActionLoading] = useState(false);

  // DB Lists
  const [categories, setCategories] = useState<any[]>([]);

  // Product Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Shades List State
  const [shades, setShades] = useState<any[]>([]);

  // Add Shade Form State
  const [newShadeName, setNewShadeName] = useState('');
  const [newShadeColor, setNewShadeColor] = useState('#8B1E2A');
  const [newShadeOverride, setNewShadeOverride] = useState('');

  // Edit Shade Form State (Inline editing)
  const [editingShadeId, setEditingShadeId] = useState<string | null>(null);
  const [editShadeName, setEditShadeName] = useState('');
  const [editShadeColor, setEditShadeColor] = useState('');
  const [editShadeOverride, setEditShadeOverride] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        // Load categories
        const { data: catData } = await supabase.from('categories').select('*');
        if (catData) setCategories(catData);

        // Load specific product
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (prodErr || !prodData) {
          showToast('Product not found in system.', 'error');
          router.push('/admin/products');
          return;
        }

        setName(prodData.name);
        setCategoryId(prodData.category_id || '');
        setDescription(prodData.description || '');
        setBasePrice(prodData.base_price.toString());
        setImageUrl(prodData.image_url || '');

        // Load shades for product
        const { data: shadeData } = await supabase
          .from('product_shades')
          .select('*')
          .eq('product_id', id);

        if (shadeData) setShades(shadeData);
      } else {
        // Demo Sandbox mode
        const mockDb = getMockDatabase();
        setCategories(mockDb.categories);

        const prod = mockDb.products.find((p: any) => p.id === id);
        if (!prod) {
          showToast('Product not found.', 'error');
          router.push('/admin/products');
          return;
        }

        setName(prod.name);
        setCategoryId(prod.category_id || '');
        setDescription(prod.description || '');
        setBasePrice(prod.base_price.toString());
        setImageUrl(prod.image_url || '');

        const prodShades = mockDb.shades.filter((s: any) => s.product_id === id);
        setShades(prodShades);
      }
    } catch (err) {
      console.error('Error syncing product data:', err);
      showToast('Palace database synchronization error.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, router, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice) {
      showToast('Name and base price are required fields.', 'error');
      return;
    }

    setSavingProduct(true);
    try {
      let finalImageUrl = imageUrl;

      if (isSupabaseConfigured()) {
        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, imageFile);

          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          finalImageUrl = publicUrl;
        }

        const { error: updateError } = await supabase
          .from('products')
          .update({
            name,
            category_id: categoryId ? categoryId : null,
            description,
            base_price: parseFloat(basePrice),
            image_url: finalImageUrl
          })
          .eq('id', id);

        if (updateError) throw updateError;
        showToast('Product parameters updated on Supabase!');
      } else {
        // Sandbox updates
        const mockDb = getMockDatabase();
        mockDb.products = mockDb.products.map((p: any) => 
          p.id === id 
            ? { 
                ...p, 
                name, 
                category_id: categoryId, 
                description, 
                base_price: parseFloat(basePrice), 
                image_url: finalImageUrl 
              } 
            : p
        );
        showToast('Product updated successfully!');
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred while saving product.', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  // --- SHADES ACTIONS ---

  const handleAddShade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShadeName) {
      showToast('Shade name is required.', 'error');
      return;
    }

    setShadingActionLoading(true);
    try {
      const override = newShadeOverride ? parseFloat(newShadeOverride) : null;

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('product_shades')
          .insert({
            product_id: id,
            shade_name: newShadeName,
            color_code: newShadeColor,
            price_override: override
          });

        if (error) throw error;
        showToast('Linked new shade formula on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        const newSh = {
          id: 'shade-' + Math.random().toString(36).substring(2, 9),
          product_id: id,
          shade_name: newShadeName,
          color_code: newShadeColor,
          price_override: override
        };
        mockDb.shades = [...mockDb.shades, newSh];
        showToast('Shade added successfully!');
      }

      // Reset
      setNewShadeName('');
      setNewShadeColor('#8B1E2A');
      setNewShadeOverride('');
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred adding shade.', 'error');
    } finally {
      setShadingActionLoading(false);
    }
  };

  const handleStartEditShade = (shade: any) => {
    setEditingShadeId(shade.id);
    setEditShadeName(shade.shade_name);
    setEditShadeColor(shade.color_code);
    setEditShadeOverride(shade.price_override ? shade.price_override.toString() : '');
  };

  const handleSaveShadeEdit = async (shadeId: string) => {
    if (!editShadeName) {
      showToast('Shade name cannot be empty.', 'error');
      return;
    }

    setShadingActionLoading(true);
    try {
      const override = editShadeOverride ? parseFloat(editShadeOverride) : null;

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('product_shades')
          .update({
            shade_name: editShadeName,
            color_code: editShadeColor,
            price_override: override
          })
          .eq('id', shadeId);

        if (error) throw error;
        showToast('Shade properties updated on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        mockDb.shades = mockDb.shades.map((s: any) => 
          s.id === shadeId 
            ? { ...s, shade_name: editShadeName, color_code: editShadeColor, price_override: override } 
            : s
        );
        showToast('Shade updated successfully!');
      }

      setEditingShadeId(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error updating shade.', 'error');
    } finally {
      setShadingActionLoading(false);
    }
  };

  const handleDeleteShade = async (shadeId: string, shadeName: string) => {
    if (!confirm(`Are you sure you want to unlink the shade "${shadeName}"?`)) return;

    setShadingActionLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('product_shades')
          .delete()
          .eq('id', shadeId);

        if (error) throw error;
        showToast('Shade unlinked successfully.');
      } else {
        const mockDb = getMockDatabase();
        mockDb.shades = mockDb.shades.filter((s: any) => s.id !== shadeId);
        showToast('Shade deleted.');
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error unlinking shade.', 'error');
    } finally {
      setShadingActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent animate-spin" />
        <p className="text-xs font-mono font-bold uppercase text-[#8B1E2A] tracking-wider">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Back & Breadcrumb header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 border-2 border-[#D4CBB3] bg-white text-stone-700 hover:text-[#8B1E2A] transition-colors rounded-none shadow-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-stone-400 font-mono tracking-widest block">EDIT PRODUCT</span>
          <h1 className="font-heading text-xl font-bold text-[#1A1A1A] truncate">{name || 'Paint Product'}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Information Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b-2 border-dashed border-[#D4CBB3] flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-[#C5A059]" />
            <h3 className="font-heading text-sm font-bold uppercase text-[#8B1E2A] tracking-wider">
              Formula Parameters
            </h3>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                  Collection Category
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
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                Chemical / Formula Details
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
              />
            </div>

            {/* Showcase Image edit */}
            <div>
              <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                Product Showcase Image
              </label>
              <div className="space-y-3">
                <div className="w-full h-44 bg-neutral-100 border-2 border-[#D4CBB3] overflow-hidden relative shadow-inner">
                  {imageUrl ? (
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-400">
                      <FileImage className="w-10 h-10 mb-1" />
                      <span className="text-[10px]">No Showcase Image Uploaded</span>
                    </div>
                  )}
                </div>

                <div className="border-2 border-dashed border-[#D4CBB3] p-3 text-center relative cursor-pointer hover:bg-stone-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E2A] flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Alternate Formula Image
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProduct}
              className="w-full bg-[#8B1E2A] text-white py-3.5 font-bold text-xs uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:bg-stone-300 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-[#C5A059]" />
              {savingProduct ? 'COMMITING...' : 'COMMIT FORMULA PARAMETERS'}
            </button>
          </form>
        </div>

        {/* Right Column: Shades Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Shades Matrix */}
          <div className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b-2 border-dashed border-[#D4CBB3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4.5 h-4.5 text-[#C5A059]" />
                <h3 className="font-heading text-sm font-bold uppercase text-[#8B1E2A] tracking-wider">
                  Linked Shade Matrix ({shades.length})
                </h3>
              </div>
            </div>

            {/* List Table of existing shades */}
            {shades.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <Palette className="w-10 h-10 text-[#C5A059] mx-auto stroke-1" />
                <p className="text-xs font-bold uppercase tracking-wider font-mono">No shades mapped to this formula</p>
                <p className="text-[10px] font-light max-w-xs mx-auto">Use the form below to link color swatches and customize pricing variables.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-[10px] font-bold text-[#8B1E2A] uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-12">Swatch</th>
                      <th className="py-2.5 px-3">Shade Name</th>
                      <th className="py-2.5 px-3">HEX Code</th>
                      <th className="py-2.5 px-3 text-right">Price Override</th>
                      <th className="py-2.5 px-3 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {shades.map((shade) => {
                      const isEditing = editingShadeId === shade.id;
                      return (
                        <tr key={shade.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="py-3 px-3">
                            {isEditing ? (
                              <input
                                type="color"
                                value={editShadeColor}
                                onChange={(e) => setEditShadeColor(e.target.value)}
                                className="w-8 h-8 rounded-none border border-stone-300 cursor-pointer bg-transparent"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 border-2 border-[#D4CBB3] rounded-none shadow-sm"
                                style={{ backgroundColor: shade.color_code }}
                              />
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editShadeName}
                                onChange={(e) => setEditShadeName(e.target.value)}
                                className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800"
                              />
                            ) : (
                              <span className="font-bold text-neutral-800">{shade.shade_name}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editShadeColor.toUpperCase()}
                                onChange={(e) => setEditShadeColor(e.target.value)}
                                className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white font-mono uppercase text-neutral-800"
                              />
                            ) : (
                              <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase">{shade.color_code}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold">
                            {isEditing ? (
                              <input
                                type="number"
                                placeholder="None"
                                value={editShadeOverride}
                                onChange={(e) => setEditShadeOverride(e.target.value)}
                                className="w-20 p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-right font-mono text-neutral-800"
                              />
                            ) : shade.price_override ? (
                              <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 font-bold text-[10px]">
                                +PKR {shade.price_override.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-stone-400 font-light text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleSaveShadeEdit(shade.id)}
                                  disabled={shadingActionLoading}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-none bg-white transition-colors"
                                  title="Save shade changes"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingShadeId(null)}
                                  className="p-1.5 text-stone-500 hover:bg-stone-50 border border-stone-200 rounded-none bg-white transition-colors"
                                  title="Cancel changes"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleStartEditShade(shade)}
                                  className="p-1.5 text-stone-600 hover:text-[#8B1E2A] hover:bg-[#8B1E2A]/5 border border-transparent hover:border-stone-200 transition-all rounded-none"
                                  title="Edit shade"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteShade(shade.id, shade.shade_name)}
                                  disabled={shadingActionLoading}
                                  className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-none"
                                  title="Delete shade"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Mapped Shade Form */}
          <form onSubmit={handleAddShade} className="bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b-2 border-dashed border-[#D4CBB3] flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-[#C5A059]" />
              <h3 className="font-heading text-sm font-bold uppercase text-[#8B1E2A] tracking-wider">
                Link New Shade Swatch
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                  Shade Swatch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalimar Mint"
                  value={newShadeName}
                  onChange={(e) => setNewShadeName(e.target.value)}
                  className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                  HEX Color Swatch
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newShadeColor}
                    onChange={(e) => setNewShadeColor(e.target.value)}
                    className="w-12 h-10 border-2 border-[#D4CBB3] rounded-none cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    required
                    value={newShadeColor.toUpperCase()}
                    onChange={(e) => setNewShadeColor(e.target.value)}
                    className="flex-1 p-2 border-2 border-[#D4CBB3] rounded-none text-xs bg-white font-mono uppercase text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
                    placeholder="#8B1E2A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                  Price Override (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={newShadeOverride}
                  onChange={(e) => setNewShadeOverride(e.target.value)}
                  className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={shadingActionLoading}
              className="w-full bg-[#1A1A1A] hover:bg-neutral-850 text-white py-3 font-bold text-xs uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] transition-colors"
            >
              LINK SWATCH TO FORMULA
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

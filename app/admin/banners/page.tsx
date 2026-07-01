'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from '../AdminProvider';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Upload, 
  FileImage, 
  Eye, 
  EyeOff, 
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';

export default function AdminBanners() {
  const { showToast } = useAdmin();

  // Data States
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Form States
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('/products');
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Inline States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setBanners(data);
      } else {
        const mockDb = getMockDatabase();
        setBanners(mockDb.banners);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error syncing hero banners from storage.', 'error');
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isEdit) {
        setEditImageFile(file);
        setEditImageUrl(URL.createObjectURL(file));
      } else {
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl || 'https://picsum.photos/seed/mughalbanner/1920/800';

      if (isSupabaseConfigured()) {
        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `banner_${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
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

        const { error } = await supabase
          .from('banners')
          .insert({
            title,
            subtitle,
            link,
            active,
            image_url: finalImageUrl
          });

        if (error) throw error;
        showToast('Created new active hero banner on Supabase!');
      } else {
        // Sandbox updates
        if (imageFile) {
          finalImageUrl = imageUrl;
        } else {
          finalImageUrl = `https://picsum.photos/seed/mughalbanner_${Math.random().toString(36).substring(2, 6)}/1920/800`;
        }

        const mockDb = getMockDatabase();
        const newBanner = {
          id: 'banner-' + Math.random().toString(36).substring(2, 9),
          title,
          subtitle,
          link,
          active,
          image_url: finalImageUrl,
          created_at: new Date().toISOString()
        };

        mockDb.banners = [newBanner, ...mockDb.banners];
        showToast('Banner added successfully!');
      }

      // Reset Form
      setTitle('');
      setSubtitle('');
      setLink('/products');
      setActive(true);
      setImageFile(null);
      setImageUrl('');
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred registering banner.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (banner: any) => {
    setEditingId(banner.id);
    setEditTitle(banner.title || '');
    setEditSubtitle(banner.subtitle || '');
    setEditLink(banner.link || '/products');
    setEditActive(banner.active);
    setEditImageUrl(banner.image_url || '');
    setEditImageFile(null);
  };

  const handleSaveEdit = async (id: string) => {
    setSubmitting(true);
    try {
      let finalImageUrl = editImageUrl;

      if (isSupabaseConfigured()) {
        if (editImageFile) {
          const fileExt = editImageFile.name.split('.').pop();
          const fileName = `banner_${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, editImageFile);

          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          finalImageUrl = publicUrl;
        }

        const { error } = await supabase
          .from('banners')
          .update({
            title: editTitle,
            subtitle: editSubtitle,
            link: editLink,
            active: editActive,
            image_url: finalImageUrl
          })
          .eq('id', id);

        if (error) throw error;
        showToast('Banner parameters updated on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        mockDb.banners = mockDb.banners.map((b: any) => 
          b.id === id 
            ? { 
                ...b, 
                title: editTitle, 
                subtitle: editSubtitle, 
                link: editLink, 
                active: editActive, 
                image_url: finalImageUrl 
              } 
            : b
        );
        showToast('Banner updated.');
      }
      setEditingId(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred updating banner.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: any) => {
    const nextActive = !banner.active;
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('banners')
          .update({ active: nextActive })
          .eq('id', banner.id);

        if (error) throw error;
        showToast(`Banner status updated to: ${nextActive ? 'ACTIVE' : 'INACTIVE'}`);
      } else {
        const mockDb = getMockDatabase();
        mockDb.banners = mockDb.banners.map((b: any) => 
          b.id === banner.id ? { ...b, active: nextActive } : b
        );
        showToast(`Status updated to: ${nextActive ? 'ACTIVE' : 'INACTIVE'}`);
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast('Error toggling banner status.', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homepage hero banner? This is permanent.')) return;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (error) throw error;
        showToast('Banner successfully deleted.');
      } else {
        const mockDb = getMockDatabase();
        mockDb.banners = mockDb.banners.filter((b: any) => b.id !== id);
        showToast('Banner deleted.');
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast('Error unlinking banner.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="border-b border-stone-200 pb-5 text-left">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#8B1E2A] flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-[#C5A059]" />
          Banners
        </h1>
        <p className="text-xs text-[#554D4D] font-light">
          Manage homepage banner slides and promotions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Add Banner Form (5 Cols) */}
        <form onSubmit={handleAddBanner} className="lg:col-span-5 bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-4 text-left">
          <div className="pb-3 border-b-2 border-dashed border-[#D4CBB3] flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-[#C5A059]" />
            <h3 className="font-heading text-sm font-bold uppercase text-[#8B1E2A] tracking-wider">
              Add Banner
            </h3>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Banner Headline Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Imperial Colours Fit for Royalty"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Sub-headline / Supporting Message
            </label>
            <textarea
              rows={3}
              required
              placeholder="Experience the timeless grandeur of royal courts. Our luxury silk wall emulsions bring flawless sheen directly to your walls..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
                Button CTA Link URL
              </label>
              <input
                type="text"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A] font-mono"
              />
            </div>

            <div className="flex flex-col justify-center items-start pl-2">
              <label className="text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5 block">
                Active Visibility
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-[#D4CBB3] text-[#8B1E2A] focus:ring-0 cursor-pointer"
                />
                Show on homepage
              </label>
            </div>
          </div>

          {/* Banner background file selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Banner Background Image
            </label>
            <div className="border-2 border-dashed border-[#D4CBB3] p-4 flex flex-col items-center justify-center bg-stone-50/50 hover:bg-stone-50 transition-colors text-center relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, false)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imageUrl ? (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-24 h-12 border border-[#D4CBB3] overflow-hidden">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                    <FileImage className="w-3.5 h-3.5" />
                    IMAGE STAGED FOR HERO SLIDE
                  </span>
                </div>
              ) : (
                <div className="space-y-1 text-stone-500">
                  <Upload className="w-6 h-6 text-[#C5A059] mx-auto mb-1" />
                  <p className="text-xs font-bold uppercase tracking-wider">Upload Slider Image</p>
                  <p className="text-[9px] font-light">Recommended Aspect: ~21:9 (1920x800)</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8B1E2A] text-white py-3.5 font-bold text-xs uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:bg-stone-300 transition-colors"
          >
            {submitting ? 'COMMITTING...' : 'FORGE HOMEPAGE BANNER'}
          </button>
        </form>

        {/* Right Column: Banners Visual list (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <h3 className="font-heading text-lg font-bold text-[#1A1A1A] pb-2 border-b-2 border-dashed border-[#D4CBB3] uppercase tracking-wider">
            Active Slider Catalog ({banners.length})
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent animate-spin mb-2" />
              <p className="text-[10px] font-mono uppercase text-[#8B1E2A] font-bold">Syncing sliders...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 bg-white border-2 border-dashed border-[#D4CBB3] text-stone-400 text-xs font-bold uppercase tracking-wider font-mono">
              No banners registered
            </div>
          ) : (
            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-1">
              {banners.map((banner) => {
                const isEditing = editingId === banner.id;
                return (
                  <div 
                    key={banner.id} 
                    className={`bg-white border-2 p-5 shadow-sm space-y-4 relative ${
                      banner.active ? 'border-[#C5A059]' : 'border-stone-300 opacity-80'
                    }`}
                  >
                    {/* Visual Stamp active status */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`px-2.5 py-1 text-[9px] font-extrabold uppercase font-mono border ${
                          banner.active 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                            : 'bg-stone-50 border-stone-300 text-stone-500'
                        }`}
                        title="Toggle active visibility"
                      >
                        {banner.active ? '● LIVE ACTIVE' : '○ HIDDEN'}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 bg-white border border-stone-200 transition-colors"
                        title="Delete banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit Form / Details */}
                    {isEditing ? (
                      <div className="space-y-3.5 text-left pt-2">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">Headline</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-2 border border-[#D4CBB3] text-xs bg-white text-neutral-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">Supporting Message</label>
                          <textarea
                            rows={2}
                            value={editSubtitle}
                            onChange={(e) => setEditSubtitle(e.target.value)}
                            className="w-full p-2 border border-[#D4CBB3] text-xs bg-white text-neutral-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">CTA Link</label>
                            <input
                              type="text"
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              className="w-full p-2 border border-[#D4CBB3] text-xs bg-white font-mono text-neutral-800"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-5">
                            <input
                              type="checkbox"
                              id={`edit-active-${banner.id}`}
                              checked={editActive}
                              onChange={(e) => setEditActive(e.target.checked)}
                              className="w-4.5 h-4.5 text-[#8B1E2A] border-[#D4CBB3] cursor-pointer"
                            />
                            <label htmlFor={`edit-active-${banner.id}`} className="text-xs text-neutral-700 font-bold cursor-pointer">
                              Active visibility
                            </label>
                          </div>
                        </div>

                        {/* Edit Image Upload */}
                        <div>
                          <label className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider mb-1">Background Image</label>
                          <div className="flex gap-3 items-center">
                            <div className="w-20 h-10 border border-stone-200 overflow-hidden shrink-0">
                              <img src={editImageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="border-2 border-dashed border-[#D4CBB3] p-1.5 flex-1 relative text-center hover:bg-stone-50 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, true)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <span className="text-[9px] font-bold text-[#8B1E2A] uppercase tracking-wider flex items-center justify-center gap-1">
                                <Upload className="w-3 h-3" /> Upload replacement image
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(banner.id)}
                            className="flex-1 bg-emerald-600 text-white py-2 font-bold text-[10px] tracking-wider uppercase transition-colors rounded-none"
                          >
                            SAVE CHANGES
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 border border-stone-300 text-stone-600 py-2 font-bold text-[10px] tracking-wider uppercase hover:bg-stone-50 transition-colors rounded-none"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {/* Live layout rendering preview container */}
                        <div className="w-full h-36 bg-stone-900 border border-neutral-800 overflow-hidden relative shadow-inner">
                          <img 
                            src={banner.image_url} 
                            alt="" 
                            className="w-full h-full object-cover opacity-60 absolute inset-0"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-center text-left text-white max-w-sm">
                            <h4 className="text-sm font-serif font-bold tracking-wide text-[#FAF6EE] leading-snug">
                              {banner.title}
                            </h4>
                            <p className="text-[9px] text-stone-300 font-light line-clamp-2 mt-1 leading-relaxed">
                              {banner.subtitle}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold text-[#C5A059] uppercase mt-2.5">
                              <LinkIcon className="w-2.5 h-2.5" /> Link: {banner.link}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(banner)}
                            className="flex-1 border-2 border-[#D4CBB3] bg-white text-[#8B1E2A] py-2 font-bold text-[10px] tracking-wider uppercase hover:bg-stone-50 transition-colors flex items-center justify-center gap-1 font-mono"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#C5A059]" />
                            Edit Parameters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

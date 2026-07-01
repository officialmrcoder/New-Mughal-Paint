'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from '../AdminProvider';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Search,
  Sparkles
} from 'lucide-react';

export default function AdminCategories() {
  const { showToast } = useAdmin();
  
  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Row State (Inline)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        if (data) setCategories(data);
      } else {
        const mockDb = getMockDatabase();
        setCategories(mockDb.categories);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error syncing categories.', 'error');
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate URL friendly slug from name
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/\s+/g, '-') // collapse whitespace to dashes
        .replace(/-+/g, '-') // collapse multiple dashes
    );
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      showToast('Name and Slug parameters are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('categories')
          .insert({ name, slug });

        if (error) throw error;
        showToast('Created new royal collection on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        const newCat = {
          id: 'cat-' + Math.random().toString(36).substring(2, 9),
          name,
          slug
        };
        mockDb.categories = [...mockDb.categories, newCat];
        showToast('Category created successfully!');
      }

      setName('');
      setSlug('');
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error creating category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName || !editSlug) {
      showToast('Name and slug are required fields.', 'error');
      return;
    }

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('categories')
          .update({ name: editName, slug: editSlug })
          .eq('id', id);

        if (error) throw error;
        showToast('Collection parameters updated on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        mockDb.categories = mockDb.categories.map((c: any) => 
          c.id === id ? { ...c, name: editName, slug: editSlug } : c
        );
        showToast('Category updated.');
      }
      setEditingId(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error saving collection edit.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete the "${catName}" collection? This could affect products referencing it.`)) return;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        showToast('Collection successfully deleted.');
      } else {
        const mockDb = getMockDatabase();
        mockDb.categories = mockDb.categories.filter((c: any) => c.id !== id);
        showToast('Category deleted.');
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred while deleting.', 'error');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="border-b border-stone-200 pb-5 text-left">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#8B1E2A] flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#C5A059]" />
          Categories
        </h1>
        <p className="text-xs text-[#554D4D] font-light">
           Manage product categories like Interior, Exterior, Wood Finish, etc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Add Category Form (5 Cols) */}
        <form onSubmit={handleAddCategory} className="lg:col-span-5 bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-4 text-left">
          <div className="pb-3 border-b-2 border-dashed border-[#D4CBB3] flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-[#C5A059]" />
            <h3 className="font-heading text-sm font-bold uppercase text-[#8B1E2A] tracking-wider">
              Add New Category
            </h3>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Collection Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Silk Emulsions"
              value={name}
              onChange={handleNameChange}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Slug URL Tag (Auto-generated)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. royal-silk-emulsions"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-[#FAF8F5] text-neutral-800 font-mono focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8B1E2A] text-white py-3 font-bold text-xs uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:bg-stone-300 transition-colors"
          >
            {submitting ? 'Saving...' : 'Add Category'}
          </button>
        </form>

        {/* Right Column: Categories List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 text-left">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-[#D4CBB3] text-xs bg-white rounded-none focus:outline-none focus:border-[#8B1E2A] text-neutral-800"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent animate-spin mb-2" />
              <p className="text-[10px] font-mono uppercase text-[#8B1E2A] font-bold">Syncing collections...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-white border-2 border-dashed border-[#D4CBB3] text-stone-400 text-xs font-bold uppercase tracking-wider font-mono">
              No collections found
            </div>
          ) : (
            <div className="bg-white border-2 border-[#D4CBB3] shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b-2 border-[#D4CBB3] text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest">
                    <th className="py-3 px-4">Collection Title</th>
                    <th className="py-3 px-4">URL Tag (Slug)</th>
                    <th className="py-3 px-4 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4CBB3]/40 text-xs text-neutral-700">
                  {filteredCategories.map((cat) => {
                    const isEditing = editingId === cat.id;
                    return (
                      <tr key={cat.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800"
                            />
                          ) : (
                            <span className="font-bold text-neutral-850">{cat.name}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] font-bold text-stone-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 font-mono"
                            />
                          ) : (
                            <span>/{cat.slug}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(cat.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-none bg-white transition-colors"
                                title="Save changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 text-stone-500 hover:bg-stone-50 border border-stone-200 rounded-none bg-white transition-colors"
                                title="Cancel edit"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleStartEdit(cat)}
                                className="p-1.5 text-stone-600 hover:text-[#8B1E2A] hover:bg-[#8B1E2A]/5 border border-transparent hover:border-stone-200 transition-all rounded-none"
                                title="Edit collection parameters"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-none border border-transparent hover:border-red-100 transition-all"
                                title="Delete collection"
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
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdmin } from '../AdminProvider';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Search,
  Phone,
  Building,
  Sparkles
} from 'lucide-react';

export default function AdminDealers() {
  const { showToast } = useAdmin();

  // Data States
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Form States
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Row States (Inline)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editContact, setEditContact] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('dealers').select('*');
        if (error) throw error;
        if (data) setDealers(data);
      } else {
        const mockDb = getMockDatabase();
        setDealers(mockDb.dealers);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error syncing dealers list.', 'error');
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

  const handleAddDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !address || !contact) {
      showToast('All fields are required to register a dealer.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('dealers')
          .insert({ name, city, address, contact });

        if (error) throw error;
        showToast('Registered new dealer on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        const newDealer = {
          id: 'deal-' + Math.random().toString(36).substring(2, 9),
          name,
          city,
          address,
          contact
        };
        mockDb.dealers = [...mockDb.dealers, newDealer];
        showToast('Dealer added successfully!');
      }

      // Reset
      setName('');
      setCity('');
      setAddress('');
      setContact('');
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error creating dealer entry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (deal: any) => {
    setEditingId(deal.id);
    setEditName(deal.name);
    setEditCity(deal.city);
    setEditAddress(deal.address);
    setEditContact(deal.contact);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName || !editCity || !editAddress || !editContact) {
      showToast('All fields are required to update a dealer.', 'error');
      return;
    }

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('dealers')
          .update({ name: editName, city: editCity, address: editAddress, contact: editContact })
          .eq('id', id);

        if (error) throw error;
        showToast('Dealer directory parameters updated on Supabase!');
      } else {
        const mockDb = getMockDatabase();
        mockDb.dealers = mockDb.dealers.map((d: any) => 
          d.id === id 
            ? { ...d, name: editName, city: editCity, address: editAddress, contact: editContact } 
            : d
        );
        showToast('Dealer updated.');
      }
      setEditingId(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error saving dealer edit.', 'error');
    }
  };

  const handleDeleteDealer = async (id: string, dealName: string) => {
    if (!confirm(`Are you sure you want to delete dealer "${dealName}" from the network?`)) return;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('dealers').delete().eq('id', id);
        if (error) throw error;
        showToast('Dealer successfully unlinked.');
      } else {
        const mockDb = getMockDatabase();
        mockDb.dealers = mockDb.dealers.filter((d: any) => d.id !== id);
        showToast('Dealer deleted.');
      }
      loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error occurred while unlinking dealer.', 'error');
    }
  };

  const filteredDealers = dealers.filter((d) => {
    return (
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="border-b border-stone-200 pb-5 text-left">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#8B1E2A] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#C5A059]" />
            Dealers
          </h1>
          <p className="text-xs text-[#554D4D] font-light">
            Manage authorized dealers, contact info, and coverage cities.
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Add Dealer Form (5 Cols) */}
        <form onSubmit={handleAddDealer} className="lg:col-span-5 bg-white border-2 border-[#D4CBB3] p-6 shadow-sm space-y-4 text-left">
          <div className="pb-3 border-b-2 border-dashed border-[#D4CBB3] flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-[#C5A059]" />
            <h3 className="font-heading text-sm font-bold uppercase text-[#8B1E2A] tracking-wider">
              Add Dealer
            </h3>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Shop / Dealer Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shalimar Paints Lahore"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              City
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lahore, Karachi, Islamabad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Contact Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +92 42 37654321"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A] font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest mb-1.5">
              Physical Street Address
            </label>
            <textarea
              rows={3}
              required
              placeholder="Circular Road, Near Lahori Gate..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 border-2 border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8B1E2A] text-white py-3 font-bold text-xs uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:bg-stone-300 transition-colors"
          >
            {submitting ? 'COMMITTING...' : 'REGISTER DEALER'}
          </button>
        </form>

        {/* Right Column: Dealers List Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 text-left">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active dealer network by name, city, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-[#D4CBB3] text-xs bg-white rounded-none focus:outline-none focus:border-[#8B1E2A] text-neutral-800"
            />
          </div>

          {/* Table list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent animate-spin mb-2" />
              <p className="text-[10px] font-mono uppercase text-[#8B1E2A] font-bold">Syncing dealers network...</p>
            </div>
          ) : filteredDealers.length === 0 ? (
            <div className="text-center py-12 bg-white border-2 border-dashed border-[#D4CBB3] text-stone-400 text-xs font-bold uppercase tracking-wider font-mono">
              No dealers found
            </div>
          ) : (
            <div className="bg-white border-2 border-[#D4CBB3] shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b-2 border-[#D4CBB3] text-[10px] font-bold text-[#8B1E2A] uppercase tracking-widest">
                    <th className="py-3 px-4">Dealer shop details</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Direct Contact</th>
                    <th className="py-3 px-4">Street Address</th>
                    <th className="py-3 px-4 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4CBB3]/40 text-xs text-neutral-700">
                  {filteredDealers.map((deal) => {
                    const isEditing = editingId === deal.id;
                    return (
                      <tr key={deal.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-neutral-850">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800"
                            />
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              {deal.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editCity}
                              onChange={(e) => setEditCity(e.target.value)}
                              className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800"
                            />
                          ) : (
                            <span className="inline-block px-2 py-0.5 border border-[#C5A059]/30 bg-[#C5A059]/5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8B1E2A]">
                              {deal.city}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] font-semibold text-neutral-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editContact}
                              onChange={(e) => setEditContact(e.target.value)}
                              className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800 font-mono"
                            />
                          ) : (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                              {deal.contact}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs font-light text-stone-600 truncate" title={deal.address}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              className="w-full p-1.5 border border-[#D4CBB3] rounded-none text-xs bg-white text-neutral-800"
                            />
                          ) : (
                            <span>{deal.address}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(deal.id)}
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
                                onClick={() => handleStartEdit(deal)}
                                className="p-1.5 text-stone-600 hover:text-[#8B1E2A] hover:bg-[#8B1E2A]/5 border border-transparent hover:border-stone-200 transition-all rounded-none"
                                title="Edit shop info"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDealer(deal.id, deal.name)}
                                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-none border border-transparent hover:border-red-100 transition-all"
                                title="Delete dealer"
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

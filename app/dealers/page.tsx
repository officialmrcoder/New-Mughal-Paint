'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Search, MapPin, Phone, Store, Navigation } from 'lucide-react';

export default function DealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const loadDealers = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.from('dealers').select('*');
          if (!error && data) {
            setDealers(data);
            const uniqueCities = Array.from(new Set(data.map((d: any) => d.city)));
            setCities(uniqueCities as string[]);
            return;
          }
        } catch (e) {
          console.error('Error fetching dealers from Supabase:', e);
        }
      }

      // Fallback
      const mockDb = getMockDatabase();
      setDealers(mockDb.dealers);
      const uniqueCities = Array.from(new Set(mockDb.dealers.map((d: any) => d.city)));
      setCities(uniqueCities as string[]);
    };

    setTimeout(() => {
      loadDealers();
    }, 0);
  }, []);

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = 
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = selectedCity === 'all' || dealer.city === selectedCity;

    return matchesSearch && matchesCity;
  });

  // Group dealers by city
  const groupedDealers = filteredDealers.reduce((acc: any, dealer: any) => {
    const city = dealer.city;
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(dealer);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Top Header HUD */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#8B1E2A] text-xs font-bold uppercase tracking-widest rounded-none">
            <Store className="w-3.5 h-3.5 text-[#C5A059]" />
            Authorized Paint Centers
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-light italic text-[#1A1A1A]">
            Locate a <span className="text-[#8B1E2A] font-bold not-italic">Mughal Dealer</span>
          </h1>
          <p className="text-sm text-[#554D4D] font-light leading-relaxed">
            Locate our authorized flagship stores and verified dealers across Pakistan to consult certified color advisors, pick up orders, or test real wall samples.
          </p>
        </div>

        {/* Filters and Search Dashboard */}
        <div className="bg-[#F5F1E9] border-2 border-[#D4CBB3] rounded-none p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
              <Search className="h-4 w-4" />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store name or street address..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-[#D4CBB3] rounded-none bg-white text-sm focus:outline-none focus:border-[#8B1E2A]"
            />
          </div>

          {/* City Selector Pills */}
          <div className="md:col-span-7 flex flex-wrap gap-2 justify-start md:justify-end">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-4 py-2 rounded-none text-xs font-bold transition-all border-2 uppercase tracking-wider ${
                selectedCity === 'all'
                  ? 'bg-[#8B1E2A] text-white border-[#8B1E2A]'
                  : 'bg-white text-[#554D4D] border-[#D4CBB3] hover:bg-[#F5F1E9]'
              }`}
            >
              ALL CITIES
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-none text-xs font-bold transition-all border-2 uppercase tracking-wider ${
                  selectedCity === city
                    ? 'bg-[#8B1E2A] text-white border-[#8B1E2A]'
                    : 'bg-white text-[#554D4D] border-[#D4CBB3] hover:bg-[#F5F1E9]'
                }`}
              >
                {city.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dealer Grid Grouped by City */}
        {filteredDealers.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-[#D4CBB3] rounded-none space-y-3">
            <Store className="w-12 h-12 text-[#C5A059] mx-auto stroke-[1.5]" />
            <p className="font-heading text-lg font-semibold text-[#1A1A1A]">No Matching Dealers Found</p>
            <p className="text-xs text-[#554D4D]">Try searching for another key term or change your city filters.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.keys(groupedDealers).sort().map((city) => (
              <div key={city} className="space-y-4 text-left">
                <div className="flex items-center gap-2 border-b-2 border-[#D4CBB3] pb-2">
                  <MapPin className="w-5 h-5 text-[#8B1E2A]" />
                  <h2 className="font-heading text-xl font-bold text-[#1A1A1A] uppercase tracking-wider">
                    {city} <span className="text-xs font-mono font-normal text-[#C5A059] ml-2 font-bold">({groupedDealers[city].length} Center{groupedDealers[city].length > 1 ? 's' : ''})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedDealers[city].map((dealer: any, idx: number) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={dealer.id}
                      className="bg-white border-2 border-[#D4CBB3] rounded-none p-6 relative overflow-hidden transition-all duration-300 hover:border-[#8B1E2A] hover:shadow-md"
                    >
                      {/* Gold accent tag for authorized hallmark */}
                      <div className="absolute top-0 right-0 bg-[#C5A059] text-white text-[9px] font-bold px-3 py-1 rounded-none tracking-widest uppercase border-l border-b border-white/20">
                        AUTHORIZED
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E2A] bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 px-2.5 py-1 rounded-none">
                            {dealer.city.toUpperCase()}
                          </span>
                          <h3 className="font-heading text-lg font-bold text-[#1A1A1A] pt-1.5 line-clamp-1">
                            {dealer.name}
                          </h3>
                        </div>

                        <hr className="border-neutral-100" />

                        <div className="space-y-2.5 text-xs text-[#554D4D] text-left">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                            <span>{dealer.address}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                            <a href={`tel:${dealer.contact}`} className="hover:text-[#8B1E2A] font-semibold transition-colors">
                              {dealer.contact}
                            </a>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <a
                            href={`tel:${dealer.contact}`}
                            className="flex-1 bg-[#F5F1E9] hover:bg-[#EAE7D9] text-[#8B1E2A] py-2 rounded-none text-center text-xs font-bold tracking-widest transition-colors border-2 border-[#D4CBB3]"
                          >
                            CALL CENTER
                          </a>
                          <button
                            onClick={() => alert(`Simulating maps navigation to: ${dealer.name}, ${dealer.city}`)}
                            className="flex-1 bg-[#2C2520] hover:bg-black text-white py-2 rounded-none text-center text-xs font-bold tracking-widest transition-colors flex items-center justify-center gap-1 border-b-2 border-r-2 border-[#C5A059]"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#C5A059]" />
                            DIRECTIONS
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Corporate Partnership Banner */}
        <div className="bg-[#F5F1E9] border-2 border-[#D4CBB3] rounded-none p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h3 className="font-heading text-xl font-bold text-[#8B1E2A]">Become an Authorized Mughal Dealer?</h3>
            <p className="text-xs text-[#554D4D] max-w-2xl font-light leading-relaxed">
              Expand your hardware/decor enterprise by joining the most prestigious paint family in the region. We offer high commission rates, complete digital color machine setup, and continuous marketing support.
            </p>
          </div>
          <button
            onClick={() => alert('Simulated Corporate Application Submitted!')}
            className="bg-[#8B1E2A] text-white px-6 py-3 rounded-none text-xs font-bold tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] shrink-0 transition-all shadow-sm"
          >
            SUBMIT DEALER PROPOSAL
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

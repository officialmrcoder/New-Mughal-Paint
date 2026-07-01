'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { Palette, Award, Shield, History, Users, Layers, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        
        {/* Top Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8B1E2A]/5 border border-[#8B1E2A]/20 text-[#8B1E2A] text-xs font-bold uppercase tracking-widest rounded-none">
            <History className="w-3.5 h-3.5 text-[#C5A059]" />
            ESTABLISHED 1996
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-light italic text-[#1A1A1A]">
            About <span className="text-[#8B1E2A] font-bold not-italic">New Mughal Paint</span>
          </h1>
          <p className="text-sm text-[#554D4D] font-light leading-relaxed">
            Discover the legacy of New Mughal Paint, where historical beauty meets world-class chemical innovation to protect and elevate your spaces.
          </p>
        </div>

        {/* Story Intro Split section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white border-2 border-[#D4CBB3] p-6 sm:p-10 shadow-sm">
          {/* Left Column Text (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="font-heading text-2xl sm:text-3xl font-light italic text-[#1A1A1A]">
              Sourcing Splendour from <span className="text-[#8B1E2A] font-bold not-italic">Subcontinent Monuments</span>
            </h2>
            <div className="h-0.5 bg-gradient-to-r from-[#8B1E2A] to-transparent w-24" />
            
            <p className="text-sm text-[#554D4D] leading-relaxed font-light">
              Since our establishment in 1996, New Mughal Paint has operated with a unique core philosophy: paint is not merely a cover, it is the emotional aura of an architectural monument.
            </p>
            <p className="text-sm text-[#554D4D] leading-relaxed font-light">
              We spent years studying the robust sandstone oxides of the Lahore Fort, the delicate lime-plaster washes of Shalimar Gardens, and the glitter-rich mica formulations that give Sheesh Mahal its legendary brilliance. By capturing these ancient recipes and fusing them with breathable polymers and multi-shield weatherproofing, we created a paint catalog that holds its color depth for years against extreme climates.
            </p>
            <p className="text-xs font-bold font-mono text-[#8B1E2A] uppercase tracking-wider">
              &ldquo;We don&apos;t manufacture buckets. We package imperial aesthetics.&rdquo;
            </p>
          </div>

          {/* Right Column Illustration (5 cols) */}
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-none overflow-hidden border-2 border-[#C5A059]">
            <img 
              src="https://picsum.photos/seed/mughalart/800/600" 
              alt="Mughal Mosaic Ornaments Art"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Three Core Values Bento Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-heading text-xl font-bold uppercase tracking-widest text-[#8B1E2A]">The Mughal Pledge</h3>
            <p className="text-xs text-neutral-400 font-mono">OUR PILLARS OF ROYAL TRUST</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white border-2 border-[#D4CBB3] p-8 text-left space-y-4 hover:border-[#8B1E2A] transition-colors duration-300">
              <div className="w-10 h-10 bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 flex items-center justify-center text-[#8B1E2A]">
                <Palette className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h4 className="font-heading text-lg font-bold text-[#1A1A1A]">Curated Pigmentation</h4>
              <p className="text-xs text-[#554D4D] leading-relaxed font-light">
                Our shades are individually blended in small controlled batches. We never automate chemical mixtures, ensuring that every drop contains the rich tinting strength fit for royalty.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white border-2 border-[#D4CBB3] p-8 text-left space-y-4 hover:border-[#8B1E2A] transition-colors duration-300">
              <div className="w-10 h-10 bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 flex items-center justify-center text-[#8B1E2A]">
                <Shield className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h4 className="font-heading text-lg font-bold text-[#1A1A1A]">Weatherproof Armor</h4>
              <p className="text-xs text-[#554D4D] leading-relaxed font-light">
                Our formulas are built with German Acrylic cross-linking polymers. These form an elastic, breathable shield that resists UV degradation, monsoon dampness, and alkaline chalking.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white border-2 border-[#D4CBB3] p-8 text-left space-y-4 hover:border-[#8B1E2A] transition-colors duration-300">
              <div className="w-10 h-10 bg-[#8B1E2A]/10 border border-[#8B1E2A]/20 flex items-center justify-center text-[#8B1E2A]">
                <Award className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h4 className="font-heading text-lg font-bold text-[#1A1A1A]">Royal Heritage</h4>
              <p className="text-xs text-[#554D4D] leading-relaxed font-light">
                Every purchase contributes to subcontinent monument preservation research. We are proudly Pakistani-owned, keeping the grand artistic traditions alive in modern engineering.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic callout banner */}
        <div className="bg-[#FAF8F5] border-2 border-dashed border-[#D4CBB3] p-8 text-center max-w-3xl mx-auto space-y-4">
          <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto stroke-[1.5]" />
          <h3 className="font-heading text-xl font-bold text-[#1A1A1A]">Experience Our Silk Emulsions</h3>
          <p className="text-xs text-[#554D4D] max-w-md mx-auto leading-relaxed">
            See the difference our small-batch formulation makes. Browse through our catalog to request color cards or secure a premium bucket order.
          </p>
          <div className="pt-2">
            <Link 
              href="/products" 
              className="bg-[#8B1E2A] text-white px-6 py-3 text-xs uppercase tracking-widest font-bold border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors inline-block"
            >
              BROWSE CATALOG
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

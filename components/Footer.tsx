import React from 'react';
import Link from 'next/link';
import { Paintbrush, Phone, Mail, MapPin, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2C2520] text-[#EBE4D5] border-t-4 border-[#C5A059] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C5A059] rotate-45 border border-white shrink-0 flex items-center justify-center">
              <span className="font-serif font-black text-[#8B1E2A] text-sm -rotate-45">NMP</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-[#FAF6EE]">
              New Mughal Paint
            </span>
          </div>
          <p className="text-xs text-[#9E8E81] leading-relaxed">
            Crafting the finest wall emulsions, extreme outdoor shields, and opulent metallic glazes since 1996. Embellish your spaces with colors of Mughal heritage and royal grandeur.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#C5A059] font-semibold">
            <Award className="w-4 h-4" />
            ISO 9001:2015 Certified Paint Technology
          </div>
        </div>

        {/* Categories / Collections */}
        <div className="space-y-4 text-left">
          <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C5A059]">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs text-[#9E8E81]">
            <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
            <li><Link href="/visualizer" className="hover:text-white transition-colors">Visualizer</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/dealers" className="hover:text-white transition-colors">Find a Dealer</Link></li>
          </ul>
        </div>

        {/* Cities */}
        <div className="space-y-4 text-left">
          <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C5A059]">
            Authorized Presence
          </h4>
          <p className="text-xs text-[#9E8E81] leading-relaxed">
            Our luxury paint centers are available in major cities including Lahore, Karachi, Rawalpindi, Islamabad, Faisalabad, and Peshawar.
          </p>
          <Link href="/dealers" className="inline-block text-xs text-[#FAF6EE] font-bold hover:text-[#C5A059] underline underline-offset-4 decoration-[#C5A059]">
            Locate Nearest Store
          </Link>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#C5A059]">
            Grand Headquarters
          </h4>
          <ul className="space-y-3 text-xs text-[#9E8E81]">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8B1E2A] shrink-0" />
              <span>7-A Guldasht Town Zarar Shaheed Road Near Ranger HeadQuarter Lahore Pakistan</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#8B1E2A] shrink-0" />
              <span>+923289467399</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B1E2A] shrink-0" />
              <span>allendedsolutions@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-neutral-800 text-center text-[11px] text-[#9E8E81] flex flex-col sm:flex-row justify-between gap-4">
        <p>© 2026 New Mughal Paint (Pvt) Ltd. All Royal Rights Reserved.</p>
        <p className="tracking-wide">Developed By All Ended Solutions</p>
      </div>
    </footer>
  );
}

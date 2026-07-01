'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService, UserProfile } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AdminProvider } from './AdminProvider';
import { 
  BarChart3, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  MapPin, 
  Image as ImageIcon, 
  ArrowLeft, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  Database
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setAdminUser(user);
      }
      setIsLive(isSupabaseConfigured());
    };
    fetchAdmin();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Dealers', href: '/admin/dealers', icon: MapPin },
    { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1A1A1A] text-neutral-200 border-r-4 border-[#C5A059]">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-neutral-800 bg-[#151515] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-mono font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN PANEL
          </span>
          <h2 className="font-heading text-xl font-bold tracking-wider text-[#FAF6EE]">
            New Mughal <span className="text-[#C5A059]">Paint</span>
          </h2>
          <p className="text-[10px] text-neutral-400 font-light">Management Dashboard</p>
        </div>
      </div>

      {/* Admin Profile Details */}
      <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-none bg-[#C5A059] flex items-center justify-center font-bold text-[#1A1A1A] text-sm shrink-0 uppercase border border-white/20">
          {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-white truncate leading-tight">{adminUser?.name || 'Administrator'}</h4>
          <span className="text-[9px] text-[#C5A059] font-mono tracking-wider block mt-0.5 uppercase">
            {adminUser?.role || 'Admin Role'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wider uppercase transition-all rounded-none border-l-2 ${
                isActive
                  ? 'bg-[#8B1E2A] text-white border-[#C5A059] shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C5A059]' : 'text-neutral-500'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* System Status and Exit Actions */}
      <div className="p-4 border-t border-neutral-800 bg-[#151515] space-y-3">
        {/* Connection status indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800">
          <Database className="w-3.5 h-3.5 text-[#C5A059]" />
          <div className="text-[9px] text-neutral-400 font-mono flex-1 uppercase">
            {isLive ? 'Supabase Live' : 'Local Storage'}
          </div>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold text-[#C5A059] bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors uppercase tracking-wider text-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold text-[#8B1E2A] bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors uppercase tracking-wider text-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#FDFBF7] text-[#2D2424] flex overflow-hidden">
        {/* Desktop Sidebar (Persistent) */}
        <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-20">
          {sidebarContent}
        </aside>

        {/* Mobile Header & Sidebar Drawers */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <header className="lg:hidden bg-[#1A1A1A] text-white px-4 py-3.5 flex items-center justify-between border-b-4 border-[#C5A059] sticky top-0 z-30 shadow-md">
            <Link href="/admin" className="font-heading text-lg font-bold tracking-wider text-[#FAF6EE] flex items-center gap-2">
              <span className="text-[#C5A059] font-mono font-extrabold text-xs border border-[#C5A059]/30 px-1.5 py-0.5">MUGHAL</span>
              Admin
            </Link>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 text-neutral-300 hover:text-white"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </header>

          {/* Mobile Sidebar overlay drawer */}
          {isMobileOpen && (
            <div className="fixed inset-0 z-40 lg:hidden flex">
              {/* Back backdrop */}
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsMobileOpen(false)}
              />
              <div className="relative w-64 max-w-xs h-full z-10 animate-in slide-in-from-left duration-250">
                {sidebarContent}
              </div>
            </div>
          )}

          {/* Main Dashboard Workspace area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}

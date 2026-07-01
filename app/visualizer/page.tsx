'use client';

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { getMockDatabase, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { cartService } from '@/lib/cart';
import { authService } from '@/lib/auth';
import { 
  Palette, 
  Paintbrush, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  Info,
  Eye,
  RefreshCw,
  Sliders
} from 'lucide-react';

const ROOMS = [
  {
    id: 'living',
    name: 'Living Room Wall',
    imageUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80',
    wallPolygon: [
      { x: 0, y: 0 },
      { x: 800, y: 0 },
      { x: 800, y: 380 },
      { x: 0, y: 380 }
    ],
    description: 'Paint the back wall of a luxurious, sun-drenched Mughal-inspired modern salon.'
  },
  {
    id: 'bedroom',
    name: 'Bedroom Wall',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
    wallPolygon: [
      { x: 0, y: 0 },
      { x: 800, y: 0 },
      { x: 800, y: 340 },
      { x: 0, y: 340 }
    ],
    description: 'Customize the main accent wall behind a premium imperial canopy bed.'
  },
  {
    id: 'exterior',
    name: 'Exterior Wall',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    wallPolygon: [
      { x: 120, y: 40 },
      { x: 680, y: 40 },
      { x: 680, y: 440 },
      { x: 120, y: 440 }
    ],
    description: 'Embellish the grand front stucco facade with weather-resistant fortress formulas.'
  },
  {
    id: 'ceiling',
    name: 'Ceiling',
    imageUrl: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
    wallPolygon: [
      { x: 100, y: 10 },
      { x: 700, y: 10 },
      { x: 620, y: 220 },
      { x: 180, y: 220 }
    ],
    description: 'Transform the tray ceiling border with custom tinted gold and royal shades.'
  }
];

function VisualizerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [shades, setShades] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Visualizer states
  const [activeRoom, setActiveRoom] = useState<string>('living');
  const [activeColor, setActiveColor] = useState('#8B1E2A'); // Default Mughal Maroon
  const [activeColorName, setActiveColorName] = useState('Mughal Maroon');
  const [linkedProduct, setLinkedProduct] = useState<any>(null);

  // Canvas drawing & states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasLoading, setCanvasLoading] = useState(false);

  // Cart helper states
  const [quantity, setQuantity] = useState(1);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  // Load catalog
  useEffect(() => {
    const loadCatalog = async () => {
      let fetchedProducts: any[] = [];
      let fetchedShades: any[] = [];

      // Check current user
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (isSupabaseConfigured()) {
        try {
          const [prodRes, shadeRes] = await Promise.all([
            supabase.from('products').select('*'),
            supabase.from('product_shades').select('*')
          ]);
          if (!prodRes.error && prodRes.data) fetchedProducts = prodRes.data;
          if (!shadeRes.error && shadeRes.data) fetchedShades = shadeRes.data;
        } catch (e) {
          console.error('Error fetching visualizer dataset:', e);
        }
      }

      if (fetchedProducts.length === 0 || fetchedShades.length === 0) {
        const mockDb = getMockDatabase();
        fetchedProducts = mockDb.products;
        fetchedShades = mockDb.shades;
      }

      setProducts(fetchedProducts);
      setShades(fetchedShades);

      // Pre-select color using query param (color_code or color)
      const colorQuery = searchParams.get('color') || searchParams.get('color_code');
      
      if (colorQuery) {
        const decoded = decodeURIComponent(colorQuery);
        setActiveColor(decoded);
        
        // Find shade name if it matches our list
        const matchedShade = fetchedShades.find(
          s => s.color_code.toLowerCase() === decoded.toLowerCase()
        );
        if (matchedShade) {
          setActiveColorName(matchedShade.shade_name);
          const matchedProd = fetchedProducts.find(p => p.id === matchedShade.product_id);
          setLinkedProduct(matchedProd);
        } else {
          setActiveColorName('Mughal Custom Tint');
          setLinkedProduct(null);
        }
      } else if (fetchedShades.length > 0) {
        // Fallback to first shade in catalog
        setActiveColor(fetchedShades[0].color_code);
        setActiveColorName(fetchedShades[0].shade_name);
        const matchedProd = fetchedProducts.find(p => p.id === fetchedShades[0].product_id);
        setLinkedProduct(matchedProd);
      }
    };

    loadCatalog();
  }, [searchParams]);

  // Handle shade selection change
  const handleSelectShade = (shade: any) => {
    setActiveColor(shade.color_code);
    setActiveColorName(shade.shade_name);
    const prod = products.find(p => p.id === shade.product_id);
    setLinkedProduct(prod);
    setCartSuccess(null);
    setCartError(null);
  };

  // Add the visualized product directly to cart
  const handleAddToCart = async () => {
    setCartSuccess(null);
    setCartError(null);

    if (!currentUser) {
      router.push(`/login?redirect=/visualizer?color=${encodeURIComponent(activeColor)}`);
      return;
    }

    // Try to find the active shade object to get its ID
    const activeShadeObj = shades.find(
      s => s.color_code.toLowerCase() === activeColor.toLowerCase()
    );

    if (!activeShadeObj || !linkedProduct) {
      setCartError('This custom mix color is not registered to a buyable product bucket.');
      return;
    }

    try {
      await cartService.addToCart(currentUser.id, linkedProduct.id, activeShadeObj.id, quantity);
      setCartSuccess(`Added ${quantity}x ${linkedProduct.name} (${activeColorName}) to your royal cart!`);
    } catch (e: any) {
      setCartError(e.message || 'Error updating cart state.');
    }
  };

  // Live Canvas Rendering with composite blend overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const room = ROOMS.find(r => r.id === activeRoom) || ROOMS[0];
    setCanvasLoading(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = room.imageUrl;

    img.onload = () => {
      setCanvasLoading(false);
      
      // Set logical dimensions
      canvas.width = 800;
      canvas.height = 500;

      // Draw the raw background image
      ctx.drawImage(img, 0, 0, 800, 500);

      // Save context state for clipping mask
      ctx.save();
      
      // Build the path for the wall polygon mask
      ctx.beginPath();
      const poly = room.wallPolygon;
      ctx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i].x, poly[i].y);
      }
      ctx.closePath();

      // Clip drawing operations to only cover the wall mask
      ctx.clip();

      // Configure composite 'multiply' mode
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = activeColor;
      
      // Draw transparent color layer - allows textures, highlights, and shadows to pierce through beautifully!
      ctx.globalAlpha = 0.72;
      ctx.fillRect(0, 0, 800, 500);
      
      // Restore state to normal
      ctx.restore();
    };

    img.onerror = () => {
      setCanvasLoading(false);
      // Fallback block if Unsplash fails to fetch
      canvas.width = 800;
      canvas.height = 500;
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(0, 0, 800, 500);
      ctx.fillStyle = activeColor;
      ctx.fillRect(150, 100, 500, 300);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px serif';
      ctx.fillText(`Could not load texture. Displaying ${activeColorName} directly.`, 200, 260);
    };
  }, [activeRoom, activeColor, activeColorName]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Title HUD */}
        <div className="text-center max-w-2xl mx-auto space-y-3" id="title-hud">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#8B1E2A] text-xs font-bold uppercase tracking-widest rounded-none">
            <Paintbrush className="w-3.5 h-3.5 text-[#C5A059]" />
            Imperial Paint Studio
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-light italic text-[#1A1A1A]">
            The Mughal <span className="text-[#8B1E2A] font-bold not-italic">Color Visualizer</span>
          </h1>
          <p className="text-sm text-[#554D4D] font-light leading-relaxed">
            Test any shade from our royal catalog in real-time. Pick a room design, select your shade, and see the wall instantly painted while preserving realistic textures and lighting.
          </p>
        </div>

        {/* 1. Selectable Room Thumbnails */}
        <div className="space-y-4" id="room-selection-container">
          <h3 className="font-heading text-xs font-bold text-[#8B1E2A] uppercase tracking-widest border-l-4 border-[#C5A059] pl-3">
            Step 1: Choose Your Canvas Environment
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ROOMS.map((room) => {
              const isSelected = activeRoom === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    setActiveRoom(room.id);
                    setCartSuccess(null);
                    setCartError(null);
                  }}
                  className={`group relative flex flex-col items-stretch text-left border-2 overflow-hidden transition-all duration-300 ${
                    isSelected
                      ? 'border-[#8B1E2A] ring-2 ring-[#C5A059]/50 shadow-md bg-[#FAF4E7]'
                      : 'border-[#D4CBB3] bg-white hover:border-[#8B1E2A]/70'
                  }`}
                  id={`room-thumb-${room.id}`}
                >
                  <div className="aspect-[16/10] relative w-full overflow-hidden bg-neutral-100">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#8B1E2A] text-white p-1 rounded-full border border-[#C5A059] shadow">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      {room.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      {room.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="visualizer-workspace">
          
          {/* Left Column: Interactive Canvas Wall Rendering & Detail Controls */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Room Canvas Container */}
            <div className="bg-neutral-100 border-2 border-[#D4CBB3] rounded-none aspect-[16/10] relative overflow-hidden flex items-center justify-center shadow-md">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full object-cover bg-neutral-200"
                id="shahi-painting-canvas"
              />

              {canvasLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
                  <RefreshCw className="w-8 h-8 text-[#8B1E2A] animate-spin" />
                  <p className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Painting virtual surface...</p>
                </div>
              )}

              {/* HUD Banner Overlay */}
              <div className="absolute top-4 left-4 right-4 bg-black/75 backdrop-blur-md p-3 border-2 border-[#C5A059] flex justify-between items-center text-white text-xs z-10 rounded-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold tracking-wider uppercase font-mono text-[9px]">Live WebGL Shader</span>
                </div>
                <p className="font-heading font-medium text-[#C5A059] text-xs">
                  {activeColorName} ({activeColor.toUpperCase()})
                </p>
              </div>
            </div>

            {/* 4. Details Action Panel below Canvas */}
            <div className="bg-white border-2 border-[#D4CBB3] p-6 text-left space-y-6 shadow-sm" id="detail-actions-panel">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4CBB3]/40 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-5 h-5 border border-black/25 inline-block shadow-inner"
                      style={{ backgroundColor: activeColor }}
                    />
                    <h3 className="font-heading text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">
                      {activeColorName}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">
                    Hex Code: {activeColor} • {linkedProduct ? linkedProduct.name : 'Custom Imperial Tint'}
                  </p>
                </div>

                {linkedProduct && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-mono font-bold">Bucket Price</p>
                    <p className="text-xl font-black text-[#8B1E2A] font-mono">
                      PKR {((shades.find(s => s.color_code.toLowerCase() === activeColor.toLowerCase())?.price_override ?? linkedProduct.base_price)).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {linkedProduct ? (
                <div className="space-y-4">
                  <p className="text-xs text-[#554D4D] font-light leading-relaxed">
                    This royal shade is part of our <span className="font-semibold text-[#8B1E2A]">{linkedProduct.name}</span> formulation, designed for premium wall elegance and historical authenticity.
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Quantity selectors */}
                    <div className="flex items-center border-2 border-[#D4CBB3] bg-white rounded-none shrink-0 self-start sm:self-auto h-12">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="px-3 h-full hover:bg-[#FAF8F5] transition-colors border-r border-[#D4CBB3]"
                        id="qty-minus"
                      >
                        <Minus className="w-3 h-3 text-[#554D4D]" />
                      </button>
                      <span className="px-5 font-mono font-bold text-xs text-[#1A1A1A]">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="px-3 h-full hover:bg-[#FAF8F5] transition-colors border-l border-[#D4CBB3]"
                        id="qty-plus"
                      >
                        <Plus className="w-3 h-3 text-[#554D4D]" />
                      </button>
                    </div>

                    {/* View Product Details */}
                    <a
                      href={`/products/${linkedProduct.id}`}
                      className="flex-1 border-2 border-[#8B1E2A] text-[#8B1E2A] h-12 font-bold tracking-widest text-[11px] uppercase hover:bg-[#8B1E2A]/5 transition-colors flex items-center justify-center gap-1.5"
                      id="btn-view-product"
                    >
                      <Eye className="w-4 h-4" />
                      VIEW DETAILS
                    </a>

                    {/* Add directly to Cart */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-[#8B1E2A] text-white h-12 font-bold tracking-widest text-[11px] uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] transition-colors flex items-center justify-center gap-1.5"
                      id="btn-add-to-cart"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                      ADD DISPATCH
                    </button>
                  </div>

                  {cartSuccess && (
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-[11px] font-semibold" id="cart-success-msg">
                      {cartSuccess}
                    </div>
                  )}
                  {cartError && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[11px] font-semibold" id="cart-error-msg">
                      {cartError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#FAF8F5] border border-[#D4CBB3] text-xs text-[#554D4D] font-light leading-relaxed">
                  <Info className="w-4 h-4 text-[#C5A059] inline mr-1.5 shrink-0 stroke-[2]" />
                  Mixing custom hex codes is perfect for trying out colors. To purchase paint bucket formulations, please select a registered Mughal shade from the swatches palette.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Palette selection & Custom Lab */}
          <div className="lg:col-span-5 bg-[#F5F1E9] border-2 border-[#D4CBB3] p-6 flex flex-col justify-between space-y-6 shadow-sm">
            
            <div className="space-y-6">
              <h3 className="font-heading text-base font-bold text-[#8B1E2A] pb-3 border-b-2 border-[#D4CBB3] flex items-center gap-2 uppercase tracking-widest text-left" id="shades-panel-header">
                <Palette className="w-5 h-5 text-[#C5A059]" />
                Select Palace Shade
              </h3>

              {/* Palette List Grid */}
              <div className="space-y-2.5 text-left" id="shades-grid-container">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#554D4D] font-mono">
                  Curated Historical Catalog ({shades.length} Shades)
                </span>
                
                <div className="grid grid-cols-2 gap-2.5 max-h-[310px] overflow-y-auto pr-1">
                  {shades.map((sh) => {
                    const isSelected = activeColor.toLowerCase() === sh.color_code.toLowerCase();
                    const prod = products.find(p => p.id === sh.product_id);
                    return (
                      <button
                        key={sh.id}
                        onClick={() => handleSelectShade(sh)}
                        className={`flex items-center gap-2 p-2 rounded-none bg-white border-2 text-left transition-all hover:bg-[#FDFBF7] ${
                          isSelected 
                            ? 'border-[#8B1E2A] bg-[#FAF8F5] ring-1 ring-[#8B1E2A]/20 shadow-sm' 
                            : 'border-[#D4CBB3]'
                        }`}
                        id={`shade-button-${sh.id}`}
                      >
                        <span 
                          className="w-6.5 h-6.5 rounded-none border border-black/15 shrink-0 block relative flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: sh.color_code }}
                        >
                          {isSelected && <Check className={`w-4 h-4 ${
                            sh.color_code.toLowerCase() === '#fdfbf7' || sh.color_code.toLowerCase() === '#faf8f5' || sh.color_code.toLowerCase() === '#faf0e6' ? 'text-black' : 'text-white'
                          }`} />}
                        </span>
                        
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black text-[#1A1A1A] truncate leading-tight uppercase">{sh.shade_name}</p>
                          <p className="text-[8px] text-[#C5A059] uppercase font-mono font-bold mt-0.5 truncate">{prod?.name || 'Mughal Blend'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formulation specs */}
              <div className="bg-white p-4 border-2 border-[#D4CBB3] rounded-none text-left space-y-3" id="formulation-profile">
                <h4 className="text-[10px] font-bold text-[#8B1E2A] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#C5A059]" />
                  Formula Specifications
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-400">Tint Name:</span>
                    <span className="font-bold text-[#1A1A1A]">{activeColorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-400">Chemical Code:</span>
                    <span className="font-mono font-bold text-[#C5A059] uppercase">{activeColor}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-400">Base Bucket:</span>
                    <span className="font-semibold text-neutral-800 truncate max-w-[200px]">
                      {linkedProduct ? linkedProduct.name : 'Unregistered laboratory mix'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Base Cost:</span>
                    <span className="font-bold text-neutral-800 font-mono">
                      {linkedProduct ? `PKR ${Number(linkedProduct.base_price).toLocaleString()}` : 'N/A (Custom)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual mixing panel */}
              <div className="bg-white border-2 border-[#D4CBB3] p-4 text-left space-y-3" id="rgb-mixing-laboratory">
                <div className="flex justify-between items-center pb-1.5 border-b border-[#D4CBB3]/40">
                  <h4 className="text-[10px] font-bold text-[#8B1E2A] uppercase tracking-wider font-mono">Custom Laboratory Mixer</h4>
                  <span className="text-[9px] font-bold text-[#8B1E2A] bg-[#8B1E2A]/10 px-2 py-0.5 font-mono">{activeColor.toUpperCase()}</span>
                </div>
                
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={activeColor}
                    onChange={(e) => {
                      setActiveColor(e.target.value);
                      setActiveColorName('Mughal Custom Tint');
                      setLinkedProduct(null);
                      setCartSuccess(null);
                      setCartError(null);
                    }}
                    className="w-12 h-10 rounded-none cursor-pointer border-2 border-[#D4CBB3] shrink-0 bg-transparent"
                    id="lab-color-picker"
                  />
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] text-gray-400 font-extrabold uppercase block font-mono">Mix Custom Hue Hex</label>
                    <input 
                      type="text" 
                      value={activeColor.toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          setActiveColor(val);
                          setActiveColorName('Mughal Custom Tint');
                          setLinkedProduct(null);
                          setCartSuccess(null);
                          setCartError(null);
                        }
                      }}
                      placeholder="#8B1E2A"
                      className="text-xs font-mono font-bold text-[#1A1A1A] bg-white border border-[#D4CBB3] p-1.5 focus:outline-none focus:border-[#8B1E2A] w-32 uppercase rounded-none"
                      id="lab-color-hex"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// Main page container with dynamic searchParams loading
export default function VisualizerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-[#8B1E2A] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-[#C5A059] font-bold">Loading Paint Visualizer...</p>
        </main>
        <Footer />
      </div>
    }>
      <VisualizerContent />
    </Suspense>
  );
}

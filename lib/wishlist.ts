import { supabase } from './supabase';
import { emitWishlistUpdated } from './events';

export interface WishlistItem {
  id: string;
  user_id?: string;
  product_id: string;
  shade_id?: string;
  created_at?: string;
  product?: {
    name: string;
    base_price: number;
    image_url: string;
    description: string;
  };
  shade?: {
    shade_name: string;
    color_code: string;
    price_override: number | null;
  };
}

export const wishlistService = {
  async getItems(userId?: string): Promise<WishlistItem[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          user_id,
          product_id,
          shade_id,
          created_at,
          product:products(name, base_price, image_url, description),
          shade:product_shades(shade_name, color_code, price_override)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return (data as unknown as WishlistItem[]) || [];
    } catch (e) {
      console.error('Error fetching wishlist:', e);
      return [];
    }
  },

  async addToWishlist(userId: string | undefined, productId: string, shadeId: string | undefined): Promise<void> {
    if (!userId) return;
    try {
      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('shade_id', shadeId || '')
        .maybeSingle();

      if (existing) return;

      await supabase.from('wishlist_items').insert({
        user_id: userId,
        product_id: productId,
        shade_id: shadeId || null
      });
      emitWishlistUpdated();
    } catch (e) {
      console.error('Error adding to wishlist:', e);
    }
  },

  async removeFromWishlist(id: string, userId?: string): Promise<void> {
    try {
      await supabase.from('wishlist_items').delete().eq('id', id);
      emitWishlistUpdated();
    } catch (e) {
      console.error('Error removing from wishlist:', e);
    }
  },

  async removeFromWishlistByDetails(userId: string | undefined, productId: string, shadeId: string | undefined): Promise<void> {
    if (!userId) return;
    try {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('shade_id', shadeId || '');
      emitWishlistUpdated();
    } catch (e) {
      console.error('Error removing from wishlist by details:', e);
    }
  },

  async isInWishlist(userId: string | undefined, productId: string, shadeId: string | undefined): Promise<boolean> {
    if (!userId) return false;
    try {
      const { data } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('shade_id', shadeId || '')
        .maybeSingle();
      return !!data;
    } catch (e) {
      return false;
    }
  }
};
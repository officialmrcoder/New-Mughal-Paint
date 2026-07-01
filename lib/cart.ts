import { supabase } from './supabase';
import { emitCartUpdated } from './events';

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  shade_id?: string;
  quantity: number;
  product?: {
    name: string;
    base_price: number;
    image_url: string;
  };
  shade?: {
    shade_name: string;
    color_code: string;
    price_override: number | null;
  };
}

export const cartService = {
  async getItems(userId?: string): Promise<CartItem[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          product_id,
          shade_id,
          quantity,
          product:products(name, base_price, image_url),
          shade:product_shades(shade_name, color_code, price_override)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return (data as unknown as CartItem[]) || [];
    } catch (e) {
      console.error('Error fetching cart:', e);
      return [];
    }
  },

  async addToCart(userId: string | undefined, productId: string, shadeId: string | undefined, quantity = 1): Promise<void> {
    if (!userId) return;
    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('shade_id', shadeId || '')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ user_id: userId, product_id: productId, shade_id: shadeId || null, quantity });
      }
      emitCartUpdated();
    } catch (e) {
      console.error('Error adding to cart:', e);
    }
  },

  async updateQuantity(id: string, quantity: number, userId?: string): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(id, userId);
      return;
    }
    try {
      await supabase.from('cart_items').update({ quantity }).eq('id', id);
      emitCartUpdated();
    } catch (e) {
      console.error('Error updating quantity:', e);
    }
  },

  async removeFromCart(id: string, userId?: string): Promise<void> {
    try {
      await supabase.from('cart_items').delete().eq('id', id);
      emitCartUpdated();
    } catch (e) {
      console.error('Error removing from cart:', e);
    }
  },

  async clearCart(userId?: string): Promise<void> {
    if (!userId) return;
    try {
      await supabase.from('cart_items').delete().eq('user_id', userId);
      emitCartUpdated();
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  },

  async checkout(
    userId: string,
    address: string,
    paymentMethod = 'cod',
    cartItems: CartItem[]
  ): Promise<{ success: boolean; orderId?: string; message: string }> {
    const totalAmount = cartItems.reduce((acc, item) => {
      const price = item.shade?.price_override ?? item.product?.base_price ?? 0;
      return acc + price * item.quantity;
    }, 0);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: userId, status: 'pending', total_amount: totalAmount, address, payment_method: paymentMethod })
        .select('id')
        .single();

      if (orderError || !order) throw orderError;

      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        shade_id: item.shade_id || null,
        quantity: item.quantity,
        price: item.shade?.price_override ?? item.product?.base_price ?? 0
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsError) throw itemsError;

      await this.clearCart(userId);
      return { success: true, orderId: order.id, message: 'Order placed successfully!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Checkout failed.' };
    }
  }
};
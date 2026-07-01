// Simple Custom Event Emitter to share state updates across Client Components
export const emitCartUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nmp-cart-updated'));
  }
};

export const subscribeToCart = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('nmp-cart-updated', callback);
    return () => window.removeEventListener('nmp-cart-updated', callback);
  }
  return () => {};
};

export const emitUserUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nmp-user-updated'));
  }
};

export const subscribeToUser = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('nmp-user-updated', callback);
    return () => window.removeEventListener('nmp-user-updated', callback);
  }
  return () => {};
};

export const emitWishlistUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nmp-wishlist-updated'));
  }
};

export const subscribeToWishlist = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('nmp-wishlist-updated', callback);
    return () => window.removeEventListener('nmp-wishlist-updated', callback);
  }
  return () => {};
};

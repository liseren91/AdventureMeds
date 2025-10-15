export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceLogoUrl?: string;
  serviceColor: string;
  planIndex: number;
  planName: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  addedAt: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export const getCartFromStorage = (): CartItem[] => {
  const stored = localStorage.getItem("cart");
  return stored ? JSON.parse(stored) : [];
};

export const saveCartToStorage = (items: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

export const addToCart = (item: Omit<CartItem, "id" | "addedAt">): CartItem => {
  const cartItems = getCartFromStorage();
  
  const newItem: CartItem = {
    ...item,
    id: Date.now().toString(),
    addedAt: new Date().toISOString(),
  };
  
  cartItems.push(newItem);
  saveCartToStorage(cartItems);
  
  return newItem;
};

export const removeFromCart = (itemId: string) => {
  const cartItems = getCartFromStorage();
  const filtered = cartItems.filter(item => item.id !== itemId);
  saveCartToStorage(filtered);
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};

export const getCartSummary = (): CartSummary => {
  const items = getCartFromStorage();
  return {
    items,
    totalItems: items.length,
    totalPrice: items.reduce((sum, item) => sum + item.price, 0),
  };
};

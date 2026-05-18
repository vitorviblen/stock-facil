export type CartItem = {
  product_id: string;
  name: string;
  code: string;
  unit_price: number;
  quantity: number;
  max_quantity: number;
};

const KEY = "stockfacil:cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((i) => i.product_id === item.product_id);
  if (existing) {
    if (existing.quantity + 1 > existing.max_quantity) return;
    existing.quantity += 1;
    setCart(cart);
  } else {
    setCart([...cart, item]);
  }
}

export function removeFromCart(productId: string) {
  setCart(getCart().filter((i) => i.product_id !== productId));
}

export function updateQuantity(productId: string, quantity: number) {
  const cart = getCart();
  const item = cart.find((i) => i.product_id === productId);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(quantity, item.max_quantity));
  setCart(cart);
}

export function clearCart() {
  setCart([]);
}

export function cartTotal(items: CartItem[] = getCart()): number {
  return items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
}

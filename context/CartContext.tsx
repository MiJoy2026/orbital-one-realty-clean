"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  propertyId: string;
  propertyType: string;

  /*
   * Personalization
   *
   * deedName remains available so the pages we already built continue
   * working. The configurator will use ownerName going forward.
   */
  deedName?: string;
  ownerName?: string;
  additionalOwner?: string;

  /*
   * Lunar location
   */
  lunarState?: string;
  lunarCity?: string;
  lunarTown?: string;

  /*
   * Property details
   */
  acres: number;
  additionalAcres?: number;
  quantity?: number;
  unitPrice: number;

  /*
   * Optional products
   */
  passportSelected: boolean;
  passportQuantity?: number;

  /*
   * Gift information
   */
  isGift: boolean;
  recipientName?: string;
  recipientEmail?: string;
  giftMessage?: string;

  /*
   * Reservation and product information
   */
  reservationId?: string;
  category?: string;
  image?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;

  getItemTotal: (item: CartItem) => number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "orbital-one-cart";

const ADDITIONAL_ACRE_PRICE = 7.95;
const PASSPORT_PRICE = 4.99;

export function calculateCartItemTotal(item: CartItem) {
  const quantity = Math.max(1, item.quantity ?? 1);
  const additionalAcres = Math.max(0, item.additionalAcres ?? 0);

  const passportQuantity = item.passportSelected
    ? Math.max(1, item.passportQuantity ?? 1)
    : 0;

  const basePropertyTotal = item.unitPrice * quantity;

  const additionalAcreTotal =
    additionalAcres * ADDITIONAL_ACRE_PRICE * quantity;

  const passportTotal = passportQuantity * PASSPORT_PRICE;

  return basePropertyTotal + additionalAcreTotal + passportTotal;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.id === "string" &&
    typeof item.propertyId === "string" &&
    typeof item.propertyType === "string" &&
    typeof item.acres === "number" &&
    typeof item.unitPrice === "number" &&
    typeof item.passportSelected === "boolean" &&
    typeof item.isGift === "boolean"
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(STORAGE_KEY);

      if (!savedCart) {
        return;
      }

      const parsedCart: unknown = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        return;
      }

      const validItems = parsedCart.filter(isCartItem).map((item) => ({
        ...item,
        quantity: item.quantity ?? 1,
        additionalAcres: item.additionalAcres ?? 0,
        passportQuantity: item.passportQuantity ?? 1,
      }));

      setItems(validItems);
    } catch (error) {
      console.error("Unable to load shopping cart:", error);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save shopping cart:", error);
    }
  }, [items, hasLoaded]);

  const addItem = (item: CartItem) => {
    const normalizedItem: CartItem = {
      ...item,
      quantity: Math.max(1, item.quantity ?? 1),
      additionalAcres: Math.max(0, item.additionalAcres ?? 0),
      passportQuantity: Math.max(1, item.passportQuantity ?? 1),
    };

    setItems((currentItems) => [...currentItems, normalizedItem]);
  };

  const removeItem = (id: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updatedItem = {
          ...item,
          ...updates,
        };

        return {
          ...updatedItem,
          quantity: Math.max(1, updatedItem.quantity ?? 1),
          additionalAcres: Math.max(
            0,
            updatedItem.additionalAcres ?? 0
          ),
          passportQuantity: Math.max(
            1,
            updatedItem.passportQuantity ?? 1
          ),
        };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemTotal = (item: CartItem) => {
    return calculateCartItemTotal(item);
  };

  const itemCount = useMemo(() => {
    return items.reduce(
      (total, item) => total + Math.max(1, item.quantity ?? 1),
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + calculateCartItemTotal(item),
      0
    );
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      getItemTotal,
    }),
    [items, itemCount, subtotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
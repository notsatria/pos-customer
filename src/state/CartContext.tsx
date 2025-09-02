import { createContext, useContext, useMemo, useState } from "react";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "food" | "drink";
};

type Line = { item: MenuItem; qty: number };
type Ctx = {
  lines: Line[];
  add(i: MenuItem, qty?: number): void;
  setQty(id: string, qty: number): void;
  remove(id: string): void;
  clear(): void;
  subtotal: number;
  fee: number;
  total: number;
  count: number;
};

const C = createContext<Ctx | null>(null);
export const useCart = () => {
  const c = useContext(C);
  if (!c) throw new Error("Cart context not found");
  return c;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);

  const add = (item: MenuItem, qty = 1) =>
    setLines((p) => {
      const i = p.findIndex((l) => l.item.id === item.id);
      if (i < 0) return [...p, { item, qty }];
      const c = [...p];
      c[i] = { ...c[i], qty: c[i].qty + qty };
      return c;
    });

  const setQty = (id: string, qty: number) => setLines((p) => p.map((l) => (l.item.id === id ? { ...l, qty: Math.max(0, qty) } : l)).filter((l) => l.qty > 0));

  const remove = (id: string) => setLines((p) => p.filter((l) => l.item.id !== id));
  const clear = () => setLines([]);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.item.price * l.qty, 0), [lines]);
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  return <C.Provider value={{ lines, add, setQty, remove, clear, subtotal, fee, total, count }}>{children}</C.Provider>;
}

export const formatIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

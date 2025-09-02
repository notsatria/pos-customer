Here’s a complete, mobile-first **design + development plan** for your customer-facing POS web app using **Vite + React + TypeScript + Tailwind + shadcn/ui**. It includes a project brief, phased tasks, UI mockups (wireframes), and key code snippets.

---

# Project Brief

**Goal:** Let dine-in customers scan a barcode → browse menu → add to cart → checkout → pay via **QRIS** or **bank transfer**—all on a fast, mobile-first web app that scales to desktop.

**Tech:** Vite + React + TypeScript, Tailwind CSS, shadcn/ui (Radix-based components), optional framer-motion for polish.

**Design Principles (mobile-first):**

- Single-column layout; sticky header and bottom CTA on small screens.
- Big tap targets (40–48px min), rounded corners, readable type.
- Minimal color usage; emphasize primary actions and totals.
- Accessible: labeled inputs, focus states, semantic HTML.

---

# Phase 1 — Setup

## Tasks

- [ ] Create project with Vite (React + TS)
- [ ] Install Tailwind + configure `tailwind.config.ts`
- [ ] Install shadcn/ui & generate components
- [ ] Add base styles and theme tokens (brand color, neutrals)
- [ ] Add routing (react-router)

## Commands & Snippets

```bash
# Vite + React + TS
npm create vite@latest pos-customer -- --template react-ts
cd pos-customer
npm i

# Tailwind
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* shadcn tokens (excerpt) */
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 142 70% 35%;
  --primary-foreground: 0 0% 100%;
  --muted: 210 20% 97%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --ring: 142 70% 35%;
}
```

```bash
# shadcn/ui
npm i class-variance-authority clsx tailwind-merge lucide-react
# shadcn CLI (if using)
npx shadcn@latest init
# then generate components as needed, for example:
npx shadcn@latest add button card input label tabs radio-group separator sheet toast
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

---

# Phase 2 — Layout & Routing

## Tasks

- [ ] App shell with sticky header (brand + cart badge)
- [ ] Bottom “View cart” floating CTA on Menu page
- [ ] Routes: `/` (Menu), `/cart`, `/checkout`, `/order/:orderId`
- [ ] Global cart state (Context or Zustand)

## Snippet (App shell + routes)

```tsx
// src/App.tsx
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import { CartProvider, useCart } from "./state/CartContext";

function Shell({ children }: { children: React.ReactNode }) {
  const { count } = useCart();
  const { pathname } = useLocation();
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-screen-sm h-14 px-4 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            KopiKuy
          </Link>
          <Link to="/cart" className="relative">
            <Button size="icon" variant="outline" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">{count}</span>}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-screen-sm px-4 pt-3 pb-24">{children}</main>
      {pathname === "/" && count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-screen-sm px-4 pb-4">
          <Link to="/cart" className="block">
            <Button className="h-12 w-full rounded-xl">View cart ({count})</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<ConfirmationPage />} />
        </Routes>
      </Shell>
    </CartProvider>
  );
}
```

---

# Phase 3 — Menu Page (UI + mock data)

## Tasks

- [ ] Category tabs (Food / Drinks), searchable list
- [ ] Menu cards: image, name, desc (2 lines), price, add/qty
- [ ] Mobile grid 1-col → `md:grid-cols-2`

## Snippets

```tsx
// src/state/CartContext.tsx
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
  if (!c) throw new Error("Cart");
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
```

```tsx
// src/pages/MenuPage.tsx
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import MenuCard from "../shared/MenuCard";
import type { MenuItem } from "../state/CartContext";

const data: MenuItem[] = [
  /* …mock items… */
];

export default function MenuPage() {
  const [tab, setTab] = useState<"food" | "drink">("food");
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.filter((m) => m.category === tab && (!t || m.name.toLowerCase().includes(t) || m.description.toLowerCase().includes(t)));
  }, [tab, q]);

  return (
    <section className="space-y-3">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="food">Food</TabsTrigger>
          <TabsTrigger value="drink">Drinks</TabsTrigger>
        </TabsList>
        <div className="pt-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search menu…" className="h-11 rounded-xl" />
        </div>
        <TabsContent value="food" className="mt-4">
          <MenuGrid items={items} />
        </TabsContent>
        <TabsContent value="drink" className="mt-4">
          <MenuGrid items={items} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
function MenuGrid({ items }: { items: MenuItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((m) => (
        <MenuCard key={m.id} item={m} />
      ))}
    </div>
  );
}
```

```tsx
// src/shared/MenuCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart, formatIDR, MenuItem } from "../state/CartContext";
import Quantity from "./Quantity";

export default function MenuCard({ item }: { item: MenuItem }) {
  const { lines, add, setQty } = useCart();
  const qty = lines.find((l) => l.item.id === item.id)?.qty ?? 0;
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="aspect-[16/10] bg-muted">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{item.name}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold">{formatIDR(item.price)}</p>
        </div>
        <div className="mt-3">
          {qty === 0 ? (
            <Button onClick={() => add(item, 1)} className="h-10 w-full rounded-xl">
              Add
            </Button>
          ) : (
            <Quantity value={qty} onChange={(v) => setQty(item.id, v)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

```tsx
// src/shared/Quantity.tsx
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export default function Quantity({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex h-10 w-full items-center justify-between rounded-xl border">
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease">
        <Minus className="h-5 w-5" />
      </Button>
      <span className="w-8 text-center font-medium">{value}</span>
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase">
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
```

---

# Phase 4 — Cart & Checkout Flow

## Tasks

- [ ] Cart page: editable line items, remove, summary (subtotal/fee/total), checkout CTA
- [ ] Checkout: customer info (optional), payment selection (QRIS/bank), total & place order

## Snippets

```tsx
// src/pages/CartPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart, formatIDR } from "../state/CartContext";
import Quantity from "../shared/Quantity";

export default function CartPage() {
  const { lines, setQty, remove, subtotal, fee, total } = useCart();
  const nav = useNavigate();

  if (lines.length === 0) {
    return (
      <section className="py-10 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block">
          <Button className="rounded-xl">Browse menu</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Your Cart</h1>

      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <ul className="divide-y">
            {lines.map((l) => (
              <li key={l.item.id} className="flex items-center gap-3 p-3">
                <img src={l.item.image} alt={l.item.name} className="h-14 w-14 rounded-lg object-cover bg-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{l.item.name}</p>
                  <p className="text-sm text-muted-foreground">{formatIDR(l.item.price)}</p>
                  <div className="mt-2 max-w-[160px]">
                    <Quantity value={l.qty} onChange={(v) => setQty(l.item.id, v)} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatIDR(l.item.price * l.qty)}</p>
                  <button className="mt-1 text-xs text-muted-foreground underline" onClick={() => remove(l.item.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Summary subtotal={subtotal} fee={fee} total={total} />
      <Button className="h-12 w-full rounded-xl" onClick={() => nav("/checkout")}>
        Checkout
      </Button>
    </section>
  );
}

function Summary({ subtotal, fee, total }: { subtotal: number; fee: number; total: number }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatIDR(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Service fee (5%)</span>
          <span>{formatIDR(fee)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{formatIDR(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

```tsx
// src/pages/CheckoutPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, formatIDR } from "../state/CartContext";

type PM = "qris" | "bank";

export default function CheckoutPage() {
  const { total, clear } = useCart();
  const [pm, setPm] = useState<PM>("qris");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const nav = useNavigate();

  const placeOrder = () => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    clear();
    nav(`/order/${id}`, { state: { method: pm, paid: false }, replace: true });
  };

  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Checkout</h1>

      <Card className="rounded-2xl">
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="space-y-3 p-4">
          <Label className="font-semibold">Payment</Label>
          <RadioGroup value={pm} onValueChange={(v) => setPm(v as PM)} className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl border p-3">
              <RadioGroupItem value="qris" id="pm-qris" />
              <Label htmlFor="pm-qris" className="flex-1 cursor-pointer">
                QRIS
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-3">
              <RadioGroupItem value="bank" id="pm-bank" />
              <Label htmlFor="pm-bank" className="flex-1 cursor-pointer">
                Bank Transfer
              </Label>
            </div>
          </RadioGroup>

          <div className="pt-2">{pm === "qris" ? <QrisPanel amount={total} /> : <BankPanel amount={total} />}</div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total to pay</span>
            <span className="font-semibold">{formatIDR(total)}</span>
          </div>
          <Separator />
          <Button className="h-12 w-full rounded-xl" onClick={placeOrder}>
            Place Order
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function QrisPanel({ amount }: { amount: number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="mb-2 text-sm text-muted-foreground">Scan QRIS with your banking app.</p>
      <div className="grid place-items-center py-2">
        <div className="h-44 w-44 rounded-lg border" aria-label="QR placeholder" />
      </div>
      <p className="text-center text-sm">
        Amount: <span className="font-semibold">{formatIDR(amount)}</span>
      </p>
    </div>
  );
}
function BankPanel({ amount }: { amount: number }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border p-4">
        <p className="mb-1 text-sm text-muted-foreground">Transfer exactly</p>
        <p className="text-lg font-semibold">{formatIDR(amount)}</p>
      </div>
      <div className="grid gap-3">
        <VaCard bank="BCA" va="1234567890" name="PT Kopi Kuy" />
        <VaCard bank="BNI" va="880812345678" name="PT Kopi Kuy" />
      </div>
    </div>
  );
}
function VaCard({ bank, va, name }: { bank: string; va: string; name: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(va);
    } catch {}
  };
  return (
    <div className="space-y-2 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">{bank}</p>
        <Button variant="outline" size="sm" onClick={copy} className="rounded-lg">
          Copy VA
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{name}</p>
      <p className="text-sm">
        VA: <span className="font-medium">{va}</span>
      </p>
    </div>
  );
}
```

---

# Phase 5 — Payment & Confirmation Flow

## Tasks

- [ ] Integrate backend to generate **QRIS** image (or deeplink) and **VA** details
- [ ] Poll payment status or use webhook+socket to update “Paid”
- [ ] Confirmation page: order id, payment method, status, “Back to menu”

## Snippet

```tsx
// src/pages/ConfirmationPage.tsx
import { useLocation, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfirmationPage() {
  const { orderId } = useParams();
  const state = useLocation().state as { method?: string; paid?: boolean } | null;
  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Order Confirmed</h1>
      <Card className="rounded-2xl">
        <CardContent className="space-y-3 p-4">
          <div className="grid place-items-center">
            <div className="h-36 w-36 rounded-lg border" aria-label="QR / success icon" />
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="text-lg font-semibold tracking-wider">{orderId}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium uppercase">{state?.method ?? "—"}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{state?.paid ? "Paid" : "Awaiting Payment"}</p>
          </div>
        </CardContent>
      </Card>
      <Link to="/" className="block">
        <Button className="h-12 w-full rounded-xl">Back to menu</Button>
      </Link>
    </section>
  );
}
```

---

# Phase 6 — Polish, QA, Deploy

## Tasks

- [ ] Empty states, loading, error toasts (shadcn `toast`)
- [ ] Accessibility pass: labels, focus ring, keyboard flow, aria attrs
- [ ] Performance: image lazy-loading, code-splitting, prefetch routes
- [ ] PWA basics (manifest, icons, offline fallback for menu)
- [ ] Deploy (Vercel/Netlify), add env vars and backend URLs
- [ ] Analytics: simple event tracking (add to cart, checkout started, payment success)

---

## UI Wireframes / Mockups (Mobile)

- Menu: [Download](sandbox:/mnt/data/pos-wireframe-menu.png)
- Cart: [Download](sandbox:/mnt/data/pos-wireframe-cart.png)
- Checkout: [Download](sandbox:/mnt/data/pos-wireframe-checkout.png)
- Order Confirmation: [Download](sandbox:/mnt/data/pos-wireframe-confirmation.png)

> These are clean, schematic wireframes to align on layout and flows. They reflect the mobile-first structure you’ll implement with shadcn/ui components.

---

## Component Checklist (shadcn/ui)

- **Header / AppShell**: `Button`, custom layout; sticky top, cart badge.
- **Tabs / Filters**: `Tabs`, `TabsList`, `TabsTrigger`.
- **Search**: `Input` + debounced filter.
- **Cards**: `Card` for MenuCard, `CardContent` for inner layout.
- **Buttons**: Primary/outline; rounded-xl for touch comfort.
- **Forms**: `Label`, `Input`, `RadioGroup`, `RadioGroupItem`.
- **List & Dividers**: `Separator`, simple `ul > li` with `divide-y`.
- **Feedback**: `toast` for copy success, payment updates.
- **Sheet (optional)**: slide-up cart on Menu for desktop.

---

## Color & Typography

- **Primary (brand/confirm)**: Emerald (CSS var `--primary`).
- **Neutrals**: Muted gray backgrounds with clear borders (`--border`).
- **Text**: Inter or Plus Jakarta Sans; body `text-sm`/`text-base`, headings `font-semibold`.
- **Buttons**: Primary for actions; outline/ghost for secondary actions.
- **States**: Use Tailwind focus ring + `--ring` for keyboard users.

---

## Backend Integration Notes

- **QRIS**: your backend returns a PNG/SVG or payload to render; show `expires_at`.
- **Bank Transfer**: return VA + bank name; expose copy action; show “awaiting payment” until confirmed.
- **Order API**: `POST /orders` → returns `{ id, payment: { method, qrisUrl|va }, status }`.
- **Status Updates**: poll `/orders/:id` (e.g., every 3–5s) or push via WebSocket/SSE after payment initiation.

---

If you want, I can bundle these snippets into a ready-to-run repo structure (folders, files, and a mock API) so you can `npm run dev` and click through the full flow.

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
        <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
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
      <main className="mx-auto max-w-screen-sm px-4 pb-24 pt-3">{children}</main>
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

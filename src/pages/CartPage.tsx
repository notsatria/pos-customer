import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart, formatIDR } from "@/state/CartContext";
import Quantity from "@/shared/Quantity";

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

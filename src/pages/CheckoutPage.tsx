import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, formatIDR } from "@/state/CartContext";
import { createOrder, type PaymentMethod } from "@/lib/mockOrders";

type PM = PaymentMethod;

export default function CheckoutPage() {
  const { total, clear } = useCart();
  const [pm, setPm] = useState<PM>("qris");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const placeOrder = async () => {
    if (total <= 0 || loading) return;
    setLoading(true);
    try {
      const order = await createOrder({ method: pm, amount: total, name, phone });
      clear();
      nav(`/order/${order.id}`, { state: { method: order.method, paid: order.status === "paid" }, replace: true });
    } finally {
      setLoading(false);
    }
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
          <Button className="h-12 w-full rounded-xl" onClick={placeOrder} disabled={loading || total <= 0}>
            {loading ? "Placing…" : "Place Order"}
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

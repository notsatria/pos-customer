import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrder, subscribeToOrder, type Order } from "@/lib/mockOrders";

export default function ConfirmationPage() {
  const { orderId } = useParams();
  const state = useLocation().state as { method?: string; paid?: boolean } | null;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let stop = () => {};
    (async () => {
      const o = await getOrder(orderId);
      setOrder(o);
      stop = subscribeToOrder(orderId, setOrder);
    })();
    return () => stop();
  }, [orderId]);
  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Order Confirmed</h1>
      <Card className="rounded-2xl">
        <CardContent className="space-y-3 p-4">
          <div className="grid place-items-center">
            {order?.method === "qris" && order.payment.qrisUrl ? (
              <img src={order.payment.qrisUrl} alt="QRIS" className="h-44 w-44 rounded-lg border object-contain bg-white" />
            ) : (
              <div className="h-36 w-36 rounded-lg border" aria-label="QR / success icon" />
            )}
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="text-lg font-semibold tracking-wider">{orderId}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium uppercase">{order?.method ?? state?.method ?? "—"}</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{order?.status === "paid" || state?.paid ? "Paid" : "Awaiting Payment"}</p>
          </div>
          {order?.method === "bank" && order.payment.va && (
            <div className="rounded-xl border p-3">
              <p className="text-sm text-muted-foreground">Virtual Account</p>
              <p className="font-medium">
                {order.payment.va.bank} • {order.payment.va.va}
              </p>
              <p className="text-sm text-muted-foreground">{order.payment.va.name}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Link to="/" className="block">
        <Button className="h-12 w-full rounded-xl">Back to menu</Button>
      </Link>
    </section>
  );
}

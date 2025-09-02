import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart, formatIDR, type MenuItem } from "@/state/CartContext";
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

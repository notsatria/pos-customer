import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import MenuCard from "@/shared/MenuCard";
import type { MenuItem } from "@/state/CartContext";

const data: MenuItem[] = [
  {
    id: "f1",
    name: "Nasi Goreng",
    description: "Indonesian fried rice with egg and chicken",
    price: 25000,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981d?q=80&w=800&auto=format&fit=crop",
    category: "food",
  },
  {
    id: "f2",
    name: "Mie Goreng",
    description: "Fried noodles with vegetables and egg",
    price: 22000,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    category: "food",
  },
  {
    id: "d1",
    name: "Es Teh Manis",
    description: "Sweet iced tea",
    price: 8000,
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=800&auto=format&fit=crop",
    category: "drink",
  },
  {
    id: "d2",
    name: "Kopi Susu",
    description: "Milk coffee, lightly sweetened",
    price: 15000,
    image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop",
    category: "drink",
  },
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

export type PaymentMethod = "qris" | "bank";
export type OrderStatus = "pending" | "paid";

export type Order = {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: OrderStatus;
  payment: {
    qrisUrl?: string;
    va?: { bank: string; va: string; name: string };
  };
  meta?: { name?: string; phone?: string };
};

const STORAGE_KEY = "pos_orders_v1";

function load(): Record<string, Order> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Order>) : {};
  } catch {
    return {};
  }
}
function save(db: Record<string, Order>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

function id(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Simple QR placeholder SVG
const qrSvg = (text: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='172' height='172'>
      <rect width='100%' height='100%' fill='white'/>
      <rect x='8' y='8' width='156' height='156' fill='black' opacity='0.05'/>
      <text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-size='12' fill='#111'>QRIS ${text}</text>
    </svg>`
  )}`;

export async function createOrder(input: { method: PaymentMethod; amount: number; name?: string; phone?: string }): Promise<Order> {
  const db = load();
  const oid = id();
  const base: Order = {
    id: oid,
    amount: input.amount,
    method: input.method,
    status: "pending",
    payment: input.method === "qris" ? { qrisUrl: qrSvg(oid) } : { va: { bank: "BCA", va: "1234567890", name: "PT Kopi Kuy" } },
    meta: { name: input.name, phone: input.phone },
  };
  db[oid] = base;
  save(db);

  // Simulate payment completion after 6s
  setTimeout(() => {
    const cur = load();
    if (cur[oid] && cur[oid].status === "pending") {
      cur[oid] = { ...cur[oid], status: "paid" };
      save(cur);
    }
  }, 6000);

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 300));
  return base;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const db = load();
  await new Promise((r) => setTimeout(r, 150));
  return db[orderId] ?? null;
}

export function subscribeToOrder(orderId: string, cb: (o: Order | null) => void) {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    const o = await getOrder(orderId);
    cb(o);
  };
  const iv = setInterval(tick, 2000);
  // immediate first fetch
  tick();
  return () => {
    stopped = true;
    clearInterval(iv);
  };
}

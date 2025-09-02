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

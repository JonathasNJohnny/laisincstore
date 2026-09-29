import type { Dispatch, SetStateAction } from "react";

export type AdminTab = "products" | "boxes" | "banners" | "coupons" | "payment" | "orders";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "products", label: "Produtos" },
  { id: "boxes", label: "Caixas" },
  { id: "banners", label: "Banner" },
  { id: "coupons", label: "Cupons" },
  { id: "payment", label: "Integrações" },
  { id: "orders", label: "Pedidos" },
];

interface AdminTabsProps { activeTab: AdminTab; onChange: Dispatch<SetStateAction<AdminTab>>; }

export function AdminTabs({ activeTab, onChange }: AdminTabsProps) {
  return (
    <div role="tablist" aria-label="Seções de administração" className="mb-8 flex w-fit rounded-xl border border-cinza-quente bg-branco p-1 shadow-sm">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => onChange(tab.id)} className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab.id ? "bg-roxo-profundo text-branco" : "text-grafite-arroxeado hover:bg-rosa-lais/10"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

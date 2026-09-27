import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { CouponsPanel } from "./CouponsPanel";
import { AdminTabs, type AdminTab } from "./AdminTabs";
import { BannersTab } from "./BannersTab";
import { IntegrationsTab } from "./IntegrationsTab";
import { OrdersTab } from "./OrdersTab";
import { ProductsTab } from "./ProductsTab";

export function AdminPage() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab: AdminTab = searchParams.has("mercadoPago")
    ? "payment"
    : "products";
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  if (loading) return null;
  if (!user?.admin) return <Navigate to="/" replace />;

  return (
    <main className="container py-32">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">
          Admin
        </p>
        <h1 className="mt-2 text-4xl font-bold text-roxo-profundo">
          Administrar
        </h1>
      </div>
      <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "banners" && <BannersTab />}
      {activeTab === "coupons" && <CouponsPanel />}
      {activeTab === "payment" && (
        <IntegrationsTab
          showMercadoPagoResult={searchParams.has("mercadoPago")}
        />
      )}
      {activeTab === "orders" && <OrdersTab />}
    </main>
  );
}

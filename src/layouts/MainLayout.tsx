import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { ToastViewport } from "../components/Toast/ToastViewport";

export function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-12 pt-16 lg:pb-16 lg:pt-20" id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ToastViewport />
    </div>
  );
}

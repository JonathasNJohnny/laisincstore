import { Outlet } from "react-router-dom";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-12 pt-16 lg:pb-16 lg:pt-20" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

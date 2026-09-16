import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";

// Pages
import { HomePage } from "../pages/Home/HomePage";
import { ShopPage } from "../pages/Shop/ShopPage";
import { ProductPage } from "../pages/Product/ProductPage";
import { CategoryPage } from "../pages/Category/CategoryPage";
import { CartPage } from "../pages/Cart/CartPage";
import { CheckoutPage } from "../pages/Checkout/CheckoutPage";
import { AboutPage } from "../pages/About/AboutPage";
import { ContactPage } from "../pages/Contact/ContactPage";
import { PrivacyPage } from "../pages/Privacy/PrivacyPage";
import { TermsPage } from "../pages/Terms/TermsPage";
import { ThanksPage } from "../pages/Thanks/ThanksPage";
import { AdminPage } from "../pages/Admin/AdminPage";
import { RegisterPage } from "../pages/Register/RegisterPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <div>Error</div>,
    children: [
      { index: true, element: <HomePage /> },
      { path: "loja", element: <ShopPage /> },
      { path: "administrar", element: <AdminPage /> },
      { path: "cadastro", element: <RegisterPage /> },
      { path: "perfil", element: <ProfilePage /> },
      { path: "produto/:slug", element: <ProductPage /> },
      { path: "categoria/:slug", element: <CategoryPage /> },
      { path: "carrinho", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "sobre", element: <AboutPage /> },
      { path: "contato", element: <ContactPage /> },
      { path: "politica-de-privacidade", element: <PrivacyPage /> },
      { path: "termos", element: <TermsPage /> },
      { path: "agradecimentos", element: <ThanksPage /> },
    ],
  },
]);

import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { applySeo } from "./applySeo";
import SiteLayout from "./components/SiteLayout";
import { salonPages } from "./data/salonPages";
import { useI18n } from "./i18n";
import AboutPage from "./pages/AboutPage";
import BookingPage from "./pages/BookingPage";
import CareersPage from "./pages/CareersPage";
import ChavanellePage from "./pages/ChavanellePage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LocationsPage from "./pages/LocationsPage";
import SalonDetailPage from "./pages/SalonDetailPage";
import SalonPage from "./pages/SalonPage";
import ServicesPage from "./pages/ServicesPage";

function ScrollToRoute() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    applySeo(pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname);

    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function NotFoundPage() {
  const { t } = useI18n();

  return (
    <section className="page-intro">
      <div className="wrap">
        <p className="eyebrow">{t.notFound.eyebrow}</p>
        <h1>{t.notFound.title}</h1>
        <Link className="button" to="/">
          {t.notFound.back}
        </Link>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <ScrollToRoute />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="prestations" element={<ServicesPage />} />
          <Route path="salon" element={<SalonPage />} />
          <Route path="salons" element={<LocationsPage />} />
          <Route
            path="salons/anatole-france"
            element={<SalonDetailPage config={salonPages.anatole} />}
          />
          <Route
            path="salons/jean-jaures"
            element={<SalonDetailPage config={salonPages.jeanJaures} />}
          />
          <Route path="salons/chavanelle" element={<ChavanellePage />} />
          <Route
            path="salons/meyerbeer"
            element={<SalonDetailPage config={salonPages.meyerbeer} />}
          />
          <Route
            path="salons/le-port"
            element={<SalonDetailPage config={salonPages.lePort} />}
          />
          <Route path="a-propos" element={<AboutPage />} />
          <Route path="carrieres" element={<CareersPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="reservation" element={<BookingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

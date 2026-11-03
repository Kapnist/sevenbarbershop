import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { languages, useI18n, type Language } from "../i18n";
import { asset } from "../asset";

const navigation = [
  { to: "/", key: "home", end: true },
  { to: "/prestations", key: "services", end: false },
  { to: "/salon", key: "salon", end: false },
  { to: "/salons", key: "salons", end: false },
  { to: "/a-propos", key: "about", end: false },
  { to: "/carrieres", key: "careers", end: false },
  { to: "/contact", key: "contact", end: false },
] as const;

function LanguageSwitcher() {
  const { t, language, setLanguage } = useI18n();

  return (
    <label className="language-switcher">
      <span className="visually-hidden">{t.nav.language}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code} lang={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SiteHeader() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <nav className="nav wrap" aria-label={t.nav.label}>
        <Link className="brand" to="/" aria-label={t.nav.homeLabel}>
          <img
            className="brand-logo"
            src={asset("/images/logo-seven.webp")}
            alt="Seven Barbershop"
          />
        </Link>
        <ul
          className={`nav-links${menuOpen ? " is-open" : ""}`}
          id="primary-menu"
        >
          {navigation.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "is-active" : "")}
              >
                {t.nav[item.key]}
              </NavLink>
            </li>
          ))}
        </ul>
        <LanguageSwitcher />
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={menuOpen}
          aria-controls="primary-menu"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </nav>
    </header>
  );
}

const footerNavigation = [
  { to: "/salons", key: "salons" },
  { to: "/a-propos", key: "about" },
  { to: "/carrieres", key: "careers" },
  { to: "/contact", key: "contact" },
] as const;

function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Link className="footer-brand" to="/">
          Seven Barbershop
        </Link>
        <nav aria-label={t.nav.footerLabel}>
          <ul className="footer-links">
            {footerNavigation.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{t.nav[item.key]}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>Saint-Étienne · Nice</p>
        <p>
          <bdi dir="ltr">© {new Date().getFullYear()} Seven Barbershop</bdi>
        </p>
      </div>
    </footer>
  );
}

function SiteLayout() {
  return (
    <>
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}

export default SiteLayout;

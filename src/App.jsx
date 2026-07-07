import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import { PageTitleProvider } from './context/PageTitleContext';
import CuratorPage from './pages/CuratorPage';
import HomePage from './pages/HomePage';
import VaultPage from './pages/VaultPage';

/** Scroll the window to top whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/** Root layout with background styling and client-side route definitions. */
export default function App() {
  return (
    <PageTitleProvider>
      <main className="app-shell">
        <div className="background-orb background-orb-a" />
        <div className="background-orb background-orb-b" />

        <AppHeader />

        <div className="content-wrap">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/curator/:curatorSlug" element={<CuratorPage />} />
            <Route path="/curator/:curatorSlug/vault/:chainId/:vaultAddress" element={<VaultPage />} />
          </Routes>
        </div>
      </main>
    </PageTitleProvider>
  );
}

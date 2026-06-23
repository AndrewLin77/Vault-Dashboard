import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import CuratorPage from './pages/CuratorPage';
import HomePage from './pages/HomePage';
import VaultPage from './pages/VaultPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <main className="app-shell">
      <div className="background-orb background-orb-a" />
      <div className="background-orb background-orb-b" />

      <div className="content-wrap">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/curator/:curatorSlug" element={<CuratorPage />} />
          <Route path="/curator/:curatorSlug/vault/:chainId/:vaultAddress" element={<VaultPage />} />
        </Routes>
      </div>
    </main>
  );
}

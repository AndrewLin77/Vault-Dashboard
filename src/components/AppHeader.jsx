import { Link, useLocation, useMatch } from 'react-router-dom';
import { usePageTitle } from '../context/PageTitleContext';
import { curatorPath, decodeCuratorSlug } from '../lib/routes';

/** Sticky top bar with home link and route breadcrumbs. */
export default function AppHeader() {
  const { pathname } = useLocation();
  const curatorMatch = useMatch('/curator/:curatorSlug');
  const vaultMatch = useMatch('/curator/:curatorSlug/vault/:chainId/:vaultAddress');
  const { vaultName } = usePageTitle();

  const curatorSlug = vaultMatch?.params.curatorSlug ?? curatorMatch?.params.curatorSlug ?? '';
  const curatorName = curatorSlug ? decodeCuratorSlug(curatorSlug) : '';
  const onVaultPage = Boolean(vaultMatch);
  const onCuratorPage = Boolean(curatorMatch) && !onVaultPage;

  if (pathname === '/') return null;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <nav className="app-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Curators</Link>
          {(onCuratorPage || onVaultPage) ? (
            <>
              <span className="app-breadcrumb-sep" aria-hidden="true">/</span>
              {onVaultPage ? (
                <Link to={curatorPath(curatorName)}>{curatorName || 'Curator'}</Link>
              ) : (
                <span className="app-breadcrumb-current">{curatorName || 'Curator'}</span>
              )}
            </>
          ) : null}
          {onVaultPage ? (
            <>
              <span className="app-breadcrumb-sep" aria-hidden="true">/</span>
              <span className="app-breadcrumb-current">{vaultName || 'Vault'}</span>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

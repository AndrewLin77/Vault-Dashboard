import { createContext, useContext, useMemo, useState } from 'react';

const PageTitleContext = createContext({
  vaultName: '',
  setVaultName: () => {},
});

/** Lets nested routes set the vault name shown in the top-bar breadcrumb. */
export function PageTitleProvider({ children }) {
  const [vaultName, setVaultName] = useState('');

  const value = useMemo(
    () => ({ vaultName, setVaultName }),
    [vaultName],
  );

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  return useContext(PageTitleContext);
}

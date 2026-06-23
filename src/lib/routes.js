export function decodeCuratorSlug(slug) {
  return decodeURIComponent(slug ?? '');
}

export function curatorPath(curatorName) {
  return `/curator/${encodeURIComponent(curatorName)}`;
}

export function vaultPath(curatorName, vault) {
  const chainId = vault?.chain?.id ?? 1;
  const address = vault?.address ?? '';
  return `/curator/${encodeURIComponent(curatorName)}/vault/${chainId}/${address}`;
}

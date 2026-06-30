/** Decode a URL-encoded curator slug back to the curator name. */
export function decodeCuratorSlug(slug) {
  return decodeURIComponent(slug ?? '');
}

/** Build the route path for a curator's vault list page. */
export function curatorPath(curatorName) {
  return `/curator/${encodeURIComponent(curatorName)}`;
}

/** Build the route path for a specific vault detail page. */
export function vaultPath(curatorName, vault) {
  const chainId = vault?.chain?.id ?? 1;
  const address = vault?.address ?? '';
  return `/curator/${encodeURIComponent(curatorName)}/vault/${chainId}/${address}`;
}

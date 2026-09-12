/**
 * Utility to resolve static asset URLs properly across root domains,
 * subpaths (e.g. GitHub Pages https://username.github.io/repo-name/),
 * and local preview environments.
 */
export const getAssetUrl = (url?: string | null): string => {
  if (!url) return './logo-kwarran-tanah-sareal.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('./')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `.${url}`;
  }
  return `./${url}`;
};

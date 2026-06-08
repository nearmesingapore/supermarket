import type { DirectoryData } from "./airtable";
import type { FaqItem } from "./content";

const STATIC_SITEMAP_PATHS = ["/", "/directory", "/supermarkets", "/grocery-stores", "/convenience-stores", "/general-stores", "/brands", "/neighbourhoods"];

export function resolveSiteUrl(site: string | URL | undefined) {
  return (site?.toString() || "https://supermarket.sg").replace(/\/$/, "");
}

export function getSitemapPaths(data: DirectoryData) {
  return [...new Set([
    ...STATIC_SITEMAP_PATHS,
    ...data.promotionCollections.map((collection) => `/${collection.slug}`),
    ...data.brands.map((brand) => `/brands/${brand.slug}`),
    ...data.neighbourhoods.map((neighbourhood) => `/neighbourhoods/${neighbourhood.slug}`),
    ...data.malls.map((mall) => `/malls/${mall.slug}`),
    ...data.mrtStations.map((station) => `/mrt-stations/${station.slug}`),
    ...data.supermarkets.map((outlet) => `/supermarkets/${outlet.slug}`),
    ...data.groceryStores.map((outlet) => `/grocery-stores/${outlet.slug}`),
    ...data.convenienceStores.map((outlet) => `/convenience-stores/${outlet.slug}`),
    ...data.generalStores.map((outlet) => `/general-stores/${outlet.slug}`)
  ].map(canonicalPath))];
}

export function canonicalPath(path: string) {
  const url = new URL(path || "/", "https://supermarket.sg");
  const pathname = url.pathname === "/" || url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;

  return `${pathname}${url.search}${url.hash}`;
}

export function canonicalUrl(site: string | URL | undefined, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    const url = new URL(path);
    url.pathname = canonicalPath(url.pathname);
    return url.toString();
  }

  return `${resolveSiteUrl(site)}${canonicalPath(path)}`;
}

export function buildSitemapXml(data: DirectoryData, site: string | URL | undefined) {
  const siteUrl = resolveSiteUrl(site);
  const urls = getSitemapPaths(data)
    .map((path) => `  <url>\n    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>\n  </url>`)
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>"
  ].join("\n");
}

export function buildRobotsTxt(site: string | URL | undefined) {
  const siteUrl = resolveSiteUrl(site);

  return [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join("\n");
}

export function buildFaqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

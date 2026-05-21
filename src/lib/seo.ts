import type { DirectoryData } from "./airtable";

const STATIC_SITEMAP_PATHS = ["/", "/directory", "/brands", "/neighbourhoods"];

export function resolveSiteUrl(site: string | URL | undefined) {
  return (site?.toString() || "https://supermarket.sg").replace(/\/$/, "");
}

export function getSitemapPaths(data: DirectoryData) {
  return [
    ...STATIC_SITEMAP_PATHS,
    ...data.brands.map((brand) => `/brands/${brand.slug}`),
    ...data.neighbourhoods.map((neighbourhood) => `/neighbourhoods/${neighbourhood.slug}`),
    ...data.malls.map((mall) => `/malls/${mall.slug}`),
    ...data.mrtStations.map((station) => `/mrt-stations/${station.slug}`),
    ...data.supermarkets.map((outlet) => `/supermarkets/${outlet.slug}`)
  ];
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

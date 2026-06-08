import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import type { DirectoryData } from "./airtable";
import {
  buildRobotsTxt,
  canonicalPath,
  buildSitemapXml,
  getSitemapPaths,
  resolveSiteUrl
} from "./seo";

const directoryData = {
  brands: [{ id: "brand-1", name: "Brand", slug: "brand", count: 2 }],
  featuredBrands: [{ id: "brand-1", name: "Brand", slug: "brand", count: 2 }],
  supermarketBrands: [{ id: "brand-1", name: "Brand", slug: "brand", count: 2 }],
  groceryStoreBrands: [],
  neighbourhoods: [{ id: "hood-1", name: "Hood", slug: "hood", count: 1 }],
  malls: [{ id: "mall-1", name: "Mall", slug: "mall", count: 1 }],
  mrtStations: [{ id: "mrt-1", name: "Station", slug: "station", count: 1 }],
  supermarkets: [
    {
      id: "outlet-1",
      outletName: "Brand Hood",
      slug: "brand-hood",
      description: "",
      brand: [{ id: "brand-1", name: "Brand", slug: "brand" }],
      category: "",
      neighbourhood: [],
      mall: [],
      address: "",
      streetName: "",
      postalCode: "",
      mrt: [],
      openingHours: "",
      phone: "",
      googleMapsUrl: "",
      websiteUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      imageUrl: "",
      galleryImagesUrl: "",
      gettingThereByCar: "",
      gettingThereByPublicTransport: "",
      nearbyBusServices: "",
      nearbyLandmarks: "",
      featured: false
    },
    {
      id: "outlet-2",
      outletName: "Brand Valley",
      slug: "brand-valley",
      description: "",
      brand: [{ id: "brand-1", name: "Brand", slug: "brand" }],
      category: "",
      neighbourhood: [],
      mall: [],
      address: "",
      streetName: "",
      postalCode: "",
      mrt: [],
      openingHours: "",
      phone: "",
      googleMapsUrl: "",
      websiteUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      imageUrl: "",
      galleryImagesUrl: "",
      gettingThereByCar: "",
      gettingThereByPublicTransport: "",
      nearbyBusServices: "",
      nearbyLandmarks: "",
      featured: false
    }
  ],
  groceryStores: [
    {
      id: "grocery-1",
      outletName: "Little Farms Katong Point",
      slug: "little-farms-katong-point",
      description: "",
      brand: [],
      category: "",
      neighbourhood: [],
      mall: [],
      address: "",
      streetName: "",
      postalCode: "",
      mrt: [],
      openingHours: "",
      phone: "",
      googleMapsUrl: "",
      websiteUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      imageUrl: "",
      galleryImagesUrl: "",
      gettingThereByCar: "",
      gettingThereByPublicTransport: "",
      nearbyBusServices: "",
      nearbyLandmarks: "",
      featured: false
    }
  ],
  convenienceStores: [
    {
      id: "convenience-1",
      outletName: "7-Eleven Orchard",
      slug: "7-eleven-orchard",
      description: "",
      brand: [],
      category: "",
      neighbourhood: [],
      mall: [],
      address: "",
      streetName: "",
      postalCode: "",
      mrt: [],
      openingHours: "",
      phone: "",
      googleMapsUrl: "",
      websiteUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      imageUrl: "",
      galleryImagesUrl: "",
      gettingThereByCar: "",
      gettingThereByPublicTransport: "",
      nearbyBusServices: "",
      nearbyLandmarks: "",
      featured: false
    }
  ],
  generalStores: [
    {
      id: "general-1",
      outletName: "ABC General Store",
      slug: "abc-general-store",
      description: "",
      brand: [],
      category: "",
      neighbourhood: [],
      mall: [],
      address: "",
      streetName: "",
      postalCode: "",
      mrt: [],
      openingHours: "",
      phone: "",
      googleMapsUrl: "",
      websiteUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      imageUrl: "",
      galleryImagesUrl: "",
      gettingThereByCar: "",
      gettingThereByPublicTransport: "",
      nearbyBusServices: "",
      nearbyLandmarks: "",
      featured: false
    }
  ],
  promotions: [
    {
      id: "promo-1",
      title: "Brand Weekly Promotion",
      slug: "brand-promotions",
      collectionSlug: "brand-promotions",
      collectionLabel: "Brand Promotions",
      description: "",
      shortDescription: "",
      validity: "1 May 2026 to 31 May 2026",
      imageUrls: [],
      brand: { id: "brand-1", name: "Brand", slug: "brand" },
      linkedOutlets: [],
      detailPath: "/promotions/brand-promotions-weekly"
    }
  ],
  promotionCollections: [
    {
      label: "Brand Promotions",
      slug: "brand-promotions",
      brandSlug: "brand"
    }
  ],
  featuredSupermarkets: [],
  categories: []
} as DirectoryData;

const projectRoot = process.cwd();

describe("resolveSiteUrl", () => {
  test("defaults to the official supermarket.sg domain", () => {
    expect(resolveSiteUrl(undefined)).toBe("https://supermarket.sg");
  });

  test("normalizes a configured site URL for canonical search assets", () => {
    expect(resolveSiteUrl("https://example.com/")).toBe("https://example.com");
  });
});

describe("getSitemapPaths", () => {
  test("lists crawlable public pages as slash-terminated final URLs and excludes the search page", () => {
    expect(getSitemapPaths(directoryData)).toEqual([
      "/",
      "/directory/",
      "/supermarkets/",
      "/grocery-stores/",
      "/convenience-stores/",
      "/general-stores/",
      "/brands/",
      "/neighbourhoods/",
      "/promotions/",
      "/brand-promotions/",
      "/brands/brand/",
      "/neighbourhoods/hood/",
      "/malls/mall/",
      "/mrt-stations/station/",
      "/supermarkets/brand/",
      "/supermarkets/brand-hood/",
      "/supermarkets/brand-valley/",
      "/grocery-stores/little-farms-katong-point/",
      "/convenience-stores/7-eleven-orchard/",
      "/general-stores/abc-general-store/",
      "/promotions/brand-promotions-weekly/"
    ]);
  });
});

describe("canonicalPath", () => {
  test("normalizes site paths to the final slash-terminated URL form", () => {
    expect(canonicalPath("/directory")).toBe("/directory/");
    expect(canonicalPath("/supermarkets/brand-hood/")).toBe("/supermarkets/brand-hood/");
    expect(canonicalPath("/")).toBe("/");
  });

  test("preserves query strings while normalizing the pathname", () => {
    expect(canonicalPath("/directory?brand=fairprice")).toBe("/directory/?brand=fairprice");
  });
});

describe("buildSitemapXml", () => {
  test("serializes canonical URLs without query-only search variants", () => {
    const sitemap = buildSitemapXml(directoryData, "https://example.com/");

    expect(sitemap).toContain("<loc>https://example.com/supermarkets/brand-hood/</loc>");
    expect(sitemap).not.toContain("/search");
    expect(sitemap).not.toContain("?q=");
  });
});

describe("search crawler assets", () => {
  test("uses the generated sitemap route instead of a stale public sitemap file", () => {
    expect(existsSync(join(projectRoot, "src/pages/sitemap.xml.ts"))).toBe(true);
    expect(existsSync(join(projectRoot, "public/sitemap.xml"))).toBe(false);
  });

  test("provides a noindex 404 page for unknown static routes", () => {
    const notFoundPage = readFileSync(join(projectRoot, "src/pages/404.astro"), "utf8");

    expect(notFoundPage).toContain('robots="noindex, follow"');
  });
});

describe("buildRobotsTxt", () => {
  test("allows crawling and points crawlers at the sitemap", () => {
    expect(buildRobotsTxt("https://example.com/")).toBe(
      [
        "User-agent: *",
        "Allow: /",
        "Sitemap: https://example.com/sitemap.xml"
      ].join("\n")
    );
  });
});

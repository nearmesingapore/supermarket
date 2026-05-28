import { describe, expect, test } from "vitest";
import type { DirectoryData } from "./airtable";
import {
  buildRobotsTxt,
  buildSitemapXml,
  getSitemapPaths,
  resolveSiteUrl
} from "./seo";

const directoryData = {
  brands: [{ id: "brand-1", name: "Brand", slug: "brand", count: 1 }],
  supermarketBrands: [{ id: "brand-1", name: "Brand", slug: "brand", count: 1 }],
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
  featuredSupermarkets: [],
  categories: []
} as DirectoryData;

describe("resolveSiteUrl", () => {
  test("defaults to the official supermarket.sg domain", () => {
    expect(resolveSiteUrl(undefined)).toBe("https://supermarket.sg");
  });

  test("normalizes a configured site URL for canonical search assets", () => {
    expect(resolveSiteUrl("https://example.com/")).toBe("https://example.com");
  });
});

describe("getSitemapPaths", () => {
  test("lists crawlable public pages and excludes the search page", () => {
    expect(getSitemapPaths(directoryData)).toEqual([
      "/",
      "/directory",
      "/supermarkets",
      "/grocery-stores",
      "/brands",
      "/neighbourhoods",
      "/brands/brand",
      "/neighbourhoods/hood",
      "/malls/mall",
      "/mrt-stations/station",
      "/supermarkets/brand-hood",
      "/grocery-stores/little-farms-katong-point"
    ]);
  });
});

describe("buildSitemapXml", () => {
  test("serializes canonical URLs without query-only search variants", () => {
    const sitemap = buildSitemapXml(directoryData, "https://example.com/");

    expect(sitemap).toContain("<loc>https://example.com/supermarkets/brand-hood</loc>");
    expect(sitemap).not.toContain("/search");
    expect(sitemap).not.toContain("?q=");
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

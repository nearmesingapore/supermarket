import { describe, expect, test } from "vitest";
import type { DirectoryData } from "./airtable";
import {
  buildFaqPageSchema,
  buildRobotsTxt,
  canonicalPath,
  buildSitemapXml,
  getSitemapPaths,
  resolveSiteUrl
} from "./seo";

const directoryData = {
  brands: [{ id: "brand-1", name: "Brand", slug: "brand", count: 1 }],
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
      websiteUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      imageUrl: "",
      galleryImageUrls: [],
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
      galleryImageUrls: [],
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
      galleryImageUrls: [],
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
      galleryImageUrls: [],
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
      linkedOutlets: []
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

describe("resolveSiteUrl", () => {
  test("defaults to the official supermarket.sg domain", () => {
    expect(resolveSiteUrl(undefined)).toBe("https://supermarket.sg");
  });

  test("normalizes a configured site URL for canonical search assets", () => {
    expect(resolveSiteUrl("https://example.com/")).toBe("https://example.com");
  });
});

describe("getSitemapPaths", () => {
  test("lists crawlable public pages as slash-terminated final URLs and excludes search and promotion detail pages", () => {
    expect(getSitemapPaths(directoryData)).toEqual([
      "/",
      "/directory/",
      "/supermarkets/",
      "/grocery-stores/",
      "/convenience-stores/",
      "/general-stores/",
      "/brands/",
      "/neighbourhoods/",
      "/brand-promotions/",
      "/brands/brand/",
      "/neighbourhoods/hood/",
      "/malls/mall/",
      "/mrt-stations/station/",
      "/supermarkets/brand-hood/",
      "/grocery-stores/little-farms-katong-point/",
      "/convenience-stores/7-eleven-orchard/",
      "/general-stores/abc-general-store/"
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
    expect(sitemap).toContain("<loc>https://example.com/brand-promotions/</loc>");
    expect(sitemap).not.toContain("/search");
    expect(sitemap).not.toContain("?q=");
    expect(sitemap).not.toContain("/promotions/brand-promotions-promo-1/");
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

describe("buildFaqPageSchema", () => {
  test("builds FAQPage JSON-LD from normalized FAQ items", () => {
    expect(buildFaqPageSchema([
      {
        question: "What is the promotion today?",
        answer: "Scroll up for current deals."
      }
    ])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the promotion today?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Scroll up for current deals."
          }
        }
      ]
    });
  });
});

import { afterEach, describe, expect, test, vi } from "vitest";
import {
  assertAirtableEnv,
  fetchAirtableRecords,
  getBrandPromotions,
  getDirectoryData,
  getFirstInitial,
  getSupermarketBrandPages,
  isValidNeighbourhoodName,
  resetDirectoryCacheForTests,
  resolveLinks
} from "./airtable";
import { hasTaxonomyImage, splitDescriptionParagraphs, truncateWords } from "./content";

afterEach(() => {
  vi.restoreAllMocks();
  resetDirectoryCacheForTests();
  delete process.env.AIRTABLE_API_KEY;
  delete process.env.AIRTABLE_BASE_ID;
});

describe("assertAirtableEnv", () => {
  test("throws a clear setup error when the API key is missing", () => {
    expect(() =>
      assertAirtableEnv({ AIRTABLE_BASE_ID: "base" })
    ).toThrow("Missing AIRTABLE_API_KEY or AIRTABLE_PERSONAL_ACCESS_TOKEN. Copy .env.example to .env and add your key.");
  });

  test("accepts the Airtable personal access token env name used by the local site", () => {
    expect(
      assertAirtableEnv({
        AIRTABLE_PERSONAL_ACCESS_TOKEN: "pat-key",
        AIRTABLE_BASE_ID: "base"
      })
    ).toEqual({ apiKey: "pat-key", baseId: "base" });
  });
});

describe("fetchAirtableRecords", () => {
  test("continues requesting records until Airtable stops returning an offset", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          records: Array.from({ length: 100 }, (_, index) => ({
            id: `first-${index}`,
            fields: {}
          })),
          offset: "next-page"
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          records: Array.from({ length: 7 }, (_, index) => ({
            id: `second-${index}`,
            fields: {}
          }))
        })
      });

    const records = await fetchAirtableRecords("base", "table", "key", fetchMock);

    expect(records).toHaveLength(107);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain("pageSize=100");
    expect(fetchMock.mock.calls[1][0]).toContain("offset=next-page");
  });
});

describe("getDirectoryData", () => {
  test("rejects empty Airtable data instead of publishing an incomplete directory", async () => {
    process.env.AIRTABLE_API_KEY = "key";
    process.env.AIRTABLE_BASE_ID = "base";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] })
    } as Response);

    await expect(getDirectoryData()).rejects.toThrow(
      "No supermarket records found in Airtable. Check AIRTABLE_BASE_ID and table permissions before building the directory."
    );
  });

  test("loads supermarkets, grocery stores, convenience stores, and general stores without removed Airtable fields", async () => {
    process.env.AIRTABLE_API_KEY = "key";
    process.env.AIRTABLE_BASE_ID = "base";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] })
    } as Response);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "brand-1",
            fields: {
              fldPwU2iFk9wEsmba: "Supermarket Brand",
              fldA09ghMk1pINerc: "Supermarket-Brand/",
              fldp86xMlykctfvv0: "https://example.com/brand.jpg",
              fldgNoZbK2EY6KFWJ: "A useful brand description.",
              fldoS3tnGZ48XOqNn: "Q: Does this brand have a FAQ?\nA: Yes, from Airtable."
            }
          },
          {
            id: "brand-2",
            fields: {
              fldPwU2iFk9wEsmba: "Grocery Brand",
              fldgNoZbK2EY6KFWJ: "A useful grocery brand description."
            }
          },
          {
            id: "brand-3",
            fields: {
              fldPwU2iFk9wEsmba: "Convenience Brand",
              fldA09ghMk1pINerc: "convenience-brand",
              fldgNoZbK2EY6KFWJ: "A useful convenience brand description."
            }
          },
          {
            id: "brand-4",
            fields: {
              fldPwU2iFk9wEsmba: "General Brand",
              fldA09ghMk1pINerc: "general-brand",
              fldgNoZbK2EY6KFWJ: "A useful general brand description."
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "hood-1",
            fields: {
              fld9PsIecu0V0LYkd: "Hood",
              fldEFQ1jysfxziqfM: "/Hood/",
              fldhOHgO7KBCTidHJ: "https://example.com/hood.jpg",
              fldAVsFHnsfOYcDOZ: "A helpful neighbourhood description."
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "mall-1",
            fields: {
              fldiH8RSpJ81XjnTB: "Mall",
              fld0cC7txqdeM3u83: "Mall",
              fldqvNsAVvEFOVRFn: "https://example.com/mall.jpg",
              fldAQDK706ZDbtQhk: "A useful mall description."
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ records: [] })
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "supermarket-1",
            fields: {
              fldaSNrp6I8auhsxM: "Brand Tampines",
              fldm8OUq811I4sDFL: "Brand-Tampines/",
              fldIrfJrZTsErftMN: "A bright outlet with fresh produce and pantry staples.",
              fldiDxIqZZROJ2PiT: ["brand-1"],
              fld8gPZjOWGMBfMer: "Supermarket",
              fldoROJgXxEo5phwJ: ["hood-1"],
              fldw8QjjvT68cDC8X: ["mall-1"],
              fldUPgDqc9H0DwX1l: true,
              fldbEV2NcQ7bZ0M0a: "Park at the basement car park.\nUse lift lobby A.",
              fldYCaW3KbZmmJS4I: "Take the MRT to Ang Mo Kio.\nWalk through the town centre.",
              fld3d3y5k1e72EAHK: "Bus 22, 25, 73",
              fldM9U6ChPSfkdgg2: "AMK Hub\nAng Mo Kio Town Garden"
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "grocery-store-1",
            fields: {
              fld7Le0O7ItTSeses: "Little Farms Katong Point",
              fldj1ftP91mrspDmr: "little-farms-katong-point",
              fldFkGiQ0TNnPcttt: "Specialty grocery store with imported produce and pantry essentials.",
              fldfwYhP0Zcx7ZPZz: ["brand-2"],
              fld59gyIPW1vZcMV7: "Grocery Store",
              fldlKfiFYxZ7tmhdp: ["hood-1"],
              fldt1hSIwTrRAACPD: ["mall-1"],
              fldoC9YNovTHdQDqX: "451 Joo Chiat Road",
              fld6DHKZ6PL67807S: 427664
            }
          },
          {
            id: "grocery-store-duplicate",
            fields: {
              fld7Le0O7ItTSeses: "Little Farms Katong Point",
              fldj1ftP91mrspDmr: "little-farms-katong-point"
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "convenience-store-1",
            fields: {
              fldU1hXFDewIqnsWb: "7-Eleven Orchard",
              fld6hiqGFxpg0yD4a: "7-eleven-orchard",
              fldsAJfHwpQcnltbc: "Convenience store with snacks, drinks, and daily essentials.",
              fld2M1eGwvfmF8PHi: ["brand-3"],
              fldSpjvzls4kxlMDQ: "Convenience Store",
              fld80ifwu32W1vhV8: ["hood-1"],
              fldghkPz2puG8JCxm: ["mall-1"],
              fldbScVEU1WwLZD8G: "1 Orchard Road",
              fldTTKHQClOVFh0PB: 238888,
              fldci2d92Qe14atvS: "https://example.com/7-eleven",
              fldituodlWxyfVlp6: "https://example.com/convenience-one.jpg, https://example.com/convenience-two.jpg"
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "general-store-1",
            fields: {
              fldvWCMXQFzECkA4m: "ABC General Store",
              fldHcDfYSYsccvLcl: "abc-general-store",
              fld3v44ZJQT8ziBjn: "Neighbourhood general store with household staples.",
              fldDHm3YJWiiR5XPt: ["brand-4"],
              fldtkEkRyT7gJiUL1: "General Store",
              fldJVD4OHu5Sdsp3j: ["hood-1"],
              fldRcFERfQxCkGKFx: ["mall-1"],
              fldMNxKW7sZsXWLgR: "10 Market Street",
              flduO5w8PMRRRe8XM: 488888,
              fldNdn2rfhhXg7BD3: "https://example.com/abc-general-store",
              fldToPdvynAurStxh: "https://example.com/general-one.jpg, https://example.com/general-two.jpg"
            }
          }
        ]
      })
    } as Response);

    const data = await getDirectoryData();

    expect(data.supermarkets).toHaveLength(1);
    expect(data.supermarkets[0]).toMatchObject({
      slug: "brand-tampines",
      description: "A bright outlet with fresh produce and pantry staples.",
      gettingThereByCar: "Park at the basement car park.\nUse lift lobby A.",
      gettingThereByPublicTransport: "Take the MRT to Ang Mo Kio.\nWalk through the town centre.",
      nearbyBusServices: "Bus 22, 25, 73",
      nearbyLandmarks: "AMK Hub\nAng Mo Kio Town Garden"
    });
    expect(data.groceryStores).toHaveLength(1);
    expect(data.groceryStores[0]).toMatchObject({
      outletName: "Little Farms Katong Point",
      slug: "little-farms-katong-point",
      description: "Specialty grocery store with imported produce and pantry essentials.",
      address: "451 Joo Chiat Road",
      postalCode: "427664"
    });
    expect(data.convenienceStores).toHaveLength(1);
    expect(data.convenienceStores[0]).toMatchObject({
      outletName: "7-Eleven Orchard",
      slug: "7-eleven-orchard",
      description: "Convenience store with snacks, drinks, and daily essentials.",
      address: "1 Orchard Road",
      postalCode: "238888",
      websiteUrl: "https://example.com/7-eleven",
      galleryImagesUrl: "https://example.com/convenience-one.jpg, https://example.com/convenience-two.jpg"
    });
    expect(data.generalStores).toHaveLength(1);
    expect(data.generalStores[0]).toMatchObject({
      outletName: "ABC General Store",
      slug: "abc-general-store",
      description: "Neighbourhood general store with household staples.",
      address: "10 Market Street",
      postalCode: "488888",
      websiteUrl: "https://example.com/abc-general-store",
      galleryImagesUrl: "https://example.com/general-one.jpg, https://example.com/general-two.jpg"
    });
    expect(data.brands[0]).toMatchObject({
      name: "Supermarket Brand",
      slug: "supermarket-brand",
      imageUrl: "https://example.com/brand.jpg",
      description: "A useful brand description.",
      brandFaq: "Q: Does this brand have a FAQ?\nA: Yes, from Airtable."
    });
    expect(data.brands.find((brand) => brand.slug === "grocery-brand")).toMatchObject({
      name: "Grocery Brand",
      slug: "grocery-brand",
      count: 1,
      description: "A useful grocery brand description."
    });
    expect(data.featuredBrands.map((brand) => brand.slug)).toEqual(["supermarket-brand"]);
    expect(data.supermarketBrands.map((brand) => brand.slug)).toEqual(["supermarket-brand"]);
    expect(data.groceryStoreBrands.map((brand) => brand.slug)).toEqual(["convenience-brand", "general-brand", "grocery-brand"]);
    expect(data.neighbourhoods[0]).toMatchObject({
      name: "Hood",
      slug: "hood",
      imageUrl: "https://example.com/hood.jpg",
      description: "A helpful neighbourhood description."
    });
    expect(data.malls[0]).toMatchObject({
      name: "Mall",
      slug: "mall",
      imageUrl: "https://example.com/mall.jpg",
      description: "A useful mall description."
    });
    expect(data.supermarkets[0]).not.toHaveProperty("tiktokUrl");
    expect(data.supermarkets[0]).not.toHaveProperty("priceRange");
    expect(data.supermarkets[0]).not.toHaveProperty("halal");
    expect(data.supermarkets[0]).not.toHaveProperty("seatingAvailable");
    expect(data.supermarkets[0]).not.toHaveProperty("deliveryLinks");
    expect(data.convenienceStores[0]).not.toHaveProperty("published");
    expect(data.generalStores[0]).not.toHaveProperty("published");
    expect(data).not.toHaveProperty("priceRanges");
    expect(data).not.toHaveProperty("halalOptions");
  });

  test("joins Category rows onto matching outlets", async () => {
    process.env.AIRTABLE_API_KEY = "key";
    process.env.AIRTABLE_BASE_ID = "base";

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const tableId = url.match(/\/base\/([^?]+)/)?.[1];
      const recordsByTable: Record<string, unknown[]> = {
        tblK5rFjHnVqd2g6U: [],
        tblLPGvEo7lH4pLzR: [],
        tblHHymwYJJQH5UK6: [],
        tblxME1R6ILNCa8Af: [],
        tblE6IK77xz0ChbMT: [
          {
            id: "supermarket-1",
            fields: {
              fldaSNrp6I8auhsxM: "FairPrice Tampines",
              fldm8OUq811I4sDFL: "fairprice-tampines"
            }
          }
        ],
        tblBZ9jw8xUJ0ebtz: [
          {
            id: "grocery-store-1",
            fields: {
              fld7Le0O7ItTSeses: "Little Farms Katong Point",
              fldj1ftP91mrspDmr: "little-farms-katong-point"
            }
          }
        ],
        tblofcgnE3Xyynbbi: [],
        tblZax5FRu0uKkjjt: [],
        tblqV5WUpFioRXHaj: [
          {
            id: "category-row-1",
            fields: {
              fldFoFDlEBejqe0dp: "FairPrice Tampines",
              fldJm83meJBBUanjh: "Hypermarket",
              fldk8snhvkF8tDEce: "https://affiliate.example/fairprice",
              fldmyBi6BM3Aqf6hM: [
                {
                  url: "https://cdn.example/fairprice-banner.jpg",
                  filename: "fairprice-banner.jpg"
                }
              ]
            }
          },
          {
            id: "category-row-2",
            fields: {
              fldFoFDlEBejqe0dp: "Little Farms Katong Point",
              fldJm83meJBBUanjh: "Specialty Grocery",
              fldk8snhvkF8tDEce: "https://affiliate.example/little-farms"
            }
          }
        ],
        tbl5kjc7ZgUDIn7ZV: [],
        tblmrHqYjxANlyqqJ: [],
        tblWdAbg7RqHoxFax: []
      };

      return {
        ok: true,
        json: async () => ({ records: recordsByTable[tableId || ""] || [] })
      } as Response;
    });

    const data = await getDirectoryData();

    expect(data.supermarkets[0].category).toBe("Hypermarket");
    expect(data.groceryStores[0].category).toBe("Specialty Grocery");
    expect(data.supermarkets[0].affiliateBanner).toEqual({
      affiliateLink: "https://affiliate.example/fairprice",
      imageUrl: "https://cdn.example/fairprice-banner.jpg",
      altText: "FairPrice Tampines affiliate banner"
    });
    expect(data.groceryStores[0].affiliateBanner).toBeUndefined();
  });

  test("normalizes brand promotion tables and resolves them to the matching brand", async () => {
    process.env.AIRTABLE_API_KEY = "key";
    process.env.AIRTABLE_BASE_ID = "base";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] })
    } as Response);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "brand-fairprice",
            fields: {
              fldPwU2iFk9wEsmba: "FairPrice",
              fldA09ghMk1pINerc: "FairPrice"
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "supermarket-1",
            fields: {
              fldaSNrp6I8auhsxM: "FairPrice Tampines",
              fldm8OUq811I4sDFL: "fairprice-tampines",
              fldiDxIqZZROJ2PiT: ["brand-fairprice"]
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "promo-1",
            fields: {
              fldrSaNXhuOTMYwvZ: "FairPrice Weekly Deals",
              fldsobknyCZSzcvD4: "Weekly-Deals",
              fldM0nFBIYYMSXafz: "21 May 2026 to 10 June 2026",
              fldS9EKQmcjlegPgy: "Save on pantry staples.\n\nSource: FairPrice",
              fld1umirXIZzBLFPP: "https://example.com/fairprice.jpg"
            }
          }
        ]
      })
    } as Response);
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ records: [] }) } as Response);

    const data = await getDirectoryData();

    expect(data.promotions).toHaveLength(1);
    expect(data.promotions[0]).toMatchObject({
      id: "promo-1",
      title: "FairPrice Weekly Deals",
      brand: { id: "brand-fairprice", name: "FairPrice", slug: "fairprice" },
      collectionSlug: "fairprice-promotions",
      detailPath: "/promotions/fairprice-promotions-weekly-deals",
      imageUrls: ["https://example.com/fairprice.jpg"],
      shortDescription: "Save on pantry staples."
    });
    expect(data.promotionCollections[1]).toMatchObject({
      slug: "fairprice-promotions",
      brandSlug: "fairprice"
    });
    expect(getBrandPromotions(data.promotions, "brand-fairprice")).toHaveLength(1);
  });
});

describe("getSupermarketBrandPages", () => {
  test("creates lowercase supermarket brand landing paths for brands with more than one outlet", () => {
    const fairPrice = { id: "brand-fairprice", name: "FairPrice", slug: "FairPrice", count: 2 };
    const singleOutletBrand = { id: "brand-single", name: "Single Brand", slug: "single-brand", count: 1 };
    const outlet = {
      id: "outlet-1",
      outletName: "FairPrice Tampines",
      slug: "fairprice-tampines",
      description: "",
      brand: [{ id: fairPrice.id, name: fairPrice.name, slug: fairPrice.slug }],
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
    };

    expect(
      getSupermarketBrandPages({
        brands: [fairPrice, singleOutletBrand],
        featuredBrands: [fairPrice],
        supermarketBrands: [fairPrice, singleOutletBrand],
        groceryStoreBrands: [],
        neighbourhoods: [],
        malls: [],
        mrtStations: [],
        supermarkets: [outlet, { ...outlet, id: "outlet-2", slug: "fairprice-bedok", outletName: "FairPrice Bedok" }],
        groceryStores: [],
        convenienceStores: [],
        generalStores: [],
        promotions: [],
        promotionCollections: [],
        featuredSupermarkets: [],
        categories: []
      })
    ).toEqual([
      {
        brand: fairPrice,
        pathSlug: "fairprice",
        outlets: [{ ...outlet, id: "outlet-2", slug: "fairprice-bedok", outletName: "FairPrice Bedok" }, outlet]
      }
    ]);
  });
});

describe("resolveLinks", () => {
  test("resolves linked record ids into names and slugs while ignoring unknown links", () => {
    const links = resolveLinks(["recA", "recMissing"], new Map([
      ["recA", { id: "recA", name: "Resolved", slug: "resolved" }]
    ]));

    expect(links).toEqual([{ id: "recA", name: "Resolved", slug: "resolved" }]);
  });
});

describe("isValidNeighbourhoodName", () => {
  test("filters URL-like neighbourhood names", () => {
    expect(isValidNeighbourhoodName("Woodlands")).toBe(true);
    expect(isValidNeighbourhoodName("https://example.com")).toBe(false);
    expect(isValidNeighbourhoodName("foo://bar")).toBe(false);
  });
});

describe("getFirstInitial", () => {
  test("uses the first available brand or outlet letter for image placeholders", () => {
    expect(getFirstInitial("FairPrice", "Outlet")).toBe("F");
    expect(getFirstInitial("", "Marketplace")).toBe("M");
  });
});

describe("hasTaxonomyImage", () => {
  test("only renders taxonomy image areas for real image URLs", () => {
    expect(hasTaxonomyImage("https://example.com/mall.jpg")).toBe(true);
    expect(hasTaxonomyImage("")).toBe(false);
    expect(hasTaxonomyImage("   ")).toBe(false);
    expect(hasTaxonomyImage(undefined)).toBe(false);
  });
});

describe("splitDescriptionParagraphs", () => {
  test("preserves Airtable paragraph breaks while trimming surrounding whitespace", () => {
    expect(splitDescriptionParagraphs("First paragraph.\n\nSecond paragraph.\nThird line.")).toEqual([
      "First paragraph.",
      "Second paragraph.\nThird line."
    ]);
  });
});

describe("truncateWords", () => {
  test("limits long descriptions to whole words and appends an ellipsis", () => {
    const words = Array.from({ length: 42 }, (_, index) => `word${index + 1}`).join(" ");

    expect(truncateWords(words, 40)).toBe(
      `${Array.from({ length: 40 }, (_, index) => `word${index + 1}`).join(" ")}...`
    );
  });

  test("keeps short descriptions unchanged", () => {
    expect(truncateWords("Short neighbourhood description.", 40)).toBe("Short neighbourhood description.");
  });
});

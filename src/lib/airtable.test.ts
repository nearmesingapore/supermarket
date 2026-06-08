import { afterEach, describe, expect, test, vi } from "vitest";
import {
  assertAirtableEnv,
  fetchAirtableRecords,
  getBrandPromotions,
  getDirectoryData,
  getFirstInitial,
  isValidNeighbourhoodName,
  resetDirectoryCacheForTests,
  resolveLinks
} from "./airtable";
import { hasTaxonomyImage, parseFaqItems, splitDescriptionParagraphs } from "./content";

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
              fldPwU2iFk9wEsmba: "Brand",
              fldA09ghMk1pINerc: "brand",
              fldp86xMlykctfvv0: "https://example.com/brand.jpg",
              fldgNoZbK2EY6KFWJ: "A useful brand description.",
              fldoS3tnGZ48XOqNn: "What is this brand known for?\nFresh groceries and weekly deals."
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
              fldEFQ1jysfxziqfM: "hood",
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
              fld0cC7txqdeM3u83: "mall",
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
              fldm8OUq811I4sDFL: "brand-tampines",
              fldIrfJrZTsErftMN: "A bright outlet with fresh produce and pantry staples.",
              fldiDxIqZZROJ2PiT: ["brand-1"],
              fld8gPZjOWGMBfMer: "Supermarket",
              fldoROJgXxEo5phwJ: ["hood-1"],
              fldw8QjjvT68cDC8X: ["mall-1"],
              fldbEV2NcQ7bZ0M0a: "Park at the basement car park.\nUse lift lobby A.",
              fldYCaW3KbZmmJS4I: "Take the MRT to Ang Mo Kio.\nWalk through the town centre.",
              fld3d3y5k1e72EAHK: "Bus 22, 25, 73",
              fldM9U6ChPSfkdgg2: "AMK Hub\nAng Mo Kio Town Garden",
              fldyk0SXOq90jPl0H: "https://example.com/supermarket-one.jpg, https://example.com/supermarket-two.jpg"
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
              fldfwYhP0Zcx7ZPZz: ["brand-1"],
              fld59gyIPW1vZcMV7: "Grocery Store",
              fldlKfiFYxZ7tmhdp: ["hood-1"],
              fldt1hSIwTrRAACPD: ["mall-1"],
              fldoC9YNovTHdQDqX: "451 Joo Chiat Road",
              fld6DHKZ6PL67807S: 427664,
              fldvdrrmPquJHMlHn: " https://example.com/grocery-one.jpg,https://example.com/grocery-two.jpg "
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
              fld2M1eGwvfmF8PHi: ["brand-1"],
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
              fldDHm3YJWiiR5XPt: ["brand-1"],
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
      description: "A bright outlet with fresh produce and pantry staples.",
      gettingThereByCar: "Park at the basement car park.\nUse lift lobby A.",
      gettingThereByPublicTransport: "Take the MRT to Ang Mo Kio.\nWalk through the town centre.",
      nearbyBusServices: "Bus 22, 25, 73",
      nearbyLandmarks: "AMK Hub\nAng Mo Kio Town Garden",
      galleryImageUrls: [
        "https://example.com/supermarket-one.jpg",
        "https://example.com/supermarket-two.jpg"
      ]
    });
    expect(data.groceryStores).toHaveLength(1);
    expect(data.groceryStores[0]).toMatchObject({
      outletName: "Little Farms Katong Point",
      slug: "little-farms-katong-point",
      description: "Specialty grocery store with imported produce and pantry essentials.",
      address: "451 Joo Chiat Road",
      postalCode: "427664",
      galleryImageUrls: [
        "https://example.com/grocery-one.jpg",
        "https://example.com/grocery-two.jpg"
      ]
    });
    expect(data.convenienceStores).toHaveLength(1);
    expect(data.convenienceStores[0]).toMatchObject({
      outletName: "7-Eleven Orchard",
      slug: "7-eleven-orchard",
      description: "Convenience store with snacks, drinks, and daily essentials.",
      address: "1 Orchard Road",
      postalCode: "238888",
      websiteUrl: "https://example.com/7-eleven",
      galleryImageUrls: [
        "https://example.com/convenience-one.jpg",
        "https://example.com/convenience-two.jpg"
      ]
    });
    expect(data.generalStores).toHaveLength(1);
    expect(data.generalStores[0]).toMatchObject({
      outletName: "ABC General Store",
      slug: "abc-general-store",
      description: "Neighbourhood general store with household staples.",
      address: "10 Market Street",
      postalCode: "488888",
      websiteUrl: "https://example.com/abc-general-store",
      galleryImageUrls: [
        "https://example.com/general-one.jpg",
        "https://example.com/general-two.jpg"
      ]
    });
    expect(data.brands[0]).toMatchObject({
      name: "Brand",
      slug: "brand",
      imageUrl: "https://example.com/brand.jpg",
      description: "A useful brand description.",
      brandFaq: "What is this brand known for?\nFresh groceries and weekly deals."
    });
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
    expect(data.supermarkets[0]).not.toHaveProperty("published");
    expect(data.groceryStores[0]).not.toHaveProperty("published");
    expect(data.convenienceStores[0]).not.toHaveProperty("published");
    expect(data.generalStores[0]).not.toHaveProperty("published");
    expect(data).not.toHaveProperty("priceRanges");
    expect(data).not.toHaveProperty("halalOptions");
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
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [
          {
            id: "promo-1",
            fields: {
              fldrSaNXhuOTMYwvZ: "FairPrice Weekly Deals",
              fldsobknyCZSzcvD4: "Fairprice-Promotions",
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
      brand: { id: "brand-fairprice", name: "FairPrice", slug: "FairPrice" },
      collectionSlug: "fairprice-promotions",
      imageUrls: ["https://example.com/fairprice.jpg"],
      shortDescription: "Save on pantry staples."
    });
    expect(data.promotions[0]).not.toHaveProperty("detailPath");
    expect(getBrandPromotions(data.promotions, "brand-fairprice")).toHaveLength(1);
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

describe("parseFaqItems", () => {
  test("converts multiline FAQ text into question and answer pairs", () => {
    expect(parseFaqItems("**What is the promotion today?**\nScroll up for current deals.\n\nWhen are offers updated?\nNew deals are added regularly.")).toEqual([
      {
        question: "What is the promotion today?",
        answer: "Scroll up for current deals."
      },
      {
        question: "When are offers updated?",
        answer: "New deals are added regularly."
      }
    ]);
  });
});

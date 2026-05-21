import { afterEach, describe, expect, test, vi } from "vitest";
import {
  assertAirtableEnv,
  fetchAirtableRecords,
  getDirectoryData,
  getFirstInitial,
  isValidNeighbourhoodName,
  resolveLinks
} from "./airtable";
import { hasTaxonomyImage, splitDescriptionParagraphs, truncateWords } from "./content";

afterEach(() => {
  vi.restoreAllMocks();
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

  test("loads supermarkets and grocery stores without removed Airtable fields", async () => {
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
              fldA09ghMk1pINerc: "supermarket-brand",
              fldp86xMlykctfvv0: "https://example.com/brand.jpg",
              fldgNoZbK2EY6KFWJ: "A useful brand description."
            }
          },
          {
            id: "brand-2",
            fields: {
              fldPwU2iFk9wEsmba: "Grocery Brand",
              fldgNoZbK2EY6KFWJ: "A useful grocery brand description."
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
              fldKtJIAHMLqSCEeP: true
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

    const data = await getDirectoryData();

    expect(data.supermarkets).toHaveLength(1);
    expect(data.supermarkets[0]).toMatchObject({
      description: "A bright outlet with fresh produce and pantry staples."
    });
    expect(data.groceryStores).toHaveLength(1);
    expect(data.groceryStores[0]).toMatchObject({
      outletName: "Little Farms Katong Point",
      slug: "little-farms-katong-point",
      description: "Specialty grocery store with imported produce and pantry essentials.",
      address: "451 Joo Chiat Road",
      postalCode: "427664"
    });
    expect(data.brands[0]).toMatchObject({
      name: "Supermarket Brand",
      slug: "supermarket-brand",
      imageUrl: "https://example.com/brand.jpg",
      description: "A useful brand description."
    });
    expect(data.brands[1]).toMatchObject({
      name: "Grocery Brand",
      slug: "grocery-brand",
      count: 1,
      description: "A useful grocery brand description."
    });
    expect(data.supermarketBrands.map((brand) => brand.slug)).toEqual(["supermarket-brand"]);
    expect(data.groceryStoreBrands.map((brand) => brand.slug)).toEqual(["grocery-brand"]);
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
    expect(data).not.toHaveProperty("priceRanges");
    expect(data).not.toHaveProperty("halalOptions");
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

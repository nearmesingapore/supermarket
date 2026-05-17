import { afterEach, describe, expect, test, vi } from "vitest";
import { assertAirtableEnv, fetchAirtableRecords, getFirstInitial, isValidNeighbourhoodName, resolveLinks } from "./airtable";

afterEach(() => { vi.restoreAllMocks(); });

describe("assertAirtableEnv", () => {
  test("throws a clear setup error when the API key is missing", () => {
    expect(() => assertAirtableEnv({ AIRTABLE_BASE_ID: "base" })).toThrow("Missing AIRTABLE_API_KEY. Copy .env.example to .env and add your key.");
  });
});

describe("fetchAirtableRecords", () => {
  test("continues requesting records until Airtable stops returning an offset", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ records: Array.from({ length: 100 }, (_, index) => ({ id: `first-${index}`, fields: {} })), offset: "next-page" }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ records: Array.from({ length: 7 }, (_, index) => ({ id: `second-${index}`, fields: {} })) }) });
    const records = await fetchAirtableRecords("base", "table", "key", fetchMock);
    expect(records).toHaveLength(107);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain("pageSize=100");
    expect(fetchMock.mock.calls[1][0]).toContain("offset=next-page");
  });
});

describe("resolveLinks", () => {
  test("resolves linked record ids into names and slugs while ignoring unknown links", () => {
    const links = resolveLinks(["recA", "recMissing"], new Map([["recA", { id: "recA", name: "Resolved", slug: "resolved" }]]));
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

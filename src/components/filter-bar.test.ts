import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("directory filters", () => {
  it("matches filter values against all card metadata values", () => {
    const filterBar = read("src/components/FilterBar.astro");
    const listingCard = read("src/components/ListingCard.astro");

    expect(listingCard).toContain("filterValue(outlet.brand)");
    expect(listingCard).toContain("filterValue(outlet.neighbourhood)");
    expect(listingCard).toContain("filterValue(outlet.mrt)");
    expect(listingCard).toContain("filterValue(outlet.mall)");
    expect(filterBar).toContain("getFilterValues(card, key).includes(value)");
  });
});

import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

describe("outlet details rendering", () => {
  it("renders new supermarket-only travel and landmark detail cells in the existing metadata grid", () => {
    const supermarketPage = read("src/pages/supermarkets/[slug].astro");
    const groceryStorePage = read("src/pages/grocery-stores/[slug].astro");
    const details = read("src/components/OutletDetails.astro");

    expect(supermarketPage).toContain('import OutletDetails from "@/components/OutletDetails.astro";');
    expect(supermarketPage).toContain("<OutletDetails");
    expect(groceryStorePage).not.toContain("OutletDetails");
    expect(details).toContain("Getting There by Car");
    expect(details).toContain("Getting There by Public Transport");
    expect(details).toContain("Nearby Bus Services");
    expect(details).toContain("Nearby Landmarks");
    expect(details).toContain("whitespace-pre-line");
  });
});

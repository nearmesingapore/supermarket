import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

const expectContactDetailsUnderMap = (page: string) => {
  const map = page.indexOf("<OutletMap");
  const titleColumnStart = page.indexOf('<p class="eyebrow">', map);
  const openingHours = page.indexOf("Opening hours");
  const socialLinks = page.indexOf("Social links");

  expect(map).toBeGreaterThanOrEqual(0);
  expect(titleColumnStart).toBeGreaterThan(map);
  expect(openingHours).toBeGreaterThan(map);
  expect(openingHours).toBeLessThan(titleColumnStart);
  expect(socialLinks).toBeGreaterThan(map);
  expect(socialLinks).toBeLessThan(titleColumnStart);
};

describe("outlet details rendering", () => {
  it("renders new supermarket-only travel and landmark detail cells in the existing metadata grid", () => {
    const supermarketPage = read("src/pages/supermarkets/[slug].astro");
    const groceryStorePage = read("src/pages/grocery-stores/[slug].astro");
    const details = read("src/components/OutletDetails.astro");

    expect(supermarketPage).toContain('import OutletDetails from "@/components/OutletDetails.astro";');
    expect(supermarketPage).toContain("<OutletDetails");
    expect(supermarketPage).toContain('<dl class="mt-10 grid gap-5 border-y border-line py-8">');
    expect(supermarketPage).not.toContain('<dl class="mt-10 grid gap-5 border-y border-line py-8 sm:grid-cols-2">');
    expect(groceryStorePage).not.toContain("OutletDetails");
    expect(details).toContain("Getting There by Car");
    expect(details).toContain("Getting There by Public Transport");
    expect(details).toContain("Nearby Bus Services");
    expect(details).toContain("Nearby Landmarks");
    expect(details).toContain("whitespace-pre-line");
  });

  it("places optional contact detail cards below the map column", () => {
    expectContactDetailsUnderMap(read("src/pages/supermarkets/[slug].astro"));
    expectContactDetailsUnderMap(read("src/pages/grocery-stores/[slug].astro"));
  });
});

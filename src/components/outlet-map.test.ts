import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

describe("outlet embedded maps", () => {
  it("renders one clickable Google map below the photo gallery on both outlet pages", () => {
    const supermarketPage = read("src/pages/supermarkets/[slug].astro");
    const groceryStorePage = read("src/pages/grocery-stores/[slug].astro");
    const map = read("src/components/OutletMap.astro");
    const mapInvocation = "<OutletMap";

    for (const page of [supermarketPage, groceryStorePage]) {
      expect(page).toContain('import OutletMap from "@/components/OutletMap.astro";');
      const galleryPosition = page.indexOf("<OutletGallery");
      const mapPosition = page.indexOf(mapInvocation);
      const contentColumn = page.indexOf("<div>\n        <p class=\"eyebrow\">");

      expect(galleryPosition).toBeGreaterThan(-1);
      expect(mapPosition).toBeGreaterThan(galleryPosition);
      expect(mapPosition).toBeLessThan(contentColumn);
      expect(page.match(/<OutletMap/g)).toHaveLength(1);
      expect(page).toContain("googleMapsUrl={outlet.googleMapsUrl}");
      expect(page).toContain("fullAddress={fullAddress}");
    }

    expect(map).toContain("googleMapsUrl");
    expect(map).toContain("encodeURIComponent(fullAddress)");
    expect(map).not.toContain("query_place_id");
    expect(map).not.toContain("place_id:");
    expect(map).toContain("output=embed");
    expect(map).toContain("href={googleMapsUrl}");
    expect(map).toContain("target=\"_blank\"");
    expect(map).toContain("<iframe");
    expect(map).toContain("pointer-events-none");
    expect(map).toContain('loading="lazy"');
    expect(map).toContain("View on Google Maps");
  });
});

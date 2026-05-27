import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

describe("outlet gallery rendering", () => {
  it("uses one conditional gallery component on both outlet detail pages", () => {
    const supermarketPage = read("src/pages/supermarkets/[slug].astro");
    const groceryStorePage = read("src/pages/grocery-stores/[slug].astro");
    const gallery = read("src/components/OutletGallery.astro");

    expect(supermarketPage).toContain('import OutletGallery from "@/components/OutletGallery.astro";');
    expect(groceryStorePage).toContain('import OutletGallery from "@/components/OutletGallery.astro";');
    expect(supermarketPage).toContain("imageUrls={outlet.galleryImageUrls}");
    expect(groceryStorePage).toContain("imageUrls={outlet.galleryImageUrls}");
    expect(gallery).toContain("imageUrls.length > 0");
    expect(gallery).toContain("imageUrls.map");
    expect(gallery).toContain('loading="lazy"');
    expect(gallery).toContain("gallery image ${index + 1}");
  });
});

import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

describe("outlet gallery rendering", () => {
  it("renders a thumbnail lightbox gallery beneath the main image on both outlet pages", () => {
    const supermarketPage = read("src/pages/supermarkets/[slug].astro");
    const groceryStorePage = read("src/pages/grocery-stores/[slug].astro");
    const gallery = read("src/components/OutletGallery.astro");
    const invocation = '<OutletGallery outletName={outlet.outletName} galleryImagesUrl={outlet.galleryImagesUrl} />';

    expect(supermarketPage).toContain('import OutletGallery from "@/components/OutletGallery.astro";');
    expect(groceryStorePage).toContain('import OutletGallery from "@/components/OutletGallery.astro";');
    for (const page of [supermarketPage, groceryStorePage]) {
      const heroImage = page.indexOf('class="aspect-[4/3] bg-[#f2efe9]"');
      const galleryPosition = page.indexOf(invocation);
      const contentColumn = page.indexOf("<div>\n        <p class=\"eyebrow\">");

      expect(heroImage).toBeGreaterThan(-1);
      expect(galleryPosition).toBeGreaterThan(heroImage);
      expect(galleryPosition).toBeLessThan(contentColumn);
      expect(page.match(/<OutletGallery /g)).toHaveLength(1);
    }
    expect(gallery).toContain("galleryImagesUrl");
    expect(gallery).toContain('.split(",")');
    expect(gallery).toContain("imageUrls.length > 0");
    expect(gallery).toContain("imageUrls.map");
    expect(gallery).toContain("<dialog");
    expect(gallery).toContain("showModal()");
    expect(gallery).toContain(".close()");
    expect(gallery).toContain('dialog.addEventListener("cancel"');
    expect(gallery).toContain('event.key === "Escape"');
    expect(gallery).toContain("View larger");
    expect(gallery).toContain("Close expanded image");
    expect(gallery).toContain('loading="lazy"');
    expect(gallery).toContain("gallery image ${index + 1}");
    expect(gallery).toContain("data-image-fallback-label");
  });
});

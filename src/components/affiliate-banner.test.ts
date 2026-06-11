import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

describe("affiliate banner rendering", () => {
  it("renders clickable affiliate banners at the top of each outlet detail page", () => {
    const pages = [
      "src/pages/supermarkets/[slug].astro",
      "src/pages/grocery-stores/[slug].astro",
      "src/pages/convenience-stores/[slug].astro",
      "src/pages/general-stores/[slug].astro"
    ].map(read);
    const component = read("src/components/AffiliateBanner.astro");

    for (const page of pages) {
      expect(page).toContain('import AffiliateBanner from "@/components/AffiliateBanner.astro";');
      expect(page).toContain("<AffiliateBanner");
      expect(page).toContain("banner={outlet.affiliateBanner}");

      const banner = page.indexOf("<AffiliateBanner");
      const articleGrid = page.indexOf('<div class="grid gap-10', banner);
      expect(banner).toBeGreaterThan(-1);
      expect(articleGrid).toBeGreaterThan(banner);
    }

    expect(component).toContain("affiliateLink");
    expect(component).toContain("imageUrl");
    expect(component).toContain('target="_blank"');
    expect(component).toContain('rel="nofollow sponsored noopener noreferrer"');
  });
});

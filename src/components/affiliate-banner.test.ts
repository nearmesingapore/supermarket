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
    expect(component).toContain("data-affiliate-banner");
    expect(component).toContain('referrerpolicy="no-referrer"');
  });

  it("renders the secondary affiliate banner below each outlet social links section", () => {
    const pages = [
      "src/pages/supermarkets/[slug].astro",
      "src/pages/grocery-stores/[slug].astro",
      "src/pages/convenience-stores/[slug].astro",
      "src/pages/general-stores/[slug].astro"
    ].map(read);

    for (const page of pages) {
      expect(page).toContain("banner={outlet.affiliateBanner2}");

      const socialSection = page.includes("Social links")
        ? page.indexOf("Social links")
        : page.indexOf("<h2 class=\"font-serif text-3xl\">Links</h2>");
      const secondaryBanner = page.indexOf("banner={outlet.affiliateBanner2}");
      expect(socialSection).toBeGreaterThan(-1);
      expect(secondaryBanner).toBeGreaterThan(socialSection);
    }
  });

  it("installs a global fallback for third-party images that fail to load", () => {
    const layout = read("src/components/Layout.astro");

    expect(layout).toContain('addEventListener("error"');
    expect(layout).toContain("HTMLImageElement");
    expect(layout).toContain("data-image-failed");
    expect(layout).toContain("data-image-fallback");
  });
});

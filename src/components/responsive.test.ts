import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("responsive layout affordances", () => {
  it("keeps primary navigation reachable on mobile", () => {
    const header = read("src/components/Header.astro");

    expect(header).toContain('{ href: "/sheng-siong-promotions", label: "Sheng Siong Promotions" }');
    expect(header).toContain('{ href: "/fairprice-promotions", label: "FairPrice Promotions" }');
    expect(header).toContain('{ href: "/giant-promotions", label: "Giant Promotions" }');
    expect(header).not.toContain('{ href: "/grocery-stores", label: "Grocery Stores" }');
    expect(header).not.toContain('{ href: "/convenience-stores", label: "Convenience Stores" }');
    expect(header).not.toContain('{ href: "/general-stores", label: "General Stores" }');
    expect(header).toContain('aria-label="Open navigation menu"');
    expect(header).toContain("data-menu-toggle");
    expect(header).toContain("data-menu-panel");
    expect(header).toContain('aria-label="Primary navigation"');
    expect(header).toContain("md:hidden");
    expect(header).toContain("md:flex");
  });

  it("stacks search controls on narrow screens", () => {
    const searchBox = read("src/components/SearchBox.astro");

    expect(searchBox).toContain("flex-col");
    expect(searchBox).toContain("sm:flex-row");
    expect(searchBox).toContain("w-full");
  });

  it("uses shared mobile-first page title sizing", () => {
    const globalCss = read("src/styles/global.css");
    const directory = read("src/pages/directory.astro");
    const detail = read("src/pages/supermarkets/[slug].astro");

    expect(globalCss).toContain(".page-title");
    expect(globalCss).toContain("text-4xl");
    expect(directory).toContain("page-title");
    expect(detail).toContain("page-title");
  });

  it("gives brand detail pages dynamic summary and discovery sections", () => {
    const brandPage = read("src/pages/brands/[slug].astro");

    expect(brandPage).toContain("featuredOutlets");
    expect(brandPage).toContain("brandMetrics");
    expect(brandPage).toContain("Where to find");
    expect(brandPage).toContain("Featured outlets");
    expect(brandPage).toContain("All {brand.name} outlets");
  });

  it("keeps hero title copy intact while fitting mobile screens", () => {
    const hero = read("src/components/HeroSection.astro");

    expect(hero).toContain("Discover Supermarkets Across Singapore");
    expect(hero).toContain("text-[clamp");
    expect(hero).toContain("max-w-full");
  });

  it("does not expose implementation details in the footer", () => {
    const footer = read("src/components/Footer.astro");

    expect(footer).not.toMatch(/Airtable/i);
    expect(footer).toContain("A curated directory of supermarket outlets across Singapore");
    expect(footer).toContain('{ href: "/malls", label: "Malls" }');
    expect(footer).toContain('{ href: "/mrt-stations", label: "MRT Stations" }');
    expect(footer).toContain('{ href: "/brands", label: "Brands" }');
    expect(footer).toContain('{ href: "/neighbourhoods", label: "Neighbourhoods" }');
    expect(footer).toContain('{ href: "/grocery-stores", label: "Grocery Stores" }');
    expect(footer).toContain('{ href: "/convenience-stores", label: "Convenience Stores" }');
    expect(footer).toContain('{ href: "/general-stores", label: "General Stores" }');
    expect(footer).toContain("MRT Stations");
  });

  it("links promotion cards to public collection pages instead of dead promotion detail URLs", () => {
    const promotionCard = read("src/components/PromotionCard.astro");

    expect(promotionCard).toContain("promotion.collectionSlug");
    expect(promotionCard).not.toContain("promotion.detailPath");
  });

  it("does not generate per-promotion detail routes", () => {
    expect(existsSync("src/pages/promotions/[slug].astro")).toBe(false);
  });
});

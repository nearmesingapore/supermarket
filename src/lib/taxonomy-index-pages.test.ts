import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();

const readSource = (path: string) => readFileSync(join(root, path), "utf8");

describe("taxonomy index pages", () => {
  test("exposes browsable mall and MRT station index routes", () => {
    expect(existsSync(join(root, "src/pages/malls/index.astro"))).toBe(true);
    expect(existsSync(join(root, "src/pages/mrt-stations/index.astro"))).toBe(true);

    expect(readSource("src/pages/malls/index.astro")).toContain("data.malls.map");
    expect(readSource("src/pages/mrt-stations/index.astro")).toContain("data.mrtStations.map");
  });

  test("uses grocery-store specific filters on the grocery stores page", () => {
    const groceryStores = readSource("src/pages/grocery-stores/index.astro");
    const filterBar = readSource("src/components/FilterBar.astro");

    expect(groceryStores).toContain("<FilterBar");
    expect(groceryStores).toContain("outlets={data.groceryStores}");
    expect(filterBar).toContain("outlets: Supermarket[]");
    expect(filterBar).toContain("{outlets.length} outlets shown");
  });

  test("uses the requested directory landing copy and larger index page headings", () => {
    const directory = readSource("src/pages/directory.astro");
    const supermarkets = readSource("src/pages/supermarkets/index.astro");
    const groceryStores = readSource("src/pages/grocery-stores/index.astro");

    expect(directory).toContain("Supermarkets and Grocery Stores in Singapore");
    expect(directory).toContain("Singapore's diverse food culture is reflected in its wide variety of supermarkets and grocery stores");
    expect(directory).toContain("Whether you're hunting for a neighbourhood provision shop");
    expect(supermarkets).toContain('class="mt-4 font-serif text-6xl leading-none sm:text-7xl"');
    expect(groceryStores).toContain('class="mt-4 font-serif text-6xl leading-none sm:text-7xl"');
  });

  test("groups supermarket and grocery store brands under separate headings", () => {
    const brands = readSource("src/pages/brands/index.astro");

    expect(brands).toContain("data.supermarketBrands.map");
    expect(brands).toContain("Grocery Stores brands");
    expect(brands).toContain("data.groceryStoreBrands.map");
  });

  test("renders Airtable descriptions with preserved line breaks on detail pages", () => {
    const neighbourhood = readSource("src/pages/neighbourhoods/[slug].astro");
    const supermarket = readSource("src/pages/supermarkets/[slug].astro");
    const groceryStore = readSource("src/pages/grocery-stores/[slug].astro");
    const mall = readSource("src/pages/malls/[slug].astro");

    for (const source of [neighbourhood, supermarket, groceryStore, mall]) {
      expect(source).toContain("splitDescriptionParagraphs");
      expect(source).toContain("whitespace-pre-line");
    }
  });

  test("includes grocery-store outlets on brand detail pages", () => {
    const brandDetail = readSource("src/pages/brands/[slug].astro");

    expect(brandDetail).toContain("data.groceryStores");
    expect(brandDetail).toContain("getOutletBasePath");
  });

  test("renders brand FAQ visibly and only outputs FAQ schema when parsed FAQ content exists", () => {
    const brandDetail = readSource("src/pages/brands/[slug].astro");

    expect(brandDetail).toContain("parseBrandFaq(brand.brandFaq)");
    expect(brandDetail).toContain("faqItems.length > 0");
    expect(brandDetail).toContain("Brand FAQ");
    expect(brandDetail).toContain("faqItems.map");
    expect(brandDetail).toContain("application/ld+json");
    expect(brandDetail).toContain("JSON.stringify(faqSchema)");
    expect(brandDetail).not.toContain("FAQPage");
  });

  test("keeps brand neighbourhood tiles compact and renders FAQ lower as a two-column bullet list", () => {
    const brandDetail = readSource("src/pages/brands/[slug].astro");

    expect(brandDetail).toContain("min-h-16");
    expect(brandDetail).toContain("p-4");
    expect(brandDetail).toContain("text-xl");
    expect(brandDetail.indexOf('id="brand-outlets"')).toBeLessThan(brandDetail.indexOf("Brand FAQ"));
    expect(brandDetail).toContain("<ul");
    expect(brandDetail).toContain("md:columns-2");
    expect(brandDetail).toContain("<li");
    expect(brandDetail).not.toContain('<article class="border border-line bg-paper p-5 sm:p-6">');
  });

  test("links promotion pages from primary navigation and taxonomy indexes from the footer", () => {
    const header = readSource("src/components/Header.astro");
    const footer = readSource("src/components/Footer.astro");

    expect(header).toContain('label: "Promotions"');
    expect(header).toContain("promotionLinks");
    expect(header).not.toContain('{ href: "/grocery-stores", label: "Grocery Stores" }');
    expect(header).not.toContain('{ href: "/convenience-stores", label: "Convenience Stores" }');
    expect(header).not.toContain('{ href: "/general-stores", label: "General Stores" }');
    expect(header).not.toContain('label: "Sheng Siong Promotions"');
    expect(header).not.toContain('label: "FairPrice Promotions"');
    expect(header).not.toContain('label: "Giant Promotions"');
    expect(footer).toContain('{ href: "/brands", label: "Brands" }');
    expect(footer).toContain('{ href: "/neighbourhoods", label: "Neighbourhoods" }');
    expect(footer).toContain('{ href: "/malls", label: "Malls" }');
    expect(footer).toContain('{ href: "/mrt-stations", label: "MRT Stations" }');
    expect(footer).toContain('{ href: "/grocery-stores", label: "Grocery Stores" }');
    expect(footer).toContain('{ href: "/convenience-stores", label: "Convenience Stores" }');
    expect(footer).toContain('{ href: "/general-stores", label: "General Stores" }');
  });

  test("adds crawlable promotion and supermarket brand index routes", () => {
    const promotionsIndex = readSource("src/pages/promotions/index.astro");
    const supermarketDetail = readSource("src/pages/supermarkets/[slug].astro");

    expect(promotionsIndex).toContain("data.promotions");
    expect(promotionsIndex).toContain("<PromotionCard");
    expect(supermarketDetail).toContain("getSupermarketBrandPages");
    expect(supermarketDetail).toContain("brandPage");
    expect(supermarketDetail).toContain("ListingCard");
  });

  test("promotion collection pages link outlet heading to the brand page without listing every outlet", () => {
    const promotionCollection = readSource("src/pages/[promotionCollection].astro");

    expect(promotionCollection).toContain('href={canonicalPath(`/brands/${brand.slug}`)}');
    expect(promotionCollection).toContain("{brand.name} outlets with relevant promotions");
    expect(promotionCollection).not.toContain("supermarketOutlets.map");
    expect(promotionCollection).not.toContain("groceryStoreOutlets.map");
  });
});

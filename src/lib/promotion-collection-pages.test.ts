import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const projectRoot = process.cwd();
const pageSource = readFileSync(join(projectRoot, "src/pages/[promotionCollection].astro"), "utf8");

describe("promotion collection SEO pages", () => {
  test("wires FairPrice promotions to its article, banner, and FAQ schema", () => {
    expect(pageSource).toContain('collection.slug === "fairprice-promotions"');
    expect(pageSource).toContain("FairPrice Promotions – NTUC FairPrice Deals Updated Weekly");
    expect(pageSource).toContain("Browse all current NTUC FairPrice promotions in Singapore.");
    expect(pageSource).toContain("FairPrice Promotions – Latest NTUC FairPrice Deals & Weekly Offers");
    expect(pageSource).toContain("/images/fairpricepromotions-banner.png");
    expect(pageSource).toContain("aspect-[1693/929]");
    expect(pageSource).toContain("What Are the Latest NTUC FairPrice Promotions?");
    expect(pageSource).toContain("Types of NTUC FairPrice Promotions You&apos;ll Find Here");
    expect(pageSource).toContain("What is the NTUC FairPrice promotion today?");
    expect(pageSource).toContain("buildFaqPageSchema(fairPriceFaqItems)");
    expect(existsSync(join(projectRoot, "public/images/fairpricepromotions-banner.png"))).toBe(true);
  });
});

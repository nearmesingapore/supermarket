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

  test("links mall and MRT station indexes from shared navigation", () => {
    const header = readSource("src/components/Header.astro");
    const footer = readSource("src/components/Footer.astro");

    expect(header).toContain('href: "/malls"');
    expect(header).toContain('href: "/mrt-stations"');
    expect(footer).toContain('href="/malls"');
    expect(footer).toContain('href="/mrt-stations"');
  });
});

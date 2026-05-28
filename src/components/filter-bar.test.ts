import { describe, expect, it } from "vitest";
import { cardMatchesFilters, encodeFilterValues, splitFilterValues } from "../lib/directoryFilters";

describe("directory filters", () => {
  it("encodes every linked Airtable value on listing cards", () => {
    expect(encodeFilterValues([{ slug: "fairprice" }, { slug: "ntuc" }, { slug: "" }])).toBe("fairprice|ntuc");
  });

  it("splits encoded listing-card metadata into individual filter values", () => {
    expect(splitFilterValues("fairprice|ntuc")).toEqual(["fairprice", "ntuc"]);
    expect(splitFilterValues("")).toEqual([]);
  });

  it("matches selected filters against any encoded card metadata value", () => {
    const dataset = {
      brand: "fairprice|ntuc",
      neighbourhood: "tampines",
      category: "Supermarket",
      mrt: "tampines-mrt|simei-mrt",
      mall: "",
    };

    expect(cardMatchesFilters(dataset, [["brand", "fairprice"]])).toBe(true);
    expect(cardMatchesFilters(dataset, [["brand", "ntuc"]])).toBe(true);
    expect(cardMatchesFilters(dataset, [["mrt", "simei-mrt"]])).toBe(true);
    expect(cardMatchesFilters(dataset, [["brand", "fairprice"], ["neighbourhood", "tampines"]])).toBe(true);
  });

  it("rejects cards that do not match every selected filter", () => {
    expect(cardMatchesFilters({ brand: "fairprice", neighbourhood: "tampines" }, [["brand", "giant"]])).toBe(false);
    expect(
      cardMatchesFilters({ brand: "fairprice", neighbourhood: "tampines" }, [
        ["brand", "fairprice"],
        ["neighbourhood", "bedok"],
      ]),
    ).toBe(false);
  });
});

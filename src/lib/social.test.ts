import { describe, expect, it } from "vitest";
import { getOutletSocialLinks } from "./social";

describe("outlet social links", () => {
  it("labels Facebook and Instagram links by URL host when Airtable fields are swapped", () => {
    expect(
      getOutletSocialLinks({
        facebookUrl: "https://www.instagram.com/example/",
        instagramUrl: "https://www.facebook.com/example/"
      })
    ).toEqual([
      { label: "Facebook", url: "https://www.facebook.com/example/" },
      { label: "Instagram", url: "https://www.instagram.com/example/" }
    ]);
  });
});

# Supermarket Directions and Nearby Landmarks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the four new Airtable Supermarkets travel and landmark fields in the existing supermarket outlet details grid.

**Architecture:** The Airtable boundary remains responsible for converting raw fields into the typed `Supermarket` shape. A small Astro component renders optional detail cells using the same definition-list style already used for neighbourhood, mall/location, and nearest MRT, and the supermarket detail route is the only page that imports it.

**Tech Stack:** Astro 4, TypeScript, Vitest, Airtable REST records with `returnFieldsByFieldId=true`, Tailwind utility classes.

---

## File Structure

- Modify `src/lib/airtable.ts`: add four optional supermarket directions/landmark properties to `Supermarket`, configure their Supermarkets Airtable field IDs, and normalize them to trimmed strings.
- Modify `src/lib/airtable.test.ts`: add a failing regression test that proves mocked Supermarkets records expose all four new normalized values.
- Modify `src/lib/seo.test.ts`: update typed `DirectoryData` fixtures with the four new string properties.
- Create `src/components/OutletDetails.astro`: render optional definition-list cells with existing label/value styling and preserved line breaks.
- Create `src/components/outlet-details.test.ts`: assert the details component exposes the approved labels, preserves line breaks, and is used only by the supermarket outlet route.
- Modify `src/pages/supermarkets/[slug].astro`: import and render the details cells in the existing metadata grid.
- Do not modify `src/pages/grocery-stores/[slug].astro`: grocery-store pages remain unchanged because that Airtable table does not contain these fields.

## Task 1: Normalize Supermarket Airtable Fields

**Files:**
- Modify: `src/lib/airtable.test.ts`
- Modify: `src/lib/airtable.ts`
- Modify: `src/lib/seo.test.ts`

- [x] **Step 1: Write the failing normalization test**

In `src/lib/airtable.test.ts`, extend the mocked supermarket record in `loads supermarkets and grocery stores without removed Airtable fields`:

```ts
fldbEV2NcQ7bZ0M0a: "Park at the basement car park.\nUse lift lobby A.",
fldYCaW3KbZmmJS4I: "Take the MRT to Ang Mo Kio.\nWalk through the town centre.",
fld3d3y5k1e72EAHK: "Bus 22, 25, 73",
fldM9U6ChPSfkdgg2: "AMK Hub\nAng Mo Kio Town Garden"
```

Then extend the `expect(data.supermarkets[0]).toMatchObject(...)` assertion:

```ts
gettingThereByCar: "Park at the basement car park.\nUse lift lobby A.",
gettingThereByPublicTransport: "Take the MRT to Ang Mo Kio.\nWalk through the town centre.",
nearbyBusServices: "Bus 22, 25, 73",
nearbyLandmarks: "AMK Hub\nAng Mo Kio Town Garden"
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/lib/airtable.test.ts`

Expected: the test fails because `gettingThereByCar`, `gettingThereByPublicTransport`, `nearbyBusServices`, and `nearbyLandmarks` are missing from the normalized supermarket object.

- [x] **Step 3: Add the minimal normalization implementation**

In `src/lib/airtable.ts`, extend `Supermarket`:

```ts
gettingThereByCar: string;
gettingThereByPublicTransport: string;
nearbyBusServices: string;
nearbyLandmarks: string;
```

Add these keys to `FIELDS.supermarkets`:

```ts
gettingThereByCar: ["fldbEV2NcQ7bZ0M0a", "Getting There by Car"],
gettingThereByPublicTransport: ["fldYCaW3KbZmmJS4I", "Getting There by Public Transport"],
nearbyBusServices: ["fld3d3y5k1e72EAHK", "Nearby Bus Services"],
nearbyLandmarks: ["fldM9U6ChPSfkdgg2", "Nearby Landmarks", "Nearby Landmarks  "],
```

Add empty fallback arrays to `FIELDS.groceryStores` so the shared `normalizeOutlet` function stays typed without adding live grocery-store Airtable dependencies:

```ts
gettingThereByCar: [],
gettingThereByPublicTransport: [],
nearbyBusServices: [],
nearbyLandmarks: [],
```

Then include these fields in the normalized return object:

```ts
gettingThereByCar: readFieldString(fields, fieldsConfig.gettingThereByCar),
gettingThereByPublicTransport: readFieldString(fields, fieldsConfig.gettingThereByPublicTransport),
nearbyBusServices: readFieldString(fields, fieldsConfig.nearbyBusServices),
nearbyLandmarks: readFieldString(fields, fieldsConfig.nearbyLandmarks),
```

Update `src/lib/seo.test.ts` supermarket and grocery-store fixtures with empty string values for the four new properties.

- [x] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- src/lib/airtable.test.ts`

Expected: `src/lib/airtable.test.ts` passes.

## Task 2: Render Details In The Existing Supermarket Grid

**Files:**
- Create: `src/components/OutletDetails.astro`
- Create: `src/components/outlet-details.test.ts`
- Modify: `src/pages/supermarkets/[slug].astro`

- [x] **Step 1: Write the failing route/component test**

Create `src/components/outlet-details.test.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : "");

describe("outlet details rendering", () => {
  it("renders new supermarket-only travel and landmark detail cells in the existing metadata grid", () => {
    const supermarketPage = read("src/pages/supermarkets/[slug].astro");
    const groceryStorePage = read("src/pages/grocery-stores/[slug].astro");
    const details = read("src/components/OutletDetails.astro");

    expect(supermarketPage).toContain('import OutletDetails from "@/components/OutletDetails.astro";');
    expect(supermarketPage).toContain("<OutletDetails");
    expect(groceryStorePage).not.toContain("OutletDetails");
    expect(details).toContain("Getting There by Car");
    expect(details).toContain("Getting There by Public Transport");
    expect(details).toContain("Nearby Bus Services");
    expect(details).toContain("Nearby Landmarks");
    expect(details).toContain("whitespace-pre-line");
  });
});
```

- [x] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/components/outlet-details.test.ts`

Expected: the test fails because `src/components/OutletDetails.astro` does not exist and the supermarket route does not import it.

- [x] **Step 3: Add the minimal rendering component**

Create `src/components/OutletDetails.astro`:

```astro
---
interface Props {
  gettingThereByCar: string;
  gettingThereByPublicTransport: string;
  nearbyBusServices: string;
  nearbyLandmarks: string;
}

const {
  gettingThereByCar,
  gettingThereByPublicTransport,
  nearbyBusServices,
  nearbyLandmarks
} = Astro.props;

const details = [
  { label: "Getting There by Car", value: gettingThereByCar },
  { label: "Getting There by Public Transport", value: gettingThereByPublicTransport },
  { label: "Nearby Bus Services", value: nearbyBusServices },
  { label: "Nearby Landmarks", value: nearbyLandmarks }
].filter((item) => item.value);
---

{
  details.map((item) => (
    <div>
      <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-brass">{item.label}</dt>
      <dd class="mt-2 whitespace-pre-line leading-7">{item.value}</dd>
    </div>
  ))
}
```

- [x] **Step 4: Add the component to the supermarket metadata grid**

In `src/pages/supermarkets/[slug].astro`, add:

```astro
import OutletDetails from "@/components/OutletDetails.astro";
```

Inside the existing `<dl class="mt-10 grid gap-5 border-y border-line py-8 sm:grid-cols-2">`, after the nearest MRT block, add:

```astro
<OutletDetails
  gettingThereByCar={outlet.gettingThereByCar}
  gettingThereByPublicTransport={outlet.gettingThereByPublicTransport}
  nearbyBusServices={outlet.nearbyBusServices}
  nearbyLandmarks={outlet.nearbyLandmarks}
/>
```

- [x] **Step 5: Run the focused test and verify it passes**

Run: `npm test -- src/components/outlet-details.test.ts`

Expected: `src/components/outlet-details.test.ts` passes.

## Task 3: Verify, Commit, And Publish To Main

**Files:**
- Verify all modified implementation and plan files.
- Do not stage unrelated existing edits in `src/pages/brands/[slug].astro` or `src/pages/directory.astro`.

- [x] **Step 1: Run implementation verification**

Run:

```bash
npm test
npm run check
npm run build
```

Expected: all commands exit 0. If a command fails because local dependencies are missing or Airtable access is blocked, install dependencies or request the needed approval and rerun once.

- [x] **Step 2: Inspect the final diff**

Run: `git diff -- src/lib/airtable.ts src/lib/airtable.test.ts src/lib/seo.test.ts src/components/OutletDetails.astro src/components/outlet-details.test.ts src/pages/supermarkets/[slug].astro docs/superpowers/plans/2026-05-28-supermarket-directions-landmarks.md`

Expected: only the planned feature and plan changes appear.

- [x] **Step 3: Commit the implementation locally**

Run:

```bash
git add docs/superpowers/plans/2026-05-28-supermarket-directions-landmarks.md src/lib/airtable.ts src/lib/airtable.test.ts src/lib/seo.test.ts src/components/OutletDetails.astro src/components/outlet-details.test.ts src/pages/supermarkets/[slug].astro
git commit -m "Add supermarket directions details"
```

Expected: a new local commit is created, while the unrelated dirty files remain unstaged.

- [ ] **Step 4: Publish the two new commits to GitHub `main` using the connector**

Use the GitHub connector to create blobs for the files changed by the design and implementation commits, create a tree based on remote `main`, create a commit with parent remote `main`, and update the `main` ref. Do not use HTTPS `git push`.

Expected: GitHub `main` points to the connector-created commit containing the design and implementation changes.

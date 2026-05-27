# Outlet Gallery Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render Airtable-provided gallery images on supermarket and grocery store outlet detail pages.

**Architecture:** Normalize the comma-separated `Gallery Images URL` value into a `galleryImageUrls` array at the Airtable boundary. A shared Astro component renders that array consistently from each outlet detail template, without affecting pages whose gallery field is empty.

**Tech Stack:** Astro, TypeScript, Tailwind CSS, Vitest, Airtable REST API

---

### Task 1: Normalize Gallery URLs From Airtable

**Files:**
- Modify: `src/lib/airtable.ts`
- Modify: `src/lib/airtable.test.ts`
- Modify: `src/lib/seo.test.ts`

- [ ] **Step 1: Write the failing normalization assertions**

Add comma-separated field values to both mocked outlet records in `src/lib/airtable.test.ts`, then assert:

```ts
expect(data.supermarkets[0].galleryImageUrls).toEqual([
  "https://example.com/supermarket-one.jpg",
  "https://example.com/supermarket-two.jpg"
]);
expect(data.groceryStores[0].galleryImageUrls).toEqual([
  "https://example.com/grocery-one.jpg",
  "https://example.com/grocery-two.jpg"
]);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/airtable.test.ts`

Expected: FAIL because `galleryImageUrls` is not yet populated.

- [ ] **Step 3: Implement normalized outlet data**

Replace the single-string type with:

```ts
galleryImageUrls: string[];
```

Add a local parser:

```ts
function parseGalleryImageUrls(value: string) {
  return value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}
```

Use it in `normalizeOutlet`:

```ts
galleryImageUrls: parseGalleryImageUrls(readFieldString(fields, fieldsConfig.galleryImagesUrl)),
```

The Airtable schema check performed during execution also confirmed that the deleted `Published` field is still referenced in existing code and blocks production route generation. Extend the existing removed-fields regression to omit `Published`, remove that stale property from normalization and fixtures, and filter supermarket routes by non-empty outlet name and slug like grocery stores.

Update the static `DirectoryData` fixtures in `src/lib/seo.test.ts` to provide `galleryImageUrls: []` and omit `published`.

- [ ] **Step 4: Run the normalization test to verify it passes**

Run: `npm test -- src/lib/airtable.test.ts src/lib/seo.test.ts`

Expected: PASS.

### Task 2: Render the Shared Gallery Section

**Files:**
- Create: `src/components/OutletGallery.astro`
- Create: `src/components/outlet-gallery.test.ts`
- Modify: `src/pages/supermarkets/[slug].astro`
- Modify: `src/pages/grocery-stores/[slug].astro`

- [ ] **Step 1: Write failing component wiring assertions**

Create a file-text test that asserts both outlet routes import and use `OutletGallery`, and the component source contains the conditional gallery section, `imageUrls.map`, lazy loading, and outlet-specific alt text.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/outlet-gallery.test.ts`

Expected: FAIL because the component and route wiring do not exist.

- [ ] **Step 3: Add the shared component and route usage**

Create `OutletGallery.astro` with:

```astro
---
interface Props {
  outletName: string;
  imageUrls: string[];
}

const { outletName, imageUrls } = Astro.props;
---

{imageUrls.length > 0 && (
  <section class="mt-14">
    <p class="eyebrow">Gallery</p>
    <h2 class="section-title mt-3">Photos of {outletName}</h2>
    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {imageUrls.map((imageUrl, index) => (
        <div class="overflow-hidden border border-line bg-white">
          <div class="aspect-[4/3] bg-[#f2efe9]">
            <img src={imageUrl} alt={`${outletName} gallery image ${index + 1}`} class="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      ))}
    </div>
  </section>
)}
```

Import it in both outlet pages and render:

```astro
<OutletGallery outletName={outlet.outletName} imageUrls={outlet.galleryImageUrls} />
```

- [ ] **Step 4: Run the component wiring test to verify it passes**

Run: `npm test -- src/components/outlet-gallery.test.ts`

Expected: PASS.

### Task 3: Verify and Publish

**Files:**
- Verify all modified implementation and test files.
- Publish only the design, plan, gallery implementation, and gallery tests; preserve unrelated working tree edits.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm test
npm run check
npm run build
```

Expected: all commands exit successfully.

- [ ] **Step 2: Visually verify one generated supermarket page**

Run the local site and open one supermarket route containing gallery URLs in the in-app browser. Confirm a visible `Gallery` section includes multiple images and the page remains usable at narrow width.

- [ ] **Step 3: Commit the completed feature**

Stage only the plan and implementation/test files, leaving unrelated `src/pages/brands/[slug].astro` and `src/pages/directory.astro` changes unstaged:

```bash
git add docs/superpowers/plans/2026-05-27-outlet-gallery-images.md src/lib/airtable.ts src/lib/airtable.test.ts src/lib/seo.test.ts src/components/OutletGallery.astro src/components/outlet-gallery.test.ts src/pages/supermarkets/[slug].astro src/pages/grocery-stores/[slug].astro
git commit -m "Add outlet gallery images"
```

- [ ] **Step 4: Publish completed content to GitHub main**

Use the GitHub connector to commit the completed file contents to `nearmesingapore/supermarket` on `main`, complying with the repository instruction not to use HTTPS `git push` for `main`.

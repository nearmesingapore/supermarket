# Graph Report - .  (2026-06-08)

## Corpus Check
- 58 files · ~248,108 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 211 nodes · 466 edges · 19 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Airtable.Ts Read Airtable|Airtable.Ts Read Airtable]]
- [[_COMMUNITY_Slug.Astro Content.Ts Get|[Slug].Astro Content.Ts Get]]
- [[_COMMUNITY_Astro Listingcard.Astro Index.Astro|Astro Listingcard.Astro Index.Astro]]
- [[_COMMUNITY_Package.Json Astrojs Check|Package.Json Astrojs Check]]
- [[_COMMUNITY_Astro Slug.Astro Get|Astro [Slug].Astro Get]]
- [[_COMMUNITY_Seo.Ts Build Seo.Test.Ts|Seo.Ts Build Seo.Test.Ts]]
- [[_COMMUNITY_Readme.Md Readm Cloudflare|Readme.Md Readm Cloudflare]]
- [[_COMMUNITY_Docs Superpowers Specs|Docs Superpowers Specs]]
- [[_COMMUNITY_Docs Superpowers Specs|Docs Superpowers Specs]]
- [[_COMMUNITY_Tsconfig.Json Compiler Options|Tsconfig.Json Compiler Options]]
- [[_COMMUNITY_Docs Superpowers Plans|Docs Superpowers Plans]]
- [[_COMMUNITY_Docs Superpowers Plans|Docs Superpowers Plans]]

## God Nodes (most connected - your core abstractions)
1. `getDirectoryData()` - 32 edges
2. `@/components/ListingCard.astro` - 27 edges
3. `@/components/Layout.astro` - 26 edges
4. `canonicalPath()` - 15 edges
5. `@/components/PromotionCard.astro` - 10 edges
6. `formatCount()` - 10 edges
7. `Singapore Supermarket Directory` - 10 edges
8. `@/components/MallCard.astro` - 9 edges
9. `@/components/BrandCard.astro` - 9 edges
10. `@/components/NeighbourhoodCard.astro` - 9 edges

## Surprising Connections (you probably didn't know these)
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/convenience-stores/[slug].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/general-stores/[slug].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/grocery-stores/[slug].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/brands/[slug].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/malls/[slug].astro → src/lib/airtable.ts

## Communities (19 total, 0 thin omitted)

### Community 0 - "Airtable.Ts Read Airtable"
Cohesion: 0.10
Nodes (30): AirtableRecord, assertAirtableEnv(), createLookup(), EnvSource, fetchAirtableRecords(), FetchLike, FIELDS, findBrandBySlug() (+22 more)

### Community 1 - "[Slug].Astro Content.Ts Get"
Cohesion: 0.14
Nodes (23): getStaticPaths(), getBrandPromotions(), getDirectoryData(), PromotionCollection, Supermarket, TaxonomyItem, formatCount(), hasTaxonomyImage() (+15 more)

### Community 2 - "Astro Listingcard.Astro Index.Astro"
Cohesion: 0.13
Nodes (19): links, canonicalUrl, brand, href, initial, mall, mrt, neighbourhood (+11 more)

### Community 3 - "Package.Json Astrojs Check"
Cohesion: 0.08
Nodes (23): dependencies, astro, @astrojs/check, @astrojs/tailwind, pagefind, tailwindcss, typescript, devDependencies (+15 more)

### Community 4 - "Astro [Slug].Astro Get"
Cohesion: 0.18
Nodes (18): links, details, getStaticPaths(), getStaticPaths(), getStaticPaths(), ConvenienceStore, GeneralStore, getOutletPromotions() (+10 more)

### Community 5 - "Seo.Ts Build Seo.Test.Ts"
Cohesion: 0.22
Nodes (12): DirectoryData, FaqItem, buildFaqPageSchema(), buildRobotsTxt(), buildSitemapXml(), canonicalUrl(), getSitemapPaths(), resolveSiteUrl() (+4 more)

### Community 6 - "Readme.Md Readm Cloudflare"
Cohesion: 0.18
Nodes (10): Cloudflare Pages Deployment, Data Fetching, Deploy Hook Setup, Environment Variables, Local Development, Pagefind Search, Prerequisites, Project Structure (+2 more)

### Community 7 - "Docs Superpowers Specs"
Cohesion: 0.29
Nodes (6): Data Flow, Goal, Outlet Gallery Images Design, Rendering, Scope, Verification

### Community 8 - "Docs Superpowers Specs"
Cohesion: 0.29
Nodes (6): Airtable Data, Goal, Presentation, Scope, Supermarket Directions and Nearby Landmarks Design, Testing And Verification

### Community 9 - "Tsconfig.Json Compiler Options"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, exclude, extends, @/*

### Community 10 - "Docs Superpowers Plans"
Cohesion: 0.33
Nodes (5): File Structure, Supermarket Directions and Nearby Landmarks Implementation Plan, Task 1: Normalize Supermarket Airtable Fields, Task 2: Render Details In The Existing Supermarket Grid, Task 3: Verify, Commit, And Publish To Main

### Community 11 - "Docs Superpowers Plans"
Cohesion: 0.40
Nodes (4): Outlet Gallery Images Implementation Plan, Task 1: Normalize Gallery URLs From Airtable, Task 2: Render the Shared Gallery Section, Task 3: Verify and Publish

## Knowledge Gaps
- **78 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+73 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@/components/Layout.astro` connect `Astro Listingcard.Astro Index.Astro` to `[Slug].Astro Content.Ts Get`, `Astro [Slug].Astro Get`, `Seo.Ts Build Seo.Test.Ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `@/components/ListingCard.astro` connect `Astro Listingcard.Astro Index.Astro` to `[Slug].Astro Content.Ts Get`, `Astro [Slug].Astro Get`, `Seo.Ts Build Seo.Test.Ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `getDirectoryData()` connect `[Slug].Astro Content.Ts Get` to `Airtable.Ts Read Airtable`, `Astro Listingcard.Astro Index.Astro`, `Astro [Slug].Astro Get`, `Seo.Ts Build Seo.Test.Ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Airtable.Ts Read Airtable` be split into smaller, more focused modules?**
  _Cohesion score 0.10160427807486631 - nodes in this community are weakly interconnected._
- **Should `[Slug].Astro Content.Ts Get` be split into smaller, more focused modules?**
  _Cohesion score 0.13911290322580644 - nodes in this community are weakly interconnected._
- **Should `Astro Listingcard.Astro Index.Astro` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
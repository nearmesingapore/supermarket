# Graph Report - Supermarket  (2026-06-09)

## Corpus Check
- 69 files · ~255,717 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 273 nodes · 610 edges · 26 communities (22 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a3efc3d9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Airtable.Ts Promotion Slug|Airtable.Ts Promotion Slug]]
- [[_COMMUNITY_Astro Slug.Astro Content.Ts|Astro [Slug].Astro Content.Ts]]
- [[_COMMUNITY_Astro Filterbar.Astro Index.Astro|Astro Filterbar.Astro Index.Astro]]
- [[_COMMUNITY_Slug.Astro Get Astro|[Slug].Astro Get Astro]]
- [[_COMMUNITY_Package.Json Astrojs Check|Package.Json Astrojs Check]]
- [[_COMMUNITY_Faq.Ts Faq|Faq.Ts Faq]]
- [[_COMMUNITY_Seo.Ts Get Seo.Test.Ts|Seo.Ts Get Seo.Test.Ts]]
- [[_COMMUNITY_Listingcard.Astro Directoryfilters.Ts Filter|Listingcard.Astro Directoryfilters.Ts Filter]]
- [[_COMMUNITY_Readme.Md Readm Cloudflare|Readme.Md Readm Cloudflare]]
- [[_COMMUNITY_Docs Superpowers Specs|Docs Superpowers Specs]]
- [[_COMMUNITY_Docs Superpowers Specs|Docs Superpowers Specs]]
- [[_COMMUNITY_Tsconfig.Json Compiler Options|Tsconfig.Json Compiler Options]]
- [[_COMMUNITY_Docs Superpowers Plans|Docs Superpowers Plans]]
- [[_COMMUNITY_Docs Superpowers Plans|Docs Superpowers Plans]]
- [[_COMMUNITY_Header.Astro Promotion Links|Header.Astro Promotion Links]]
- [[_COMMUNITY_.Codex Hooks.Json Hooks|.Codex Hooks.Json Hooks]]
- [[_COMMUNITY_Promotion-Collection-Pages.Test.Ts Page Source|Promotion-Collection-Pages.Test.Ts Page Source]]
- [[_COMMUNITY_Taxonomy-Index-Pages.Test.Ts Read Source|Taxonomy-Index-Pages.Test.Ts Read Source]]
- [[_COMMUNITY_Agents.Md Agent Graphify|Agents.Md Agent Graphify]]

## God Nodes (most connected - your core abstractions)
1. `getDirectoryData()` - 36 edges
2. `@/components/ListingCard.astro` - 30 edges
3. `@/components/Layout.astro` - 30 edges
4. `canonicalPath()` - 18 edges
5. `@/components/FilterBar.astro` - 13 edges
6. `formatCount()` - 13 edges
7. `@/components/PromotionCard.astro` - 12 edges
8. `@/components/NeighbourhoodCard.astro` - 10 edges
9. `splitDescriptionParagraphs()` - 10 edges
10. `Singapore Supermarket Directory` - 10 edges

## Surprising Connections (you probably didn't know these)
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/convenience-stores/[slug].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/general-stores/[slug].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/grocery-stores/[slug].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/[promotionCollection].astro → src/lib/airtable.ts
- `getStaticPaths()` --calls--> `getDirectoryData()`  [EXTRACTED]
  src/pages/brands/[slug].astro → src/lib/airtable.ts

## Communities (26 total, 4 thin omitted)

### Community 0 - "Airtable.Ts Promotion Slug"
Cohesion: 0.10
Nodes (34): AirtableRecord, assertAirtableEnv(), buildPromotionSlug(), createLookup(), EnvSource, fetchAirtableRecords(), FetchLike, FIELDS (+26 more)

### Community 1 - "Astro [Slug].Astro Content.Ts"
Cohesion: 0.19
Nodes (23): TaxonomyItem, formatCount(), hasTaxonomyImage(), pageDescription(), PRIORITY_NEIGHBOURHOODS, sortFeaturedNeighbourhoods(), splitDescriptionParagraphs(), truncateWords() (+15 more)

### Community 2 - "Astro Filterbar.Astro Index.Astro"
Cohesion: 0.09
Nodes (24): getStaticPaths(), brands, categories, ids, malls, mrtStations, neighbourhoods, links (+16 more)

### Community 3 - "[Slug].Astro Get Astro"
Cohesion: 0.13
Nodes (22): details, imageUrls, getStaticPaths(), getStaticPaths(), getStaticPaths(), ConvenienceStore, GeneralStore, getOutletPromotions() (+14 more)

### Community 4 - "Package.Json Astrojs Check"
Cohesion: 0.08
Nodes (23): dependencies, astro, @astrojs/check, @astrojs/tailwind, pagefind, tailwindcss, typescript, devDependencies (+15 more)

### Community 5 - "Faq.Ts Faq"
Cohesion: 0.21
Nodes (12): PromotionCollection, BrandFaqItem, buildFaqPageSchema(), hasMarkedFaq(), isFaqHeading(), isQuestionLine(), parseBrandFaq(), parsePlainFaq() (+4 more)

### Community 6 - "Seo.Ts Get Seo.Test.Ts"
Cohesion: 0.18
Nodes (12): DirectoryData, getSupermarketBrandPages(), buildRobotsTxt(), buildSitemapXml(), canonicalUrl(), getSitemapPaths(), resolveSiteUrl(), directoryData (+4 more)

### Community 7 - "Listingcard.Astro Directoryfilters.Ts Filter"
Cohesion: 0.19
Nodes (12): brand, href, initial, mall, mrt, neighbourhood, ActiveFilter, cardMatchesFilters() (+4 more)

### Community 8 - "Readme.Md Readm Cloudflare"
Cohesion: 0.18
Nodes (10): Cloudflare Pages Deployment, Data Fetching, Deploy Hook Setup, Environment Variables, Local Development, Pagefind Search, Prerequisites, Project Structure (+2 more)

### Community 9 - "Docs Superpowers Specs"
Cohesion: 0.29
Nodes (6): Data Flow, Goal, Outlet Gallery Images Design, Rendering, Scope, Verification

### Community 10 - "Docs Superpowers Specs"
Cohesion: 0.29
Nodes (6): Airtable Data, Goal, Presentation, Scope, Supermarket Directions and Nearby Landmarks Design, Testing And Verification

### Community 11 - "Tsconfig.Json Compiler Options"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, exclude, extends, @/*

### Community 12 - "Docs Superpowers Plans"
Cohesion: 0.33
Nodes (5): File Structure, Supermarket Directions and Nearby Landmarks Implementation Plan, Task 1: Normalize Supermarket Airtable Fields, Task 2: Render Details In The Existing Supermarket Grid, Task 3: Verify, Commit, And Publish To Main

### Community 13 - "Docs Superpowers Plans"
Cohesion: 0.40
Nodes (4): Outlet Gallery Images Implementation Plan, Task 1: Normalize Gallery URLs From Airtable, Task 2: Render the Shared Gallery Section, Task 3: Verify and Publish

### Community 14 - "Header.Astro Promotion Links"
Cohesion: 0.50
Nodes (3): links, promotionLinks, promotionMenu

## Knowledge Gaps
- **100 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@/components/ListingCard.astro` connect `Listingcard.Astro Directoryfilters.Ts Filter` to `Astro [Slug].Astro Content.Ts`, `Astro Filterbar.Astro Index.Astro`, `[Slug].Astro Get Astro`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `@/components/Layout.astro` connect `Astro Filterbar.Astro Index.Astro` to `Astro [Slug].Astro Content.Ts`, `[Slug].Astro Get Astro`, `Faq.Ts Faq`, `Seo.Ts Get Seo.Test.Ts`, `Header.Astro Promotion Links`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `getDirectoryData()` connect `Astro Filterbar.Astro Index.Astro` to `Airtable.Ts Promotion Slug`, `Astro [Slug].Astro Content.Ts`, `[Slug].Astro Get Astro`, `Faq.Ts Faq`, `Seo.Ts Get Seo.Test.Ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Airtable.Ts Promotion Slug` be split into smaller, more focused modules?**
  _Cohesion score 0.09815078236130868 - nodes in this community are weakly interconnected._
- **Should `Astro Filterbar.Astro Index.Astro` be split into smaller, more focused modules?**
  _Cohesion score 0.0855614973262032 - nodes in this community are weakly interconnected._
- **Should `[Slug].Astro Get Astro` be split into smaller, more focused modules?**
  _Cohesion score 0.1349206349206349 - nodes in this community are weakly interconnected._
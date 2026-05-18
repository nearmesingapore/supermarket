# Singapore Supermarket Directory

A production-ready static directory for supermarket outlets in Singapore, built with Astro, Tailwind CSS, Airtable, Cloudflare Pages, and Pagefind.

The site is fully static. Airtable is read only at build time, Pagefind indexes the generated HTML after Astro builds, and Cloudflare Pages serves the final `dist` directory.

## Prerequisites

- Node.js 18 or newer
- An Airtable Personal Access Token with read access to base `appOYRk7lYQ8SSNCR`
- A GitHub repository connected to Cloudflare Pages

## Local Development

```bash
git clone <your-repo-url>
cd Supermarket
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=appOYRk7lYQ8SSNCR
```

Run the site locally:

```bash
npm run dev
```

Build the static site and Pagefind index:

```bash
npm run build
```

## Environment Variables

Required in local development and Cloudflare Pages:

```bash
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=appOYRk7lYQ8SSNCR
```

If `AIRTABLE_API_KEY` is missing, the build throws:

```text
Missing AIRTABLE_API_KEY. Copy .env.example to .env and add your key.
```

## Data Fetching

All Airtable API access lives in `src/lib/airtable.ts`.

The build fetches lookup tables first:

- Brands
- Neighbourhoods
- Malls
- MRT Stations

It then fetches Supermarkets with Airtable pagination using `pageSize=100` and the returned `offset` until no offset remains. Only records with `Published = true` are rendered.

Linked fields are resolved against lookup maps so cards and pages can show names and link to Airtable-provided slugs. Neighbourhood records with URL-like names are filtered before route creation and rendering.

## Publishing a New Outlet

1. Add or update the record in Airtable.
2. Ensure the `Slug` field is filled.
3. Set `Published = true`.
4. Trigger a Cloudflare Pages rebuild manually or via deploy hook.

## Cloudflare Pages Deployment

1. Push this repo to GitHub.
2. In Cloudflare Pages, create a new project from the GitHub repository.
3. Set framework preset to Astro or configure manually:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: `18`
4. Add environment variables:
   - `AIRTABLE_API_KEY`
   - `AIRTABLE_BASE_ID=appOYRk7lYQ8SSNCR`
5. Deploy.

## Deploy Hook Setup

1. In Cloudflare Pages, open the project settings.
2. Create a deploy hook for the production branch.
3. Copy the generated hook URL.
4. In Airtable, create an automation:
   - Trigger: record updated or record matches conditions
   - Condition: relevant supermarket records are published or updated
   - Action: HTTP POST to the Cloudflare deploy hook URL

This rebuilds the static site whenever Airtable content changes.

## Pagefind Search

The build script runs:

```bash
astro build && npx pagefind --site dist
```

Pages include `data-pagefind-body` and metadata attributes so Pagefind indexes outlet names, brands, neighbourhoods, MRT stations, malls, and addresses. Test search locally after building:

```bash
npm run build
npm run preview
```

Then open `/search`.

## Project Structure

```text
src/
  components/        Shared Astro components
  lib/               Airtable fetching and content helpers
  pages/             Static and dynamic routes
  styles/            Global Tailwind styles
public/
  og-image.svg       Default Open Graph image
```

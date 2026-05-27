# Outlet Gallery Images Design

## Goal

Display the existing Airtable gallery images on every supermarket and grocery store outlet detail page that has values in its `Gallery Images URL` field.

## Data Flow

Both Airtable outlet tables already expose a `Gallery Images URL` field. Current records store multiple public image URLs in one comma-separated string. The Airtable normalization layer will convert that field into a trimmed `galleryImageUrls: string[]` value, dropping blank entries so page templates receive presentation-ready data.

## Rendering

The supermarket and grocery store detail routes will render a `Gallery` section below the outlet details and above related outlets when `galleryImageUrls` is non-empty. It will use a simple responsive image grid that follows the site's existing bordered editorial card style and uses descriptive outlet-based alternative text.

Pages with no gallery images will not render an empty gallery heading or placeholder. The existing hero image remains unchanged.

## Scope

This change covers only `/supermarkets/[slug]` and `/grocery-stores/[slug]` outlet pages. It does not add a carousel, lightbox, images to listing cards, or Airtable write operations.

## Verification

Tests will cover conversion of comma-separated gallery URLs into arrays for both outlet record types and confirm that both route templates render gallery images from the normalized value. The project test suite and Astro checks will be run after implementation.

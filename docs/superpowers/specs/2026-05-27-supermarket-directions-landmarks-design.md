# Supermarket Directions and Nearby Landmarks Design

## Goal

Display newly added Airtable travel and landmark information on each supermarket outlet detail page, in the same metadata area as neighbourhood, mall/location, and nearest MRT.

## Airtable Data

Only the `Supermarkets` table contains the new content. The Airtable normalization layer will map these multi-line text fields using their stable field IDs:

| Website property | Airtable field | Airtable field ID |
| --- | --- | --- |
| `gettingThereByCar` | `Getting There by Car` | `fldbEV2NcQ7bZ0M0a` |
| `gettingThereByPublicTransport` | `Getting There by Public Transport` | `fldYCaW3KbZmmJS4I` |
| `nearbyBusServices` | `Nearby Bus Services` | `fld3d3y5k1e72EAHK` |
| `nearbyLandmarks` | `Nearby Landmarks  ` | `fldM9U6ChPSfkdgg2` |

The landmarks field currently contains trailing spaces in its Airtable label, so production code will prefer its field ID and retain the displayed label without trailing whitespace.

## Presentation

The supermarket outlet page will add four optional detail cells in its existing two-column definition list:

- Getting There by Car
- Getting There by Public Transport
- Nearby Bus Services
- Nearby Landmarks

Each cell will render only when its value is non-empty. Text values will preserve Airtable line breaks to support instructions and lists of bus services. Longer content may flow onto additional grid rows under the existing location information.

## Scope

This change applies only to `/supermarkets/[slug]`. The Grocery Stores Airtable table has not been updated, so `/grocery-stores/[slug]` will not map or display these fields.

No listing-card, search-filter, taxonomy page, map, or structured-data changes are included.

## Testing And Verification

Tests will first verify that a mocked Supermarkets Airtable record normalizes all four field values and that supermarket outlet rendering includes the optional labelled detail content while the grocery-store detail route remains unchanged.

After implementation, run the relevant tests, full project test suite, Astro type checks, and the production build. Review the supermarket outlet page visually in the browser if a locally buildable Airtable-backed page is available.

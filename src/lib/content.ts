import type { Supermarket, TaxonomyItem } from "./airtable";

const PRIORITY_NEIGHBOURHOODS = [
  "Woodlands",
  "Tampines",
  "Punggol",
  "Ang Mo Kio",
  "Bedok",
  "Jurong East",
  "Serangoon",
  "Yishun",
  "Hougang",
  "Bishan"
];

export function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function getPrimary(items: { name: string; slug?: string }[]) {
  return items[0];
}

export function sortFeaturedNeighbourhoods(neighbourhoods: TaxonomyItem[]) {
  const priority = new Map(PRIORITY_NEIGHBOURHOODS.map((name, index) => [name, index]));

  return [...neighbourhoods].sort((a, b) => {
    const aPriority = priority.get(a.name);
    const bPriority = priority.get(b.name);

    if (aPriority !== undefined && bPriority !== undefined) return aPriority - bPriority;
    if (aPriority !== undefined) return -1;
    if (bPriority !== undefined) return 1;
    return b.count - a.count || a.name.localeCompare(b.name);
  });
}

export function getRelatedByNeighbourhood(outlet: Supermarket, allOutlets: Supermarket[]) {
  const neighbourhoodIds = new Set(outlet.neighbourhood.map((item) => item.id));

  return allOutlets
    .filter(
      (candidate) =>
        candidate.id !== outlet.id &&
        candidate.neighbourhood.some((item) => neighbourhoodIds.has(item.id))
    )
    .slice(0, 4);
}

export function parseDeliveryLinks(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(/:\s+/);
      const url = rest.join(": ");
      return url.startsWith("http") ? { label, url } : { label: line, url: line };
    });
}

export function pageDescription(title: string, count?: number) {
  if (typeof count === "number") {
    return `${title} with ${formatCount(count, "published supermarket outlet")} across Singapore.`;
  }

  return `${title}, a curated guide to supermarkets across Singapore by brand, neighbourhood, mall, and MRT station.`;
}

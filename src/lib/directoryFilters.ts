export const FILTER_VALUE_SEPARATOR = "|";

export type ActiveFilter = readonly [key: string, value: string];

type FilterableLink = {
  slug?: string | null;
};

export function encodeFilterValues(items: FilterableLink[]) {
  return items
    .map((item) => item.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .join(FILTER_VALUE_SEPARATOR);
}

export function splitFilterValues(value: string | undefined) {
  return (value || "")
    .split(FILTER_VALUE_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function cardMatchesFilters(dataset: Record<string, string | undefined>, activeFilters: readonly ActiveFilter[]) {
  return activeFilters.every(([key, value]) => splitFilterValues(dataset[key]).includes(value));
}

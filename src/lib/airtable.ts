export type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

export type LinkedItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
};

export type TaxonomyItem = LinkedItem & {
  count: number;
};

export type Supermarket = {
  id: string;
  outletName: string;
  slug: string;
  brand: LinkedItem[];
  category: string;
  neighbourhood: LinkedItem[];
  mall: LinkedItem[];
  address: string;
  streetName: string;
  postalCode: string;
  mrt: LinkedItem[];
  openingHours: string;
  phone: string;
  googleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  imageUrl: string;
  galleryImagesUrl: string;
  featured: boolean;
  published: boolean;
};

export type DirectoryData = {
  brands: TaxonomyItem[];
  neighbourhoods: TaxonomyItem[];
  malls: TaxonomyItem[];
  mrtStations: TaxonomyItem[];
  supermarkets: Supermarket[];
  featuredSupermarkets: Supermarket[];
  categories: string[];
};

type EnvSource = Record<string, string | undefined>;
type FetchLike = typeof fetch;

const DEFAULT_BASE_ID = "appOYRk7lYQ8SSNCR";

const TABLES = {
  supermarkets: "tblE6IK77xz0ChbMT",
  brands: "tblK5rFjHnVqd2g6U",
  neighbourhoods: "tblLPGvEo7lH4pLzR",
  malls: "tblHHymwYJJQH5UK6",
  mrtStations: "tblxME1R6ILNCa8Af"
} as const;

const FIELDS = {
  supermarkets: {
    outletName: ["fldaSNrp6I8auhsxM", "Outlet Name"],
    slug: ["fldm8OUq811I4sDFL", "Slug"],
    brand: ["fldiDxIqZZROJ2PiT", "Brand"],
    category: ["fld8gPZjOWGMBfMer", "Category"],
    neighbourhood: ["fldoROJgXxEo5phwJ", "Neighbourhood"],
    mall: ["fldw8QjjvT68cDC8X", "Mall / Location"],
    address: ["fldrJIponvyYPTDJh", "Address"],
    streetName: ["fld8YcgSfr5E8HLW2", "Street Name"],
    postalCode: ["fld9KgbA5PqnJb0qc", "Postal Code"],
    mrt: ["fldjwAcSaFE7gFMem", "Nearest MRT"],
    openingHours: ["fldggqLrl0qnFMafj", "Opening Hours"],
    phone: ["fldgTlmibBvY5apcj", "Phone"],
    googleMapsUrl: ["flddqNn1UdNMtRbNz", "Google Maps URL"],
    facebookUrl: ["fldIZKdQkIQsmeO1l", "Facebook URL"],
    instagramUrl: ["fldt0n4NgpQuoNa3G", "Instagram URL"],
    imageUrl: ["fldOPTYb27sd4K4aZ", "Image URL"],
    galleryImagesUrl: ["fldyk0SXOq90jPl0H", "Gallery Images URL"],
    featured: ["fldUPgDqc9H0DwX1l", "Featured"],
    published: ["fldKtJIAHMLqSCEeP", "Published"]
  },
  brands: {
    name: ["fldPwU2iFk9wEsmba", "Name"],
    slug: ["fldA09ghMk1pINerc", "Slug"]
  },
  neighbourhoods: {
    name: ["fld9PsIecu0V0LYkd", "Name"],
    slug: ["fldEFQ1jysfxziqfM", "Slug"],
    imageUrl: ["fldhOHgO7KBCTidHJ", "Image URL"]
  },
  malls: {
    name: ["fldiH8RSpJ81XjnTB", "Name"],
    slug: ["fld0cC7txqdeM3u83", "Slug"]
  },
  mrtStations: {
    name: ["fld5fDN0H0461Oq1V", "Name"],
    slug: ["fld4fkwSoz7qSoQEq", "Slug"]
  }
} as const;

let directoryCache: Promise<DirectoryData> | undefined;

export function assertAirtableEnv(env: EnvSource = process.env) {
  const apiKey = env.AIRTABLE_API_KEY || env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = env.AIRTABLE_BASE_ID || DEFAULT_BASE_ID;

  if (!apiKey) {
    throw new Error("Missing AIRTABLE_API_KEY or AIRTABLE_PERSONAL_ACCESS_TOKEN. Copy .env.example to .env and add your key.");
  }

  return { apiKey, baseId };
}

export async function fetchAirtableRecords(
  baseId: string,
  tableId: string,
  apiKey: string,
  fetcher: FetchLike = fetch
): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "100", returnFieldsByFieldId: "true" });
    if (offset) params.set("offset", offset);

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}?${params.toString()}`;
    const res = await fetcher(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!res.ok) {
      const message = await res.text().catch(() => "");
      throw new Error(`Airtable request failed for table ${tableId}: ${res.status} ${message}`);
    }

    const data = (await res.json()) as { records?: AirtableRecord[]; offset?: string };
    records.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return records;
}

export function isValidNeighbourhoodName(name: string) {
  const value = name.trim().toLowerCase();
  return Boolean(value) && !value.startsWith("http") && !value.includes("://");
}

export function getFirstInitial(brandName: string, outletName: string) {
  return (brandName || outletName || "S").trim().charAt(0).toUpperCase();
}

export function resolveLinks(
  value: unknown,
  lookup: Map<string, LinkedItem>
): LinkedItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      const id = typeof entry === "string" ? entry : readString(entry, "id");
      const named = typeof entry === "object" && entry ? readString(entry, "name") : "";
      const linked = id ? lookup.get(id) : undefined;

      if (linked) return linked;
      if (id && named) return { id, name: named, slug: "" };
      return undefined;
    })
    .filter((entry): entry is LinkedItem => Boolean(entry?.name));
}

export async function getDirectoryData(): Promise<DirectoryData> {
  directoryCache ||= loadDirectoryData();
  return directoryCache;
}

async function loadDirectoryData(): Promise<DirectoryData> {
  const { apiKey, baseId } = assertAirtableEnv();
  const [brandRecords, neighbourhoodRecords, mallRecords, mrtRecords] = await Promise.all([
    fetchAirtableRecords(baseId, TABLES.brands, apiKey),
    fetchAirtableRecords(baseId, TABLES.neighbourhoods, apiKey),
    fetchAirtableRecords(baseId, TABLES.malls, apiKey),
    fetchAirtableRecords(baseId, TABLES.mrtStations, apiKey)
  ]);

  const brands = createLookup(brandRecords, FIELDS.brands.name, FIELDS.brands.slug);
  const neighbourhoods = createLookup(
    neighbourhoodRecords.filter((record) => isValidNeighbourhoodName(readFieldString(record.fields, FIELDS.neighbourhoods.name))),
    FIELDS.neighbourhoods.name,
    FIELDS.neighbourhoods.slug,
    FIELDS.neighbourhoods.imageUrl
  );
  const malls = createLookup(mallRecords, FIELDS.malls.name, FIELDS.malls.slug);
  const mrtStations = createLookup(mrtRecords, FIELDS.mrtStations.name, FIELDS.mrtStations.slug);

  const supermarketRecords = await fetchAirtableRecords(baseId, TABLES.supermarkets, apiKey);
  const supermarkets = supermarketRecords
    .map((record) => normalizeSupermarket(record, brands.map, neighbourhoods.map, malls.map, mrtStations.map))
    .filter((outlet) => outlet.published && outlet.slug)
    .sort((a, b) => a.outletName.localeCompare(b.outletName));

  if (supermarketRecords.length > 0 && supermarkets.length === 0) {
    throw new Error(
      "No published supermarkets found in Airtable. Set Published = true and ensure each published outlet has a Slug."
    );
  }

  const countedBrands = withCounts(brands.items, supermarkets, (outlet) => outlet.brand);
  const countedNeighbourhoods = withCounts(neighbourhoods.items, supermarkets, (outlet) => outlet.neighbourhood)
    .filter((item) => isValidNeighbourhoodName(item.name));
  const countedMalls = withCounts(malls.items, supermarkets, (outlet) => outlet.mall);
  const countedMrtStations = withCounts(mrtStations.items, supermarkets, (outlet) => outlet.mrt);

  return {
    brands: countedBrands.sort((a, b) => a.name.localeCompare(b.name)),
    neighbourhoods: countedNeighbourhoods.sort((a, b) => a.name.localeCompare(b.name)),
    malls: countedMalls.sort((a, b) => a.name.localeCompare(b.name)),
    mrtStations: countedMrtStations.sort((a, b) => a.name.localeCompare(b.name)),
    supermarkets,
    featuredSupermarkets: supermarkets.filter((outlet) => outlet.featured),
    categories: uniqueSorted(supermarkets.map((outlet) => outlet.category))
  };
}

function createLookup(records: AirtableRecord[], nameField: readonly string[], slugField: readonly string[], imageUrlField?: readonly string[]) {
  const items = records
    .map((record) => ({
      id: record.id,
      name: readFieldString(record.fields, nameField),
      slug: readFieldString(record.fields, slugField),
      imageUrl: imageUrlField ? readFieldString(record.fields, imageUrlField) : undefined
    }))
    .filter((item) => item.name && item.slug);

  return {
    items,
    map: new Map(items.map((item) => [item.id, item]))
  };
}

function normalizeSupermarket(
  record: AirtableRecord,
  brands: Map<string, LinkedItem>,
  neighbourhoods: Map<string, LinkedItem>,
  malls: Map<string, LinkedItem>,
  mrtStations: Map<string, LinkedItem>
): Supermarket {
  const fields = record.fields;

  return {
    id: record.id,
    outletName: readFieldString(fields, FIELDS.supermarkets.outletName),
    slug: readFieldString(fields, FIELDS.supermarkets.slug),
    brand: resolveLinks(readField(fields, FIELDS.supermarkets.brand), brands),
    category: readFieldString(fields, FIELDS.supermarkets.category),
    neighbourhood: resolveLinks(readField(fields, FIELDS.supermarkets.neighbourhood), neighbourhoods),
    mall: resolveLinks(readField(fields, FIELDS.supermarkets.mall), malls),
    address: readFieldString(fields, FIELDS.supermarkets.address),
    streetName: readFieldString(fields, FIELDS.supermarkets.streetName),
    postalCode: readPostalCode(readField(fields, FIELDS.supermarkets.postalCode)),
    mrt: resolveLinks(readField(fields, FIELDS.supermarkets.mrt), mrtStations),
    openingHours: readFieldString(fields, FIELDS.supermarkets.openingHours),
    phone: readFieldString(fields, FIELDS.supermarkets.phone),
    googleMapsUrl: readFieldString(fields, FIELDS.supermarkets.googleMapsUrl),
    facebookUrl: readFieldString(fields, FIELDS.supermarkets.facebookUrl),
    instagramUrl: readFieldString(fields, FIELDS.supermarkets.instagramUrl),
    imageUrl: readFieldString(fields, FIELDS.supermarkets.imageUrl),
    galleryImagesUrl: readFieldString(fields, FIELDS.supermarkets.galleryImagesUrl),
    featured: Boolean(readField(fields, FIELDS.supermarkets.featured)),
    published: Boolean(readField(fields, FIELDS.supermarkets.published))
  };
}

function withCounts(
  items: LinkedItem[],
  supermarkets: Supermarket[],
  readLinks: (outlet: Supermarket) => LinkedItem[]
): TaxonomyItem[] {
  const counts = new Map<string, number>();

  for (const outlet of supermarkets) {
    for (const item of readLinks(outlet)) {
      counts.set(item.id, (counts.get(item.id) || 0) + 1);
    }
  }

  return items
    .map((item) => ({ ...item, count: counts.get(item.id) || 0 }))
    .filter((item) => item.count > 0);
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function readString(source: unknown, key: string) {
  if (!source || typeof source !== "object") return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function readField(source: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return undefined;
}

function readFieldString(source: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = readString(source, key);
    if (value) return value;
  }

  return "";
}

function readPostalCode(value: unknown) {
  if (typeof value === "number") return String(Math.trunc(value)).padStart(6, "0");
  if (typeof value === "string") return value.trim();
  return "";
}

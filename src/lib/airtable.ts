export type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

export type LinkedItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
};

export type TaxonomyItem = LinkedItem & {
  count: number;
};

export type Supermarket = {
  id: string;
  outletName: string;
  slug: string;
  description: string;
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
  gettingThereByCar: string;
  gettingThereByPublicTransport: string;
  nearbyBusServices: string;
  nearbyLandmarks: string;
  featured: boolean;
};

export type GroceryStore = Supermarket;

export type DirectoryData = {
  brands: TaxonomyItem[];
  supermarketBrands: TaxonomyItem[];
  groceryStoreBrands: TaxonomyItem[];
  neighbourhoods: TaxonomyItem[];
  malls: TaxonomyItem[];
  mrtStations: TaxonomyItem[];
  supermarkets: Supermarket[];
  groceryStores: GroceryStore[];
  featuredSupermarkets: Supermarket[];
  categories: string[];
};

type EnvSource = Record<string, string | undefined>;
type FetchLike = typeof fetch;

const DEFAULT_BASE_ID = "appOYRk7lYQ8SSNCR";

const TABLES = {
  supermarkets: "tblE6IK77xz0ChbMT",
  groceryStores: "tblBZ9jw8xUJ0ebtz",
  brands: "tblK5rFjHnVqd2g6U",
  neighbourhoods: "tblLPGvEo7lH4pLzR",
  malls: "tblHHymwYJJQH5UK6",
  mrtStations: "tblxME1R6ILNCa8Af"
} as const;

const FIELDS = {
  supermarkets: {
    outletName: ["fldaSNrp6I8auhsxM", "Outlet Name"],
    slug: ["fldm8OUq811I4sDFL", "Slug"],
    description: ["fldIrfJrZTsErftMN", "Outlet Description"],
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
    gettingThereByCar: ["fldbEV2NcQ7bZ0M0a", "Getting There by Car"],
    gettingThereByPublicTransport: ["fldYCaW3KbZmmJS4I", "Getting There by Public Transport"],
    nearbyBusServices: ["fld3d3y5k1e72EAHK", "Nearby Bus Services"],
    nearbyLandmarks: ["fldM9U6ChPSfkdgg2", "Nearby Landmarks", "Nearby Landmarks  "],
    featured: ["fldUPgDqc9H0DwX1l", "Featured"]
  },
  groceryStores: {
    outletName: ["fld7Le0O7ItTSeses", "Outlet Name"],
    slug: ["fldj1ftP91mrspDmr", "Slug"],
    description: ["fldFkGiQ0TNnPcttt", "Outlet Description"],
    brand: ["fldfwYhP0Zcx7ZPZz", "Brand"],
    category: ["fld59gyIPW1vZcMV7", "Category"],
    neighbourhood: ["fldlKfiFYxZ7tmhdp", "Neighbourhood"],
    mall: ["fldt1hSIwTrRAACPD", "Mall / Location"],
    address: ["fldoC9YNovTHdQDqX", "Address"],
    streetName: ["fld5RDPhgrqnwELDI", "Street Name"],
    postalCode: ["fld6DHKZ6PL67807S", "Postal Code"],
    mrt: ["fldgp1LhbFZQECMV2", "Nearest MRT"],
    openingHours: ["fldd9RkQm0L63JaWZ", "Opening Hours"],
    phone: ["flddMMVHcBQHt7pTZ", "Phone"],
    googleMapsUrl: ["fldajeWqVd8vRObuf", "Google Maps URL"],
    facebookUrl: ["fldFSbMflIbbKbOI1", "Facebook URL"],
    instagramUrl: ["fldqTODchpbdMKaKm", "Instagram URL"],
    imageUrl: ["fldLIkxA37NWsH4RF", "Image URL"],
    galleryImagesUrl: ["fldvdrrmPquJHMlHn", "Gallery Images URL"],
    gettingThereByCar: [],
    gettingThereByPublicTransport: [],
    nearbyBusServices: [],
    nearbyLandmarks: [],
    featured: ["fldRIHcPd92J1tXI1", "Featured"]
  },
  brands: {
    name: ["fldPwU2iFk9wEsmba", "Brand Name", "Name"],
    slug: ["fldA09ghMk1pINerc", "Slug"],
    imageUrl: ["fldp86xMlykctfvv0", "Image URL"],
    description: ["fldgNoZbK2EY6KFWJ", "Brand Description"]
  },
  neighbourhoods: {
    name: ["fld9PsIecu0V0LYkd", "Neighbourhood Name", "Name"],
    slug: ["fldEFQ1jysfxziqfM", "Slug"],
    imageUrl: ["fldhOHgO7KBCTidHJ", "Image URL"],
    description: ["fldAVsFHnsfOYcDOZ", "Neighbourhood Description"]
  },
  malls: {
    name: ["fldiH8RSpJ81XjnTB", "Mall Name", "Name"],
    slug: ["fld0cC7txqdeM3u83", "Slug"],
    imageUrl: ["fldqvNsAVvEFOVRFn", "Image URL"],
    description: ["fldAQDK706ZDbtQhk", "Mall Description"]
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
  directoryCache ||= loadDirectoryData().catch((error: unknown) => {
    directoryCache = undefined;
    throw error;
  });
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

  const brands = createLookup(
    brandRecords,
    FIELDS.brands.name,
    FIELDS.brands.slug,
    FIELDS.brands.imageUrl,
    FIELDS.brands.description
  );
  const neighbourhoods = createLookup(
    neighbourhoodRecords.filter((record) => isValidNeighbourhoodName(readFieldString(record.fields, FIELDS.neighbourhoods.name))),
    FIELDS.neighbourhoods.name,
    FIELDS.neighbourhoods.slug,
    FIELDS.neighbourhoods.imageUrl,
    FIELDS.neighbourhoods.description
  );
  const malls = createLookup(
    mallRecords,
    FIELDS.malls.name,
    FIELDS.malls.slug,
    FIELDS.malls.imageUrl,
    FIELDS.malls.description
  );
  const mrtStations = createLookup(mrtRecords, FIELDS.mrtStations.name, FIELDS.mrtStations.slug);

  const [supermarketRecords, groceryStoreRecords] = await Promise.all([
    fetchAirtableRecords(baseId, TABLES.supermarkets, apiKey),
    fetchAirtableRecords(baseId, TABLES.groceryStores, apiKey)
  ]);

  if (supermarketRecords.length === 0) {
    throw new Error(
      "No supermarket records found in Airtable. Check AIRTABLE_BASE_ID and table permissions before building the directory."
    );
  }

  const supermarkets = supermarketRecords
    .map((record) => normalizeOutlet(record, FIELDS.supermarkets, brands.map, neighbourhoods.map, malls.map, mrtStations.map))
    .filter((outlet) => outlet.outletName && outlet.slug)
    .filter(uniqueOutletSlug)
    .sort((a, b) => a.outletName.localeCompare(b.outletName));
  const groceryStores = groceryStoreRecords
    .map((record) => normalizeOutlet(record, FIELDS.groceryStores, brands.map, neighbourhoods.map, malls.map, mrtStations.map))
    .filter((outlet) => outlet.outletName && outlet.slug)
    .filter(uniqueOutletSlug)
    .sort((a, b) => a.outletName.localeCompare(b.outletName));

  if (supermarketRecords.length > 0 && supermarkets.length === 0) {
    throw new Error(
      "No valid supermarkets found in Airtable. Ensure each supermarket has an Outlet Name and Slug."
    );
  }

  const supermarketBrands = withCounts(brands.items, supermarkets, (outlet) => outlet.brand)
    .sort((a, b) => a.name.localeCompare(b.name));
  const groceryStoreBrands = withCounts(brands.items, groceryStores, (outlet) => outlet.brand)
    .sort((a, b) => a.name.localeCompare(b.name));
  const countedBrands = groupSupermarketBrandsFirst(supermarketBrands, groceryStoreBrands);
  const allOutlets = [...supermarkets, ...groceryStores];
  const countedNeighbourhoods = withCounts(neighbourhoods.items, allOutlets, (outlet) => outlet.neighbourhood)
    .filter((item) => isValidNeighbourhoodName(item.name));
  const countedMalls = withCounts(malls.items, allOutlets, (outlet) => outlet.mall);
  const countedMrtStations = withCounts(mrtStations.items, allOutlets, (outlet) => outlet.mrt);

  return {
    brands: countedBrands,
    supermarketBrands,
    groceryStoreBrands,
    neighbourhoods: countedNeighbourhoods.sort((a, b) => a.name.localeCompare(b.name)),
    malls: countedMalls.sort((a, b) => a.name.localeCompare(b.name)),
    mrtStations: countedMrtStations.sort((a, b) => a.name.localeCompare(b.name)),
    supermarkets,
    groceryStores,
    featuredSupermarkets: supermarkets.filter((outlet) => outlet.featured),
    categories: uniqueSorted(supermarkets.map((outlet) => outlet.category))
  };
}

function createLookup(
  records: AirtableRecord[],
  nameField: readonly string[],
  slugField: readonly string[],
  imageUrlField?: readonly string[],
  descriptionField?: readonly string[]
) {
  const items = records
    .map((record) => ({
      id: record.id,
      name: readFieldString(record.fields, nameField),
      slug: readFieldString(record.fields, slugField) || slugify(readFieldString(record.fields, nameField)),
      imageUrl: imageUrlField ? readFieldString(record.fields, imageUrlField) : undefined,
      description: descriptionField ? readFieldString(record.fields, descriptionField) : undefined
    }))
    .filter((item) => item.name && item.slug);

  return {
    items,
    map: new Map(items.map((item) => [item.id, item]))
  };
}

function normalizeOutlet(
  record: AirtableRecord,
  fieldsConfig: typeof FIELDS.supermarkets | typeof FIELDS.groceryStores,
  brands: Map<string, LinkedItem>,
  neighbourhoods: Map<string, LinkedItem>,
  malls: Map<string, LinkedItem>,
  mrtStations: Map<string, LinkedItem>
): Supermarket {
  const fields = record.fields;

  return {
    id: record.id,
    outletName: readFieldString(fields, fieldsConfig.outletName),
    slug: readFieldString(fields, fieldsConfig.slug),
    description: readFieldString(fields, fieldsConfig.description),
    brand: resolveLinks(readField(fields, fieldsConfig.brand), brands),
    category: readFieldString(fields, fieldsConfig.category),
    neighbourhood: resolveLinks(readField(fields, fieldsConfig.neighbourhood), neighbourhoods),
    mall: resolveLinks(readField(fields, fieldsConfig.mall), malls),
    address: readFieldString(fields, fieldsConfig.address),
    streetName: readFieldString(fields, fieldsConfig.streetName),
    postalCode: readPostalCode(readField(fields, fieldsConfig.postalCode)),
    mrt: resolveLinks(readField(fields, fieldsConfig.mrt), mrtStations),
    openingHours: readFieldString(fields, fieldsConfig.openingHours),
    phone: readFieldString(fields, fieldsConfig.phone),
    googleMapsUrl: readFieldString(fields, fieldsConfig.googleMapsUrl),
    facebookUrl: readFieldString(fields, fieldsConfig.facebookUrl),
    instagramUrl: readFieldString(fields, fieldsConfig.instagramUrl),
    imageUrl: readFieldString(fields, fieldsConfig.imageUrl),
    galleryImagesUrl: readFieldString(fields, fieldsConfig.galleryImagesUrl),
    gettingThereByCar: readFieldString(fields, fieldsConfig.gettingThereByCar),
    gettingThereByPublicTransport: readFieldString(fields, fieldsConfig.gettingThereByPublicTransport),
    nearbyBusServices: readFieldString(fields, fieldsConfig.nearbyBusServices),
    nearbyLandmarks: readFieldString(fields, fieldsConfig.nearbyLandmarks),
    featured: Boolean(readField(fields, fieldsConfig.featured))
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

function groupSupermarketBrandsFirst(supermarketBrands: TaxonomyItem[], groceryStoreBrands: TaxonomyItem[]) {
  const supermarketBrandIds = new Set(supermarketBrands.map((brand) => brand.id));
  const groceryCounts = new Map(groceryStoreBrands.map((brand) => [brand.id, brand.count]));
  const supermarketGroup = supermarketBrands.map((brand) => ({
    ...brand,
    count: brand.count + (groceryCounts.get(brand.id) || 0)
  }));
  const groceryOnlyGroup = groceryStoreBrands.filter((brand) => !supermarketBrandIds.has(brand.id));

  return [...supermarketGroup, ...groceryOnlyGroup];
}

function uniqueOutletSlug(outlet: Supermarket, index: number, outlets: Supermarket[]) {
  return outlets.findIndex((candidate) => candidate.slug === outlet.slug) === index;
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

function slugify(value: string) {
  return value
    .trim()
    .replace(/&/g, "and")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

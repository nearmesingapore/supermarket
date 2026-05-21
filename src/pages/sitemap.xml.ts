import { getDirectoryData } from "@/lib/airtable";
import { buildSitemapXml } from "@/lib/seo";

export async function GET({ site }: { site: URL | undefined }) {
  const data = await getDirectoryData();

  return new Response(buildSitemapXml(data, site), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}

import { buildRobotsTxt } from "@/lib/seo";

export function GET({ site }: { site: URL | undefined }) {
  return new Response(buildRobotsTxt(site), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

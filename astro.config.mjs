import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://supermarket.sg",
  output: "static",
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ]
});

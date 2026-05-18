import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://singapore-supermarket-directory.pages.dev",
  output: "static",
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ]
});

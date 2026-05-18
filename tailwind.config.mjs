/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#1f1d1a",
        muted: "#706b63",
        line: "#e8e2da",
        paper: "#fbfaf8",
        sage: "#77836b",
        brass: "#9a7a3f"
      },
      boxShadow: {
        editorial: "0 18px 50px rgba(31, 29, 26, 0.08)"
      }
    }
  },
  plugins: []
};

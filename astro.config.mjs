import { defineConfig } from 'astro/config'

import robotsTxt from "astro-robots-txt"
import sitemap from "@astrojs/sitemap"

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap(), robotsTxt()],
  site: 'https://jl1990.github.io/',

  vite: {
    plugins: [tailwindcss()]
  }
})
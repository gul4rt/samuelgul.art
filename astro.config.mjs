// @ts-check
// Configuração mínima do Astro: sem integrações, zero JS de framework.
// O output é 100% estático — o build roda na CI (GitHub Actions), nunca no navegador.
import { defineConfig } from 'astro/config';

export default defineConfig({
  // domínio próprio do GitHub Pages (CNAME vive em public/CNAME)
  site: 'https://samuelgul.art',
  base: '/',
  trailingSlash: 'ignore',
});

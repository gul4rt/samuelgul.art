// Content collections — schema dos posts.
// Posts bilíngues: um .md por idioma em src/content/posts/, ligados pelo MESMO `slug`
// (é o elo que os templates usam pra montar o seletor de idioma .p-lang).
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    /** título no idioma do arquivo */
    title: z.string(),
    /** meta description (SEO + resumo no índice) */
    description: z.string(),
    /** ordenação do índice (mais recente no topo) */
    date: z.coerce.date(),
    /** idioma da entrada */
    lang: z.enum(['pt-br', 'en-us']),
    /** idêntico no par bilíngue — NÃO deve repetir dentro do mesmo lang */
    slug: z.string(),
    /** identificador da publicação, ex.: 'LOG.001' (vira o .p-kicker) */
    log: z.string(),
    /** classe da publicação (vira o CLASS no .p-meta) */
    class: z.enum(['NOTE', 'RESEARCH', 'WRITEUP']),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };

/**
 * Schéma des fichiers d'outils (src/content/outils/*.json).
 * Si un fichier ne respecte pas les règles SEO ci-dessous, `npm run build`
 * s'arrête avec un message clair indiquant le fichier et le champ fautif.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { normaliser, compterMots } from './lib/texte';

const blocContenu = z
  .object({
    h2: z.string().min(5),
    paragraphes: z.array(z.string().min(20)).optional(),
    etapes: z.array(z.string().min(5)).optional(),
    liste: z.array(z.string().min(5)).optional(),
  })
  .refine((b) => b.paragraphes || b.etapes || b.liste, {
    message: 'Chaque bloc de contenu doit avoir des "paragraphes", des "etapes" ou une "liste".',
  });

const versionLangue = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Le slug ne doit contenir que a-z, 0-9 et des tirets.'),
    motCle: z.string().min(3),
    nomCourt: z.string().min(3).max(40),
    title: z.string().min(20).max(60, 'Le title doit faire 60 caractères maximum (sinon Google le coupe).'),
    metaDescription: z
      .string()
      .min(120, 'La meta description doit faire au moins 120 caractères.')
      .max(160, 'La meta description doit faire 160 caractères maximum.'),
    h1: z.string().min(5).max(80),
    accroche: z.string().min(20).max(200),
    contenu: z.array(blocContenu).min(2),
    faq: z
      .array(z.object({ q: z.string().min(10), r: z.string().min(30) }))
      .min(4, 'La FAQ doit contenir au moins 4 questions.')
      .max(5, 'La FAQ doit contenir au maximum 5 questions.'),
  })
  .superRefine((v, ctx) => {
    const mot = normaliser(v.motCle);
    for (const champ of ['title', 'metaDescription', 'h1'] as const) {
      if (!normaliser(v[champ]).includes(mot)) {
        ctx.addIssue({
          code: 'custom',
          path: [champ],
          message: `Le mot-clé exact "${v.motCle}" doit apparaître dans "${champ}".`,
        });
      }
    }
    const textes = v.contenu.flatMap((b) => [b.h2, ...(b.paragraphes ?? []), ...(b.etapes ?? []), ...(b.liste ?? [])]);
    const mots = compterMots(textes.join(' '));
    if (mots < 300 || mots > 500) {
      ctx.addIssue({
        code: 'custom',
        path: ['contenu'],
        message: `Le contenu sous l'outil fait ${mots} mots : il doit en faire entre 300 et 500.`,
      });
    }
  });

const outils = defineCollection({
  // L'identifiant d'un outil = le nom de son fichier (ex. "webp-en-png").
  loader: glob({ pattern: '*.json', base: './src/content/outils' }),
  schema: z.object({
    categorie: z.enum(['pdf', 'image', 'video']),
    moteur: z.enum(['image-convert', 'heic-convert', 'pdf-merge', 'pdf-compress', 'video-convert']),
    options: z.record(z.string(), z.unknown()).default({}),
    similaires: z.array(z.string()).min(4, 'Indiquez au moins 4 outils similaires.').max(6, 'Indiquez au maximum 6 outils similaires.'),
    // true = page en préparation : non publiée, absente du sitemap et des menus.
    brouillon: z.boolean().default(false),
    dateMaj: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date attendu : AAAA-MM-JJ'),
    langues: z.object({
      fr: versionLangue,
      en: versionLangue.optional(),
      es: versionLangue.optional(),
    }),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    cle: z.enum(['mentions-legales', 'confidentialite', 'contact', 'a-propos']),
    langue: z.enum(['fr', 'en', 'es']),
    slug: z.string(),
    title: z.string().max(60),
    metaDescription: z.string().max(160),
    h1: z.string(),
  }),
});

export const collections = { outils, pages };

// sitemap.xml généré automatiquement, avec les versions linguistiques (hreflang).
import { toutesLesRoutes } from '../lib/routes';
import { LANGUES, urlAbsolue } from '../lib/i18n';

export async function GET() {
  const routes = await toutesLesRoutes();
  const urls = routes.map((r) => {
    const lastmod = r.type === 'outil' ? `\n    <lastmod>${r.outil.data.dateMaj}</lastmod>` : '';
    const alts =
      r.alternatives.length > 1
        ? r.alternatives
            .map((a) => `\n    <xhtml:link rel="alternate" hreflang="${LANGUES[a.langue].hreflang}" href="${urlAbsolue(a.chemin)}"/>`)
            .join('')
        : '';
    return `  <url>\n    <loc>${urlAbsolue(r.chemin)}</loc>${lastmod}${alts}\n  </url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

import { urlAbsolue } from '../lib/i18n';

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${urlAbsolue('/sitemap.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

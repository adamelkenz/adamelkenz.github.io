// ads.txt exigé par AdSense, généré à partir de src/config/site.json.
import site from '../config/site.json';

export function GET() {
  const pub = site.adsense.client.replace(/^ca-/, '');
  const contenu = site.adsense.actif
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : '# AdSense pas encore activé (voir src/config/site.json)\n';
  return new Response(contenu, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

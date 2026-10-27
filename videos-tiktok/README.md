# Vidéos TikTok (Remotion)

Mini-docs verticaux 1080×1920 : hook en question, motion design, vrais plans vidéo, bruitages, voix off.

## Vidéos

- `Halloween` — « Qu'est-ce qui se passe si tu organises une soirée d'Halloween pour te faire 3 000 € en une nuit ? »
- `Statuts` — « Micro, EURL, SASU, SARL, SAS… Lequel est fait pour toi ? »

## Clés (variables d'environnement, jamais dans le repo)

- `ELEVENLABS_API_KEY` — voix off (permissions : Text to Speech, Voices read, User read)
- `PIXABAY_API_KEY` — plans vidéo / photos libres de droits
- `FREESOUND_API_KEY` — bruitages (CC0 par défaut)

## Fabriquer une vidéo

```bash
npm install
npm run sfx                                        # sons synthétisés (public/sfx), Python + numpy/scipy
node scripts/eleven-voice.mjs statuts              # voix ElevenLabs + minutage par lettre (src/statuts/voice.json)
scripts/process-voice.sh statuts                   # accélération éventuelle (tempo) + traitement → .wav
node scripts/build-timeline.mjs statuts            # calage voix ↔ animations (src/statuts/timeline.json)
scripts/prep-stock.sh statuts micro 349792 0 10    # plan Pixabay recadré en 1080×1920
node scripts/freesound.mjs search "whoosh"         # chercher / récupérer des bruitages (public/sfx-real)
node scripts/render.mjs Statuts out/statuts.mp4    # rendu + son normalisé à -14 LUFS
npm run studio                                     # aperçu interactif
```

Changer le texte : modifier `src/<video>/lines.json`, regénérer la voix, relancer le calage.
Les animations se calent sur les mots prononcés (`wordAt(line)('mot')` dans `scenes.tsx`).
Crédits des bruitages : `public/sfx-real/CREDITS.txt`.

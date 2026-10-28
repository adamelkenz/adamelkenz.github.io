# Vidéos TikTok (Remotion)

Mini-docs verticaux 1080×1920 : hook en question, motion design, vrais plans vidéo, bruitages, voix off.

## Vidéos

- `Halloween` — « Qu'est-ce qui se passe si tu organises une soirée d'Halloween pour te faire 3 000 € en une nuit ? »
- `Statuts` — « Micro, EURL, SASU, SARL, SAS… Lequel est fait pour toi ? »
- `Marches` — « Comment une petite entreprise peut-elle travailler pour l'État… et être payée à temps ? » (voix : Bill)
- `WhiteLabel` — « Comment des marques vendent des produits… qu'elles n'ont jamais fabriqués ? » + appel à commenter « WHITE » (message et suivi dans `crm/`)
- `Train` — « Un TGV à 300 km/h… et plus personne ne le contrôle. Que se passe-t-il ? » (TGV générique animé, VACMA, KVB/TVM, ETCS)
- `Serbie` — « Comment un toit de gare qui s'effondre… a fini par faire tomber le pouvoir en Serbie ? » (voix : Bill abaissé de 2 demi-tons, `pitch` dans voice.json)
- `DataCenters` — « Pourquoi l'Irlande donne près d'un quart de son électricité… à des bâtiments sans fenêtres ? » (voix : Bill, cartes en motion design)

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
scripts/prep-photo.sh datacenters dublin 2315013   # photo Pixabay recadrée pour un zoom lent
node scripts/freesound.mjs search "whoosh"         # chercher / récupérer des bruitages (public/sfx-real)
scripts/normalize-sfx.sh public/sfx-real public/sfx-norm   # même niveau perçu pour tous les bruitages
node scripts/render.mjs Statuts out/statuts.mp4    # rendu + son normalisé à -14 LUFS
python3 scripts/voice-track.py statuts out/statuts-voice.wav          # piste voix seule
python3 scripts/mix-check.py out/statuts.mp4 out/statuts-voice.wav    # bruitages qui dépassent la voix
npm run studio                                     # aperçu interactif
```

Changer le texte : modifier `src/<video>/lines.json`, regénérer la voix, relancer le calage.
Les animations se calent sur les mots prononcés (`wordAt(line)('mot')` dans `scenes.tsx`).
Crédits des bruitages : `public/sfx-real/CREDITS.txt`.

Bruitages : utiliser `<Fx name="pop" at={…} />` (`src/components/Fx.tsx`), dont les niveaux sont calibrés
sur les fichiers normalisés de `public/sfx-norm`. Ajuster `FX_LEVELS` plutôt que des volumes au cas par cas.

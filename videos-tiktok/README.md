# Vidéos TikTok (Remotion)

Mini-docs verticaux 1080×1920 : hook en question, motion design, effets sonores, voix off.

## Vidéos

- `Halloween` — « Qu'est-ce qui se passe si tu organises une soirée d'Halloween pour te faire 3 000 € en une nuit ? »

## Fabriquer une vidéo

```bash
npm install
npm run sfx                      # synthétise les effets sonores dans public/sfx (Python + numpy/scipy)
# voix : un fichier par ligne de src/<video>/lines.json → public/<video>/voice/line-XX.wav
#   - voix provisoire gratuite : PIPER=… MODEL=… scripts/draft-voice.sh halloween
#   - voix finale : générée (ElevenLabs via Higgsfield) puis déposée au même endroit
npm run timeline                 # recalcule le calage voix ↔ animations (src/<video>/timeline.json)
npm run render:halloween         # out/halloween.mp4, son normalisé à -14 LUFS
npm run studio                   # aperçu interactif
```

Changer le texte : modifier `src/<video>/lines.json`, regénérer la voix, relancer `npm run timeline`.
Les animations se calent sur les mots prononcés (`wordAt(line)('mot')` dans `scenes.tsx`).

"""Génère les images de partage (Open Graph) 1200x630, en français.
Usage (une seule fois, résultat versionné) : python3 scripts/generer-og.py"""
from PIL import Image, ImageDraw, ImageFont

BOLD = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
MED = "/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf"
W, H = 1200, 630
CATS = {
    "pdf": ("PDF", "Compresser · Fusionner", (217, 58, 69)),
    "image": ("HEIC · WebP", "JPG · PNG", (14, 143, 128)),
    "video": ("MOV → MP4", "Vidéo", (122, 69, 194)),
    "defaut": ("PDF · Image · Vidéo", "Outils gratuits, 100 % local", (36, 80, 216)),
}

def cadenas(d, x, y, s, couleur):
    d.rounded_rectangle([x, y + s * 0.45, x + s, y + s * 1.25], radius=s * 0.15, fill=couleur)
    d.arc([x + s * 0.18, y, x + s * 0.82, y + s * 0.9], 180, 360, fill=couleur, width=int(s * 0.14))
    d.line([x + s * 0.18 + s * 0.07, y + s * 0.45, x + s * 0.18 + s * 0.07, y + s * 0.5], fill=couleur, width=int(s * 0.14))
    d.line([x + s * 0.82 - s * 0.07, y + s * 0.45, x + s * 0.82 - s * 0.07, y + s * 0.5], fill=couleur, width=int(s * 0.14))

for nom, (titre, sous, c) in CATS.items():
    img = Image.new("RGB", (W, H), c)
    d = ImageDraw.Draw(img)
    # léger dégradé
    for i in range(H):
        f = i / H * 0.25
        d.line([(0, i), (W, i)], fill=tuple(int(v * (1 - f)) for v in c))
    d.rounded_rectangle([60, 60, W - 60, H - 60], radius=36, fill=(255, 255, 255))
    d.text((120, 150), titre, font=ImageFont.truetype(BOLD, 96), fill=(22, 26, 38))
    d.text((120, 275), sous, font=ImageFont.truetype(MED, 56), fill=c)
    cadenas(d, 120, 400, 70, (17, 132, 91))
    d.text((220, 425), "Vos fichiers restent sur votre appareil", font=ImageFont.truetype(MED, 42), fill=(79, 86, 105))
    img.save(f"public/og/{nom}.png", optimize=True)
    print("✓", nom)

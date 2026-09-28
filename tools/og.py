"""Generate assets/img/og.png (1200x630 social card) with Pillow."""
import pathlib
from PIL import Image, ImageDraw, ImageFont
ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H = 1200, 630
img = Image.new('RGB', (W, H))
d = ImageDraw.Draw(img)
a, b = (142, 11, 32), (216, 160, 42)
for x in range(W):
    t = x / W
    c = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    d.line([(x, 0), (x, H)], fill=c)
def font(size, bold=True):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)
d.text((80, 150), '270270 · NUMBER LAB', font=font(30), fill=(255, 231, 163))
d.text((80, 215), 'Decode the luck', font=font(84), fill='white')
d.text((80, 315), 'in any number.', font=font(84), fill='white')
d.text((80, 450), '520 = I love you  ·  8 = prosper  ·  4 = avoid', font=font(30), fill=(255, 233, 236))
out = ROOT / 'assets' / 'img'
out.mkdir(parents=True, exist_ok=True)
img.save(out / 'og.png')
print('og.png written')

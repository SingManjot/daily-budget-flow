from PIL import Image, ImageDraw, ImageFilter
import os

out_dir = r"R:/GH_REPOS/daily-budget-flow/public"
os.makedirs(out_dir, exist_ok=True)

for size in (192, 512):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.rounded_rectangle((size // 15, size // 15, size - size // 15, size - size // 15), radius=size // 7, fill=(15, 23, 31, 255))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(10, size // 12)))
    img.alpha_composite(glow, (0, 0))

    base = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    b = ImageDraw.Draw(base)
    b.rounded_rectangle((size // 11, size // 11, size - size // 11, size - size // 11), radius=size // 7, fill=(16, 185, 129, 255))
    img.alpha_composite(base, (0, 0))

    highlight = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    h = ImageDraw.Draw(highlight)
    h.rounded_rectangle((size // 6, size // 6, size - size // 6, size - size // 6), radius=size // 9, fill=(255, 255, 255, 30))
    img.alpha_composite(highlight, (0, 0))

    d.line(
        [
            (size * 0.33, size * 0.32),
            (size * 0.67, size * 0.32),
            (size * 0.33, size * 0.5),
            (size * 0.67, size * 0.5),
            (size * 0.33, size * 0.68),
            (size * 0.67, size * 0.68),
        ],
        fill=(245, 249, 255, 255),
        width=max(12, size // 12),
        joint='curve'
    )
    d.ellipse((size * 0.71, size * 0.72, size * 0.84, size * 0.85), fill=(255, 255, 255, 220))

    path = os.path.join(out_dir, f"icon-{size}.png")
    img.save(path)
    print(f"created {path}")

print("done")

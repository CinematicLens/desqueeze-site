from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw, ImageFont


W, H = 1200, 675

SRC_BG = "assets/virtual-monitor-hdmi-setup.png"
OUT_PNG = "assets/virtual-monitor-howto-relay-monitor.png"


def get_font(path: str, size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size=size)
    except Exception:
        return ImageFont.load_default()


def rounded_rect(d: ImageDraw.ImageDraw, xy, radius: int, fill, outline=None, width: int = 2) -> None:
    x0, y0, x1, y1 = xy
    d.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)


def arrow(d: ImageDraw.ImageDraw, from_pt, to_pt, color, width: int = 6) -> None:
    (xA, yA), (xB, yB) = from_pt, to_pt
    d.line([xA, yA, xB, yB], fill=color, width=width)

    angle = math.atan2(yB - yA, xB - xA)
    head_len = 18
    head_w = 10

    xP, yP = xB, yB
    left = (
        xP - head_len * math.cos(angle) + head_w * math.sin(angle),
        yP - head_len * math.sin(angle) - head_w * math.cos(angle),
    )
    right = (
        xP - head_len * math.cos(angle) - head_w * math.sin(angle),
        yP - head_len * math.sin(angle) + head_w * math.cos(angle),
    )
    d.polygon([(xP, yP), left, right], fill=color)


def wrap_lines(d: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for w in words:
        cand = (line + " " + w).strip()
        if d.textlength(cand, font=font) <= max_width:
            line = cand
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def main() -> None:
    if not os.path.exists(SRC_BG):
        raise SystemExit(f"Missing background image: {SRC_BG}")

    bg = Image.open(SRC_BG).convert("RGBA").resize((W, H), Image.Resampling.LANCZOS)
    img = bg.copy()
    d = ImageDraw.Draw(img)

    # Dark overlay (so labels read on top of the photo)
    overlay = Image.new("RGBA", (W, H), (7, 17, 31, 160))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Fonts
    font_bold_path = r"C:\Windows\Fonts\arialbd.ttf"
    font_regular_path = r"C:\Windows\Fonts\arial.ttf"

    fb_title = get_font(font_bold_path, 34)
    fb_sub = get_font(font_bold_path, 18)
    fb_box = get_font(font_bold_path, 20)
    fb_boxsub = get_font(font_regular_path, 14)
    fb_badge = get_font(font_bold_path, 20)

    # Colors
    teal = (34, 211, 238, 255)
    muted = (230, 247, 251, 205)
    white = (230, 247, 251, 240)
    box_sub_text = (234, 252, 255, 200)

    def text_shadow(pos, text, font, fill, shadow=(0, 0, 0, 140), offset=(0, 4)) -> None:
        x, y = pos
        ox, oy = offset
        d.text((x + ox, y + oy), text, font=font, fill=shadow)
        d.text((x, y), text, font=font, fill=fill)

    # Header
    text_shadow((60, 80), "Cinema Monitor (Android)", fb_title, white)
    subtitle = "How to go from Camera → USB/UVC → Android → Live anamorphic monitor"
    text_shadow((60, 120), subtitle, fb_sub, muted, offset=(0, 4))

    # Step boxes
    steps = [
        ("Camera", "(HDMI out)", (60, 240, 310, 360)),
        ("USB / UVC", "capture", (410, 240, 665, 360)),
        ("Android phone/tablet", "runs Cinema Monitor", (770, 240, 1140, 360)),
    ]

    for step_title, step_sub, (x0, y0, x1, y1) in steps:
        rounded_rect(
            d,
            (x0, y0, x1, y1),
            radius=16,
            fill=(8, 180, 213, 35),
            outline=(34, 211, 238, 235),
            width=2,
        )

        # Title centered
        tw = d.textlength(step_title, font=fb_box)
        tx = x0 + (x1 - x0 - tw) / 2
        text_shadow((tx, y0 + 40), step_title, fb_box, white, shadow=(0, 0, 0, 0), offset=(0, 3))

        # Sub line centered
        tw2 = d.textlength(step_sub, font=fb_boxsub)
        tx2 = x0 + (x1 - x0 - tw2) / 2
        d.text((tx2, y0 + 78), step_sub, font=fb_boxsub, fill=box_sub_text)

    # Live monitor bar
    bar = (60, 395, 1140, 505)
    rounded_rect(d, bar, radius=16, fill=(255, 255, 255, 20), outline=(148, 163, 184, 140), width=2)
    bar_title = "Live anamorphic monitor"
    bar_sub = "de-squeeze + framelines + zebra/false color/focus peaking"

    bx0, by0, bx1, by1 = bar
    btw = d.textlength(bar_title, font=fb_box)
    btx = bx0 + (bx1 - bx0 - btw) / 2
    text_shadow((btx, by0 + 38), bar_title, fb_box, white, shadow=(0, 0, 0, 0), offset=(0, 3))

    lines = wrap_lines(d, bar_sub, fb_boxsub, max_width=bx1 - bx0 - 60)
    cur_y = by0 + 70
    for ln in lines[:2]:
        ltw = d.textlength(ln, font=fb_boxsub)
        ltx = bx0 + (bx1 - bx0 - ltw) / 2
        d.text((ltx, cur_y), ln, font=fb_boxsub, fill=(230, 247, 251, 200))
        cur_y += 18

    # Arrows
    arrow(d, (310, 300), (410, 300), color=teal, width=6)
    arrow(d, (665, 300), (770, 300), color=teal, width=6)
    arrow(d, (1140, 300), (620, 395), color=teal, width=6)

    # Save-cost badge
    badge = (70, 560, 1130, 625)
    bx0, by0, bx1, by1 = badge
    rounded_rect(d, badge, radius=22, fill=(34, 211, 238, 240), outline=None, width=2)

    badge_text = "Save cost: use your phone as the relay monitor"
    bw = d.textlength(badge_text, font=fb_badge)
    btx = bx0 + (bx1 - bx0 - bw) / 2
    text_shadow((btx, by0 + 18), badge_text, fb_badge, (6, 17, 26, 255), shadow=(0, 0, 0, 0), offset=(0, 3))

    badge_sub = "No expensive standalone monitor needed for client/focus checks"
    badge_sub_lines = wrap_lines(d, badge_sub, fb_boxsub, max_width=bx1 - bx0 - 60)
    d.text(
        (bx0 + (bx1 - bx0 - d.textlength(badge_sub_lines[0], font=fb_boxsub)) / 2, by0 + 45),
        badge_sub_lines[0],
        font=fb_boxsub,
        fill=(230, 247, 251, 195),
    )

    # Export
    out_img = img.convert("RGB")
    out_img.save(OUT_PNG, "PNG", optimize=True)
    print("Wrote", OUT_PNG)


if __name__ == "__main__":
    main()


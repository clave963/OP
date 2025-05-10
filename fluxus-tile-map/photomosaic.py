import os
import json
from math import sqrt
from PIL import Image

# -----------------------------------------
# CONFIGURATION
# -----------------------------------------
# Paths
MAIN_IMAGE_PATH = "body_target.jpg"   # Path to your main "body" image
FLUXUS_DIR = "Fluxus_tiles"           # Folder with Fluxus tile images
OUTPUT_IMAGE_PATH = "body_mosaic.jpg"
OUTPUT_JSON_PATH = "mosaic_map.json"

# Mosaic settings
TILE_SIZE = 10            # Size (in pixels) of each tile cell
ALLOW_TRANSFORMATIONS = True
MAX_USAGE_PER_TILE = None     # e.g. 5 if you only want each tile repeated up to 5 times
COLORIZATION_STRENGTH = 0.7   # 0.0 = no tint, 1.0 = fully tinted
OVERLAY_ALPHA = 0.0           # Final blend with main image (0=none, 1=full main image)
DUPLICATE_SPACING = 4         # Prevent same tile from appearing within 1 tile distance

# Transformations to try if ALLOW_TRANSFORMATIONS = True
TRANSFORMS = [
    "none",
    #"flip_horizontal",
    # "rotate_90",
    # "rotate_180",
    # "flip_vertical",
]

# -----------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------
def compute_average_color(img):
    """
    Compute (R, G, B) average color of a PIL Image.
    """
    img = img.convert("RGB")
    pixels = img.getdata()
    r_total, g_total, b_total = 0, 0, 0
    for (r, g, b) in pixels:
        r_total += r
        g_total += g
        b_total += b
    count = len(pixels)
    return (r_total/count, g_total/count, b_total/count)

def color_distance(c1, c2):
    """
    Euclidean distance between two RGB colors (R, G, B).
    """
    return sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2 + (c1[2] - c2[2])**2)

def apply_transform(img, transform):
    """
    Apply a specified transformation (e.g., flip or rotate) to a PIL image.
    """
    if transform == "none":
        return img
    elif transform == "flip_horizontal":
        return img.transpose(Image.FLIP_LEFT_RIGHT)
    elif transform == "flip_vertical":
        return img.transpose(Image.FLIP_TOP_BOTTOM)
    elif transform == "rotate_90":
        return img.rotate(90, expand=True)
    elif transform == "rotate_180":
        return img.rotate(180, expand=True)
    else:
        return img

def colorize_tile(tile_img, region_avg, strength):
    """
    Tint the tile_img toward region_avg color by 'strength' (0..1).
    A simple alpha-blend approach:
       final = tile*(1-strength) + region_avg*(strength)
    """
    if strength <= 0:
        return tile_img

    tile_img = tile_img.convert("RGB")
    new_img = Image.new("RGB", tile_img.size)
    pix_in = tile_img.load()
    pix_out = new_img.load()

    reg_r, reg_g, reg_b = region_avg
    for y in range(tile_img.height):
        for x in range(tile_img.width):
            r, g, b = pix_in[x, y]
            nr = int(r*(1-strength) + reg_r*(strength))
            ng = int(g*(1-strength) + reg_g*(strength))
            nb = int(b*(1-strength) + reg_b*(strength))
            pix_out[x, y] = (nr, ng, nb)
    return new_img

def is_tile_too_close(bx, by, tile_filename, placed_tiles, spacing):
    """
    Check if 'tile_filename' appears within 'spacing' distance
    of (bx, by) in the placed_tiles dictionary.
    placed_tiles maps (bx, by) -> tile_filename
    """
    for ny in range(by - spacing, by + spacing + 1):
        for nx in range(bx - spacing, bx + spacing + 1):
            if (nx, ny) in placed_tiles:
                if placed_tiles[(nx, ny)] == tile_filename:
                    return True
    return False

def overlay_main_image(mosaic_img, main_image_path, alpha):
    """
    Blend mosaic_img with the original main image at a global alpha.
      final = mosaic*(1-alpha) + main*alpha
    """
    if alpha <= 0:
        return mosaic_img
    if alpha >= 1:
        with Image.open(main_image_path) as main_img:
            return main_img.convert("RGB")

    with Image.open(main_image_path) as main_img:
        main_img = main_img.convert("RGB")
        # Match size
        if mosaic_img.size != main_img.size:
            main_img = main_img.resize(mosaic_img.size, Image.Resampling.LANCZOS)

        w, h = mosaic_img.size
        blended = Image.new("RGB", (w, h))

        pix_mosaic = mosaic_img.load()
        pix_main = main_img.load()
        pix_out = blended.load()

        for y in range(h):
            for x in range(w):
                mr, mg, mb = pix_mosaic[x, y]
                ar, ag, ab = pix_main[x, y]
                br = int(mr*(1-alpha) + ar*alpha)
                bg = int(mg*(1-alpha) + ag*alpha)
                bb = int(mb*(1-alpha) + ab*alpha)
                pix_out[x, y] = (br, bg, bb)
        return blended

# -----------------------------------------
# 1. LOAD FLUXUS TILES
# -----------------------------------------
def load_fluxus_tiles(fluxus_dir, tile_size):
    tile_info_list = []
    for filename in os.listdir(fluxus_dir):
        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        path = os.path.join(fluxus_dir, filename)
        try:
            with Image.open(path) as im:
                im_resized = im.resize((tile_size, tile_size), Image.Resampling.LANCZOS)
                avg_col = compute_average_color(im_resized)
                tile_info_list.append({
                    "filename": filename,
                    "image": im_resized,
                    "avg_color": avg_col,
                    "usage_count": 0
                })
        except Exception as e:
            print(f"Error loading {path}: {e}")
    print(f"Loaded {len(tile_info_list)} tiles.")
    return tile_info_list

# -----------------------------------------
# 2. BUILD THE MOSAIC
# -----------------------------------------
def build_mosaic(main_image_path, tile_size, tile_info_list):
    """
    - Opens main image
    - For each cell, compute region color, find best tile
    - Checks adjacency (DUPLICATE_SPACING)
    - Applies transformations (if ALLOW_TRANSFORMATIONS = True)
    - Respects MAX_USAGE_PER_TILE if set
    - Colorize tile if desired
    - Pastes tile into mosaic
    Returns the mosaic image and a JSON map
    """
    with Image.open(main_image_path) as main_img:
        main_img = main_img.convert("RGB")
        w, h = main_img.size
        tiles_x = w // tile_size
        tiles_y = h // tile_size

        print(f"Main image size: {w}x{h}")
        print(f"Will create mosaic of {tiles_x} x {tiles_y} = {tiles_x*tiles_y} tiles")

        mosaic_img = Image.new("RGB", (tiles_x * tile_size, tiles_y * tile_size))
        mosaic_map = []
        placed_tiles = {}  # dict: (bx, by) -> tile_filename

        for by in range(tiles_y):
            for bx in range(tiles_x):
                # Crop region
                left = bx * tile_size
                top = by * tile_size
                region = main_img.crop((left, top, left+tile_size, top+tile_size))
                region_avg = compute_average_color(region)

                best_tile_info = None
                best_transform = "none"
                best_dist = float("inf")

                for tile_info in tile_info_list:
                    # usage limit check
                    if MAX_USAGE_PER_TILE is not None:
                        if tile_info["usage_count"] >= MAX_USAGE_PER_TILE:
                            continue
                    # adjacency check
                    if is_tile_too_close(bx, by, tile_info["filename"], placed_tiles, DUPLICATE_SPACING):
                        continue

                    # transformations
                    transforms_to_try = TRANSFORMS if ALLOW_TRANSFORMATIONS else ["none"]
                    for t in transforms_to_try:
                        transformed = apply_transform(tile_info["image"], t)
                        avg_tcol = compute_average_color(transformed)
                        dist = color_distance(avg_tcol, region_avg)
                        if dist < best_dist:
                            best_dist = dist
                            best_tile_info = tile_info
                            best_transform = t

                if best_tile_info:
                    chosen_img = best_tile_info["image"]
                    # apply transform
                    if best_transform != "none":
                        chosen_img = apply_transform(chosen_img, best_transform)

                    # optional colorization
                    chosen_img = colorize_tile(chosen_img, region_avg, COLORIZATION_STRENGTH)

                    # paste
                    mosaic_img.paste(chosen_img, (left, top))

                    # update usage & adjacency
                    best_tile_info["usage_count"] += 1
                    placed_tiles[(bx, by)] = best_tile_info["filename"]

                    mosaic_map.append({
                        "bx": bx,
                        "by": by,
                        "bounding_box": [left, top, left+tile_size, top+tile_size],
                        "tile_filename": best_tile_info["filename"],
                        "transform_used": best_transform,
                        "usage_count": best_tile_info["usage_count"]
                    })

        return mosaic_img, mosaic_map

# -----------------------------------------
# MAIN
# -----------------------------------------
def main():
    # 1. Load fluxus tiles
    tile_info_list = load_fluxus_tiles(FLUXUS_DIR, TILE_SIZE)

    # 2. Build mosaic
    mosaic_img, mosaic_map = build_mosaic(MAIN_IMAGE_PATH, TILE_SIZE, tile_info_list)

    # 3. Overlay if desired
    final_img = overlay_main_image(mosaic_img, MAIN_IMAGE_PATH, OVERLAY_ALPHA)

    # 4. Save
    final_img.save(OUTPUT_IMAGE_PATH)
    print(f"Mosaic saved to {OUTPUT_IMAGE_PATH}")

    # 5. Save JSON map
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as jf:
        json.dump(mosaic_map, jf, indent=2)
    print(f"Mosaic map saved to {OUTPUT_JSON_PATH}")

if __name__ == "__main__":
    main()

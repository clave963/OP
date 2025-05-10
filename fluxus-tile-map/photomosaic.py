import os
import json
import math
import csv
from PIL import Image
import numpy as np
import pandas as pd

# === USER SETTINGS ===
TILE_DIR = "black_imagination_all_images"  # Folder of tile images
HERO_IMAGE_PATH = "hero_image.jpg"         # Path to hero image
METADATA_CSV = "image_metadata.csv"        # CSV with metadata for tiles
OUTPUT_MOSAIC_PATH = "output_mosaic.jpg"
OUTPUT_JSON_PATH = "output_metadata.json"
TILE_SIZE = 25  # in pixels

# === LOAD METADATA CSV ===
metadata_df = pd.read_csv(METADATA_CSV)
metadata_dict = {}
for _, row in metadata_df.iterrows():
    filename = row['filename']
    metadata_dict[filename] = row.drop('filename').to_dict()

# === FUNCTION: Compute average grayscale ===
def average_grayscale(image):
    return np.mean(np.array(image.convert("L")))

# === FUNCTION: Load and process tiles ===
def load_tiles(tile_dir, tile_size):
    tiles = []
    for filename in os.listdir(tile_dir):
        if not filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        try:
            path = os.path.join(tile_dir, filename)
            img = Image.open(path).resize((tile_size, tile_size))
            gray_val = average_grayscale(img)
            tiles.append((img.copy(), gray_val, filename))
            img.close()
        except Exception as e:
            print(f"Skipped {filename}: {e}")
    return tiles

# === FUNCTION: Find best tile match ===
def best_match_tile(target_gray, tiles):
    return min(tiles, key=lambda t: abs(t[1] - target_gray))

# === FUNCTION: Create mosaic and metadata ===
def create_mosaic(hero_path, tiles, tile_size):
    hero = Image.open(hero_path).convert("L")
    width, height = hero.size
    grid_w, grid_h = width // tile_size, height // tile_size

    print(f"Grid size: {grid_w} x {grid_h} → {grid_w * grid_h} tiles")

    mosaic_img = Image.new("RGB", (grid_w * tile_size, grid_h * tile_size))
    metadata_output = []

    for i in range(grid_h):
        for j in range(grid_w):
            x, y = j * tile_size, i * tile_size
            box = (x, y, x + tile_size, y + tile_size)
            region = hero.crop(box)
            gray_val = average_grayscale(region)
            tile_img, _, tile_name = best_match_tile(gray_val, tiles)
            mosaic_img.paste(tile_img, box)

            metadata = metadata_dict.get(tile_name, {})
            metadata_output.append({
                "tile": tile_name,
                "position": {"x": x, "y": y},
                "size": {"w": tile_size, "h": tile_size},
                "grayscale": gray_val,
                "metadata": metadata
            })

    return mosaic_img, metadata_output

# === MAIN EXECUTION ===
if __name__ == "__main__":
    print("Loading tiles...")
    tiles = load_tiles(TILE_DIR, TILE_SIZE)
    print(f"Loaded {len(tiles)} tiles.")

    print("Creating mosaic...")
    mosaic_img, metadata = create_mosaic(HERO_IMAGE_PATH, tiles, TILE_SIZE)
    mosaic_img.save(OUTPUT_MOSAIC_PATH)
    print(f"Mosaic saved to {OUTPUT_MOSAIC_PATH}")

    with open(OUTPUT_JSON_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata JSON saved to {OUTPUT_JSON_PATH}")

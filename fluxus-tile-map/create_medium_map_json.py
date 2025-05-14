import os
import json
import random
import re
import numpy as np
from PIL import Image
from math import sqrt
from collections import Counter

# Basic configuration
SRC_JSON = "fluxus_metadata.json"
MAP_NAME = "medium_map"
MAP_JSON = os.path.join(MAP_NAME, "tiles.json")
THUMB_FOLDER = os.path.join(MAP_NAME, "thumbs")
IMAGES_FOLDER = os.path.join(MAP_NAME, "images")

# Path to the main "hero" image for this mosaic
SRC_IMAGE = "../Fluxus_Images/181806_Bag_Piece_(1964),_performed_during_Perpetual_Fluxfest,_Cinematheque,_New_York,_June_27,_1965.jpg"

# Create necessary directories
os.makedirs(THUMB_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# === CONFIGURATION SETTINGS ===
# Maximum number of duplications allowed for any single artwork
MAX_DUPLICATIONS = 5

# Mosaic settings
TILE_SIZE = 25
COLORIZATION_STRENGTH = 0.7
OVERLAY_ALPHA = 0.0

# Single semi-white overlay color for all medium categories
DEFAULT_OVERLAY_COLOR = (0.9, 0.9, 0.9)  # Semi-white

# Medium categories (all using the same color)
MEDIUM_CATEGORIES = {
    "performance": DEFAULT_OVERLAY_COLOR,
    "print": DEFAULT_OVERLAY_COLOR,
    "object": DEFAULT_OVERLAY_COLOR,
    "photograph": DEFAULT_OVERLAY_COLOR,
    "publication": DEFAULT_OVERLAY_COLOR,
    "drawing": DEFAULT_OVERLAY_COLOR,
    "painting": DEFAULT_OVERLAY_COLOR,
    "unknown": DEFAULT_OVERLAY_COLOR
}

# Medium classification rules (using keywords)
MEDIUM_KEYWORDS = {
    "performance": ["performance", "action", "happening", "event", "concert"],
    "print": ["print", "lithograph", "screenprint", "woodcut", "etching", "engraving"],
    "object": ["object", "sculpture", "assemblage", "box", "multiple", "plastic", "wood", "metal", "glass", "ceramic"],
    "photograph": ["photograph", "photo", "gelatin silver", "polaroid", "slide"],
    "publication": ["book", "score", "magazine", "newspaper", "poster", "publication", "edition", "card", "postcard"],
    "drawing": ["drawing", "ink", "pencil", "graphite", "crayon", "pastel", "watercolor"],
    "painting": ["painting", "oil", "acrylic", "canvas", "panel"]
}

# === COLOR PROCESSING FUNCTIONS ===

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

def colorize_tile(img, target_color, strength):
    """
    Tint the img toward target_color by 'strength' (0..1).
    A simple alpha-blend approach:
       final = img*(1-strength) + target_color*(strength)
    """
    if strength <= 0:
        return img

    img = img.convert("RGB")
    new_img = Image.new("RGB", img.size)
    pix_in = img.load()
    pix_out = new_img.load()

    reg_r, reg_g, reg_b = target_color
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = pix_in[x, y]
            nr = int(r*(1-strength) + reg_r*(strength))
            ng = int(g*(1-strength) + reg_g*(strength))
            nb = int(b*(1-strength) + reg_b*(strength))
            pix_out[x, y] = (nr, ng, nb)
    return new_img

def average_grayscale(image):
    """Calculate the average grayscale value of an image"""
    return sum(image.convert("L").getdata()) / (image.size[0] * image.size[1])

# === MEDIUM CLASSIFICATION FUNCTIONS ===

def classify_medium(medium_text):
    """
    Classify the medium of an artwork based on its description.
    Returns one of the categories in MEDIUM_CATEGORIES.
    """
    if not medium_text or not isinstance(medium_text, str):
        return "unknown"
        
    medium_text = medium_text.lower()
    
    # Check each category's keywords
    for category, keywords in MEDIUM_KEYWORDS.items():
        for keyword in keywords:
            if keyword in medium_text:
                return category
    
    # Default classification if no keywords matched
    return "unknown"

def get_medium_color(medium_category, base_color):
    """
    Get a consistent semi-white overlay color regardless of medium category.
    """
    # We'll use a subtle blend with the base color
    # 80% our default color, 20% influence from the base image
    
    # Convert base_color to 0-1 range if needed
    if isinstance(base_color[0], int):
        base_color = [c/255.0 for c in base_color]
    
    # Blend default color with base color
    r = 0.8 * DEFAULT_OVERLAY_COLOR[0] + 0.2 * base_color[0]
    g = 0.8 * DEFAULT_OVERLAY_COLOR[1] + 0.2 * base_color[1]
    b = 0.8 * DEFAULT_OVERLAY_COLOR[2] + 0.2 * base_color[2]
    
    return [r, g, b]

# === MOSAIC GENERATION FUNCTIONS ===

def load_fluxus_metadata():
    """Load the Fluxus metadata from JSON file."""
    with open(SRC_JSON, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    print(f"Loaded {len(metadata)} metadata records")
    return metadata

def build_tile_library(metadata):
    """Build a library of tiles from the metadata."""
    tiles = []
    for entry in metadata:
        local_path = entry.get("LocalPath", "")
        if not local_path or not os.path.exists(local_path):
            continue
        try:
            img = Image.open(local_path).convert("RGB").resize((TILE_SIZE, TILE_SIZE))
            grayscale = average_grayscale(img)
            
            # Classify the medium
            medium_category = classify_medium(entry.get("Medium", ""))
            
            # Store the entry, image, grayscale value, and medium category
            tiles.append((entry, img.copy(), grayscale, medium_category))
        except Exception as e:
            print(f"⚠️ Skipped {local_path}: {e}")
    
    print(f"Built tile library with {len(tiles)} valid tiles")
    return tiles

def find_best_match(grayscale_val, tile_library):
    """Find the best matching tile based on grayscale value."""
    return min(tile_library, key=lambda x: abs(x[2] - grayscale_val))

def create_medium_map():
    """Create a medium-based mosaic map from the Fluxus image data."""
    metadata = load_fluxus_metadata()
    tile_library = build_tile_library(metadata)

    if not tile_library:
        print("❌ No valid tiles found.")
        return

    # Load and process the main image
    main_img = Image.open(SRC_IMAGE).convert("RGB")
    width, height = main_img.size
    
    # Calculate grid dimensions
    cols = width // TILE_SIZE
    rows = height // TILE_SIZE
    
    print(f"Creating mosaic with dimensions: {cols}x{rows} tiles")
    
    # Track tile usage to limit repetition
    tile_usage_count = Counter()
    output = []

    # Process region by region
    for row in range(rows):
        for col in range(cols):
            x, y = col * TILE_SIZE, row * TILE_SIZE
            box = (x, y, x + TILE_SIZE, y + TILE_SIZE)
            region = main_img.crop(box)
            region_avg = average_grayscale(region)
            region_color = compute_average_color(region)
            
            # Find matches not exceeding maximum usage
            valid_matches = [t for t in tile_library 
                           if tile_usage_count[t[0].get("Title", "")] < MAX_DUPLICATIONS]
            
            # If no valid matches, reset counters for the least used tiles
            if not valid_matches:
                print("⚠️ All tiles reached maximum usage, resetting least used tiles")
                min_usage = min(tile_usage_count.values()) if tile_usage_count else 0
                valid_matches = [t for t in tile_library 
                               if tile_usage_count[t[0].get("Title", "")] == min_usage]
            
            # Find the best match
            matched_entry, matched_img, _, medium_category = find_best_match(region_avg, valid_matches)
            
            # Update usage count
            tile_usage_count[matched_entry.get("Title", "")] += 1
            
            # Get category color and apply colorization
            base_color = [c * 255 for c in compute_average_color(region)]
            medium_color = get_medium_color(medium_category, base_color)
            
            # Colorize the matched image
            colorized_img = colorize_tile(matched_img, 
                                       (int(medium_color[0]*255), 
                                        int(medium_color[1]*255), 
                                        int(medium_color[2]*255)), 
                                       COLORIZATION_STRENGTH)
            
            # Save thumbnail
            filename = os.path.basename(matched_entry.get("LocalPath", f"tile_{col}_{row}.jpg"))
            thumb_path = os.path.join(THUMB_FOLDER, filename)
            colorized_img.save(thumb_path)
            
            # Create tile record for JSON
            tile_record = {
                "pos": [col, row],
                "url": os.path.join("thumbs", filename),
                "Title": matched_entry.get("Title", ""),
                "Artist": matched_entry.get("Artist", ""),
                "Medium": matched_entry.get("Medium", ""),
                "Date": matched_entry.get("Date", ""),
                "color": medium_color,  # Use the medium-based color
                "Medium_Category": medium_category  # Store the classified medium category
            }
            output.append(tile_record)

    # Save the mosaic data to JSON
    with open(MAP_JSON, "w", encoding="utf-8") as f:
        json.dump({"images": output}, f, indent=2, ensure_ascii=False)

    print(f"✅ Medium map saved to {MAP_JSON}")
    
    # Create a summary of medium categories used
    medium_counts = Counter([tile["Medium_Category"] for tile in output])
    print("\nMedium category distribution:")
    for category, count in medium_counts.most_common():
        print(f"  {category}: {count} tiles ({count/len(output)*100:.1f}%)")

if __name__ == "__main__":
    create_medium_map()
#!/usr/bin/env python3
import os
import json
import random
import cv2
import re
import shutil
import numpy as np

# Source metadata and destination paths
SRC_JSON = "fluxus_metadata.json"
MAP_NAME = "medium_map"

# Output file locations
MAP_JSON = os.path.join(MAP_NAME, "tiles.json")
THUMB_FOLDER = os.path.join(MAP_NAME, "thumbs")
IMAGES_FOLDER = os.path.join(MAP_NAME, "images")  

# Hero image path - this will be blended with the tiles
HERO_IMAGE = "../Fluxus_Images/137345_Still_from_Disappearing_Music_for_Face.jpg"
HERO_OVERLAY_OPACITY = 0.25  # Adjust the blend factor (0.0-1.0)

# === GRID SETUP ===
# Define a smaller 90x60 grid (90 width x 60 height)
GRID_WIDTH = 90
GRID_HEIGHT = 60

# Medium categories 
MEDIUM_CATEGORIES = {
    "painting":    ["painting", "oil", "acrylic", "canvas", "panel", "gouache"],
    "drawing":     ["drawing", "chalk", "crayon", "pencil", "pen and ink", "pastel", "charcoal", "graphite", "sketch"],
    "print":       ["print", "lithograph", "etching", "woodcut", "screenprint", "linocut", "engraving", "monotype", "drypoint"],
    "sculpture":   ["sculpture", "wood", "metal", "bronze", "ceramic", "plaster", "steel", "installation", "assemblage", "object"],
    "photograph":  ["photograph", "gelatin silver", "c-print", "digital", "chromogenic", "photogram", "polaroid", "photo"],
    "mixed media": ["mixed media", "collage", "illustrated book", "multiple", "book", "mixed"]
}

# Grid boundaries - 6 equal regions
GRID_BOUNDARIES = {
    "painting":    (0,  0,  29, 29),    # Top-left
    "drawing":     (30, 0,  59, 29),    # Top-middle
    "print":       (60, 0,  89, 29),    # Top-right
    "sculpture":   (0,  30, 29, 59),    # Bottom-left
    "photograph":  (30, 30, 59, 59),    # Bottom-middle
    "mixed media": (60, 30, 89, 59)     # Bottom-right
}

# === HELPER FUNCTIONS ===
def determine_medium_category(medium_text):
    """Determine which medium category an artwork belongs to."""
    if not medium_text or not isinstance(medium_text, str):
        return "mixed media"  # Default if no medium specified
    
    medium_text = medium_text.lower()
    
    # Check each category's keywords
    for category, keywords in MEDIUM_CATEGORIES.items():
        for keyword in keywords:
            if keyword in medium_text:
                return category
    
    # If no match found, default to mixed media
    return "mixed media"

def extract_year_from_date(date_str):
    """Extract year from date formats in the Fluxus collection."""
    if not date_str or not isinstance(date_str, str):
        return 1965
    
    # Try to extract a 4-digit year
    year_match = re.search(r'\b(19|20)\d{2}\b', date_str)
    if year_match:
        return int(year_match.group(0))
    
    # Try to extract a 2-digit year
    year_match = re.search(r'\b\d{2}\b', date_str)
    if year_match:
        year = int(year_match.group(0))
        return 1900 + year
    
    # Default to middle of Fluxus period
    return 1965

def blend_with_hero_image(image, hero_image, blend_factor, x_pos, y_pos, grid_width, grid_height):
    """
    Blend the tile image with a portion of the hero image based on grid position.
    
    Args:
        image: The tile image (grayscale or color)
        hero_image: The hero image to blend with
        blend_factor: Factor determining blend strength (0.0-1.0)
        x_pos, y_pos: Position in the grid
        grid_width, grid_height: Total grid dimensions
    
    Returns:
        Blended image
    """
    # First, make sure both images are the same size
    image_h, image_w = image.shape[:2]
    hero_h, hero_w = hero_image.shape[:2]
    
    # Calculate which part of the hero image this tile corresponds to
    x_ratio = x_pos / (grid_width - 1)  # 0.0 to 1.0 across the grid
    y_ratio = y_pos / (grid_height - 1)  # 0.0 to 1.0 down the grid
    
    # Calculate pixel coordinates in the hero image
    hero_x = int(x_ratio * (hero_w - image_w))
    hero_y = int(y_ratio * (hero_h - image_h))
    
    # Ensure we don't go out of bounds
    hero_x = min(max(0, hero_x), hero_w - image_w)
    hero_y = min(max(0, hero_y), hero_h - image_h)
    
    # Extract the corresponding region from the hero image
    hero_region = hero_image[hero_y:hero_y+image_h, hero_x:hero_x+image_w]
    
    # Resize if dimensions don't match
    if hero_region.shape[:2] != image.shape[:2]:
        hero_region = cv2.resize(hero_region, (image_w, image_h))
    
    # Blend the images
    blended = cv2.addWeighted(image, 1.0 - blend_factor, hero_region, blend_factor, 0)
    
    return blended

def create_category_label_image(category_name, width=300, height=60, font_scale=1.0, thickness=2):
    """
    Create an image with a category label that can be overlaid on the visualization.
    
    Args:
        category_name: Name of the category
        width, height: Dimensions of the label image
        font_scale: Size of the font
        thickness: Line thickness of the font
    
    Returns:
        Image with the label text
    """
    # Create a transparent background
    label_img = np.zeros((height, width, 4), dtype=np.uint8)
    
    # Add a semi-transparent black background
    cv2.rectangle(label_img, (0, 0), (width, height), (0, 0, 0, 180), -1)
    
    # Set up the font
    font = cv2.FONT_HERSHEY_SIMPLEX
    text_size = cv2.getTextSize(category_name, font, font_scale, thickness)[0]
    
    # Calculate text position for center alignment
    text_x = (width - text_size[0]) // 2
    text_y = (height + text_size[1]) // 2
    
    # Add the text in white
    cv2.putText(label_img, category_name, (text_x, text_y), font, font_scale, (255, 255, 255, 255), thickness)
    
    return label_img

def create_grid_overlay_data():
    """Create data for grid overlay with medium category headers."""
    overlay = {
        "grid": {
            "visible": True,
            "color": [1.0, 1.0, 1.0, 0.3],  # Slightly more transparent
            "lineWidth": 1
        },
        "categories": []
    }
    
    # Add category boundaries and headers with UI settings
    for category, (start_x, start_y, end_x, end_y) in GRID_BOUNDARIES.items():
        width = end_x - start_x + 1
        height = end_y - start_y + 1
        
        # Create the label image filename
        label_filename = f"label_{category.replace(' ', '_')}.png"
        label_path = os.path.join(MAP_NAME, "images", label_filename).replace('\\', '/')
        
        overlay["categories"].append({
            "name": category.title(),
            "startX": start_x,
            "startY": start_y,
            "endX": end_x,
            "endY": end_y,
            "width": width,
            "height": height,
            "color": [1.0, 1.0, 1.0],
            "labelImage": label_path,
            "labelVisible": True
        })
    
    return overlay

def create_enhanced_medium_map():
    """Create a medium map with hero image blending and improved UI."""
    print("Starting enhanced medium map creation")
    
    # Start fresh - delete existing folders and recreate them
    for folder in [THUMB_FOLDER, IMAGES_FOLDER]:
        if os.path.exists(folder):
            shutil.rmtree(folder)
        os.makedirs(folder, exist_ok=True)
    
    # Load metadata from JSON file
    src = json.load(open(SRC_JSON, "r"))
    print(f"Loaded {len(src)} metadata records")
    
    # Load the hero image if it exists
    hero_image = None
    if os.path.exists(HERO_IMAGE):
        hero_image = cv2.imread(HERO_IMAGE)
        print(f"Loaded hero image: {HERO_IMAGE}")
    else:
        print(f"Warning: Hero image not found at {HERO_IMAGE}")
    
    # Find all local images
    image_dir = "../Fluxus_Images"
    local_images = {}
    
    if os.path.exists(image_dir):
        for filename in os.listdir(image_dir):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                parts = filename.split('_', 1)
                if len(parts) > 0:
                    obj_id = parts[0]
                    local_images[obj_id] = os.path.join(image_dir, filename)
    
    print(f"Found {len(local_images)} local images")
    
    # Group metadata by category
    items_by_category = {category: [] for category in MEDIUM_CATEGORIES.keys()}
    
    # Process each metadata item
    for item in src:
        obj_id = str(item.get("ObjectID", ""))
        
        # Skip if no matching local image
        if obj_id not in local_images:
            continue
        
        # Determine medium category
        if "Medium" in item and item["Medium"]:
            medium_text = item["Medium"]
            category = determine_medium_category(medium_text)
        elif "Classification" in item and item["Classification"]:
            classification = item["Classification"]
            category = determine_medium_category(classification)
        else:
            category = "mixed media"  # Default if no medium/classification info
        
        # Extract year
        year = extract_year_from_date(item.get("Date", ""))
        
        # Store with local image path
        item["LocalImagePath"] = local_images[obj_id]
        items_by_category[category].append((obj_id, item, year))
    
    # Print category counts
    for category, items in items_by_category.items():
        print(f"{category}: {len(items)} original artworks")
    
    # Create all possible grid positions
    all_positions = []
    for category, (start_x, start_y, end_x, end_y) in GRID_BOUNDARIES.items():
        for y in range(start_y, end_y + 1):
            for x in range(start_x, end_x + 1):
                all_positions.append((x, y, category))
    
    # Shuffle positions for variety
    random.shuffle(all_positions)
    print(f"Created {len(all_positions)} grid positions")
    
    # Calculate how many images we have in total and how many we need
    total_available = sum(len(items) for items in items_by_category.values())
    total_needed = len(all_positions)
    print(f"Need {total_needed} images, have {total_available} unique images")
    
    # Generate positioned items for the final map
    positioned_items = []
    
    # Fill every position with an artwork, duplicating if necessary
    position_index = 0
    for x, y, category in all_positions:
        category_items = items_by_category[category]
        
        # Skip if category has no items at all
        if not category_items:
            continue
        
        # Select an artwork from this category (with wrapping)
        item_index = position_index % len(category_items)
        obj_id, item, year = category_items[item_index]
        
        # Add to positioned items
        positioned_items.append((obj_id, item, x, y, year, category))
        position_index += 1
    
    print(f"Positioned {len(positioned_items)} items in the grid")
    
    # Create category label images
    print("Creating category label images")
    for category in MEDIUM_CATEGORIES.keys():
        label_img = create_category_label_image(category.title(), width=240, height=50)
        label_filename = f"label_{category.replace(' ', '_')}.png"
        cv2.imwrite(os.path.join(IMAGES_FOLDER, label_filename), label_img)
    
    # Process images and create tiles
    tiles_info = []
    
    # Process in batches with progress reporting
    batch_size = 100
    total_items = len(positioned_items)
    
    for i in range(0, total_items, batch_size):
        batch_end = min(i + batch_size, total_items)
        print(f"Processing batch: {i} to {batch_end} of {total_items}")
        
        for j in range(i, batch_end):
            obj_id, item, x_pos, y_pos, year, category = positioned_items[j]
            
            # Get local image path
            local_image_path = item.get("LocalImagePath")
            if not local_image_path or not os.path.exists(local_image_path):
                continue
            
            # Create filenames based on grid position for uniqueness
            image_filename = f"img_{x_pos}_{y_pos}.jpg"
            thumb_filename = f"thumb_{x_pos}_{y_pos}.jpg"
            
            # Create relative paths for JSON
            rel_image_path = os.path.join(MAP_NAME, "images", image_filename).replace('\\', '/')
            rel_thumb_path = os.path.join(MAP_NAME, "thumbs", thumb_filename).replace('\\', '/')
            
            # Create absolute paths for file operations
            abs_image_path = os.path.join(IMAGES_FOLDER, image_filename)
            abs_thumb_path = os.path.join(THUMB_FOLDER, thumb_filename)
            
            try:
                # Read the original image
                image = cv2.imread(local_image_path)
                if image is None:
                    print(f"Failed to read image: {local_image_path}")
                    continue
                    
                # Save a copy of the original to the images folder
                cv2.imwrite(abs_image_path, image)
                
                # Create grayscale thumbnail
                # Convert to grayscale first
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                gray_bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
                
                # Then resize
                thumbnail = cv2.resize(gray_bgr, (64, 64))
                
                # Blend with hero image if available
                if hero_image is not None:
                    thumbnail = blend_with_hero_image(
                        thumbnail, 
                        hero_image, 
                        HERO_OVERLAY_OPACITY,
                        x_pos, y_pos, 
                        GRID_WIDTH, GRID_HEIGHT
                    )
                
                # Save thumbnail
                cv2.imwrite(abs_thumb_path, thumbnail)
                
                # Add tile info
                tile_data = {
                    'thumbnail_url': rel_thumb_path,
                    'url': rel_image_path,
                    'pos': [x_pos, y_pos],
                    'color': [0.8, 0.8, 0.8],  # Neutral gray
                    'Category': category,
                    'Year': year
                }
                
                # Add metadata fields
                for key in ["Title", "Artist", "Date", "Medium", "Classification", 
                            "Dimensions", "Nationality", "ImageURL"]:
                    tile_data[key] = item.get(key, "")
                
                tiles_info.append(tile_data)
                
            except Exception as e:
                print(f"Error processing image {local_image_path}: {e}")
    
    print(f"Created {len(tiles_info)} tiles")
    
    # Create grid overlay data
    grid_overlay = create_grid_overlay_data()
    
    # Combine tiles and grid overlay data
    final_data = {
        "tiles": tiles_info,
        "grid_overlay": grid_overlay,
        "dimensions": {
            "width": GRID_WIDTH,
            "height": GRID_HEIGHT
        },
        "ui_settings": {
            "show_labels": True,
            "label_shortcut_key": "L",
            "grid_shortcut_key": "G",
            "hero_image_path": HERO_IMAGE.replace('\\', '/'),
            "hero_blend_factor": HERO_OVERLAY_OPACITY
        }
    }
    
    # Save the combined data to JSON
    os.makedirs(os.path.dirname(MAP_JSON), exist_ok=True)
    with open(MAP_JSON, "w") as f:
        json.dump(final_data, f, indent=2)
    
    print(f"Saved tile data to {MAP_JSON}")
    print("Done!")

if __name__ == "__main__":
    create_enhanced_medium_map()
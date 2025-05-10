import os
import json
import random
import urllib.request
import cv2
import requests
import urllib
import re
import numpy as np
from collections import Counter

SRC_JSON     = "fluxus_metadata.json"
MAP_NAME     = "map_1"

MAP_JSON     = os.path.join(MAP_NAME, "tiles.json")
THUMB_FOLDER = os.path.join(MAP_NAME, "thumbs")
IMAGES_FOLDER= os.path.join(MAP_NAME, "images")  

# Define the main image from which to create the tile map.
SRC_IMAGE = "../Fluxus_Images/127300_Dynamitage,_performed_during_Fluxus_Festival_of_Total_Art_and_Comportment,_Nice,_July_27,_1963.jpg"

os.makedirs(THUMB_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# === HELPER FUNCTIONS ===

def extract_year_from_date(date_str):
    """Extract year from date formats in the Fluxus collection."""
    if not date_str or not isinstance(date_str, str):
        return 1965  # Default to middle of Fluxus period if no date
    
    # Handle date ranges by taking the first year
    if "-" in date_str and not date_str.startswith("-"):
        parts = date_str.split("-")
        date_str = parts[0]
    
    # Handle circa dates like "c. 1953–54"
    if "c." in date_str:
        date_str = date_str.replace("c.", "").strip()
    
    # Try to extract a 4-digit year first
    year_match = re.search(r'\b(19|20)\d{2}\b', date_str)
    if year_match:
        return int(year_match.group(0))
    
    # Try to extract a 2-digit year (common in date ranges like "1953-54")
    year_match = re.search(r'\b\d{2}\b', date_str)
    if year_match:
        year = int(year_match.group(0))
        # Assume 19xx for Fluxus works
        return 1900 + year
    
    # If all else fails, return a default
    return 1965  # Middle of Fluxus period

def assign_positions_densely(metadata_with_years, tiles_x, tiles_y):
    """Assign positions to ensure a tight grid with no gaps."""
    # Sort items by year (oldest at the bottom, newest at the top)
    sorted_items = sorted(metadata_with_years, key=lambda x: x[2])
    
    positions = []
    row = tiles_y - 1  # Start at the bottom row
    col = 0
    
    # Place items in a tight grid, row by row from bottom to top
    for item in sorted_items:
        positions.append((item[0], item[1], col, row))  # id, image, x, y
        
        # Move to next position
        col += 1
        if col >= tiles_x:
            col = 0
            row -= 1  # Move up a row
            if row < 0:
                # Grid is full, stop adding items
                break
    
    return positions

def distribute_artworks_with_duplication(metadata, tiles_x, tiles_y):
    """Distribute artworks across the grid, with duplication if needed."""
    total_cells = tiles_x * tiles_y
    
    # Filter for valid metadata with image URLs
    valid_metadata = [(id, img) for id, img in enumerate(metadata) 
                      if "ImageURL" in img and img["ImageURL"]]
    
    # Extract years for sorting
    metadata_with_years = [(id, img, extract_year_from_date(img.get("Date", ""))) 
                           for id, img in valid_metadata]
    
    # Sort by year
    sorted_metadata = sorted(metadata_with_years, key=lambda x: x[2])
    
    # If we have fewer artworks than grid cells, we need to duplicate
    if len(sorted_metadata) < total_cells:
        print(f"Need to duplicate: {total_cells} cells but only {len(sorted_metadata)} artworks")
        
        # Create a list to hold duplicated items
        duplicated_metadata = []
        
        # First, calculate how many copies of each artwork we need
        copies_needed = total_cells
        base_copies = copies_needed // len(sorted_metadata)
        extra_copies = copies_needed % len(sorted_metadata)
        
        print(f"Base copies per artwork: {base_copies}, plus {extra_copies} extra")
        
        # Add base copies of each artwork
        for item in sorted_metadata:
            for _ in range(base_copies):
                duplicated_metadata.append(item)
        
        # Add extra copies from random selection (prioritizing middle years for better distribution)
        mid_range_items = [item for item in sorted_metadata 
                          if 1960 <= item[2] <= 1975]  # Core Fluxus period
        
        # If no mid-range items, use the full list
        if not mid_range_items:
            mid_range_items = sorted_metadata
        
        # Add extra copies
        for _ in range(extra_copies):
            random_item = random.choice(mid_range_items)
            duplicated_metadata.append(random_item)
        
        # Re-sort by year to maintain chronological order
        duplicated_metadata.sort(key=lambda x: x[2])
        
        sorted_metadata = duplicated_metadata
        print(f"After duplication: {len(sorted_metadata)} items")
        
        # Count duplicates for tracking
        id_counts = Counter([item[0] for item in sorted_metadata])
        most_common = id_counts.most_common(5)
        print(f"Most duplicated items: {most_common}")
    
    # Assign positions in a dense grid
    return assign_positions_densely(sorted_metadata, tiles_x, tiles_y)

def blend_with_hero_pixel(thumbnail, hero_pixel, blend_factor=0.5):
    """Blend the thumbnail with the hero image pixel color."""
    # Convert hero pixel to float array
    hero_pixel = np.array(hero_pixel, dtype=np.float32) / 255.0
    
    # Convert thumbnail to float
    thumbnail = thumbnail.astype(np.float32) / 255.0
    
    # Blend thumbnail with hero pixel color
    blended = thumbnail * blend_factor + hero_pixel * (1 - blend_factor)
    
    # Convert back to uint8
    return (blended * 255).astype(np.uint8)

def adjust_thumbnail_to_match_hero(thumbnail, hero_pixel, blend_amount=0.4):
    """Adjust thumbnail colors to better represent the hero image."""
    # Extract color components from hero pixel (BGR format in OpenCV)
    b, g, r = hero_pixel
    
    # Calculate brightness and contrast adjustments
    brightness = (r + g + b) / 3.0
    brightness_factor = 1.0
    
    if brightness < 100:
        # Lighten thumbnails in dark areas
        brightness_factor = 1.2
    elif brightness > 200:
        # Darken thumbnails in light areas
        brightness_factor = 0.8
    
    # Convert to HSV for better color adjustments
    hsv = cv2.cvtColor(thumbnail, cv2.COLOR_BGR2HSV).astype(np.float32)
    
    # Adjust value (brightness)
    hsv[:,:,2] = np.clip(hsv[:,:,2] * brightness_factor, 0, 255)
    
    # Convert back to BGR
    adjusted = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    
    # Blend with hero pixel for subtle color influence
    if blend_amount > 0:
        adjusted = blend_with_hero_pixel(adjusted, hero_pixel, 1 - blend_amount)
    
    return adjusted

# === MAIN CODE ===

# Load the main image using OpenCV.
src_image = cv2.imread(SRC_IMAGE)
if src_image is None:
    raise FileNotFoundError(f"Unable to load the image: {SRC_IMAGE}")

# Get the dimensions and compute the aspect ratio.
src_h, src_w = src_image.shape[:2]
src_aspect_ratio = src_w / src_h
print(f"Hero image dimensions: {src_w}x{src_h}, aspect ratio: {src_aspect_ratio:.2f}")

# ——— GRID-SIZING LOGIC ———
# Adjust MAX_TILES for desired detail level
MAX_TILES = 150  # Horizontal cells for a wide image

# Calculate grid dimensions based on aspect ratio
if src_aspect_ratio >= 1:
    # Wide image
    tiles_x = MAX_TILES
    tiles_y = int(MAX_TILES / src_aspect_ratio)
else:
    # Tall image
    tiles_y = MAX_TILES
    tiles_x = int(MAX_TILES * src_aspect_ratio)

# Ensure minimum dimensions and adjust for proper viewing
tiles_x = max(tiles_x, 20)  # At least 20 columns
tiles_y = max(tiles_y, 20)  # At least 20 rows

# For wide hero images, increase the height of the grid to make it more visible
if src_aspect_ratio > 3:  # Very wide image
    tiles_y = max(tiles_y, tiles_x // 3)  # Make the height at least 1/3 of width

print(f"Grid size: {tiles_x} columns × {tiles_y} rows (total cells: {tiles_x * tiles_y})")

# Resize the main image to the number of tiles for color sampling
src_image = cv2.resize(src_image, (tiles_x, tiles_y), interpolation=cv2.INTER_AREA)
print("Resized hero image shape:", src_image.shape)

# Load metadata from the JSON file.
src = json.load(open(SRC_JSON, "r"))
print(f"Number of metadata records loaded: {len(src)}")

# Initialize an empty grid to track filled positions
occupied_positions = set()
tiles_info = []

# Step 1: Distribute artworks across the grid with duplication if needed
print("Distributing artworks across the grid...")
positioned_items = distribute_artworks_with_duplication(src, tiles_x, tiles_y)
print(f"Positioned {len(positioned_items)} items in the grid")

# Step 2: Create tiles based on assigned positions
print("Creating tiles...")
for id, image, x_pos, y_pos in positioned_items:
    image_url = image["ImageURL"]
    if not image_url:
        continue
    
    position = (x_pos, y_pos)
    occupied_positions.add(position)
    
    # Download and process the image
    image_file_name = f"{id}.jpg"
    image_path = os.path.join(IMAGES_FOLDER, image_file_name)
    
    # Download the image if it doesn't exist already
    if not os.path.exists(image_path):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
        try:
            response = requests.get(image_url, headers=headers, stream=True)
            if response.status_code == 200:
                with open(image_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                print(f"Downloaded: {image_url}")
            else:
                print(f"Failed to download image: {response.status_code}")
                continue
        except Exception as e:
            print(f"Error downloading {image_url}: {e}")
            continue
    
    # Access the pixel from the hero image at this position
    try:
        pixel = src_image[y_pos, x_pos]
    except IndexError:
        print(f"Warning: Position {x_pos},{y_pos} is out of bounds for hero image with shape {src_image.shape}")
        continue
    
    # Open the downloaded image and process it for thumbnail creation
    image_cv = cv2.imread(image_path)
    if image_cv is None:
        print(f"Warning: Unable to load the downloaded image at {image_path}")
        continue
    
    # Resize to thumbnail size
    image_cv = cv2.resize(image_cv, (64, 64))
    
    # Adjust thumbnail to better match the hero image
    image_cv = adjust_thumbnail_to_match_hero(image_cv, pixel, blend_amount=0.4)
    
    # Apply final blur for smoother appearance
    image_cv = cv2.GaussianBlur(image_cv, (3, 3), 0)
    
    # Save the processed thumbnail
    thumb_name = f"thumb_{x_pos}_{y_pos}.jpg"
    thumb_path = os.path.join(THUMB_FOLDER, thumb_name)
    cv2.imwrite(thumb_path, image_cv)
    
    # Create a dictionary for tile data
    tile_data = {}
    tile_data['thumbnail_url'] = thumb_path.replace('\\', '/')
    tile_data['url'] = image_path.replace('\\', '/')
    tile_data['pos'] = [x_pos, y_pos]
    
    # Calculate color components from pixel
    r, g, b = pixel[2] / 255.0, pixel[1] / 255.0, pixel[0] / 255.0  # BGR to RGB
    tile_data['color'] = [r, g, b]  # Use hero image color
    
    tile_data['data'] = image
    tile_data['name'] = image["Title"]
    
    # Add the rest of the metadata
    tile_data['Title'] = image["Title"]
    tile_data['Name'] = image["Title"]
    tile_data['Date'] = image["Date"]
    tile_data['Artist'] = image["Artist"]
    tile_data['Artist Bio'] = image["Artist Bio"]
    tile_data['Nationality'] = image["Nationality"]
    tile_data['Dimensions'] = image["Dimensions"]
    tile_data['Medium'] = image["Medium"]
    tile_data['ImageURL'] = image["ImageURL"]
    
    tiles_info.append(tile_data)

print(f"Created {len(tiles_info)} tiles")

# Check for missing positions
if len(occupied_positions) < tiles_x * tiles_y:
    print(f"Warning: {tiles_x * tiles_y - len(occupied_positions)} grid cells are empty")

# Save the combined tiles information to the JSON file.
with open(MAP_JSON, "w") as f:
    json.dump(tiles_info, f, indent=4)

print(f"Saved tile data to {MAP_JSON}")
print("Done!")
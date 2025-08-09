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
from math import sqrt

SRC_JSON     = "fluxus_metadata.json"
MAP_NAME     = "map_1"

MAP_JSON     = os.path.join(MAP_NAME, "tiles.json")
THUMB_FOLDER = os.path.join(MAP_NAME, "thumbs")
IMAGES_FOLDER= os.path.join(MAP_NAME, "images")  

# Define the main image from which to create the tile map.
# SRC_IMAGE = "../Fluxus_Images/181806_Bag_Piece_(1964),_performed_during_Perpetual_Fluxfest,_Cinematheque,_New_York,_June_27,_1965.jpg"
SRC_IMAGE = "../Fluxus_Images/137345_Still_from_Disappearing_Music_for_Face.jpg"
# SRC_IMAGE = "../Fluxus_Images/138294_Hand_Show.jpg"
# SRC_IMAGE = "../Fluxus_Images/127410_heute___+morgn___+immer___wieder___bis….jpg"
# SRC_IMAGE = "../Fluxus_Images/140218_U.S.A._Surpasses_All_the_Genocide_Records,_U.S._Surpasses_All_Genocide_Records....jpg"
# SRC_IMAGE = "../Fluxus_Images/150219_Four_(Fluxfilm_no._16).jpg"
# SRC_IMAGE = "../Fluxus_Images/150227_Eyeblink_(Fluxfilm_no._9).jpg"
# SRC_IMAGE = "../Fluxus_Images/149311_Put_Finger_in_Hole_from_Fluxkit.jpg"
# SRC_IMAGE = "../Fluxus_Images/152698_Shigeko_Kubota_Performs_The_Identical_Lunch.jpg"
# SRC_IMAGE = "../Fluxus_Images/178953_Lying_Ceremony_from_Performance_Files.jpg"
# SRC_IMAGE = "../Fluxus_Images/184356_Hotel_Event,_performed_at_Waldorf_Astoria,_New_York,_June_4,_1966.jpg"
# SRC_IMAGE = "../Fluxus_Images/192930_Name_card_for_Christo.jpg"
# SRC_IMAGE = "../Fluxus_Images/127907_Flux_Stationery_Foot_in_Shoe.jpg"
# SRC_IMAGE = "../Fluxus_Images/127908_Flux_Stationery_Hand_in_Glove.jpg"



os.makedirs(THUMB_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# === CONFIGURATION SETTINGS ===
# Year range for the entire collection
YEAR_MIN = 1953
YEAR_MAX = 2000

# Maximum number of duplications allowed for any single artwork
MAX_DUPLICATIONS = 15

# Colorization settings
HERO_INFLUENCE = 0.6       # How strongly the hero image affects the tiles (0.0-1.0)
COLORIZATION_STRENGTH = {  # Era-specific colorization strength
    "early": 0.9,          # Strong grayscale effect for early works (1953-1963)
    "middle": 0.7,         # Medium sepia effect for middle works (1964-1973)
    "late": 0.5            # Lighter color effect for late works (1974-1984)
}

# Era ranges
ERA_RANGES = {
    "early": (1950, 1963),   # Early Fluxus
    "middle": (1964, 1973),  # Core Fluxus period
    "late": (1974, 2000)     # Later Fluxus
}

# === COLOR PROCESSING FUNCTIONS ===

def get_era_from_year(year):
    """Determine which era a year belongs to."""
    if year <= ERA_RANGES["early"][1]:
        return "early"
    elif year <= ERA_RANGES["middle"][1]:
        return "middle"
    else:
        return "late"

def color_distance(c1, c2):
    """
    Calculate Euclidean distance between two colors.
    """
    return sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2 + (c1[2] - c2[2])**2)

def colorize_tile(image, target_color, strength):
    """
    Colorize an image toward target_color with specified strength.
    
    Args:
        image: OpenCV image in BGR format
        target_color: BGR tuple (b, g, r)
        strength: 0.0-1.0 where 0 is no effect, 1.0 is full colorization
    
    Returns:
        Colorized image
    """
    if strength <= 0:
        return image.copy()
    
    # Convert target_color to float
    b_target, g_target, r_target = [float(c) for c in target_color]
    
    # Create copy of image as float32
    result = image.astype(np.float32)
    
    # Apply colorization: img*(1-strength) + target_color*strength
    result[:,:,0] = result[:,:,0] * (1 - strength) + b_target * strength
    result[:,:,1] = result[:,:,1] * (1 - strength) + g_target * strength
    result[:,:,2] = result[:,:,2] * (1 - strength) + r_target * strength
    
    # Convert back to uint8
    return np.clip(result, 0, 255).astype(np.uint8)

def apply_era_effect(image, year, hero_pixel):
    """
    Apply era-appropriate visual effect to an image.
    
    Args:
        image: OpenCV image
        year: Year of the artwork
        hero_pixel: BGR color from hero image at the same position
    
    Returns:
        Processed image
    """
    era = get_era_from_year(year)
    
    # Create a copy of the original
    processed = image.copy()
    
    # Step 1: Apply era-specific effect
    if era == "early":
        # Convert to grayscale for early works
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        processed = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    
    elif era == "middle":
        # Apply sepia effect for middle era
        sepia_kernel = np.array([
            [0.272, 0.534, 0.131],
            [0.349, 0.686, 0.168],
            [0.393, 0.769, 0.189]
        ])
        processed = cv2.transform(image, sepia_kernel)
        processed = np.clip(processed, 0, 255).astype(np.uint8)
    
    elif era == "late":
        # For late era, slight red enhancement
        b, g, r = cv2.split(image)
        r = np.clip(r * 1.1, 0, 255).astype(np.uint8)
        processed = cv2.merge([b, g, r])
    
    # Step 2: Blend with hero pixel color to maintain hero image visibility
    # Get era-specific colorization strength
    hero_blend = HERO_INFLUENCE
    processed = colorize_tile(processed, hero_pixel, hero_blend)
    
    return processed

def get_era_color(era, pixel):
    """Get a representative color for an era, influenced by the pixel."""
    if era == "early":
        # Grayscale with slight blue tint
        gray_value = 0.3 * pixel[0] + 0.6 * pixel[1] + 0.1 * pixel[2]
        gray_value = min(255, max(0, gray_value))
        r, g, b = gray_value, gray_value, gray_value
        return [r/255.0, g/255.0, b/255.0]  # Convert to 0-1 range
    
    elif era == "middle":
        # Sepia tone
        r = min(255, pixel[2] * 1.1)
        g = min(255, pixel[1] * 0.9)
        b = min(255, pixel[0] * 0.7)
        return [r/255.0, g/255.0, b/255.0]
    
    else:  # late
        # Slight red enhancement
        r = min(255, pixel[2] * 1.2)
        g = min(255, pixel[1] * 0.95)
        b = min(255, pixel[0] * 0.9)
        return [r/255.0, g/255.0, b/255.0]

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
        positions.append((item[0], item[1], col, row, item[2]))  # id, image, x, y, year
        
        # Move to next position
        col += 1
        if col >= tiles_x:
            col = 0
            row -= 1  # Move up a row
            if row < 0:
                # Grid is full, stop adding items
                break
    
    return positions

def distribute_artworks_with_duplications(metadata, tiles_x, tiles_y):
    """Distribute artworks across the grid, allowing more duplications."""
    total_cells = tiles_x * tiles_y
    
    # Filter for valid metadata with image URLs
    valid_metadata = [(id, img) for id, img in enumerate(metadata) 
                      if "ImageURL" in img and img["ImageURL"]]
    
    # Extract years for sorting
    metadata_with_years = [(id, img, extract_year_from_date(img.get("Date", ""))) 
                           for id, img in valid_metadata]
    
    # Sort by year
    sorted_metadata = sorted(metadata_with_years, key=lambda x: x[2])
    unique_artwork_count = len(sorted_metadata)
    
    print(f"Total grid cells: {total_cells}, unique artworks: {unique_artwork_count}")
    
    # If we have enough unique artworks, no need to duplicate
    if unique_artwork_count >= total_cells:
        print("No duplication needed - enough unique artworks")
        return assign_positions_densely(sorted_metadata[:total_cells], tiles_x, tiles_y)
    
    # We need to duplicate artworks to fill the grid
    print(f"Need to duplicate: {total_cells - unique_artwork_count} additional cells")
    
    # Simple approach: repeat the list until we have enough
    full_list = []
    while len(full_list) < total_cells:
        # Each pass through the list, shuffle to avoid patterns
        shuffled = list(sorted_metadata)
        random.shuffle(shuffled)
        full_list.extend(shuffled)
    
    # Trim to exactly what we need
    full_list = full_list[:total_cells]
    
    # Resort by year to maintain chronological order
    full_list.sort(key=lambda x: x[2])
    
    print(f"Final list size: {len(full_list)} items")
    
    # Count duplicates
    id_counts = Counter([item[0] for item in full_list])
    most_common = id_counts.most_common(5)
    max_duplicates = most_common[0][1] if most_common else 0
    print(f"Maximum duplications of any single artwork: {max_duplicates}")
    
    # If we have too many duplications of any artwork, limit them
    if max_duplicates > MAX_DUPLICATIONS:
        print(f"Limiting duplications to {MAX_DUPLICATIONS} per artwork...")
        
        # First, count how many of each ID we have
        id_counts = Counter([item[0] for item in full_list])
        
        # Identify IDs that are over the limit
        over_limit_ids = {id: count for id, count in id_counts.items() 
                         if count > MAX_DUPLICATIONS}
        
        if over_limit_ids:
            # Create a filtered list that respects the limit
            limited_list = []
            id_usage = Counter()
            
            for item in full_list:
                id = item[0]
                if id_usage[id] < MAX_DUPLICATIONS:
                    limited_list.append(item)
                    id_usage[id] += 1
            
            # We need to fill any remaining slots
            remaining_slots = total_cells - len(limited_list)
            if remaining_slots > 0:
                print(f"Filling {remaining_slots} remaining slots after limiting duplications...")
                
                # Find IDs that haven't reached the limit
                available_items = [item for item in sorted_metadata 
                                 if id_usage[item[0]] < MAX_DUPLICATIONS]
                
                # If we have available items, use them
                while remaining_slots > 0 and available_items:
                    # Pick a random available item
                    item = random.choice(available_items)
                    limited_list.append(item)
                    
                    # Update usage count
                    id_usage[item[0]] += 1
                    if id_usage[item[0]] >= MAX_DUPLICATIONS:
                        # Remove from available items if we've reached the limit
                        available_items = [i for i in available_items if i[0] != item[0]]
                    
                    remaining_slots -= 1
            
            # Resort the limited list by year
            limited_list.sort(key=lambda x: x[2])
            full_list = limited_list
                
            # Recount
            id_counts = Counter([item[0] for item in full_list])
            most_common = id_counts.most_common(5)
            print(f"After limiting, maximum duplications: {most_common[0][1] if most_common else 0}")
    
    # Assign positions in a dense grid
    return assign_positions_densely(full_list, tiles_x, tiles_y)

# === MAIN CODE ===

# Load the main image using OpenCV.
src_image = cv2.imread(SRC_IMAGE)
if src_image is None:
    raise FileNotFoundError(f"Unable to load the image: {SRC_IMAGE}")

# Get the dimensions and compute the aspect ratio.
src_h, src_w = src_image.shape[:2]
src_aspect_ratio = src_w / src_h
print(f"Hero image dimensions: {src_w}x{src_h}, aspect ratio: {src_aspect_ratio:.2f}")

src = json.load(open(SRC_JSON, "r"))
print(f"Number of metadata records loaded: {len(src)}")

# ——— GRID-SIZING LOGIC ———
# Adjust MAX_TILES for desired detail level - reduced for better coverage
MAX_TILES = 150  # Reduced from 200 to ensure full image coverage

# Calculate grid dimensions based on aspect ratio
# Force specific aspect ratio:
tiles_x = 120  # Width (make wider)
tiles_y = 80   # Height (make shorter)
# This creates a 16:9-ish aspect ratio

#old aspect ratio logic:
# if src_aspect_ratio >= 1:
#     # Wide image
#     tiles_x = MAX_TILES
#     tiles_y = int(MAX_TILES / 1.6)
#     # tiles_y = int(MAX_TILES / src_aspect_ratio)
# else:
#     # Tall image - for portrait images like the face anatomy
#     tiles_y = MAX_TILES
#     tiles_x = int(MAX_TILES * src_aspect_ratio)

# Ensure minimum dimensions
tiles_x = max(tiles_x, 20)  # At least 20 columns
tiles_y = max(tiles_y, 20)  # At least 20 rows

# Additional check: calculate total cells and limit them to a reasonable number
# based on available artworks and max duplications
available_artworks = len(src)
max_possible_tiles = available_artworks * MAX_DUPLICATIONS
target_max_cells = min(tiles_x * tiles_y, max_possible_tiles * 0.9)  # 90% of max possible

# If we're trying to create too many cells, reduce dimensions proportionally
if tiles_x * tiles_y > target_max_cells:
    reduction_factor = sqrt(target_max_cells / (tiles_x * tiles_y))
    tiles_x = max(20, int(tiles_x * reduction_factor))
    tiles_y = max(20, int(tiles_y * reduction_factor))

print(f"Adjusted grid size: {tiles_x} columns × {tiles_y} rows (total cells: {tiles_x * tiles_y})")
print(f"Available artworks: {available_artworks} with up to {MAX_DUPLICATIONS} duplications each")
print(f"Maximum possible tiles: {max_possible_tiles}")

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

# Print configuration
print("\nConfiguration:")
print(f"Hero image influence: {HERO_INFLUENCE * 100:.0f}%")
print(f"Maximum duplications per artwork: {MAX_DUPLICATIONS}")
for era, strength in COLORIZATION_STRENGTH.items():
    print(f"{era.title()} era colorization strength: {strength * 100:.0f}%")
print()

# Step 1: Distribute artworks across the grid with duplications
print("Distributing artworks across the grid...")
positioned_items = distribute_artworks_with_duplications(src, tiles_x, tiles_y)
print(f"Positioned {len(positioned_items)} items in the grid")

# Step 2: Create tiles based on assigned positions
print("\nCreating tiles...")
for id, image, x_pos, y_pos, year in positioned_items:
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
    
    # Apply era-based visual effects
    image_cv = apply_era_effect(image_cv, year, pixel)
    
    # Apply final blur for smoother appearance
    image_cv = cv2.GaussianBlur(image_cv, (3, 3), 0)
    
    # Save the processed thumbnail
    thumb_name = f"thumb_{x_pos}_{y_pos}.jpg"
    thumb_path = os.path.join(THUMB_FOLDER, thumb_name)
    cv2.imwrite(thumb_path, image_cv)
    
    # Get era for this artwork
    era = get_era_from_year(year)
    
    # Create a dictionary for tile data
    tile_data = {}
    tile_data['thumbnail_url'] = thumb_path.replace('\\', '/')
    tile_data['url'] = image_path.replace('\\', '/')
    tile_data['pos'] = [x_pos, y_pos]
    tile_data['color'] = get_era_color(era, pixel)
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
    
    # Add era and year metadata
    tile_data['Era'] = era
    tile_data['Year'] = year
    
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
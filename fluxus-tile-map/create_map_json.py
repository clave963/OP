import os
import json
import random
import urllib.request
import cv2
import requests
import urllib

SRC_JSON     = "fluxus_metadata.json"
MAP_NAME     = "map_1"

MAP_JSON     = os.path.join(MAP_NAME, "tiles.json")
THUMB_FOLDER = os.path.join(MAP_NAME, "thumbs")
IMAGES_FOLDER= os.path.join(MAP_NAME, "images")  

# Define the main image from which to create the tile map.
SRC_IMAGE = "../Fluxus_Images/127300_Dynamitage,_performed_during_Fluxus_Festival_of_Total_Art_and_Comportment,_Nice,_July_27,_1963.jpg"

os.makedirs(THUMB_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)

# Load the main image using OpenCV.
src_image = cv2.imread(SRC_IMAGE)
if src_image is None:
    raise FileNotFoundError(f"Unable to load the image: {SRC_IMAGE}")

# Debug: Confirm the type and shape of src_image.
print("Type of src_image:", type(src_image))
print("Original src_image shape:", src_image.shape)

# Get the dimensions and compute the aspect ratio.
src_h, src_w = src_image.shape[:2]
src_aspect_ratio = src_w / src_h

# ——— UPDATED GRID-SIZING LOGIC ———
# Clamp the long side to MAX_TILES, compute the other dimension
MAX_TILES = 50

if src_aspect_ratio >= 1:
    # wide image → 50 columns, proportional rows
    tiles_x = MAX_TILES
    tiles_y = max(1, int(MAX_TILES / src_aspect_ratio))
else:
    # tall image → 50 rows, proportional columns
    tiles_y = MAX_TILES
    tiles_x = max(1, int(MAX_TILES * src_aspect_ratio))

print(f"Grid size: {tiles_x} columns × {tiles_y} rows")
# —————————————————————————————

# Resize the main image to the number of tiles.
src_image = cv2.resize(src_image, (tiles_x, tiles_y), interpolation=cv2.INTER_AREA)
print("Resized src_image shape (should match tile grid):", src_image.shape)

# Load metadata from the JSON file.
src = json.load(open(SRC_JSON, "r"))
print("Type of src (metadata):", type(src))
print("Number of metadata records loaded:", len(src))

tiles_info = []

# Loop over a grid defined by tiles_x and tiles_y.
for i in range(tiles_x):
    for j in range(tiles_y):
        # Pick a random record from the metadata.
        image_url = None
        image = None
        while image_url is None:
            id = random.randint(0, len(src) - 1)
            image = src[id]
            image_url = image["ImageURL"]
            if image_url is None:
                print(f"Image URL for ID {id} is None, retrying...")
        
        image_file_name = f"{id}.jpg"
        image_name = os.path.basename(image_url)
        image_path = os.path.join(IMAGES_FOLDER, image_file_name)
        
        # Download the image if it doesn't exist already.
        if not os.path.exists(image_path):
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
            response = requests.get(image_url, headers=headers, stream=True)
            if response.status_code != 404:
                with open(image_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
            else:
                print(f"Failed to download image {image_name}: {response.status_code}")
        else:
            print(f"Image {image_name} already exists, skipping download.")
        
        # Access the pixel from the main image (for any color logic you might add)
        pixel = src_image[j, i]
        print(f"Pixel value at tile position ({i}, {j}):", pixel)
        
        # Open the downloaded image and process it for thumbnail creation.
        image_cv = cv2.imread(image_path)
        if image_cv is None:
            print(f"Warning: Unable to load the downloaded image at {image_path}")
            continue
        image_cv = cv2.resize(image_cv, (64, 64))
        image_cv = cv2.GaussianBlur(image_cv, (5, 5), 0)
        
        thumb_name = f"thumb_{i}_{j}.jpg"
        thumb_path = os.path.join(THUMB_FOLDER, thumb_name)
        cv2.imwrite(thumb_path, image_cv)
        
        # Create a dictionary for tile data.
        tile_data = {}
        tile_data['thumbnail_url'] = thumb_path.replace('\\', '/')  # Thumbnail URL.
        tile_data['url']           = image_path.replace('\\', '/')  # Full image URL.
        tile_data['pos']           = [i, j]                         # Position in the grid.
        tile_data['color']         = [1.0, 1.0, 1.0]
        tile_data['data']          = image                          # Metadata record.
        tile_data['name']          = image["Title"]                 # Title from metadata.
    
        tile_data['Title']         = image["Title"]
        tile_data['Name']          = image["Title"]        # swap if you have a separate Name field
        tile_data['Date']          = image["Date"] 
        tile_data['Artist']        = image["Artist"]
        tile_data['Artist Bio']    = image["Artist Bio"]
        tile_data['Nationality']   = image["Nationality"]
        tile_data['Dimensions']    = image["Dimensions"]
        tile_data['Medium']        = image["Medium"]
        tile_data['ImageURL']      = image["ImageURL"]
        
        tiles_info.append(tile_data)

print(f"Total tiles created: {len(tiles_info)}")
print(f"Expected number of tiles: {tiles_x * tiles_y}")

# Save the combined tiles information to the JSON file.
with open(MAP_JSON, "w") as f:
    json.dump(tiles_info, f, indent=4)

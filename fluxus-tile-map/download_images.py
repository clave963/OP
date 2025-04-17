import json
import requests
import os

# Path to your artworks JSON file
ARTWORKS_JSON_PATH = "/Users/carlylave/Documents/GitHub/OP/fluxus-tile-map/Artworks.json"

# Directory where you want to save Fluxus images
FLUXUS_IMAGE_DIR = "Fluxus_Images"

# Ensure the output directory exists
os.makedirs(FLUXUS_IMAGE_DIR, exist_ok=True)

def is_fluxus_artwork(artwork):
    """
    Determine if the artwork is part of the Fluxus Collection.
    
    In many MoMA data sets, 'Fluxus' might appear in fields like:
    - 'Department'
    - 'CreditLine'
    - 'Title'
    - Possibly even the 'Medium' field
    Adjust this check to match your data exactly.
    """
    fields_to_check = [
        str(artwork.get("Department", "")).lower(),
        str(artwork.get("CreditLine", "")).lower(),
        str(artwork.get("Title", "")).lower()
    ]
    return any("fluxus" in field for field in fields_to_check)

def download_image(img_url, save_path):
    """
    Download an image from a URL and save it to 'save_path'.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Referer": "https://www.moma.org/"
        }
        response = requests.get(img_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {img_url}")
    except (requests.RequestException, OSError) as e:
        print(f"Failed to download {img_url}. Error: {e}")

def save_fluxus_metadata(artworks, output_path, image_dir="Fluxus_Images"):
    fluxus_metadata = []

    for art in artworks:
        object_id = art.get("ObjectID", "unknown_id")
        title = art.get("Title", "Untitled")
        artist = art.get("Artist", "")
        artist_bio = art.get("ArtistBio", "")
        nationality = art.get("Nationality", "")
        dimensions = art.get("Dimensions", "")
        department = art.get("Department", "")
        img_url = art.get("ImageURL", "")
        medium = art.get("Medium", "")
        date = art.get("Date", "")
        classification = art.get("Classification", "")

        filename = f"{object_id}_{title.replace(' ', '_').replace('/', '_')}.jpg"
        local_path = os.path.join(image_dir, filename)

        fluxus_metadata.append({
            "ObjectID": object_id,
            "Title": title,
            "Artist": artist,
            "Artist Bio": artist_bio,
            "Nationality": nationality,
            "Dimensions": dimensions,
            "Department": department,
            "ImageURL": img_url,
            "Medium": medium,
            "Date": date,
            "Classification": classification,
            "LocalPath": local_path
        })

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(fluxus_metadata, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved metadata to {output_path}")


def main():
    # 1. Load the artworks JSON data
    with open(ARTWORKS_JSON_PATH, 'r', encoding='utf-8') as f:
        artworks_data = json.load(f)
    
    # 2. Filter for Fluxus artworks
    fluxus_artworks = [art for art in artworks_data if is_fluxus_artwork(art)]
    print(f"Found {len(fluxus_artworks)} Fluxus artworks.")
    
    # 3. For each Fluxus artwork, get the ImageURL and download it
    for artwork in fluxus_artworks:
        img_url = artwork.get("ImageURL")
        if not img_url:
            continue  # Skip if there's no valid image URL
        
        # Create a filename (for instance using the ObjectID or Title)
        object_id = artwork.get("ObjectID", "unknown_id")
        # Sanitize title for file name usage
        title_str = artwork.get("Title", "Untitled").replace(" ", "_").replace("/", "_")
        filename = f"{object_id}_{title_str}.jpg"
        save_path = os.path.join(FLUXUS_IMAGE_DIR, filename)
        
        download_image(img_url, save_path)

    # 4. Save the metadata of Fluxus artworks to a JSON file
    save_fluxus_metadata(fluxus_artworks, "fluxus_metadata.json")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import os
import cv2

def generate_thumbnails(src_folder, dst_folder, thumb_size=(64, 64)):
    """
    Loop over all image files in src_folder, create thumbnails
    with the given thumb_size, and save them to dst_folder.
    """
    # Create the destination folder if it doesn't exist.
    os.makedirs(dst_folder, exist_ok=True)
    
    # Define valid image extensions.
    image_extensions = ('.png', '.jpg', '.jpeg', '.gif')
    
    # Gather all image filenames in the source folder.
    image_files = [f for f in os.listdir(src_folder) if f.lower().endswith(image_extensions)]
    
    total_files = len(image_files)
    print(f"Found {total_files} images in {src_folder}.")
    
    for idx, filename in enumerate(image_files, start=1):
        src_path = os.path.join(src_folder, filename)
        # Load the image using OpenCV.
        img = cv2.imread(src_path)
        if img is None:
            print(f"Warning: Unable to load image {src_path}. Skipping.")
            continue

        # Resize the image to the defined thumbnail size using INTER_AREA (good for downsampling).
        thumb = cv2.resize(img, thumb_size, interpolation=cv2.INTER_AREA)

        # Create a new filename for the thumbnail.
        base, ext = os.path.splitext(filename)
        thumb_filename = f"{base}_thumb{ext}"
        dst_path = os.path.join(dst_folder, thumb_filename)
        
        # Save the thumbnail image.
        cv2.imwrite(dst_path, thumb)
        print(f"[{idx}/{total_files}] Thumbnail created: {dst_path}")

if __name__ == "__main__":
    # Determine the directory of this script.
    script_dir = os.path.dirname(os.path.realpath(__file__))
    # Set the source folder to one level above this script: "../Fluxus_Images"
    src_folder = os.path.join(script_dir, "..", "Fluxus_Images")
    # Define the destination folder for thumbnails (e.g., "Fluxus_Thumbnails" in the current directory).
    dst_folder = os.path.join(script_dir, "Fluxus_Thumbnails")
    # Set the desired thumbnail size. Adjust (64, 64) if you need them smaller or larger.
    thumbnail_size = (64, 64)
    
    generate_thumbnails(src_folder, dst_folder, thumbnail_size)

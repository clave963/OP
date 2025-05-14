import os
import random
import json
from flask import Flask, request, jsonify, send_from_directory

IMAGES_FOLDER = "../Fluxus_Images"  # Folder containing images

# Get list of all image files
image_files = [IMAGES_FOLDER + '/' + f for f in os.listdir(IMAGES_FOLDER) 
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]

app = Flask(__name__, static_folder='.')

# Load the full Fluxus metadata once
METADATA = json.load(open("fluxus_metadata.json"))

# Load pre-computed tiles for different mosaics
CHRONOLOGICAL_TILES = json.load(open("map_1/tiles.json", "r"))  # Original tiles

# Load medium tiles if the file exists, otherwise create an empty dict
try:
    MEDIUM_TILES = json.load(open("medium_map/tiles.json", "r"))    # New medium-based tiles
except FileNotFoundError:
    print("Warning: medium_map/tiles.json not found. Medium view will not work properly until you generate the file.")
    MEDIUM_TILES = {"tiles": [], "dimensions": {"width": 0, "height": 0}, "grid_overlay": {"categories": []}}

@app.route('/random-images', methods=['POST'])
def get_random_images():
    try:
        # This preserves the original functionality - unchanged
        return jsonify({"images": CHRONOLOGICAL_TILES})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/medium-images', methods=['POST'])
def get_medium_images():
    try:
        # Return the medium-based tiles
        return jsonify(MEDIUM_TILES)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/')
def serve_index():
    return send_from_directory('.', 'front.html')

@app.route('/medium')
def serve_medium():
    return send_from_directory('.', 'medium.html')  # Route for medium page

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
# Load your pre-computed tiles (the full array) once at startup
# TILES = json.load(open("map_1/tiles.json", "r"))

# @app.route('/random-images', methods=['POST'])
# def get_random_images():
#     try:
#         # If you want all tiles:
#         return jsonify({ "images": TILES })
        
#         #—or, if you still want to sample some of them:
#         # data = request.get_json() or {}
#         # n = data.get("count", len(TILES))
#         # sampled = random.sample(TILES, min(n, len(TILES)))
#         # return jsonify({ "images": sampled })
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400
    
    #--Pan's Code--
        # data = request.get_json()
        # n = data.get('count', 1)  # Default to 1 if count not provided


        # #main code that we want to modify       
        # # Select n random images
        # selected_images = random.sample(image_files, min(n, len(image_files)))

        # image_data = []
        # for i in range(len(selected_images)):
        #     img_url = selected_images[i].replace('\\', '/')
        #     img = {} 
        #     img['thumbnail_url'] = img_url    #this is the thumbnail image url
        #     img['url'] = img_url     #this is the actual image url to be shown when selected
        #     img['pos'] = [i, 0]     #this is the position of the image in the grid
        #     img['color'] = [0.0, 1.0, 1.0]
        #     img['name'] = os.path.basename(img_url)  #this is the image title
        #     #img['description'] = "Image description goes here."

        #    # —– Attach Fluxus metadata fields —–
        #     # Derive the ObjectID from the filename (e.g. "65678_Fluxus_II...jpg")
        #     filename = os.path.basename(img_url)
        #     objid = filename.split('_')[0]
        #     # Find the matching record (or {} if none)
        #     rec = next((r for r in METADATA if str(r.get("ObjectID")) == objid), {})
        #     # Now inject each field:
        #     img['Title']       = rec.get("Title")
        #     img['Name']        = rec.get("Title")          # swap if you have a separate Name field
        #     img['Date']        = rec.get("Date")
        #     img['Artist']      = rec.get("Artist")
        #     img['Artist Bio']  = rec.get("Artist Bio")
        #     img['Nationality'] = rec.get("Nationality")
        #     img['Dimensions']  = rec.get("Dimensions")
        #     img['Medium']      = rec.get("Medium")
        #     img['ImageURL']    = rec.get("ImageURL")
 
        #     image_data.append(img)
        
        # return jsonify({
            # 'images': image_data
    #     })
    # except Exception as e:
    #     return jsonify({'error': str(e)}), 400

# @app.route('/')
# def serve_index():
#     return send_from_directory('.', 'front.html')

# @app.route('/<path:path>')
# def serve_static(path):
#     return send_from_directory('.', path)

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)
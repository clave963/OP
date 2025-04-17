import os
import random
import json
from flask import Flask, request, jsonify, send_from_directory

IMAGES_FOLDER = "../Fluxus_Images"  # Folder containing images

#Get list of all image files
image_files = [IMAGES_FOLDER + '/' + f for f in os.listdir(IMAGES_FOLDER) 
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]

app = Flask(__name__, static_folder='.')

@app.route('/random-images', methods=['POST'])
def get_random_images():
    try:
        data = request.get_json()
        n = data.get('count', 1)  # Default to 1 if count not provided


        #main code that we want to modify       
        # Select n random images
        selected_images = random.sample(image_files, min(n, len(image_files)))

        image_data = []
        for i in range(len(selected_images)):
            img_url = selected_images[i].replace('\\', '/')
            img = {} 
            img['thumbnail_url'] = img_url    #this is the thumbnail image url
            img['url'] = img_url     #this is the actual image url to be shown when selected
            img['pos'] = [i, 0]     #this is the position of the image in the grid
            img['color'] = [0.0, 1.0, 1.0]
            img['name'] = os.path.basename(img_url)  #this is the image title
            img['description'] = "Image description goes here."
 
            image_data.append(img)
        
        return jsonify({
            'images': image_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/')
def serve_index():
    return send_from_directory('.', 'front.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
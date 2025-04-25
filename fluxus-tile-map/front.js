import * as THREE from './modules/three/three.module.js';
import { OrbitControls } from './modules/three/addons/controls/OrbitControls.js';

//______________________________get elements from html document
const viewport_div = document.getElementById('viewport')
const info_div = document.getElementById('info_div')

const sprite_size = 3;
var selected_sprite = null;
var image_sprites = [];

//______________________________Handle sprite selection and display metadata
function on_sprite_selected(sprite) {
    if (!sprite.image_info) return;
    const info = sprite.image_info;
  
    const keyOrder = [
      "Title", "Name", "Date",
      "Artist", "Artist Bio", "Nationality",
      "Dimensions", "Medium", "ImageURL"
    ];
  
    // Build HTML with a close button
    let html = `
      <div class="info-header">
        <button id="closeBtn" class="close-button">&times;</button>
      </div>
      <img src="${info.url}" class="info-image">
      <h3>Metadata:</h3>
      <ul class="info-list">
    `;
    keyOrder.forEach(key => {
      let val = info[key];
      if (Array.isArray(val)) val = val.join(', ');
      html += `<li><strong>${key}:</strong> ${val ?? ''}</li>`;
    });
    html += `</ul>`;
  
    info_div.innerHTML = html;
  
    // Wire up the close button
    document.getElementById('closeBtn').addEventListener('click', () => {
      // reset highlight
      if (selected_sprite) {
        const prev = selected_sprite.image_info;
        selected_sprite.material.color.set(prev.color[0], prev.color[1], prev.color[2]);
        selected_sprite = null;
      }
      // clear panel
      info_div.innerHTML = '';
    });
  
    // Highlight the selected sprite
    if (selected_sprite) {
      const prev = selected_sprite.image_info;
      selected_sprite.material.color.set(prev.color[0], prev.color[1], prev.color[2]);
    }
    sprite.material.color.set(0xff0000);
    selected_sprite = sprite;
  }
  



// Set up raycaster and pointer for click events
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Add this function to handle click events
function onPointerClick(event) {
    // Calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        on_sprite_selected(intersects[0].object);
    }
}







//____________________________Create ThREE.js renderer canvas
const renderer = new THREE.WebGLRenderer();
renderer.domElement.addEventListener('click', onPointerClick);
renderer.setSize(400, 400);
viewport_div.appendChild(renderer.domElement);

//____________________________Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0.5,0.6,0.7) 


//____________________________Set up camera
const frustumSize = 30;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    1,
    1000
);
camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0);
camera.up.set(0, 0, -1); // This makes +Y axis point north

//___________________________Handle viewport interactions (panning, zooming, etc.)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // smooth animation
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.enableRotate = false; // Disable rotation
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
};

//________________________________Handle window resizing
function onWindowResize(){
    const w = viewport_div.clientWidth;
    const h = viewport_div.clientHeight;
    const aspect = w / h;

    // Update orthographic camera
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    
    renderer.setSize(w, h);
    camera.updateProjectionMatrix();
}

//listen for window resizing events
window.addEventListener('resize', onWindowResize, false);
onWindowResize();


//______________________________Create a sprite from the received json data
//you can modify the sprite size here and modify elements like the color, rotation and quality of the sprite for frontend image processing
function createSprite(image_info) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image_info.thumbnail_url, () => {
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        spriteMaterial.color.set(image_info.color[0], image_info.color[1], image_info.color[2])
        const sprite = new THREE.Sprite(spriteMaterial);
        const x = image_info.pos[0]*sprite_size
        const y = image_info.pos[1]*sprite_size
        sprite.position.set(x,y,0);
        sprite.scale.set(sprite_size, sprite_size, 1); // Set the scale of the sprite
        sprite.updateMatrix(); // Update the matrix  of the sprite
        sprite.image_info = image_info; // Store metadata in userData property
        scene.add(sprite);
        image_sprites.push(sprite); // Add sprite to the array
        console.log(image_info.pos);
    });
}

//______________________________Clear all sprites from the scene
// and reset the info div
function clearSprites() {
    for (let i = 0; i < image_sprites.length; i++) {
        scene.remove(image_sprites[i]);
    }
    image_sprites = [];
    info_div.innerHTML = ''; // Clear the info div
    selected_sprite = null; // Reset selected sprite
}

//______________________________Update the images in the scene from the JSON data
function update_images_from_json(json_data) {
    // Clear existing sprites
    clearSprites();

    const image_data = json_data.images
    console.log(image_data[100].pos);

    // Create new image sprites from the JSON data
    for (let i = 0; i < image_data.length; i++) {
        createSprite(image_data[i]);
    }
}

//this is what wel'll modify to the folder of images we want to display and the JSON file we want to use
//______________________________Send a request to the server to get random images
function update_images(request_json) {
    //send this as a POST request to the server at endpoint 'random-images' or change this to the folder of images we want to display
    fetch('/random-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request_json)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Handle the response data here
        console.log('Response data:', data);

        update_images_from_json(data);
    })
}

//this is the main request to the server. We can modify this request to point to a folder of images 
//update_images({folder_id: "fluxus_images"});
update_images({count: 1750});
//update_images({folder_id: "fluxus_1"});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // required for damping
    renderer.render(scene, camera);
}

animate();
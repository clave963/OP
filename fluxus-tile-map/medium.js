import * as THREE from './modules/three/three.module.js';
import { OrbitControls } from './modules/three/addons/controls/OrbitControls.js';

//______________________________get elements from html document
const viewport_div = document.getElementById('viewport')
const info_div = document.getElementById('info_div')

const sprite_size = 3;
var selected_sprite = null;
var image_sprites = [];
let tiles_x = 0;
let tiles_y = 0;
// Track mouse position for hover effects
const mouse = new THREE.Vector2();
let hoveredSprite = null;
const HOVER_SCALE = 3.0; // Scale factor for hover effect

//______________________________Handle sprite selection and display metadata
function on_sprite_selected(sprite) {
    if (!sprite.image_info) return;
    const info = sprite.image_info;
  
    // Reset previously selected sprite
    if (selected_sprite) {
        const prev = selected_sprite.image_info;
        selected_sprite.material.color.set(prev.color[0], prev.color[1], prev.color[2]);
        
        // Only reset scale if it's not the currently hovered sprite
        if (selected_sprite !== hoveredSprite) {
            selected_sprite.scale.set(sprite_size, sprite_size, 1);
        }
    }
    
    // Set new selected sprite
    sprite.material.color.set(0xff0000);
    selected_sprite = sprite;
  
    // Build HTML with enhanced close button
    let html = `
      <div class="info-header">
        <button id="closeBtn" class="metadata-close" aria-label="Close">&times;</button>
      </div>
      <img src="${info.url}" class="info-image">
    `;
    
    // Add medium category with color coding
    let mediumColor = "#cccccc"; // Default gray
    let mediumText = info.Medium_Category || "Unknown";
    
    // Set color based on medium category
    if (mediumText === "painting") mediumColor = "rgba(0, 100, 255, 0.7)";
    if (mediumText === "drawing") mediumColor = "rgba(100, 150, 255, 0.7)";
    if (mediumText === "print") mediumColor = "rgba(200, 100, 0, 0.7)";
    if (mediumText === "sculpture") mediumColor = "rgba(50, 200, 50, 0.7)";
    if (mediumText === "photograph") mediumColor = "rgba(150, 50, 200, 0.7)";
    if (mediumText === "mixed") mediumColor = "rgba(200, 180, 0, 0.7)";
    
    // Format medium name for display
    let displayMedium = mediumText.charAt(0).toUpperCase() + mediumText.slice(1);
    if (mediumText === "mixed") {
        displayMedium = "Mixed Media";
    }
    
    html += `<div style="background-color: ${mediumColor}; padding: 5px; border-radius: 4px; margin-bottom: 10px;">
        <strong>${displayMedium}</strong>
    </div>`;
    
    // Add title with larger font
    html += `<h2 style="margin-top: 0; margin-bottom: 5px;">${info.Title || ''}</h2>`;
    
    // Add artist with emphasis
    html += `<h3 style="margin-top: 0; margin-bottom: 15px;">${info.Artist || ''}</h3>`;
    
    // Add remaining details
    html += `<ul class="info-list">`;
    // Medium details
    if (info.Medium) {
        html += `<li><strong>Medium:</strong> ${info.Medium}</li>`;
    }
    // Date
    if (info.Date) {
        html += `<li><strong>Date:</strong> ${info.Date}</li>`;
    }
    html += `</ul>`;
    
    info_div.innerHTML = html;
    info_div.classList.add('visible');
    info_div.classList.add('show-info');
  
    // Wire up the close button
    document.getElementById('closeBtn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // reset highlight
      if (selected_sprite) {
        const prev = selected_sprite.image_info;
        selected_sprite.material.color.set(prev.color[0], prev.color[1], prev.color[2]);
        selected_sprite = null;
      }
      
      // Clear and hide panel with animation
      info_div.classList.remove('visible');
      info_div.classList.remove('show-info');
      info_div.style.opacity = '0';
      
      setTimeout(() => {
        info_div.innerHTML = '';
        info_div.style.display = 'none';
        info_div.style.opacity = '1';
      }, 300);
    });
}

// Set up raycaster and pointer for click events
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Add this function to handle click events
function onPointerClick(event) {
    // Calculate pointer position in normalized device coordinates
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
// Function to track mouse movement for hover effects
function onMouseMove(event) {
    // Calculate pointer position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

//____________________________Create ThREE.js renderer canvas
const renderer = new THREE.WebGLRenderer();
renderer.domElement.addEventListener('click', onPointerClick);
renderer.domElement.addEventListener('mousemove', onMouseMove); // Add this line
renderer.setSize(400, 400);
viewport_div.appendChild(renderer.domElement);

//____________________________Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

//____________________________Set up camera
// Increased frustumSize for better initial view
const frustumSize = 120;  // Changed from 30 to 120 for better initial view
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
controls.dampingFactor = 0.25; // Increased from 0.05 for smoother movement
controls.screenSpacePanning = true;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.enableRotate = false; // Disable rotation
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
};

// Improved controls for better navigation
controls.zoomSpeed = 0.5;       // Smoother zoom (default is 1.0)
controls.minZoom = 0.5;         // How far out the user can zoom
controls.maxZoom = 10;          // How close the user can zoom

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

// Function to center the camera on the grid
function centerCameraOnGrid() {
    // Calculate the center and extent of the grid
    const gridWidth = tiles_x * sprite_size;
    const gridHeight = tiles_y * sprite_size;
    const centerX = gridWidth / 2;
    const centerZ = gridHeight / 2;
    
    // Position the camera directly above the center of the grid
    camera.position.set(centerX, 100, centerZ);
    camera.lookAt(centerX, 0, centerZ);
    
    // Set proper camera orientation
    camera.up.set(0, 0, -1);
    
    // Adjust frustum size to ensure the entire grid is visible
    const requiredWidth = gridWidth * 1.05;
    const requiredHeight = gridHeight * 1.05;
    
    // Get current aspect ratio
    const w = viewport_div.clientWidth;
    const h = viewport_div.clientHeight;
    const aspect = w / h;
    
    // Calculate new frustum size to fit the grid
    let newFrustumSize;
    if (requiredWidth / aspect > requiredHeight) {
        // Width is the constraining dimension
        newFrustumSize = requiredWidth / aspect;
    } else {
        // Height is the constraining dimension
        newFrustumSize = requiredHeight;
    }
    
    // Update camera frustum
    camera.left = -newFrustumSize * aspect / 2;
    camera.right = newFrustumSize * aspect / 2;
    camera.top = newFrustumSize / 2;
    camera.bottom = -newFrustumSize / 2;
    camera.updateProjectionMatrix();
    
    // Reset controls target to center of grid
    controls.target.set(centerX, 0, centerZ);
    controls.update();
}

// Function to wait for images to load before centering
function waitForImagesAndCenter() {
    // Check if the expected number of sprites have been loaded
    if (image_sprites.length < 50) { // Using a threshold number
        // Not all loaded yet, wait a bit more
        setTimeout(waitForImagesAndCenter, 500);
        return;
    }
    
    // All images are loaded, now center the camera
    centerCameraOnGrid();
}

//______________________________Create a sprite from the received json data
function createSprite(image_info) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image_info.thumbnail_url, () => {
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        spriteMaterial.color.set(image_info.color[0], image_info.color[1], image_info.color[2])
        const sprite = new THREE.Sprite(spriteMaterial);
        const x = image_info.pos[0]*sprite_size
        const y = image_info.pos[1]*sprite_size
        sprite.position.set(x, 0, y); 
        sprite.scale.set(sprite_size, sprite_size, 1); // Set the scale of the sprite
        sprite.updateMatrix(); // Update the matrix of the sprite
        sprite.image_info = image_info; // Store metadata in userData property
        scene.add(sprite);
        image_sprites.push(sprite); // Add sprite to the array
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

    const image_data = json_data.images;
    
    // Check if we have valid data
    if (!image_data || image_data.length === 0) {
        console.error("No image data received");
        return;
    }
    
    console.log(`Received ${image_data.length} images`);

    // Calculate grid dimensions from the data
    tiles_x = 0;
    tiles_y = 0;
    for (let i = 0; i < image_data.length; i++) {
        tiles_x = Math.max(tiles_x, image_data[i].pos[0] + 1);
        tiles_y = Math.max(tiles_y, image_data[i].pos[1] + 1);
    }
    console.log(`Grid dimensions: ${tiles_x} x ${tiles_y}`);

    // Create new image sprites from the JSON data
    for (let i = 0; i < image_data.length; i++) {
        createSprite(image_data[i]);
    }
    
    // Wait for images to load then center camera
    setTimeout(waitForImagesAndCenter, 1000);
}

//______________________________Send a request to the server to get medium-based images
function update_images(request_json) {
    fetch('/medium-images', {
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
        console.log('Response data:', data);
        update_images_from_json(data);
    })
    .catch(error => {
        console.error('Error fetching medium images:', error);
    });
}

// Initial request to load the medium mosaic
update_images({type: "medium"});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // required for damping
    
    // Hover effect handling
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(image_sprites);
    
    // Handle hover state
    if (intersects.length > 0) {
        const newHoveredSprite = intersects[0].object;
        
        // If we're hovering over a new sprite
        if (hoveredSprite !== newHoveredSprite) {
            // Reset previous hovered sprite scale if there was one
            if (hoveredSprite && hoveredSprite !== selected_sprite) {
                hoveredSprite.scale.set(sprite_size, sprite_size, 1);
            }
            
            // Set new hovered sprite
            hoveredSprite = newHoveredSprite;
            
            // Don't enlarge if it's the selected sprite
            if (hoveredSprite !== selected_sprite) {
                // Enlarge the sprite
                hoveredSprite.scale.set(
                    sprite_size * HOVER_SCALE, 
                    sprite_size * HOVER_SCALE, 
                    1
                );
                
                // Change cursor to pointer to indicate interactive element
                renderer.domElement.style.cursor = 'pointer';
            }
        }
    } else {
        // If we moved out of a sprite, reset its scale
        if (hoveredSprite && hoveredSprite !== selected_sprite) {
            hoveredSprite.scale.set(sprite_size, sprite_size, 1);
            hoveredSprite = null;
        }
        
        // Reset cursor
        renderer.domElement.style.cursor = 'move';
    }
    
    renderer.render(scene, camera);
}

// Function to filter sprites by medium
function filterByMedium(medium) {
    // Reset all sprites to visible first
    for (let i = 0; i < image_sprites.length; i++) {
        // Reset opacity for all sprites
        image_sprites[i].visible = true;
        image_sprites[i].material.opacity = 1.0;
        
        // Reset colors to original
        const info = image_sprites[i].image_info;
        image_sprites[i].material.color.set(info.color[0], info.color[1], info.color[2]);
    }
    
    // If 'all' is selected, we're done - all sprites are now visible with original colors
    if (medium === 'all') {
        return;
    }
    
    // Otherwise, highlight the selected medium and fade others
    for (let i = 0; i < image_sprites.length; i++) {
        const spriteMedium = image_sprites[i].image_info.Medium_Category;
        
        if (spriteMedium !== medium) {
            // Make non-matching sprites semi-transparent
            image_sprites[i].material.opacity = 0.3;
        } else {
            // Enhance matching sprites
            image_sprites[i].material.opacity = 1.0;
            
            // Add slight glow effect by boosting colors
            const info = image_sprites[i].image_info;
            const boostFactor = 1.2;
            image_sprites[i].material.color.setRGB(
                Math.min(1, info.color[0] * boostFactor),
                Math.min(1, info.color[1] * boostFactor),
                Math.min(1, info.color[2] * boostFactor)
            );
        }
    }
}

// Function to reset view to initial position
function resetView() {
    centerCameraOnGrid();
}

// Make these functions available to the HTML
window.filterByMedium = filterByMedium;
window.resetView = resetView;

// Start animation loop
animate();
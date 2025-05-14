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
let yearRuler;
let rulerVisible = true; // Initial state: ruler is visible

// Track mouse position for hover effects
const mouse = new THREE.Vector2();
let hoveredSprite = null;
const HOVER_SCALE = 3.0; // Scale factor for hover effect (20% larger)

// Define year range for the ruler
const YEAR_MIN = 1955;
const YEAR_MAX = 1985;
const YEAR_INTERVAL = 5;

//______________________________Handle sprite selection and display metadata
// Improved function for on_sprite_selected to enhance the close button
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
  
    const keyOrder = [
      "Title", "Name", "Date",
      "Artist", "Artist Bio", "Nationality",
      "Dimensions", "Medium", "ImageURL"
    ];
  
    // Build HTML with enhanced close button
    let html = `
      <div class="info-header">
        <button id="closeBtn" class="metadata-close" aria-label="Close">&times;</button>
      </div>
      <img src="${info.url}" class="info-image">
    `;
    
    // Add era information with color coding
    let eraColor = "#ffffff";
    if (info.Era === "early") eraColor = "#cccccc";
    if (info.Era === "middle") eraColor = "#d9b38c";
    if (info.Era === "late") eraColor = "#d98c8c";
    
    html += `<div style="background-color: ${eraColor}22; padding: 5px; border-radius: 4px; margin-bottom: 10px;">
        <strong>${info.Era ? info.Era.charAt(0).toUpperCase() + info.Era.slice(1) : ''} Fluxus</strong> 
        (${info.Year || ''})
    </div>`;
    
    // Add title with larger font
    html += `<h2 style="margin-top: 0; margin-bottom: 5px;">${info.Title || ''}</h2>`;
    
    // Add artist with emphasis
    html += `<h3 style="margin-top: 0; margin-bottom: 15px;">${info.Artist || ''}</h3>`;
    
    html += `<ul class="info-list">`;
    // Skip title and artist since we added them above
    keyOrder.slice(2).forEach(key => {
      let val = info[key];
      if (key !== "Title" && key !== "Artist" && val) {
        if (Array.isArray(val)) val = val.join(', ');
        html += `<li><strong>${key}:</strong> ${val ?? ''}</li>`;
      }
    });
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
    // Get viewport dimensions accounting for sidebar
    const sidebar = document.getElementById('sidebar-panel');
    const sidebarWidth = (sidebar && sidebar.style.display !== 'none') ? sidebar.offsetWidth : 0;
    
    const w = window.innerWidth - sidebarWidth;
    const h = window.innerHeight - 60; // Accounting for navbar
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
    // with less background space (smaller margin)
    const requiredWidth = gridWidth * 1.05;  // Reduced from 1.2 to 1.05 for tighter view
    const requiredHeight = gridHeight * 1.05; // Reduced from 1.2 to 1.05
    
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

// Function to create a year ruler along the Y-axis
function createYearRuler() {
    // Updated year range from 1955 to 2000
    const YEAR_MIN_DISPLAY = 1955;
    const YEAR_MAX_DISPLAY = 2000;
    const years = [];
    
    for (let year = YEAR_MIN_DISPLAY; year <= YEAR_MAX_DISPLAY; year += YEAR_INTERVAL) {
        years.push(year);
    }
    
    // Create a group to hold all ruler elements
    const rulerGroup = new THREE.Group();
    
    // Calculate grid dimensions precisely
    const gridWidth = tiles_x * sprite_size;
    const gridHeight = tiles_y * sprite_size;
    
    // Position the ruler on the left edge with more space for labels
    const rulerX = -30; // Moved further left
    const rulerOffsetX = 20;
    
    // Create semi-transparent background panel for the ruler
    const panelGeometry = new THREE.PlaneGeometry(90, gridHeight); // Wider panel to accommodate labels
    const panelMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(rulerX + rulerOffsetX - 25, 1, gridHeight / 2);
    panel.rotation.x = Math.PI / 2;
    rulerGroup.add(panel);
    
    // Create thicker ruler line with exact grid height
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array([
        rulerX + rulerOffsetX, 1, 0,
        rulerX + rulerOffsetX, 1, gridHeight
    ]);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        linewidth: 5,
        transparent: false,
        opacity: 1.0
    });
    const rulerLine = new THREE.Line(lineGeometry, lineMaterial);
    rulerGroup.add(rulerLine);
    
    // Define key years to display (based on your new 1955-2000 range)
    const selectedYears = [
        1955, // Start year
        1960,
        1965,
        1970,
        1975,
        1980,
        1985,
        1990,
        1995,
        2000  // End year
    ];
    
    // Map years to positions exactly matching grid height
    selectedYears.forEach((year) => {
        // Normalize position between 0 and 1
        const normalizedPos = 1 - ((year - YEAR_MIN_DISPLAY) / (YEAR_MAX_DISPLAY - YEAR_MIN_DISPLAY));
        // Map to grid height
        const zPos = normalizedPos * gridHeight;
        
        // Skip if outside grid
        if (zPos < 0 || zPos > gridHeight) {
            return;
        }
        
        // Create thicker tick mark
        const tickWidth = 20;
        const tickGeometry = new THREE.BufferGeometry();
        const tickPositions = new Float32Array([
            rulerX + rulerOffsetX, 1, zPos,
            rulerX + rulerOffsetX - tickWidth, 1, zPos
        ]);
        tickGeometry.setAttribute('position', new THREE.BufferAttribute(tickPositions, 3));
        const tickMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
            transparent: false,
            opacity: 1.0
        });
        const tickLine = new THREE.Line(tickGeometry, tickMaterial);
        rulerGroup.add(tickLine);
        
        // Add year label with better background and position
        // Move year labels further left to avoid overlap
        const yearLabel = createTextSprite(year.toString(), 45, 'rgba(255,255,255,1.0)', 'rgba(0,0,0,0.7)');
        yearLabel.position.set(rulerX + rulerOffsetX - tickWidth - 25, 1, zPos); // Further left
        rulerGroup.add(yearLabel);
        
        // Add era labels based on year - positioned to the left side
        // Only add era labels at key years and positioned well away from year numbers
        let eraLabel;
        if (year === 1960) {
            eraLabel = createTextSprite("Early Fluxus", 40, 'rgba(235,235,235,1.0)', 'rgba(20,20,20,0.7)');
            eraLabel.position.set(rulerX - 90, 1, zPos - 15); // Offset vertically
            rulerGroup.add(eraLabel);
        } else if (year === 1970) {
            eraLabel = createTextSprite("Core Fluxus", 40, 'rgba(255,220,180,1.0)', 'rgba(20,20,20,0.7)');
            eraLabel.position.set(rulerX - 90, 1, zPos - 50); // Offset vertically
            rulerGroup.add(eraLabel);
        } else if (year === 1980) {
            eraLabel = createTextSprite("Late Fluxus", 40, 'rgba(255,180,180,1.0)', 'rgba(20,20,20,0.7)');
            eraLabel.position.set(rulerX - 90, 1, zPos - 95); // Offset vertically
            rulerGroup.add(eraLabel);
        }
    });
    
    // Add shorter but more visible horizontal tick lines at regular intervals
    for (let i = 0; i < 45; i++) { // More tick marks for extended range
        const zPos = (i / 45) * gridHeight;
        
        // Skip positions where we already have major ticks
        if (selectedYears.some(year => {
            const yearPos = (1 - ((year - YEAR_MIN_DISPLAY) / (YEAR_MAX_DISPLAY - YEAR_MIN_DISPLAY))) * gridHeight;
            return Math.abs(yearPos - zPos) < 3;
        })) {
            continue;
        }
        
        // Create minor tick with improved visibility
        const minorTickWidth = 10;
        const tickGeometry = new THREE.BufferGeometry();
        const tickPositions = new Float32Array([
            rulerX + rulerOffsetX, 1, zPos,
            rulerX + rulerOffsetX - minorTickWidth, 1, zPos
        ]);
        tickGeometry.setAttribute('position', new THREE.BufferAttribute(tickPositions, 3));
        const minorTickMaterial = new THREE.LineBasicMaterial({ 
            color: 0xcccccc, 
            transparent: true,
            opacity: 0.8
        });
        const tickLine = new THREE.Line(tickGeometry, minorTickMaterial);
        rulerGroup.add(tickLine);
    }
    
    // Add "YEAR" title at the top with better visibility
    const rulerTitle = createTextSprite('YEAR', 50, 'rgba(255,255,255,1.0)', 'rgba(0,0,0,0.8)');
    rulerTitle.position.set(rulerX + rulerOffsetX - 10, 1, gridHeight + 20); // Moved up and left
    rulerGroup.add(rulerTitle);
    
    scene.add(rulerGroup);
    rulerGroup.visible = rulerVisible;
    return rulerGroup;
}

// Function to wait for images to load before centering
function waitForImagesAndCenter() {
    // Check if the expected number of sprites have been loaded
    if (image_sprites.length < 100) { // Using a threshold number
        // Not all loaded yet, wait a bit more
        setTimeout(waitForImagesAndCenter, 500);
        return;
    }
    
    // All images are loaded, now center the camera
    centerCameraOnGrid();
    
    // Also, recreate the year ruler after we know the dimensions
    if (yearRuler) {
        scene.remove(yearRuler);
    }
    yearRuler = createYearRuler();
}

//______________________________Create a sprite from the received json data
// Improved text sprite function with more appropriate sizing
function createTextSprite(text, fontSize = 48, color = 'rgba(255,255,255,1.0)', bgColor = 'rgba(0,0,0,0.7)', widthMultiplier = 1.0) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Determine if this is a year label or era label
    const isYearLabel = !isNaN(parseInt(text));
    const padding = isYearLabel ? 8 : 16;
    const effectiveFontSize = isYearLabel ? fontSize * 0.8 : fontSize;
    
    // Estimate text width
    context.font = `Bold ${effectiveFontSize}px Arial`;
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width + padding * 2;
    
    // Apply width multiplier for wider backgrounds
    const calculatedWidth = isYearLabel ? textWidth : textWidth * widthMultiplier;
    
    canvas.width = calculatedWidth;
    canvas.height = effectiveFontSize + padding * 2;
    
    // Draw rounded rectangle background
    if (bgColor) {
        context.fillStyle = bgColor;
        const cornerRadius = 8; // Rounded corners
        
        context.beginPath();
        context.moveTo(cornerRadius, 0);
        context.lineTo(canvas.width - cornerRadius, 0);
        context.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
        context.lineTo(canvas.width, canvas.height - cornerRadius);
        context.quadraticCurveTo(canvas.width, canvas.height, canvas.width - cornerRadius, canvas.height);
        context.lineTo(cornerRadius, canvas.height);
        context.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
        context.lineTo(0, cornerRadius);
        context.quadraticCurveTo(0, 0, cornerRadius, 0);
        context.closePath();
        context.fill();
    }
    
    // Text with better shadow for improved legibility
    context.fillStyle = color;
    context.font = `Bold ${effectiveFontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = 'rgba(0,0,0,0.7)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;
    context.fillText(text, canvas.width/2, canvas.height/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Scale based on canvas aspect ratio and type
    const aspectRatio = canvas.width / canvas.height;
    const scale = isYearLabel ? 16 : 20;
    sprite.scale.set(scale * aspectRatio, scale, 1);
    return sprite;
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
    
    // Also remove the year ruler if it exists
    if (yearRuler) {
        scene.remove(yearRuler);
        yearRuler = null;
    }
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
    
    // Display a sample position 
    if (image_data.length > 100) {
        console.log(image_data[100].pos);
    }

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
    
    // Make the year ruler always face the camera if it exists
    if (yearRuler) {
        // Get camera quaternion
        const cameraQuaternion = camera.quaternion.clone();
        
        // Apply this rotation to each text sprite in the ruler
        yearRuler.children.forEach(child => {
            if (child instanceof THREE.Sprite) {
                // Only update sprites (text labels)
                child.quaternion.copy(cameraQuaternion);
            }
        });
    }
    // Initialize enhanced UI if not already done
    if (typeof window.uiInitialized === 'undefined' && typeof window.initEnhancedUI === 'function') {
        window.initEnhancedUI();
        window.uiInitialized = true;
    }
    renderer.render(scene, camera);
}

// Function to filter sprites by era
function filterByEra(era) {
    // Reset all sprites to visible first
    for (let i = 0; i < image_sprites.length; i++) {
        // Reset opacity for all sprites
        image_sprites[i].visible = true;
        image_sprites[i].material.opacity = 1.0;
        
        // Reset colors to original
        const info = image_sprites[i].image_info;
        image_sprites[i].material.color.set(info.color[0], info.color[1], info.color[2]);
    }
    
    // If 'all' is selected, we're done - all sprites are now visible and with original colors
    if (era === 'all') {
        return;
    }
    
    // Otherwise, highlight the selected era and fade others
    for (let i = 0; i < image_sprites.length; i++) {
        const spriteEra = image_sprites[i].image_info.Era;
        
        if (spriteEra !== era) {
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

// Add this helper function to show a temporary tooltip
function showTooltip(message) {
    // Create or update tooltip
    let tooltip = document.getElementById('visibility-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'visibility-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.bottom = '80px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 15px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.zIndex = '2000';
        tooltip.style.fontFamily = 'Arial, sans-serif';
        tooltip.style.fontSize = '14px';
        tooltip.style.fontWeight = 'bold';
        tooltip.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(tooltip);
    }
    
    // Set message and show tooltip
    tooltip.textContent = message;
    tooltip.style.opacity = '1';
    
    // Hide after delay
    setTimeout(() => {
        tooltip.style.opacity = '0';
    }, 2000);
}


// Function to zoom in
function zoomIn() {
    // Get current camera zoom
    const currentZoom = controls.zoom;
    // Zoom in by 20%
    controls.zoom = Math.min(controls.maxZoom, currentZoom * 1.2);
    controls.update();
}

// Function to zoom out
function zoomOut() {
    // Get current camera zoom
    const currentZoom = controls.zoom;
    // Zoom out by 20%
    controls.zoom = Math.max(controls.minZoom, currentZoom / 1.2);
    controls.update();
}

// Function to reset view to initial position
function resetView() {
    centerCameraOnGrid();
}

// Add this event listener to handle keyboard events
document.addEventListener('keydown', function(event) {
    // Check if the key pressed is 'T' or 't'
    if (event.key === 't' || event.key === 'T') {
        // Toggle ruler visibility
        rulerVisible = !rulerVisible;
        
        // Update ruler visibility if it exists
        if (yearRuler) {
            yearRuler.visible = rulerVisible;
        }
        
        console.log(`Ruler visibility: ${rulerVisible ? 'visible' : 'hidden'}`);
    }
});

// Make these functions available to the HTML
window.filterByEra = filterByEra;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetView = resetView;

// Signal when images are loaded (for loading screen)
// function waitForImagesAndCenter() {
//     // Check if the expected number of sprites have been loaded
//     if (image_sprites.length < 100) { // Using a threshold number
//         // Not all loaded yet, wait a bit more
//         setTimeout(waitForImagesAndCenter, 500);
//         return;
//     }
    
//     // All images are loaded, now center the camera
//     centerCameraOnGrid();
    
//     // Also, recreate the year ruler after we know the dimensions
//     if (yearRuler) {
//         scene.remove(yearRuler);
//     }
//     yearRuler = createYearRuler();
    
//     // Signal that images are loaded (for loading screen)
//     if (window.imagesLoaded) {
//         window.imagesLoaded();
//     }
// }

animate();
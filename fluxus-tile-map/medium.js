// medium.js - Enhanced version with hero image overlay and improved UI
import * as THREE from './modules/three/three.module.js';
import { OrbitControls } from './modules/three/addons/controls/OrbitControls.js';

// Make these available to the DOM scripts
window.viewportWidth = 0;
window.viewportHeight = 0;

// ======== Setup core elements =========
const viewport_div = document.getElementById('viewport');
const info_div = document.getElementById('info_div');

const sprite_size = 3;
let selected_sprite = null;
let image_sprites = [];
let tiles_x = 0;
let tiles_y = 0;
let gridOverlay = null;
let categoryLabels = {};
let showLabels = true;
let showGrid = true;

// Track mouse position for hover effects
const mouse = new THREE.Vector2();
let hoveredSprite = null;
const HOVER_SCALE = 2.0; // Scale factor for hover effect

// Flag to limit the number of console error messages
let errorMessageCount = 0;
const MAX_ERROR_MESSAGES = 5;

// ======== Setup THREE.js renderer and scene =========
// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.domElement.addEventListener('click', onPointerClick);
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.setSize(400, 400);
viewport_div.appendChild(renderer.domElement);

// Create scene with dark background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); // Almost black

// Set up camera
const frustumSize = 120;
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

// Set up controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = true;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.enableRotate = false;
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
};
controls.zoomSpeed = 0.5;
controls.minZoom = 0.5;
controls.maxZoom = 10;

// ======== Sprite interaction functions =========
// Create raycaster and pointer for click events
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Handle sprite selection
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
    sprite.material.color.set(1, 1, 1); // Highlight in white
    selected_sprite = sprite;
  
    // Add category indicator to the info display
    const category = info.Category || '';
  
    // Build HTML with enhanced close button and category
    let html = `
      <div class="info-header">
        <button id="closeBtn" class="metadata-close" aria-label="Close">&times;</button>
      </div>
      <img src="${info.url}" class="info-image">
    `;
    
    // Add subtle category badge
    html += `<div style="background-color: rgba(200, 200, 200, 0.2); padding: 5px; border-radius: 4px; margin-bottom: 10px; display: inline-block;">
        <strong>${category ? category.charAt(0).toUpperCase() + category.slice(1) : ''}</strong>
    </div>`;
    
    // Add title with larger font
    html += `<h2 style="margin-top: 0; margin-bottom: 5px;">${info.Title || ''}</h2>`;
    
    // Add artist with emphasis
    html += `<h3 style="margin-top: 0; margin-bottom: 15px;">${info.Artist || ''}</h3>`;
    
    html += `<ul class="info-list">`;
    // Add other metadata
    const keyOrder = ["Date", "Medium", "Classification", "Dimensions", "Nationality"];
    keyOrder.forEach(key => {
      let val = info[key];
      if (val) {
        if (Array.isArray(val)) val = val.join(', ');
        html += `<li><strong>${key}:</strong> ${val}</li>`;
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

// Handle click interactions
function onPointerClick(event) {
    // Calculate pointer position
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray
    raycaster.setFromCamera(pointer, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        on_sprite_selected(intersects[0].object);
    }
}

// Track mouse movement for hover effects
function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// ======== Resize handling =========
function onWindowResize() {
    const w = viewport_div.clientWidth;
    const h = viewport_div.clientHeight;
    const aspect = w / h;
    
    // Update camera
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    
    renderer.setSize(w, h);
    camera.updateProjectionMatrix();
    
    // Store dimensions for grid overlay
    window.viewportWidth = w;
    window.viewportHeight = h;
}

// Listen for window resizing
window.addEventListener('resize', onWindowResize, false);
onWindowResize();

// ======== Grid and Visual Elements =========
// Create a grid overlay for medium categories
function createGridOverlay(gridData) {
    // Remove existing grid if any
    if (gridOverlay) {
        scene.remove(gridOverlay);
    }
    
    // Create a new group for grid elements
    gridOverlay = new THREE.Group();
    categoryLabels = {};
    
    // Create grid lines and category labels
    for (const category of gridData.grid_overlay.categories) {
        const startX = category.startX * sprite_size;
        const startY = category.startY * sprite_size;
        const endX = category.endX * sprite_size;
        const endY = category.endY * sprite_size;
        
        // Create horizontal and vertical lines for this quadrant
        const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(1, 1, 1),
            transparent: true,
            opacity: 0.3
        });
        
        // Horizontal top line
        const topLineGeometry = new THREE.BufferGeometry();
        const topLinePositions = new Float32Array([
            startX, 0, startY,
            endX + sprite_size, 0, startY
        ]);
        topLineGeometry.setAttribute('position', new THREE.BufferAttribute(topLinePositions, 3));
        
        // Horizontal bottom line
        const bottomLineGeometry = new THREE.BufferGeometry();
        const bottomLinePositions = new Float32Array([
            startX, 0, endY + sprite_size,
            endX + sprite_size, 0, endY + sprite_size
        ]);
        bottomLineGeometry.setAttribute('position', new THREE.BufferAttribute(bottomLinePositions, 3));
        
        // Vertical left line
        const leftLineGeometry = new THREE.BufferGeometry();
        const leftLinePositions = new Float32Array([
            startX, 0, startY,
            startX, 0, endY + sprite_size
        ]);
        leftLineGeometry.setAttribute('position', new THREE.BufferAttribute(leftLinePositions, 3));
        
        // Vertical right line
        const rightLineGeometry = new THREE.BufferGeometry();
        const rightLinePositions = new Float32Array([
            endX + sprite_size, 0, startY,
            endX + sprite_size, 0, endY + sprite_size
        ]);
        rightLineGeometry.setAttribute('position', new THREE.BufferAttribute(rightLinePositions, 3));
        
        // Create line objects and add to grid group
        const topLine = new THREE.Line(topLineGeometry, lineMaterial);
        const bottomLine = new THREE.Line(bottomLineGeometry, lineMaterial);
        const leftLine = new THREE.Line(leftLineGeometry, lineMaterial);
        const rightLine = new THREE.Line(rightLineGeometry, lineMaterial);
        
        topLine.userData.isGridLine = true;
        bottomLine.userData.isGridLine = true;
        leftLine.userData.isGridLine = true;
        rightLine.userData.isGridLine = true;
        
        gridOverlay.add(topLine);
        gridOverlay.add(bottomLine);
        gridOverlay.add(leftLine);
        gridOverlay.add(rightLine);
        
        // Create text sprite for category label
        const categoryName = category.name;
        const midX = startX + (endX - startX) / 2 + sprite_size/2;
        const midY = startY + (endY - startY) / 8; // Position near the top
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Fill with semi-transparent black
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'white';
        context.fillText(categoryName, canvas.width/2, canvas.height/2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(midX, 0.1, midY); // Slightly above plane
        sprite.scale.set(15, 5, 1);
        sprite.userData.isCategoryLabel = true;
        
        gridOverlay.add(sprite);
        
        // Store reference to label
        categoryLabels[categoryName] = sprite;
    }
    
    // Add grid to scene
    scene.add(gridOverlay);
    
    return gridOverlay;
}

// Toggle grid visibility
function toggleGridVisibility(visible) {
    showGrid = visible;
    if (gridOverlay) {
        // Set visibility for all grid lines
        gridOverlay.children.forEach(child => {
            if (child.userData && child.userData.isGridLine) {
                child.visible = visible;
            }
        });
    }
    
    // Show a notification
    showNotification(visible ? "Grid lines visible" : "Grid lines hidden");
}

// Toggle label visibility
function toggleLabelVisibility(visible) {
    showLabels = visible;
    if (gridOverlay) {
        // Set visibility for all category labels
        gridOverlay.children.forEach(child => {
            if (child.userData && child.userData.isCategoryLabel) {
                child.visible = visible;
            }
        });
    }
    
    // Show a notification
    showNotification(visible ? "Category labels visible" : "Category labels hidden");
}

// Show notification
function showNotification(message, duration = 2000) {
    const notification = document.getElementById('visibility-notification');
    if (notification) {
        notification.textContent = message;
        notification.style.opacity = '1';
        
        setTimeout(() => {
            notification.style.opacity = '0';
        }, duration);
    } else {
        console.log(message); // Fallback if notification element doesn't exist
    }
}

// ======== Create artwork sprites =========
// Create sprite for artwork
function createSprite(image_info) {
    const textureLoader = new THREE.TextureLoader();
    
    // Add error handling for texture loading
    textureLoader.load(
        image_info.thumbnail_url, 
        // Success callback
        (texture) => {
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            spriteMaterial.color.set(image_info.color[0], image_info.color[1], image_info.color[2]);
            
            const sprite = new THREE.Sprite(spriteMaterial);
            const x = image_info.pos[0] * sprite_size;
            const y = image_info.pos[1] * sprite_size;
            
            sprite.position.set(x, 0, y);
            sprite.scale.set(sprite_size, sprite_size, 1);
            sprite.updateMatrix();
            sprite.image_info = image_info;
            
            scene.add(sprite);
            image_sprites.push(sprite);
        },
        // Progress callback (not used)
        undefined,
        // Error callback
        (error) => {
            // Limit console error spam
            if (errorMessageCount < MAX_ERROR_MESSAGES) {
                console.error(`Error loading texture: ${image_info.thumbnail_url}`, error);
                errorMessageCount++;
                
                if (errorMessageCount === MAX_ERROR_MESSAGES) {
                    console.warn("Too many texture loading errors. Suppressing further messages.");
                }
            }
        }
    );
}

// Clear sprites from scene
function clearSprites() {
    for (let i = 0; i < image_sprites.length; i++) {
        scene.remove(image_sprites[i]);
    }
    image_sprites = [];
    info_div.innerHTML = '';
    selected_sprite = null;
    
    // Also remove grid overlay
    if (gridOverlay) {
        scene.remove(gridOverlay);
        gridOverlay = null;
    }
}

// Center camera on grid
function centerCameraOnGrid() {
    // Calculate grid dimensions
    const gridWidth = tiles_x * sprite_size;
    const gridHeight = tiles_y * sprite_size;
    const centerX = gridWidth / 2;
    const centerZ = gridHeight / 2;
    
    // Position camera
    camera.position.set(centerX, 100, centerZ);
    camera.lookAt(centerX, 0, centerZ);
    camera.up.set(0, 0, -1);
    
    // Adjust frustum size to fit the entire grid
    const requiredWidth = gridWidth * 1.1;
    const requiredHeight = gridHeight * 1.1;
    
    // Get aspect ratio
    const w = viewport_div.clientWidth;
    const h = viewport_div.clientHeight;
    const aspect = w / h;
    
    // Calculate new frustum size
    let newFrustumSize;
    if (requiredWidth / aspect > requiredHeight) {
        newFrustumSize = requiredWidth / aspect;
    } else {
        newFrustumSize = requiredHeight;
    }
    
    // Update camera frustum
    camera.left = -newFrustumSize * aspect / 2;
    camera.right = newFrustumSize * aspect / 2;
    camera.top = newFrustumSize / 2;
    camera.bottom = -newFrustumSize / 2;
    camera.updateProjectionMatrix();
    
    // Reset controls target
    controls.target.set(centerX, 0, centerZ);
    controls.update();
}

// ======== Load and Display Data =========
// Display tiles from JSON data with improved batch loading
function update_medium_tiles(json_data) {
    // Clear existing sprites
    clearSprites();
    
    // Reset error counter
    errorMessageCount = 0;
    
    // Extract tile data
    const tiles = json_data.tiles;
    if (!tiles || tiles.length === 0) {
        console.error("No tile data received");
        return;
    }
    
    console.log(`Received ${tiles.length} tiles`);
    
    // Get grid dimensions
    tiles_x = json_data.dimensions.width;
    tiles_y = json_data.dimensions.height;
    console.log(`Grid dimensions: ${tiles_x} x ${tiles_y}`);
    
    // Get UI settings if available
    if (json_data.ui_settings) {
        showLabels = json_data.ui_settings.show_labels !== undefined ? 
            json_data.ui_settings.show_labels : true;
            
        // Add keyboard shortcut info to UI
        const gridKey = json_data.ui_settings.grid_shortcut_key || 'G';
        const labelKey = json_data.ui_settings.label_shortcut_key || 'L';
        
        // Update keyboard shortcut display if DOM elements exist
        const gridKeyElement = document.getElementById('grid-key');
        const labelKeyElement = document.getElementById('label-key');
        
        if (gridKeyElement) gridKeyElement.textContent = gridKey;
        if (labelKeyElement) labelKeyElement.textContent = labelKey;
    }
    
    // Enhanced batch loading with smaller batches and shorter delays
    const BATCH_SIZE = 100; // Load more tiles per batch
    const BATCH_DELAY = 30; // Shorter delay (30ms) between batches

    // Track loading progress
    let tilesLoaded = 0;
    const totalTiles = tiles.length;
    
    // Progress notification
    function updateLoadingProgress() {
        const percent = Math.round((tilesLoaded / totalTiles) * 100);
        const notification = document.getElementById('loading-notification');
        if (notification) {
            notification.textContent = `Loading tiles: ${percent}%`;
            notification.style.opacity = '1';
            
            if (percent >= 100) {
                setTimeout(() => {
                    notification.style.opacity = '0';
                }, 1000);
            }
        }
    }
    
    // Create a loading notification if it doesn't exist
    if (!document.getElementById('loading-notification')) {
        const notification = document.createElement('div');
        notification.id = 'loading-notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(notification);
    }

    function loadBatch(startIndex) {
        const endIndex = Math.min(startIndex + BATCH_SIZE, tiles.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            createSprite(tiles[i]);
            tilesLoaded++;
        }
        
        // Update loading progress
        updateLoadingProgress();
        
        // If more to load, schedule next batch
        if (endIndex < tiles.length) {
            setTimeout(() => {
                loadBatch(endIndex);
            }, BATCH_DELAY);
        } else {
            // All tiles loaded, hide notification after a delay
            setTimeout(() => {
                const notification = document.getElementById('loading-notification');
                if (notification) {
                    notification.style.opacity = '0';
                }
                
                // Show a success message
                showNotification("Medium mosaic loaded successfully", 3000);
            }, 1000);
        }
    }
    
    // Start loading first batch
    loadBatch(0);
    
    // Create grid overlay
    createGridOverlay(json_data);
    
    // Initialize grid and label visibility
    toggleGridVisibility(showGrid);
    toggleLabelVisibility(showLabels);
    
    // Center camera on grid after loading
    setTimeout(centerCameraOnGrid, 1000);
}

// Load medium-based tiles
function load_medium_tiles() {
    // Show loading indicator
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
    }
    
    fetch('/medium-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'medium' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received medium tile data');
        update_medium_tiles(data);
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    })
    .catch(error => {
        console.error('Error loading medium tiles:', error);
        
        // Hide loading overlay even on error
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
        
        // Show error notification
        showNotification("Error loading tiles: " + error.message, 5000);
    });
}

// ======== Animation and Rendering =========
// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
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
                
                // Change cursor to pointer
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
    
    // Make labels always face camera
    if (gridOverlay) {
        gridOverlay.children.forEach(child => {
            if (child.userData && child.userData.isCategoryLabel) {
                child.quaternion.copy(camera.quaternion);
            }
        });
    }
    
    renderer.render(scene, camera);
}

// Reset view function
function resetView() {
    centerCameraOnGrid();
    showNotification("View reset");
}

// ======== Initialize =========
// Set up keyboard controls
document.addEventListener('keydown', function(event) {
    // G key toggles grid
    if (event.key === 'g' || event.key === 'G') {
        toggleGridVisibility(!showGrid);
    }
    
    // L key toggles labels
    if (event.key === 'l' || event.key === 'L') {
        toggleLabelVisibility(!showLabels);
    }
    
    // R key resets view
    if (event.key === 'r' || event.key === 'R') {
        resetView();
    }
    
    // Escape key closes info panel
    if (event.key === 'Escape') {
        if (info_div.classList.contains('show-info')) {
            const closeBtn = document.getElementById('closeBtn');
            if (closeBtn) closeBtn.click();
        }
    }
});

// Initialize notification element
if (!document.getElementById('visibility-notification')) {
    const notification = document.createElement('div');
    notification.id = 'visibility-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.5s';
    notification.style.opacity = '0';
    document.body.appendChild(notification);
}

// Load tiles and start animation
load_medium_tiles();
animate();

// Make important functions available globally
window.resetView = resetView;
window.toggleGridVisibility = toggleGridVisibility;
window.toggleLabelVisibility = toggleLabelVisibility;
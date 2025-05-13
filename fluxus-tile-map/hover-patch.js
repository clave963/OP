// hover-effect-patch.js
// This script adds a hover effect to the Fluxus Mosaic tiles
// Add this after front.js in your HTML file

document.addEventListener('DOMContentLoaded', function() {
    // Wait until the Three.js environment is initialized
    setTimeout(function() {
        console.log("Applying hover effect to tiles...");
        
        // Make sure the required variables exist
        if (!window.scene || !window.raycaster || !window.renderer || !window.camera) {
            console.error("Required Three.js objects are not available");
            return;
        }
        
        // Create a mouse vector for tracking
        const mouse = new THREE.Vector2();
        
        // Settings for the hover effect
        const HOVER_SCALE = 3.0; // How much to enlarge sprites on hover (20% bigger)
        const ORIGINAL_SCALE = window.sprite_size || 3; // Default sprite size
        let hoveredSprite = null;
        
        // Function to update mouse position on mouse move
        function onMouseMove(event) {
            // Calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const rect = window.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        }
        
        // Add mouse move listener
        window.renderer.domElement.addEventListener('mousemove', onMouseMove);
        
        // Store the original animate function
        const originalAnimate = window.animate;
        
        // Create a new animate function that adds hover detection
        window.animate = function() {
            // Call the original animate function
            originalAnimate();
            
            // Raycasting for hover detection
            window.raycaster.setFromCamera(mouse, window.camera);
            const intersects = window.raycaster.intersectObjects(window.image_sprites);
            
            // Handle hover state
            if (intersects.length > 0) {
                const newHoveredSprite = intersects[0].object;
                
                // If we're hovering over a new sprite
                if (hoveredSprite !== newHoveredSprite) {
                    // Reset previous hovered sprite scale if there was one
                    if (hoveredSprite && hoveredSprite !== window.selected_sprite) {
                        hoveredSprite.scale.set(ORIGINAL_SCALE, ORIGINAL_SCALE, 1);
                    }
                    
                    // Set new hovered sprite
                    hoveredSprite = newHoveredSprite;
                    
                    // Don't enlarge if it's the selected sprite
                    if (hoveredSprite !== window.selected_sprite) {
                        // Enlarge the sprite and add a slight bounce animation
                        gsap.to(hoveredSprite.scale, {
                            x: ORIGINAL_SCALE * HOVER_SCALE,
                            y: ORIGINAL_SCALE * HOVER_SCALE,
                            duration: 0.2,
                            ease: "back.out(1.5)"
                        });
                        
                        // Change cursor to pointer to indicate interactive element
                        window.renderer.domElement.style.cursor = 'pointer';
                    }
                }
            } else {
                // If we moved out of a sprite, reset its scale with animation
                if (hoveredSprite && hoveredSprite !== window.selected_sprite) {
                    gsap.to(hoveredSprite.scale, {
                        x: ORIGINAL_SCALE,
                        y: ORIGINAL_SCALE,
                        duration: 0.2,
                        ease: "power2.out"
                    });
                    hoveredSprite = null;
                }
                
                // Reset cursor
                window.renderer.domElement.style.cursor = 'move';
            }
        };
        
        // Store the original sprite selection function
        const originalOnSpriteSelected = window.on_sprite_selected;
        
        // Create a new sprite selection function that handles scale correctly
        window.on_sprite_selected = function(sprite) {
            // Reset scale of previously hovered sprite if it exists and isn't the newly selected one
            if (hoveredSprite && hoveredSprite !== sprite && hoveredSprite !== window.selected_sprite) {
                gsap.to(hoveredSprite.scale, {
                    x: ORIGINAL_SCALE,
                    y: ORIGINAL_SCALE,
                    duration: 0.2,
                    ease: "power2.out"
                });
                hoveredSprite = null;
            }
            
            // Call the original sprite selection function
            originalOnSpriteSelected(sprite);
        };
        
        // Load GSAP for smoother animations (if not already loaded)
        if (!window.gsap) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
            script.onload = function() {
                console.log("GSAP loaded for smoother hover animations");
            };
            document.head.appendChild(script);
        }
        
        console.log("Hover effect applied successfully!");
    }, 2000); // Give more time for all resources to load
});
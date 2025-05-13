// patch-script.js
// This script will apply our UI enhancements to the Fluxus Mosaic

// Make sure this script runs after the original front.js has loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait until the Three.js environment is fully initialized
    setTimeout(function() {
        console.log("Applying UI enhancements to the Fluxus Mosaic...");
        
        // 1. Fix the info_div styling to make sure it shows correctly
        const infoDiv = document.getElementById('info_div');
        if (infoDiv) {
            // Add an observer to detect when content is added to the info_div
            const observer = new MutationObserver(function(mutations) {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log("Content added to info_div, making it visible");
                        infoDiv.style.display = 'block';
                    }
                }
            });
            
            // Start observing the info_div for content changes
            observer.observe(infoDiv, { childList: true });
            
            // Make sure the div is styled correctly
            infoDiv.style.position = 'fixed';
            infoDiv.style.top = '80px';
            infoDiv.style.right = '20px';
            infoDiv.style.width = '300px';
            infoDiv.style.maxHeight = '80vh';
            infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            infoDiv.style.color = 'white';
            infoDiv.style.padding = '15px';
            infoDiv.style.borderRadius = '8px';
            infoDiv.style.overflowY = 'auto';
            infoDiv.style.zIndex = '9999';
        }
        
        // 2. Set up event listeners for our UI controls
        const setupUIControls = function() {
            // Help modal functionality
            const helpBtn = document.getElementById('help-btn');
            const helpModal = document.getElementById('help-modal');
            const helpClose = document.getElementById('help-close');
            
            if (helpBtn) {
                helpBtn.addEventListener('click', function() {
                    if (helpModal) helpModal.style.display = 'flex';
                });
            }
            
            if (helpClose) {
                helpClose.addEventListener('click', function() {
                    if (helpModal) helpModal.style.display = 'none';
                });
            }
            
            if (helpModal) {
                helpModal.addEventListener('click', function(e) {
                    if (e.target === helpModal) {
                        helpModal.style.display = 'none';
                    }
                });
            }
            
            // Era filter functionality
            const eraButtons = document.querySelectorAll('.era-btn');
            
            eraButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    eraButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Get selected era
                    const era = this.dataset.era;
                    
                    // Call the filterByEra function from front.js
                    if (window.filterByEra) {
                        window.filterByEra(era);
                    }
                });
            });
            
            // Zoom controls
            const zoomInBtn = document.getElementById('zoom-in-btn');
            const zoomOutBtn = document.getElementById('zoom-out-btn');
            const resetViewBtn = document.getElementById('reset-view-btn');
            
            if (zoomInBtn) {
                zoomInBtn.addEventListener('click', function() {
                    if (window.zoomIn) window.zoomIn();
                });
            }
            
            if (zoomOutBtn) {
                zoomOutBtn.addEventListener('click', function() {
                    if (window.zoomOut) window.zoomOut();
                });
            }
            
            if (resetViewBtn) {
                resetViewBtn.addEventListener('click', function() {
                    if (window.resetView) window.resetView();
                });
            }
        };
        
        setupUIControls();
        
        // 3. Hide loading overlay
        hideLoadingOverlay();
        
        // Function to hide the loading overlay
        function hideLoadingOverlay() {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                console.log("Hiding loading overlay from patch script");
                loadingOverlay.style.opacity = '0';
                loadingOverlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        }
        
        // 4. Enhanced close button functionality
        function enhanceCloseButton() {
            console.log("Enhancing close button functionality...");
            
            // Add enhanced styles for close button
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                /* Enhanced Close Button Styles */
                #info_div .metadata-close,
                #info_div .close-button {
                    position: absolute !important;
                    top: 10px !important;
                    right: 10px !important;
                    width: 36px !important;
                    height: 36px !important;
                    background-color: rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 50% !important;
                    font-size: 24px !important;
                    line-height: 1 !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.2s ease !important;
                    z-index: 10000 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                }
                
                #info_div .metadata-close:hover,
                #info_div .close-button:hover {
                    background-color: rgba(255, 80, 80, 0.8) !important;
                    transform: scale(1.1) !important;
                    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5) !important;
                }
                
                /* Add some padding to the top of the info_div content to accommodate the close button */
                #info_div {
                    position: relative !important;
                    padding-top: 40px !important;
                }
                
                /* Fix info_div visibility issues */
                #info_div.show-info {
                    display: block !important;
                }
            `;
            document.head.appendChild(styleEl);
            
            // Monitor for changes to the info_div
            const infoDiv = document.getElementById('info_div');
            if (!infoDiv) return;
            
            // Create an observer to watch for content being added to info_div
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Content was added, check if we need to enhance the close button
                        const closeBtn = infoDiv.querySelector('.close-button, .metadata-close');
                        if (closeBtn) {
                            console.log("Found close button, ensuring proper styling");
                            
                            // Ensure it has our enhanced styling
                            closeBtn.className = 'metadata-close';
                            
                            // Ensure it has the proper event handler
                            closeBtn.onclick = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // First animate out
                                infoDiv.style.opacity = '0';
                                infoDiv.classList.remove('visible');
                                infoDiv.classList.remove('show-info');
                                
                                // Then clear after animation finishes
                                setTimeout(() => {
                                    infoDiv.innerHTML = '';
                                    infoDiv.style.display = 'none';
                                    infoDiv.style.opacity = '1';
                                    
                                    // Also reset selected sprite if the function exists
                                    if (window.selected_sprite && window.selected_sprite.image_info) {
                                        const prev = window.selected_sprite.image_info;
                                        window.selected_sprite.material.color.set(
                                            prev.color[0], prev.color[1], prev.color[2]
                                        );
                                        window.selected_sprite = null;
                                    }
                                }, 300);
                            };
                        } else {
                            // No close button found, we should add one
                            console.log("No close button found, adding one");
                            
                            // Create new close button
                            const newCloseBtn = document.createElement('button');
                            newCloseBtn.className = 'metadata-close';
                            newCloseBtn.innerHTML = '&times;';
                            newCloseBtn.setAttribute('aria-label', 'Close');
                            
                            // Add click handler
                            newCloseBtn.onclick = function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // First animate out
                                infoDiv.style.opacity = '0';
                                infoDiv.classList.remove('visible');
                                infoDiv.classList.remove('show-info');
                                
                                // Then clear after animation finishes
                                setTimeout(() => {
                                    infoDiv.innerHTML = '';
                                    infoDiv.style.display = 'none';
                                    infoDiv.style.opacity = '1';
                                    
                                    // Also reset selected sprite if the function exists
                                    if (window.selected_sprite && window.selected_sprite.image_info) {
                                        const prev = window.selected_sprite.image_info;
                                        window.selected_sprite.material.color.set(
                                            prev.color[0], prev.color[1], prev.color[2]
                                        );
                                        window.selected_sprite = null;
                                    }
                                }, 300);
                            };
                            
                            // Add to the beginning of the info_div
                            if (infoDiv.firstChild) {
                                infoDiv.insertBefore(newCloseBtn, infoDiv.firstChild);
                            } else {
                                infoDiv.appendChild(newCloseBtn);
                            }
                        }
                        
                        // Make sure the info_div is visible
                        infoDiv.style.display = 'block';
                        infoDiv.classList.add('show-info');
                    }
                });
            });
            
            // Start observing the info_div for changes
            observer.observe(infoDiv, { childList: true, subtree: true });
            
            // Handle Escape key to close popup
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    if (infoDiv.classList.contains('show-info') || infoDiv.style.display === 'block') {
                        // First animate out
                        infoDiv.style.opacity = '0';
                        infoDiv.classList.remove('visible');
                        infoDiv.classList.remove('show-info');
                        
                        // Then clear
                        setTimeout(() => {
                            infoDiv.innerHTML = '';
                            infoDiv.style.display = 'none';
                            infoDiv.style.opacity = '1';
                            
                            // Also reset selected sprite if the function exists
                            if (window.selected_sprite && window.selected_sprite.image_info) {
                                const prev = window.selected_sprite.image_info;
                                window.selected_sprite.material.color.set(
                                    prev.color[0], prev.color[1], prev.color[2]
                                );
                                window.selected_sprite = null;
                            }
                        }, 300);
                    }
                }
            });
        }
        
        // Call our enhanced close button function
        enhanceCloseButton();
        
        console.log("UI enhancements applied successfully!");
    }, 1000); // Give front.js time to initialize
});
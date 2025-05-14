// fixed-enhanced-ui.js - Fixed the help modal content update issue

// ===== Variables to track UI states =====
let uiVisible = true;        // Track whether UI elements are visible
let sidebarVisible = true;   // Track specifically for the sidebar

// ===== Canvas/Screenshot functionality =====
function saveCanvasAsImage() {
  try {
    // Get the THREE.js renderer canvas
    const canvas = renderer.domElement;
    
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Convert canvas to data URL and set as link href
    link.href = canvas.toDataURL('image/png');
    
    // Set filename with timestamp
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}`;
    link.download = `fluxus-mosaic_${timestamp}.png`;
    
    // Temporarily add link to document and click it
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Show tooltip confirmation
    showTooltip("Image saved!");
  } catch (error) {
    console.error("Error saving canvas:", error);
    showTooltip("Failed to save image");
  }
}

// ===== FIXED: Toggle UI visibility function =====
function toggleUIVisibility() {
  // Toggle the state
  uiVisible = !uiVisible;
  
  console.log("Toggling UI visibility to:", uiVisible);
  
  // Elements to toggle
  const navbar = document.querySelector('.navbar');
  const sidebar = document.getElementById('sidebar-panel');
  const infoDiv = document.getElementById('info_div');
  const footer = document.querySelector('.site-footer');
  
  // Toggle each element's visibility
  if (navbar) navbar.style.display = uiVisible ? '' : 'none';
  if (sidebar) sidebar.style.display = uiVisible ? '' : 'none';
  if (footer) footer.style.display = uiVisible ? '' : 'none';
  
  // Special handling for info_div if it's showing
  if (infoDiv && infoDiv.classList.contains('show-info')) {
    infoDiv.style.display = uiVisible ? '' : 'none';
  }
  
  // Adjust viewport width when UI is hidden
  const viewport = document.getElementById('viewport');
  if (viewport) {
    viewport.style.width = uiVisible ? 'calc(100% - 320px)' : '100%';
  }
  
  // Show fullscreen notification briefly
  const notification = document.getElementById('fullscreen-notification');
  if (notification) {
    notification.textContent = uiVisible ? 'UI elements shown' : 'Press F to return to normal view';
    notification.style.opacity = '1';
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 2000);
  }
  
  // Force a resize to adjust everything properly
  if (typeof onWindowResize === 'function') {
    onWindowResize();
  } else {
    // Fallback to window resize event if function not available
    window.dispatchEvent(new Event('resize'));
  }
}

// ===== Initialize new UI features =====
function initEnhancedUI() {
  console.log("Initializing enhanced UI features...");
  
  // Make sure the HTML elements are present before attaching event handlers
  ensureSidebarHTML();
  
  // Save canvas button
  const saveCanvasBtn = document.getElementById('save-canvas-btn');
  if (saveCanvasBtn) {
    saveCanvasBtn.addEventListener('click', saveCanvasAsImage);
  }
  
  // Fullscreen toggle button
  const fullscreenToggleBtn = document.getElementById('fullscreen-toggle-btn');
  if (fullscreenToggleBtn) {
    fullscreenToggleBtn.addEventListener('click', toggleUIVisibility);
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(event) {
    // F key for fullscreen toggle
    if (event.key === 'f' || event.key === 'F') {
      toggleUIVisibility();
    }
    
    // R key for reset view
    if (event.key === 'r' || event.key === 'R') {
      if (window.resetView) {
        window.resetView();
      }
    }
  });
  
  // Update event handlers for era buttons
  const eraButtons = document.querySelectorAll('.era-btn');
  eraButtons.forEach(button => {
    button.addEventListener('click', function() {
      eraButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const era = this.dataset.era;
      if (window.filterByEra) {
        window.filterByEra(era);
      }
    });
  });
  
  // Also adjust the help modal content (FIXED: removed the broken selector)
  safeUpdateHelpModalContent();
  
  console.log("Enhanced UI initialized");
}

// ===== Ensure sidebar HTML is present =====
function ensureSidebarHTML() {
  // Check if sidebar exists
  if (document.getElementById('sidebar-panel')) {
    return;
  }
  
  console.log("Creating sidebar HTML");
  
  // Create sidebar HTML if not present
  const sidebarHTML = `
  <div id="sidebar-panel">
    <h2>Fluxus Mosaic Explorer</h2>
    <p>This interactive visualization displays Fluxus movement artworks (1953-2000), arranged chronologically from bottom to top. Use the controls below to explore the collection.</p>
    
    <button id="reset-view-btn" class="sidebar-btn">
      <i class="icon">⟲</i> Reset View
    </button>
    <button id="toggle-ruler-btn" class="sidebar-btn">
      <i class="icon">⊞</i> Toggle Year Ruler
    </button>
    <button id="save-canvas-btn" class="sidebar-btn">
      <i class="icon">💾</i> Save Current View
    </button>
    <button id="fullscreen-toggle-btn" class="sidebar-btn">
      <i class="icon">👁️</i> Toggle UI Elements (F)
    </button>
    <button id="help-btn" class="sidebar-btn">
      <i class="icon">❓</i> How to Use
    </button>
    
    <div class="section-divider"></div>
    
    <h3>Era Filters</h3>
    <div class="era-buttons">
      <button class="era-btn active" data-era="all">All Eras</button>
      <button class="era-btn" data-era="early">Early Fluxus (1953-1963)</button>
      <button class="era-btn" data-era="middle">Core Fluxus (1964-1973)</button>
      <button class="era-btn" data-era="late">Late Fluxus (1974-1984)</button>
    </div>
    
    <div class="section-divider"></div>
    
    <div id="hero-image-section">
      <h3>About the Hero Image</h3>
      <div id="hero-description">
        This mosaic is arranged over Mieko Shiomi's "Disappearing Music for Face" (1966), a Fluxus film study of a smile slowly transforming into a neutral expression. The work explores the subtle transitions of facial expression over time, reflecting Fluxus interests in everyday gestures and time-based art.
      </div>
    </div>
    
    <div id="keyboard-shortcuts">
      <h3>Keyboard Shortcuts</h3>
      <div class="shortcut-item">
        <span>Toggle Ruler</span>
        <span class="key">T</span>
      </div>
      <div class="shortcut-item">
        <span>Toggle UI Elements</span>
        <span class="key">F</span>
      </div>
      <div class="shortcut-item">
        <span>Reset View</span>
        <span class="key">R</span>
      </div>
      <div class="shortcut-item">
        <span>Close Popups</span>
        <span class="key">ESC</span>
      </div>
    </div>
  </div>
  
  <div id="fullscreen-notification" class="fullscreen-notification">
    Press F to return to normal view
  </div>
  `;
  
  // Insert sidebar into document before the main content
  const viewport = document.getElementById('viewport');
  if (viewport && viewport.parentNode) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sidebarHTML;
    viewport.parentNode.insertBefore(tempDiv.firstElementChild, viewport);
    
    // Also add the notification
    document.body.appendChild(tempDiv.firstElementChild);
  }
}

// ===== FIXED: Help modal content update with standard DOM methods =====
function safeUpdateHelpModalContent() {
  const helpContent = document.getElementById('help-content');
  if (!helpContent) return;
  
  // Safely find the navigation section by iterating through h3 elements
  const headings = helpContent.querySelectorAll('h3');
  let navigationSection = null;
  
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].textContent.includes('Navigation')) {
      navigationSection = headings[i];
      break;
    }
  }
  
  if (navigationSection && navigationSection.nextElementSibling) {
    // Check if it's a ul element
    if (navigationSection.nextElementSibling.tagName.toLowerCase() === 'ul') {
      const navigationList = navigationSection.nextElementSibling;
      
      // Create updated list without the ruler toggle item
      const updatedHTML = `
        <ul>
          <li><strong>Pan:</strong> Click and drag to move around the mosaic</li>
          <li><strong>Zoom:</strong> Use mouse wheel to zoom in and out</li>
          <li><strong>Select Image:</strong> Click on any artwork to view its details</li>
          <li><strong>Reset View:</strong> Click the Reset View button or press R key to return to the default view</li>
          <li><strong>Toggle UI:</strong> Press F key to hide/show all UI elements</li>
        </ul>
      `;
      
      // Replace the navigation list
      navigationList.outerHTML = updatedHTML;
    }
  }
}

// ===== Helper function to show tooltip messages =====
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
    tooltip.style.backgroundColor = 'rgba(10, 22, 32, 0.9)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '10px 20px'; // Increased padding
    tooltip.style.borderRadius = '8px';
    tooltip.style.zIndex = '2000';
    tooltip.style.fontFamily = "'Open Sans', sans-serif";
    tooltip.style.fontSize = '16px'; // Increased font size
    tooltip.style.fontWeight = 'bold';
    tooltip.style.transition = 'opacity 0.3s ease';
    tooltip.style.backdropFilter = 'blur(5px)';
    tooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
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

// ===== Add Google Fonts link if not already present =====
function ensureFontsLoaded() {
  if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Open+Sans:wght@400;600&display=swap';
    document.head.appendChild(fontLink);
  }
}

// Start the initialization
ensureFontsLoaded();
document.addEventListener('DOMContentLoaded', initEnhancedUI);

// Also try to initialize after a delay to ensure it runs even if DOMContentLoaded already fired
setTimeout(initEnhancedUI, 500);

// Make important functions available globally
window.toggleUIVisibility = toggleUIVisibility;
window.saveCanvasAsImage = saveCanvasAsImage;
window.initEnhancedUI = initEnhancedUI;
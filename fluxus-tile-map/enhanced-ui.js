// JavaScript to implement new UI features

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

// ===== Toggle UI visibility function =====
function toggleUIVisibility() {
  uiVisible = !uiVisible;
  
  // Elements to toggle
  const navbar = document.querySelector('.navbar');
  const sidebar = document.getElementById('sidebar-panel');
  const infoDiv = document.getElementById('info_div');
  const footer = document.querySelector('.site-footer');
  
  // Toggle each element's visibility
  [navbar, sidebar, footer].forEach(el => {
    if (el) el.style.display = uiVisible ? '' : 'none';
  });
  
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
    notification.style.opacity = '1';
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 2000);
  }
  
  // Resize renderer to match new viewport dimensions
  onWindowResize();
}

// ===== Initialize new UI features =====
function initEnhancedUI() {
  console.log("Initializing enhanced UI features...");
  
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
  
  // Add description to hero image section
  // (Placeholder text is already in the HTML)
  
  console.log("Enhanced UI initialized");
}

// ===== Call init function when document is ready =====
// We'll use both event listeners to ensure this runs at the right time
document.addEventListener('DOMContentLoaded', initEnhancedUI);

// Also add this to the window object to ensure it runs after Three.js initialization
window.initEnhancedUI = initEnhancedUI;

// Make the init function run after existing initialization in front.js
// Add this line to the end of animate() function in front.js
// if (!window.uiInitialized) { window.initEnhancedUI(); window.uiInitialized = true; }

// === Helper function to show tooltip messages ===
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
    tooltip.style.padding = '8px 15px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.zIndex = '2000';
    tooltip.style.fontFamily = "'Open Sans', sans-serif";
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

// === Helper function to ensure sidebar elements are properly initialized ===
function checkAndInitialize() {
  const sidebar = document.getElementById('sidebar-panel');
  if (!sidebar) {
    console.log("Sidebar not found, trying again in 100ms");
    setTimeout(checkAndInitialize, 100);
    return;
  }
  
  if (!window.uiInitialized) {
    initEnhancedUI();
    window.uiInitialized = true;
  }
}

// Start the initialization check
setTimeout(checkAndInitialize, 500);

// ===== Load fonts =====
// Create and add Google Fonts link
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Open+Sans:wght@400;600&display=swap';
document.head.appendChild(fontLink);
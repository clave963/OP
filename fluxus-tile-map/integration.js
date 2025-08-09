// integration.js - Seamless integration with existing front.js

/**
 * Premium Integration Layer for Fluxus Mosaic Explorer
 * Enhances existing functionality without breaking changes
 */

class FluxusIntegration {
  constructor() {
    this.originalFunctions = new Map();
    this.enhancements = new Map();
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
    // Wait for DOM and Three.js to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    this.interceptExistingFunctions();
    this.enhanceVisualization();
    this.addPremiumFeatures();
    this.setupResponsiveDesign();
    this.optimizePerformance();
    
    this.isInitialized = true;
    console.log('✨ Premium Fluxus Experience activated');
  }
  
  interceptExistingFunctions() {
    // Enhance sprite selection with premium modal
    if (window.on_sprite_selected) {
      this.originalFunctions.set('on_sprite_selected', window.on_sprite_selected);
      
      window.on_sprite_selected = (sprite) => {
        // Call original function first
        this.originalFunctions.get('on_sprite_selected')(sprite);
        
        // Add premium enhancements
        this.enhancedSpriteSelection(sprite);
      };
    }
    
    // Enhance era filtering with smooth animations
    if (window.filterByEra) {
      this.originalFunctions.set('filterByEra', window.filterByEra);
      
      window.filterByEra = (era) => {
        // Add pre-animation effects
        this.showFilterTransition(era);
        
        // Call original function
        this.originalFunctions.get('filterByEra')(era);
        
        // Add post-animation effects
        this.completeFilterTransition(era);
      };
    }
    
    // Enhance view reset with spring animation
    if (window.resetView) {
      this.originalFunctions.set('resetView', window.resetView);
      
      window.resetView = () => {
        this.showViewResetAnimation();
        this.originalFunctions.get('resetView')();
        this.completeViewResetAnimation();
      };
    }
    
    // Enhance window resize handling
    const originalResize = window.onWindowResize || (() => {});
    window.onWindowResize = () => {
      originalResize();
      this.handleResponsiveResize();
    };
  }
  
  enhancedSpriteSelection(sprite) {
    if (!sprite.image_info) return;
    
    // Create premium artwork modal content
    const artworkData = sprite.image_info;
    
    // Show premium modal with enhanced content
    this.showPremiumArtworkModal(artworkData);
    
    // Add visual feedback to selected sprite
    this.addSpriteSelectionEffects(sprite);
    
    // Update browser history for deep linking
    this.updateBrowserHistory(artworkData);
  }
  
  showPremiumArtworkModal(artworkData) {
    // Create or get existing modal
    let modal = document.getElementById('premium-artwork-modal');
    
    if (!modal) {
      modal = this.createPremiumModal();
    }
    
    // Populate with artwork data
    this.populateArtworkModal(modal, artworkData);
    
    // Show with premium animation
    this.showModalWithAnimation(modal);
  }
  
  createPremiumModal() {
    const modalHTML = `
      <div id="premium-artwork-modal" class="modal-backdrop premium-modal-backdrop">
        <div class="modal premium-artwork-modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2 class="modal-title" id="artwork-modal-title">Artwork Details</h2>
            <button class="modal-close premium-close-btn" type="button" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body premium-modal-body">
            <div id="artwork-modal-content">
              <!-- Dynamic content -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('premium-artwork-modal');
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      this.hideModalWithAnimation(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideModalWithAnimation(modal);
      }
    });
    
    return modal;
  }
  
  populateArtworkModal(modal, artworkData) {
    const content = modal.querySelector('#artwork-modal-content');
    const title = modal.querySelector('#artwork-modal-title');
    
    title.textContent = artworkData.Title || 'Untitled Work';
    
    const eraClass = artworkData.Era ? `era-${artworkData.Era}` : 'era-unknown';
    const eraName = artworkData.Era ? 
      artworkData.Era.charAt(0).toUpperCase() + artworkData.Era.slice(1) + ' Fluxus' : 
      'Fluxus Period';
    
    content.innerHTML = `
      <div class="premium-artwork-layout">
        <div class="artwork-image-container">
          <img src="${artworkData.url}" 
               alt="${artworkData.Title || 'Artwork'}"
               class="premium-artwork-image"
               loading="lazy">
          <div class="image-overlay">
            <button class="fullscreen-btn" type="button" aria-label="View fullscreen">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 3h5v2H5v3H3V3zM3 12v5h5v-2H5v-3H3zM12 3h5v5h-2V5h-3V3zM12 17h5v-5h-2v3h-3v2z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="artwork-details">
          <div class="artwork-header">
            <h3 class="artwork-title">${artworkData.Title || 'Untitled'}</h3>
            <div class="artwork-meta-line">
              <span class="artist-name">${artworkData.Artist || 'Unknown Artist'}</span>
              <span class="artwork-date">${artworkData.Date || 'Date unknown'}</span>
            </div>
            <span class="era-badge ${eraClass}">${eraName}</span>
          </div>
          
          <div class="artwork-metadata">
            ${this.createMetadataSection(artworkData)}
          </div>
          
          ${artworkData['Artist Bio'] ? `
            <div class="artist-bio-section">
              <h4>About the Artist</h4>
              <p class="artist-bio">${artworkData['Artist Bio']}</p>
            </div>
          ` : ''}
          
          <div class="artwork-actions">
            <button class="btn btn-primary" type="button" onclick="window.open('${artworkData.ImageURL || artworkData.url}', '_blank')">
              View on MoMA
            </button>
            <button class="btn btn-secondary share-btn" type="button">
              Share Artwork
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners for new buttons
    this.setupModalInteractions(modal, artworkData);
  }
  
  createMetadataSection(artworkData) {
    const metadata = [
      { label: 'Medium', value: artworkData.Medium },
      { label: 'Dimensions', value: artworkData.Dimensions },
      { label: 'Nationality', value: artworkData.Nationality },
      { label: 'Year', value: artworkData.Year }
    ].filter(item => item.value);
    
    if (metadata.length === 0) return '';
    
    return `
      <dl class="metadata-grid">
        ${metadata.map(item => `
          <dt class="metadata-label">${item.label}</dt>
          <dd class="metadata-value">${item.value}</dd>
        `).join('')}
      </dl>
    `;
  }
  
  setupModalInteractions(modal, artworkData) {
    // Fullscreen image viewer
    const fullscreenBtn = modal.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.showFullscreenImage(artworkData.url, artworkData.Title);
      });
    }
    
    // Share functionality
    const shareBtn = modal.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareArtwork(artworkData);
      });
    }
    
    // Image lazy loading with animation
    const image = modal.querySelector('.premium-artwork-image');
    if (image) {
      image.addEventListener('load', () => {
        image.classList.add('loaded');
      });
    }
  }
  
  showModalWithAnimation(modal) {
    modal.style.display = 'flex';
    modal.offsetHeight; // Force reflow
    
    // Add entrance animation
    modal.classList.add('visible');
    modal.querySelector('.modal').classList.add('spring-in');
    
    // Focus management
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add to browser history
    history.pushState({ modal: 'artwork' }, '', '#artwork-details');
  }
  
  hideModalWithAnimation(modal) {
    modal.classList.remove('visible');
    modal.querySelector('.modal').classList.add('spring-out');
    
    setTimeout(() => {
      modal.style.display = 'none';
      modal.querySelector('.modal').classList.remove('spring-in', 'spring-out');
      document.body.style.overflow = '';
      
      // Update browser history
      if (history.state && history.state.modal === 'artwork') {
        history.back();
      }
    }, 300);
  }
  
  showFilterTransition(era) {
    // Add transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'filter-transition-overlay';
    overlay.innerHTML = `
      <div class="transition-content">
        <div class="transition-spinner"></div>
        <p>Filtering to ${this.getEraDisplayName(era)}...</p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('visible'), 10);
    
    // Store reference for cleanup
    this.currentTransitionOverlay = overlay;
  }
  
  completeFilterTransition(era) {
    if (this.currentTransitionOverlay) {
      this.currentTransitionOverlay.classList.remove('visible');
      
      setTimeout(() => {
        if (this.currentTransitionOverlay) {
          this.currentTransitionOverlay.remove();
          this.currentTransitionOverlay = null;
        }
      }, 300);
    }
    
    // Show success notification
    this.showNotification(`Now showing: ${this.getEraDisplayName(era)}`, 'success');
  }
  
  getEraDisplayName(era) {
    const names = {
      all: 'All Eras',
      early: 'Early Fluxus (1953-1963)',
      middle: 'Core Fluxus (1964-1973)',
      late: 'Late Fluxus (1974-1984)'
    };
    return names[era] || 'Unknown Era';
  }
  
  showViewResetAnimation() {
    // Create reset animation indicator
    const indicator = document.createElement('div');
    indicator.className = 'view-reset-indicator';
    indicator.innerHTML = `
      <div class="reset-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2V6L16 2L12 2Z"/>
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"/>
        </svg>
      </div>
      <span>Resetting View</span>
    `;
    
    document.body.appendChild(indicator);
    setTimeout(() => indicator.classList.add('visible'), 10);
    
    // Store for cleanup
    this.currentResetIndicator = indicator;
  }
  
  completeViewResetAnimation() {
    if (this.currentResetIndicator) {
      this.currentResetIndicator.classList.remove('visible');
      
      setTimeout(() => {
        if (this.currentResetIndicator) {
          this.currentResetIndicator.remove();
          this.currentResetIndicator = null;
        }
      }, 1000);
    }
  }
  
  addSpriteSelectionEffects(sprite) {
    // Add selection ripple effect
    this.createSelectionRipple(sprite);
    
    // Add temporary glow effect
    this.addSpriteGlow(sprite);
  }
  
  createSelectionRipple(sprite) {
    // Create ripple effect at sprite position
    // This would integrate with the Three.js scene
    if (window.scene && sprite.position) {
      const rippleGeometry = new THREE.RingGeometry(1, 2, 32);
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0x007aff,
        transparent: true,
        opacity: 0.8
      });
      
      const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
      ripple.position.copy(sprite.position);
      ripple.position.y += 0.1; // Slightly above the sprite
      
      window.scene.add(ripple);
      
      // Animate ripple
      const startTime = performance.now();
      const duration = 1000;
      
      const animateRipple = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
          ripple.scale.setScalar(1 + progress * 2);
          ripple.material.opacity = 0.8 * (1 - progress);
          requestAnimationFrame(animateRipple);
        } else {
          window.scene.remove(ripple);
        }
      };
      
      requestAnimationFrame(animateRipple);
    }
  }
  
  addSpriteGlow(sprite) {
    // Add temporary glow effect to selected sprite
    if (sprite.material) {
      const originalColor = sprite.material.color.clone();
      const glowColor = new THREE.Color(0x007aff);
      
      // Animate glow
      const startTime = performance.now();
      const duration = 500;
      
      const animateGlow = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
          const t = Math.sin(progress * Math.PI); // Smooth in-out
          sprite.material.color.lerpColors(originalColor, glowColor, t * 0.3);
          requestAnimationFrame(animateGlow);
        } else {
          sprite.material.color.copy(originalColor);
        }
      };
      
      requestAnimationFrame(animateGlow);
    }
  }
  
  showFullscreenImage(imageUrl, title) {
    // Create fullscreen image viewer
    const fullscreenViewer = document.createElement('div');
    fullscreenViewer.className = 'fullscreen-image-viewer';
    fullscreenViewer.innerHTML = `
      <div class="fullscreen-backdrop">
        <div class="fullscreen-content">
          <div class="fullscreen-header">
            <h3 class="fullscreen-title">${title || 'Artwork'}</h3>
            <button class="fullscreen-close" type="button" aria-label="Close fullscreen">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="fullscreen-image-container">
            <img src="${imageUrl}" alt="${title || 'Artwork'}" class="fullscreen-image">
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(fullscreenViewer);
    
    // Add event listeners
    const closeBtn = fullscreenViewer.querySelector('.fullscreen-close');
    const backdrop = fullscreenViewer.querySelector('.fullscreen-backdrop');
    
    closeBtn.addEventListener('click', () => this.closeFullscreenImage(fullscreenViewer));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.closeFullscreenImage(fullscreenViewer);
    });
    
    // Keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.closeFullscreenImage(fullscreenViewer);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Show with animation
    setTimeout(() => fullscreenViewer.classList.add('visible'), 10);
  }
  
  closeFullscreenImage(viewer) {
    viewer.classList.remove('visible');
    setTimeout(() => viewer.remove(), 300);
  }
  
  shareArtwork(artworkData) {
    const shareData = {
      title: `${artworkData.Title} by ${artworkData.Artist}`,
      text: `Check out this artwork from the Fluxus movement: ${artworkData.Title} by ${artworkData.Artist}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(err => {
        console.log('Error sharing:', err);
        this.fallbackShare(shareData);
      });
    } else {
      this.fallbackShare(shareData);
    }
  }
  
  fallbackShare(shareData) {
    // Copy link to clipboard
    navigator.clipboard.writeText(shareData.url).then(() => {
      this.showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
      // Show share options modal
      this.showShareModal(shareData);
    });
  }
  
  showShareModal(shareData) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal-backdrop';
    shareModal.innerHTML = `
      <div class="share-modal">
        <h3>Share this artwork</h3>
        <div class="share-options">
          <button class="share-option" data-platform="twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
            Twitter
          </button>
          <button class="share-option" data-platform="facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
            Facebook
          </button>
          <button class="share-option" data-platform="copy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0V2a2 2 0 00-2-2H10a2 2 0 00-2 2v2m8 0H8"/>
            </svg>
            Copy Link
          </button>
        </div>
        <button class="share-close">Close</button>
      </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // Add event listeners
    shareModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('share-modal-backdrop') || 
          e.target.classList.contains('share-close')) {
        shareModal.remove();
      }
      
      if (e.target.closest('.share-option')) {
        const platform = e.target.closest('.share-option').dataset.platform;
        this.handleShare(platform, shareData);
        shareModal.remove();
      }
    });
    
    setTimeout(() => shareModal.classList.add('visible'), 10);
  }
  
  handleShare(platform, shareData) {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      copy: null // Handle separately
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareData.url).then(() => {
        this.showNotification('Link copied to clipboard!', 'success');
      });
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  }
  
  updateBrowserHistory(artworkData) {
    const state = {
      artwork: {
        id: artworkData.ObjectID || artworkData.Title,
        title: artworkData.Title,
        artist: artworkData.Artist
      }
    };
    
    const url = `#artwork/${encodeURIComponent(artworkData.Title || 'untitled')}`;
    history.pushState(state, artworkData.Title, url);
  }
  
  handleResponsiveResize() {
    // Adjust UI elements based on screen size
    const width = window.innerWidth;
    const sidebar = document.getElementById('sidebar-panel');
    const main = document.getElementById('main');
    
    if (width <= 768) {
      // Mobile layout adjustments
      if (sidebar) {
        sidebar.style.transform = sidebar.classList.contains('visible') ? 
          'translateY(0)' : 'translateY(100%)';
      }
      if (main) {
        main.style.right = '0';
      }
    } else {
      // Desktop layout
      if (sidebar) {
        sidebar.style.transform = sidebar.classList.contains('visible') ? 
          'translateX(0)' : 'translateX(100%)';
      }
      if (main) {
        main.style.right = sidebar && sidebar.classList.contains('visible') ? '320px' : '0';
      }
    }
  }
  
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `premium-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${this.getNotificationIcon(type)}
        </div>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('visible'), 10);
    
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  getNotificationIcon(type) {
    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };
    return icons[type] || icons.info;
  }
  
  optimizePerformance() {
    // Implement performance optimizations
    this.setupIntersectionObserver();
    this.setupLazyLoading();
    this.setupImageOptimization();
  }
  
  setupIntersectionObserver() {
    // Optimize animations based on visibility
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        } else {
          entry.target.classList.remove('in-viewport');
        }
      });
    }, { threshold: 0.1 });
    
    // Observe elements for performance optimization
    document.querySelectorAll('.card, .sidebar-section, .modal').forEach(el => {
      observer.observe(el);
    });
  }
  
  setupLazyLoading() {
    // Implement lazy loading for images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loading');
            
            img.onload = () => {
              img.classList.remove('loading');
              img.classList.add('loaded');
            };
            
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  setupImageOptimization() {
    // Optimize images based on device capabilities
    const isHighDPI = window.devicePixelRatio > 1;
    const isSlowConnection = navigator.connection && navigator.connection.effectiveType === 'slow-2g';
    
    if (isSlowConnection) {
      // Use lower quality images for slow connections
      document.documentElement.classList.add('slow-connection');
    }
    
    if (isHighDPI) {
      // Use high-DPI images where appropriate
      document.documentElement.classList.add('high-dpi');
    }
  }
}

// CSS for premium integration features
const integrationStyles = `
  /* Premium Modal Styles */
  .premium-modal-backdrop {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .premium-modal-backdrop.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .premium-artwork-modal {
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-2xl);
  }
  
  .premium-modal-body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 0;
  }
  
  .premium-artwork-layout {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6);
  }
  
  @media (min-width: 768px) {
    .premium-artwork-layout {
      flex-direction: row;
      align-items: flex-start;
    }
  }
  
  .artwork-image-container {
    position: relative;
    flex: 0 0 auto;
    max-width: 400px;
  }
  
  .premium-artwork-image {
    width: 100%;
    height: auto;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .premium-artwork-image.loaded {
    opacity: 1;
  }
  
  .image-overlay {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .artwork-image-container:hover .image-overlay {
    opacity: 1;
  }
  
  .fullscreen-btn {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-2);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .fullscreen-btn:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
  
  .artwork-details {
    flex: 1;
    min-width: 0;
  }
  
  .artwork-header {
    margin-bottom: var(--space-6);
  }
  
  .artwork-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-2);
    line-height: var(--leading-tight);
  }
  
  .artwork-meta-line {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
    flex-wrap: wrap;
  }
  
  .artist-name {
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--color-text-secondary);
  }
  
  .artwork-date {
    font-size: var(--text-base);
    color: var(--color-text-tertiary);
  }
  
  .metadata-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-2) var(--space-4);
    margin-bottom: var(--space-6);
  }
  
  .metadata-label {
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
  }
  
  .metadata-value {
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    margin: 0;
  }
  
  .artist-bio-section {
    margin-bottom: var(--space-6);
  }
  
  .artist-bio-section h4 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-3);
  }
  
  .artist-bio {
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    color: var(--color-text-secondary);
    margin: 0;
  }
  
  .artwork-actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  
  /* Fullscreen Image Viewer */
  .fullscreen-image-viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .fullscreen-image-viewer.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .fullscreen-backdrop {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    flex-direction: column;
  }
  
  .fullscreen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    background: rgba(0, 0, 0, 0.8);
  }
  
  .fullscreen-title {
    color: white;
    font-size: var(--text-lg);
    font-weight: 600;
    margin: 0;
  }
  
  .fullscreen-close {
    background: none;
    border: none;
    color: white;
    font-size: var(--text-xl);
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-lg);
    transition: background-color 0.2s ease;
  }
  
  .fullscreen-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .fullscreen-image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
  }
  
  .fullscreen-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-2xl);
  }
  
  /* Transition Effects */
  .filter-transition-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .filter-transition-overlay.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .transition-content {
    background: var(--color-bg-primary);
    padding: var(--space-6);
    border-radius: var(--radius-xl);
    text-align: center;
    box-shadow: var(--shadow-2xl);
  }
  
  .transition-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-bg-tertiary);
    border-top: 3px solid var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-4);
  }
  
  .view-reset-indicator {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--glass-bg-dark);
    color: white;
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    z-index: 9997;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  
  .view-reset-indicator.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .reset-icon {
    animation: spin 2s linear infinite;
  }
  
  /* Premium Notifications */
  .premium-notification {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    padding: var(--space-4);
    box-shadow: var(--shadow-xl);
    z-index: 9996;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 400px;
  }
  
  .premium-notification.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .premium-notification.success {
    border-left: 4px solid var(--color-success);
  }
  
  .premium-notification.error {
    border-left: 4px solid var(--color-error);
  }
  
  .premium-notification.info {
    border-left: 4px solid var(--color-accent);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .notification-icon {
    flex-shrink: 0;
  }
  
  .notification-message {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  /* Share Modal */
  .share-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9995;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .share-modal-backdrop.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .share-modal {
    background: var(--color-bg-primary);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    box-shadow: var(--shadow-2xl);
    max-width: 400px;
    width: 90%;
  }
  
  .share-modal h3 {
    margin: 0 0 var(--space-4);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .share-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }
  
  .share-option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--color-bg-secondary);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  .share-option:hover {
    background: var(--color-bg-tertiary);
    transform: translateX(4px);
  }
  
  .share-close {
    width: 100%;
    padding: var(--space-3);
    background: var(--color-bg-secondary);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: all 0.2s ease;
  }
  
  .share-close:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }
  
  /* Performance Optimizations */
  .slow-connection img {
    filter: blur(1px);
    transition: filter 0.3s ease;
  }
  
  .slow-connection img.loaded {
    filter: none;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .premium-notification,
    .filter-transition-overlay,
    .view-reset-indicator {
      transition: none;
    }
    
    .transition-spinner,
    .reset-icon {
      animation: none;
    }
  }
`;

// Initialize integration
let fluxusIntegration;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fluxusIntegration = new FluxusIntegration();
  });
} else {
  fluxusIntegration = new FluxusIntegration();
}

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = integrationStyles;
document.head.appendChild(styleSheet);

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.modal) {
    // Handle modal state changes
    const modal = document.getElementById('premium-artwork-modal');
    if (modal && modal.classList.contains('visible')) {
      fluxusIntegration.hideModalWithAnimation(modal);
    }
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FluxusIntegration;
}

// Make available globally
window.FluxusIntegration = FluxusIntegration;
// enhanced-interactions.js
// Premium UI interactions for Fluxus Mosaic Explorer

class PremiumFluxusExperience {
  constructor() {
    this.isInitialized = false;
    this.animations = new Map();
    this.touchGestures = new TouchGestureHandler();
    this.soundEffects = new SoundManager();
    this.performanceMonitor = new PerformanceMonitor();
    
    this.init();
  }
  
  init() {
    if (this.isInitialized) return;
    
    this.setupPremiumInteractions();
    this.setupAdvancedAnimations();
    this.setupHapticFeedback();
    this.setupAccessibilityEnhancements();
    this.setupPerformanceOptimizations();
    
    this.isInitialized = true;
    console.log('Premium Fluxus Experience initialized');
  }
  
  setupPremiumInteractions() {
    // Enhanced hover states with micro-animations
    this.setupEnhancedHoverStates();
    
    // Smooth spring-based animations for UI elements
    this.setupSpringAnimations();
    
    // Advanced loading states with skeleton screens
    this.setupAdvancedLoadingStates();
    
    // Premium modal transitions
    this.setupPremiumModals();
  }
  
  setupEnhancedHoverStates() {
    // Create a style element for dynamic hover effects
    const hoverStyles = document.createElement('style');
    hoverStyles.textContent = `
      .premium-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, box-shadow, filter;
      }
      
      .premium-hover:hover {
        transform: translateY(-2px) scale(1.02);
        filter: brightness(1.05) saturate(1.1);
        box-shadow: 
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04),
          0 0 0 1px rgba(255, 255, 255, 0.05);
      }
      
      .premium-button {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, var(--color-accent) 0%, #0056b3 100%);
      }
      
      .premium-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      
      .premium-button:hover::before {
        left: 100%;
      }
      
      .glass-morphism {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 
          0 8px 32px 0 rgba(31, 38, 135, 0.37),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(hoverStyles);
    
    // Apply premium hover effects to interactive elements
    document.querySelectorAll('.btn, .card, .nav-link').forEach(el => {
      el.classList.add('premium-hover');
    });
    
    document.querySelectorAll('.btn-primary').forEach(el => {
      el.classList.add('premium-button');
    });
  }
  
  setupSpringAnimations() {
    // Spring animation utility using CSS custom properties
    const springConfig = {
      tension: 170,
      friction: 26,
      precision: 0.01
    };
    
    // Create spring animation keyframes
    const springKeyframes = `
      @keyframes spring-in {
        0% {
          transform: scale(0.8) translateY(20px);
          opacity: 0;
        }
        60% {
          transform: scale(1.05) translateY(-5px);
          opacity: 0.8;
        }
        100% {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes spring-out {
        0% {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        100% {
          transform: scale(0.8) translateY(20px);
          opacity: 0;
        }
      }
      
      @keyframes gentle-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      .spring-in {
        animation: spring-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      
      .spring-out {
        animation: spring-out 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53);
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = springKeyframes;
    document.head.appendChild(styleSheet);
  }
  
  setupAdvancedLoadingStates() {
    // Create skeleton loader components
    const createSkeletonLoader = (container) => {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-loader';
      skeleton.innerHTML = `
        <div class="skeleton-header">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line skeleton-line-title"></div>
            <div class="skeleton-line skeleton-line-subtitle"></div>
          </div>
        </div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line-short"></div>
        </div>
      `;
      
      container.appendChild(skeleton);
      return skeleton;
    };
    
    // Enhanced loading styles
    const skeletonStyles = `
      .skeleton-loader {
        padding: 20px;
        animation: pulse 1.5s ease-in-out infinite alternate;
      }
      
      .skeleton-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      
      .skeleton-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      .skeleton-lines {
        flex: 1;
      }
      
      .skeleton-line {
        height: 12px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        border-radius: 6px;
        margin-bottom: 8px;
        animation: shimmer 2s infinite;
      }
      
      .skeleton-line-title {
        width: 70%;
        height: 16px;
      }
      
      .skeleton-line-subtitle {
        width: 50%;
        height: 12px;
      }
      
      .skeleton-line-short {
        width: 60%;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        100% { opacity: 0.7; }
      }
    `;
    
    const skeletonStyleSheet = document.createElement('style');
    skeletonStyleSheet.textContent = skeletonStyles;
    document.head.appendChild(skeletonStyleSheet);
    
    // Replace loading overlay with skeleton screens
    this.enhanceLoading = (container) => {
      const skeleton = createSkeletonLoader(container);
      return {
        remove: () => skeleton.remove()
      };
    };
  }
  
  setupPremiumModals() {
    // Enhanced modal system with better animations and accessibility
    class PremiumModal {
      constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.backdrop = this.modal?.closest('.modal-backdrop');
        this.isOpen = false;
        
        if (this.modal) {
          this.setupPremiumModal();
        }
      }
      
      setupPremiumModal() {
        // Add premium modal styles
        this.modal.style.transform = 'translate(-50%, -50%) scale(0.8)';
        this.modal.style.opacity = '0';
        this.modal.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        // Enhanced backdrop
        if (this.backdrop) {
          this.backdrop.style.backdropFilter = 'blur(10px) saturate(150%)';
          this.backdrop.style.background = 'rgba(0, 0, 0, 0.4)';
        }
      }
      
      async open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        
        if (this.backdrop) {
          this.backdrop.classList.add('visible');
          this.backdrop.style.opacity = '0';
          
          // Animate backdrop
          await this.animateElement(this.backdrop, { opacity: 1 }, 300);
        }
        
        // Animate modal with spring effect
        this.modal.style.transform = 'translate(-50%, -50%) scale(1)';
        this.modal.style.opacity = '1';
        
        // Add gentle entrance animation
        this.modal.style.animation = 'spring-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        // Focus management
        const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          firstFocusable.focus();
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      }
      
      async close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Animate modal out
        this.modal.style.transform = 'translate(-50%, -50%) scale(0.8)';
        this.modal.style.opacity = '0';
        this.modal.style.animation = 'spring-out 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
        
        // Animate backdrop
        if (this.backdrop) {
          await this.animateElement(this.backdrop, { opacity: 0 }, 200);
          this.backdrop.classList.remove('visible');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
      }
      
      animateElement(element, properties, duration) {
        return new Promise(resolve => {
          const startTime = performance.now();
          const startProperties = {};
          
          for (const prop in properties) {
            startProperties[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
          }
          
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            for (const prop in properties) {
              const start = startProperties[prop];
              const end = properties[prop];
              const current = start + (end - start) * easeProgress;
              element.style[prop] = current;
            }
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          
          requestAnimationFrame(animate);
        });
      }
    }
    
    // Initialize premium modals
    this.modals = new Map();
    document.querySelectorAll('[id$="-modal"]').forEach(modal => {
      const modalId = modal.id;
      this.modals.set(modalId, new PremiumModal(modalId));
    });
  }
  
  setupHapticFeedback() {
    // Haptic feedback for supported devices
    this.haptic = {
      light: () => {
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      },
      medium: () => {
        if (navigator.vibrate) {
          navigator.vibrate(20);
        }
      },
      heavy: () => {
        if (navigator.vibrate) {
          navigator.vibrate([20, 10, 20]);
        }
      }
    };
    
    // Add haptic feedback to interactive elements
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', () => this.haptic.light());
    });
    
    document.querySelectorAll('.era-btn').forEach(btn => {
      btn.addEventListener('click', () => this.haptic.medium());
    });
  }
  
  setupAccessibilityEnhancements() {
    // Enhanced screen reader support
    this.announceChanges = (message) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };
    
    // Keyboard navigation improvements
    this.setupKeyboardNavigation();
    
    // Focus management
    this.setupFocusManagement();
    
    // High contrast mode detection
    this.setupHighContrastMode();
  }
  
  setupKeyboardNavigation() {
    // Enhanced keyboard navigation with visual indicators
    let currentFocusIndex = -1;
    const focusableElements = [];
    
    const updateFocusableElements = () => {
      focusableElements.length = 0;
      focusableElements.push(...document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
    };
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        updateFocusableElements();
        
        if (e.shiftKey) {
          currentFocusIndex = Math.max(0, currentFocusIndex - 1);
        } else {
          currentFocusIndex = Math.min(focusableElements.length - 1, currentFocusIndex + 1);
        }
      }
    });
    
    // Visual focus indicators
    const focusStyles = `
      .focus-visible {
        outline: 2px solid var(--color-accent) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2) !important;
      }
    `;
    
    const focusStyleSheet = document.createElement('style');
    focusStyleSheet.textContent = focusStyles;
    document.head.appendChild(focusStyleSheet);
  }
  
  setupFocusManagement() {
    // Trap focus within modals
    document.addEventListener('focusin', (e) => {
      const activeModal = document.querySelector('.modal-backdrop.visible');
      if (activeModal && !activeModal.contains(e.target)) {
        const firstFocusable = activeModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    });
  }
  
  setupHighContrastMode() {
    // Detect and adapt to high contrast mode
    const highContrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const applyHighContrastMode = (matches) => {
      if (matches) {
        document.body.classList.add('high-contrast-mode');
        
        const highContrastStyles = `
          .high-contrast-mode .btn {
            border: 2px solid currentColor !important;
          }
          
          .high-contrast-mode .card {
            border: 2px solid currentColor !important;
          }
          
          .high-contrast-mode .nav-link.active {
            background-color: var(--color-text-primary) !important;
            color: var(--color-bg-primary) !important;
          }
        `;
        
        const contrastStyleSheet = document.createElement('style');
        contrastStyleSheet.textContent = highContrastStyles;
        document.head.appendChild(contrastStyleSheet);
      }
    };
    
    applyHighContrastMode(highContrastMediaQuery.matches);
    highContrastMediaQuery.addEventListener('change', (e) => applyHighContrastMode(e.matches));
  }
  
  setupPerformanceOptimizations() {
    // Intersection Observer for lazy loading and animations
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          this.intersectionObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    // Observe elements for entrance animations
    document.querySelectorAll('.card, .sidebar-section').forEach(el => {
      this.intersectionObserver.observe(el);
    });
    
    // Performance monitoring
    this.performanceMonitor.start();
  }
  
  // Public API methods
  showArtworkDetails(artworkData) {
    const modal = this.modals.get('artwork-modal');
    if (modal && window.fluxusUI) {
      window.fluxusUI.showArtworkDetails(artworkData);
      modal.open();
      this.haptic.medium();
      this.announceChanges(`Opened details for ${artworkData.Title || 'artwork'} by ${artworkData.Artist || 'unknown artist'}`);
    }
  }
  
  filterByEra(era) {
    // Enhanced era filtering with smooth transitions
    const eraNames = {
      all: 'all eras',
      early: 'early Fluxus period (1953-1963)',
      middle: 'core Fluxus period (1964-1973)', 
      late: 'late Fluxus period (1974-1984)'
    };
    
    this.announceChanges(`Filtering to show ${eraNames[era]}`);
    this.haptic.light();
    
    // Call the original filtering function
    if (window.filterByEra) {
      window.filterByEra(era);
    }
  }
  
  resetView() {
    if (window.resetView) {
      window.resetView();
      this.announceChanges('View reset to default position');
      this.haptic.medium();
    }
  }
}

// Touch Gesture Handler for mobile interactions
class TouchGestureHandler {
  constructor() {
    this.gestures = new Map();
    this.setupTouchGestures();
  }
  
  setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const deltaTime = touchEndTime - touchStartTime;
        
        // Detect swipe gestures
        if (Math.abs(deltaX) > 50 && deltaTime < 300) {
          if (deltaX > 0) {
            this.onSwipeRight();
          } else {
            this.onSwipeLeft();
          }
        }
        
        // Detect double tap
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
          if (this.lastTapTime && (touchEndTime - this.lastTapTime) < 300) {
            this.onDoubleTap(e.changedTouches[0]);
          }
          this.lastTapTime = touchEndTime;
        }
      }
    }, { passive: true });
  }
  
  onSwipeLeft() {
    // Toggle sidebar on mobile
    const sidebar = document.getElementById('sidebar-panel');
    if (sidebar && window.innerWidth <= 768) {
      sidebar.classList.remove('visible');
    }
  }
  
  onSwipeRight() {
    // Show sidebar on mobile
    const sidebar = document.getElementById('sidebar-panel');
    if (sidebar && window.innerWidth <= 768) {
      sidebar.classList.add('visible');
    }
  }
  
  onDoubleTap(touch) {
    // Reset view on double tap
    if (window.resetView) {
      window.resetView();
    }
  }
}

// Sound Manager for audio feedback
class SoundManager {
  constructor() {
    this.enabled = false;
    this.audioContext = null;
    this.sounds = new Map();
    this.init();
  }
  
  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createSounds();
    } catch (error) {
      console.log('Audio not supported');
    }
  }
  
  createSounds() {
    // Create subtle UI sounds
    this.sounds.set('click', this.createTone(800, 0.1, 0.05));
    this.sounds.set('hover', this.createTone(1000, 0.05, 0.03));
    this.sounds.set('success', this.createTone(600, 0.15, 0.1));
    this.sounds.set('error', this.createTone(300, 0.2, 0.15));
  }
  
  createTone(frequency, duration, volume) {
    return () => {
      if (!this.enabled || !this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }
  
  play(soundName) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound();
    }
  }
  
  enable() {
    this.enabled = true;
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
  
  disable() {
    this.enabled = false;
  }
}

// Performance Monitor
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0
    };
    this.isMonitoring = false;
  }
  
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    
    this.monitor();
  }
  
  monitor() {
    if (!this.isMonitoring) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameCount++;
    
    if (deltaTime >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.metrics.frameTime = Math.round(deltaTime / this.frameCount);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Memory usage (if available)
      if (performance.memory) {
        this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
      }
      
      // Log performance warnings
      if (this.metrics.fps < 30) {
        console.warn('Low FPS detected:', this.metrics.fps);
      }
    }
    
    requestAnimationFrame(() => this.monitor());
  }
  
  stop() {
    this.isMonitoring = false;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}

// Particle System for visual effects
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;
  }
  
  createParticle(x, y, type = 'click') {
    const particle = {
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      decay: 0.02,
      size: Math.random() * 3 + 1,
      color: type === 'click' ? '#007aff' : '#34c759',
      type
    };
    
    this.particles.push(particle);
    
    if (!this.isRunning) {
      this.start();
    }
  }
  
  start() {
    this.isRunning = true;
    this.animate();
  }
  
  animate() {
    if (!this.isRunning || this.particles.length === 0) {
      this.isRunning = false;
      return;
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.vy += 0.1; // Gravity
      
      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  stop() {
    this.isRunning = false;
    this.particles = [];
  }
}

// Enhanced Loading Manager
class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
    this.totalItems = 0;
    this.loadedItems = 0;
    this.onProgress = null;
    this.onComplete = null;
  }
  
  startLoading(itemId, description = '') {
    this.loadingStates.set(itemId, {
      description,
      startTime: performance.now(),
      completed: false
    });
    this.totalItems++;
    this.updateProgress();
  }
  
  completeLoading(itemId) {
    const state = this.loadingStates.get(itemId);
    if (state && !state.completed) {
      state.completed = true;
      state.endTime = performance.now();
      this.loadedItems++;
      this.updateProgress();
      
      if (this.loadedItems === this.totalItems && this.onComplete) {
        this.onComplete();
      }
    }
  }
  
  updateProgress() {
    const progress = this.totalItems > 0 ? this.loadedItems / this.totalItems : 0;
    if (this.onProgress) {
      this.onProgress(progress, this.loadedItems, this.totalItems);
    }
  }
  
  reset() {
    this.loadingStates.clear();
    this.totalItems = 0;
    this.loadedItems = 0;
  }
  
  getAverageLoadTime() {
    const completedItems = Array.from(this.loadingStates.values())
      .filter(state => state.completed && state.endTime);
    
    if (completedItems.length === 0) return 0;
    
    const totalTime = completedItems.reduce((sum, state) => 
      sum + (state.endTime - state.startTime), 0);
    
    return totalTime / completedItems.length;
  }
}

// Initialize Premium Experience
let premiumExperience;

// Integration with existing front.js
window.addEventListener('DOMContentLoaded', () => {
  premiumExperience = new PremiumFluxusExperience();
  
  // Make premium experience available globally
  window.premiumExperience = premiumExperience;
  
  // Override existing functions with enhanced versions
  const originalFilterByEra = window.filterByEra;
  window.filterByEra = (era) => {
    premiumExperience.filterByEra(era);
    if (originalFilterByEra) {
      originalFilterByEra(era);
    }
  };
  
  const originalResetView = window.resetView;
  window.resetView = () => {
    premiumExperience.resetView();
    if (originalResetView) {
      originalResetView();
    }
  };
  
  // Enhanced artwork selection
  const originalOnSpriteSelected = window.on_sprite_selected;
  window.on_sprite_selected = (sprite) => {
    if (originalOnSpriteSelected) {
      originalOnSpriteSelected(sprite);
    }
    
    // Add premium enhancements
    if (sprite.image_info) {
      premiumExperience.showArtworkDetails(sprite.image_info);
    }
  };
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PremiumFluxusExperience;
}

// CSS for enhanced animations and effects
const enhancedAnimationStyles = `
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-in {
    animation: animate-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .particle-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  }
  
  .premium-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 
      0 8px 32px 0 rgba(31, 38, 135, 0.37),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .loading-progress {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(0, 122, 255, 0.2);
    z-index: 9999;
    overflow: hidden;
  }
  
  .loading-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #007aff, #34c759);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .performance-indicator {
    position: fixed;
    top: 70px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .performance-indicator.visible {
    opacity: 1;
  }
`;

// Inject enhanced styles
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedAnimationStyles;
document.head.appendChild(styleSheet);
/**
 * Main Application Class - Orchestrates all components
 */
class StickerCropperApp {
  constructor() {
    this.canvasManager = null;
    this.gridManager = null;
    this.stickerManager = null;
    this.eventManager = null;
    this.messageManager = null;
    this.deferredPrompt = null;
    this.isOnline = navigator.onLine;
    
    this.elements = {};
    this.initialize();
  }

  initialize() {
    this.setupElements();
    this.setupManagers();
    this.setupEventListeners();
    this.setupPWA();
    this.setupOfflineSupport();
    this.loadDefaultImage();
  }

  setupElements() {
    this.elements = {
      imageInput: document.getElementById('imageInput'),
      fileName: document.getElementById('fileName'),
      gridRows: document.getElementById('gridRows'),
      gridCols: document.getElementById('gridCols'),
      resetGridBtn: document.getElementById('resetGridBtn'),
      selectAllBtn: document.getElementById('selectAllBtn'),
      cropSelectedBtn: document.getElementById('cropSelectedBtn'),
      clearSelectionBtn: document.getElementById('clearSelectionBtn'),
      downloadZipBtn: document.getElementById('downloadZipBtn'),
      clearStickersBtn: document.getElementById('clearStickersBtn')
    };
  }

  setupManagers() {
    this.canvasManager = new CanvasManager('imageCanvas', 'canvasContainer');
    this.gridManager = new GridManager(3, 3);
    this.stickerManager = new StickerManager('croppedStickersPreview', 'stickerCount');
    this.eventManager = new EventManager(
      this.canvasManager, 
      this.gridManager, 
      this.stickerManager,
      () => this.updateSelectAllButton()
    );
    this.messageManager = new MessageManager();
  }

  setupEventListeners() {
    // File input
    this.elements.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

    // Grid controls
    this.elements.gridRows.addEventListener('input', () => this.handleGridSizeChange());
    this.elements.gridCols.addEventListener('input', () => this.handleGridSizeChange());
    this.elements.resetGridBtn.addEventListener('click', () => this.handleResetGrid());

    // Selection controls
    this.elements.selectAllBtn.addEventListener('click', () => this.handleSelectAll());
    this.elements.cropSelectedBtn.addEventListener('click', () => this.handleCropSelected());
    this.elements.clearSelectionBtn.addEventListener('click', () => this.handleClearSelection());

    // Download controls
    this.elements.downloadZipBtn.addEventListener('click', () => this.handleDownloadZip());
    this.elements.clearStickersBtn.addEventListener('click', () => this.handleClearStickers());

    // Update button states when stickers change
    this.observeStickerChanges();
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      this.elements.fileName.textContent = '';
      this.resetApplication();
      return;
    }

    this.elements.fileName.textContent = `Selected: ${file.name}`;
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        await this.loadImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      this.messageManager.showError('Failed to load image. Please try again.');
      console.error('Image upload error:', error);
    }
  }

  async loadImage(imageSrc) {
    try {
      await this.canvasManager.loadImage(imageSrc);
      this.gridManager.clearSelection();
      this.stickerManager.clearAll();
      this.canvasManager.drawGrid(this.gridManager);
      this.updateButtonStates();
    } catch (error) {
      this.messageManager.showError('Failed to load image. Please check the file format.');
      console.error('Image load error:', error);
    }
  }

  handleGridSizeChange() {
    const rows = parseInt(this.elements.gridRows.value);
    const cols = parseInt(this.elements.gridCols.value);
    
    this.gridManager.updateGridSize(rows, cols);
    this.canvasManager.drawGrid(this.gridManager);
    this.updateSelectAllButton();
    
    // If default image is loaded, regenerate it for new grid size
    if (this.elements.fileName.textContent.includes('Default')) {
      this.loadGeneratedDefaultImage();
    }
  }

  handleResetGrid() {
    this.gridManager.resetGrid();
    this.canvasManager.drawGrid(this.gridManager);
    this.updateSelectAllButton();
  }

  handleSelectAll() {
    if (this.gridManager.isAllSelected()) {
      this.gridManager.deselectAllCells();
      this.updateSelectAllButton();
    } else {
      this.gridManager.selectAllCells();
      this.updateSelectAllButton();
    }
    this.canvasManager.drawGrid(this.gridManager);
  }

  handleCropSelected() {
    if (!this.gridManager.hasSelectedCells()) {
      this.messageManager.show('Please select some grid cells first.');
      return;
    }

    this.eventManager.cropSelectedCells();
    this.updateButtonStates();
  }

  handleClearSelection() {
    this.gridManager.clearSelection();
    this.canvasManager.drawGrid(this.gridManager);
    this.updateSelectAllButton();
  }

  async handleDownloadZip() {
    if (!this.stickerManager.hasStickers()) {
      this.messageManager.show('No stickers to download. Please create some first.');
      return;
    }

    try {
      this.messageManager.showLoading('Generating ZIP file...');
      await this.stickerManager.downloadAsZip();
      this.messageManager.hide();
      this.messageManager.showSuccess('ZIP file downloaded successfully!');
    } catch (error) {
      this.messageManager.showError('Failed to generate ZIP file. Please try again.');
      console.error('Download error:', error);
    }
  }

  handleClearStickers() {
    if (!this.stickerManager.hasStickers()) {
      return;
    }

    this.messageManager.showConfirm(
      'Are you sure you want to clear all stickers?',
      () => {
        this.stickerManager.clearAll();
        this.updateButtonStates();
      }
    );
  }

  resetApplication() {
    this.gridManager.clearSelection();
    this.stickerManager.clearAll();
    this.canvasManager.clearCanvas();
    this.updateButtonStates();
  }

  updateButtonStates() {
    const hasStickers = this.stickerManager.hasStickers();
    this.elements.downloadZipBtn.disabled = !hasStickers;
    this.elements.clearStickersBtn.disabled = !hasStickers;
    this.updateSelectAllButton();
  }

  updateSelectAllButton() {
    const selectAllBtn = this.elements.selectAllBtn;
    const iconSvg = selectAllBtn.querySelector('svg');
    const textNode = selectAllBtn.childNodes[selectAllBtn.childNodes.length - 1];
    
    if (this.gridManager.isAllSelected()) {
      iconSvg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
      textNode.textContent = ' Deselect All';
    } else {
      iconSvg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
      textNode.textContent = ' Select All';
    }
  }

  observeStickerChanges() {
    // Create a mutation observer to watch for changes in the sticker preview
    const observer = new MutationObserver(() => {
      this.updateButtonStates();
    });

    observer.observe(this.stickerManager.previewContainer, {
      childList: true,
      subtree: true
    });
  }

  async loadDefaultImage() {
    try {
      // Try to load the provided image first
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        await this.loadImage(img.src);
        this.elements.fileName.textContent = 'Default sticker sheet loaded';
      };
      
      img.onerror = () => {
        // Fallback to generated emoji grid
        this.loadGeneratedDefaultImage();
      };
      
      // img.src = '';
      this.loadGeneratedDefaultImage();
    } catch (error) {
      this.loadGeneratedDefaultImage();
    }
  }

  loadGeneratedDefaultImage() {
    const rows = parseInt(this.elements.gridRows.value);
    const cols = parseInt(this.elements.gridCols.value);
    
    const defaultCanvas = document.createElement('canvas');
    const defaultCtx = defaultCanvas.getContext('2d');
    
    // Make canvas size adequate - minimum 120px per cell to ensure visibility
    const minCellSize = 120;
    const maxCellSize = 200;
    const cellSize = Math.max(minCellSize, Math.min(maxCellSize, 800 / Math.max(rows, cols)));
    defaultCanvas.width = cols * cellSize;
    defaultCanvas.height = rows * cellSize;
    
    // Fill with white background
    defaultCtx.fillStyle = '#ffffff';
    defaultCtx.fillRect(0, 0, defaultCanvas.width, defaultCanvas.height);
    
    // Generate emojis for the grid
    const totalCells = rows * cols;
    const baseEmojis = ['😀', '😂', '😍', '🤔', '😴', '🤗', '😲', '😎', '😊', '🥳', '😋', '🤪', '😇', '🥺', '😜', '🤩', '😌', '😅', '😆', '🙃', '😉', '😊', '😍', '🤗', '😘', '😚', '😙', '😗', '🥰', '😻', '😽', '🙀', '😿', '😾', '🤖', '👻', '💀', '👽', '👾', '🤡', '💩', '🔥', '💫', '⭐', '🌟', '✨', '💥', '💢', '💯', '💤', '💨'];
    
    // Extend emojis array to cover all cells
    const emojis = [];
    for (let i = 0; i < totalCells; i++) {
      emojis.push(baseEmojis[i % baseEmojis.length]);
    }
    
    // Set font size proportional to cell size - make it bigger for better visibility
    const fontSize = Math.floor(cellSize * 0.7);
    defaultCtx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", serif`;
    defaultCtx.textAlign = 'center';
    defaultCtx.textBaseline = 'middle';
    
    // Draw grid of emojis
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const emoji = emojis[row * cols + col];
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Add subtle cell borders
        defaultCtx.strokeStyle = '#e5e7eb';
        defaultCtx.lineWidth = 1;
        defaultCtx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        
        // Draw emoji with better contrast
        defaultCtx.fillStyle = '#000000';
        defaultCtx.fillText(emoji, x, y);
        
        // Add a subtle shadow effect for better visibility
        defaultCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        defaultCtx.shadowBlur = 2;
        defaultCtx.shadowOffsetX = 1;
        defaultCtx.shadowOffsetY = 1;
        defaultCtx.fillText(emoji, x, y);
        
        // Reset shadow
        defaultCtx.shadowColor = 'transparent';
        defaultCtx.shadowBlur = 0;
        defaultCtx.shadowOffsetX = 0;
        defaultCtx.shadowOffsetY = 0;
      }
    }
    
    const dataURL = defaultCanvas.toDataURL();
    this.loadImage(dataURL);
    this.elements.fileName.textContent = `Default ${rows}×${cols} emoji grid loaded`;
  }

  setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.showUpdateAvailable();
                }
              });
            });
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.hideInstallButton();
    });
  }

  setupOfflineSupport() {
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showConnectionStatus('back online', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showConnectionStatus('offline', 'warning');
    });
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    if (!document.getElementById('installButton')) {
      const installButton = document.createElement('button');
      installButton.id = 'installButton';
      installButton.className = 'fixed bottom-4 right-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 z-50';
      installButton.innerHTML = '📱 Install App';
      installButton.onclick = () => this.installApp();
      document.body.appendChild(installButton);
    }
  }

  hideInstallButton() {
    const installButton = document.getElementById('installButton');
    if (installButton) {
      installButton.remove();
    }
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }

  showUpdateAvailable() {
    this.messageManager.showConfirm(
      'A new version of the app is available. Would you like to update now?',
      () => {
        window.location.reload();
      }
    );
  }

  showConnectionStatus(status, type) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
      statusElement.remove();
    }

    const statusDiv = document.createElement('div');
    statusDiv.id = 'connectionStatus';
    statusDiv.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-yellow-500'
    }`;
    statusDiv.textContent = `You are ${status}`;
    document.body.appendChild(statusDiv);

    setTimeout(() => {
      statusDiv.remove();
    }, 3000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new StickerCropperApp();
});

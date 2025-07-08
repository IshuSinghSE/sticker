/**
 * Event Manager - Handles all user interactions with improved touch support
 */
class EventManager {
  constructor(canvasManager, gridManager, stickerManager, selectionCallback = null) {
    this.canvasManager = canvasManager;
    this.gridManager = gridManager;
    this.stickerManager = stickerManager;
    this.canvas = canvasManager.canvas;
    this.hammer = null;
    this.isDragging = false;
    this.selectionCallback = selectionCallback;
    
    this.setupEventListeners();
    this.setupTouchEvents();
  }

  setupEventListeners() {
    // Mouse events for desktop
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handlePointerUp(e));
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  setupTouchEvents() {
    // Initialize Hammer.js for better touch handling
    this.hammer = new Hammer(this.canvas, {
      touchAction: 'none',
      recognizers: [
        [Hammer.Pan, { direction: Hammer.DIRECTION_ALL }],
        [Hammer.Tap, { taps: 1 }],
        [Hammer.Press, { time: 300 }]
      ]
    });

    // Handle tap for cell selection
    this.hammer.on('tap', (e) => {
      e.preventDefault();
      e.srcEvent.preventDefault();
      this.handleCanvasClick(e);
    });

    // Handle pan for grid line dragging
    this.hammer.on('panstart', (e) => {
      this.handlePointerDown(e);
    });

    this.hammer.on('panmove', (e) => {
      this.handlePointerMove(e);
    });

    this.hammer.on('panend', (e) => {
      this.handlePointerUp(e);
    });

    // Prevent default touch behaviors
    this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
  }

  getEventCoordinates(e) {
    // Handle different event types
    if (e.center) {
      // Hammer.js event
      return { x: e.center.x, y: e.center.y };
    } else if (e.touches && e.touches.length > 0) {
      // Touch event
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      // Mouse event
      return { x: e.clientX, y: e.clientY };
    }
  }

  handlePointerDown(e) {
    if (!this.canvasManager.imageLoaded) return;

    const coords = this.getEventCoordinates(e);
    const canvasCoords = this.canvasManager.getCanvasCoordinates(coords.x, coords.y);

    // Check if we're near a grid line
    const nearestLine = this.gridManager.findNearestGridLine(
      canvasCoords.x, 
      canvasCoords.y, 
      this.canvas.width, 
      this.canvas.height
    );

    if (nearestLine) {
      this.isDragging = true;
      this.gridManager.startDrag(nearestLine, coords);
      this.updateCursor(nearestLine.type);
      this.canvasManager.drawGrid(this.gridManager);
      if (e.preventDefault) e.preventDefault();
    }
  }

  handlePointerMove(e) {
    if (!this.canvasManager.imageLoaded) return;

    const coords = this.getEventCoordinates(e);

    if (this.isDragging && this.gridManager.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const updated = this.gridManager.updateDrag(coords, rect);
      if (updated) {
        this.canvasManager.drawGrid(this.gridManager);
      }
      if (e.preventDefault) e.preventDefault();
    } else if (!this.isDragging) {
      this.updateCursorForHover(coords);
    }
  }

  handlePointerUp(e) {
    if (this.gridManager.endDrag()) {
      this.isDragging = false;
      this.canvas.style.cursor = 'crosshair';
      this.canvasManager.drawGrid(this.gridManager);
    }
  }

  handleCanvasClick(e) {
    if (!this.canvasManager.imageLoaded || this.isDragging) {
      return;
    }

    const coords = this.getEventCoordinates(e);
    const normalizedCoords = this.canvasManager.getNormalizedCoordinates(coords.x, coords.y);

    if (this.gridManager.rows === 1 && this.gridManager.cols === 1) {
      // Free crop mode
      this.cropEntireImage();
    } else {
      // Grid mode
      const cell = this.gridManager.getCellFromCoordinates(normalizedCoords.x, normalizedCoords.y);
      if (cell) {
        this.gridManager.toggleCellSelection(cell.row, cell.col);
        this.canvasManager.drawGrid(this.gridManager);
        
        // Update Select All button state
        if (this.selectionCallback) {
          this.selectionCallback();
        }
      }
    }
  }

  updateCursorForHover(coords) {
    if (this.isDragging || (this.gridManager.rows === 1 && this.gridManager.cols === 1)) {
      return;
    }

    const canvasCoords = this.canvasManager.getCanvasCoordinates(coords.x, coords.y);
    const nearestLine = this.gridManager.findNearestGridLine(
      canvasCoords.x, 
      canvasCoords.y, 
      this.canvas.width, 
      this.canvas.height
    );

    if (nearestLine) {
      this.updateCursor(nearestLine.type);
    } else {
      this.canvas.style.cursor = 'crosshair';
    }
  }

  updateCursor(lineType) {
    this.canvas.style.cursor = lineType === 'vertical' ? 'col-resize' : 'row-resize';
  }

  cropEntireImage() {
    const bounds = {
      x: 0,
      y: 0,
      width: this.canvasManager.originalImage.width,
      height: this.canvasManager.originalImage.height
    };

    const dataUrl = this.canvasManager.cropImage(bounds);
    this.stickerManager.addSticker(dataUrl);
  }

  cropSelectedCells() {
    if (!this.gridManager.hasSelectedCells()) return;

    const selectedCells = this.gridManager.getSelectedCells();
    const originalWidth = this.canvasManager.originalImage.width;
    const originalHeight = this.canvasManager.originalImage.height;

    selectedCells.forEach(cellId => {
      const [row, col] = cellId.split(',').map(Number);
      const bounds = this.gridManager.getCellBoundsForOriginalImage(
        row, col, originalWidth, originalHeight
      );

      if (bounds) {
        const dataUrl = this.canvasManager.cropImage(bounds);
        this.stickerManager.addSticker(dataUrl, `sticker_${row}_${col}.png`);
      }
    });

    // Clear selections after cropping
    this.gridManager.clearSelection();
    this.canvasManager.drawGrid(this.gridManager);
    
    // Update Select All button state
    if (this.selectionCallback) {
      this.selectionCallback();
    }
  }

  handleResize() {
    this.canvasManager.resize();
    if (this.gridManager) {
      this.canvasManager.drawGrid(this.gridManager);
    }
  }

  destroy() {
    // Clean up Hammer.js instance
    if (this.hammer) {
      this.hammer.destroy();
    }
  }
}

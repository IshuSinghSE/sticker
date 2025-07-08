/**
 * Canvas Manager - Handles all canvas operations
 */
class CanvasManager {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    this.ctx = this.canvas.getContext('2d');
    this.originalImage = new Image();
    this.imageLoaded = false;
    
    this.setupCanvas();
  }

  setupCanvas() {
    // Set initial canvas properties
    this.canvas.style.cursor = 'crosshair';
    this.canvas.style.touchAction = 'none';
    this.canvas.style.userSelect = 'none';
    this.canvas.style.display = 'block';
    this.canvas.style.objectFit = 'contain';
  }

  loadImage(imageSrc) {
    return new Promise((resolve, reject) => {
      this.originalImage.onload = () => {
        this.imageLoaded = true;
        this.drawImageOnCanvas();
        resolve();
      };
      this.originalImage.onerror = reject;
      this.originalImage.src = imageSrc;
    });
  }

  drawImageOnCanvas() {
    if (!this.originalImage.src) return;

    // Get container dimensions
    const containerWidth = this.container.clientWidth;
    const containerHeight = Math.min(window.innerHeight * 0.6, 600);
    
    // Calculate aspect ratio
    const aspectRatio = this.originalImage.width / this.originalImage.height;
    
    // Set minimum size for grid visibility
    const minSize = Math.min(containerWidth * 0.8, 300);
    
    // Calculate canvas dimensions maintaining aspect ratio
    let canvasWidth, canvasHeight;
    
    if (aspectRatio > 1) {
      // Landscape image
      canvasWidth = Math.min(containerWidth * 0.9, 800);
      canvasHeight = canvasWidth / aspectRatio;
      
      if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight;
        canvasWidth = canvasHeight * aspectRatio;
      }
    } else {
      // Portrait or square image
      canvasHeight = Math.min(containerHeight, 600);
      canvasWidth = canvasHeight * aspectRatio;
      
      if (canvasWidth > containerWidth * 0.9) {
        canvasWidth = containerWidth * 0.9;
        canvasHeight = canvasWidth / aspectRatio;
      }
    }
    
    // Ensure minimum size for usability
    if (canvasWidth < minSize) {
      canvasWidth = minSize;
      canvasHeight = canvasWidth / aspectRatio;
    }
    if (canvasHeight < minSize) {
      canvasHeight = minSize;
      canvasWidth = canvasHeight * aspectRatio;
    }

    // Set canvas internal dimensions (for drawing)
    this.canvas.width = Math.floor(canvasWidth);
    this.canvas.height = Math.floor(canvasHeight);
    
    // Set canvas display dimensions (CSS) - prevent stretching
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';
    this.canvas.style.objectFit = 'contain';

    this.clearCanvas();
    this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid(gridManager) {
    if (!this.imageLoaded) return;

    this.clearCanvas();
    this.ctx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);

    // Draw selected cells
    this.drawSelectedCells(gridManager);
    
    // Draw grid lines
    this.drawGridLines(gridManager);
  }

  drawSelectedCells(gridManager) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'; // Purple semi-transparent overlay
    
    gridManager.selectedCells.forEach(cellId => {
      const [row, col] = cellId.split(',').map(Number);
      const bounds = gridManager.getCellBounds(row, col, this.canvas.width, this.canvas.height);
      
      if (bounds) {
        this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
    });
    
    this.ctx.restore();
  }

  drawGridLines(gridManager) {
    const isDragging = gridManager.isDragging;
    this.ctx.strokeStyle = isDragging ? 
      'rgba(139, 92, 246, 1)' : 
      'rgba(139, 92, 246, 0.8)';
    this.ctx.lineWidth = 2;

    // Draw vertical lines
    gridManager.verticalLinePositions.forEach(pos => {
      const x = pos * this.canvas.width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    });

    // Draw horizontal lines
    gridManager.horizontalLinePositions.forEach(pos => {
      const y = pos * this.canvas.height;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    });
  }

  cropImage(bounds) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = bounds.width;
    tempCanvas.height = bounds.height;

    tempCtx.drawImage(
      this.originalImage,
      bounds.x, bounds.y, bounds.width, bounds.height,
      0, 0, bounds.width, bounds.height
    );

    return tempCanvas.toDataURL('image/png');
  }

  getCanvasCoordinates(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  getNormalizedCoordinates(clientX, clientY) {
    const canvasCoords = this.getCanvasCoordinates(clientX, clientY);
    return {
      x: canvasCoords.x / this.canvas.width,
      y: canvasCoords.y / this.canvas.height
    };
  }

  resize() {
    if (this.imageLoaded) {
      this.drawImageOnCanvas();
    }
  }
}

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

    // Ensure minimum canvas size for grid visibility
    const minCanvasSize = 400;
    const maxWidth = Math.max(this.container.clientWidth, minCanvasSize);
    const maxHeight = Math.max(window.innerHeight * 0.7, minCanvasSize);

    const aspectRatio = this.originalImage.width / this.originalImage.height;
    let canvasWidth = Math.max(this.originalImage.width, minCanvasSize);
    let canvasHeight = Math.max(this.originalImage.height, minCanvasSize);

    // Scale to fit container while maintaining minimum size
    if (canvasWidth > maxWidth) {
      canvasWidth = maxWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }

    // Ensure minimum dimensions are maintained
    if (canvasWidth < minCanvasSize) {
      canvasWidth = minCanvasSize;
      canvasHeight = canvasWidth / aspectRatio;
    }
    if (canvasHeight < minCanvasSize) {
      canvasHeight = minCanvasSize;
      canvasWidth = canvasHeight * aspectRatio;
    }

    // Set canvas size
    this.canvas.width = Math.floor(canvasWidth);
    this.canvas.height = Math.floor(canvasHeight);
    
    // Set CSS dimensions
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;

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

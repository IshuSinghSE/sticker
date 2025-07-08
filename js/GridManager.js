/**
 * Grid Manager - Handles grid operations and cell selection
 */
class GridManager {
  constructor(rows = 3, cols = 3) {
    this.rows = rows;
    this.cols = cols;
    this.selectedCells = new Set();
    this.horizontalLinePositions = [];
    this.verticalLinePositions = [];
    this.isDragging = false;
    this.draggedLine = null;
    this.dragStartCoord = { x: 0, y: 0 };
    this.dragStartLinePos = 0;
    
    this.initializeGrid();
  }

  initializeGrid() {
    this.horizontalLinePositions = [];
    this.verticalLinePositions = [];

    // Calculate initial positions based on even distribution
    for (let i = 0; i <= this.rows; i++) {
      this.horizontalLinePositions.push(i / this.rows);
    }
    for (let i = 0; i <= this.cols; i++) {
      this.verticalLinePositions.push(i / this.cols);
    }
  }

  updateGridSize(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.selectedCells.clear();
    this.initializeGrid();
  }

  resetGrid() {
    this.selectedCells.clear();
    this.initializeGrid();
  }

  clearSelection() {
    this.selectedCells.clear();
  }

  findNearestGridLine(x, y, canvasWidth, canvasHeight, threshold = 20) {
    if (this.rows === 1 && this.cols === 1) return null;

    let nearestLine = null;
    let minDistance = threshold;

    // Check vertical lines
    this.verticalLinePositions.forEach((pos, index) => {
      const lineX = pos * canvasWidth;
      const distance = Math.abs(x - lineX);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLine = {
          type: 'vertical',
          index: index,
          position: pos
        };
      }
    });

    // Check horizontal lines
    this.horizontalLinePositions.forEach((pos, index) => {
      const lineY = pos * canvasHeight;
      const distance = Math.abs(y - lineY);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLine = {
          type: 'horizontal',
          index: index,
          position: pos
        };
      }
    });

    return nearestLine;
  }

  startDrag(nearestLine, startCoord) {
    this.isDragging = true;
    this.draggedLine = nearestLine;
    this.dragStartCoord = startCoord;
    this.dragStartLinePos = nearestLine.position;
  }

  updateDrag(currentCoord, canvasRect) {
    if (!this.isDragging || !this.draggedLine) return false;

    const deltaX = currentCoord.x - this.dragStartCoord.x;
    const deltaY = currentCoord.y - this.dragStartCoord.y;

    if (this.draggedLine.type === 'horizontal') {
      let newPos = this.dragStartLinePos + (deltaY / canvasRect.height);
      newPos = Math.max(0, Math.min(1, newPos));
      this.horizontalLinePositions[this.draggedLine.index] = newPos;
    } else {
      let newPos = this.dragStartLinePos + (deltaX / canvasRect.width);
      newPos = Math.max(0, Math.min(1, newPos));
      this.verticalLinePositions[this.draggedLine.index] = newPos;
    }

    return true;
  }

  endDrag() {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedLine = null;
      this.selectedCells.clear(); // Clear selections when grid lines are moved
      return true;
    }
    return false;
  }

  getCellFromCoordinates(normalizedX, normalizedY) {
    if (this.rows === 1 && this.cols === 1) return null;

    const sortedH = [...this.horizontalLinePositions].sort((a, b) => a - b);
    const sortedV = [...this.verticalLinePositions].sort((a, b) => a - b);

    let row = -1;
    let col = -1;

    // Find row
    for (let i = 0; i < sortedH.length - 1; i++) {
      if (normalizedY >= sortedH[i] && normalizedY <= sortedH[i + 1]) {
        row = i;
        break;
      }
    }

    // Find column
    for (let i = 0; i < sortedV.length - 1; i++) {
      if (normalizedX >= sortedV[i] && normalizedX <= sortedV[i + 1]) {
        col = i;
        break;
      }
    }

    return (row >= 0 && col >= 0) ? { row, col } : null;
  }

  toggleCellSelection(row, col) {
    const cellId = `${row},${col}`;
    if (this.selectedCells.has(cellId)) {
      this.selectedCells.delete(cellId);
      return false; // Deselected
    } else {
      this.selectedCells.add(cellId);
      return true; // Selected
    }
  }

  getCellBounds(row, col, canvasWidth, canvasHeight) {
    const sortedH = [...this.horizontalLinePositions].sort((a, b) => a - b);
    const sortedV = [...this.verticalLinePositions].sort((a, b) => a - b);

    if (row >= sortedH.length - 1 || col >= sortedV.length - 1) {
      return null;
    }

    return {
      x: sortedV[col] * canvasWidth,
      y: sortedH[row] * canvasHeight,
      width: (sortedV[col + 1] - sortedV[col]) * canvasWidth,
      height: (sortedH[row + 1] - sortedH[row]) * canvasHeight
    };
  }

  getCellBoundsForOriginalImage(row, col, originalWidth, originalHeight) {
    const sortedH = [...this.horizontalLinePositions].sort((a, b) => a - b);
    const sortedV = [...this.verticalLinePositions].sort((a, b) => a - b);

    if (row >= sortedH.length - 1 || col >= sortedV.length - 1) {
      return null;
    }

    return {
      x: sortedV[col] * originalWidth,
      y: sortedH[row] * originalHeight,
      width: (sortedV[col + 1] - sortedV[col]) * originalWidth,
      height: (sortedH[row + 1] - sortedH[row]) * originalHeight
    };
  }

  selectAllCells() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cellId = `${row},${col}`;
        this.selectedCells.add(cellId);
      }
    }
  }

  deselectAllCells() {
    this.selectedCells.clear();
  }

  isAllSelected() {
    return this.selectedCells.size === this.rows * this.cols;
  }

  getSelectedCells() {
    return Array.from(this.selectedCells);
  }

  hasSelectedCells() {
    return this.selectedCells.size > 0;
  }

  getSelectedCellsCount() {
    return this.selectedCells.size;
  }
}

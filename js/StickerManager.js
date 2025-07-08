/**
 * Sticker Manager - Handles sticker operations and preview
 */
class StickerManager {
  constructor(previewContainerId, countElementId) {
    this.previewContainer = document.getElementById(previewContainerId);
    this.countElement = document.getElementById(countElementId);
    this.stickers = [];
    this.nextId = 0;
    
    this.setupPreview();
  }

  setupPreview() {
    this.updatePreview();
  }

  addSticker(dataUrl, filename = null) {
    const sticker = {
      id: this.nextId++,
      dataUrl: dataUrl,
      filename: filename || `sticker_${this.nextId}.png`,
      timestamp: Date.now()
    };
    
    this.stickers.push(sticker);
    this.updatePreview();
    return sticker;
  }

  removeSticker(id) {
    const initialLength = this.stickers.length;
    this.stickers = this.stickers.filter(sticker => sticker.id !== id);
    
    if (this.stickers.length < initialLength) {
      this.updatePreview();
      return true;
    }
    return false;
  }

  clearAll() {
    this.stickers = [];
    this.nextId = 0;
    this.updatePreview();
  }

  updatePreview() {
    this.previewContainer.innerHTML = '';
    
    if (this.stickers.length === 0) {
      this.showEmptyMessage();
    } else {
      this.stickers.forEach(sticker => {
        this.createStickerPreview(sticker);
      });
    }
    
    this.updateCount();
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'preview-empty';
    emptyMessage.textContent = 'No stickers selected yet.';
    this.previewContainer.appendChild(emptyMessage);
  }

  createStickerPreview(sticker) {
    const stickerDiv = document.createElement('div');
    stickerDiv.className = 'sticker-preview selected';
    stickerDiv.dataset.id = sticker.id;
    stickerDiv.title = `Click to remove ${sticker.filename}`;

    const img = document.createElement('img');
    img.src = sticker.dataUrl;
    img.alt = `Sticker ${sticker.id}`;
    img.loading = 'lazy';

    const checkmark = document.createElement('div');
    checkmark.className = 'sticker-checkmark';
    checkmark.innerHTML = '✓';

    stickerDiv.appendChild(img);
    stickerDiv.appendChild(checkmark);
    this.previewContainer.appendChild(stickerDiv);

    // Add click listener to remove sticker
    stickerDiv.addEventListener('click', () => {
      this.removeSticker(sticker.id);
    });

    // Add animation
    stickerDiv.classList.add('slide-up');
  }

  updateCount() {
    if (this.countElement) {
      this.countElement.textContent = this.stickers.length;
    }
  }

  getStickers() {
    return [...this.stickers];
  }

  getStickerCount() {
    return this.stickers.length;
  }

  hasStickers() {
    return this.stickers.length > 0;
  }

  getStickerById(id) {
    return this.stickers.find(sticker => sticker.id === id);
  }

  // Generate ZIP file data
  async generateZipData() {
    if (this.stickers.length === 0) {
      throw new Error('No stickers to download');
    }

    const zip = new JSZip();
    
    this.stickers.forEach(sticker => {
      const base64Data = sticker.dataUrl.split(',')[1];
      zip.file(sticker.filename, base64Data, { base64: true });
    });

    return await zip.generateAsync({ type: 'blob' });
  }

  // Download stickers as ZIP
  async downloadAsZip(filename = 'whatsapp_stickers.zip') {
    try {
      const content = await this.generateZipData();
      saveAs(content, filename);
      return true;
    } catch (error) {
      console.error('Error generating ZIP:', error);
      throw error;
    }
  }
}

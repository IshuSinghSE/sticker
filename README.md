# Sticker Cropper & Packager

A modern, responsive web application for cropping stickers from images using an advanced draggable grid system. Built with vanilla JavaScript using Object-Oriented Programming principles and styled with Tailwind CSS.

## ✨ Features

- **🎯 Interactive Grid System**: Drag and adjust grid lines to customize crop areas with precision
- **👆 Intuitive Cell Selection**: Click/tap grid cells to select them with visual feedback
- **📱 Mobile-First Design**: Optimized for both desktop and mobile devices with Hammer.js touch support
- **🎨 Modern UI**: Clean, professional interface with smooth animations and purple theme
- **⚡ Performance Optimized**: Efficient canvas operations and event handling
- **🔧 Fully Customizable**: Easy to modify colors, themes, and behavior
- **📦 ZIP Download**: Download all cropped stickers as a convenient ZIP file
- **🖼️ Default Content**: Dynamic emoji grid that adapts to any grid size

## 🏗️ Architecture

### Object-Oriented Design
- **`StickerCropperApp`**: Main application orchestrator
- **`CanvasManager`**: Handles canvas rendering and image operations
- **`GridManager`**: Manages grid state and cell selection
- **`StickerManager`**: Handles sticker storage and preview
- **`EventManager`**: Manages user interactions with touch support
- **`MessageManager`**: Handles notifications and dialogs

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas, Tailwind CSS
- **Touch Support**: Hammer.js for robust mobile interaction
- **File Processing**: JSZip for ZIP generation, FileSaver.js for downloads
- **Styling**: Tailwind CSS with custom CSS variables

## 📁 Project Structure

```
sticker/
├── index.html              # Main HTML file with Tailwind CSS
├── css/
│   └── styles.css          # Consolidated custom styles
├── js/
│   ├── StickerCropperApp.js # Main application class
│   ├── CanvasManager.js     # Canvas operations
│   ├── GridManager.js       # Grid logic
│   ├── StickerManager.js    # Sticker management
│   ├── EventManager.js      # Event handling
│   └── MessageManager.js    # User notifications
├── sticker_sheet.png        # Default sample image
└── README.md               # This file
```

## 💡 Usage

### Basic Operations
1. **📤 Upload Image**: Click the upload area or use the default emoji grid
2. **🔢 Adjust Grid**: Change rows/columns with the number inputs
3. **🎯 Select Cells**: Click/tap grid cells to select them (purple highlight)
4. **↔️ Adjust Boundaries**: Drag purple grid lines to customize crop areas
5. **✅ Select All**: Use the "Select All" button to toggle all cells
6. **✂️ Crop**: Click "Crop Selected" to generate stickers
7. **📦 Download**: Click "Download ZIP" to get all stickers

## 🎨 Customization

### Colors & Theme
```css
:root {
  --primary-color: #a855f7;
  --primary-hover: #9333ea;
  --primary-selected: rgba(168, 85, 247, 0.3);
  --grid-line-color: rgba(168, 85, 247, 0.8);
}
```

### Tailwind Configuration
Customize the Tailwind theme in `index.html` script tag.

## 🔧 Development

```bash
# Start development server
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

## 📱 Mobile Optimization
- **Touch Events**: Hammer.js for reliable touch handling
- **Responsive Design**: Adapts to all screen sizes
- **Performance**: Optimized canvas operations
- **User Experience**: Intuitive gestures and feedback

## 🌐 Browser Support
- Chrome 60+ ✅
- Firefox 55+ ✅
- Safari 12+ ✅
- Edge 79+ ✅
- Mobile browsers ✅

## 🔄 Recent Updates
- **Enhanced Mobile UX**: Better touch handling and responsive design
- **Modern UI**: Updated to use Tailwind CSS extensively
- **Purple Theme**: Consistent color scheme throughout
- **Performance**: Improved canvas coordinate calculations
- **Accessibility**: Better focus management and ARIA support

## 📄 License
This project is open source and available under the MIT License.

---

**Built with ❤️ for the modern web**
# Sticker Cropper & Packager

A modern web application for cropping stickers from images using a draggable, adjustable grid system. Built with vanilla JavaScript using Object-Oriented Programming principles and modular architecture.

## Features

- **Interactive Grid System**: Drag and adjust grid lines to customize crop areas
- **Toggle Cell Selection**: Click grid cells to select/deselect them with visual feedback
- **Boundary Protection**: Prevents selection outside adjusted grid boundaries
- **Batch Processing**: Crop multiple selected cells at once
- **ZIP Download**: Download all cropped stickers as a ZIP file
- **Responsive Design**: Works on both desktop and mobile devices
- **Modern UI**: Clean, accessible interface with smooth animations

## File Structure

```
sticker/
├── index.html                 # Main HTML file with Tailwind CSS
├── css/
│   └── styles.css            # Consolidated custom styles and CSS variables
├── js/
│   ├── StickerCropperApp.js # Main application class
│   ├── CanvasManager.js     # Canvas operations and drawing
│   ├── GridManager.js       # Grid logic and cell management
│   ├── StickerManager.js    # Sticker storage and preview
│   ├── EventManager.js      # Event handling and user interactions
│   └── MessageManager.js    # User notifications and messages
├── sticker_sheet.png        # Default sample image
└── README.md               # This file
```

## Architecture

### Object-Oriented Design

The application uses a modular OOP approach with the following classes:

1. **StickerCropperApp**: Main application orchestrator
2. **CanvasManager**: Handles canvas rendering and image operations
3. **GridManager**: Manages grid state, cell selection, and line positioning
4. **StickerManager**: Handles sticker storage, preview, and ZIP generation
5. **EventManager**: Manages user interactions and event handling
6. **MessageManager**: Handles user notifications and dialogs

### CSS Variables

All colors and design tokens are defined in `css/styles.css` for easy customization:

```css
:root {
  --primary-color: #8b5cf6;
  --primary-hover: #7c3aed;
  --bg-selected: rgba(139, 92, 246, 0.3);
  /* ... more variables */
}
```

### Modern Styling Approach

The application uses a hybrid approach combining:
- **Tailwind CSS**: For utility-first responsive design and rapid development
- **Custom CSS Variables**: For consistent theming and easy customization
- **Minimal Custom CSS**: Only for essential styles not covered by Tailwind

This approach provides:
- **Consistency**: Tailwind's design system ensures consistent spacing, colors, and typography
- **Maintainability**: Easy to modify and extend with Tailwind utilities
- **Customization**: CSS variables allow for easy theme changes
- **Performance**: Minimal custom CSS reduces bundle size

## Usage

### Basic Operations

1. **Load Image**: Click "Upload Image" or use the default sample image
2. **Adjust Grid**: Use the number inputs to change rows/columns
3. **Select Cells**: Click on grid cells to select them (blue highlight)
4. **Adjust Boundaries**: Drag blue grid lines to customize crop areas
5. **Crop Stickers**: Click "Crop Selected" to generate stickers
6. **Download**: Click "Download ZIP" to get all stickers

### Advanced Features

- **Reset Grid**: Restore evenly spaced grid lines
- **Clear Selection**: Remove all selected cells
- **Remove Stickers**: Click on sticker previews to remove them
- **Clear All**: Remove all generated stickers

## Customization

### Changing Colors

Edit `css/styles.css` to customize the color scheme:

```css
:root {
  --primary-color: #your-color;
  --primary-hover: #your-hover-color;
  --bg-selected: rgba(your-rgb, 0.3);
}
```

### Modifying Layout

- **Tailwind Classes**: Edit classes directly in `index.html` for quick changes
- **Custom Styles**: Edit `css/styles.css` for specialized styling
- **Component Styles**: Update utility classes in the HTML elements

### Adding Features

1. Create new methods in the appropriate manager classes
2. Add event listeners in `EventManager.js`
3. Update the UI in `index.html` using Tailwind classes
4. Add custom styles in `css/styles.css` if needed

## Dependencies

- **JSZip**: For creating ZIP files
- **FileSaver.js**: For downloading files
- **Modern Browser**: Supports ES6 classes and Canvas API

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Local Development

1. Clone the repository
2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

### Code Organization

- Keep classes focused on single responsibilities
- Use CSS variables for all colors and spacing
- Follow consistent naming conventions
- Add comments for complex logic
- Test on both desktop and mobile devices

## Performance Considerations

- Images are processed on the client side
- Canvas operations are optimized for smooth interactions
- Event listeners are properly managed to prevent memory leaks
- CSS animations use GPU acceleration where possible

## License

This project is open source and available under the MIT License.
# Map Image Recommendations

## Recommended File Types

### For the Main Map (City Map)
**SVG (Scalable Vector Graphics)** - BEST OPTION
- **Advantages**: 
  - Infinitely scalable without quality loss
  - Smaller file size for simple graphics
  - Can be styled and manipulated with CSS/JavaScript
  - Perfect for interactive maps with clickable regions
- **File Size**: Typically 100KB-500KB depending on complexity
- **Example**: Your current "City Map.svg"

Alternative:
**PNG with transparency**
- Use only if SVG is not available
- Higher resolution (at least 2000px width for large screens)
- File size will be much larger (1-3MB)

### For Zone Detail Images
**WebP** - BEST OPTION
- **Advantages**:
  - 25-35% smaller file size than JPEG at equivalent quality
  - Supports transparency like PNG
  - Supported by all modern browsers
- **Typical File Size**: 200KB-800KB per image at high quality
- **Recommended Dimensions**: 1200px-1600px width

Alternatives in order of preference:
1. **JPEG/JPG**
   - Good compression for photographs
   - No transparency support
   - Aim for 80-90% quality setting for optimal balance
   - **File Size**: 300KB-1MB per image at this quality

2. **PNG**
   - Lossless quality with transparency support
   - Larger file sizes than JPEG/WebP
   - Better for images with text, sharp edges, or transparency
   - **File Size**: 1-3MB per image at full quality

## Recommended Image Dimensions

### Main Map
- Width: 800px-1200px (depending on your layout)
- Height: Proportional to width
- Resolution: 72-96 DPI (standard for web)

### Zone Detail Images
- Width: 1200px-1600px
- Height: 800px-1200px (16:9 or 4:3 aspect ratio recommended)
- Resolution: 72-96 DPI

## Optimizing Your Images

1. **Compression Tools**:
   - [TinyPNG](https://tinypng.com/) - For PNG and JPEG compression
   - [Squoosh](https://squoosh.app/) - Google's tool for modern formats like WebP
   - [SVGOMG](https://jakearchibald.github.io/svgomg/) - For optimizing SVG files

2. **File Size Targets**:
   - Main Map SVG: Under 500KB
   - Zone Detail Images: Under 800KB each

3. **Naming Convention**:
   - Keep using the established naming pattern: 
     - `north-west-area-a.jpg` (or .webp)
     - `north-west-area-a-2.jpg`
     - etc.

## Performance Considerations

- Total page weight should ideally stay under 5MB for good performance
- Consider lazy loading images that aren't immediately visible
- Pre-load the most common zone images for better user experience

## Implementation Notes

If you switch to WebP format, update the `loadZoneImages` function in `script.js`:

```javascript
// Change this line:
const imagePath = `map-images/${formattedZone}${i > 1 ? '-' + i : ''}.jpg`;

// To:
const imagePath = `map-images/${formattedZone}${i > 1 ? '-' + i : ''}.webp`;
```

Or make it flexible with both formats:

```javascript
function getImagePath(zoneName, imageNumber) {
    const basePath = `map-images/${zoneName}${imageNumber > 1 ? '-' + imageNumber : ''}`;
    // Try WebP first, fall back to JPG
    return `${basePath}.webp`;
}
``` 
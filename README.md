# Calgary Interactive Map Tool

An interactive map component that allows users to hover over map regions to see zone names and click on zones to view detailed images.

## Features

- **Hover Interaction**: When hovering over a map area, it slightly scales up, shows the zone name, and dims the rest of the map.
- **Click Interaction**: Clicking on a zone opens a full-screen modal with a gallery of images for that zone.
- **Responsive Design**: Works well on different screen sizes.
- **Keyboard Navigation**: Use arrow keys to navigate through images in the modal, and Escape to close it.

## Setup Instructions

1. **File Structure**:
   ```
   your-project/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── City Map.svg      # Main map SVG file
   └── map-images/       # Directory for zone images
       ├── north-west-area-a.jpg
       ├── north-west-area-a-2.jpg
       ├── north-west-area-a-3.jpg
       ├── north-west-area-b.jpg
       └── ...
   ```

2. **Image Naming Convention**:
   - Zone images should follow the naming pattern: `[zone-name-in-kebab-case].jpg` for the first image
   - Additional images should be numbered: `[zone-name-in-kebab-case]-2.jpg`, `[zone-name-in-kebab-case]-3.jpg`, etc.
   - For example, zone "NorthWestAreaA" becomes:
     - `north-west-area-a.jpg` (first image)
     - `north-west-area-a-2.jpg` (second image)
     - `north-west-area-a-3.jpg` (third image)

3. **Running Locally**:
   - Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code
   - Right-click on `index.html` and select "Open with Live Server"
   - Or use any other local development server of your choice

## Webflow Integration

To integrate this into Webflow:

1. Create a new custom code element in your Webflow project
2. Copy the HTML from `index.html` into the custom code element
3. Add the CSS from `styles.css` to your project's CSS
4. Add the JavaScript from `script.js` to your project's JavaScript
5. Upload the SVG map and zone images to your Webflow assets

## Customization

- To add or modify zones, edit the `<map>` and `<area>` tags in the HTML
- To change the hover or modal styles, modify the CSS in `styles.css`
- To adjust image loading or interaction behavior, edit the JavaScript in `script.js`

## Requirements

- Modern web browser with JavaScript enabled
- No external dependencies or frameworks required

## Browser Compatibility

- Chrome, Firefox, Safari, Edge (latest versions)
- Internet Explorer is not supported 
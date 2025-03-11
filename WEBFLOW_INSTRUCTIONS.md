# CKMapTool - Webflow Integration Guide

This guide explains how to integrate the CKMapTool with your Webflow site to avoid the 50,000 character limit per code block.

## Overview

Webflow has a 50,000 character limit for custom code blocks, which can be restrictive for complex applications like CKMapTool. To work around this limitation, we'll:

1. Host the CSS and JavaScript files externally (via GitHub + jsDelivr CDN)
2. Add a minimal code block to Webflow that loads these external files

## Step 1: Host Your Files on GitHub

1. Push the updated `script.js` and `styles.css` files to your GitHub repository
2. Make sure the repository is public so jsDelivr can access it

## Step 2: Add the Loader to Webflow

1. In your Webflow project, go to the page where you want to add the map
2. Add a new **Embed** element to your page
3. Copy the contents of `webflow_loader.html` into the embed element
4. Update the following parts of the code:
   - Change the GitHub URLs to point to your repository
   - Update the map image URL
   - Add your map areas with proper coordinates
   - Define your `zoneImageMap` with your own zones and images

## Example integration code:

```html
<!-- CKMapTool Loader for Webflow -->

<!-- Load external CSS file -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO/styles.css"
/>

<!-- Load external JavaScript file -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO/script.js"></script>

<!-- Map container structure -->
<div class="map-container">
  <!-- ... rest of the HTML structure ... -->
</div>

<!-- Define your zone image map -->
<script>
  const zoneImageMap = {
    Zone1: ["image1.jpg", "image2.jpg"],
    // Add your zones here
  };
</script>
```

## Using jsDelivr CDN

The URLs in the example use jsDelivr, which is a free CDN that works with GitHub. The URL format is:

```
https://cdn.jsdelivr.net/gh/USERNAME/REPOSITORY/FILE_PATH
```

You can specify a specific version/tag/commit:

```
https://cdn.jsdelivr.net/gh/USERNAME/REPOSITORY@VERSION/FILE_PATH
```

## Benefits of External Files

1. **No character limit**: Your CSS and JS can be as large as needed
2. **Caching**: Files served through jsDelivr are cached and delivered from a global CDN
3. **Version control**: You can track changes to your code with Git
4. **Maintainability**: Easier to update and maintain code in separate files

## Updating Your Code

When you make changes to your code:

1. Update the files in your GitHub repository
2. The changes will be reflected on your Webflow site (there may be a short delay due to CDN caching)
3. To force an immediate update, you can use a specific commit hash in the URL

## Troubleshooting

- **Files not loading**: Make sure your repository is public
- **Changes not appearing**: Clear your browser cache or use a version specifier in the URL
- **CORS issues**: jsDelivr handles CORS headers, but if you host elsewhere, ensure proper CORS configuration

## Need Help?

If you encounter any issues with the integration, double-check:

1. Your repository permissions (must be public)
2. The URLs in your embed code
3. That your HTML structure matches what the script expects

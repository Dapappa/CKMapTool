/**********************************************************
 * CKMapTool - Interactive Map Tool with Dynamic Image Loading
 *
 * Enhanced for all device sizes with improved coordinate mapping
 *********************************************************/

document.addEventListener("DOMContentLoaded", function () {
  // Don't run if this is initialization from CDN
  if (window.mapInitialized) {
    console.log("Map already initialized, skipping duplicate initialization");
    return;
  }

  /**********************************************************
   * 1) Global Variables and DOM Elements
   **********************************************************/
  // DOM elements
  const mapContainer = document.querySelector(".map-container");
  const mainMap = document.querySelector(".main-map");
  const mapWrapper = document.querySelector(".map-wrapper");
  const mapAreas = document.querySelectorAll("map[name='image-map'] area");
  const zoneLabel = document.querySelector(".zone-label");
  const initialOverlay = document.querySelector(".initial-overlay");
  const zoneModal = document.querySelector(".zone-modal");
  const sliderContainer = document.querySelector(".slider-container");
  const modalTitle = document.querySelector(".modal-title");
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");
  const closeButton = document.querySelector(".close-button");
  const fullscreenView = document.querySelector(".fullscreen-view");
  const fullscreenImageContainer = document.querySelector(
    ".fullscreen-image-container"
  );
  const closeFullscreenButton = document.querySelector(".close-fullscreen");

  // Image paths for zones (external JSON or directly defined here)
  const imageBaseURL = "https://cdn.jsdelivr.net/gh/Dapappa/CKMapTool/";

  // State variables
  let allZones = [];
  let currentZoneIndex = 0;
  let currentImageIndex = 0;
  let autoCycleInterval = null;
  let userInteracted = false;
  let isFirstTap = true;
  let lastClickedZone = null;
  let isMobile = window.innerWidth <= 768; // Go back to simple check
  let lastMapWidth = 0;
  let lastMapHeight = 0;
  let debugMode = false; // Set to true for debugging coordinate mapping

  // Create an overlay for debugging if in debug mode
  let debugOverlay = null;

  /**********************************************************
   * 2) Initialize
   **********************************************************/
  function init() {
    // Enable debug mode from URL parameter
    if (window.location.search.includes("debug=true")) {
      debugMode = true;
      createDebugOverlay();
    }

    // Ensure the map container doesn't block scrolling
    if (mapContainer) {
      // Allow touch events to be handled by the browser for scrolling
      mapContainer.style.touchAction = "pan-y";
    }

    // Build the zones array from <area> + zoneImageMap
    initializeZones();

    // Debug info
    console.log("CKMapTool initialized");
    console.log("Zones detected:", Object.keys(zoneImageMap).length);
    console.log("Screen size:", window.innerWidth, "x", window.innerHeight);
    console.log("Device pixel ratio:", window.devicePixelRatio);
    console.log("Is mobile:", isMobile);

    // Once the map is loaded, create the polygon overlays
    if (mainMap.complete) {
      createAreaHighlights();
      updateAreaHighlights();
      storeMapDimensions();
    } else {
      mainMap.onload = function () {
        console.log("Main map loaded successfully");
        console.log(
          "Natural size:",
          mainMap.naturalWidth,
          "x",
          mainMap.naturalHeight
        );
        console.log(
          "Displayed size:",
          mainMap.offsetWidth,
          "x",
          mainMap.offsetHeight
        );
        createAreaHighlights();
        updateAreaHighlights();
        storeMapDimensions();
      };

      mainMap.onerror = function () {
        console.error("Failed to load main map:", mainMap.src);
      };
    }

    // Setup touch and click events
    setupTouchEvents();
    setupClickEvents();

    // Hide the "Tap a region to explore" after 5s
    setTimeout(() => {
      if (initialOverlay) {
        initialOverlay.classList.add("hide");
      }
    }, 5000);

    // Start random highlight cycling
    startAutoCycle();

    // Stop auto-cycling on interaction
    document.addEventListener("click", () => {
      userInteracted = true;
      stopAutoCycle();
    });

    // Handle resizing
    let resizeTimer;
    window.addEventListener("resize", () => {
      isMobile = window.innerWidth <= 768;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const dimensionsChanged = checkMapDimensionChanges();
        updateAreaHighlights();

        if (dimensionsChanged && debugMode) {
          console.log("Map dimensions changed, updating debug info");
          updateDebugOverlay();
        }
      }, 250);
    });

    // Handle orientation changes more explicitly
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        console.log("Orientation changed, updating map");
        isMobile = window.innerWidth <= 768;
        const dimensionsChanged = checkMapDimensionChanges();
        updateAreaHighlights();

        if (dimensionsChanged && debugMode) {
          console.log("Map dimensions changed after orientation change");
          updateDebugOverlay();
        }
      }, 300);
    });
  }

  /**********************************************************
   * 3) Zone Initialization
   **********************************************************/
  function initializeZones() {
    if (!mapAreas.length) {
      console.error("No map areas found!");
      return;
    }

    allZones = [];

    // Process each area
    mapAreas.forEach((area) => {
      const title = area.getAttribute("title");

      // Skip if no title or not in zoneImageMap
      if (!title || !zoneImageMap[title]) return;

      // Create zone object
      const zone = {
        title: title,
        coords: area.getAttribute("coords").split(",").map(Number),
        shape: area.getAttribute("shape"),
        imagePaths: zoneImageMap[title],
        element: area,
      };

      allZones.push(zone);
    });

    console.log(`Processed ${allZones.length} active zones`);
  }

  /**********************************************************
   * 4) Area Highlights Creation
   **********************************************************/
  function createAreaHighlights() {
    // Create container for highlights if it doesn't exist
    let highlightsContainer = document.querySelector(".highlights-container");

    if (!highlightsContainer) {
      highlightsContainer = document.createElement("div");
      highlightsContainer.className = "highlights-container";
      mapWrapper.appendChild(highlightsContainer);
    } else {
      // Clear existing highlights
      highlightsContainer.innerHTML = "";
    }

    // Create SVG container for the highlights
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "map-highlights");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none"; // Make sure it doesn't interfere with clicks
    highlightsContainer.appendChild(svg);

    // Process each zone
    allZones.forEach((zone, index) => {
      if (zone.shape === "poly") {
        // Create polygon highlight
        const polygon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon"
        );
        polygon.setAttribute("class", `zone-highlight zone-${index}`);
        polygon.setAttribute("data-zone", zone.title);

        // Set SVG styling attributes explicitly
        polygon.setAttribute("fill", "rgba(255, 0, 0, 0.2)");
        polygon.setAttribute("stroke", "#ff0000");
        polygon.setAttribute("stroke-width", "3");
        polygon.setAttribute("fill-opacity", "0");
        polygon.setAttribute("stroke-opacity", "0");

        svg.appendChild(polygon);
      }
    });
  }

  /**********************************************************
   * 5) Map Area Interaction
   **********************************************************/
  function setupMapAreaInteraction() {
    // Direct interaction with map areas
    allZones.forEach((zone) => {
      zone.element.addEventListener("mouseenter", () => {
        if (!isMobile) {
          zoneLabel.textContent = formatZoneTitle(zone.title);
          zoneLabel.style.opacity = "1";
          highlightZone(zone.title);
        }
      });

      zone.element.addEventListener("mouseleave", () => {
        if (!isMobile) {
          zoneLabel.style.opacity = "0";
          updateAreaHighlights(); // Reset highlights
        }
      });

      zone.element.addEventListener("click", (e) => {
        e.preventDefault();
        userInteracted = true;
        stopAutoCycle();

        // On desktop, open modal directly
        if (!isMobile) {
          openZoneModal(zone.title);
        }
        // On mobile, first tap highlights, second tap opens
        else {
          if (isFirstTap) {
            handleFirstTap(zone.title);
          } else if (zone.title === lastClickedZone) {
            openZoneModal(zone.title);
          } else {
            resetTapState();
            handleFirstTap(zone.title);
          }
        }
      });
    });
  }

  /**********************************************************
   * 6) Area Highlight Updates
   **********************************************************/
  function updateAreaHighlights() {
    if (!mainMap || !mainMap.complete) return;

    // Get current map dimensions
    const mapWidth = mainMap.offsetWidth;
    const mapHeight = mainMap.offsetHeight;

    // Original map dimensions (SVG viewBox or natural size)
    const originalWidth = mainMap.naturalWidth;
    const originalHeight = mainMap.naturalHeight;

    if (
      mapWidth === 0 ||
      mapHeight === 0 ||
      originalWidth === 0 ||
      originalHeight === 0
    ) {
      console.warn("Cannot update highlights: Invalid dimensions", {
        mapWidth,
        mapHeight,
        originalWidth,
        originalHeight,
      });
      return;
    }

    // Calculate scale factors
    const scaleX = mapWidth / originalWidth;
    const scaleY = mapHeight / originalHeight;

    if (debugMode) {
      console.log("Updating area highlights with scale factors:", {
        scaleX,
        scaleY,
        mapWidth,
        mapHeight,
        originalWidth,
        originalHeight,
      });
    }

    // Update each zone's polygon
    allZones.forEach((zone, index) => {
      if (zone.shape === "poly") {
        const polygon = document.querySelector(`.zone-highlight.zone-${index}`);
        if (!polygon) return;

        // Scale coordinates
        const scaledPoints = [];
        for (let i = 0; i < zone.coords.length; i += 2) {
          const x = zone.coords[i] * scaleX;
          const y = zone.coords[i + 1] * scaleY;
          scaledPoints.push(`${x},${y}`);
        }

        polygon.setAttribute("points", scaledPoints.join(" "));
      }
    });
  }

  /**********************************************************
   * 7) Touch Events and Coordinate Handling
   **********************************************************/
  function setupTouchEvents() {
    // Handle direct touch on the map image (bypassing <area> tags)
    mainMap.addEventListener(
      "touchstart",
      function (e) {
        // Don't prevent default here - allow natural scrolling
        // Only track touch start position
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      },
      { passive: true } // Using passive listener improves scroll performance
    );

    // Track touch movement to distinguish between taps and scrolls
    let touchStartX, touchStartY;
    let touchMoved = false;
    const touchThreshold = isMobile ? 15 : 10; // Higher threshold for mobile

    mainMap.addEventListener(
      "touchmove",
      (e) => {
        if (!touchStartX || !touchStartY) return;

        const diffX = Math.abs(e.touches[0].clientX - touchStartX);
        const diffY = Math.abs(e.touches[0].clientY - touchStartY);

        if (diffX > touchThreshold || diffY > touchThreshold) {
          touchMoved = true;
        }
      },
      { passive: true }
    );

    mainMap.addEventListener("touchend", (e) => {
      // Only process if it was a tap, not a scroll
      if (touchMoved) return;

      // Get touch coordinates relative to the map
      const mapRect = mainMap.getBoundingClientRect();
      const touch = e.changedTouches[0];

      // Get relative position within the map
      const relativeX = touch.clientX - mapRect.left;
      const relativeY = touch.clientY - mapRect.top;

      // Scale from displayed size to original coordinate system
      const scaleX = mainMap.naturalWidth / mapRect.width;
      const scaleY = mainMap.naturalHeight / mapRect.height;

      // Calculate coordinates in the original coordinate system
      const originalX = relativeX * scaleX;
      const originalY = relativeY * scaleY;

      if (debugMode) {
        console.log(
          `Touch at: display(${relativeX}, ${relativeY}), original(${originalX}, ${originalY})`
        );
        showDebugPoint(relativeX, relativeY);
      }

      // Find the area that was touched
      let touchedArea = null;

      // First try with the scaled coordinates for better mobile experience
      for (const zone of allZones) {
        if (zone.shape === "poly") {
          if (isPointInPolygon(originalX, originalY, zone.coords)) {
            touchedArea = zone.element;
            break;
          }
        }
      }

      // If no match, try with a touch tolerance for better experience
      if (!touchedArea) {
        const tolerance = isMobile ? 15 : 10;
        for (const zone of allZones) {
          if (zone.shape === "poly") {
            if (
              isPointNearPolygon(originalX, originalY, zone.coords, tolerance)
            ) {
              touchedArea = zone.element;
              break;
            }
          }
        }
      }

      if (touchedArea) {
        // Only prevent default if we're actually handling a map area touch
        e.preventDefault();

        const title = touchedArea.getAttribute("title");
        userInteracted = true;
        stopAutoCycle();

        if (isFirstTap) {
          handleFirstTap(title);
        } else if (title === lastClickedZone) {
          openZoneModal(title);
        } else {
          resetTapState();
          handleFirstTap(title);
        }
      }
    });
  }

  /**
   * Setup click events for direct map interaction on desktop
   */
  function setupClickEvents() {
    // Handle direct clicks on the map (bypassing <area> tags)
    mainMap.addEventListener("click", (e) => {
      // Skip on mobile - handled by touch events
      if (isMobile) return;

      // Calculate click coordinates
      const mapRect = mainMap.getBoundingClientRect();
      const relativeX = e.clientX - mapRect.left;
      const relativeY = e.clientY - mapRect.top;

      // Scale from displayed size to original coordinate system
      const scaleX = mainMap.naturalWidth / mapRect.width;
      const scaleY = mainMap.naturalHeight / mapRect.height;

      // Calculate coordinates in the original coordinate system
      const originalX = relativeX * scaleX;
      const originalY = relativeY * scaleY;

      if (debugMode) {
        console.log(
          `Click at: display(${relativeX}, ${relativeY}), original(${originalX}, ${originalY})`
        );
        showDebugPoint(relativeX, relativeY);
      }

      // Find the area that was clicked
      let clickedArea = null;

      for (const zone of allZones) {
        if (zone.shape === "poly") {
          if (isPointInPolygon(originalX, originalY, zone.coords)) {
            clickedArea = zone.element;
            break;
          }
        }
      }

      if (clickedArea) {
        const title = clickedArea.getAttribute("title");
        userInteracted = true;
        stopAutoCycle();
        openZoneModal(title);
      }
    });
  }

  /**********************************************************
   * 8) Enhanced Coordinate Mapping
   **********************************************************/

  /**
   * Store current map dimensions to detect changes
   */
  function storeMapDimensions() {
    lastMapWidth = mainMap.offsetWidth;
    lastMapHeight = mainMap.offsetHeight;
  }

  /**
   * Check if map dimensions have changed
   */
  function checkMapDimensionChanges() {
    const currentWidth = mainMap.offsetWidth;
    const currentHeight = mainMap.offsetHeight;

    if (currentWidth !== lastMapWidth || currentHeight !== lastMapHeight) {
      console.log(
        "Map dimensions changed:",
        `${lastMapWidth}x${lastMapHeight} -> ${currentWidth}x${currentHeight}`
      );

      lastMapWidth = currentWidth;
      lastMapHeight = currentHeight;
      return true;
    }

    return false;
  }

  /**
   * Enhanced point-in-polygon detection that works on all screen sizes
   */
  function isPointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
      const xi = poly[i],
        yi = poly[i + 1];
      const xj = poly[j],
        yj = poly[j + 1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Check if a point is near a polygon (within tolerance)
   * This helps with touch accuracy on mobile devices
   */
  function isPointNearPolygon(x, y, poly, tolerance) {
    // First check if point is inside the polygon
    if (isPointInPolygon(x, y, poly)) {
      return true;
    }

    // If not inside, check if it's near any edge
    for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
      const xi = poly[i],
        yi = poly[i + 1];
      const xj = poly[j],
        yj = poly[j + 1];

      // Calculate distance from point to line segment
      const dist = distanceToSegment(x, y, xi, yi, xj, yj);
      if (dist <= tolerance) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate distance from point to line segment
   */
  function distanceToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**********************************************************
   * 9) Debug Functions
   **********************************************************/

  /**
   * Create debug overlay for visualizing coordinates
   */
  function createDebugOverlay() {
    debugOverlay = document.createElement("div");
    debugOverlay.style.position = "absolute";
    debugOverlay.style.top = "0";
    debugOverlay.style.left = "0";
    debugOverlay.style.width = "100%";
    debugOverlay.style.height = "100%";
    debugOverlay.style.pointerEvents = "none";
    debugOverlay.style.zIndex = "1000";

    const infoPanel = document.createElement("div");
    infoPanel.style.position = "absolute";
    infoPanel.style.top = "10px";
    infoPanel.style.left = "10px";
    infoPanel.style.padding = "5px";
    infoPanel.style.backgroundColor = "rgba(0,0,0,0.7)";
    infoPanel.style.color = "white";
    infoPanel.style.fontSize = "12px";
    infoPanel.style.fontFamily = "monospace";
    infoPanel.style.borderRadius = "3px";
    infoPanel.className = "debug-info";

    debugOverlay.appendChild(infoPanel);
    mapWrapper.appendChild(debugOverlay);

    updateDebugOverlay();
  }

  /**
   * Update debug overlay information
   */
  function updateDebugOverlay() {
    if (!debugOverlay) return;

    const infoPanel = debugOverlay.querySelector(".debug-info");
    if (!infoPanel) return;

    infoPanel.innerHTML = `
      Map size: ${mainMap.offsetWidth} x ${mainMap.offsetHeight}<br>
      Natural: ${mainMap.naturalWidth} x ${mainMap.naturalHeight}<br>
      Scale: ${(mainMap.offsetWidth / mainMap.naturalWidth).toFixed(2)}x, 
             ${(mainMap.offsetHeight / mainMap.naturalHeight).toFixed(2)}y<br>
      Device: ${window.innerWidth} x ${window.innerHeight} (${
      window.devicePixelRatio
    }x)
    `;
  }

  /**
   * Show a debug point where user clicked/touched
   */
  function showDebugPoint(x, y) {
    if (!debugOverlay) return;

    const point = document.createElement("div");
    point.style.position = "absolute";
    point.style.width = "10px";
    point.style.height = "10px";
    point.style.borderRadius = "50%";
    point.style.backgroundColor = "red";
    point.style.top = y - 5 + "px";
    point.style.left = x - 5 + "px";
    point.style.pointerEvents = "none";

    debugOverlay.appendChild(point);

    // Remove after 2 seconds
    setTimeout(() => {
      point.remove();
    }, 2000);
  }

  /**********************************************************
   * 10) Auto Highlight Cycle
   **********************************************************/
  function startAutoCycle() {
    if (!userInteracted) {
      autoCycleInterval = setInterval(() => {
        if (!allZones.length) return;
        const randomIndex = Math.floor(Math.random() * allZones.length);
        const randomZone = allZones[randomIndex];

        // Clear current highlights
        document.querySelectorAll(".zone-highlight").forEach((highlight) => {
          highlight.classList.remove("active");
        });

        // Highlight random zone
        const highlight = document.querySelector(
          `.zone-highlight.zone-${randomIndex}`
        );
        if (highlight) highlight.classList.add("active");
      }, 3000);
    }
  }

  function stopAutoCycle() {
    if (autoCycleInterval) {
      clearInterval(autoCycleInterval);
      autoCycleInterval = null;
    }
  }

  /**********************************************************
   * 11) Mobile First Tap Handling
   **********************************************************/
  function handleFirstTap(title) {
    // Highlight the tapped zone
    highlightZone(title);

    // Show zone name above finger
    zoneLabel.textContent = formatZoneTitle(title);
    zoneLabel.style.opacity = "1";

    // Store this zone as last clicked
    lastClickedZone = title;
    isFirstTap = false;

    // Reset state after a delay
    setTimeout(resetTapState, 5000);
  }

  function resetTapState() {
    isFirstTap = true;
    lastClickedZone = null;
    zoneLabel.style.opacity = "0";
    updateAreaHighlights(); // Reset highlights
  }

  /**********************************************************
   * 12) Modal Display and Control
   **********************************************************/
  function openZoneModal(title) {
    resetTapState();

    // Find zone index
    currentZoneIndex = findZoneIndexByTitle(title);
    if (currentZoneIndex === -1) {
      console.error("Zone not found:", title);
      return;
    }

    // Reset image index
    currentImageIndex = 0;

    // Show the current image
    showCurrentImage();

    // Add region navigation shortcuts if mobile
    if (isMobile) {
      addRegionNavigationShortcuts();
    }

    // Show the modal
    zoneModal.classList.add("active");

    // Setup navigation buttons
    setupModalNavigation();
  }

  /**
   * Add region navigation shortcuts for mobile users
   */
  function addRegionNavigationShortcuts() {
    // Get or create the shortcuts container
    let shortcutsContainer = document.querySelector(".region-shortcuts");

    if (!shortcutsContainer) {
      shortcutsContainer = document.createElement("div");
      shortcutsContainer.className = "region-shortcuts";
      shortcutsContainer.style.display = "flex";
      shortcutsContainer.style.justifyContent = "center";
      shortcutsContainer.style.padding = "10px 0";
      shortcutsContainer.style.borderTop = "1px solid #eee";
      shortcutsContainer.style.marginTop = "10px";

      // Append to modal body
      const modalBody = document.querySelector(".modal-body");
      if (modalBody) {
        modalBody.appendChild(shortcutsContainer);
      }
    } else {
      // Clear existing shortcuts
      shortcutsContainer.innerHTML = "";
    }

    // Define the regions we want shortcuts for
    const regions = [
      { label: "DT", pattern: "Downtown" },
      { label: "NE", pattern: "NorthEast" },
      { label: "NW", pattern: "NorthWest" },
      { label: "SE", pattern: "SouthEast" },
      { label: "SW", pattern: "SouthWest" },
    ];

    // Create a button for each region
    regions.forEach((region) => {
      const btn = document.createElement("button");
      btn.textContent = region.label;
      btn.style.margin = "0 5px";
      btn.style.padding = "8px 12px";
      btn.style.backgroundColor = "#f0f0f0";
      btn.style.border = "1px solid #ccc";
      btn.style.borderRadius = "4px";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "14px";
      btn.style.fontWeight = "bold";
      btn.title = region.pattern; // Add tooltip for full region name

      // Highlight the current region's button
      const currentZone = allZones[currentZoneIndex];
      if (currentZone && currentZone.title.includes(region.pattern)) {
        btn.style.backgroundColor = "#3498db";
        btn.style.color = "white";
      }

      // Add click handler
      btn.addEventListener("click", () => {
        navigateToRegion(region.pattern);
      });

      shortcutsContainer.appendChild(btn);
    });
  }

  /**
   * Navigate to the first zone that matches the region pattern
   */
  function navigateToRegion(regionPattern) {
    // Find the first zone that matches the pattern
    const zoneIndex = allZones.findIndex((zone) =>
      zone.title.includes(regionPattern)
    );

    if (zoneIndex !== -1) {
      // Update current zone index
      currentZoneIndex = zoneIndex;
      // Reset image index
      currentImageIndex = 0;
      // Show the new zone
      showCurrentImage();
      // Update the shortcuts to highlight the current region
      if (isMobile) {
        addRegionNavigationShortcuts();
      }
      // Update the title
      modalTitle.textContent = formatZoneTitle(
        allZones[currentZoneIndex].title
      );
    }
  }

  function showCurrentImage() {
    if (!allZones.length) return;
    const zoneObj = allZones[currentZoneIndex];
    if (!zoneObj) return;

    const images = zoneObj.imagePaths;
    if (!images || !images.length) {
      sliderContainer.innerHTML = `<p style="color:red;text-align:center;">No images found for ${zoneObj.title}</p>`;
      modalTitle.textContent = formatZoneTitle(zoneObj.title);
      return;
    }

    // Clear old image
    sliderContainer.innerHTML = "";

    // Build new image
    const img = document.createElement("img");
    img.className = "slider-image fade-transition";
    const imgSrc = images[currentImageIndex];
    img.src = imgSrc;
    img.alt = formatZoneTitle(zoneObj.title);

    // Add loading indicator and error handling
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "image-loading";
    loadingDiv.textContent = "Loading image...";
    sliderContainer.appendChild(loadingDiv);

    // Image error handling
    img.onerror = function () {
      loadingDiv.remove();
      sliderContainer.innerHTML = `
        <div style="color:red;text-align:center;padding:20px;">
          <p>Error loading image: ${imgSrc}</p>
          <p>Please check that the image exists in the repository.</p>
        </div>`;
      console.error("Failed to load image:", imgSrc);
    };

    // Image load success
    img.onload = function () {
      loadingDiv.remove();
      // Clicking the image => fullscreen
      img.addEventListener("click", () => {
        showFullscreen(img.src, zoneObj.title);
      });
    };

    sliderContainer.appendChild(img);
    modalTitle.textContent = formatZoneTitle(zoneObj.title);

    // Update navigation buttons visibility
    if (images && images.length > 1) {
      prevButton.style.display = "block";
      nextButton.style.display = "block";
    } else {
      prevButton.style.display = "none";
      nextButton.style.display = "none";
    }
  }

  function setupModalNavigation() {
    // Setup navigation buttons
    prevButton.onclick = prevImage;
    nextButton.onclick = nextImage;
    closeButton.onclick = closeModal;

    // Setup swipe gestures for mobile
    setupCarouselSwipeGestures();

    // Setup keyboard navigation
    document.addEventListener("keydown", handleModalKeydown);
  }

  /**
   * Add swipe gesture support for the carousel
   */
  function setupCarouselSwipeGestures() {
    // Touch variables
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // Minimum distance required for a swipe

    if (!sliderContainer) return;

    sliderContainer.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    sliderContainer.addEventListener(
      "touchend",
      function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      // Calculate swipe distance
      const swipeDistance = touchEndX - touchStartX;

      // Check if swipe is significant enough
      if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe right -> Previous image
          prevImage();
        } else {
          // Swipe left -> Next image
          nextImage();
        }
      }
    }
  }

  function handleModalKeydown(e) {
    if (zoneModal.classList.contains("active")) {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "Escape") {
        closeModal();
      }
    } else if (fullscreenView.classList.contains("active")) {
      if (e.key === "Escape") {
        closeFullscreen();
      }
    }
  }

  /**********************************************************
   * 13) Next/Prev image in the same zone
   **********************************************************/
  function nextImage() {
    if (!allZones.length) return;
    const zoneObj = allZones[currentZoneIndex];
    if (!zoneObj) return;

    const images = zoneObj.imagePaths;
    currentImageIndex = (currentImageIndex + 1) % images.length;
    showCurrentImage();

    // Make sure title is always in sync with the current zone
    modalTitle.textContent = formatZoneTitle(zoneObj.title);
  }

  function prevImage() {
    if (!allZones.length) return;
    const zoneObj = allZones[currentZoneIndex];
    if (!zoneObj) return;

    const images = zoneObj.imagePaths;
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    showCurrentImage();

    // Make sure title is always in sync with the current zone
    modalTitle.textContent = formatZoneTitle(zoneObj.title);
  }

  /**********************************************************
   * 14) Modal Close
   **********************************************************/
  function closeModal() {
    zoneModal.classList.remove("active");
    // Remove keyboard event listener
    document.removeEventListener("keydown", handleModalKeydown);
  }

  /**********************************************************
   * 15) Fullscreen
   **********************************************************/
  function showFullscreen(src, title) {
    fullscreenImageContainer.innerHTML = "";

    // Show loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.style.color = "white";
    loadingDiv.style.textAlign = "center";
    loadingDiv.style.padding = "20px";
    loadingDiv.textContent = "Loading full resolution image...";
    fullscreenImageContainer.appendChild(loadingDiv);

    // Create and preload image
    const fsImg = document.createElement("img");

    fsImg.onload = function () {
      loadingDiv.remove();
      fullscreenImageContainer.appendChild(fsImg);
    };

    fsImg.onerror = function () {
      loadingDiv.textContent = "Error loading image";
      loadingDiv.style.color = "red";
    };

    fsImg.src = src;
    fsImg.alt = formatZoneTitle(title);

    // Show fullscreen view
    fullscreenView.classList.add("active");

    // Setup close button
    closeFullscreenButton.onclick = closeFullscreen;

    // Close when clicking background
    fullscreenView.onclick = function (e) {
      if (e.target === fullscreenView) {
        closeFullscreen();
      }
    };
  }

  function closeFullscreen() {
    fullscreenView.classList.remove("active");
  }

  /**********************************************************
   * 16) Helper Functions
   **********************************************************/
  function formatZoneTitle(title) {
    return title
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  function findZoneIndexByTitle(title) {
    return allZones.findIndex((zone) => zone.title === title);
  }

  function highlightZone(title) {
    // Clear all highlights first
    document.querySelectorAll(".zone-highlight").forEach((highlight) => {
      highlight.classList.remove("active");
      // Reset SVG attributes
      highlight.setAttribute("fill-opacity", "0");
      highlight.setAttribute("stroke-opacity", "0");
    });

    // Find the zone index
    const zoneIndex = findZoneIndexByTitle(title);
    if (zoneIndex === -1) return;

    // Highlight this zone
    const highlight = document.querySelector(
      `.zone-highlight.zone-${zoneIndex}`
    );
    if (highlight) {
      highlight.classList.add("active");
      // Set SVG attributes directly in addition to class
      highlight.setAttribute("fill-opacity", "0.6");
      highlight.setAttribute("stroke-opacity", "1");
    }
  }

  /**
   * Check if an image exists at the given URL
   */
  function checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Initialize the map when DOM is ready
  init();
  setupMapAreaInteraction();

  // Make map initialized flag global to prevent duplicate initialization
  window.mapInitialized = true;
});

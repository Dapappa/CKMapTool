/**********************************************************
 * CKMapTool - Interactive Map Tool with Dynamic Image Loading
 *
 * Enhanced for all device sizes with improved coordinate mapping
 * Cross-browser compatibility improvements added
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

  // Make zoneImageMap configurable - can be overridden before init
  window.CKMapConfig = window.CKMapConfig || {};
  window.CKMapConfig.zoneImageMap = window.CKMapConfig.zoneImageMap || {
    // Default zone images if not provided
    NorthWestAreaA: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152ca79e102efac06d9c_Northwest%20Calgary%20Distribution%20Map%20(3)-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152cf32904d35d17f639_Northwest%20Calgary%20Distribution%20Map%20(3)-2.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152d08ea1ae1f650e810_Northwest%20Calgary%20Distribution%20Map%20(3)-3.png",
    ],
    NorthWestAreaB: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152ca79e102efac06d9c_Northwest%20Calgary%20Distribution%20Map%20(3)-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152cf32904d35d17f639_Northwest%20Calgary%20Distribution%20Map%20(3)-2.png",
    ],
    NorthWestAreaC: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152ca79e102efac06d9c_Northwest%20Calgary%20Distribution%20Map%20(3)-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152cf32904d35d17f639_Northwest%20Calgary%20Distribution%20Map%20(3)-2.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152d08ea1ae1f650e810_Northwest%20Calgary%20Distribution%20Map%20(3)-3.png",
    ],
    NorthEastAreaA: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152c2d59410587b5d1bf_North%20East-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152ce965c5b385b91dbc_North%20East-2.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152d32c401d798b756d5_North%20East-3.png",
    ],
    NorthEastAreaB: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152c2d59410587b5d1bf_North%20East-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152ce965c5b385b91dbc_North%20East-2.png",
    ],
    NorthEastAreaC: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152c2d59410587b5d1bf_North%20East-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152ce965c5b385b91dbc_North%20East-2.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152d32c401d798b756d5_North%20East-3.png",
    ],
    DowntownAreaA: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce1656df0450fd7aa4d763_Downtown%20Calgary%20Map%20(1)-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce16564099212dfea6b2b2_Downtown%20Calgary%20Map%20(1)-2.png",
    ],
    DowntownAreaB: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce1656df0450fd7aa4d763_Downtown%20Calgary%20Map%20(1)-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce16564099212dfea6b2b2_Downtown%20Calgary%20Map%20(1)-2.png",
    ],
    SouthEastAreaA: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67c1d2b874833dd5316b3ca8_South%20East%20Completed-2.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67c1d2b874833dd5316b3ca8_South%20East%20Completed-2.png",
    ],
    SouthEastAreaB: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67c1d2b874833dd5316b3ca8_South%20East%20Completed-2.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67c1d2b874833dd5316b3ca8_South%20East%20Completed-2.png",
    ],
    SouthWestAreaA: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152c3c238822c45316cd_Southwest%20Map%20(2)-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152c530f75df6093d3d7_Southwest%20Map%20(2)-2.png",
    ],
    SouthWestAreaB: [
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152c3c238822c45316cd_Southwest%20Map%20(2)-1.png",
      "https://cdn.prod.website-files.com/64d572ccd997a626d3de38d6/67ce152c530f75df6093d3d7_Southwest%20Map%20(2)-2.png",
    ],
  };

  // State variables
  let allZones = [];
  let currentZoneIndex = 0;
  let currentImageIndex = 0;
  let autoCycleInterval = null;
  let userInteracted = false;
  let isFirstTap = true;
  let lastClickedZone = null;
  let isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  let lastMapWidth = 0;
  let lastMapHeight = 0;
  let debugMode = false; // Set to true for debugging coordinate mapping
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  let isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  let isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  // Create an overlay for debugging if in debug mode
  let debugOverlay = null;

  /**********************************************************
   * 2) Cross-browser compatibility helpers
   **********************************************************/

  // Passive event listener option for better scrolling performance
  const passiveOption = { passive: true };

  // Feature detection for passive event listeners
  let supportsPassive = false;
  try {
    window.addEventListener(
      "test",
      null,
      Object.defineProperty({}, "passive", {
        get: function () {
          supportsPassive = true;
          return true;
        },
      })
    );
  } catch (e) {}

  // Get event position accounting for various browser differences
  function getEventPosition(e) {
    // For touch events
    if (e.touches && e.touches.length) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
    // For mouse events
    else {
      return {
        x: e.clientX,
        y: e.clientY,
      };
    }
  }

  // Polyfill for Element.closest for older browsers
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      let el = this;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  // Polyfill for Element.matches
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  /**********************************************************
   * 3) Initialize
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
    console.log(
      "Zones detected:",
      Object.keys(window.CKMapConfig.zoneImageMap).length
    );
    console.log("Screen size:", window.innerWidth, "x", window.innerHeight);
    console.log("Device pixel ratio:", window.devicePixelRatio);
    console.log("Is mobile:", isMobile);
    console.log("Browser detection:", {
      iOS: isIOS,
      Firefox: isFirefox,
      Safari: isSafari,
      TouchDevice: isTouchDevice,
    });

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
    }

    // Add window resize handler with debounce
    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        updateAreaHighlights();
        checkMapDimensionChanges();
        if (debugMode) {
          updateDebugOverlay();
        }
      }, 250); // 250ms debounce
    });

    // Setup keyboard shortcuts
    addRegionNavigationShortcuts();

    // Set up modal navigation event listeners
    setupModalNavigation();

    // Add swipe gestures for mobile
    if (isTouchDevice) {
      setupCarouselSwipeGestures();
    }

    // Handle initial overlay
    if (initialOverlay) {
      // Hide overlay after a delay or on touch/click
      setTimeout(() => {
        initialOverlay.classList.add("hide");
      }, 5000);

      initialOverlay.addEventListener("click", function () {
        initialOverlay.classList.add("hide");
      });

      if (isTouchDevice) {
        initialOverlay.addEventListener("touchstart", function () {
          initialOverlay.classList.add("hide");
        });
      }
    }
  }

  /**********************************************************
   * 4) Zone Initialization
   **********************************************************/
  function initializeZones() {
    if (!mapAreas.length) {
      console.error("No map areas found!");
      return;
    }

    allZones = [];

    // Reference to the configurable zoneImageMap
    const zoneImageMap = window.CKMapConfig.zoneImageMap;

    // Build the zones array from <area> + zoneImageMap
    if (mapAreas) {
      Array.from(mapAreas).forEach((area) => {
        const title = area.getAttribute("title");
        const shape = area.getAttribute("shape");

        console.log("Found area:", title);
      });

      console.log("Zones detected:", Object.keys(zoneImageMap).length);
    }

    // Parse coordinates from area elements
    mapAreas.forEach((area) => {
      try {
        const coords = area.getAttribute("coords").split(",").map(Number);
        const shape = area.getAttribute("shape");
        const title = area.getAttribute("title");

        // Skip if no title or not in zoneImageMap
        if (!title || !zoneImageMap[title]) return;

        // Create zone object for internal use
        const zone = {
          title: title,
          coords: coords,
          shape: shape,
          imagePaths: zoneImageMap[title],
          element: area,
        };

        allZones.push(zone);
      } catch (e) {
        console.error("Error parsing zone data:", e);
      }
    });

    console.log(`Processed ${allZones.length} active zones`);
  }

  /**********************************************************
   * 5) Area Highlights Creation
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
   * 6) Map Area Interaction
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
   * 7) Area Highlight Updates
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
   * 8) Touch Events and Coordinate Handling
   **********************************************************/
  function setupTouchEvents() {
    // Use the existing implementation but with passive option for better performance
    if (mapContainer) {
      mapContainer.addEventListener(
        "touchstart",
        function (e) {
          const pos = getEventPosition(e);
          const touch = { x: pos.x, y: pos.y };
          checkZoneHover(touch.x, touch.y);
        },
        supportsPassive ? passiveOption : false
      );

      mapContainer.addEventListener(
        "touchmove",
        function (e) {
          const pos = getEventPosition(e);
          const touch = { x: pos.x, y: pos.y };
          checkZoneHover(touch.x, touch.y);
        },
        supportsPassive ? passiveOption : false
      );
    }
  }

  /**
   * Setup click events with improved browser compatibility
   */
  function setupClickEvents() {
    // Use the existing implementation but with compatibility helper
    if (mapContainer) {
      mapContainer.addEventListener("click", function (e) {
        const pos = getEventPosition(e);
        checkZoneHover(pos.x, pos.y);
      });
    }
  }

  /**********************************************************
   * 9) Enhanced Coordinate Mapping
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
   * 10) Debug Functions
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
   * 11) Auto Highlight Cycle
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
   * 12) Mobile First Tap Handling
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
   * 13) Modal Display and Control
   **********************************************************/
  function openZoneModal(title) {
    resetTapState();

    // Reference to the configurable zoneImageMap
    const zoneImageMap = window.CKMapConfig.zoneImageMap;

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

    // Set modal title
    modalTitle.textContent = formatZoneTitle(title);
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
   * Setup carousel swipe gestures with improved browser compatibility
   */
  function setupCarouselSwipeGestures() {
    if (!sliderContainer) return;

    let touchstartX = 0;
    let touchendX = 0;
    let touchstartY = 0;
    let touchendY = 0;

    sliderContainer.addEventListener(
      "touchstart",
      function (e) {
        const pos = getEventPosition(e);
        touchstartX = pos.x;
        touchstartY = pos.y;
      },
      supportsPassive ? passiveOption : false
    );

    sliderContainer.addEventListener(
      "touchend",
      function (e) {
        const pos = getEventPosition(e);
        touchendX = pos.x;
        touchendY = pos.y;
        handleSwipe();
      },
      supportsPassive ? passiveOption : false
    );

    function handleSwipe() {
      const threshold = 50;
      const xDiff = touchendX - touchstartX;
      const yDiff = touchendY - touchstartY;

      // Only handle horizontal swipes that are more horizontal than vertical
      if (Math.abs(xDiff) > threshold && Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
          prevImage();
        } else {
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
    // Reference to the configurable zoneImageMap
    const zoneImageMap = window.CKMapConfig.zoneImageMap;

    if (!lastClickedZone) return;

    const zoneTitle = lastClickedZone;
    const images = zoneImageMap[zoneTitle] || [];

    currentImageIndex = (currentImageIndex + 1) % images.length;
    showCurrentImage();

    // Make sure title is always in sync with the current zone
    modalTitle.textContent = formatZoneTitle(zoneTitle);
  }

  function prevImage() {
    // Reference to the configurable zoneImageMap
    const zoneImageMap = window.CKMapConfig.zoneImageMap;

    if (!lastClickedZone) return;

    const zoneTitle = lastClickedZone;
    const images = zoneImageMap[zoneTitle] || [];

    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    showCurrentImage();

    // Make sure title is always in sync with the current zone
    modalTitle.textContent = formatZoneTitle(zoneTitle);
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

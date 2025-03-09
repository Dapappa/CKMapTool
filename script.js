document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const mapWrapper = document.querySelector(".map-wrapper");
  const mainMap = document.querySelector(".main-map");
  const zoneLabel = document.querySelector(".zone-label");
  const zoneModal = document.querySelector(".zone-modal");
  const modalTitle = document.querySelector(".modal-title");
  const closeButton = document.querySelector(".close-button");
  const sliderContainer = document.querySelector(".slider-container");
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");
  const mapAreas = document.querySelectorAll("area");
  const initialOverlay = document.querySelector(".initial-overlay");
  const fullscreenView = document.querySelector(".fullscreen-view");
  const closeFullscreenBtn = document.querySelector(".close-fullscreen");
  const fullscreenImageContainer = document.querySelector(
    ".fullscreen-image-container"
  );

  // Create a div for map overlay (for dimming effect)
  const mapOverlay = document.createElement("div");
  mapOverlay.className = "map-overlay";
  mapWrapper.appendChild(mapOverlay);

  // Variables
  let allZones = []; // All zones (title + array of images)
  let zoneHighlights = {}; // Stores SVG overlays
  let autoCycleInterval = null; // For random highlight cycling
  let userInteracted = false; // True after user clicks/taps
  let lastClickedZone = null; // Track two-tap logic
  let isFirstTap = true; // Two-tap logic for mobile
  let isMobile = window.innerWidth <= 768;

  // Current zone + index of the image within that zone
  let currentZoneIndex = 0;
  let currentImageIndex = 0;

  /**********************************************************
   * 1) Multi-Image Arrays for Each Zone (Root-Level Files)
   **********************************************************/
  const zoneImageMap = {
    // ========== NorthWest ==========
    NorthWestAreaA: [
      "north-west-area-a.jpg",
      "north-west-area-a-2.jpg",
      "north-west-area-a-3.jpg",
    ],
    NorthWestAreaB: [
      "Northwest Calgary Distribution Map (3)-1.png",
      "Northwest Calgary Distribution Map (3)-2.png",
    ],
    NorthWestAreaC: ["Northwest Calgary Distribution Map (3)-3.png"],

    // ========== NorthEast ==========
    NorthEastAreaA: [
      "North East-1.png",
      "North East-2.png",
      "North East-3.png",
    ],
    NorthEastAreaB: ["North East-1.png", "North East-2.png"],
    NorthEastAreaC: ["North East-3.png"],

    // ========== Downtown ==========
    DowntownAreaA: [
      "Downtown Calgary Map (1)-1.png",
      "Downtown Calgary Map (1)-2.png",
    ],
    DowntownAreaB: [
      "Downtown Calgary Map (1)-1.png",
      "Downtown Calgary Map (1)-2.png",
    ],

    // ========== SouthEast ==========
    SouthEastAreaA: [
      "South East Completed (2)-1.png",
      "South East Completed (2)-2.png",
    ],
    SouthEastAreaB: [
      "South East Completed (2)-1.png",
      "South East Completed (2)-2.png",
    ],

    // ========== SouthWest ==========
    SouthWestAreaA: ["Southwest Map (2)-1.png", "Southwest Map (2)-2.png"],
    SouthWestAreaB: ["Southwest Map (2)-1.png", "Southwest Map (2)-2.png"],
  };

  // The base URL for root-level images in your GitHub repo
  const imageBaseURL = "https://cdn.jsdelivr.net/gh/Dapappa/CKMapTool@latest/";

  /**********************************************************
   * 2) Initialize
   **********************************************************/
  function init() {
    // Build the zones array from <area> + zoneImageMap
    initializeZones();

    // Debug info
    console.log("CKMapTool initialized");
    console.log("Zones detected:", Object.keys(zoneImageMap).length);
    console.log("imageBaseURL:", imageBaseURL);

    // Once the map is loaded, create the polygon overlays
    if (mainMap.complete) {
      createAreaHighlights();
      updateAreaHighlights();
    } else {
      mainMap.onload = function () {
        console.log("Main map loaded successfully");
        createAreaHighlights();
        updateAreaHighlights();
      };

      mainMap.onerror = function () {
        console.error("Failed to load main map:", mainMap.src);
      };
    }

    // Two-tap mobile
    setupTouchEvents();

    // Hide the "Tap a region to explore" after 5s
    setTimeout(() => {
      initialOverlay.classList.add("hide");
    }, 5000);

    // Start random highlight cycling
    startAutoCycle();

    // Stop auto-cycling on click
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
        updateAreaHighlights();
      }, 250);
    });

    setTimeout(() => {
      updateAreaHighlights();
    }, 500);

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        updateAreaHighlights();
      }, 200);
    });
  }

  /**********************************************************
   * 3) Build Zones Array
   **********************************************************/
  function initializeZones() {
    mapAreas.forEach((area) => {
      const title = area.getAttribute("title");
      if (title && zoneImageMap[title]) {
        // The zone has multiple images
        allZones.push({
          title: title,
          imagePaths: zoneImageMap[title],
        });
      }
    });
  }

  /**********************************************************
   * 4) Create SVG Overlays
   **********************************************************/
  function createAreaHighlights() {
    if (!mainMap.complete) {
      console.log("Main map not yet loaded, waiting...");
      mainMap.onload = createAreaHighlights;
      return;
    }

    console.log("Creating area highlights for", mapAreas.length, "areas");

    // Debug check if mapAreas is accessible
    if (mapAreas.length === 0) {
      console.error(
        "ERROR: No map areas found! Check that the <map> and <area> tags are correct."
      );
      console.log(
        "Map element exists:",
        !!document.querySelector('map[name="image-map"]')
      );
      return;
    }

    mapAreas.forEach((area, index) => {
      if (area.getAttribute("shape") === "poly") {
        const coords = area.getAttribute("coords").split(",");
        const title = area.getAttribute("title");
        console.log(
          `Processing area ${index + 1}: ${title} with ${
            coords.length / 2
          } points`
        );

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("class", "zone-highlight");
        svg.setAttribute("data-zone", title);
        Object.assign(svg.style, {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Make sure SVG doesn't block clicks
        });

        const polygon = document.createElementNS(svgNS, "polygon");

        const scaleX = mainMap.width / mainMap.naturalWidth;
        const scaleY = mainMap.height / mainMap.naturalHeight;

        console.log(
          `Map dimensions: ${mainMap.width}x${mainMap.height}, Scale: ${scaleX}x${scaleY}`
        );

        let points = "";
        for (let i = 0; i < coords.length; i += 2) {
          const x = parseFloat(coords[i]) * scaleX;
          const y = parseFloat(coords[i + 1]) * scaleY;
          points += `${x},${y} `;
        }
        polygon.setAttribute("points", points.trim());
        polygon.setAttribute("fill", "#3498db");
        polygon.setAttribute("fill-opacity", "0.3");
        polygon.setAttribute("stroke", "#2980b9");
        polygon.setAttribute("stroke-width", "2");

        svg.appendChild(polygon);
        mapWrapper.appendChild(svg);

        zoneHighlights[title] = svg;
      }
    });

    window.addEventListener("resize", updateAreaHighlights);

    // Make sure every area has event listeners properly attached
    console.log("Setting up event listeners for map areas");
    setupMapAreaInteraction();
  }

  /**********************************************************
   * Enhanced map area interaction setup
   **********************************************************/
  function setupMapAreaInteraction() {
    mapAreas.forEach((area, index) => {
      const title = area.getAttribute("title");
      console.log(`Setting up interactions for ${title}`);

      // Make sure href="#" doesn't navigate
      area.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Area clicked:", title);

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
      });

      // On desktop hover
      area.addEventListener("mouseover", function (e) {
        console.log("Hover on:", title);
        if (isMobile || lastClickedZone) return;
        zoneLabel.textContent = formatZoneTitle(title);
        zoneLabel.style.opacity = "1";
        if (zoneHighlights[title]) {
          zoneHighlights[title].style.opacity = "1";
          zoneHighlights[title].style.transform = "scale(1.01)";
        }
        mapOverlay.style.opacity = "1";
      });

      area.addEventListener("mouseout", function () {
        if (isMobile || lastClickedZone) return;
        zoneLabel.style.opacity = "0";
        if (zoneHighlights[title]) {
          zoneHighlights[title].style.opacity = "0";
          zoneHighlights[title].style.transform = "scale(1)";
        }
        mapOverlay.style.opacity = "0";
      });
    });

    // Directly add a click handler to the image map as well
    mainMap.addEventListener("click", function (e) {
      const rect = mainMap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      console.log(`Map clicked at ${x},${y}`);

      // Find which area was clicked
      for (let i = 0; i < mapAreas.length; i++) {
        const area = mapAreas[i];
        if (area.getAttribute("shape") === "poly") {
          const coords = area.getAttribute("coords").split(",").map(Number);
          if (isPointInPolygon(x, y, coords)) {
            const title = area.getAttribute("title");
            console.log("Found area:", title);
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
            break;
          }
        }
      }
    });
  }

  /**********************************************************
   * 5) Update Overlays on Resize
   **********************************************************/
  function updateAreaHighlights() {
    const mapWidth =
      mainMap.width || mainMap.clientWidth || mainMap.offsetWidth;
    const mapHeight =
      mainMap.height || mainMap.clientHeight || mainMap.offsetHeight;
    const naturalWidth = mainMap.naturalWidth;
    const naturalHeight = mainMap.naturalHeight;

    const scaleX = mapWidth / naturalWidth;
    const scaleY = mapHeight / naturalHeight;

    mapAreas.forEach((area) => {
      if (area.getAttribute("shape") === "poly") {
        const coords = area.getAttribute("coords").split(",");
        const title = area.getAttribute("title");
        const svg = zoneHighlights[title];
        if (svg) {
          const polygon = svg.querySelector("polygon");

          let points = "";
          for (let i = 0; i < coords.length; i += 2) {
            const x = parseFloat(coords[i]) * scaleX;
            const y = parseFloat(coords[i + 1]) * scaleY;
            points += `${x},${y} `;
          }
          polygon.setAttribute("points", points.trim());
        }

        // Also update <area> coords for accurate click detection
        let newCoords = "";
        for (let i = 0; i < coords.length; i++) {
          const val = parseFloat(coords[i]);
          const newVal = i % 2 === 0 ? val * scaleX : val * scaleY;
          newCoords += Math.round(newVal) + ",";
        }
        newCoords = newCoords.slice(0, -1);
        area.setAttribute("coords", newCoords);
      }
    });
  }

  /**********************************************************
   * 6) Two-Tap Logic for Mobile
   **********************************************************/
  function setupTouchEvents() {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    mapWrapper.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = mapWrapper.getBoundingClientRect();
        const relativeX = touch.clientX - rect.left;
        const relativeY = touch.clientY - rect.top;

        let touchedArea = null;
        mapAreas.forEach((area) => {
          if (area.getAttribute("shape") === "poly") {
            const coords = area.getAttribute("coords").split(",").map(Number);
            if (isPointInPolygon(relativeX, relativeY, coords)) {
              touchedArea = area;
            }
          }
        });

        if (touchedArea) {
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
      },
      { passive: false }
    );
  }

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

  /**********************************************************
   * 7) Auto Highlight Cycle
   **********************************************************/
  function startAutoCycle() {
    if (!userInteracted) {
      autoCycleInterval = setInterval(() => {
        if (!allZones.length) return;
        const randomIndex = Math.floor(Math.random() * allZones.length);
        const randomZone = allZones[randomIndex];
        if (randomZone && zoneHighlights[randomZone.title]) {
          const hl = zoneHighlights[randomZone.title];
          hl.classList.add("auto-highlight");
          setTimeout(() => {
            hl.classList.remove("auto-highlight");
          }, 800);
        }
      }, 2000);
    }
  }
  function stopAutoCycle() {
    if (autoCycleInterval) {
      clearInterval(autoCycleInterval);
      autoCycleInterval = null;
    }
  }

  /**********************************************************
   * 8) Two-Tap: First Tap => highlight, second => open
   **********************************************************/
  function handleFirstTap(title) {
    zoneLabel.textContent = formatZoneTitle(title);
    zoneLabel.classList.add("active");

    if (zoneHighlights[title]) {
      zoneHighlights[title].style.opacity = "1";
      zoneHighlights[title].style.transform = "scale(1.01)";
    }
    lastClickedZone = title;
    isFirstTap = false;

    setTimeout(() => {
      if (lastClickedZone === title) {
        resetTapState();
      }
    }, 3000);
  }
  function resetTapState() {
    zoneLabel.classList.remove("active");
    Object.values(zoneHighlights).forEach((hl) => {
      hl.style.opacity = "0";
      hl.style.transform = "scale(1)";
    });
    lastClickedZone = null;
    isFirstTap = true;
    mapOverlay.style.opacity = "0";
  }

  /**********************************************************
   * 9) Opening the Modal (Multi-Image for that zone)
   **********************************************************/
  function openZoneModal(title) {
    console.log("Opening zone modal for:", title);
    const zoneIndex = findZoneIndexByTitle(title);

    if (zoneIndex === -1) {
      console.error("Zone not found:", title);
      console.log(
        "Available zones:",
        allZones.map((z) => z.title)
      );
      return;
    }

    currentZoneIndex = zoneIndex;
    currentImageIndex = 0;

    zoneModal.classList.add("active");
    console.log("Showing images for zone:", allZones[currentZoneIndex].title);
    console.log(
      "Number of images:",
      allZones[currentZoneIndex].imagePaths.length
    );
    showCurrentImage();
    resetTapState();
  }

  /**********************************************************
   * 10) Display the Current Image in the Carousel
   **********************************************************/
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
    const imgSrc = imageBaseURL + encodeURIComponent(images[currentImageIndex]);
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
  }

  /**********************************************************
   * 11) Next/Prev image in the same zone
   **********************************************************/
  function nextImage() {
    if (!allZones.length) return;
    const zoneObj = allZones[currentZoneIndex];
    if (!zoneObj) return;

    const images = zoneObj.imagePaths;
    currentImageIndex = (currentImageIndex + 1) % images.length;
    showCurrentImage();
  }
  function prevImage() {
    if (!allZones.length) return;
    const zoneObj = allZones[currentZoneIndex];
    if (!zoneObj) return;

    const images = zoneObj.imagePaths;
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    showCurrentImage();
  }

  /**********************************************************
   * 12) Close Modal
   **********************************************************/
  function closeModal() {
    zoneModal.classList.remove("active");
    resetTapState();
  }
  // Close if click outside content
  zoneModal.addEventListener("click", (e) => {
    if (e.target === zoneModal) {
      closeModal();
    }
  });

  /**********************************************************
   * 13) Fullscreen
   **********************************************************/
  function showFullscreen(src, title) {
    fullscreenImageContainer.innerHTML = "";
    const fsImg = document.createElement("img");
    fsImg.src = src;
    fsImg.alt = formatZoneTitle(title);
    fullscreenImageContainer.appendChild(fsImg);
    fullscreenView.classList.add("active");
  }
  function closeFullscreen() {
    fullscreenView.classList.remove("active");
  }
  fullscreenView.addEventListener("click", (e) => {
    if (e.target === fullscreenView) {
      closeFullscreen();
    }
  });

  /**********************************************************
   * 14) Format Title
   **********************************************************/
  function formatZoneTitle(title) {
    return title
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  function findZoneIndexByTitle(title) {
    return allZones.findIndex((z) => z.title === title);
  }

  /**********************************************************
   * 15) Keyboard Nav
   **********************************************************/
  document.addEventListener("keydown", function (e) {
    if (fullscreenView.classList.contains("active")) {
      if (e.key === "Escape") closeFullscreen();
    } else if (zoneModal.classList.contains("active")) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    }
  });

  /**********************************************************
   * 16) Hook Up Buttons
   **********************************************************/
  prevButton.addEventListener("click", prevImage);
  nextButton.addEventListener("click", nextImage);
  closeButton.addEventListener("click", closeModal);
  closeFullscreenBtn.addEventListener("click", closeFullscreen);

  /**********************************************************
   * 17) Desktop Hover Effects
   **********************************************************/
  mapAreas.forEach((area) => {
    // On desktop hover
    area.addEventListener("mouseover", function () {
      if (isMobile || lastClickedZone) return;
      const title = this.getAttribute("title");
      zoneLabel.textContent = formatZoneTitle(title);
      zoneLabel.style.opacity = "1";
      if (zoneHighlights[title]) {
        zoneHighlights[title].style.opacity = "1";
        zoneHighlights[title].style.transform = "scale(1.01)";
      }
      mapOverlay.style.opacity = "1";
    });
    area.addEventListener("mouseout", function () {
      if (isMobile || lastClickedZone) return;
      zoneLabel.style.opacity = "0";
      const title = this.getAttribute("title");
      if (zoneHighlights[title]) {
        zoneHighlights[title].style.opacity = "0";
        zoneHighlights[title].style.transform = "scale(1)";
      }
      mapOverlay.style.opacity = "0";
    });
    area.addEventListener("click", function () {
      userInteracted = true;
      stopAutoCycle();
    });
  });

  /**********************************************************
   * 18) Helper function to precheck image existence
   **********************************************************/
  function checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Initialize the entire script
  init();
});

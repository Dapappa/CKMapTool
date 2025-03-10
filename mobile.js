/**********************************************************
 * CKMapTool - Mobile-Specific Functions
 *
 * This file contains all the mobile-specific functionality
 * to make the map tool work well on mobile devices.
 *********************************************************/

document.addEventListener("DOMContentLoaded", function () {
  // Only initialize if not already initialized
  if (window.mobileInitialized) {
    console.log(
      "Mobile experience already initialized, skipping duplicate initialization"
    );
    return;
  }

  // Current carousel state
  let currentCarouselImages = [];
  let currentCarouselIndex = 0;

  /**
   * Initialize mobile experience
   */
  function initMobileExperience() {
    if (window.innerWidth > 768) return;

    console.log("Initializing mobile experience");

    // Get elements
    const mapWrapper = document.querySelector(".map-wrapper");
    const mobileRegionsContainer = document.querySelector(
      ".mobile-regions-container"
    );
    const mobileRegions = document.querySelectorAll(".mobile-region");
    const mobileCarouselContainer = document.querySelector(
      ".mobile-carousel-container"
    );
    const mobileCarousel = document.querySelector(".mobile-carousel");
    const carouselPrevButton = document.querySelector(".carousel-prev");
    const carouselNextButton = document.querySelector(".carousel-next");
    const carouselCloseButton = document.querySelector(".carousel-close");
    const viewFullscreenButton = document.querySelector(
      ".view-fullscreen-button"
    );

    // Add mobile fade class to map wrapper
    mapWrapper.classList.add("map-fade-out");

    // Set up tap event to hide map immediately and show regions
    mapWrapper.addEventListener("click", () => {
      mapWrapper.style.opacity = "0";
      mapWrapper.style.visibility = "hidden";
      mobileRegionsContainer.classList.add("active");
    });

    // After 2 seconds, show the mobile regions
    setTimeout(() => {
      mobileRegionsContainer.classList.add("active");
    }, 2000);

    // Set up region click events
    mobileRegions.forEach((region) => {
      region.addEventListener("click", () => {
        const regionName = region.getAttribute("data-region");
        showMobileCarousel(regionName);
      });
    });

    // Setup carousel navigation
    carouselPrevButton.addEventListener("click", prevCarouselImage);
    carouselNextButton.addEventListener("click", nextCarouselImage);
    carouselCloseButton.addEventListener("click", closeMobileCarousel);
    viewFullscreenButton.addEventListener("click", viewCurrentImageFullscreen);

    // Mobile swipe for carousel
    setupMobileCarouselSwipe();
  }

  /**
   * Get the image paths for a region
   */
  function getRegionImagePaths(regionName) {
    // Get zoneImageMap from window context (defined in main script)
    const zoneImageMap = window.zoneImageMap || {};

    // Map region names to zone titles
    const regionToZonesMap = {
      NorthWest: ["NorthWestAreaA", "NorthWestAreaB", "NorthWestAreaC"],
      NorthEast: ["NorthEastAreaA", "NorthEastAreaB", "NorthEastAreaC"],
      Downtown: ["DowntownAreaA", "DowntownAreaB"],
      SouthWest: ["SouthWestAreaA", "SouthWestAreaB"],
      SouthEast: ["SouthEastAreaA", "SouthEastAreaB"],
    };

    // Get all image paths for this region
    let allPaths = [];
    const zones = regionToZonesMap[regionName] || [];

    zones.forEach((zone) => {
      if (zoneImageMap[zone]) {
        allPaths = allPaths.concat(zoneImageMap[zone]);
      }
    });

    // Remove duplicates
    return [...new Set(allPaths)];
  }

  /**
   * Show the mobile 3D carousel for a region
   */
  function showMobileCarousel(regionName) {
    const mobileCarouselContainer = document.querySelector(
      ".mobile-carousel-container"
    );
    const mobileCarousel = document.querySelector(".mobile-carousel");

    // Get image paths for this region
    currentCarouselImages = getRegionImagePaths(regionName);
    currentCarouselIndex = 0;

    if (currentCarouselImages.length === 0) {
      console.error("No images found for region:", regionName);
      return;
    }

    // Clear previous carousel items
    mobileCarousel.innerHTML = "";

    // Create carousel items
    currentCarouselImages.forEach((src, index) => {
      const carouselItem = document.createElement("div");
      carouselItem.className = "carousel-item";

      if (index === 0) {
        carouselItem.classList.add("active");
      } else if (index === 1) {
        carouselItem.classList.add("next");
      } else if (index === currentCarouselImages.length - 1) {
        carouselItem.classList.add("prev");
      }

      const img = document.createElement("img");
      img.className = "carousel-image";
      img.src = src;
      img.alt = `${regionName} Map ${index + 1}`;

      const title = document.createElement("div");
      title.className = "carousel-title";
      title.textContent = `${regionName} - Map ${index + 1}`;

      carouselItem.appendChild(img);
      carouselItem.appendChild(title);
      mobileCarousel.appendChild(carouselItem);
    });

    // Show the carousel
    mobileCarouselContainer.classList.add("active");

    // Update carousel buttons visibility
    updateCarouselButtons();
  }

  /**
   * Navigate to the next image in the carousel
   */
  function nextCarouselImage() {
    if (currentCarouselIndex >= currentCarouselImages.length - 1) return;

    currentCarouselIndex++;
    updateCarouselDisplay();
  }

  /**
   * Navigate to the previous image in the carousel
   */
  function prevCarouselImage() {
    if (currentCarouselIndex <= 0) return;

    currentCarouselIndex--;
    updateCarouselDisplay();
  }

  /**
   * Update the carousel display based on current index
   */
  function updateCarouselDisplay() {
    const carouselItems = document.querySelectorAll(".carousel-item");

    carouselItems.forEach((item, index) => {
      // Remove all classes first
      item.classList.remove("active", "prev", "next");

      if (index === currentCarouselIndex) {
        item.classList.add("active");
      } else if (index === currentCarouselIndex + 1) {
        item.classList.add("next");
      } else if (index === currentCarouselIndex - 1) {
        item.classList.add("prev");
      }
    });

    updateCarouselButtons();
  }

  /**
   * Update the visibility of carousel navigation buttons
   */
  function updateCarouselButtons() {
    const prevButton = document.querySelector(".carousel-prev");
    const nextButton = document.querySelector(".carousel-next");

    if (prevButton && nextButton) {
      prevButton.style.visibility =
        currentCarouselIndex > 0 ? "visible" : "hidden";
      nextButton.style.visibility =
        currentCarouselIndex < currentCarouselImages.length - 1
          ? "visible"
          : "hidden";
    }
  }

  /**
   * Close the mobile carousel
   */
  function closeMobileCarousel() {
    const mobileCarouselContainer = document.querySelector(
      ".mobile-carousel-container"
    );
    if (mobileCarouselContainer) {
      mobileCarouselContainer.classList.remove("active");
    }
  }

  /**
   * View the current carousel image in fullscreen
   */
  function viewCurrentImageFullscreen() {
    if (currentCarouselImages.length === 0) return;

    const currentSrc = currentCarouselImages[currentCarouselIndex];
    const carouselTitle = document.querySelector(".carousel-title");
    const regionName = carouselTitle
      ? carouselTitle.textContent.split(" - ")[0]
      : "Region";

    // Use the main script's showFullscreen function
    if (typeof window.showFullscreen === "function") {
      window.showFullscreen(currentSrc, regionName);
    } else {
      console.error("showFullscreen function not available");
    }
  }

  /**
   * Setup touch swipe gestures for the mobile carousel
   */
  function setupMobileCarouselSwipe() {
    const carousel = document.querySelector(".mobile-carousel");
    if (!carousel) return;

    let startX, moveX, startY, moveY;
    let threshold = 50; // Minimum distance to be considered a swipe

    carousel.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    carousel.addEventListener("touchmove", (e) => {
      moveX = e.touches[0].clientX;
      moveY = e.touches[0].clientY;

      // Prevent vertical scrolling when swiping horizontally
      if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
        e.preventDefault();
      }
    });

    carousel.addEventListener("touchend", () => {
      if (!moveX || !startX) return;

      const diffX = startX - moveX;

      // Check if the gesture was a horizontal swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swipe left, go to next image
          nextCarouselImage();
        } else {
          // Swipe right, go to previous image
          prevCarouselImage();
        }
      }

      // Reset values
      startX = null;
      moveX = null;
    });
  }

  // Check if we're on mobile and initialize if needed
  if (window.innerWidth <= 768) {
    initMobileExperience();
  }

  // Listen for resize events to initialize mobile experience if needed
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768 && !window.mobileInitialized) {
      initMobileExperience();
    }
  });

  // Export functions to window for external access
  window.initMobileExperience = initMobileExperience;

  // Set flag to prevent duplicate initialization
  window.mobileInitialized = true;
});

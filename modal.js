document.addEventListener("DOMContentLoaded", function () {
  // Make sure zone modal can be activated
  const areas = document.querySelectorAll("area");
  const zoneModal = document.querySelector(".zone-modal");
  const closeButton = document.querySelector(".close-button");
  const mapImage = document.querySelector(".main-map");
  const mapWrapper = document.querySelector(".map-wrapper");
  const initialOverlay = document.querySelector(".initial-overlay");
  const fullscreenView = document.querySelector(".fullscreen-view");
  const closeFullscreenButton = document.querySelector(".close-fullscreen");

  // Define image paths with exact filenames from the repository
  const zoneImageMap = {
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
    ],
    // Add more areas as needed
  };

  // Function to open the zone modal
  function openZoneModal(areaName) {
    const images = zoneImageMap[areaName] || [];
    if (images.length === 0) return;

    const sliderContainer = zoneModal.querySelector(".slider-container");
    sliderContainer.innerHTML = "";

    images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      sliderContainer.appendChild(img);
    });

    zoneModal.classList.add("active");
  }

  // Event listeners for areas
  areas.forEach((area) => {
    area.addEventListener("click", () => {
      const areaName = area.getAttribute("data-area");
      openZoneModal(areaName);
    });
  });

  // Close button event listener
  closeButton.addEventListener("click", () => {
    zoneModal.classList.remove("active");
  });

  // Fullscreen view event listener
  closeFullscreenButton.addEventListener("click", () => {
    fullscreenView.classList.remove("active");
  });

  // Initial overlay fade out
  setTimeout(() => {
    initialOverlay.classList.add("fade-out");
  }, 2000);
});

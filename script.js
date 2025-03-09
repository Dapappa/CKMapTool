document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const mapWrapper = document.querySelector('.map-wrapper');
    const mainMap = document.querySelector('.main-map');
    const zoneLabel = document.querySelector('.zone-label');
    const zoneModal = document.querySelector('.zone-modal');
    const modalTitle = document.querySelector('.modal-title');
    const closeButton = document.querySelector('.close-button');
    const sliderContainer = document.querySelector('.slider-container');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const mapAreas = document.querySelectorAll('area');
    const initialOverlay = document.querySelector('.initial-overlay');
    const fullscreenView = document.querySelector('.fullscreen-view');
    const closeFullscreenBtn = document.querySelector('.close-fullscreen');
    const fullscreenImageContainer = document.querySelector('.fullscreen-image-container');
    
    // Create a div for map overlay (for dimming effect)
    const mapOverlay = document.createElement('div');
    mapOverlay.className = 'map-overlay';
    mapWrapper.appendChild(mapOverlay);

    // Variables
    let currentZoneIndex = 0;
    let allZones = [];
    let zoneHighlights = {};
    let autoCycleInterval = null;
    let userInteracted = false;
    let lastClickedZone = null;
    let isFirstTap = true;
    let isMobile = window.innerWidth <= 768;
    
    // Map of zone titles to actual image files in map-images directory
    // Each area has one primary image
    const zoneImageMap = {
        // Northwest zones
        'NorthWestAreaA': 'Northwest Calgary Distribution Map (3)-1.png',
        'NorthWestAreaB': 'Northwest Calgary Distribution Map (3)-2.png',
        'NorthWestAreaC': 'Northwest Calgary Distribution Map (3)-3.png',
        
        // Northeast zones
        'NorthEastAreaA': 'North East-1.png',
        'NorthEastAreaB': 'North East-2.png',
        'NorthEastAreaC': 'North East-3.png',
        
        // Downtown zones
        'DowntownAreaA': 'Downtown Calgary Map (1)-1.png',
        'DowntownAreaB': 'Downtown Calgary Map (1)-2.png',
        
        // Southeast zones
        'SouthEastAreaA': 'South East Completed (2)-1.png',
        'SouthEastAreaB': 'South East Completed (2)-2.png',
        
        // Southwest zones
        'SouthWestAreaA': 'Southwest Map (2)-1.png',
        'SouthWestAreaB': 'Southwest Map (2)-2.png'
    };

    // Initialize the application
    function init() {
        initializeZones();
        createAreaHighlights();
        
        // Fade out initial overlay after 5 seconds
        setTimeout(() => {
            initialOverlay.classList.add('hide');
        }, 5000);
        
        // Start auto-cycling highlights
        startAutoCycle();
        
        // Stop auto-cycling when user interacts
        document.addEventListener('click', () => {
            userInteracted = true;
            stopAutoCycle();
        });
        
        // Update mobile detection on resize
        window.addEventListener('resize', () => {
            isMobile = window.innerWidth <= 768;
        });
    }

    // Start auto-cycling of highlights
    function startAutoCycle() {
        if (!userInteracted) {
            autoCycleInterval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * allZones.length);
                const randomZone = allZones[randomIndex];
                
                if (randomZone && zoneHighlights[randomZone.title]) {
                    const highlight = zoneHighlights[randomZone.title];
                    highlight.classList.add('auto-highlight');
                    
                    setTimeout(() => {
                        highlight.classList.remove('auto-highlight');
                    }, 800);
                }
            }, 2000);
        }
    }

    // Stop auto-cycling
    function stopAutoCycle() {
        if (autoCycleInterval) {
            clearInterval(autoCycleInterval);
            autoCycleInterval = null;
        }
    }

    // Build the list of all zones from the map areas
    function initializeZones() {
        mapAreas.forEach(area => {
            const title = area.getAttribute('title');
            if (title && zoneImageMap[title]) {
                allZones.push({
                    title: title,
                    imagePath: `map-images/${zoneImageMap[title]}`
                });
            }
        });
    }
    
    // Create SVG overlays for each area
    function createAreaHighlights() {
        if (!mainMap.complete) {
            // If image is not loaded yet, wait for it
            mainMap.onload = createAreaHighlights;
            return;
        }
        
        // Create a helper SVG for each area
        mapAreas.forEach(area => {
            if (area.getAttribute('shape') === 'poly') {
                const coords = area.getAttribute('coords').split(',');
                const title = area.getAttribute('title');
                
                // Create SVG element
                const svgNS = "http://www.w3.org/2000/svg";
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute('class', 'zone-highlight');
                svg.setAttribute('data-zone', title);
                svg.style.position = 'absolute';
                svg.style.top = '0';
                svg.style.left = '0';
                svg.style.width = '100%';
                svg.style.height = '100%';
                
                // Create polygon
                const polygon = document.createElementNS(svgNS, "polygon");
                
                // Scale coordinates based on natural vs displayed image size
                const scaleX = mainMap.width / mainMap.naturalWidth;
                const scaleY = mainMap.height / mainMap.naturalHeight;
                
                let points = '';
                for (let i = 0; i < coords.length; i += 2) {
                    const x = parseFloat(coords[i]) * scaleX;
                    const y = parseFloat(coords[i+1]) * scaleY;
                    points += `${x},${y} `;
                }
                
                polygon.setAttribute('points', points.trim());
                polygon.setAttribute('fill', '#3498db');
                polygon.setAttribute('fill-opacity', '0.3');
                polygon.setAttribute('stroke', '#2980b9');
                polygon.setAttribute('stroke-width', '2');
                
                svg.appendChild(polygon);
                mapWrapper.appendChild(svg);
                
                // Store for later use
                zoneHighlights[title] = svg;
            }
        });
        
        // Add resize event listener to handle image scaling
        window.addEventListener('resize', updateAreaHighlights);
    }
    
    // Update positions of highlights on resize
    function updateAreaHighlights() {
        mapAreas.forEach(area => {
            if (area.getAttribute('shape') === 'poly') {
                const coords = area.getAttribute('coords').split(',');
                const title = area.getAttribute('title');
                const svg = zoneHighlights[title];
                
                if (svg) {
                    const polygon = svg.querySelector('polygon');
                    
                    // Scale coordinates based on current image size
                    const scaleX = mainMap.width / mainMap.naturalWidth;
                    const scaleY = mainMap.height / mainMap.naturalHeight;
                    
                    let points = '';
                    for (let i = 0; i < coords.length; i += 2) {
                        const x = parseFloat(coords[i]) * scaleX;
                        const y = parseFloat(coords[i+1]) * scaleY;
                        points += `${x},${y} `;
                    }
                    
                    polygon.setAttribute('points', points.trim());
                }
            }
        });
    }
    
    // Format zone title (e.g., "NorthWestAreaA" -> "North West Area A")
    function formatZoneTitle(title) {
        return title
            // Insert space before capital letters
            .replace(/([A-Z])/g, ' $1')
            // Handle special case for first letter
            .replace(/^./, function(str) { return str.toUpperCase(); })
            // Trim any extra spaces
            .trim();
    }
    
    // Load and display the current zone
    function showCurrentZone() {
        if (allZones.length === 0) return;
        
        const currentZone = allZones[currentZoneIndex];
        modalTitle.textContent = formatZoneTitle(currentZone.title);
        
        // Clear existing images
        sliderContainer.innerHTML = '';
        
        // Create image element for the current zone
        const img = document.createElement('img');
        img.className = 'slider-image';
        img.src = currentZone.imagePath;
        img.alt = formatZoneTitle(currentZone.title);
        
        // Add fullscreen functionality on image click
        img.addEventListener('click', function() {
            showFullscreen(img.src, currentZone.title);
        });
        
        // Add to slider with transition animation
        img.classList.add('fade-transition');
        sliderContainer.appendChild(img);
    }
    
    // Show fullscreen image view
    function showFullscreen(imageSrc, title) {
        // Clear previous image
        fullscreenImageContainer.innerHTML = '';
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = formatZoneTitle(title);
        
        // Add to container
        fullscreenImageContainer.appendChild(img);
        
        // Show fullscreen view
        fullscreenView.classList.add('active');
    }
    
    // Navigate to previous zone with transition
    function previousZone() {
        if (allZones.length === 0) return;
        
        currentZoneIndex = (currentZoneIndex - 1 + allZones.length) % allZones.length;
        
        // Apply transition
        const oldImage = sliderContainer.querySelector('.slider-image');
        if (oldImage) {
            oldImage.classList.add('slide-in-left');
            setTimeout(() => {
                showCurrentZone();
            }, 200);
        } else {
            showCurrentZone();
        }
    }
    
    // Navigate to next zone with transition
    function nextZone() {
        if (allZones.length === 0) return;
        
        currentZoneIndex = (currentZoneIndex + 1) % allZones.length;
        
        // Apply transition
        const oldImage = sliderContainer.querySelector('.slider-image');
        if (oldImage) {
            oldImage.classList.add('slide-in-right');
            setTimeout(() => {
                showCurrentZone();
            }, 200);
        } else {
            showCurrentZone();
        }
    }
    
    // Find zone index by title
    function findZoneIndexByTitle(title) {
        return allZones.findIndex(zone => zone.title === title);
    }
    
    // Handle first tap/click on mobile (show label only)
    function handleFirstTap(title) {
        zoneLabel.textContent = formatZoneTitle(title);
        zoneLabel.classList.add('active');
        
        // Keep highlight visible
        if (zoneHighlights[title]) {
            const highlight = zoneHighlights[title];
            highlight.style.opacity = '1';
            highlight.style.transform = 'scale(1.01)';
        }
        
        // Store last clicked zone
        lastClickedZone = title;
        isFirstTap = false;
        
        // Auto-reset after 3 seconds if no second tap
        setTimeout(() => {
            if (lastClickedZone === title) {
                resetTapState();
            }
        }, 3000);
    }
    
    // Reset tap state
    function resetTapState() {
        zoneLabel.classList.remove('active');
        
        // Reset all highlights
        Object.values(zoneHighlights).forEach(highlight => {
            highlight.style.opacity = '0';
            highlight.style.transform = 'scale(1)';
        });
        
        lastClickedZone = null;
        isFirstTap = true;
        
        // Reset map overlay
        mapOverlay.style.opacity = '0';
    }
    
    // Event Listeners for hover effects
    mapAreas.forEach(area => {
        // Mouseover (hover) event - only for desktop
        area.addEventListener('mouseover', function() {
            // Skip if in mobile mode or a zone is already active
            if (isMobile || lastClickedZone !== null) return;
            
            const title = this.getAttribute('title');
            const formattedTitle = formatZoneTitle(title);
            
            // Show label and update content
            zoneLabel.textContent = formattedTitle;
            zoneLabel.style.opacity = '1';
            
            // Show zone highlight
            if (zoneHighlights[title]) {
                const highlight = zoneHighlights[title];
                highlight.style.opacity = '1';
                highlight.style.transform = 'scale(1.01)';
            }
            
            // Dim rest of map
            mapOverlay.style.opacity = '1';
        });
        
        // Mouseout event - only for desktop
        area.addEventListener('mouseout', function() {
            // Skip if in mobile mode or a zone is already active
            if (isMobile || lastClickedZone !== null) return;
            
            // Hide label
            zoneLabel.style.opacity = '0';
            
            // Hide zone highlight
            const title = this.getAttribute('title');
            if (zoneHighlights[title]) {
                const highlight = zoneHighlights[title];
                highlight.style.opacity = '0';
                highlight.style.transform = 'scale(1)';
            }
            
            // Reset map overlay
            mapOverlay.style.opacity = '0';
        });
        
        // Click event
        area.addEventListener('click', function(e) {
            e.preventDefault();
            userInteracted = true;
            stopAutoCycle();
            
            const title = this.getAttribute('title');
            
            // First tap on mobile - just show the label
            if (isMobile && isFirstTap) {
                handleFirstTap(title);
                return;
            }
            
            // Second tap on mobile - open the modal (but only if same zone)
            if (isMobile && !isFirstTap) {
                if (title === lastClickedZone) {
                    openZoneModal(title);
                } else {
                    // If tapping a different zone, treat as first tap
                    resetTapState();
                    handleFirstTap(title);
                }
                return;
            }
            
            // Desktop behavior - open modal immediately
            openZoneModal(title);
        });
    });
    
    // Open zone modal
    function openZoneModal(title) {
        const zoneIndex = findZoneIndexByTitle(title);
        
        if (zoneIndex !== -1) {
            currentZoneIndex = zoneIndex;
            
            // Show modal
            zoneModal.classList.add('active');
            
            // Display the current zone
            showCurrentZone();
            
            // Reset state
            resetTapState();
        }
    }
    
    // Modal navigation events - Now navigate between zones rather than images
    prevButton.addEventListener('click', previousZone);
    nextButton.addEventListener('click', nextZone);
    
    // Close modal
    closeButton.addEventListener('click', function() {
        zoneModal.classList.remove('active');
        resetTapState();
    });
    
    // Close modal when clicking outside content
    zoneModal.addEventListener('click', function(e) {
        if (e.target === zoneModal) {
            zoneModal.classList.remove('active');
            resetTapState();
        }
    });
    
    // Close fullscreen view
    closeFullscreenBtn.addEventListener('click', function() {
        fullscreenView.classList.remove('active');
    });
    
    // Close fullscreen when clicking outside the image
    fullscreenView.addEventListener('click', function(e) {
        if (e.target === fullscreenView) {
            fullscreenView.classList.remove('active');
        }
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (fullscreenView.classList.contains('active')) {
            if (e.key === 'Escape') {
                fullscreenView.classList.remove('active');
            }
        } else if (zoneModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                zoneModal.classList.remove('active');
                resetTapState();
            }
            if (e.key === 'ArrowLeft') {
                previousZone();
            }
            if (e.key === 'ArrowRight') {
                nextZone();
            }
        }
    });
    
    // Initialize everything
    init();
});

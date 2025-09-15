const timeEl = document.getElementById("current-time");
const banner = document.getElementById("announcement-banner");
const dismissBtn = document.getElementById("banner-dismiss");

const now = new Date();

// Update <time> element
timeEl.textContent = now.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
timeEl.setAttribute("datetime", now.toISOString());

// Read expiry if present
const expiryAttr = banner.dataset.expiry;
const expiryDate = expiryAttr ? new Date(expiryAttr) : null;

// Show if not dismissed, and (if expiry exists) not expired
if (
  localStorage.getItem("bannerDismissed") !== "true" &&
  (!expiryDate || now <= expiryDate)
) {
  banner.style.display = "block"; // or "flex"
}

// Handle dismiss click
dismissBtn.addEventListener("click", () => {
  banner.style.display = "none";
  localStorage.setItem("bannerDismissed", "true");
});

/* ---------------------------------------------------- */

const menuToggle = document.getElementById("menu-toggle");
const menuBurger = document.querySelector(".header__icon--menu");
const menuClose = document.querySelector(".header__icon--close");
const headerContainer = document.querySelector(".header__branding");
const headerNav = document.querySelector(".nav");

let menuListenerAttached = false;
let isMenuOpen = false;

function resetMenuState(isActive = false) {
  isMenuOpen = isActive;
  const elements = [menuBurger, menuClose, headerContainer, headerNav];
  elements.forEach((el) => el.classList.toggle("active", isActive));

  document.body.style.overflow = isActive ? "hidden" : "";
}

function updateInertState() {
  const isMobile = window.matchMedia("(max-width: 1023px)").matches;

  if (isMobile && isMenuOpen) {
    headerNav.removeAttribute("inert");
  } else if (isMobile) {
    headerNav.setAttribute("inert", "true");
  } else {
    headerNav.removeAttribute("inert"); // Always interactive on desktop
  }
}

function toggleMenu() {
  resetMenuState(!isMenuOpen);
  updateInertState();
}

function handleScreenChange(e) {
  const isMobile = e.matches;

  // Manage event listener
  if (isMobile && !menuListenerAttached) {
    menuToggle.addEventListener("click", toggleMenu);
    menuListenerAttached = true;
  } else if (!isMobile && menuListenerAttached) {
    menuToggle.removeEventListener("click", toggleMenu);
    menuListenerAttached = false;
  }

  // Reset menu state
  resetMenuState(false);
  updateInertState();
}

// Initialize
const mediaQuery = window.matchMedia("(max-width: 1023px)");
handleScreenChange(mediaQuery);
mediaQuery.addEventListener("change", handleScreenChange);
/* ---------------------------------------------------------------------- */

const announcementBanner = document.getElementById("announcement-banner");

if (announcementBanner) {
  const updateBannerHeight = () => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${announcementBanner.offsetHeight}px`,
    );
  };

  // Set initially
  updateBannerHeight();

  // Observe header for height changes
  const ro = new ResizeObserver(updateBannerHeight);
  ro.observe(announcementBanner);
}

// =============================================================================

// =============================================================================
// Dropdown menu logic (only for desktop ≥ 1024px)

const elements = {
  siteNav: document.querySelector(".site-nav"),
  dropdownButtons: document.querySelectorAll(".nav__dropdown-toggle, .cta__toggle"),
  dropdownContainers: document.querySelectorAll(".nav__submenu-wrapper, .cta__submenu-wrapper")
};

// Animation helper
function animateHeight(element, targetHeight) {
  element.style.maxHeight = element.scrollHeight + "px";
  requestAnimationFrame(() => {
    element.style.maxHeight = targetHeight;
  });
}

function closeAllDropdowns() {
  const openContainers = document.querySelectorAll(".nav__submenu-wrapper.open, .cta__submenu-wrapper.open");
  const activeButtons = document.querySelectorAll(".nav__dropdown-toggle.active, .cta__toggle.active");
  
  openContainers.forEach(container => {
    animateHeight(container, "0px");
    container.classList.remove("active", "open");
  });
  
  activeButtons.forEach(btn => {
    btn.classList.remove("active");
    btn.querySelectorAll(".nav__icon--plus, .nav__icon--minus").forEach(icon => {
      icon.classList.remove("active");
    });
  });
  
  elements.siteNav.classList.remove("active");
}

function toggleDropdown(container, button) {
  const isOpen = container.classList.contains("open");
  const icons = button.querySelectorAll(".nav__icon--plus, .nav__icon--minus");
  
  if (isOpen) {
    // Closing
    animateHeight(container, "0px");
    container.classList.remove("open");
    button.classList.remove("active");
    icons.forEach(icon => icon.classList.remove("active"));
  } else {
    // Opening - close others first
    closeAllDropdowns();
    
    container.classList.add("open");
    button.classList.add("active");
    elements.siteNav.classList.add("active");
    icons.forEach(icon => icon.classList.add("active"));
    
    animateHeight(container, container.scrollHeight + "px");
  }
  
  container.addEventListener("transitionend", function handleTransition() {
    if (container.classList.contains("open")) {
      container.style.maxHeight = "none"; // Allow natural resizing
    }
    
    // Clean up siteNav state
    const hasOpenDropdowns = document.querySelector(".nav__submenu-wrapper.open, .cta__submenu-wrapper.open");
    if (!hasOpenDropdowns) {
      elements.siteNav.classList.remove("active");
    }
    
    container.removeEventListener("transitionend", handleTransition);
  });
}

// Media query to enable dropdowns only on desktop
const desktopQuery = window.matchMedia("(min-width: 1024px)");

function handleDesktopChange(e) {
  if (e.matches) {
    // Switching to desktop
    closeAllDropdowns(); // make sure no open state lingers
    elements.dropdownContainers.forEach(container => {
      container.style.maxHeight = "0px"; // desktop default: collapsed
    });

    elements.siteNav.addEventListener("click", siteNavClickHandler);
    document.addEventListener("click", outsideClickHandler);
  } else {
    // Switching to mobile
    closeAllDropdowns(); // remove classes
    elements.dropdownContainers.forEach(container => {
      container.style.maxHeight = ""; // mobile default: natural flow
    });

    elements.siteNav.removeEventListener("click", siteNavClickHandler);
    document.removeEventListener("click", outsideClickHandler);
  }
}

// Event handlers (kept separate so we can remove them)
function siteNavClickHandler(e) {
  const button = e.target.closest(".nav__dropdown-toggle, .cta__toggle");
  if (!button) return;
  
  e.stopPropagation();
  const container = button.classList.contains("nav__dropdown-toggle") 
    ? button.closest(".nav__item").querySelector(".nav__submenu-wrapper")
    : document.querySelector(".cta__submenu-wrapper");
    
  if (container) {
    toggleDropdown(container, button);
  }
}

function outsideClickHandler(e) {
  if (!elements.siteNav.contains(e.target)) {
    closeAllDropdowns();
  }
}

// Initialize
handleDesktopChange(desktopQuery);
desktopQuery.addEventListener("change", handleDesktopChange);

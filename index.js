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

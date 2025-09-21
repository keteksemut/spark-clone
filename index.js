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

const siteNav = document.querySelector(".site-nav");
const dropdownButton = document.querySelectorAll(
  ".nav__dropdown-toggle, .cta__toggle",
);
const submenuWrapper = document.querySelectorAll(
  ".nav__submenu-wrapper, .cta__submenu-wrapper",
);

const plusIcons = document.querySelectorAll(".nav__icon--plus");
const minusIcons = document.querySelectorAll(".nav__icon--minus");

submenuWrapper.forEach((wrapper) => {
  const height = wrapper.scrollHeight;

  wrapper.style.setProperty("--wrapper-height", `${height + 1}px`);
});

dropdownButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    submenuWrapper.forEach((wrapper, i) => {
      const isActive = i === index && !wrapper.classList.contains("active");
      wrapper.classList.toggle("active", isActive);
      wrapper.toggleAttribute("inert", !isActive);

      dropdownButton[i].setAttribute("aria-expanded", isActive.toString());
      plusIcons[i]?.classList.toggle("active", isActive);
      minusIcons[i]?.classList.toggle("active", isActive);
    });
    const hasActive = [...submenuWrapper].some((wrapper) =>
      wrapper.classList.contains("active"),
    );
    siteNav.classList.toggle("active", hasActive);
  });
});

// Outside click handler
document.addEventListener("click", (event) => {
  const clickedInside = [...dropdownButton, ...submenuWrapper].some((el) =>
    el.contains(event.target),
  );

  if (!clickedInside) {
    plusIcons.forEach((icon) => icon.classList.remove("active"));
    minusIcons.forEach((icon) => icon.classList.remove("active"));
    submenuWrapper.forEach((wrapper) => {
      wrapper.classList.remove("active");
      wrapper.setAttribute("inert", "");
    });
    siteNav.classList.remove("active");
  }
});

// === Focus Trap Utility ===
let currentTrap = null;

function trapFocus(container) {
  releaseFocus(); // clear any existing trap
  currentTrap = (event) => {
    if (event.key !== "Tab") return;

    const focusable = container.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const isShift = event.shiftKey;

    if (!isShift && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (isShift && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener("keydown", currentTrap);
}

function releaseFocus() {
  if (currentTrap) {
    document.removeEventListener("keydown", currentTrap);
    currentTrap = null;
  }
}

/*=========================================================== 
                           SVG MORPH 
=============================================================*/
const animations = new Set();

function createElement(tag, attr = {}) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attr)) {
    el.setAttribute(k, v);
  }
  return el;
}

const lerp = (start, end, progress) => start + (end - start) * progress;

function parsePath(path) {
  const pathSegments = path.match(/[MLC][^MLC]*/g);

  if (!pathSegments) return [];

  return pathSegments.map((segment) => ({
    type: segment[0], // command: M, L, or C
    points: segment.slice(1).trim().split(/[ ,]+/).map(Number),
  }));
}

function buildPath(commands) {
  let out = "";
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    out += cmd.type + " " + cmd.points.join(" ");
    if (i !== commands.length - 1) out += " ";
  }
  return out;
}

const pathA =
  "M49.95 100.04C49.95 100.04 49.95 52.85 49.95 51.88C49.95 50.91 49.17 50.13 48.2 50.13C47.23 50.13 0.04 50.13 0.04 50.13";
const pathB =
  "M100 49.92C100 49.92 52.81 49.92 51.84 49.92C50.88 49.92 50.09 49.14 50.09 48.17C50.09 47.2 50.09 0.01 50.09 0.01";

const initialPath = parsePath(pathA);
const targetPath = parsePath(pathB);

// { type: "M", points: [10, 20]}
// { type: "M", points: [20, 30]}
function morphPath(from, to, progress, out) {
  const n = from.length;

  if (n !== to.length)
    throw new Error(
      "Unequal objects: path command arrays must be same length.",
    );

  if (!out || out.length !== n) {
    out = Array(n);
  }

  for (let i = 0; i < n; i++) {
    const fromCmd = from[i];
    const toCmd = to[i];

    if (fromCmd.type !== toCmd.type)
      throw new Error(`Command type mismatch at index ${i}`);

    const fromPoints = fromCmd.points;
    const toPoints = toCmd.points;
    const m = fromPoints.length;

    if (m !== toPoints.length)
      throw new Error(`Points count mismatch at index ${i}`);

    let points = out[i]?.points;
    if (!points || points.length !== m) {
      points = new Array(m);
    }

    for (let j = 0; j < m; j++) {
      // lerp = a + (b - a) * c
      points[j] = fromPoints[j] + (toPoints[j] - fromPoints[j]) * progress;
    }

    if (!out[i] || out[i].type !== fromCmd.type) {
      out[i] = { type: fromCmd.type, points };
    } else {
      out[i].points = points;
    }
  }
  return buildPath(out);
}

let isTriggered = false;
let isPaused = false;
let startTime = null;

function animateStroke(path) {
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;
  setTimeout(() => {
    path.style.animation = "drawStroke 2s ease-out forwards";
  });
}

const sectionSvgRef = document.getElementById("section__ref");

const svgRef = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgRef.setAttribute("viewBox", "0 0 100 100");
svgRef.setAttribute("xmlns", "http://www.w3.org/2000/svg"); // Fixed typo: was "xlmns"
svgRef.setAttribute("fill", "none");
svgRef.setAttribute("style", `--length: ${length}`);

sectionSvgRef.appendChild(svgRef);

function createPath(fromPath, toPath, delay = 0, initialProgress = 0) {
  const path = createElement("path", {
    d: fromPath,
    fill: "none",
    stroke: "#101014",
    "stroke-width": "0.02",
  });
  svgRef.appendChild(path);

  const fromCommands = parsePath(fromPath);
  const toCommands = parsePath(toPath);
  let startTime = null;
  let animationId = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    let progress = (timestamp - startTime - delay) / 8300 + initialProgress;
    if (progress < 0) {
      animationId = requestAnimationFrame(animate);
      return;
    }

    progress %= 1;

    const offset =
      (window.innerWidth >= 768 ? 1 : 0.7) * Math.sin(progress * Math.PI * 2);
    path.style.transform = `translate3d(${-offset}px, ${-offset}px, 0)`;

    const opacity =
      progress < 0.075
        ? progress / 0.075
        : progress < 0.925
          ? 1
          : 1 - (progress - 0.925) / 0.075;

    path.style.opacity = opacity;
    path.setAttribute("d", morphPath(fromCommands, toCommands, progress));

    animationId = requestAnimationFrame(animate);
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        animateStroke(path);
        animationId = requestAnimationFrame(animate);
        animations.add(animationId);
        console.log(entry.isIntersecting);
      } else if (animationId) {
        cancelAnimationFrame(animationId);
        animations.delete(animationId);
        console.log(entry.isIntersecting);
      }
    },
    { threshold: 0.2 },
  );

  observer.observe(svgRef);
  return path;
}

if (sectionSvgRef) {
  for (let i = 0; i < 7; i++) {
    const pathRef = createPath(pathA, pathB, 1200 * i, (i / 7) * 2);
    svgRef.appendChild(pathRef);
  }
}

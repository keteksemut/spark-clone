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

const activeAnimationIds = new Map();

function createSvgElement(tag, attributes) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const key in attributes) {
    el.setAttribute(key, attributes[key]);
  }
  return el;
}

function interpolate(start, end, t) {
  return start + (end - start) * t;
}

const pathCache = new Map();

function parsePath(path) {
  if (pathCache.has(path)) {
    return pathCache.get(path);
  }
  const commands = path.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
  const parsedCommands = commands.map((cmd) => {
    const type = cmd[0];
    const points = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    return { type, points };
  });
  pathCache.set(path, parsedCommands);
  return parsedCommands;
}

function buildPath(commands) {
  return commands.map((cmd) => `${cmd.type} ${cmd.points.join(" ")}`).join(" ");
}

function morphPath(fromCommands, toCommands, t) {
  if (fromCommands.length !== toCommands.length) {
    console.error("❌ The paths have different numbers of commands");
    return buildPath(fromCommands);
  }
  return buildPath(
    fromCommands.map((fromCmd, i) => {
      const toCmd = toCommands[i];
      if (fromCmd.type !== toCmd.type) {
        console.error("❌ Path command types do not match!");
        return fromCmd;
      }
      const points = fromCmd.points.map((p, j) =>
        interpolate(p, toCmd.points[j], t),
      );
      return { type: fromCmd.type, points };
    }),
  );
}

function animateStroke(path) {
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  if (!isFirefox) {
    const pathLength = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--stroke-length");
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    setTimeout(() => {
      path.style.animation = `drawStroke 2s ease-out forwards`;
    }, 100);
  }
}

function animateMorph(
  svg,
  path,
  initialCommands,
  targetCommands,
  delay,
  initialProgress,
  isTriggered,
  isPaused,
) {
  let startTime = null;

  function animateFrame(timestamp) {
    if (!isTriggered || isPaused) {
      return;
    }

    if (!startTime) {
      startTime = timestamp;
    }

    let progress = (timestamp - startTime - delay) / 8300 + initialProgress;

    if (progress < 0) {
      const id = requestAnimationFrame(animateFrame);
      activeAnimationIds.set(svg, id);
      return;
    }

    progress %= 1;

    const isWideScreen = window.innerWidth >= 768;
    const offset = (isWideScreen ? 1 : 0.7) * Math.sin(progress * Math.PI * 2);
    svg.style.transform = `translate(${-offset}px, ${offset}px)`;

    const opacity =
      progress < 0.075
        ? interpolate(0, 1, progress / 0.075)
        : progress < 0.925
          ? 1
          : interpolate(1, 0, (progress - 0.925) / 0.075);
    svg.style.opacity = opacity;

    path.setAttribute(
      "d",
      morphPath(initialCommands, targetCommands, progress),
    );

    const id = requestAnimationFrame(animateFrame);
    activeAnimationIds.set(svg, id);
  }

  const id = requestAnimationFrame(animateFrame);
  activeAnimationIds.set(svg, id);
}

function createAnimatedSvg(options) {
  const { delay = 0, initialProgress = 0, isTriggered, isPaused } = options;

  const svg = createSvgElement("svg", {
    viewBox: "0 0 5338 5338",
    style: "opacity: 0;",
  });

  const path = createSvgElement("path", {
    d: initialPath,
    fill: "none",
    stroke: "var(--path-color)",
    "stroke-width": "var(--stroke-width)",
  });
  svg.appendChild(path);

  if (isTriggered) {
    animateStroke(path);
    animateMorph(
      svg,
      path,
      initialCommands,
      targetCommands,
      delay,
      initialProgress,
      isTriggered,
      isPaused,
    );
  }

  return svg;
}

const isTriggered = true;
const isPaused = false;
const initialPath =
  "M2666.35 5340.07C2666.35 5340.07 2666.35 2820.99 2666.35 2769.36C2666.35 2717.72 2624.48 2675.85 2572.84 2675.85C2521.19 2675.85 2.11719 2675.85 2.11719 2675.85";
const targetPath =
  "M5337.98 2664.75C5337.98 2664.75 2818.91 2664.75 2767.26 2664.75C2715.61 2664.75 2673.75 2622.88 2673.75 2571.24C2673.75 2519.6 2673.75 0.523866 2673.75 0.523866";

const initialCommands = parsePath(initialPath);
const targetCommands = parsePath(targetPath);

const animationGroup = document.getElementById("animationGroup");
for (let i = 0; i < 7; i++) {
  const svg = createAnimatedSvg({
    isTriggered,
    delay: 1200 * i,
    initialProgress: (i / 7) * 2,
    isPaused,
  });
  animationGroup.appendChild(svg);
}

window.stopAnimations = function () {
  activeAnimationIds.forEach((id) => {
    cancelAnimationFrame(id);
  });
  activeAnimationIds.clear();
  console.log("✅ Animations stopped");
};

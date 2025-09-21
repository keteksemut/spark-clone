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

/*
/* ---------------------- helpers ---------------------- */
function createSvgElement(tag, attributes = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const k in attributes) el.setAttribute(k, attributes[k]);
  return el;
}
function interpolate(a, b, t) {
  return a + (b - a) * t;
}

const pathCache = new Map();
function parsePath(path) {
  if (pathCache.has(path)) return pathCache.get(path);
  const commands = path.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
  const parsed = commands.map((cmd) => {
    const type = cmd[0];
    const points = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    return { type, points };
  });
  pathCache.set(path, parsed);
  return parsed;
}
function buildPath(commands) {
  return commands.map((c) => `${c.type} ${c.points.join(" ")}`).join(" ");
}
function morphPath(fromCommands, toCommands, t) {
  if (fromCommands.length !== toCommands.length) {
    console.error("❌ The paths have different numbers of commands");
    return buildPath(fromCommands);
  }
  return buildPath(
    fromCommands.map((fc, i) => {
      const tc = toCommands[i];
      if (fc.type !== tc.type) {
        console.error("❌ Path command types do not match!");
        return fc;
      }
      const points = fc.points.map((p, j) => interpolate(p, tc.points[j], t));
      return { type: fc.type, points };
    }),
  );
}

/* ---------------------- stroke animation helper (robust) ---------------------- */
function ensureDrawKeyframes() {
  if (document.getElementById("__draw-stroke-style")) return;
  const s = document.createElement("style");
  s.id = "__draw-stroke-style";
  s.textContent = `
    @keyframes drawStroke { to { stroke-dashoffset: 0; } }
    /* keep transform origin predictable for SVG groups */
    svg g { transform-box: fill-box; transform-origin: 50% 50%; }
  `;
  document.head.appendChild(s);
}
function animateStroke(pathEl) {
  // skip on Firefox (original did), but we still set dash values so it doesn't jump
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  // compute robust stroke length from actual path
  let length = 0;
  try {
    length = pathEl.getTotalLength();
  } catch (e) {
    length = 1000;
  }
  pathEl.style.strokeDasharray = length;
  pathEl.style.strokeDashoffset = length;
  if (isFirefox) return;
  // ensure keyframes exist
  ensureDrawKeyframes();
  // start CSS animation just once (small timeout to ensure style applied)
  setTimeout(() => {
    pathEl.style.animation = `drawStroke 2s ease-out forwards`;
  }, 100);
}

/* ---------------------- main animation setup ---------------------- */
// const activeAnimationIds = new Map();
// const animationGroup = document.getElementById('animationGroup');

// // config (kept same values as original)
// const isTriggered = true;
// const isPaused = false;
// const initialPath = "M2666.35 5340.07C2666.35 5340.07 2666.35 2820.99 2666.35 2769.36C2666.35 2717.72 2624.48 2675.85 2572.84 2675.85C2521.19 2675.85 2.11719 2675.85 2.11719 2675.85";
// const targetPath  = "M5337.98 2664.75C5337.98 2664.75 2818.91 2664.75 2767.26 2664.75C2715.61 2664.75 2673.75 2622.88 2673.75 2571.24C2673.75 2519.6 2673.75 0.523866 2673.75 0.523866";
// const initialCommands = parsePath(initialPath);
// const targetCommands  = parsePath(targetPath);

// // create single SVG container
// const svg = createSvgElement('svg', {
//   viewBox: '0 0 5338 5338',
//   style: 'width:100%; height:auto; overflow:visible;'
// });
// animationGroup.appendChild(svg);

// // create per-item groups (preserve behavior of original: each item was its own svg)
// const items = [];
// const baseYSpacing = 0; // tweak this value to match your old layout spacing

// for (let i = 0; i < 7; i++) {
//   // give each <g> its own base translate so they don't overlap
//   const g = createSvgElement('g', {
//     style: `opacity: 0; will-change: transform, opacity; transform: translate(0, ${i * baseYSpacing}px);`
//   });

//   const pathEl = createSvgElement('path', {
//     d: initialPath,
//     fill: 'none',
//     stroke: 'var(--path-color)',
//     'stroke-width': 'var(--stroke-width)'
//   });

//   g.appendChild(pathEl);
//   svg.appendChild(g);

//   items.push({
//     group: g,
//     path: pathEl,
//     delay: 1200 * i,
//     initialProgress: (i / 7) * 2,
//     started: false,
//     baseTranslateY: i * baseYSpacing
//   });
// }

// /* ---------------------- single RAF loop that animates all items ---------------------- */
// let masterStart = null;
// function rafLoop(timestamp) {
//   if (!isTriggered || isPaused) return;
//   if (!masterStart) masterStart = timestamp;

//   for (const it of items) {
//     const { group, path, delay, initialProgress } = it;

//     // compute progress like original code: (timestamp - startTime - delay) / 8300 + initialProgress
//     let progress = (timestamp - masterStart - delay) / 8300 + initialProgress;

//     // not started yet (respect the original delayed start)
//     if (progress < 0) {
//       continue;
//     }

//     // trigger once: stroke draw animation and any first-start logic
//     if (!it.started) {
//       it.started = true;
//       animateStroke(path);
//     }

//     // wrap into [0,1)
//     progress = progress % 1;

//     // wiggle (apply transform to the group to match original per-svg transform)
//     const isWideScreen = window.innerWidth >= 768;
//     const offset = (isWideScreen ? 1 : 0.7) * Math.sin(progress * Math.PI * 2);
//     // translate via CSS transform (transform-box / transform-origin set via injected CSS)
//     group.style.transform =
//   `translate(0, ${it.baseTranslateY}px) translate(${-offset}px, ${offset}px)`;

//     // fade-in / stay / fade-out EXACTLY like original
//     const opacity =
//       progress < 0.075 ? interpolate(0, 1, progress / 0.075)
//       : progress < 0.925 ? 1
//       : interpolate(1, 0, (progress - 0.925) / 0.075);
//     group.style.opacity = opacity;

//     // morph path
//     try {
//       path.setAttribute('d', morphPath(initialCommands, targetCommands, progress));
//     } catch (e) {
//       // if morph fails, keep last known path (safer than throwing)
//       console.error("morph error", e);
//     }
//   }

//   const id = requestAnimationFrame(rafLoop);
//   activeAnimationIds.set(svg, id);
// }

// // kick off
// requestAnimationFrame(rafLoop);

// /* ---------------------- stop ---------------------- */
// window.stopAnimations = function () {
//   activeAnimationIds.forEach(id => cancelAnimationFrame(id));
//   activeAnimationIds.clear();
//   masterStart = null;
//   console.log("✅ Animations stopped");
// };

// =========================================================

// const activeAnimationIds = new Map();

//       function createSvgElement(tag, attributes) {
//         const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
//         for (const key in attributes) {
//           el.setAttribute(key, attributes[key]);
//         }
//         return el;
//       }

//       function interpolate(start, end, t) {
//         return start + (end - start) * t;
//       }

//       const pathCache = new Map();

//       function parsePath(path) {
//         if (pathCache.has(path)) {
//           return pathCache.get(path);
//         }
//         const commands = path.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
//         const parsedCommands = commands.map((cmd) => {
//           const type = cmd[0];
//           const points = cmd
//             .slice(1)
//             .trim()
//             .split(/[\s,]+/)
//             .filter(Boolean)
//             .map(Number);
//           return { type, points };
//         });
//         pathCache.set(path, parsedCommands);
//         return parsedCommands;
//       }

//       function buildPath(commands) {
//         return commands
//           .map((cmd) => `${cmd.type} ${cmd.points.join(" ")}`)
//           .join(" ");
//       }

//       function morphPath(fromCommands, toCommands, t) {
//         if (fromCommands.length !== toCommands.length) {
//           console.error("❌ The paths have different numbers of commands");
//           return buildPath(fromCommands);
//         }
//         return buildPath(
//           fromCommands.map((fromCmd, i) => {
//             const toCmd = toCommands[i];
//             if (fromCmd.type !== toCmd.type) {
//               console.error("❌ Path command types do not match!");
//               return fromCmd;
//             }
//             const points = fromCmd.points.map((p, j) =>
//               interpolate(p, toCmd.points[j], t),
//             );
//             return { type: fromCmd.type, points };
//           }),
//         );
//       }

//       function animateStroke(path) {
//         const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
//         if (!isFirefox) {
//           const pathLength = getComputedStyle(
//             document.documentElement,
//           ).getPropertyValue("--stroke-length");
//           path.style.strokeDasharray = pathLength;
//           path.style.strokeDashoffset = pathLength;

//           setTimeout(() => {
//             path.style.animation = `drawStroke 2s ease-out forwards`;
//           }, 100);
//         }
//       }

//       function animateMorph(
//         svg,
//         path,
//         initialCommands,
//         targetCommands,
//         delay,
//         initialProgress,
//         isTriggered,
//         isPaused,
//       ) {
//         let startTime = null;

//         function animateFrame(timestamp) {
//           if (!isTriggered || isPaused) {
//             return;
//           }

//           if (!startTime) {
//             startTime = timestamp;
//           }

//           let progress =
//             (timestamp - startTime - delay) / 8300 + initialProgress;

//           if (progress < 0) {
//             const id = requestAnimationFrame(animateFrame);
//             activeAnimationIds.set(svg, id);
//             return;
//           }

//           progress %= 1;

//           const isWideScreen = window.innerWidth >= 768;
//           const offset =
//             (isWideScreen ? 1 : 0.7) * Math.sin(progress * Math.PI * 2);
//           svg.style.transform = `translate(${-offset}px, ${offset}px)`;

//           const opacity =
//             progress < 0.075
//               ? interpolate(0, 1, progress / 0.075)
//               : progress < 0.925
//                 ? 1
//                 : interpolate(1, 0, (progress - 0.925) / 0.075);
//           svg.style.opacity = opacity;

//           path.setAttribute(
//             "d",
//             morphPath(initialCommands, targetCommands, progress),
//           );

//           const id = requestAnimationFrame(animateFrame);
//           activeAnimationIds.set(svg, id);
//         }

//         const id = requestAnimationFrame(animateFrame);
//         activeAnimationIds.set(svg, id);
//       }

//       function createAnimatedSvg(options) {
//         const {
//           delay = 0,
//           initialProgress = 0,
//           isTriggered,
//           isPaused,
//         } = options;

//         const svg = createSvgElement("svg", {
//           viewBox: "0 0 100 100",
//           style: "opacity: 0;",
//         });

//         const path = createSvgElement("path", {
//           d: initialPath,
//           fill: "none",
//           stroke: "var(--path-color)",
//           "stroke-width": "var(--stroke-width)",
//         });
//         svg.appendChild(path);

//         if (isTriggered) {
//           animateStroke(path);
//           animateMorph(
//             svg,
//             path,
//             initialCommands,
//             targetCommands,
//             delay,
//             initialProgress,
//             isTriggered,
//             isPaused,
//           );
//         }

//         return svg;
//       }

//       const isTriggered = true;
//       const isPaused = false;
//       const initialPath =
//         "M49.95 100.04C49.95 100.04 49.95 52.85 49.95 51.88C49.95 50.91 49.17 50.13 48.2 50.13C47.23 50.13 0.04 50.13 0.04 50.13";
//       const targetPath =
//         "M100 49.92C100 49.92 52.81 49.92 51.84 49.92C50.88 49.92 50.09 49.14 50.09 48.17C50.09 47.2 50.09 0.01 50.09 0.01";

//       const initialCommands = parsePath(initialPath);
//       const targetCommands = parsePath(targetPath);

//       const animationGroup = document.getElementById("animationGroup");
//       for (let i = 0; i < 7; i++) {
//         const svg = createAnimatedSvg({
//           isTriggered,
//           delay: 1200 * i,
//           initialProgress: (i / 7) * 2,
//           isPaused,
//         });
//         animationGroup.appendChild(svg);
//       }

//       window.stopAnimations = function () {
//         activeAnimationIds.forEach((id) => {
//           cancelAnimationFrame(id);
//         });
//         activeAnimationIds.clear();
//         console.log("✅ Animations stopped");
//       };

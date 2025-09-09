// Get current time
const timeEl = document.getElementById('current-time');
const now = new Date();

timeEl.textContent = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});
timeEl.setAttribute('datetime', now.toISOString());

// Announcement banner dismiss
const announcementBanner = document.getElementById('announcementBanner');

announcementBanner.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const dateDismissed = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Save dismissal info (optional in dev)
    localStorage.setItem(
        'bannerDismissed',
        JSON.stringify({ dismissed: true, date: dateDismissed })
    );

    announcementBanner.style.display = 'none';
});

// DEV MODE: always show banner on load
// (Ignore localStorage for now)
announcementBanner.style.display = 'block';



const menuToggle = document.getElementById('menu-toggle');
const menuBurger = document.querySelector('.menu-toggle__icon--open');
const menuClose = document.querySelector('.menu-toggle__icon--close');
const menuDialog = document.getElementById('menu');
const headerContainer = document.querySelector('.header-container');

menuToggle.addEventListener('click', () => {
  const isOpen = menuDialog.toggleAttribute('open');

  menuBurger.classList.toggle('active', isOpen);
  menuClose.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  headerContainer.style.borderBottomColor = isOpen ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0)"
});






const header = document.querySelector("header");

if (header) {
    const updateHeaderHeight = () => {
        document.documentElement.style.setProperty(
            "--header-height",
            `${header.offsetHeight}px`
        );
    };

    // Set initially
    updateHeaderHeight();

    // Observe header for height changes
    const ro = new ResizeObserver(updateHeaderHeight);
    ro.observe(header);
}
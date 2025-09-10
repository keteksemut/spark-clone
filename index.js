const timeEl = document.getElementById('current-time');
const banner = document.getElementById('announcement-banner');
const dismissBtn = document.getElementById('banner-dismiss');

const now = new Date();

// Update <time> element
timeEl.textContent = now.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
timeEl.setAttribute('datetime', now.toISOString());

// Read expiry if present
const expiryAttr = banner.dataset.expiry;
const expiryDate = expiryAttr ? new Date(expiryAttr) : null;

// Show if not dismissed, and (if expiry exists) not expired
if (
  localStorage.getItem('bannerDismissed') !== 'true' &&
  (!expiryDate || now <= expiryDate)
) {
  banner.style.display = 'block'; // or "flex"
}

// Handle dismiss click
dismissBtn.addEventListener('click', () => {
  banner.style.display = 'none';
  localStorage.setItem('bannerDismissed', 'true');
});




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
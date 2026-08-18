/* ── Shared mobile nav toggle ("tripundra" 3-line hamburger) ──────────
   Works on any page that includes the standard #page-nav markup:
     <nav id="page-nav">
       <button id="nav-toggle" class="nav-toggle" aria-expanded="false">
         <span></span><span></span><span></span>
       </button>
       <img class="nav-logo" ...>
       <div class="page-nav-links"> ... links ... </div>
     </nav>
   No dependencies — safe to include on every page. */
(function () {
  function initNavToggle() {
    const toggle = document.getElementById('nav-toggle');
    const links  = document.querySelector('.page-nav-links');
    const nav    = document.getElementById('page-nav');
    if (!toggle || !links || !nav) return;

    function closeMenu() {
      links.classList.remove('open');
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
      const isOpen = links.classList.toggle('open');
      nav.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Tapping a real link closes the menu (lets navigation proceed).
    links.querySelectorAll('a.page-nav-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Tapping/clicking anywhere outside the nav closes an open menu.
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && links.classList.contains('open')) {
        closeMenu();
      }
    });

    // Collapse back to the desktop layout if the viewport is resized wide.
    window.addEventListener('resize', () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavToggle);
  } else {
    initNavToggle();
  }
})();

class Sidebar {
  constructor() {
    this.sidebar = document.querySelector(".sidebar");
    this.sidebarToggler = document.querySelector(".sidebar-toggler");
    this.menuToggler = document.querySelector(".menu-toggler");
    this.collapsedSidebarHeight = "56px";
    this.fullSidebarHeight = "calc(100vh - 0px)";
    this.init();
  }

  init() {
    this.sidebarToggler.addEventListener("click", () => {
      this.sidebar.classList.toggle("collapsed");
    });

    this.menuToggler.addEventListener("click", () => {
      const isActive = this.sidebar.classList.toggle("menu-active");
      this.sidebar.style.height = isActive ? `${this.sidebar.scrollHeight}px` : this.collapsedSidebarHeight;
      this.menuToggler.querySelector("span").innerText = isActive ? "close" : "menu";
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        this.sidebar.style.height = this.fullSidebarHeight;
      } else {
        this.sidebar.classList.remove("collapsed");
        this.sidebar.style.height = "100vh";
        const isMenuActive = this.sidebar.classList.contains("menu-active");
        this.sidebar.style.height = isMenuActive ? `${this.sidebar.scrollHeight}px` : this.collapsedSidebarHeight;
        this.menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
      }
    });
  }
}

class PageLoader {
  constructor() {
    this.dynamicContent = document.getElementById('dynamic-content');
    this.navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    this.navLinks.forEach(link => {
      link.addEventListener('click', async e => {
        e.preventDefault();
        const href = link.getAttribute('href').substring(1);
        await this.loadSection(href);
      });
    });

    this.loadSection('home');
  }

  async loadSection(page) {
    try {
      const response = await fetch(`${page}.html`);
      if (!response.ok) throw new Error('Network response was not ok');
      const html = await response.text();
      this.dynamicContent.innerHTML = html;
      window.scrollTo(0, 0);
      this.dynamicContent.focus();
    } catch (error) {
      this.dynamicContent.innerHTML = '<p>Sorry, content failed to load.</p>';
      console.error('Error loading section:', error);
    }
  }
}

class ImageInteraction {
  constructor() {
    this.cards = document.querySelectorAll('.image-card');
    this.cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const offsetX = (x - centerX) / centerX * 50;
        const offsetY = (y - centerY) / centerY * 50;

        card.style.transform = `rotate(${card.classList.contains('rotate-left') ? -10 : 20}deg) translate(${offsetX}px, ${offsetY}px) scale(1.05)`;
        card.style.zIndex = '5';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = card.classList.contains('rotate-left')
          ? 'rotate(-8deg)'
          : 'rotate(10deg)';
        card.style.zIndex = '';
      });
    });
  }
}

new ImageInteraction();
new PageLoader();
new Sidebar();

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

      new ImageInteraction();
      new CursorOverlayFollower('.grid-item', '.overlay');
      this.initCarousel();

    } catch (error) {
      this.dynamicContent.innerHTML = '<p>Sorry, content failed to load.</p>';
      console.error('Error loading section:', error);
    }
  }

  initCarousel() {
    if (this.carouselInstance) {
      this.carouselInstance.stop();
    }

    const carouselElement = document.getElementById('carousel-text');
    if (!carouselElement) return;

    const texts = [
      "PASSIONATE ABOUT CODING AND CREATIVITY.",
      "ALWAYS LEARNING AND EXPLORING NEW TECH.",
      "DRIVEN BY CURIOUSITY AND PROBLEM-SOLVING",
      "WELCOME FEEL FREE TO MESSAGE US!",
    ];

    const colors = [
      '#8F8352',  
      '#000000',  
      '#E0AE1F',  
      '#000000',  
    ]

    this.carouselInstance = new TextCarousel(carouselElement, texts, 4000, colors);
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

class TextCarousel {
  constructor(carouselElement, texts, interval = 4000, colors = []) {
    this.carouselElement = carouselElement;
    this.texts = texts;
    this.colors = colors;
    this.interval = interval;
    this.currentIndex = 0;

    if (!this.carouselElement) return;

    this.start();
  }

  start() {
    this.updateText();
    this.timer = setInterval(() => this.updateText(), this.interval);
  }

  updateText() {
    if (!this.carouselElement) return;
    this.carouselElement.style.transform = 'translateX(100%)';
    this.carouselElement.style.opacity = 0;

    setTimeout(() => {
      this.carouselElement.textContent = this.texts[this.currentIndex];

      const color = this.colors[this.currentIndex] || '#0000';
      this.carouselElement.style.color = color;

      this.carouselElement.style.transition = 'none';   
      this.carouselElement.style.transform = 'translateX(-100%)';
      this.carouselElement.style.opacity = 1;
      
      void this.carouselElement.offsetWidth;
      this.carouselElement.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
      this.carouselElement.style.transform = 'translateX(0)';
      this.currentIndex = (this.currentIndex + 1) % this.texts.length;
    }, 500);  
  }

  stop() {
    clearInterval(this.timer);
  }
}

class CursorOverlayFollower {
  constructor(gridSelector, overlaySelector) {
    this.gridItems = document.querySelectorAll(gridSelector);
    this.overlaySelector = overlaySelector;
    this.overlayStates = new Map();
    this.init();
  }

  init() {
    this.gridItems.forEach(item => {
      const overlay = item.querySelector(this.overlaySelector);
      if (!overlay) return;

      item.style.position = 'relative';
      overlay.style.position = 'absolute';
      overlay.style.left = '50%';
      overlay.style.top = '50%';
      overlay.style.transform = 'translate(-50%, -50%)';  

      const state = {
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        following: false,
        rafId: null
      };

      this.overlayStates.set(overlay, state);

      item.addEventListener('mouseenter', () => {
        this.showOverlay(overlay);
        
        overlay.style.left = '50%';
        overlay.style.top = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        state.following = false;
      });

      item.addEventListener('mousemove', e => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const firstMove = !state.following;
        state.targetX = x;
        state.targetY = y;

        if (firstMove) {
          state.following = true;
          
          overlay.style.transform = '';
          this.startAnimation(overlay);
        }
      });

      item.addEventListener('mouseleave', () => {
        this.hideOverlay(overlay);
        this.stopAnimation(overlay);
        state.following = false;
      });
    });
  }

  showOverlay(overlay) {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'none';
  }

  hideOverlay(overlay) {
    overlay.style.opacity = '0';
  }

  startAnimation(overlay) {
    const state = this.overlayStates.get(overlay);
    if (state.rafId) return;

    const easing = 0.15;

    const animate = () => {
      if (!state.following) return;

      state.currentX += (state.targetX - state.currentX) * easing;
      state.currentY += (state.targetY - state.currentY) * easing;

      overlay.style.left = `${state.currentX}px`;
      overlay.style.top = `${state.currentY}px`;

      const dx = Math.abs(state.currentX - state.targetX);
      const dy = Math.abs(state.currentY - state.targetY);

      if (dx > 0.5 || dy > 0.5) {
        state.rafId = requestAnimationFrame(animate);
      } else {
        state.rafId = null;
      }
    };

    animate();
  }

  stopAnimation(overlay) {
    const state = this.overlayStates.get(overlay);
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }
}

new PageLoader();
new Sidebar();


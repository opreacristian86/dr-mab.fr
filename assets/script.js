const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const heroCarousel = document.querySelector(".hero-carousel");

if (heroCarousel) {
  const slides = heroCarousel.querySelectorAll(".hero-carousel-slide");
  const dots = heroCarousel.querySelectorAll(".hero-carousel-dot");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intervalMs = 5000;
  let currentIndex = 0;
  let timerId = null;

  const goToSlide = (index) => {
    slides[currentIndex]?.classList.remove("active");
    dots[currentIndex]?.classList.remove("active");
    dots[currentIndex]?.setAttribute("aria-selected", "false");

    currentIndex = index;

    slides[currentIndex]?.classList.add("active");
    dots[currentIndex]?.classList.add("active");
    dots[currentIndex]?.setAttribute("aria-selected", "true");
  };

  const startTimer = () => {
    if (prefersReducedMotion || timerId !== null) {
      return;
    }

    timerId = window.setInterval(() => {
      goToSlide((currentIndex + 1) % slides.length);
    }, intervalMs);
  };

  const stopTimer = () => {
    window.clearInterval(timerId);
    timerId = null;
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      stopTimer();
      goToSlide(index);
      startTimer();
    });
    dot.addEventListener("focus", stopTimer);
    dot.addEventListener("blur", startTimer);
  });

  heroCarousel.addEventListener("mouseenter", stopTimer);
  heroCarousel.addEventListener("mouseleave", startTimer);

  const lightbox = document.getElementById("hero-lightbox");
  const expandButton = heroCarousel.querySelector(".hero-carousel-expand");

  if (lightbox && expandButton) {
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const lightboxClose = lightbox.querySelector(".lightbox-close");

    const openLightbox = () => {
      const activeSlide = slides[currentIndex];
      if (!activeSlide) {
        return;
      }

      lightboxImage.src = activeSlide.src;
      lightboxImage.alt = activeSlide.alt;
      lightbox.classList.add("lightbox-open");
      stopTimer();
      lightboxClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove("lightbox-open");
      expandButton.focus();
      startTimer();
    };

    expandButton.addEventListener("click", openLightbox);
    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("lightbox-open")) {
        closeLightbox();
      }
    });
  }

  startTimer();
}

/**
 * ==========================================================================
 * АРТ-РЕСТОРАЦІЯ «РАТУША» — JAVASCRIPT & ANIMATION CONTROLLER
 * Technologies: GSAP 3 + ScrollTrigger + Lenis Smooth Scroll
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. LENIS SMOOTH SCROLL INITIALIZATION
  // ------------------------------------------------------------------------
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.warn('Lenis smooth scroll could not be initialized:', e);
  }

  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ------------------------------------------------------------------------
  // 2. HEADER SCROLL & MOBILE DRAWER
  // ------------------------------------------------------------------------
  const header = document.getElementById('site-header');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks = document.querySelectorAll('.nav-link');

  // Header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileBtn.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        mobileDrawer.classList.remove('open');
        mobileBtn.classList.remove('open');
        
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#') && targetId.length > 1) {
          e.preventDefault();
          const targetElem = document.querySelector(targetId);
          if (targetElem && lenis) {
            lenis.scrollTo(targetElem, { offset: -60 });
          } else if (targetElem) {
            targetElem.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // Smooth scroll for desktop anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#hero' || targetId === '#') {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (targetId && targetId.length > 1) {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetElem, { offset: -60 });
          } else {
            targetElem.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // ------------------------------------------------------------------------
  // 3. HERO SECTION ANIMATION (EXPANDING VIDEO ARCH PIN)
  // ------------------------------------------------------------------------
  const heroWrapper = document.querySelector('.hero-pinned-wrapper');
  const heroVideoWindow = document.getElementById('hero-video-window');
  const heroLeftArch = document.querySelector('.hero-arch-left');
  const heroRightArch = document.querySelector('.hero-arch-right');
  const heroScrollIndicator = document.getElementById('hero-scroll-indicator');

  if (heroWrapper && heroVideoWindow && typeof gsap !== 'undefined') {
    // Media match for desktop vs mobile
    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapper,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        }
      });

      // 1. Fade out side arches and scroll indicator
      heroTimeline.to([heroLeftArch, heroRightArch], {
        opacity: 0,
        y: -40,
        scale: 0.92,
        duration: 0.4,
        ease: 'power2.out'
      }, 0);

      heroTimeline.to(heroScrollIndicator, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      }, 0);

      // 2. Expand center arch video to 100vw x 100vh full screen
      heroTimeline.to(heroVideoWindow, {
        top: '50%',
        width: '100vw',
        height: '100vh',
        borderRadius: '0px',
        boxShadow: 'none',
        duration: 1,
        ease: 'power2.inOut'
      }, 0.1);

      return () => {
        heroTimeline.kill();
      };
    });

    mm.add('(max-width: 900px)', () => {
      const heroMobileTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapper,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 1,
        }
      });

      heroMobileTimeline.to(heroVideoWindow, {
        top: '50%',
        width: '100vw',
        height: '100vh',
        borderRadius: '0px',
        duration: 1,
        ease: 'power2.inOut'
      });

      return () => {
        heroMobileTimeline.kill();
      };
    });
  }

  // ------------------------------------------------------------------------
  // 3.1 FULLSCREEN HERO ENTRANCE (VARIANT 2)
  // ------------------------------------------------------------------------
  const fsContent = document.querySelector('.hero-fs-content');
  if (fsContent && typeof gsap !== 'undefined') {
    gsap.fromTo(fsContent.children,
      {
        opacity: 0,
        y: 35,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.18,
        ease: 'power3.out',
        delay: 0.15
      }
    );
  }

  // ------------------------------------------------------------------------
  // 4. CONCEPTION SECTION ANIMATIONS
  // ------------------------------------------------------------------------
  const conceptSection = document.getElementById('concept');
  const conceptHeading = document.getElementById('concept-heading');
  const conceptImgCards = document.querySelectorAll('.concept-img-card');

  if (conceptSection && typeof gsap !== 'undefined') {
    // A. Kinetic typography words normalization
    if (conceptHeading) {
      const wordGroups = conceptHeading.querySelectorAll('.word-group');
      
      // Set initial dynamic varied states
      gsap.set(wordGroups, {
        opacity: 0.3,
        scale: (i) => (i % 3 === 0 ? 1.25 : i % 2 === 0 ? 0.85 : 1.1),
        y: (i) => (i % 2 === 0 ? 15 : -15),
      });

      gsap.to(wordGroups, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.04,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: conceptHeading,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      });
    }

    // B. Growing Image Columns on scroll
    conceptImgCards.forEach((card, idx) => {
      const frame = card.querySelector('.concept-img-frame');
      if (frame) {
        gsap.fromTo(frame, 
          {
            scaleY: 0.2,
            opacity: 0.4,
            transformOrigin: 'bottom center'
          },
          {
            scaleY: 1,
            opacity: 1,
            duration: 2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Parallax effect on scroll
      const speed = parseFloat(card.dataset.speed || 1);
      const yOffset = (speed - 1) * 120;

      gsap.to(card, {
        y: yOffset,
        ease: 'none',
        scrollTrigger: {
          trigger: conceptSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. BANKET SLIDER & SYNCHRONIZED CAPTIONS
  // ------------------------------------------------------------------------
  const banketSlides = document.querySelectorAll('.banket-slide');
  const prevBtn = document.getElementById('banket-prev');
  const nextBtn = document.getElementById('banket-next');
  const captionTitle = document.getElementById('caption-title');
  const captionDesc = document.getElementById('caption-desc');

  const banketData = [
    {
      title: 'БЕНКЕТ - ЦЕ НЕ ПРОСТО ЇЖА',
      desc: 'Це настрій, емоція<br>та момент, що запам’ятовується назавжди.'
    },
    {
      title: 'НЕЗАБУТНЯ АТМОСФЕРА',
      desc: 'Ми створюємо не просто стіл, а атмосферу свята<br>де кожна деталь — продумана до дрібниць.'
    },
    {
      title: 'БЕНКЕТНИЙ СТІЛ',
      desc: 'Ваш банкетний стіл — це головна декорація події,<br>і ми зробимо його ІДЕАЛЬНИМ'
    },
    {
      title: 'КУЛІНАРНІ ШЕДЕВРИ',
      desc: 'Кожна наша страва — це шедевр кулінарного мистецтва,<br>створений з любов’ю та смаком.'
    }
  ];

  let currentSlide = 0;
  let autoplayTimer = null;

  function updateBanketSlide(index) {
    if (index < 0) index = banketSlides.length - 1;
    if (index >= banketSlides.length) index = 0;
    currentSlide = index;

    // Update active slide
    banketSlides.forEach((slide, idx) => {
      if (idx === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update dynamic text with smooth fade transition
    if (captionTitle && captionDesc && banketData[currentSlide]) {
      captionTitle.style.opacity = '0';
      captionDesc.style.opacity = '0';

      setTimeout(() => {
        captionTitle.innerHTML = banketData[currentSlide].title;
        captionDesc.innerHTML = banketData[currentSlide].desc;
        captionTitle.style.opacity = '1';
        captionDesc.style.opacity = '1';
      }, 250);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateBanketSlide(currentSlide + 1);
    }, 5500);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  if (prevBtn && nextBtn && banketSlides.length > 0) {
    // Add CSS transition for caption text
    if (captionTitle) captionTitle.style.transition = 'opacity 0.25s ease';
    if (captionDesc) captionDesc.style.transition = 'opacity 0.25s ease';

    prevBtn.addEventListener('click', () => {
      updateBanketSlide(currentSlide - 1);
      startAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      updateBanketSlide(currentSlide + 1);
      startAutoplay();
    });

    const sliderContainer = document.querySelector('.banket-slider-container');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', stopAutoplay);
      sliderContainer.addEventListener('mouseleave', startAutoplay);

      // Touch swipe support for mobile
      let touchStartX = 0;
      let touchStartY = 0;

      sliderContainer.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          stopAutoplay();
        }
      }, { passive: true });

      sliderContainer.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchStartX - touchEndX;
          const diffY = touchStartY - touchEndY;

          // If horizontal swipe is dominant and exceeds threshold
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
            if (diffX > 0) {
              updateBanketSlide(currentSlide + 1); // Swiped left -> Next slide
            } else {
              updateBanketSlide(currentSlide - 1); // Swiped right -> Prev slide
            }
          }
          startAutoplay();
        }
      }, { passive: true });
    }

    startAutoplay();
  }

  // ------------------------------------------------------------------------
  // 6. MENU SECTION (PARALLAX ILLUSTRATIONS & LIGHTBOX POPUP)
  // ------------------------------------------------------------------------
  // A. Subtle float parallax for illustrations
  const illustrations = document.querySelectorAll('.parallax-float');
  illustrations.forEach(img => {
    const floatSpeed = parseFloat(img.dataset.floatSpeed || 0.08);
    gsap.to(img, {
      yPercent: floatSpeed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.menu-row'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  });

  // B. Lightbox Modal
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const menuCards = document.querySelectorAll('.menu-item-card');

  function openLightbox(imgSrc, title) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    if (lightboxCaption) lightboxCaption.textContent = title;
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (lightboxImg) lightboxImg.src = '';
    }, 350);
  }

  menuCards.forEach(card => {
    card.addEventListener('click', () => {
      const fullImg = card.dataset.fullImg || card.querySelector('img')?.src;
      const itemTitle = card.dataset.itemTitle || card.querySelector('.menu-item-name')?.textContent;
      if (fullImg) {
        openLightbox(fullImg, itemTitle);
      }
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // ------------------------------------------------------------------------
  // 7. EVENTS SECTION (STAGGERED REVEAL)
  // ------------------------------------------------------------------------
  const eventCards = document.querySelectorAll('.event-card');
  if (eventCards.length > 0 && typeof gsap !== 'undefined') {
    gsap.fromTo(eventCards, 
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.18,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.events-cards-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  }

  // ------------------------------------------------------------------------
  // 7.1 EVENTS PAGE "LOAD MORE" FUNCTIONALITY
  // ------------------------------------------------------------------------
  const loadMoreBtn = document.getElementById('load-more-events-btn');
  const eventsGrid = document.getElementById('events-grid');

  if (loadMoreBtn && eventsGrid) {
    let clickCount = 0;
    const additionalBatches = [
      [
        { day: '17', month: 'ТРА 2026', title: 'Вишукані вечори з живою музикою', desc: 'Жива музика, що створює настрій кожного вечора', img: 'Assets/Images/Events/Event-1.png' },
        { day: '10', month: 'ТРА 2026', title: 'Музичний вечір', desc: 'Музичний вечір в АртРесторації Ратуша - 10 липня | 18:00', img: 'Assets/Images/Events/Event-2.png' },
        { day: '03', month: 'ТРА 2026', title: 'Пінна вечірка', desc: 'ПІННА ВЕЧІРКА в АртРесторації Ратуша — море піни, веселощів та яскравих емоцій для дітей!', img: 'Assets/Images/Events/Event-3.png' },
        { day: '26', month: 'КВІ 2026', title: 'Вишукані вечори з живою музикою', desc: 'Жива музика, що створює настрій кожного вечора', img: 'Assets/Images/Events/Event-1.png' },
        { day: '19', month: 'КВІ 2026', title: 'Музичний вечір', desc: 'Музичний вечір в АртРесторації Ратуша - 10 липня | 18:00', img: 'Assets/Images/Events/Event-2.png' },
        { day: '12', month: 'КВІ 2026', title: 'Пінна вечірка', desc: 'ПІННА ВЕЧІРКА в АртРесторації Ратуша — море піни, веселощів та яскравих емоцій для дітей!', img: 'Assets/Images/Events/Event-3.png' },
        { day: '05', month: 'КВІ 2026', title: 'Вишукані вечори з живою музикою', desc: 'Жива музика, що створює настрій кожного вечора', img: 'Assets/Images/Events/Event-1.png' },
        { day: '29', month: 'БЕР 2026', title: 'Музичний вечір', desc: 'Музичний вечір в АртРесторації Ратуша - 10 липня | 18:00', img: 'Assets/Images/Events/Event-2.png' },
        { day: '22', month: 'БЕР 2026', title: 'Пінна вечірка', desc: 'ПІННА ВЕЧІРКА в АртРесторації Ратуша — море піни, веселощів та яскравих емоцій для дітей!', img: 'Assets/Images/Events/Event-3.png' }
      ]
    ];

    loadMoreBtn.addEventListener('click', () => {
      if (clickCount < additionalBatches.length) {
        const batch = additionalBatches[clickCount];
        const newCards = [];

        batch.forEach(item => {
          const card = document.createElement('article');
          card.className = 'event-card';
          card.innerHTML = `
            <div class="event-card-top">
              <div class="event-date-badge">
                <span class="event-day">${item.day}</span>
                <span class="event-month">${item.month}</span>
              </div>
            </div>
            <div class="event-arch-img-frame">
              <img src="${item.img}" alt="${item.title}" class="event-img" loading="lazy">
            </div>
            <div class="event-card-content">
              <h3 class="event-title">${item.title}</h3>
              <p class="event-description">${item.desc}</p>
              <span class="event-author">АВТОР: АДМІНІСТРАТОР</span>
            </div>
          `;
          eventsGrid.appendChild(card);
          newCards.push(card);
        });

        if (typeof gsap !== 'undefined') {
          gsap.fromTo(newCards,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
          );
        }

        clickCount++;
        if (clickCount >= additionalBatches.length) {
          loadMoreBtn.textContent = 'ПОДІЇ ЗАВАНТАЖЕНО';
          loadMoreBtn.style.opacity = '0.6';
          loadMoreBtn.style.cursor = 'default';
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // 8. FOOTER SECTION (ARCH IMAGE GROWTH ANIMATION)
  // ------------------------------------------------------------------------
  const footerArchFrame = document.getElementById('footer-arch-frame');
  const footerElem = document.getElementById('footer');

  if (footerArchFrame && footerElem && typeof gsap !== 'undefined') {
    gsap.fromTo(footerArchFrame,
      {
        scale: 0.4,
        opacity: 0.6,
        transformOrigin: 'bottom center',
      },
      {
        scale: 0.75,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerElem,
          start: 'top 85%',
          end: 'bottom bottom',
          scrub: 2,
        }
      }
    );
  }

  console.log('Art-Restoratsiia Ratusha web application initialized successfully.');
});

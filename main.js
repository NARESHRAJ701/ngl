/* ═══════════════════════════════════════════════════════════
   NUTRIGAIN LABS — Main JavaScript
   Scroll animations, counter, header, mobile nav, parallax
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Header Scroll ──
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── Mobile Navigation ──
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');
  const navOverlay = document.getElementById('navOverlay');

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMobile.classList.toggle('active');
      if (navOverlay) navOverlay.classList.toggle('active');
      document.body.style.overflow = navMobile.classList.contains('active') ? 'hidden' : '';
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMobile.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMobile.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ESC key closes nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobile && navMobile.classList.contains('active')) {
      hamburger.classList.remove('active');
      navMobile.classList.remove('active');
      if (navOverlay) navOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ── Scroll Reveal ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Counter Animation ──
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const text = el.dataset.text || '';

          // Skip non-numeric
          if (target === 0 && text) {
            el.textContent = text;
            counterObserver.unobserve(el);
            return;
          }

          let current = 0;
          const duration = 1500; // ms
          const steps = 60;
          const increment = target / steps;
          let step = 0;

          const timer = setInterval(() => {
            step++;
            current += increment;
            if (step >= steps) {
              current = target;
              clearInterval(timer);
            }

            // Format large numbers with commas
            const formatted = Math.floor(current).toLocaleString('en-US');
            el.textContent = formatted + suffix;
          }, duration / steps);

          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ── Hero Parallax + Leaf System ──
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroVisual = hero.querySelector('.hero-visual');
    const heroLeaves = document.querySelectorAll('.hero-leaf');

    // Base transforms for each leaf (rotation, scale from CSS)
    const leafConfig = {
      heroLeafTL: { baseRotate: -20, baseScale: 0.9, baseOpacity: 0.85 },
      heroLeafTR: { baseRotate: 28, baseScale: 1, baseOpacity: 1 },
      heroLeafBR: { baseRotate: 15, baseScale: 0.85, baseOpacity: 0.75 },
    };

    let scrollTicking = false;

    // Scroll parallax for hero visual + all leaves
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          if (scrolled < window.innerHeight) {
            // Hero image parallax
            if (heroVisual) {
              heroVisual.style.transform = `translateY(${scrolled * 0.06}px)`;
            }

            const scrollFactor = scrolled / window.innerHeight;

            // Individual leaf parallax
            heroLeaves.forEach(leaf => {
              const id = leaf.id;
              const config = leafConfig[id];
              if (!config) return;

              const pxFactor = parseFloat(leaf.dataset.parallaxX) || 0;
              const pyFactor = parseFloat(leaf.dataset.parallaxY) || 0;
              const moveX = scrolled * pxFactor;
              const moveY = scrolled * pyFactor;
              const rotShift = scrollFactor * 8 * (pxFactor > 0 ? 1 : -1);
              const fadeOut = Math.max(config.baseOpacity - scrollFactor * 0.9, 0);

              leaf.style.transform =
                `rotate(${config.baseRotate + rotShift}deg) scale(${config.baseScale}) translate(${moveX}px, ${moveY}px)`;
              leaf.style.opacity = fadeOut;

              // Pause CSS animation during scroll
              if (scrolled > 5 && !leaf.classList.contains('leaf-parallax')) {
                leaf.classList.add('leaf-parallax');
              } else if (scrolled <= 5) {
                leaf.classList.remove('leaf-parallax');
                leaf.style.transform = '';
                leaf.style.opacity = '';
              }
            });
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Mouse-tracking tilt interaction for leaves
    if (heroLeaves.length > 0) {
      // Different mouse sensitivity per leaf
      const mouseSensitivity = {
        heroLeafTL: { tilt: 4, drift: 3 },
        heroLeafTR: { tilt: 8, drift: 5 },
        heroLeafBR: { tilt: 3, drift: 2 },
      };

      hero.addEventListener('mousemove', (e) => {
        if (window.pageYOffset > 10) return;
        const rect = hero.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

        heroLeaves.forEach(leaf => {
          const id = leaf.id;
          const config = leafConfig[id];
          const sens = mouseSensitivity[id];
          if (!config || !sens) return;

          const driftX = mouseX * sens.drift;
          const driftY = mouseY * sens.drift;
          const rotDrift = mouseX * sens.tilt * 0.5;

          leaf.style.transform =
            `rotate(${config.baseRotate + rotDrift}deg) scale(${config.baseScale}) translate(${driftX}px, ${driftY}px)`;
        });
      });

      hero.addEventListener('mouseleave', () => {
        if (window.pageYOffset <= 10) {
          heroLeaves.forEach(leaf => {
            leaf.style.transform = '';
            leaf.classList.remove('leaf-parallax');
          });
        }
      });
    }
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Floating Food Parallax ──
  const catFloats = document.querySelectorAll('.cat-float');
  if (catFloats.length > 0) {
    let ticking = false;
    const categoriesSection = document.getElementById('categories');

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (categoriesSection) {
            const rect = categoriesSection.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView) {
              const scrollOffset = window.scrollY - categoriesSection.offsetTop + window.innerHeight;
              catFloats.forEach(el => {
                const speed = parseFloat(el.dataset.speed) || 0.3;
                const yMove = scrollOffset * speed * 0.15;
                el.style.transform = `translateY(${-yMove}px)`;
              });
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

});

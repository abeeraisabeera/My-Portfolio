(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const siteNav = document.getElementById('siteNav');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  if (siteNav) {
    const onNavScroll = () => siteNav.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  window.observeReveals = (nodes) => {
    nodes.forEach(el => {
      if (!el.classList.contains('visible')) revealObserver.observe(el);
    });
  };
  window.observeReveals(document.querySelectorAll('.reveal'));

  document.querySelectorAll('#hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 100 + i * 120);
  });

  /* Project filters */
  window.initProjectFilters = () => {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.replaceWith(clone);
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        let visible = 0;
        document.querySelectorAll('.project-card').forEach(card => {
          const tags = (card.dataset.tags || '').split(' ');
          const show = filter === 'all' || tags.includes(filter);
          card.classList.toggle('hidden', !show);
          if (show) visible++;
        });
        grid.style.gridTemplateColumns = visible <= 1 ? '1fr' : '';
      });
    });
  };
  window.initProjectFilters();

  /* tsParticles — home only */
  function initParticles() {
    if (!document.getElementById('tsparticles')) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isNarrow = window.matchMedia('(max-width: 720px)').matches;
    if (prefersReduced || isNarrow || !window.tsParticles) return;

    window.tsParticles.load('tsparticles', {
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 48,
      particles: {
        number: { value: 42, density: { enable: true, value_area: 900 } },
        color: { value: ['#1B4F8A', '#6B6660'] },
        links: {
          enable: true,
          color: '#1B4F8A',
          distance: 140,
          opacity: 0.18,
          width: 1
        },
        move: { enable: true, speed: 0.55, outModes: { default: 'out' } },
        opacity: { value: 0.35 },
        size: { value: { min: 1, max: 2.4 } }
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          resize: true
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.35 } }
        }
      },
      detectRetina: true,
      pauseOnBlur: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initParticles, 50));
  } else {
    setTimeout(initParticles, 50);
  }
})();

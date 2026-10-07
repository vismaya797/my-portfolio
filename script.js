/**
 * Pixel Art Portfolio - Interactive Engine v3.0
 * -----------------------------------------------
 * Handles:
 * 1. 8-Bit Web Audio API Sound Effects Engine
 * 2. Night Mode Theme Toggle (media queries + manual overrides)
 * 3. Vertical Sidebar navigation, mobile off-canvas drawer & ScrollSpy
 * 4. Interactive Dev Terminal Chat Simulation
 * 5. Scroll-Triggered Section Reveal Animations (IntersectionObserver)
 * 6. Animated Skill Progress Bars (triggered on scroll into view)
 * 7. Interactive Project Inspection Modals
 * 8. Dynamic copyright year
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. 8-BIT AUDIO SYNTHESIZER (WEB AUDIO API)
  //    Creates retro chiptune sound effects using the browser's Web Audio API.
  // =========================================================================
  let sfxEnabled = localStorage.getItem('portfolio-sfx') !== 'false';
  const soundToggleBtn = document.getElementById('sidebar-sound-toggle');
  const soundIcon = document.getElementById('sound-toggle-icon');
  const soundLabel = document.getElementById('sound-toggle-label');

  function updateSoundUI() {
    if (soundIcon && soundLabel) {
      soundIcon.textContent = sfxEnabled ? '🔊' : '🔇';
      soundLabel.textContent = sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
    }
  }
  updateSoundUI();

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      localStorage.setItem('portfolio-sfx', sfxEnabled);
      updateSoundUI();
      if (sfxEnabled) play8BitSound(587, 0.08, 'square');
    });
  }

  /**
   * Synthesizes a short 8-bit style beep using Web Audio API oscillator.
   * @param {number} frequency - Base pitch in Hz
   * @param {number} duration  - Duration in seconds
   * @param {string} waveType  - Oscillator type: 'square', 'sine', 'sawtooth'
   */
  function play8BitSound(frequency = 520, duration = 0.07, waveType = 'square') {
    if (!sfxEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.6, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Silently handle audio autoplay restrictions
    }
  }

  // =========================================================================
  // 2. NIGHT MODE TOGGLE (MEDIA QUERIES & MANUAL OVERRIDES)
  //    Respects system prefers-color-scheme, with manual localStorage override.
  // =========================================================================
  const themeToggles = [
    document.getElementById('theme-toggle'),
    document.getElementById('hero-theme-toggle'),
    document.getElementById('mobile-theme-toggle')
  ].filter(Boolean);

  const themeToggleLabels = [
    document.getElementById('theme-toggle-label'),
    document.getElementById('hero-toggle-label')
  ].filter(Boolean);

  const prefersDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function getCurrentTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved) return saved;
    return prefersDarkMediaQuery.matches ? 'dark' : 'light';
  }

  function applyTheme(theme, isUserAction = false) {
    if (isUserAction) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('portfolio-theme', theme);
      play8BitSound(theme === 'dark' ? 380 : 760, 0.1);
    } else {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        // Pure CSS @media (prefers-color-scheme: dark) applies natively
        document.documentElement.removeAttribute('data-theme');
      }
    }

    const labelText = theme === 'dark' ? 'DAY MODE' : 'NIGHT MODE';
    themeToggleLabels.forEach(label => {
      label.textContent = labelText;
    });

    const btnTitle = theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode';
    themeToggles.forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark');
      btn.setAttribute('title', btnTitle);
    });
  }

  // Initialize theme on page load
  applyTheme(getCurrentTheme(), false);

  // Toggle click handler — each toggle button fires the same action
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = getCurrentTheme();
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme, true);
    });
  });

  // Sync to OS-level theme changes in real time (when not manually overridden)
  prefersDarkMediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('portfolio-theme')) {
      applyTheme(e.matches ? 'dark' : 'light', false);
    }
  });

  // =========================================================================
  // 3. VERTICAL NAVIGATION BAR & MOBILE DRAWER
  //    Off-canvas sidebar on mobile, fixed sidebar on desktop.
  // =========================================================================
  const sidebarNavbar = document.getElementById('sidebar-navbar');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const navLinks = document.querySelectorAll('.sidebar-nav-link');

  function openSidebar() {
    if (!sidebarNavbar) return;
    sidebarNavbar.classList.add('is-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('is-visible');
    if (sidebarToggleBtn) sidebarToggleBtn.setAttribute('aria-expanded', 'true');
    // Lock body scroll on mobile while drawer is open
    document.body.style.overflow = window.innerWidth <= 991 ? 'hidden' : '';
    play8BitSound(440, 0.05);
  }

  function closeSidebar() {
    if (!sidebarNavbar) return;
    sidebarNavbar.classList.remove('is-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('is-visible');
    if (sidebarToggleBtn) sidebarToggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
      const isOpen = sidebarNavbar && sidebarNavbar.classList.contains('is-open');
      if (isOpen) closeSidebar();
      else openSidebar();
    });
  }

  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Keyboard accessibility: Escape closes mobile drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sidebarNavbar && sidebarNavbar.classList.contains('is-open')) {
        closeSidebar();
      }
      // Also close any open project modal on Escape
      closeAllModals();
    }
  });

  // =========================================================================
  // 4. SCROLLSPY — Active nav link follows the visible section
  // =========================================================================
  const sectionIds = ['hero', 'about', 'skills', 'timeline', 'projects', 'video-highlight', 'testimonials', 'chat', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function setActiveNavLink(targetId) {
    navLinks.forEach(link => {
      const section = link.getAttribute('data-section');
      if (section === targetId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // IntersectionObserver for accurate scroll section tracking
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -55% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveNavLink(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
  } else {
    // Fallback scroll listener for older browsers
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= scrollPos) {
          setActiveNavLink(sec.id);
          break;
        }
      }
    }, { passive: true });
  }

  // Click handler for nav items — closes drawer on mobile and plays sound
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      play8BitSound(620, 0.06);
      if (window.innerWidth <= 991) closeSidebar();
      const targetId = link.getAttribute('data-section');
      if (targetId) setActiveNavLink(targetId);
    });
  });

  // =========================================================================
  // 5. SCROLL-TRIGGERED REVEAL ANIMATIONS
  //    Elements with class .reveal animate in when they enter the viewport.
  //    Add class .reveal to any element in HTML for it to fade + slide in.
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after reveal — no need to re-trigger
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px', // trigger slightly before element reaches edge
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show all elements immediately for browsers without IntersectionObserver
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // =========================================================================
  // 6. ANIMATED SKILL PROGRESS BARS
  //    Each .skill-item has data-proficiency="85" attribute.
  //    When the skills section scrolls into view, bars animate from 0 to target.
  // =========================================================================
  const skillItems = document.querySelectorAll('.skill-item[data-proficiency]');

  if ('IntersectionObserver' in window && skillItems.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const proficiency = entry.target.getAttribute('data-proficiency');
          const bar = entry.target.querySelector('.pixel-progress-fill');
          if (bar && proficiency) {
            // Small delay per bar for a staggered animation feel
            const index = Array.from(skillItems).indexOf(entry.target);
            const staggerDelay = (index % 4) * 100;

            setTimeout(() => {
              bar.style.width = `${proficiency}%`;
            }, staggerDelay);
          }
          skillObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.2
    });

    skillItems.forEach(item => skillObserver.observe(item));
  } else {
    // Fallback: show all bars at full width immediately
    skillItems.forEach(item => {
      const proficiency = item.getAttribute('data-proficiency');
      const bar = item.querySelector('.pixel-progress-fill');
      if (bar && proficiency) {
        bar.style.width = `${proficiency}%`;
      }
    });
  }

  // =========================================================================
  // 7. INTERACTIVE PROJECT INSPECTION MODALS
  //    Opens a fullscreen detail modal when user clicks "INSPECT" on a project card.
  // =========================================================================
  const modalContainer = document.getElementById('project-modals-root');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const openModalBtns = document.querySelectorAll('.btn-open-modal');
  const closeModalBtns = document.querySelectorAll('.modal-close-btn');
  // Also allow clicking project thumbnails to open modal
  const thumbnailWrappers = document.querySelectorAll('.project-thumbnail-wrapper');

  let currentOpenModal = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || !modalContainer) return;

    // Close any currently open modal first
    closeAllModals();

    modalContainer.classList.add('is-active');
    modalContainer.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    currentOpenModal = modal;

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    play8BitSound(650, 0.08, 'sine');

    // Move focus to close button for accessibility
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 50);
    }
  }

  function closeAllModals() {
    if (!modalContainer) return;
    modalContainer.classList.remove('is-active');
    modalContainer.setAttribute('aria-hidden', 'true');

    document.querySelectorAll('.pixel-modal-dialog.is-open').forEach(dialog => {
      dialog.classList.remove('is-open');
      dialog.setAttribute('aria-hidden', 'true');
    });

    currentOpenModal = null;
    document.body.style.overflow = '';
  }

  // Open modal from "INSPECT" buttons
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (targetId) openModal(targetId);
    });
  });

  // Open modal from project thumbnail clicks
  thumbnailWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const card = wrapper.closest('.project-card');
      if (!card) return;
      const projectId = card.getAttribute('data-project-id');
      if (projectId) openModal(`modal-${projectId}`);
    });

    // Keyboard accessibility for thumbnail buttons
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.click();
      }
    });
  });

  // Close modal from close buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
      play8BitSound(380, 0.06);
    });
  });

  // Close modal on backdrop click
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
      closeAllModals();
    });
  }

  // Trap focus inside open modal for accessibility
  if (modalContainer) {
    modalContainer.addEventListener('keydown', (e) => {
      if (!currentOpenModal) return;
      if (e.key === 'Tab') {
        const focusable = currentOpenModal.querySelectorAll(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  // =========================================================================
  // 8. INTERACTIVE TERMINAL CHAT
  //    Simulates a retro dev terminal with keyword-matched AI responses.
  // =========================================================================
  const chatForm = document.getElementById('chat-terminal-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const quickChips = document.querySelectorAll('.quick-chip');

  // Pre-scripted responses for common queries
  const botResponses = {
    'availability': "I am currently OPEN to full-time Software Engineer positions and select contract architecture opportunities. Reach out via the Contact form or direct email!",
    'stack': "My preferred stack: TypeScript, React, Next.js, Node.js/Express, Python/FastAPI, PostgreSQL, Docker, and AWS Cloud services.",
    'call': "You can easily schedule a conversation! Leave your email below or message me directly at engineer@example.com.",
    'projects': "My latest projects include a real-time analytics dashboard, a collaborative Kanban platform, and an open-source deployment CLI tool. Scroll up to the Projects section to explore them!",
    'skills': "Core skills: TypeScript/JS (Lvl 95), React/Next.js (Lvl 94), Python/FastAPI (Lvl 90), Node.js (Lvl 91), SQL (Lvl 88), Docker (Lvl 88), and AWS Cloud (Lvl 85).",
    'default': "Transmission received! I will process this quest data and reply via your contact transmission channel. 📡"
  };

  function appendChatMessage(sender, text, isUser = false) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${isUser ? 'user-msg' : 'bot-msg'}`;
    msgDiv.innerHTML = `<span class="msg-tag">[${sender}]</span> ${text}`;
    chatMessages.appendChild(msgDiv);
    // Auto-scroll to latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
    play8BitSound(isUser ? 500 : 720, 0.08);
  }

  function handleUserChatInput(query) {
    if (!query || !query.trim()) return;
    appendChatMessage('YOU', query.trim(), true);

    const lower = query.toLowerCase();
    let reply = botResponses.default;

    if (lower.includes('avail') || lower.includes('hire') || lower.includes('job') || lower.includes('role') || lower.includes('open')) {
      reply = botResponses.availability;
    } else if (lower.includes('stack') || lower.includes('tech') || lower.includes('tool')) {
      reply = botResponses.stack;
    } else if (lower.includes('skill') || lower.includes('lang') || lower.includes('expert')) {
      reply = botResponses.skills;
    } else if (lower.includes('call') || lower.includes('meet') || lower.includes('interview') || lower.includes('talk') || lower.includes('contact')) {
      reply = botResponses.call;
    } else if (lower.includes('project') || lower.includes('build') || lower.includes('work') || lower.includes('portfolio')) {
      reply = botResponses.projects;
    }

    // Add slight realistic delay before "AI" responds
    setTimeout(() => {
      appendChatMessage('DEV_AI', reply, false);
    }, 500 + Math.random() * 300);
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserChatInput(chatInput.value);
      chatInput.value = '';
    });
  }

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-chat-prompt') || chip.textContent;
      handleUserChatInput(prompt);
    });
  });

  // =========================================================================
  // 9. DYNAMIC COPYRIGHT YEAR
  // =========================================================================
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // =========================================================================
  // 10. CONTACT FORM — Pixel art success/error feedback
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const contactSubmitBtn = document.getElementById('contact-submit');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (contactSubmitBtn) {
        const originalText = contactSubmitBtn.innerHTML;
        contactSubmitBtn.innerHTML = '⚡ TRANSMITTING...';
        contactSubmitBtn.disabled = true;

        play8BitSound(600, 0.1, 'sine');

        // Simulate send delay (replace with real fetch/API call)
        setTimeout(() => {
          contactSubmitBtn.innerHTML = '✅ QUEST SUBMITTED!';
          play8BitSound(880, 0.15, 'sine');
          contactForm.reset();

          // Reset button after 3 seconds
          setTimeout(() => {
            contactSubmitBtn.innerHTML = originalText;
            contactSubmitBtn.disabled = false;
          }, 3000);
        }, 1200);
      }
    });
  }

  // =========================================================================
  // 11. PIXEL ART HOVER SOUND EFFECTS ON BUTTONS & NAV LINKS
  //     Adds subtle beep sounds on interactive hover for extra retro feel.
  // =========================================================================
  const hoverSoundElements = document.querySelectorAll('.pixel-btn, .sidebar-nav-link, .quick-chip, .interest-chip');

  hoverSoundElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      play8BitSound(420, 0.03, 'square');
    });
  });

});

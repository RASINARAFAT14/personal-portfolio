(() => {
  // ---------- Gallery carousel and lightbox ----------
  const track = document.getElementById('galleryTrack');

  if (track) {
    const cards = [...track.querySelectorAll('.photo-card')];
    const prev = document.querySelector('.carousel-btn.prev');
    const next = document.querySelector('.carousel-btn.next');
    const dots = document.getElementById('galleryDots');
    let index = 0;
    let timer;

    function perView() {
      if (window.innerWidth <= 700) return 1;
      if (window.innerWidth <= 980) return 3;
      return 4;
    }

    function maxIndex() {
      return Math.max(0, cards.length - perView());
    }

    function pageCount() {
      return Math.max(1, Math.ceil(cards.length / perView()));
    }

    function buildDots() {
      dots.innerHTML = '';
      for (let i = 0; i < pageCount(); i++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Gallery page ${i + 1}`);
        button.addEventListener('click', () => goTo(Math.min(i * perView(), maxIndex())));
        dots.appendChild(button);
      }
    }

    function update() {
      const card = cards[0];
      if (!card) return;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-index * step}px)`;
      const currentPage = Math.floor(index / perView());
      [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === currentPage));
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      update();
    }

    function advance() {
      const step = perView();
      index = index + step > maxIndex() ? 0 : index + step;
      update();
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(advance, 4000);
    }

    function stopAuto() {
      clearInterval(timer);
      timer = null;
    }

    prev.addEventListener('click', () => goTo(index - perView()));
    next.addEventListener('click', () => goTo(index + perView()));
    window.addEventListener('resize', () => {
      index = Math.min(index, maxIndex());
      buildDots();
      update();
    });

    // Pause only while the mouse is over a photo, then continue when it leaves.
    cards.forEach((card) => {
      card.addEventListener('mouseenter', stopAuto);
      card.addEventListener('mouseleave', restart);
    });

    buildDots();
    update();
    restart();

    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImage');
    const lbCap = document.getElementById('lightboxCaption');
    const lbClose = document.getElementById('lightboxClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');
    let activePhoto = 0;

    function openLightbox(i) {
      activePhoto = i;
      const img = cards[i].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cards[i].dataset.caption || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function movePhoto(direction) {
      activePhoto = (activePhoto + direction + cards.length) % cards.length;
      openLightbox(activePhoto);
    }

    cards.forEach((card, i) => card.addEventListener('click', () => openLightbox(i)));
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => movePhoto(-1));
    lbNext.addEventListener('click', () => movePhoto(1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') movePhoto(-1);
      if (event.key === 'ArrowRight') movePhoto(1);
    });
  }

  // ---------- Contact form validation ----------
  const form = document.getElementById('contactForm');

  if (form) {
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const phone = document.getElementById('contactPhone');
    const message = document.getElementById('contactMessage');
    const status = document.getElementById('formStatus');

    const errors = {
      name: document.getElementById('nameError'),
      email: document.getElementById('emailError'),
      phone: document.getElementById('phoneError'),
      message: document.getElementById('messageError')
    };

    function setError(input, errorElement, text) {
      errorElement.textContent = text;
      input.classList.toggle('invalid', Boolean(text));
      input.setAttribute('aria-invalid', Boolean(text));
    }

    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validPhone(value) {
      if (!value.trim()) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length >= 8 && digits.length <= 12;
    }

    function validateForm() {
      let valid = true;
      const nameValue = name.value.trim();
      const emailValue = email.value.trim();
      const phoneValue = phone.value.trim();
      const messageValue = message.value.trim();

      if (nameValue.length < 2) {
        setError(name, errors.name, 'Please enter at least 2 characters.');
        valid = false;
      } else {
        setError(name, errors.name, '');
      }

      if (!validEmail(emailValue)) {
        setError(email, errors.email, 'Please enter a valid email address.');
        valid = false;
      } else {
        setError(email, errors.email, '');
      }

      if (!validPhone(phoneValue)) {
        setError(phone, errors.phone, 'Please enter a valid phone number.');
        valid = false;
      } else {
        setError(phone, errors.phone, '');
      }

      if (messageValue.length < 10) {
        setError(message, errors.message, 'Please write at least 10 characters.');
        valid = false;
      } else {
        setError(message, errors.message, '');
      }

      return valid;
    }

    [name, email, phone, message].forEach((input) => {
      input.addEventListener('input', () => {
        status.textContent = '';
        status.className = 'form-status';
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      if (!validateForm()) {
        status.textContent = 'Please fix the highlighted fields.';
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const subject = encodeURIComponent(`Portfolio message from ${name.value.trim()}`);
      const body = encodeURIComponent(
        `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\nPhone: ${phone.value.trim() || 'Not provided'}\n\nMessage:\n${message.value.trim()}`
      );

      status.textContent = 'Validation successful. Opening your email application...';
      status.className = 'form-status success';
      window.location.href = `mailto:rasinarafat526@gmail.com?subject=${subject}&body=${body}`;
    });
  }
})();

// ---------- Creative motion + 3D design effects ----------
(() => {
  // Scroll reveal
  const revealItems = document.querySelectorAll('.section-heading, .about-grid, .interest-grid, .preview-grid, .contact-layout, .story-grid, .profile-table, .gallery-section .carousel');
  revealItems.forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
  }, { threshold: 0.12 });
  revealItems.forEach(el => observer.observe(el));

  // Mouse-following ambient glow
  const aura = document.createElement('div');
  aura.className = 'cursor-aura';
  document.body.appendChild(aura);
  window.addEventListener('pointermove', e => {
    document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
  }, { passive: true });

  // Gentle 3D tilt; no content is changed
  if (matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.hero-photo, .interest-card, .preview-card, .contact-card').forEach(card => {
      card.classList.add('tilt-card');
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(850px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Sparse cinematic particles
  const field = document.createElement('div');
  field.className = 'motion-particles';
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('i');
    p.style.left = `${(i * 37) % 97}%`;
    p.style.top = `${(i * 53) % 92}%`;
    p.style.setProperty('--dur', `${5 + (i % 7)}s`);
    p.style.setProperty('--op', `${.18 + (i % 5) * .08}`);
    p.style.animationDelay = `${-(i % 6)}s`;
    field.appendChild(p);
  }
  document.body.appendChild(field);
})();

// ---------- Immersive background depth (visual only) ----------
(() => {
  const scene = document.createElement('div');
  scene.className = 'depth-scene';
  scene.innerHTML = '<span class="depth-orb o1"></span><span class="depth-orb o2"></span><span class="depth-ring"></span><span class="shooting-star s1"></span><span class="shooting-star s2"></span><span class="depth-grid"></span>';
  document.body.appendChild(scene);

  if (matchMedia('(pointer:fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - .5) * 2;
      ty = (e.clientY / innerHeight - .5) * 2;
    }, {passive:true});
    const move = () => {
      cx += (tx - cx) * .045; cy += (ty - cy) * .045;
      scene.style.transform = `translate3d(${cx * -9}px,${cy * -7}px,0) rotateX(${cy * .7}deg) rotateY(${cx * -.7}deg)`;
      requestAnimationFrame(move);
    };
    move();
  }
})();

// ---------- Siri-style voice controller ----------
(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const assistant = document.createElement('div');
  assistant.className = 'voice-assistant';
  assistant.innerHTML = `
    <div class="voice-panel" aria-live="polite">
      <strong id="voiceStatus">Voice Controller</strong>
      <span id="voiceHint">Tap the orb, then say “open gallery”</span>
      <span class="heard" id="voiceHeard"></span>
    </div>
    <button class="voice-orb" id="voiceOrb" type="button" aria-label="Start voice controller" aria-pressed="false" title="Voice controller">
      <span class="voice-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    </button>`;
  document.body.appendChild(assistant);

  const orb = document.getElementById('voiceOrb');
  const status = document.getElementById('voiceStatus');
  const hint = document.getElementById('voiceHint');
  const heard = document.getElementById('voiceHeard');

  // Safe storage: works both on the live website and when opening the files locally.
  const memoryStore = {};
  const safeStore = {
    getItem(key) { try { return sessionStorage.getItem(key); } catch (_) { return memoryStore[key] ?? null; } },
    setItem(key, value) { try { sessionStorage.setItem(key, String(value)); } catch (_) { memoryStore[key] = String(value); } },
    removeItem(key) { try { sessionStorage.removeItem(key); } catch (_) { delete memoryStore[key]; } }
  };

  let recognition = null;
  let wantsListening = safeStore.getItem('voiceControllerEnabled') === 'true';
  let speaking = false;
  let restartTimer = null;

  function setStatus(title, message = '', transcript = '') {
    status.textContent = title;
    hint.textContent = message;
    heard.textContent = transcript;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    speaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    utterance.volume = .82;
    utterance.onend = () => {
      speaking = false;
      if (wantsListening && recognition) {
        try { recognition.start(); } catch (_) {}
      }
    };
    try { recognition?.stop(); } catch (_) {}
    window.speechSynthesis.speak(utterance);
  }

  function navigate(file) {
    window.location.href = file;
  }

  function goToSection(id, label) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else location.href = `index.html#${id}`;
    setStatus('Voice Controller', `Opening ${label}`, '');
  }

  function field(id) { return document.getElementById(id); }
  function fillField(id, value, label) {
    const el = field(id);
    if (!el) {
      location.href = 'index.html#contact';
      return false;
    }
    el.focus();
    el.value = value.trim();
    el.dispatchEvent(new Event('input', { bubbles: true }));
    setStatus('Voice Controller', `${label} entered`, `“${value.trim()}”`);
    return true;
  }

  function handleCommand(raw) {
    const command = raw.toLowerCase().trim().replace(/[.,!?]+$/g, '');
    setStatus('I heard you', 'Processing command…', `“${raw}”`);

    if (/\b(stop listening|stop voice|voice off|turn off voice controller|turn off the voice controller|turn off|stop assistant)\b/.test(command)) {
      wantsListening = false;
      safeStore.setItem('voiceControllerEnabled', 'false');
      orb.classList.remove('listening');
      orb.setAttribute('aria-pressed', 'false');
      setStatus('Voice Controller', 'Stopped. Tap the orb to listen again.', '');
      try { recognition?.stop(); } catch (_) {}
      return;
    }

    // Commands for every main section of the website.
    if (/\b(open|go to|show|take me to)\s+(the\s+)?welcome\b/.test(command)) return goToSection('welcome', 'welcome');
    if (/\b(open|go to|show|take me to)\s+(the\s+)?moments?\b/.test(command)) return goToSection('moments', 'favourite moments');
    if (/\b(open|go to|show|take me to)\s+(the\s+)?story\b/.test(command)) {
      if (currentPageName() !== 'about.html') return navigate('about.html#story');
      return goToSection('story', 'my story');
    }
    if (/\b(open|go to|show|take me to)\s+(the\s+)?experience\b/.test(command)) {
      if (currentPageName() !== 'about.html') return navigate('about.html#experience');
      return goToSection('experience', 'professional experience');
    }
    if (/\b(open|go to|show|take me to)\s+(the\s+)?profile\b/.test(command)) {
      if (currentPageName() !== 'about.html') return navigate('about.html#profile');
      return goToSection('profile', 'profile');
    }
    if (/\b(open|go to|show|take me to)\s+(the\s+)?gallery memories\b/.test(command)) {
      if (currentPageName() !== 'gallery.html') return navigate('gallery.html#gallery-story');
      return goToSection('gallery-story', 'gallery memories');
    }

    // Natural page navigation.
    if (/\b(open|go|go to|show|take me to)\s+(the\s+)?gallery\b/.test(command) || command === 'gallery') return navigate('gallery.html');
    if (/\b(open|go|go to|show|take me to)\s+(the\s+)?home( page)?\b/.test(command) || command === 'home') return navigate('index.html');
    if (/\b(open|go|go to|show|take me to)\s+(the\s+)?about( page)?\b/.test(command) || /\babout me\b/.test(command)) return navigate('about.html');
    if (/\b(contact|email section|get in touch|open email|open contact|go to contact|go to email|show contact|show email)\b/.test(command)) return goToSection('contact', 'contact');
    if (/\b(interests|open interests|go to interests|show interests)\b/.test(command)) return goToSection('interests', 'interests');

    // Social/email actions.
    if (/\b(open|go to|show)\s+(my\s+)?instagram\b/.test(command)) { window.open('https://www.instagram.com/rasin_ur', '_blank'); return; }
    if (/\b(open|go to|show)\s+(my\s+)?facebook\b/.test(command)) { window.open('https://www.facebook.com/rasin.arafat.2025/', '_blank'); return; }
    if (/\b(open|send|compose)\s+(an\s+)?email\b/.test(command)) { location.href = 'mailto:rasinarafat526@gmail.com'; return; }

    // Gallery controls.
    if (/\b(next|next photo|next image|go next|move next|go right)\b/.test(command)) {
      const lb = document.getElementById('lightbox');
      const button = lb?.classList.contains('open') ? document.getElementById('lbNext') : document.querySelector('.carousel-btn.next');
      if (button) { button.click(); setStatus('Voice Controller', 'Next', `“${raw}”`); return; }
      window.scrollBy({ left: window.innerWidth * .7, behavior: 'smooth' }); return;
    }
    if (/\b(previous|previous photo|previous image|back photo|go back|move previous|go left)\b/.test(command)) {
      const lb = document.getElementById('lightbox');
      const button = lb?.classList.contains('open') ? document.getElementById('lbPrev') : document.querySelector('.carousel-btn.prev');
      if (button) { button.click(); setStatus('Voice Controller', 'Previous', `“${raw}”`); return; }
      window.scrollBy({ left: -window.innerWidth * .7, behavior: 'smooth' }); return;
    }
    if (/\b(close|close photo|close image|close gallery)\b/.test(command)) {
      const close = document.getElementById('lightboxClose');
      if (document.getElementById('lightbox')?.classList.contains('open') && close) close.click();
      return;
    }

    // Scrolling. Accept common natural variations and speech-recognition spellings.
    if (/\b(scroll|move|go)\s+(down|lower)\b/.test(command) || command === 'down') {
      window.scrollBy({ top: window.innerHeight * .78, behavior: 'smooth' });
      setStatus('Voice Controller', 'Scrolling down', `“${raw}”`); return;
    }
    if (/\b(scroll|move|go)\s+(up|upper)\b/.test(command) || command === 'up') {
      window.scrollBy({ top: -window.innerHeight * .78, behavior: 'smooth' });
      setStatus('Voice Controller', 'Scrolling up', `“${raw}”`); return;
    }
    if (/\b(scroll|move)\s+right\b/.test(command)) { window.scrollBy({ left: window.innerWidth * .7, behavior: 'smooth' }); return; }
    if (/\b(scroll|move)\s+left\b/.test(command)) { window.scrollBy({ left: -window.innerWidth * .7, behavior: 'smooth' }); return; }
    if (/\b(top|go to top|back to top|scroll to top)\b/.test(command)) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (/\b(bottom|go to bottom|scroll to bottom)\b/.test(command)) { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); return; }

    // Contact-form dictation. Examples: “write name Rasin”, “write message hello”.
    let m;
    if ((m = command.match(/^(?:write|type|enter|put)\s+(?:my\s+)?name\s+(.+)$/))) { fillField('contactName', m[1], 'Name'); return; }
    if ((m = command.match(/^(?:write|type|enter|put)\s+(?:my\s+)?email\s+(.+)$/))) {
      let value = m[1].replace(/\s+at\s+/g, '@').replace(/\s+dot\s+/g, '.').replace(/\s+/g, '');
      fillField('contactEmail', value, 'Email'); return;
    }
    if ((m = command.match(/^(?:write|type|enter|put)\s+(?:my\s+)?phone(?: number)?\s+(.+)$/))) { fillField('contactPhone', m[1], 'Phone'); return; }
    if ((m = command.match(/^(?:write|type|enter|put|say)\s+(?:the\s+)?message\s+(.+)$/))) { fillField('contactMessage', raw.replace(/^(?:write|type|enter|put|say)\s+(?:the\s+)?message\s+/i, ''), 'Message'); return; }
    if (/\b(clear|clear form|clear contact form|erase form)\b/.test(command)) {
      const form = document.getElementById('contactForm'); if (form) { form.reset(); setStatus('Voice Controller', 'Form cleared', ''); } return;
    }
    if (/\b(focus|select)\s+(name|email|phone|message)\b/.test(command)) {
      const key = command.match(/(name|email|phone|message)/)?.[1];
      const ids = {name:'contactName',email:'contactEmail',phone:'contactPhone',message:'contactMessage'};
      field(ids[key])?.focus(); return;
    }

    setStatus('Try another command', 'Try “scroll down”, “go home”, “open gallery”, “go to email”, or “write message hello”.', `“${raw}”`);
  }

  if (!SpeechRecognition) {
    orb.disabled = true;
    orb.style.opacity = '.55';
    setStatus('Voice unavailable', 'Use Chrome or another browser with speech recognition.', '');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'en-AU';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (!wantsListening) return;
    safeStore.setItem('voiceControllerEnabled', 'true');
    orb.classList.add('listening');
    orb.setAttribute('aria-pressed', 'true');
    setStatus('Listening…', 'Try “open gallery” or “next”.', '');
  };

  recognition.onresult = (event) => {
    let interim = '';
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += text;
      else interim += text;
    }
    if (interim) setStatus('Listening…', 'Keep speaking…', interim);
    if (finalText) handleCommand(finalText);
  };

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      wantsListening = false;
      orb.classList.remove('listening');
      orb.setAttribute('aria-pressed', 'false');
      setStatus('Microphone blocked', 'Allow microphone permission, then tap the orb again.', '');
      return;
    }
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      setStatus('Voice Controller', 'Could not hear clearly. Tap or speak again.', '');
    }
  };

  recognition.onend = () => {
    if (!wantsListening) {
      orb.classList.remove('listening');
      orb.setAttribute('aria-pressed', 'false');
      return;
    }

    // Browsers can end recognition after silence. Restart it automatically
    // so one tap keeps the controller alive until the user says to turn it off.
    orb.classList.add('listening');
    orb.setAttribute('aria-pressed', 'true');
    setStatus('Listening…', 'Voice control stays on until you say “turn off voice controller”.', '');
    if (!speaking) {
      clearTimeout(restartTimer);
      restartTimer = setTimeout(() => {
        if (!wantsListening) return;
        try { recognition.start(); } catch (_) {}
      }, 250);
    }
  };

  orb.addEventListener('click', () => {
    // First tap turns it on. Tapping again does NOT turn it off;
    // only the spoken command “turn off voice controller” stops it.
    if (wantsListening) {
      setStatus('Listening…', 'Already on. Say “turn off voice controller” to stop.', '');
      return;
    }

    wantsListening = true;
    safeStore.setItem('voiceControllerEnabled', 'true');
    orb.setAttribute('aria-pressed', 'true');
    setStatus('Starting…', 'Voice control will stay on until you tell it to turn off.', '');
    try { recognition.start(); } catch (_) {}
  });

  // Best-effort continuation after moving between this site’s pages.
  // If the browser permits it and microphone permission was already granted,
  // the controller starts again automatically.
  if (wantsListening) {
    setTimeout(() => {
      orb.setAttribute('aria-pressed', 'true');
      setStatus('Starting…', 'Keeping voice control active…', '');
      try { recognition.start(); } catch (_) {}
    }, 500);
  }


  // Keep the corner clean after the user starts interacting.
  setTimeout(() => assistant.classList.add('compact'), 6500);
  assistant.addEventListener('mouseenter', () => assistant.classList.remove('compact'));
  assistant.addEventListener('mouseleave', () => {
    if (!wantsListening) assistant.classList.add('compact');
  });
})();

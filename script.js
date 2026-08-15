(() => {
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const trackedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
          if (isCurrent) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    trackedSections.forEach((section) => sectionObserver.observe(section));

    const movements = [...document.querySelectorAll('[data-movement]')];
    const movementObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      movements.forEach((movement) => {
        movement.classList.toggle('is-current', movement === visible.target);
      });
    }, { rootMargin: '-26% 0px -42% 0px', threshold: [0.2, 0.45, 0.7] });

    movements.forEach((movement) => movementObserver.observe(movement));
  }

  const circleButtons = [...document.querySelectorAll('[data-circle-button]')];
  const circlePanels = [...document.querySelectorAll('[data-circle-panel]')];
  const circleVisuals = [...document.querySelectorAll('[data-circle-visual]')];

  const selectCircle = (level, moveFocus = false) => {
    circleButtons.forEach((button) => {
      const isActive = button.dataset.circleButton === level;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
      if (isActive && moveFocus) button.focus();
    });

    circlePanels.forEach((panel) => {
      const isActive = panel.dataset.circlePanel === level;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });

    circleVisuals.forEach((visual) => {
      visual.classList.toggle('is-active', visual.dataset.circleVisual === level);
    });
  };

  circleButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectCircle(button.dataset.circleButton));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % circleButtons.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + circleButtons.length) % circleButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = circleButtons.length - 1;

      selectCircle(circleButtons[nextIndex].dataset.circleButton, true);
    });
  });

  selectCircle('4');

  const guardrailInputs = [...document.querySelectorAll('#guardrail-plan input[type="checkbox"]')];
  const guardrailCount = document.querySelector('#guardrail-count');
  const clearGuardrails = document.querySelector('#clear-guardrails');
  const storageKey = 'wrapped-up-guardrail-plan';

  const saveGuardrails = () => {
    const selected = guardrailInputs.filter((input) => input.checked).map((input) => input.value);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(selected));
    } catch (_) {
      return selected;
    }
    return selected;
  };

  const updateGuardrailCount = (save = true) => {
    const selected = save
      ? saveGuardrails()
      : guardrailInputs.filter((input) => input.checked).map((input) => input.value);
    const noun = selected.length === 1 ? 'commitment' : 'commitments';
    guardrailCount.textContent = `${selected.length} ${noun} selected`;
  };

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    guardrailInputs.forEach((input) => {
      input.checked = Array.isArray(saved) && saved.includes(input.value);
    });
  } catch (_) {
    guardrailInputs.forEach((input) => { input.checked = false; });
  }

  guardrailInputs.forEach((input) => input.addEventListener('change', () => updateGuardrailCount()));
  updateGuardrailCount(false);

  clearGuardrails?.addEventListener('click', () => {
    guardrailInputs.forEach((input) => { input.checked = false; });
    updateGuardrailCount();
    guardrailInputs[0]?.focus();
  });

  const shareButton = document.querySelector('#share-page');
  const shareStatus = document.querySelector('#share-status');

  shareButton?.addEventListener('click', async () => {
    const shareData = {
      title: 'Wrapped Up',
      text: 'No condemnation. No hiding. No fighting alone.',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        shareStatus.textContent = 'Shared. One honest conversation can change the direction of a week.';
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      shareStatus.textContent = 'Link copied. Send it to a brother you trust.';
    } catch (error) {
      if (error?.name === 'AbortError') return;
      shareStatus.textContent = 'Copy the address from your browser and send it to a brother you trust.';
    }
  });
})();

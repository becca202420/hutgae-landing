(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- 맛 그래프 칸 생성 ---------- */
  $$('.meter__bar').forEach((bar) => {
    const level = Number(bar.dataset.level) || 0;
    for (let i = 0; i < 5; i++) {
      const cell = document.createElement('span');
      cell.className = 'meter__cell' + (i < level ? ' is-on' : '');
      bar.appendChild(cell);
    }
  });

  /* ---------- 스크롤 등장 (페이드 + 위로 12px, 1회) ---------- */
  const reveals = $$('.rv');
  // 같은 그룹 안 카드 순차 지연 0.08s, 최대 3개
  reveals.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('rv'));
    const idx = Math.min(siblings.indexOf(el), 2);
    if (idx > 0) el.style.setProperty('--delay', `${idx * 0.08}s`);
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- 후기 캐러셀 ---------- */
  const track = $('[data-track]');
  if (track) {
    const step = () => {
      const card = track.firstElementChild;
      return card ? card.getBoundingClientRect().width + 20 : 380;
    };
    $('[data-track-prev]')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('[data-track-next]')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  /* ---------- FAQ 아코디언 (한 번에 하나, 첫 항목 열림) ---------- */
  const faqItems = $$('[data-faq] .faq__item');
  const setOpen = (target) => {
    faqItems.forEach((item) => {
      const on = item === target;
      item.classList.toggle('is-open', on);
      $('.faq__q', item).setAttribute('aria-expanded', String(on));
    });
  };
  faqItems.forEach((item) => {
    $('.faq__q', item).addEventListener('click', () => {
      setOpen(item.classList.contains('is-open') ? null : item);
    });
  });
  if (faqItems[0]) setOpen(faqItems[0]);

  /* ---------- 이벤트 모듈 교체: sample ↔ benefit ---------- */
  const eventSection = $('#event');
  const applyEventMode = () => {
    const mode = eventSection.dataset.eventMode === 'benefit' ? 'benefit' : 'sample';
    $$('[data-event-module]', eventSection).forEach((m) => {
      m.hidden = m.dataset.eventModule !== mode;
    });
  };
  if (eventSection) applyEventMode();

  /* ---------- 샘플 신청 폼 ---------- */
  const form = $('[data-sample-form]');
  if (form) {
    const status = $('[data-form-status]', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = $$('input[required]', form).find((input) => !input.checkValidity());
      if (invalid) {
        status.style.color = 'var(--required)';
        status.textContent = invalid.type === 'checkbox'
          ? '개인정보 수집·이용에 동의해 주세요.'
          : '필수 항목을 모두 입력해 주세요.';
        invalid.focus();
        return;
      }
      // TODO: 실제 신청 API 연동
      status.style.color = '';
      status.textContent = '신청이 접수됐어요. 발송 안내는 문자로 드릴게요.';
      form.reset();
    });
  }

  /* ---------- 모바일 하단 구매 바: 히어로를 지나면 노출 ---------- */
  const mbar = $('[data-mbar]');
  const hero = $('#top');
  if (mbar && hero) {
    const update = () => {
      mbar.classList.toggle('is-visible', hero.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
})();

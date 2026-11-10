/**
 * Seven Barbershop — espace gérant. JavaScript sans framework (aucun script dans les pages : CSP).
 */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Menu latéral (hamburger sur mobile) ---------- */
  const toggle = $('[data-sidebar-toggle]');
  const sidebar = $('#sidebar');
  const scrim = $('[data-sidebar-scrim]');
  const setSidebar = open => {
    sidebar?.classList.toggle('is-open', open);
    scrim?.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  toggle?.addEventListener('click', () => setSidebar(!sidebar.classList.contains('is-open')));
  scrim?.addEventListener('click', () => setSidebar(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setSidebar(false); });

  /* ---------- Formulaires envoyés dès qu'un choix change (salon, date, statut) ---------- */
  $$('form[data-autosubmit]').forEach(f => f.addEventListener('change', () => f.submit()));
  $$('form[data-autosubmit-select] select').forEach(sel => sel.addEventListener('change', () => sel.form.submit()));

  /* ---------- Confirmations avant actions destructives ---------- */
  document.addEventListener('submit', e => {
    const msg = e.target.dataset.confirm;
    if (msg && !confirm(msg)) e.preventDefault();
    // Évite le double envoi
    if (!e.defaultPrevented) $$('button[type="submit"]', e.target).forEach(b => setTimeout(() => (b.disabled = true), 0));
  });

  /* ---------- Lignes d'horaires : griser les jours fermés ---------- */
  $$('[data-hours-row]').forEach(row => {
    const cb = $('input[type="checkbox"]', row);
    cb?.addEventListener('change', () => row.classList.toggle('is-off', !cb.checked));
  });

  /* ---------- Fermetures : afficher les horaires si « horaires spéciaux » ---------- */
  const kind = $('[data-kind]');
  kind?.addEventListener('change', () => { $('[data-special]').hidden = kind.value !== 'special'; });

  /* ---------- Fenêtres modales ---------- */
  $$('dialog.modal').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });
  const openDialog = d => (typeof d.showModal === 'function' ? d.showModal() : d.setAttribute('open', ''));
  const addMinutes = (t, m) => {
    const [h, mm] = t.split(':').map(Number);
    const tot = Math.min(h * 60 + mm + m, 23 * 60 + 59);
    return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
  };

  // Nouveau rendez-vous / blocage depuis une case de l'agenda
  const dlgNew = $('[data-dlg-new]');
  if (dlgNew) {
    const segs = $$('[data-seg]', dlgNew);
    const showSeg = name => {
      segs.forEach(s => s.setAttribute('aria-selected', String(s.dataset.seg === name)));
      $$('[data-seg-panel]', dlgNew).forEach(p => { p.hidden = p.dataset.segPanel !== name; });
    };
    segs.forEach(s => s.addEventListener('click', () => showSeg(s.dataset.seg)));

    const serviceSel = $('[data-service-select]', dlgNew);
    serviceSel.addEventListener('change', () => {
      const opt = serviceSel.selectedOptions[0];
      $('[data-field="duration"]', dlgNew).value = opt?.dataset.duration || '';
    });

    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-open-new]');
      if (!trigger) return;
      const time = trigger.dataset.time || '10:00';
      $$('[data-field="time"]', dlgNew).forEach(i => (i.value = time));
      $$('[data-field="time-end"]', dlgNew).forEach(i => (i.value = addMinutes(time, 60)));
      $$('[data-field="staff"]', dlgNew).forEach(s => (s.value = trigger.dataset.staff || s.options[0].value));
      showSeg('appt');
      openDialog(dlgNew);
      setTimeout(() => serviceSel.focus(), 50);
    });
  }

  // Détail d'un rendez-vous
  const dlgAppt = $('[data-dlg-appt]');
  if (dlgAppt) {
    const statusLabels = { confirmed: 'Confirmé', done: 'Venu', noshow: 'Absent', cancelled: 'Annulé' };
    const sourceLabels = { web: 'réservé en ligne', admin: 'ajouté au salon', ai: "réservé par l'assistant IA" };
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-appt]');
      if (!b) return;
      const a = JSON.parse(b.dataset.appt);
      $$('[data-a]', dlgAppt).forEach(el => {
        const k = el.dataset.a;
        if (k === 'meta') {
          el.textContent = `${a.service_name} · réf. ${a.ref} · ${sourceLabels[a.source] || a.source} · ${statusLabels[a.status] || a.status}`;
        } else if (k === 'tel') {
          el.href = 'tel:' + (a.client_phone || '').replace(/\s+/g, '');
          el.hidden = !a.client_phone;
          el.textContent = a.client_phone ? `Appeler ${a.client_phone}` : '';
        } else if (el.matches('input, select, textarea')) {
          el.value = a[k] ?? '';
        } else {
          el.textContent = k === 'note' && a.note ? `« ${a.note} »` : (a[k] ?? '');
        }
      });
      openDialog(dlgAppt);
    });
  }

  // Blocage
  const dlgBlock = $('[data-dlg-block]');
  if (dlgBlock) {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-block]');
      if (!b) return;
      const data = JSON.parse(b.dataset.block);
      $('[data-b="label"]', dlgBlock).textContent = data.label;
      $('[data-b="when"]', dlgBlock).textContent = data.when;
      $('[data-b="id"]', dlgBlock).value = data.id;
      openDialog(dlgBlock);
    });
  }

  /* ---------- Agenda : se placer sur l'heure actuelle ---------- */
  const agenda = $('.agenda');
  const now = $('.now', agenda || document);
  if (agenda && now) agenda.scrollTop = Math.max(0, now.offsetTop - 120);
  else if (agenda) { const first = $('.appt', agenda); if (first) agenda.scrollTop = Math.max(0, first.offsetTop - 60); }

})();

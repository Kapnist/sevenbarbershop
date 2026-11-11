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

  /* ---------- Envoi de photos : glisser-déposer, aperçus, réduction avant envoi ---------- */
  const MAX_SIDE = 2400; // assez pour le site (1600 px) avec de la marge, et bien plus léger à envoyer
  const shrink = file => new Promise(resolve => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.5 * 1024 * 1024) return resolve(file);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob || blob.size >= file.size) return resolve(file);
        resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

  $$('form[data-upload]').forEach(form => {
    const input = $('input[type="file"]', form);
    const drop = $('[data-drop]', form);
    const previews = $('[data-previews]', form);
    const showPreviews = () => {
      if (!previews) return;
      previews.innerHTML = '';
      [...input.files].slice(0, 30).forEach(f => {
        const img = document.createElement('img');
        img.alt = f.name;
        img.src = URL.createObjectURL(f);
        img.onload = () => URL.revokeObjectURL(img.src);
        previews.appendChild(img);
      });
      const label = $('b', drop);
      if (label) label.textContent = input.files.length ? `${input.files.length} photo${input.files.length > 1 ? 's' : ''} choisie${input.files.length > 1 ? 's' : ''}` : 'Glissez vos photos ici ou cliquez pour les choisir';
    };
    input.addEventListener('change', showPreviews);
    ['dragenter', 'dragover'].forEach(t => drop?.addEventListener(t, () => drop.classList.add('is-over')));
    ['dragleave', 'drop'].forEach(t => drop?.addEventListener(t, () => drop.classList.remove('is-over')));

    form.addEventListener('submit', async e => {
      if (form.dataset.ready === '1' || !input.files.length || typeof DataTransfer === 'undefined') return;
      e.preventDefault();
      const buttons = $$('button[type="submit"]', form);
      buttons.forEach(b => { b.disabled = true; b.dataset.label = b.textContent; b.textContent = 'Préparation des photos…'; });
      try {
        const dt = new DataTransfer();
        for (const f of input.files) dt.items.add(await shrink(f));
        input.files = dt.files;
      } catch { /* en cas d'échec, on envoie les fichiers d'origine */ }
      buttons.forEach(b => (b.textContent = 'Envoi en cours…'));
      form.dataset.ready = '1';
      form.submit();
    });
  });

  /* ---------- Photos du site : fenêtre de choix ---------- */
  const dlgPick = $('[data-dlg-pick]');
  if (dlgPick) {
    const segs = $$('[data-seg]', dlgPick);
    const showSeg = name => {
      segs.forEach(s => s.setAttribute('aria-selected', String(s.dataset.seg === name)));
      $$('[data-seg-panel]', dlgPick).forEach(p => { p.hidden = p.dataset.segPanel !== name; });
    };
    segs.forEach(s => s.addEventListener('click', () => showSeg(s.dataset.seg)));
    const submit = $('[data-pick-submit]', dlgPick);

    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-pick]');
      if (!trigger) return;
      // gallery : ajouter des photos ; replace : changer une seule photo d'une galerie ; single : photo unique
      const mode = trigger.dataset.mode;
      const gallery = mode === 'gallery';
      const slot = trigger.dataset.pick;
      $$('[data-pick-slot]', dlgPick).forEach(i => (i.value = slot));
      $$('[data-pick-link]', dlgPick).forEach(i => (i.value = mode === 'replace' ? trigger.dataset.link || '' : ''));
      $$('[data-pick-origin]', dlgPick).forEach(i => (i.value = mode === 'replace' ? trigger.dataset.origin || '' : ''));
      $$('[data-pick-back]', dlgPick).forEach(i => (i.value = `index.php?p=photos#slot-${slot}`));
      $('[data-pick-action]', dlgPick).value = gallery ? 'slot_add' : 'slot_set';
      $('[data-pick-label]', dlgPick).textContent = trigger.dataset.label;
      $('#dlg-pick-title').textContent = gallery ? 'Ajouter des photos à la galerie' : mode === 'replace' ? 'Remplacer cette photo' : 'Choisir une photo';
      $$('[data-pick-input]', dlgPick).forEach(i => { i.type = gallery ? 'checkbox' : 'radio'; i.checked = false; });
      const files = $('[data-pick-files]', dlgPick);
      if (files) { files.multiple = gallery; files.value = ''; files.dispatchEvent(new Event('change')); }
      if (submit) submit.textContent = gallery ? 'Ajouter les photos choisies' : 'Utiliser cette photo';
      // « Au début / à la fin » : seulement pour un ajout à une galerie
      $$('[data-pick-position]', dlgPick).forEach(l => { l.hidden = !gallery; $('select', l).value = 'start'; });
      showSeg($$('[data-pick-input]', dlgPick).length ? 'library' : 'upload');
      openDialog(dlgPick);
    });
  }

  /* ---------- Agenda : se placer sur l'heure actuelle ---------- */
  const agenda = $('.agenda');
  const now = $('.now', agenda || document);
  if (agenda && now) agenda.scrollTop = Math.max(0, now.offsetTop - 120);
  else if (agenda) { const first = $('.appt', agenda); if (first) agenda.scrollTop = Math.max(0, first.offsetTop - 60); }

})();

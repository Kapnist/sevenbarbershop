// Installation : affiche les champs MySQL seulement si ce type de base est choisi.
document.querySelector('[data-driver]')?.addEventListener('change', (e) => {
  document.querySelector('[data-mysql]').hidden = e.target.value !== 'mysql';
});

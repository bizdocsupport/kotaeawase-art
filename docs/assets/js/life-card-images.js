(() => {
  const root = document.querySelector('[data-gallery="lives"]');
  if (!root) return;

  const lifeData = Object.values(window.ARTIST_LIFE_DATA || {});
  if (!lifeData.length) return;

  const normalize = value => String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s　・･.，。、:：;；!！?？'"“”‘’\-–—―]/g, '');

  const findLife = title => {
    const key = normalize(title);
    return lifeData.find(entry => {
      const candidates = [entry.shortName, entry.name, entry.title];
      return candidates.some(value => {
        const candidate = normalize(value);
        return candidate && (candidate === key || candidate.includes(key) || key.includes(candidate));
      });
    });
  };

  root.querySelectorAll('.art-card').forEach(card => {
    const title = card.querySelector('.art-title')?.textContent?.trim();
    const entry = findLife(title);
    if (!entry?.originalSummary) return;

    const wrap = card.querySelector('.thumb-wrap');
    const img = card.querySelector('img.art-thumb');
    if (!wrap || !img) return;

    img.src = entry.originalSummary;
    img.alt = `${entry.shortName || title}の人生 1枚まとめ`;
    wrap.classList.remove('is-missing');
    img.classList.remove('is-missing');

    img.addEventListener('load', () => {
      wrap.classList.remove('is-missing');
      img.classList.remove('is-missing');
    }, { once: true });
  });
})();

/* A single static JSON file powers both the home and /column/ note sections. */
(() => {
  'use strict';
  const targets = Array.from(document.querySelectorAll('[data-note-feed]'));
  if (!targets.length) return;
  const noteProfile = 'https://note.com/kotaeawase_art';
  // Each page supplies its own path relative to the site root.
  const feedURL = targets[0].getAttribute('data-note-source') || 'assets/data/note-latest.json';
  const fmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric' });
  const validURL = (url, article = true) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname === 'note.com' &&
        (!article || /^\/kotaeawase_art\/n\/n[a-z0-9]+\/?$/i.test(parsed.pathname));
    } catch (_) { return false; }
  };
  const validImage = url => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && (parsed.hostname === 'note.com' || parsed.hostname === 'assets.st-note.com' || parsed.hostname.endsWith('.st-note.com'));
    } catch (_) { return false; }
  };
  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function card(item) {
    const link = make('a', 'note-feed-card');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const media = make('div', 'note-feed-card__media');
    const fallback = make('span', 'note-feed-card__fallback', 'note  ／  答え合わせ美術部');
    media.appendChild(fallback);
    if (validImage(item.image)) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => { fallback.hidden = true; });
      img.addEventListener('error', () => { img.remove(); });
      media.appendChild(img);
    }
    const body = make('div', 'note-feed-card__body');
    const date = make('span', 'note-feed-card__date');
    const timestamp = Date.parse(item.publishedAt || '');
    date.textContent = Number.isFinite(timestamp) ? fmt.format(new Date(timestamp)) : 'note';
    const title = make('h3', '', item.title);
    body.append(date, title);
    if (item.excerpt) body.appendChild(make('p', '', item.excerpt));
    body.appendChild(make('b', '', 'noteで続きを読む ↗'));
    link.append(media, body);
    return link;
  }
  function error(target) {
    target.replaceChildren();
    const fallback = make('p', 'note-feed-status', 'noteの新着情報を読み込めませんでした。');
    const link = make('a', 'note-feed-direct', 'noteの鑑賞日記を見る ↗');
    link.href = noteProfile;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    target.append(fallback, link);
  }
  fetch(feedURL, { cache: 'no-cache', credentials: 'same-origin' })
    .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
    .then(data => {
      if (!Array.isArray(data.articles)) throw new Error('Invalid JSON');
      const items = data.articles.filter(item => item && validURL(item.url) && typeof item.title === 'string' && item.title.trim());
      if (!items.length) throw new Error('Empty feed');
      targets.forEach(target => {
        const limit = Math.min(12, Math.max(1, Number(target.dataset.noteLimit) || 3));
        // Source JSON on each page determines the feed; no title-based exclusions.
        target.replaceChildren(...items.slice(0, limit).map(card));
        target.setAttribute('aria-busy', 'false');
      });
    })
    .catch(() => targets.forEach(target => { error(target); target.setAttribute('aria-busy', 'false'); }));
})();

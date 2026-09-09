/*
 * 答え合わせ美術部｜チケット日程 Googleカレンダー連携
 * v2.7.0 / 2026-08-21
 *
 * 仕様
 * 1) 前売・抽選など確定したチケット日程だけを1件ずつ追加
 * 2) 展覧会会期の一括購読は主導線から廃止
 * 3) 見たい展覧会の最終日は site-v4.js から個別追加
 */
(function () {
  'use strict';

  const VERSION = '2.7.0';
  const TZ = 'Asia/Tokyo';
  const CALENDAR_BASE = 'https://calendar.google.com/calendar/render';
  const RECENT_EVENT_GRACE_MS = 6 * 60 * 60 * 1000;

  // チケット日程も展覧会マスタを正本とする。空配列の展覧会にはボタンを出さない。
  const EXHIBITIONS = Array.isArray(window.KA_EXHIBITIONS)
    ? window.KA_EXHIBITIONS.filter(function (x) {
        return x.kind === 'exhibition' && Array.isArray(x.ticketEvents) && x.ticketEvents.length;
      })
    : [];

  function normalizeText(value) {
    return String(value || '')
      .replace(/[\s\u3000]+/g, ' ')
      .replace(/[「」『』]/g, '')
      .trim();
  }

  function compactDate(dateString) {
    return dateString.replace(/-/g, '');
  }

  function addDays(dateString, days) {
    const parts = dateString.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
    return [d.getUTCFullYear(), String(d.getUTCMonth() + 1).padStart(2, '0'), String(d.getUTCDate()).padStart(2, '0')].join('-');
  }

  function compactLocalDateTime(value) {
    return value.replace(/[-:]/g, '');
  }

  function addMinutesLocal(value, minutes) {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (!m) return value;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
    d.setUTCMinutes(d.getUTCMinutes() + (minutes || 30));
    return d.toISOString().slice(0, 16);
  }

  function calendarUrl(params) {
    const q = new URLSearchParams();
    q.set('action', 'TEMPLATE');
    q.set('text', params.text);
    q.set('dates', params.dates);
    if (params.details) q.set('details', params.details);
    if (params.location) q.set('location', params.location);
    q.set('ctz', TZ);
    return CALENDAR_BASE + '?' + q.toString();
  }

  function ticketCalendarUrl(ex, ev) {
    let dates;
    if (ev.at) {
      const end = addMinutesLocal(ev.at, ev.minutes || 30);
      dates = compactLocalDateTime(ev.at) + '/' + compactLocalDateTime(end);
    } else {
      dates = compactDate(ev.date) + '/' + compactDate(addDays(ev.date, 1));
    }
    return calendarUrl({
      text: ex.title + '｜' + ev.label,
      dates: dates,
      location: ex.venue,
      details: [
        '答え合わせ美術部｜チケット日程',
        ev.label,
        '',
        '公式：' + (ex.ticketUrl || ex.official),
        '※販売・抽選条件は変更される場合があります。申込前に公式情報をご確認ください。'
      ].join('\n')
    });
  }

  function eventTimestamp(ev) {
    if (ev.at) return new Date(ev.at + ':00+09:00').getTime();
    if (ev.date) return new Date(ev.date + 'T00:00:00+09:00').getTime();
    return Infinity;
  }

  function upcomingTicketEvents(ex) {
    const now = Date.now();
    return (ex.ticketEvents || []).filter(function (ev) {
      return eventTimestamp(ev) >= now - RECENT_EVENT_GRACE_MS;
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[ch];
    });
  }

  function calendarIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2v3M17 2v3M3.5 9h17M5 4h14a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 19 21H5a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 5 4Z"/><path d="M8 13h3v3H8z"/></svg>';
  }

  function ticketIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4Z"/><path d="M12 8.5v7"/></svg>';
  }

  let activeTicketButton = null;
  let activeTicketMenu = null;

  function closeTicketMenu() {
    if (activeTicketButton) {
      activeTicketButton.setAttribute('aria-expanded', 'false');
      const wrapper = activeTicketButton.closest('.ka-excal');
      if (wrapper) wrapper.classList.remove('is-open');
    }
    if (activeTicketMenu && activeTicketMenu.parentNode) {
      activeTicketMenu.parentNode.removeChild(activeTicketMenu);
    }
    activeTicketButton = null;
    activeTicketMenu = null;
  }

  function buildTicketMenu(ex) {
    const futureTickets = upcomingTicketEvents(ex);
    if (!futureTickets.length) return null;

    const menu = document.createElement('div');
    menu.className = 'ka-excal__menu ka-excal__menu--portal';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', ex.title + 'のチケット日程');

    futureTickets.forEach(function (ev) {
      const a = document.createElement('a');
      a.href = ticketCalendarUrl(ex, ev);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'ka-excal__menu-link';
      a.setAttribute('role', 'menuitem');
      const dateLabel = ev.at ? ev.at.replace('T', ' ') : ev.date;
      a.innerHTML = '<span><strong>' + escapeHtml(ev.label) + '</strong><small>' + escapeHtml(dateLabel) + '</small></span><em>追加 ↗</em>';
      a.addEventListener('click', function () {
        window.setTimeout(closeTicketMenu, 0);
      });
      menu.appendChild(a);
    });

    const note = document.createElement('p');
    note.className = 'ka-excal__menu-note';
    note.textContent = '必要な日程だけ1件ずつ追加できます';
    menu.appendChild(note);
    return menu;
  }

  function positionTicketMenu(button, menu) {
    if (!button || !menu) return;
    if (window.matchMedia('(max-width: 760px)').matches) {
      menu.style.left = '';
      menu.style.top = '';
      menu.style.right = '';
      menu.style.bottom = '';
      return;
    }

    const gap = 8;
    const margin = 12;
    const rect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + gap;

    if (left + menuRect.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - menuRect.width - margin);
    }
    if (left < margin) left = margin;

    if (top + menuRect.height > window.innerHeight - margin) {
      const above = rect.top - menuRect.height - gap;
      if (above >= margin) {
        top = above;
      } else {
        top = Math.max(margin, window.innerHeight - menuRect.height - margin);
      }
    }

    menu.style.left = Math.round(left) + 'px';
    menu.style.top = Math.round(top) + 'px';
  }

  function openTicketMenu(button, ex) {
    if (activeTicketButton === button) {
      closeTicketMenu();
      return;
    }

    // 常に1つだけ開く。別カードを開いたら先のメニューは閉じる。
    closeTicketMenu();

    const menu = buildTicketMenu(ex);
    if (!menu) return;

    activeTicketButton = button;
    activeTicketMenu = menu;
    button.setAttribute('aria-expanded', 'true');
    const wrapper = button.closest('.ka-excal');
    if (wrapper) wrapper.classList.add('is-open');

    // カードや横スクロールのoverflowに切られないようbody直下へ出す。
    document.body.appendChild(menu);
    positionTicketMenu(button, menu);
  }

  function makeTicketActions(ex) {
    const futureTickets = upcomingTicketEvents(ex);
    if (!futureTickets.length) return null;

    const wrap = document.createElement('div');
    wrap.className = 'ka-excal ka-excal--tickets';
    wrap.dataset.kaCalendarFor = ex.id;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ka-excal__ticket-summary';
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = ticketIcon() + '<span>チケット日程をカレンダーに追加</span><span class="ka-excal__chev">⌄</span>';
    button.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      openTicketMenu(button, ex);
    });
    wrap.appendChild(button);
    return wrap;
  }

  function officialHost(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return ''; }
  }

  function matchesExhibitionText(text, ex) {
    const t = normalizeText(text);
    return ex.aliases.some(function (alias) {
      return t.indexOf(normalizeText(alias)) !== -1;
    });
  }

  function countKnownExhibitions(text) {
    return EXHIBITIONS.filter(function (ex) { return matchesExhibitionText(text, ex); }).length;
  }

  function safeContainerFrom(node, ex) {
    if (!node) return null;
    let el = node.nodeType === 1 ? node : node.parentElement;
    if (el && el.tagName === 'A') el = el.parentElement;

    const candidates = [];
    let cur = el;
    let depth = 0;
    while (cur && cur !== document.body && cur !== document.documentElement && depth < 8) {
      if (cur.tagName !== 'A') {
        const text = normalizeText(cur.textContent);
        const links = cur.querySelectorAll ? cur.querySelectorAll('a').length : 0;
        const known = countKnownExhibitions(text);
        const classText = String(cur.className || '');
        const semantic = /^(ARTICLE|LI)$/i.test(cur.tagName) || /exhibition|event|card|item|guide|detail|hero|visit/i.test(classText);
        if (matchesExhibitionText(text, ex) && text.length < 2800 && links <= 16 && known <= 1) {
          candidates.push({ el: cur, score: (semantic ? 1000 : 0) - text.length - depth * 5 });
        }
      }
      cur = cur.parentElement;
      depth += 1;
    }
    candidates.sort(function (a, b) { return b.score - a.score; });
    return candidates.length ? candidates[0].el : (el && el.parentElement ? el.parentElement : el);
  }

  function findTargets(ex) {
    // v4カード／一覧行には明示的な data-exhibition-calendar がある。
    // これがある場合は、見出しや公式リンクを再走査しない。
    // 同一カードを複数ターゲットとして拾ってボタンが重複するのを防ぐ。
    const explicit = Array.from(document.querySelectorAll('[data-exhibition-calendar="' + ex.id + '"]'));
    if (explicit.length) return explicit;

    const found = new Set();
    const host = officialHost(ex.official);

    document.querySelectorAll('a[href]').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      const text = normalizeText(a.textContent);
      const isOfficialLink = /展覧会公式|公式サイト|公式/.test(text) || (host && href.indexOf(host) !== -1);
      if (!isOfficialLink) return;
      const context = safeContainerFrom(a, ex);
      if (context && matchesExhibitionText(context.textContent, ex)) found.add(context);
    });

    document.querySelectorAll('h1,h2,h3,h4,h5,strong,b').forEach(function (heading) {
      if (!matchesExhibitionText(heading.textContent, ex)) return;
      const context = safeContainerFrom(heading, ex);
      if (context) found.add(context);
    });

    return Array.from(found);
  }

  function placeTicketActions(target, ex) {
    if (!target) return false;

    // 明示カードがあれば必ずカード単位で重複判定する。
    const root = target.matches && target.matches('[data-exhibition-calendar="' + ex.id + '"]')
      ? target
      : (target.closest ? target.closest('[data-exhibition-calendar="' + ex.id + '"]') : null) || target;
    if (root && root.hasAttribute && root.hasAttribute('data-ka-ticket-disabled')) return false;

    const existing = root.querySelectorAll ? root.querySelectorAll('[data-ka-calendar-for="' + ex.id + '"]') : [];
    if (existing.length) {
      // 旧版などで重複DOMが残っていた場合も1個に正規化する。
      Array.from(existing).slice(1).forEach(function (node) { node.remove(); });
      return false;
    }

    const actions = makeTicketActions(ex);
    if (!actions) return false;

    // v4は専用スロットへ。詳細ページなど旧レイアウトでは本文内の適切な位置へ。
    const slot = root.querySelector
      ? root.querySelector('[data-ka-ticket-slot="' + ex.id + '"]') || root.querySelector('.v4-ex-card__body')
      : null;

    if (slot) {
      slot.appendChild(actions);
      return true;
    }

    const likelyLinkArea = root.querySelector ? Array.from(root.querySelectorAll('a')).find(function (a) {
      return /展覧会公式|公式サイト/.test(normalizeText(a.textContent));
    }) : null;

    if (likelyLinkArea) {
      const linkParent = likelyLinkArea.parentElement;
      if (linkParent && linkParent !== root && linkParent.tagName !== 'A') {
        linkParent.insertAdjacentElement('afterend', actions);
      } else {
        root.appendChild(actions);
      }
    } else {
      root.appendChild(actions);
    }
    return true;
  }

  let scanTimer = null;
  function scan() {
    let injected = 0;
    EXHIBITIONS.forEach(function (ex) {
      findTargets(ex).forEach(function (target) {
        if (placeTicketActions(target, ex)) injected += 1;
      });
    });
    return injected;
  }

  function scheduleScan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 80);
  }

  function init() {
    scan();

    document.addEventListener('click', function (ev) {
      if (!activeTicketMenu) return;
      if (activeTicketMenu.contains(ev.target)) return;
      if (activeTicketButton && activeTicketButton.contains(ev.target)) return;
      closeTicketMenu();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeTicketMenu();
    });
    window.addEventListener('resize', closeTicketMenu);
    window.addEventListener('scroll', function (ev) {
      if (!activeTicketMenu) return;
      if (activeTicketMenu.contains(ev.target)) return;
      closeTicketMenu();
    }, true);

    const observer = new MutationObserver(function (mutations) {
      const relevant = mutations.some(function (m) { return m.addedNodes && m.addedNodes.length; });
      if (relevant) scheduleScan();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.KotaeawaseExhibitionCalendar = {
    version: VERSION,
    exhibitions: EXHIBITIONS,
    scan: scan,
    ticketCalendarUrl: ticketCalendarUrl
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

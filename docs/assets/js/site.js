(() => {
  const gallery = window.ART_GALLERY || { content: [], visitAlbums: [] };
  const items = Array.isArray(gallery.content) ? gallery.content : [];
  const visitAlbums = Array.isArray(gallery.visitAlbums) ? gallery.visitAlbums : [];
  const imageBase = 'assets/images/';

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  const normalize = s => (s || '').toLowerCase().normalize('NFKC');
  const assetPath = rel => imageBase + String(rel || '').split('/').map(encodeURIComponent).join('/');
  // Shared HTML escape helper. Keep this before any renderer that may call it.
  const esc = (v='') => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  // Cross-link helpers: artwork ⇄ artist ⇄ exhibition.
  const compact = s => normalize(String(s || '')).replace(/[\s　「」『』《》〈〉()（）［］【】・･.,，。、:：;；!！?？'"“”‘’\-–—―]/g,'');
  const artistDetailFor = name => {
    const key=compact(name); if(!key) return null;
    return Object.values(window.ARTIST_DETAIL_DATA || {}).find(d => {
      const names=[d.name,d.shortName,...(d.aliases||[])].map(compact).filter(Boolean);
      return names.some(n => n===key || (Math.min(n.length,key.length)>=3 && (n.includes(key)||key.includes(n))));
    }) || null;
  };
  const exhibitionDetailFor = title => {
    const key=compact(title); if(!key) return null;
    return Object.values(window.EXHIBITION_DETAIL_DATA || {}).find(d => compact(d.title)===key) || null;
  };
  const sameArtist = (a,b) => {
    const da=artistDetailFor(a), db=artistDetailFor(b);
    if(da && db) return da.slug===db.slug;
    const x=compact(a), y=compact(b); if(!x||!y) return false;
    return x===y || (Math.min(x.length,y.length)>=3 && (x.includes(y)||y.includes(x)));
  };
  const sameWork = (a,b) => {
    const x=compact(a), y=compact(b); if(!x||!y) return false;
    return x===y || (Math.min(x.length,y.length)>=5 && (x.includes(y)||y.includes(x)));
  };
  const upcomingForWork = work => (window.MUSTSEE_DATA?.upcoming?.works || []).filter(u => sameArtist(work?.artist,u.artist) && sameWork(work?.work,u.work));
  const workHintExtras = guides => {
    const list=Array.isArray(guides)?guides.filter(Boolean):[]; if(!list.length) return '';
    const second=list[0] || '気になる場所を一つ決める';
    const third=list[1] || list[0] || '近くで細部を見る';
    return `<div class="mustsee-hint-flow"><strong>この作品で試す見る順番</strong>① 3秒で全体を見る → ② ${esc(second)} → ③ ${esc(third)} → ④ 少し離れて全体へ戻る<div class="mustsee-hint-tools"><a href="live-viewing.html">生で見るコツ →</a><a href="howto-detail.html?guide=seeing-techniques">5つの見る技術 →</a><a href="howto-detail.html?guide=three-aspects">形・意味・人で見る →</a></div></div>`;
  };
  const artworkGuideHref = id => `artwork-guide.html?work=${encodeURIComponent(id || '')}`;

  const modal = document.querySelector('#art-modal');
  function openModal(item, kicker) {
    if (!modal) return;
    const img = modal.querySelector('img');
    const title = modal.querySelector('[data-modal-title]');
    const meta = modal.querySelector('[data-modal-meta]');
    const eyebrow = modal.querySelector('[data-modal-kicker]');
    img.src = assetPath(item.web || item.thumb);
    img.alt = item.alt || `${item.title}の画像`;
    title.textContent = item.title || '';
    meta.textContent = kicker || item.subcategoryLabel || item.categoryLabel || '美術ノート';
    if (eyebrow) eyebrow.textContent = item.category === 'visits' ? 'VISIT PHOTO' : 'ART NOTE';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function makeArtCard(item) {
    const card = document.createElement('article');
    card.className = 'art-card';
    card.dataset.category = item.category || 'other';
    card.dataset.search = normalize(`${item.title} ${item.categoryLabel} ${item.subcategoryLabel || ''}`);

    const lifeDetail = item.category === 'lives' ? Object.values(window.ARTIST_DETAIL_DATA || {}).find(d => d.lifeSlug && ((d.aliases || []).some(a => normalize(a) === normalize(item.title)) || normalize(d.shortName) === normalize(item.title))) : null;
    const exhibitionDetail = item.category === 'exhibitions' ? Object.values(window.EXHIBITION_DETAIL_DATA || {}).find(d => normalize(d.title) === normalize(item.title)) : null;
    const htmlDetail = lifeDetail || exhibitionDetail;
    const button = document.createElement(htmlDetail ? 'a' : 'button');
    button.className = 'art-open';
    if (lifeDetail) {
      button.href = `artist-life.html?artist=${encodeURIComponent(lifeDetail.lifeSlug)}`;
      button.setAttribute('aria-label', `${item.title}の人生をHTMLで読む`);
    } else if (exhibitionDetail) {
      button.href = `exhibition-detail.html?exhibition=${encodeURIComponent(exhibitionDetail.slug)}`;
      button.setAttribute('aria-label', `${item.title}の見どころをHTMLで読む`);
    } else {
      button.type = 'button';
      button.setAttribute('aria-label', `${item.title}を大きく見る`);
    }

    const wrap = document.createElement('div');
    wrap.className = 'thumb-wrap';
    const img = document.createElement('img');
    img.className = 'art-thumb';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = exhibitionDetail?.thumbnail || assetPath(item.thumb || item.web);
    img.alt = exhibitionDetail?.thumbnail ? `${item.title} 公式ビジュアル` : (item.alt || `${item.title}のまとめ画像`);
    img.addEventListener('error', () => { wrap.classList.add('is-missing'); img.classList.add('is-missing'); });
    const fallback = document.createElement('div');
    fallback.className = 'thumb-fallback';
    fallback.textContent = '画像を配置後、update-gallery.bat を実行してください';
    wrap.append(img, fallback);

    const body = document.createElement('div');
    body.className = 'art-body';
    const kicker = document.createElement('div');
    kicker.className = 'art-kicker';
    kicker.textContent = item.subcategoryLabel || item.categoryLabel || '美術ノート';
    const title = document.createElement('h3');
    title.className = 'art-title';
    title.textContent = item.title;
    body.append(kicker, title);
    if (htmlDetail) {
      const badge=document.createElement('span'); badge.className=`art-html-badge${exhibitionDetail?' exhibition-html-badge':''}`; badge.textContent=exhibitionDetail?'見どころを読む →':'HTMLで読む →'; body.appendChild(badge);
    }
    button.append(wrap, body);
    if (!htmlDetail) button.addEventListener('click', () => openModal(item));
    card.append(button);
    return card;
  }

  function selectItems(root) {
    const requested = (root.dataset.gallery || 'all').split(',').map(s => s.trim()).filter(Boolean);
    let source = items.filter(item => requested.includes('all') || requested.includes(item.category));
    if (root.dataset.subcategory) source = source.filter(item => item.subcategoryLabel === root.dataset.subcategory);
    const limit = Number(root.dataset.limit || 0);
    if (limit > 0) source = source.slice(0, limit);
    return source;
  }

  function renderGallery(root) {
    const source = selectItems(root);
    root.innerHTML = '';
    if (!source.length) {
      root.innerHTML = '<div class="empty-state" style="grid-column:1/-1">まだ画像がありません。フォルダへ画像を追加して update-gallery.bat を実行すると表示されます。</div>';
      return;
    }
    source.forEach(item => root.appendChild(makeArtCard(item)));
  }
  document.querySelectorAll('[data-gallery]').forEach(renderGallery);


  // ---------------------------------------------------------
  // Home signature feature
  // 「今日、生で見たい一枚」+「まず10秒、見てみる。」
  // 画像は MUSTSEE_IMAGES に登録した作品だけを日替わり候補にする。
  // ---------------------------------------------------------
  const daySeed = () => {
    const d = new Date();
    return Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);
  };

  const applyVerifiedImageFallback = (img, info) => {
    if (!img || !info || typeof info.fallbackSrc !== 'string' || !/^https:\/\/upload\.wikimedia\.org\//i.test(info.fallbackSrc)) return;
    img.addEventListener('error', () => {
      if (img.dataset.fallbackUsed === '1') return;
      img.dataset.fallbackUsed = '1';
      img.src = info.fallbackSrc;
    }, { once: true });
  };

  const dailyRoot = document.querySelector('[data-daily-look]');
  if (dailyRoot && window.MUSTSEE_DATA) {
    const imageMap = window.MUSTSEE_IMAGES || {};
    const visualMap = window.ARTWORK_VISUAL_HINTS || {};
    const allWorks = [];
    ['japan','overseas'].forEach(scope => {
      const section = window.MUSTSEE_DATA[scope] || {};
      (section.museums || []).forEach(m => {
        (m.works || []).forEach(w => allWorks.push({
          ...w, scope, museum:m.museum||'', location:m.location||m.prefecture||m.country||'', prefecture:m.prefecture||'', country:m.country||''
        }));
      });
    });

    const isTrustedImage = info => {
      if (!info || info.verified !== true || typeof info.src !== 'string') return false;
      const isLocalMustsee = info.src.startsWith('assets/images/mustsee/');
      const isVerifiedCommonsRedirect = info.src.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/');
      const isVerifiedWikiArtRemote = info.verifiedRemote === true && /^https:\/\/uploads\d*\.wikiart\.org\//i.test(info.src);
      return Boolean((isLocalMustsee || isVerifiedCommonsRedirect || isVerifiedWikiArtRemote) && /^https:\/\//i.test(info.sourceUrl||'') && String(info.license||'').trim());
    };
    const preparedWorks = allWorks.filter(w => isTrustedImage(imageMap[w.id]));
    let work = preparedWorks.length ? preparedWorks[daySeed() % preparedWorks.length] : null;
    // TOPは必ずインタラクティブ鑑賞できる作品を選ぶ。今日の作品が既に対応済みならそのまま維持。
    if (work && !((visualMap[work.id]?.hints||[]).length === 3)) {
      const startIndex = preparedWorks.indexOf(work);
      for (let step=1; step<preparedWorks.length; step++) {
        const candidate=preparedWorks[(startIndex+step)%preparedWorks.length];
        if ((visualMap[candidate.id]?.hints||[]).length === 3) { work=candidate; break; }
      }
    }
    const imageInfo = work ? (imageMap[work.id] || {}) : {};
    const visualConfig = work ? (visualMap[work.id] || null) : null;
    const visualHints = (visualConfig?.hints || []).slice(0,3);
    const hasVisualHints = Boolean(work && imageInfo.src && visualHints.length===3);
    const displayGuides=[0,1,2].map(i=>visualHints[i]?.copy || work?.guides?.[i] || imageInfo?.guides?.[i] || '');
    const displayPoint=visualConfig?.point || work?.point || '';

    const img = dailyRoot.querySelector('[data-daily-image]');
    const media = dailyRoot.querySelector('[data-daily-media]');
    const stage = dailyRoot.querySelector('[data-daily-image-stage]');
    const overlay = dailyRoot.querySelector('[data-daily-visual-overlay]');
    const status = dailyRoot.querySelector('[data-daily-visual-status]');
    const toolbar = dailyRoot.querySelector('[data-daily-visual-toolbar]');
    const placeholder = dailyRoot.querySelector('[data-daily-placeholder]');
    const reveal = dailyRoot.querySelector('[data-daily-reveal]');
    const first = dailyRoot.querySelector('[data-daily-first]');
    let activeVisual=-1;

    const d = new Date();
    const dateEl = dailyRoot.querySelector('[data-daily-date]');
    if (dateEl) dateEl.textContent = `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`;

    if (work) {
      dailyRoot.querySelector('[data-daily-number]').textContent = String(work.no).padStart(3,'0');
      dailyRoot.querySelector('[data-daily-artist]').textContent = work.artist || '';
      const artistLink = dailyRoot.querySelector('[data-daily-artist-link]');
      if (artistLink) { artistLink.href = `mustsee.html?artist=${encodeURIComponent(work.artist || '')}#artists`; artistLink.textContent = `${work.artist || 'この画家'}の「生で見たい作品」 →`; }
      const profileLink = dailyRoot.querySelector('[data-daily-profile-link]');
      if (profileLink) { const detail=artistDetailFor(work.artist||''); if(detail){profileLink.href=`artist.html?artist=${encodeURIComponent(detail.slug)}`;profileLink.textContent=`${work.artist||'この画家'}ってどんな画家？ →`;profileLink.hidden=false;} else profileLink.hidden=true; }
      const exhibitionLink=dailyRoot.querySelector('[data-daily-exhibition-link]');
      if(exhibitionLink){ const upcoming=upcomingForWork(work).sort((a,b)=>(a.start||'').localeCompare(b.start||''))[0]; if(upcoming){const exDetail=exhibitionDetailFor(upcoming.exhibition);exhibitionLink.href=exDetail?`exhibition-detail.html?exhibition=${encodeURIComponent(exDetail.slug)}`:'mustsee.html#upcoming';exhibitionLink.textContent=exDetail?'この作品が見られる展覧会 →':'来日予定を見る →';exhibitionLink.hidden=false;}else exhibitionLink.hidden=true; }
      const guideLink=dailyRoot.querySelector('[data-daily-guide-link]');
      if(guideLink){guideLink.href=artworkGuideHref(work.id);guideLink.textContent='この作品の「絵を見るヒント」 →';guideLink.hidden=false;}
      dailyRoot.querySelector('[data-daily-work]').textContent = work.work || '';
      dailyRoot.querySelector('[data-daily-museum]').textContent = [work.museum,work.location].filter(Boolean).join('｜');
      dailyRoot.querySelector('[data-daily-point]').textContent = displayPoint;
    } else {
      dailyRoot.classList.add('is-awaiting-verified-image');
      const titleEl=dailyRoot.querySelector('[data-daily-work]'); if(titleEl)titleEl.textContent='確認済みの作品画像を、少しずつ追加していきます。';
    }

    const questionRows=[...dailyRoot.querySelectorAll('[data-daily-hint]')];
    questionRows.forEach((row,i)=>{
      const label=row.querySelector('[data-daily-question-label]');
      if(label) label.textContent=visualHints[i]?.label || ['最初に見る場所','視線を動かす','近くで確かめる'][i];
      let hint=row.querySelector('.daily-guide');
      if(!hint){hint=document.createElement('p');hint.className='daily-guide';row.appendChild(hint);}
      hint.textContent=displayGuides[i] ? `見るヒント｜${displayGuides[i]}` : '';
      hint.hidden=!displayGuides[i];
      if(hasVisualHints){row.setAttribute('role','button');row.tabIndex=0;row.setAttribute('aria-pressed','false');row.setAttribute('aria-label',`0${i+1} ${visualHints[i]?.label||''}。画像で場所を確認する`);}
    });

    const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
    const shapeMarkup=(r,attrs='')=>{if(!r)return'';if(r.type==='rect')return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.r||3}" ${attrs}></rect>`;return `<ellipse cx="${r.x}" cy="${r.y}" rx="${r.w/2}" ry="${r.h/2}" ${attrs}></ellipse>`;};
    const marker=(hint,index)=>{const r=(hint.regions||[])[0];if(!r)return'';const rawX=r.type==='rect'?r.x+3:r.x-r.w/2+4;const rawY=r.type==='rect'?r.y+4:r.y-r.h/2+5;const x=clamp(rawX,5,95),y=clamp(rawY,6,94);return `<g class="artwork-guide-visual-marker"><circle cx="${x}" cy="${y}" r="3.3"></circle><text x="${x}" y="${y+.25}" text-anchor="middle" dominant-baseline="middle">0${index+1}</text></g>`;};
    const syncDailyButtons=()=>{
      questionRows.forEach((row,i)=>{const on=i===activeVisual;row.classList.toggle('is-active',on);row.setAttribute('aria-pressed',String(on));});
      toolbar?.querySelectorAll('[data-daily-toolbar-hint]').forEach(btn=>{const on=Number(btn.dataset.dailyToolbarHint)===activeVisual;btn.classList.toggle('is-active',on);btn.setAttribute('aria-pressed',String(on));});
    };
    const renderDailyVisual=index=>{
      if(!hasVisualHints||!overlay)return;
      activeVisual=(index>=0&&index<3)?index:-1;
      if(activeVisual<0){overlay.innerHTML='';overlay.classList.remove('is-active');if(status){status.hidden=true;status.textContent='';}syncDailyButtons();return;}
      const hint=visualHints[activeVisual],regions=hint.regions||[];
      const maskId=`daily-hint-mask-${String(work.id).replace(/[^a-z0-9-]/gi,'')}-${activeVisual}`;
      const holes=regions.map(r=>shapeMarkup(r,'fill="black"')).join('');
      const outlines=regions.map(r=>shapeMarkup(r,'class="artwork-guide-visual-outline" vector-effect="non-scaling-stroke"')).join('');
      const path=Array.isArray(hint.path)&&hint.path.length>1?`<polyline class="artwork-guide-visual-path" points="${hint.path.map(p=>p.join(',')).join(' ')}" marker-end="url(#daily-hint-arrow)" vector-effect="non-scaling-stroke"></polyline>`:'';
      overlay.innerHTML=`<defs><mask id="${maskId}"><rect width="100" height="100" fill="white"></rect>${holes}</mask><marker id="daily-hint-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" class="artwork-guide-visual-arrowhead"></path></marker></defs><rect class="artwork-guide-visual-dim" width="100" height="100" mask="url(#${maskId})"></rect>${outlines}${path}${marker(hint,activeVisual)}`;
      overlay.classList.add('is-active');
      if(status){status.textContent=`0${activeVisual+1}｜${hint.label||'見るポイント'}`;status.hidden=false;}
      syncDailyButtons();
    };

    if(hasVisualHints&&toolbar){
      toolbar.hidden=false;
      toolbar.innerHTML=visualHints.map((h,i)=>`<button type="button" data-daily-toolbar-hint="${i}" aria-pressed="false">0${i+1}</button>`).join('')+`<button type="button" class="is-reset" data-daily-toolbar-reset>全体</button>`;
      toolbar.querySelectorAll('[data-daily-toolbar-hint]').forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.dailyToolbarHint);renderDailyVisual(activeVisual===i?-1:i);}));
      toolbar.querySelector('[data-daily-toolbar-reset]')?.addEventListener('click',()=>renderDailyVisual(-1));
      questionRows.forEach((row,i)=>{const activate=()=>renderDailyVisual(activeVisual===i?-1:i);row.addEventListener('click',activate);row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});});
    }

    const fitDailyStage=()=>{
      if(!stage||!media||!img||!img.naturalWidth)return;
      const ratio=img.naturalWidth/img.naturalHeight;
      const availableW=Math.max(180,media.clientWidth);
      const mobile=window.matchMedia('(max-width:920px)').matches;
      const maxH=mobile?Math.min(window.innerHeight*.62,560):Math.max(540,media.clientHeight||540);
      let width=Math.min(availableW,maxH*ratio),height=width/ratio;
      if(height>maxH){height=maxH;width=height*ratio;}
      stage.style.width=`${Math.round(width)}px`;stage.style.height=`${Math.round(height)}px`;
    };

    if(imageInfo.src&&work){
      img.src=imageInfo.src;applyVerifiedImageFallback(img,imageInfo);img.alt=`${work.artist} ${work.work}`;img.hidden=false;placeholder.hidden=true;
      if(img.complete&&img.naturalWidth)fitDailyStage();img.addEventListener('load',fitDailyStage);window.addEventListener('resize',fitDailyStage,{passive:true});
    }else{img.hidden=true;placeholder.hidden=false;}

    const credit=dailyRoot.querySelector('[data-daily-credit]');
    if(credit&&imageInfo.credit){const source=imageInfo.sourceUrl?`<a href="${imageInfo.sourceUrl}" target="_blank" rel="noopener noreferrer">${imageInfo.credit}</a>`:imageInfo.credit;const license=imageInfo.license?(imageInfo.licenseUrl?` · <a href="${imageInfo.licenseUrl}" target="_blank" rel="noopener noreferrer">${imageInfo.license}</a>`:` · ${imageInfo.license}`):'';credit.innerHTML=`画像：${source}${license}`;credit.hidden=false;}
    if(reveal)reveal.hidden=false;
  }

  const filterable = document.querySelector('[data-filterable-gallery]');
  const search = document.querySelector('[data-gallery-search]');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  let activeFilter = 'all';
  function applyFilters() {
    if (!filterable) return;
    const query = normalize(search?.value || '');
    [...filterable.children].forEach(card => {
      if (!card.classList.contains('art-card')) return;
      const byCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const byText = !query || card.dataset.search.includes(query);
      card.hidden = !(byCategory && byText);
    });
  }
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter || 'all';
    filterButtons.forEach(b => b.classList.toggle('is-active', b === btn));
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);

  function renderHistoryGroups(root) {
    const historyItems = items.filter(x => x.category === 'history');
    if (!historyItems.length) {
      root.innerHTML = '<div class="empty-state">40_美術史 の中に画像を置くと、ここに自動で表示されます。</div>';
      return;
    }
    const groups = new Map();
    historyItems.forEach(item => {
      const label = item.subcategoryLabel || '美術史';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(item);
    });
    root.innerHTML = '';
    groups.forEach((groupItems, label) => {
      const section = document.createElement('section');
      section.className = 'history-track';
      const head = document.createElement('div');
      head.className = 'history-track-head';
      head.innerHTML = `<div><div class="eyebrow">ART HISTORY</div><h2>${label}</h2></div><p>${groupItems.length}時代を一本の流れで</p>`;
      const timeline = document.createElement('div');
      timeline.className = 'history-timeline';
      const historyDetails=Object.values(window.HISTORY_DETAIL_DATA||{});
      groupItems.forEach((item, index) => {
        const node = document.createElement('article');
        node.className = 'history-node';
        const cleanTitle = String(item.title || '').replace(/^\d+[.．]\s*/, '');
        const detail=historyDetails.find(d=>d.name===cleanTitle || d.no===String(index+1).padStart(2,'0'));
        const button = detail ? document.createElement('a') : document.createElement('button');
        if(detail){button.href=`history-detail.html?period=${encodeURIComponent(detail.slug)}`;} else {button.type='button';}
        button.className = 'history-node-open';
        const wrap = document.createElement('div');
        wrap.className = 'history-node-media';
        const img = document.createElement('img');
        img.loading='lazy'; img.decoding='async'; img.src=detail?.hero || assetPath(item.thumb || item.web); img.alt=detail?`${detail.name} ${detail.representative?.title||''}`:(item.alt || item.title);
        wrap.appendChild(img);
        const copy = document.createElement('div');
        copy.className='history-node-copy';
        copy.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><h3>${cleanTitle}</h3>${detail?`<p>${esc(detail.tagline||'')}</p><b>HTMLで読む →</b>`:`<b>${index < groupItems.length-1 ? '次に何が変わる？ →' : '現代へ →'}</b>`}`;
        button.append(wrap,copy); if(!detail)button.addEventListener('click',()=>openModal(item,label)); node.appendChild(button); timeline.appendChild(node);
      });
      section.append(head,timeline); root.append(section);
    });
  }
  document.querySelectorAll('[data-history-groups]').forEach(renderHistoryGroups);

  function makeVisitCard(album) {
    const card = document.createElement('article');
    card.className = 'visit-card';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'visit-open';
    button.setAttribute('aria-label', `${album.title}の写真を見る`);
    const img = document.createElement('img');
    img.className = 'visit-cover';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = assetPath(album.coverThumb || album.coverWeb);
    img.alt = `${album.title}の写真`;
    const body = document.createElement('div');
    body.className = 'visit-body';
    body.innerHTML = `<div class="visit-date">${album.dateLabel || 'VISIT'}</div><h3 class="visit-title">${album.title}</h3><div class="visit-count">写真 ${album.count || album.items?.length || 0}枚</div>`;
    button.append(img, body);
    button.addEventListener('click', () => showAlbum(album.key, true));
    card.append(button);
    return card;
  }

  function renderVisitCards(root, source) {
    root.innerHTML = '';
    if (!source.length) {
      root.innerHTML = '<div class="empty-state" style="grid-column:1/-1">まだ展覧会アルバムはありません。</div>';
      return;
    }
    source.forEach(album => root.appendChild(makeVisitCard(album)));
  }
  document.querySelectorAll('[data-visits]').forEach(root => renderVisitCards(root, visitAlbums));
  document.querySelectorAll('[data-recent-visits]').forEach(root => renderVisitCards(root, visitAlbums.slice(0, Number(root.dataset.limit || 3))));

  const albumPanel = document.querySelector('[data-album-panel]');
  function showAlbum(key, pushState = false) {
    if (!albumPanel) return;
    const album = visitAlbums.find(a => a.key === key);
    if (!album) return;
    const title = albumPanel.querySelector('[data-album-title]');
    const date = albumPanel.querySelector('[data-album-date]');
    const grid = albumPanel.querySelector('[data-album-grid]');
    title.textContent = album.title;
    date.textContent = [album.dateLabel, `写真 ${album.count || album.items.length}枚`].filter(Boolean).join('｜');
    grid.innerHTML = '';
    album.items.forEach(item => {
      const visitItem = { ...item, category: 'visits', categoryLabel: album.title };
      grid.appendChild(makeArtCard(visitItem));
    });
    albumPanel.hidden = false;
    if (pushState) {
      const url = new URL(window.location.href);
      url.searchParams.set('album', album.key);
      history.pushState({ album: album.key }, '', url);
    }
    albumPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  albumPanel?.querySelector('[data-album-close]')?.addEventListener('click', () => {
    albumPanel.hidden = true;
    const url = new URL(window.location.href);
    url.searchParams.delete('album');
    history.pushState({}, '', url);
  });
  window.addEventListener('popstate', () => {
    const key = new URL(window.location.href).searchParams.get('album');
    if (key) showAlbum(key, false); else if (albumPanel) albumPanel.hidden = true;
  });
  const initialAlbum = new URL(window.location.href).searchParams.get('album');
  if (initialAlbum) setTimeout(() => showAlbum(initialAlbum, false), 0);

  const exRoot = document.querySelector('[data-exhibitions]');
  if (exRoot) {
    const exs = Array.isArray(window.EXHIBITIONS) ? window.EXHIBITIONS : [];
    if (!exs.length) {
      exRoot.innerHTML = '<div class="empty-state" style="grid-column:1/-1">気になる展覧会を選んだら assets/js/exhibitions-data.js に追加できます。画像の展覧会ガイドは下の一覧へ自動表示されます。</div>';
    } else {
      exRoot.innerHTML = '';
      exs.forEach(ex => {
        const card = document.createElement('article');
        card.className = 'exhibition-card';
        const link = ex.url ? `<a href="${ex.url}" target="_blank" rel="noopener">公式サイト ↗</a>` : '';
        card.innerHTML = `<div class="status">${ex.status || '気になる'}</div><h3>${ex.title || ''}</h3>${ex.museum ? `<p>${ex.museum}</p>` : ''}${ex.period ? `<p>${ex.period}</p>` : ''}${ex.note ? `<p>${ex.note}</p>` : ''}${link}`;
        exRoot.appendChild(card);
      });
    }
  }


  // 人生で生で見たい美術作品：日本100・海外201・来日予定・画家別
  const trustedMustseeImage = info => {
    if (!info || info.verified !== true || typeof info.src !== 'string') return false;
    const local = info.src.startsWith('assets/images/mustsee/');
    const commons = info.src.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/');
    const wikiart = info.verifiedRemote === true && /^https:\/\/uploads\d*\.wikiart\.org\//i.test(info.src);
    return (local || commons || wikiart) && typeof info.sourceUrl === 'string' && /^https:\/\//i.test(info.sourceUrl) && !!String(info.license || '').trim();
  };

  const homeComing = document.querySelector('[data-home-coming]');
  if (homeComing && window.MUSTSEE_DATA?.upcoming?.works) {
    const imageMap = window.MUSTSEE_IMAGES || {};
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const candidates = [...window.MUSTSEE_DATA.upcoming.works].filter(w => !w.end || w.end >= today);
    const future = candidates.filter(w => !w.start || w.start >= today).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
    const active = candidates.filter(w => w.start && w.start < today && (!w.end || w.end >= today)).sort((a,b)=>(b.start||'').localeCompare(a.start||''));
    const featured = future[0] || active[0] || candidates[0];
    if (featured) {
      const info = imageMap[featured.id] || {};
      const isFuture = !featured.start || featured.start >= today;
      const image = homeComing.querySelector('[data-home-coming-image]');
      const media = homeComing.querySelector('[data-home-coming-media]');
      if (image && trustedMustseeImage(info)) {
        image.src = info.src;
        image.alt = `${featured.artist || ''}${featured.work || ''}`;
        image.hidden = false;
        applyVerifiedImageFallback(image, info);
      } else if (image) {
        image.hidden = true;
        media?.classList.add('is-image-missing');
      }
      const setText = (sel, value) => { const el=homeComing.querySelector(sel); if(el) el.textContent=value || ''; };
      setText('[data-home-coming-label]', isFuture ? 'COMING TO JAPAN' : 'NOW IN JAPAN');
      setText('[data-home-coming-date]', [featured.start, featured.end].filter(Boolean).map(x=>x.replaceAll('-','.')).join(' — '));
      setText('[data-home-coming-artist]', featured.artist || '');
      setText('[data-home-coming-title]', isFuture ? `${featured.work || ''}が日本へ。` : `${featured.work || ''}を日本で。`);
      setText('[data-home-coming-meta]', `${featured.owner ? featured.owner + '所蔵。' : ''}${featured.venue ? featured.venue + 'で見る。' : ''}`);
    }
  }

  function collectLifetimeWorks() {
    const imageMap = window.MUSTSEE_IMAGES || {};
    const out=[];
    ['japan','overseas'].forEach(scope => {
      const section=window.MUSTSEE_DATA?.[scope] || {};
      (section.museums || []).forEach(m => (m.works || []).forEach(w => out.push({
        ...w, scope, museum:m.museum || '', location:m.location || '', prefecture:m.prefecture || '', country:m.country || '', museumUrl:m.url || '', image: trustedMustseeImage(imageMap[w.id]) ? imageMap[w.id] : null
      })));
    });
    return out;
  }

  function setupMustseeScope(scopeName) {
    const root = document.querySelector(`[data-mustsee-list="${scopeName}"]`);
    const section = window.MUSTSEE_DATA?.[scopeName];
    if (!root || !section) return;
    const imageMap=window.MUSTSEE_IMAGES || {};
    const regionSelect = document.querySelector(`[data-mustsee-region="${scopeName}"]`);
    const searchBox = document.querySelector(`[data-mustsee-search="${scopeName}"]`);
    const priorityOnly = document.querySelector(`[data-priority-only="${scopeName}"]`);
    const regionKey = scopeName === 'japan' ? 'prefecture' : 'country';
    const regions = [...new Set((section.museums || []).map(m => m[regionKey]).filter(Boolean))];
    regions.forEach(region => { const op=document.createElement('option'); op.value=region; op.textContent=region; regionSelect?.appendChild(op); });

    (section.museums || []).forEach(m => {
      const sec=document.createElement('section'); sec.className='mustsee-museum'; sec.dataset.region=m[regionKey] || '';
      const head=document.createElement('div'); head.className='mustsee-museum-head';
      const left=document.createElement('div'); const location=scopeName==='japan' ? (m.prefecture || '') : (m.country || '');
      left.innerHTML=`<div class="eyebrow">${esc(location)}</div><h2>${esc(m.location ? m.location + '｜' : '')}${esc(m.museum)}</h2><p>${(m.works || []).length}作品</p>`; head.appendChild(left);
      if(m.url){ const a=document.createElement('a'); a.className='mustsee-source'; a.href=m.url; a.target='_blank'; a.rel='noopener'; a.textContent='所蔵・参考情報 ↗'; head.appendChild(a); }
      const wrap=document.createElement('div'); wrap.className='mustsee-table-wrap';
      const table=document.createElement('table'); table.className='mustsee-table'; table.innerHTML='<thead><tr><th>No.</th><th>作家</th><th>作品</th><th>生で見るポイント</th></tr></thead>';
      const tbody=document.createElement('tbody');
      (m.works || []).forEach(w => {
        const tr=document.createElement('tr'); tr.id=`work-${w.id}`; tr.dataset.workId=w.id; tr.dataset.search=normalize(`${w.artist} ${w.work} ${w.point} ${(w.guides||[]).join(' ')} ${m.museum} ${m.location||''} ${m[regionKey]||''}`); tr.dataset.priority=w.priority?'1':'0';
        const info=imageMap[w.id] || {}; const hasImage=trustedMustseeImage(info); const guides=Array.isArray(w.guides)?w.guides:[]; const badge=w.priority?'<span class="priority-badge">注目</span>':'';
        const imageHtml=hasImage?`<a class="mustsee-thumb-link" href="${esc(info.src)}" target="_blank" rel="noopener" aria-label="${esc(w.artist+' '+w.work)}の画像を開く"><img src="${esc(info.src)}" alt="${esc(w.artist+' '+w.work)}" loading="lazy"></a>`:'';
        const artistListHref=`mustsee.html?artist=${encodeURIComponent(w.artist || '')}#artists`;
        const artistDetail=artistDetailFor(w.artist);
        const artistPrimaryHref=artistDetail?`artist.html?artist=${encodeURIComponent(artistDetail.slug)}`:artistListHref;
        const artistExtra=artistDetail?`<a class="mustsee-artist-list-link" href="${artistListHref}">作品一覧 →</a>`:'';
        const relatedUpcoming=upcomingForWork(w).sort((a,b)=>(a.start||'').localeCompare(b.start||''))[0];
        const exDetail=relatedUpcoming?exhibitionDetailFor(relatedUpcoming.exhibition):null;
        const comingBadge=relatedUpcoming?`<span class="coming-soon-badge">来日予定</span>`:'';
        const hintId=`hint-${esc(w.id)}`;
        const actions=[];
        if(hasImage) actions.push(`<a href="${esc(info.src)}" target="_blank" rel="noopener">画像を見る ↗</a>`);
        if(guides.length) actions.push(`<a class="mustsee-guide-detail-link" href="${artworkGuideHref(w.id)}">絵を見るヒント →</a>`);
        if(relatedUpcoming) actions.push(exDetail?`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(exDetail.slug)}">見られる展覧会 →</a>`:`<a href="#upcoming" data-jump-upcoming>来日予定を見る →</a>`);
        const actionHtml=actions.length?`<div class="mustsee-work-actions">${actions.join('')}</div>`:'';
        const guideHtml=guides.length?`<details class="mustsee-guides" id="${hintId}"><summary>3つだけ先に見る</summary><ol>${guides.map(g=>`<li>${esc(g)}</li>`).join('')}</ol><a class="mustsee-inline-guide-link" href="${artworkGuideHref(w.id)}">この作品の詳しい見方 →</a></details>`:'';
        tr.innerHTML=`<td class="mustsee-no">${String(w.no).padStart(3,'0')}</td><td class="mustsee-artist"><a class="mustsee-artist-main-link" href="${artistPrimaryHref}">${esc(w.artist)}</a>${artistExtra}</td><td class="mustsee-work"><div class="mustsee-work-layout">${imageHtml}<div><a class="mustsee-work-title mustsee-work-title-link" href="${artworkGuideHref(w.id)}">${esc(w.work)}${badge}${comingBadge}</a>${actionHtml}</div></div></td><td class="mustsee-point"><div>${esc(w.point)}</div>${guideHtml}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody); wrap.appendChild(table); sec.append(head,wrap); root.appendChild(sec);
    });
    root.addEventListener('click',e=>{ const btn=e.target.closest('[data-open-hint]'); if(!btn)return; const d=document.getElementById(btn.dataset.openHint); if(d){ d.open=true; d.scrollIntoView({behavior:'smooth',block:'center'}); } });
    function apply(){ const q=normalize(searchBox?.value||''); const region=regionSelect?.value||'all'; const pri=!!priorityOnly?.checked; const sections=[...root.querySelectorAll('.mustsee-museum')]; sections.forEach(sec=>{let count=0; [...sec.querySelectorAll('tbody tr')].forEach(tr=>{const visible=(region==='all'||sec.dataset.region===region)&&(!q||tr.dataset.search.includes(q))&&(!pri||tr.dataset.priority==='1'); tr.hidden=!visible; if(visible)count++;}); sec.hidden=count===0;}); let empty=root.querySelector('.mustsee-empty'); const any=sections.some(x=>!x.hidden); if(!any&&!empty){empty=document.createElement('div'); empty.className='mustsee-empty'; empty.textContent='条件に合う作品がありません。'; root.appendChild(empty);} if(empty)empty.hidden=any; }
    searchBox?.addEventListener('input',apply); regionSelect?.addEventListener('change',apply); priorityOnly?.addEventListener('change',apply); apply();
  }
  setupMustseeScope('japan'); setupMustseeScope('overseas');

  const allLifetimeWorks = window.MUSTSEE_DATA ? collectLifetimeWorks() : [];
  const lifetimeStackImages=[...document.querySelectorAll('[data-lifetime-art-image]')];
  if(lifetimeStackImages.length && allLifetimeWorks.length){
    const excluded=new Set(['jp-001','ov-002','jp-071','ov-071','ov-005']);
    const pool=allLifetimeWorks.filter(w=>w.image && w.image.src.startsWith('assets/images/mustsee/') && !excluded.has(w.id));
    if(pool.length>=lifetimeStackImages.length){
      const seed=daySeed();
      const picks=[];
      const steps=[0,37,83,131];
      for(let i=0;i<lifetimeStackImages.length;i++){
        let candidate=pool[(seed+steps[i])%pool.length];
        let guard=0;
        while(picks.some(x=>x.id===candidate.id) && guard<pool.length){ candidate=pool[(seed+steps[i]+(++guard))%pool.length]; }
        picks.push(candidate);
      }
      lifetimeStackImages.forEach((img,i)=>{ const w=picks[i]; img.src=w.image.src; img.alt=`${w.artist || ''}${w.work || ''}`; applyVerifiedImageFallback(img,w.image); });
    }
  }
  const artistDirectory=document.querySelector('[data-mustsee-artists]'); const artistWorksRoot=document.querySelector('[data-mustsee-artist-works]'); const artistSearch=document.querySelector('[data-mustsee-artist-search]');
  if(artistDirectory&&artistWorksRoot){
    const byArtist=new Map(); allLifetimeWorks.forEach(w=>{if(!byArtist.has(w.artist))byArtist.set(w.artist,[]); byArtist.get(w.artist).push(w);});
    const artists=[...byArtist.entries()].sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0],'ja'));
    function renderDirectory(){ const q=normalize(artistSearch?.value||''); artistDirectory.innerHTML=''; artists.filter(([name])=>!q||normalize(name).includes(q)).forEach(([name,works])=>{const withImages=works.filter(w=>w.image).length; const b=document.createElement('button'); b.type='button'; b.className='mustsee-artist-chip'; b.dataset.artistName=name; b.innerHTML=`<strong>${esc(name)}</strong><span>${works.length}作品${withImages?` · 画像${withImages}`:''}</span>`; b.addEventListener('click',()=>selectArtist(name,true)); artistDirectory.appendChild(b);}); }
    function selectArtist(name,push){
      const works=byArtist.get(name)||[]; if(!works.length)return;
      artistWorksRoot.innerHTML='';
      const detail=artistDetailFor(name);
      const head=document.createElement('div'); head.className='artist-selection-head';
      head.innerHTML=`<div><div class="eyebrow">${esc(name)}</div><h2>${esc(name)}｜生で見たい${works.length}作品</h2>${detail?`<a class="artist-selection-profile-link" href="artist.html?artist=${encodeURIComponent(detail.slug)}">${esc(name)}ってどんな画家？ →</a>`:''}</div><button type="button" data-clear-artist>画家一覧へ ↑</button>`;
      const grid=document.createElement('div'); grid.className='artist-work-grid';
      works.forEach(w=>{
        const card=document.createElement('article'); card.className='artist-work-card';
        const img=w.image?`<a class="artist-work-media" href="${esc(w.image.src)}" target="_blank" rel="noopener"><img src="${esc(w.image.src)}" alt="${esc(w.artist+' '+w.work)}" loading="lazy"></a>`:`<div class="artist-work-media is-empty"><span>IMAGE<br>NOT LISTED</span></div>`;
        const guides=Array.isArray(w.guides)&&w.guides.length?`<details><summary>3つのヒントを先に見る</summary><ol>${w.guides.map(g=>`<li>${esc(g)}</li>`).join('')}</ol><a class="mustsee-inline-guide-link" href="${artworkGuideHref(w.id)}">詳しい絵を見るヒント →</a></details>`:'';
        const upcoming=upcomingForWork(w).sort((a,b)=>(a.start||'').localeCompare(b.start||''))[0];
        const exDetail=upcoming?exhibitionDetailFor(upcoming.exhibition):null;
        const workHref=`mustsee.html?work=${encodeURIComponent(w.id)}#${w.scope}`;
        const related=upcoming?(exDetail?`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(exDetail.slug)}">見られる展覧会 →</a>`:`<a href="mustsee.html#upcoming">来日予定 →</a>`):'';
        card.innerHTML=`${img}<div class="artist-work-body"><div class="artist-work-meta">${w.scope==='japan'?'日本':'海外'}｜${esc(w.museum)}</div><h3>${esc(w.work)}</h3><p>${esc(w.point||'')}</p>${guides}<div class="artist-work-links"><a href="${artworkGuideHref(w.id)}">絵を見るヒント →</a><a href="${workHref}">作品リストで見る →</a>${related}</div></div>`;
        grid.appendChild(card);
      });
      artistWorksRoot.append(head,grid);
      document.querySelectorAll('.mustsee-artist-chip').forEach(x=>x.classList.toggle('is-active',x.dataset.artistName===name));
      if(push){const u=new URL(location.href); u.searchParams.set('artist',name); u.searchParams.delete('work'); u.hash='artists'; history.replaceState(null,'',u); }
      artistWorksRoot.scrollIntoView({behavior:push?'smooth':'auto',block:'start'});
    }
    artistWorksRoot.addEventListener('click',e=>{if(e.target.closest('[data-clear-artist]')){artistWorksRoot.innerHTML=''; document.querySelectorAll('.mustsee-artist-chip').forEach(x=>x.classList.remove('is-active')); artistDirectory.scrollIntoView({behavior:'smooth',block:'start'});}});
    artistSearch?.addEventListener('input',renderDirectory); renderDirectory();
    const requested=new URL(location.href).searchParams.get('artist'); if(requested&&byArtist.has(requested)) setTimeout(()=>selectArtist(requested,false),0);
  }

  const upcomingRoot=document.querySelector('[data-upcoming-list]');
  if(upcomingRoot&&window.MUSTSEE_DATA?.upcoming?.works){
    const imageMap=window.MUSTSEE_IMAGES||{};
    const coming=[...window.MUSTSEE_DATA.upcoming.works].sort((a,b)=>(a.start||'').localeCompare(b.start||''));
    coming.forEach((w,idx)=>{
      const card=document.createElement('article'); card.className='upcoming-art-card'; card.id=`upcoming-work-${w.id}`;
      const period=[w.start,w.end].filter(Boolean).join(' — '); const info=imageMap[w.id]||{}; const guides=Array.isArray(w.guides)?w.guides:[]; const hasImage=trustedMustseeImage(info);
      const media=hasImage?`<a class="upcoming-art-media" href="${esc(info.src)}" target="_blank" rel="noopener"><img src="${esc(info.src)}" alt="${esc(w.artist+' '+w.work)}" loading="lazy"></a>`:'';
      const guideHtml=guides.length?`<div class="upcoming-guides"><div class="upcoming-guides-title">絵を見るヒント</div><ol>${guides.map(g=>`<li>${esc(g)}</li>`).join('')}</ol><a class="mustsee-inline-guide-link" href="${artworkGuideHref(w.id)}">この作品を詳しく見る →</a></div>`:'';
      const artistDetail=artistDetailFor(w.artist); const exDetail=exhibitionDetailFor(w.exhibition);
      const artistHref=artistDetail?`artist.html?artist=${encodeURIComponent(artistDetail.slug)}`:`mustsee.html?artist=${encodeURIComponent(w.artist)}#artists`;
      const actions=[`<a href="${artworkGuideHref(w.id)}">絵を見るヒント →</a>`,`<a href="${artistHref}">${artistDetail?'この画家を知る':'同じ画家の作品'} →</a>`];
      if(exDetail) actions.push(`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(exDetail.slug)}">展覧会の見どころ →</a>`);
      if(w.url) actions.push(`<a href="${esc(w.url)}" target="_blank" rel="noopener">公式情報 ↗</a>`);
      card.innerHTML=`${media}<div class="upcoming-art-date">${esc(period)}</div><div class="upcoming-art-no">${String(idx+1).padStart(2,'0')}</div><p class="upcoming-art-artist"><a href="${artistHref}">${esc(w.artist)}</a></p><h3>${esc(w.work)}</h3><p class="upcoming-art-owner">${esc(w.owner||'')}</p><div class="upcoming-art-exhibition">${exDetail?`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(exDetail.slug)}"><b>${esc(w.exhibition||'')}</b></a>`:`<b>${esc(w.exhibition||'')}</b>`}<span>${esc(w.venue||'')}</span></div><p class="upcoming-art-point">${esc(w.point||'')}</p>${guideHtml}<div class="upcoming-art-actions">${actions.join('')}</div>`;
      applyVerifiedImageFallback(card.querySelector('.upcoming-art-media img'), info); upcomingRoot.appendChild(card);
    });
  }

  const panels=[...document.querySelectorAll('[data-mustsee-panel]')];
  function setMustseePanel(target,scroll=true){ if(!panels.length)return; panels.forEach(p=>{const active=p.dataset.mustseePanel===target; p.classList.toggle('is-active',active); p.hidden=!active;}); document.querySelectorAll('[data-mustsee-link]').forEach(a=>a.classList.toggle('is-active',a.dataset.mustseeLink===target)); if(scroll){document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'});} }
  document.querySelectorAll('[data-mustsee-link]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault(); const target=a.dataset.mustseeLink; if(target){setMustseePanel(target,true); history.replaceState(null,'',`${location.pathname}${location.search}#${target}`);}}));
  document.addEventListener('click',e=>{
    const jump=e.target.closest('[data-jump-upcoming]'); if(!jump) return;
    e.preventDefault(); setMustseePanel('upcoming',true); history.replaceState(null,'',`${location.pathname}${location.search}#upcoming`);
  });
  const initialUrl=new URL(location.href); const initialArtist=initialUrl.searchParams.get('artist'); const initialWork=initialUrl.searchParams.get('work'); const initialUpcoming=initialUrl.searchParams.get('upcoming'); const initialHash=location.hash.replace('#','');
  if(initialUpcoming){
    setMustseePanel('upcoming',false);
    const target=document.getElementById(`upcoming-work-${initialUpcoming}`);
    if(target){setTimeout(()=>{target.classList.add('is-target-work');target.scrollIntoView({behavior:'smooth',block:'center'});},30);}
  } else if(initialWork){
    const target=document.getElementById(`work-${initialWork}`);
    const panel=target?.closest('[data-mustsee-panel]')?.dataset.mustseePanel;
    setMustseePanel(panel||(['japan','overseas','upcoming','artists'].includes(initialHash)?initialHash:'japan'),false);
    if(target){setTimeout(()=>{target.classList.add('is-target-work');target.scrollIntoView({behavior:'smooth',block:'center'});},30);}
  } else if(initialArtist)setMustseePanel('artists',false); else if(['japan','overseas','upcoming','artists'].includes(initialHash))setMustseePanel(initialHash,false); else setMustseePanel('japan',false);

  // Exhibition page: current / planned / archive are decided from local calendar dates.
  // End dates are inclusive: an item moves to the archive on the following day.
  const exhibitionToday = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();
  const hasPassed = date => Boolean(date) && String(date) < exhibitionToday;
  const guideMeta = window.EXHIBITION_GUIDES || {};
  const pastExhibitionMap = new Map();
  const addPastExhibition = entry => {
    if (!entry || !entry.title) return;
    const key = entry.title;
    const current = pastExhibitionMap.get(key);
    if (!current || String(entry.date || '') >= String(current.date || '')) pastExhibitionMap.set(key, entry);
  };

  // "生で見たい作品"来日展：会期終了後は archive へ。
  const comingExRoot=document.querySelector('[data-exhibition-upcoming]');
  if(comingExRoot&&window.MUSTSEE_DATA?.upcoming?.works){
    const imageMap=window.MUSTSEE_IMAGES||{};
    const lifeIds=new Set(['jpvisit-001','jpvisit-002','jpvisit-011','jpvisit-012']);
    const groups=new Map();
    [...window.MUSTSEE_DATA.upcoming.works].sort((a,b)=>(a.start||'').localeCompare(b.start||'')).forEach(w=>{const key=w.exhibition||'展覧会'; if(!groups.has(key))groups.set(key,[]); groups.get(key).push(w);});
    comingExRoot.innerHTML='';
    groups.forEach((works,title)=>{
      const first=works[0];
      const groupEnd=works.map(w=>w.end||'').filter(Boolean).sort().at(-1)||first.end||'';
      if(hasPassed(groupEnd)){
        const thumbWork=works.find(w=>trustedMustseeImage(imageMap[w.id]))||works[0];
        addPastExhibition({title,date:groupEnd,label:'会期終了',venue:first.venue||'',note:'「生で見たい作品」が来日した展覧会',image:trustedMustseeImage(imageMap[thumbWork.id])?imageMap[thumbWork.id].src:'',url:first.url||''});
        return;
      }
      const card=document.createElement('article'); card.className='coming-exhibition-card';
      const featured=works.filter(w=>lifeIds.has(w.id));
      const thumbWork=featured[0]||works.find(w=>trustedMustseeImage(imageMap[w.id]))||works[0];
      const info=imageMap[thumbWork.id]||{};
      const img=trustedMustseeImage(info)?`<div class="coming-exhibition-media"><img src="${esc(info.src)}" alt="${esc(thumbWork.work)}" loading="lazy"></div>`:'';
      const list=works.map(w=>{const ad=artistDetailFor(w.artist);const ah=ad?`artist.html?artist=${encodeURIComponent(ad.slug)}`:`mustsee.html?artist=${encodeURIComponent(w.artist)}#artists`;return `<li class="${lifeIds.has(w.id)?'is-lifetime':''}">${lifeIds.has(w.id)?'<span>LIFETIME LIST</span>':''}<b>${esc(w.work)}</b><small><a href="${ah}">${esc(w.artist)}</a></small></li>`;}).join('');
      const exhibitionDetail=exhibitionDetailFor(title);
      const exhibitionDetailLink=exhibitionDetail?`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(exhibitionDetail.slug)}">見どころを読む →</a>`:'';
      const upcomingListLink=`<a href="mustsee.html?upcoming=${encodeURIComponent(first.id)}#upcoming">来日作品を見る →</a>`;
      card.innerHTML=`${img}<div class="coming-exhibition-body"><div class="coming-exhibition-date">${esc(first.start||'')} — ${esc(first.end||'')}</div><h3>${esc(title)}</h3><p>${esc(first.venue||'')}</p>${featured.length?`<div class="lifetime-coming-badge">人生で生で見たい作品 ${featured.length}点</div>`:''}<ul>${list}</ul><div class="coming-exhibition-actions">${exhibitionDetailLink}${upcomingListLink}${first.url?`<a href="${esc(first.url)}" target="_blank" rel="noopener">展覧会公式 ↗</a>`:''}</div></div>`;
      applyVerifiedImageFallback(card.querySelector('.coming-exhibition-media img'), info);
      comingExRoot.appendChild(card);
    });
    if(!comingExRoot.children.length) comingExRoot.innerHTML='<div class="empty-state" style="grid-column:1/-1">現在、掲載中の来日予定作品はありません。終了した展覧会は下の「過去の展覧会」に移動します。</div>';
  }

  // 旅先予定：予定日当日まではここ。翌日から archive へ。
  const travelRoot=document.querySelector('[data-travel-exhibitions]');
  if(travelRoot){
    const plans=Array.isArray(window.TRAVEL_EXHIBITIONS)?window.TRAVEL_EXHIBITIONS:[];
    travelRoot.innerHTML='';
    plans.forEach(plan=>{
      const art=items.find(x=>x.category==='exhibitions'&&x.title===plan.galleryTitle);
      if(hasPassed(plan.visitDate)){
        addPastExhibition({title:plan.title,date:plan.visitDate,label:`旅先予定 ${plan.date}`,venue:plan.area||'',note:plan.note||'',item:art||null});
        return;
      }
      const card=document.createElement('article'); card.className='travel-exhibition-card';
      const detail=Object.values(window.EXHIBITION_DETAIL_DATA||{}).find(d=>normalize(d.title)===normalize(plan.title));
      const travelThumb=detail?.thumbnail || (art?assetPath(art.thumb||art.web):'');
      const media=art?(detail?`<a class="travel-exhibition-media" href="exhibition-detail.html?exhibition=${encodeURIComponent(detail.slug)}"><img src="${esc(travelThumb)}" alt="${esc(plan.title)} 公式ビジュアル" loading="lazy"></a>`:`<button type="button" class="travel-exhibition-media"><img src="${assetPath(art.thumb||art.web)}" alt="${esc(plan.title)}" loading="lazy"></button>`):'';
      const action=detail?`<a class="travel-note-link" href="exhibition-detail.html?exhibition=${encodeURIComponent(detail.slug)}">見どころを読む →</a>`:(art?'<button type="button" class="travel-note-link">予習ノートを見る →</button>':'');
      card.innerHTML=`${media}<div class="travel-date"><strong>${esc(plan.date)}</strong><span>${esc(plan.area)}</span></div><h3>${esc(plan.title)}</h3><p>${esc(plan.note||'')}</p>${action}`;
      if(art&&!detail)card.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>openModal(art,'旅先で見る予定')));
      travelRoot.appendChild(card);
    });
    if(!travelRoot.children.length) travelRoot.innerHTML='<div class="empty-state" style="grid-column:1/-1">現在登録している旅先の予定はありません。過ぎた予定は「過去の展覧会」に移動しています。</div>';
  }

  // その他、気になる展覧会：会期終了済みを除外。
  const interestRoot=document.querySelector('[data-exhibition-interests]');
  if(interestRoot){
    const travelTitles=new Set((window.TRAVEL_EXHIBITIONS||[]).map(x=>x.galleryTitle));
    const source=items.filter(x=>x.category==='exhibitions'&&!travelTitles.has(x.title)&&!hasPassed(guideMeta[x.title]?.end));
    interestRoot.innerHTML='';
    source.forEach(x=>interestRoot.appendChild(makeArtCard(x)));
    if(!source.length) interestRoot.innerHTML='<div class="empty-state" style="grid-column:1/-1">現在「気になる」に置いている展覧会はありません。</div>';
  }

  // 展覧会ガイド：会期終了日の翌日に archive へ。
  const guideRoot=document.querySelector('[data-exhibition-guides]');
  if(guideRoot){
    const exhibitionItems=items.filter(x=>x.category==='exhibitions');
    const active=[];
    exhibitionItems.forEach(item=>{
      const meta=guideMeta[item.title]||{};
      if(hasPassed(meta.end)) addPastExhibition({title:item.title,date:meta.end,label:'会期終了',venue:meta.venue||'',note:'展覧会ガイド',item});
      else active.push(item);
    });
    guideRoot.innerHTML='';
    active.forEach(x=>guideRoot.appendChild(makeArtCard(x)));
    if(!active.length) guideRoot.innerHTML='<div class="empty-state" style="grid-column:1/-1">現在表示する展覧会ガイドはありません。終了分は下のアーカイブへ移動しています。</div>';
  }

  // 過去の展覧会：各セクションから自動で集約。新しいものを先に表示。
  const pastRoot=document.querySelector('[data-past-exhibitions]');
  if(pastRoot){
    const past=[...pastExhibitionMap.values()].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    pastRoot.innerHTML='';
    past.forEach(entry=>{
      const card=document.createElement('article'); card.className='past-exhibition-card';
      let media='';
      if(entry.item){
        const pastDetail=Object.values(window.EXHIBITION_DETAIL_DATA||{}).find(d=>normalize(d.title)===normalize(entry.title));
        const pastThumb=pastDetail?.thumbnail || assetPath(entry.item.thumb||entry.item.web);
        media=`<button type="button" class="past-exhibition-media"><img src="${esc(pastThumb)}" alt="${esc(entry.title)}${pastDetail?.thumbnail?' 公式ビジュアル':''}" loading="lazy"></button>`;
      }else if(entry.image){
        media=`<div class="past-exhibition-media"><img src="${esc(entry.image)}" alt="${esc(entry.title)}" loading="lazy"></div>`;
      }
      const detail=Object.values(window.EXHIBITION_DETAIL_DATA||{}).find(d=>normalize(d.title)===normalize(entry.title));
      const detailLink=detail?`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(detail.slug)}">見どころを読む →</a>`:'';
      card.innerHTML=`${media}<div class="past-exhibition-body"><div class="past-exhibition-status">${esc(entry.label||'PAST')}</div><h3>${esc(entry.title)}</h3>${entry.venue?`<p class="past-exhibition-venue">${esc(entry.venue)}</p>`:''}${entry.note?`<p>${esc(entry.note)}</p>`:''}${entry.date?`<div class="past-exhibition-date">${esc(entry.date)}</div>`:''}${detailLink}${entry.url?`<a href="${esc(entry.url)}" target="_blank" rel="noopener">公式情報 ↗</a>`:''}</div>`;
      if(entry.item&&!detail) card.querySelector('.past-exhibition-media')?.addEventListener('click',()=>openModal(entry.item,'過去の展覧会'));
      if(entry.item&&detail){const m=card.querySelector('.past-exhibition-media'); if(m){const a=document.createElement('a');a.href=`exhibition-detail.html?exhibition=${encodeURIComponent(detail.slug)}`;a.className=m.className;a.innerHTML=m.innerHTML;m.replaceWith(a);}}
      pastRoot.appendChild(card);
    });
    if(!past.length) pastRoot.innerHTML='<div class="empty-state" style="grid-column:1/-1">会期や旅先予定が過ぎた展覧会は、自動でここに移ります。</div>';
  }

  // Artists page: connect artist note, life note, and lifetime works.
  // v2.39: split the directory into Western / Japanese artists while keeping one shared renderer.
  const artistProfileRoots=[...document.querySelectorAll('[data-artist-directory]')];
  if(artistProfileRoots.length){
    const artistNotes=items.filter(x=>x.category==='artists');
    const lifeNotes=new Map(items.filter(x=>x.category==='lives').map(x=>[x.title,x]));
    const counts=new Map(); collectLifetimeWorks().forEach(w=>counts.set(w.artist,(counts.get(w.artist)||0)+1));
    const detailEntries=Object.values(window.ARTIST_DETAIL_DATA||{});
    const normalizeArtistName=s=>String(s||'').normalize('NFKC').toLowerCase();
    const detailFor=name=>detailEntries.find(d=>(d.aliases||[]).some(a=>normalizeArtistName(a)===normalizeArtistName(name)) || normalizeArtistName(d.shortName)===normalizeArtistName(name));
    const lifetimeWorks=collectLifetimeWorks();
    const japaneseArtists=new Set(['歌川広重','葛飾北斎','喜多川歌麿','歌川国芳','河鍋暁斎','葛飾応為','尾形光琳']);
    const rootFor=note=>{
      const detail=detailFor(note.title);
      const group=detail?.region==='japanese' || japaneseArtists.has(note.title) ? 'japanese' : 'western';
      return artistProfileRoots.find(r=>r.dataset.artistDirectory===group) || artistProfileRoots[0];
    };

    artistNotes.forEach(note=>{
      const detail=detailFor(note.title); const life=lifeNotes.get(note.title); const count=counts.get(note.title)||0;
      const card=document.createElement('article'); card.className=`artist-profile-card${detail?' has-detail':''}`;
      let media;
      if(detail){
        media=document.createElement('a'); media.href=`artist.html?artist=${encodeURIComponent(detail.slug)}`; media.className='artist-profile-media'; media.setAttribute('aria-label',`${note.title}のHTML解説を読む`);
        const artistName=detail.lifetimeArtist || detail.shortName || note.title;
        const excluded=new Set(detail.excludeImageIds || []);
        const artwork=lifetimeWorks.find(w=>w.artist===artistName && w.id===detail.heroWorkId && w.image && !excluded.has(w.id)) || lifetimeWorks.find(w=>w.artist===artistName && w.image && !excluded.has(w.id));
        const cardImage=detail.cardImage ? { src: detail.cardImage } : (artwork?.image?.src ? artwork.image : null);
        const cardTitle=detail.cardTitle || artwork?.work || detail.heroFallbackTitle || note.title;
        if(cardImage?.src){
          media.classList.add('is-artwork');
          media.innerHTML=`<img src="${esc(cardImage.src)}" alt="${esc(artistName+' '+cardTitle)}" loading="lazy"><span class="artist-profile-art-caption">${esc(cardTitle)}</span>`;
          if(artwork?.image?.src && cardImage.src === artwork.image.src) applyVerifiedImageFallback(media.querySelector('img'), artwork.image);
        }else{
          media.classList.add('is-artwork-missing');
          const targetTitle=detail.heroWorkId ? (lifetimeWorks.find(w=>w.id===detail.heroWorkId)?.work || detail.heroFallbackTitle || note.title) : (detail.heroFallbackTitle || note.title);
          media.innerHTML=`<div class="artist-profile-art-placeholder"><span>ARTWORK</span><strong>${esc(targetTitle)}</strong><small>掲載確認できた作品画像を追加予定</small></div>`;
        }
      }
      else {
        media=document.createElement('button'); media.type='button'; media.className='artist-profile-media'; media.addEventListener('click',()=>openModal(note,'どんな画家？'));
        media.innerHTML=`<img src="${assetPath(note.thumb||note.web)}" alt="${esc(note.title)}" loading="lazy">`;
      }
      const body=document.createElement('div'); body.className='artist-profile-body';
      const primary=detail?`<a class="artist-detail-link" href="artist.html?artist=${encodeURIComponent(detail.slug)}">HTMLで読む →</a><button type="button" data-open-profile>1枚まとめを見る</button>`:`<button type="button" data-open-profile>どんな画家？</button>`;
      const lifeAction=life ? (detail?.lifeSlug ? `<a href="artist-life.html?artist=${encodeURIComponent(detail.lifeSlug)}">どんな人生？ →</a>` : '<button type="button" data-open-life>どんな人生？</button>') : '';
      body.innerHTML=`<div class="artist-profile-kicker">${detail?'ARTIST · HTML':'ARTIST'}</div><h2>${esc(note.title)}</h2><div class="artist-profile-actions">${primary}${lifeAction}${count?`<a href="mustsee.html?artist=${encodeURIComponent(note.title)}#artists">生で見たい作品 ${count}点 →</a>`:''}</div>`;
      body.querySelector('[data-open-profile]')?.addEventListener('click',()=>openModal(note,'どんな画家？'));
      if(life && !detail?.lifeSlug)body.querySelector('[data-open-life]')?.addEventListener('click',()=>openModal(life,'どんな人生？'));
      card.append(media,body); rootFor(note).appendChild(card);
    });
  }


})();

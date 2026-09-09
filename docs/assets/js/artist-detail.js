(() => {
  const root = document.querySelector('[data-artist-detail]');
  if (!root) return;
  const data = window.ARTIST_DETAIL_DATA || {};
  const params = new URL(location.href).searchParams;
  const requested = (params.get('artist') || 'monet').trim();
  const normalize = s => String(s || '').normalize('NFKC').toLowerCase();
  const entry = Object.values(data).find(x => x.slug === requested || (x.aliases || []).some(a => normalize(a) === normalize(requested))) || data.monet;
  if (!entry) return;

  const q = sel => root.querySelector(sel);
  const setText = (sel, value) => { const el=q(sel); if(el) el.textContent=value || ''; };
  setText('[data-artist-eyebrow]', entry.eyebrow);
  setText('[data-artist-years]', entry.years);
  setText('[data-artist-title]', entry.title);
  setText('[data-artist-tagline]', entry.tagline);
  setText('[data-artist-intro]', entry.intro);
  setText('[data-representative-heading]', `${entry.representative?.title || ''}から見る、${entry.shortName || entry.name}らしさ`);
  setText('[data-representative-copy]', entry.representative?.copy);
  setText('[data-traits-title]', `${entry.shortName || entry.name}らしさ 3つ`);
  setText('[data-artist-mantra]', entry.mantra);
  setText('[data-artist-closing]', entry.closing);
  setText('[data-lifetime-heading]', `${entry.shortName || entry.name}を、生で見る。`);
  setText('[data-lifetime-lead]', entry.lifetimeLead || '実物でしか分からない大きさ、絵の具、筆触を見る。');

  const original=q('[data-original-summary]');
  if(original){ original.src=entry.originalSummary || ''; original.alt=`${entry.shortName || entry.name}ってどんな画家？ 1枚まとめ`; }

  const traits=q('[data-artist-traits]');
  if(traits){ traits.innerHTML=''; (entry.traits||[]).forEach(t=>{const li=document.createElement('li'); li.textContent=t; traits.appendChild(li);}); }

  const viewpoints=q('[data-artist-viewpoints]');
  if(viewpoints){ viewpoints.innerHTML=''; (entry.viewpoints||[]).forEach(v=>{const card=document.createElement('article'); card.className='artist-viewpoint-card'; card.innerHTML=`<div class="artist-viewpoint-no">${v.no}</div><h3>${v.title}</h3><dl><div><dt>どこを見るか</dt><dd>${v.where}</dd></div><div><dt>どう見るか</dt><dd>${v.how}</dd></div><div class="artist-viewpoint-insight"><dt>気づき</dt><dd>${v.insight}</dd></div></dl>`; viewpoints.appendChild(card);}); }

  const steps=q('[data-artist-steps]');
  if(steps){ steps.innerHTML=''; (entry.steps||[]).forEach(s=>{const card=document.createElement('article'); card.className='artist-step-card'; card.innerHTML=`<div class="artist-step-no">${s.no}</div><div><h3>${s.title}</h3><p>${s.copy}</p></div>`; steps.appendChild(card);}); }

  const artistName=entry.lifetimeArtist || entry.shortName || entry.name;
  const compact=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s　「」『』《》〈〉()（）［］【】・･.,，。、:：;；!！?？'"“”‘’\-–—―]/g,'');
  const artistNames=[entry.name,entry.shortName,...(entry.aliases||[])].map(compact).filter(Boolean);
  const sameArtistName=name=>{const key=compact(name);return !!key&&artistNames.some(n=>n===key||(Math.min(n.length,key.length)>=3&&(n.includes(key)||key.includes(n))));};
  const exhibitionDetailFor=title=>{const key=compact(title);return Object.values(window.EXHIBITION_DETAIL_DATA||{}).find(d=>compact(d.title)===key)||null;};
  const sameWork=(a,b)=>{const x=compact(a),y=compact(b);return !!x&&!!y&&(x===y||(Math.min(x.length,y.length)>=5&&(x.includes(y)||y.includes(x))));};
  const upcomingWorks=(window.MUSTSEE_DATA?.upcoming?.works||[]).filter(w=>sameArtistName(w.artist));
  const lifeLink=q('[data-artist-life-link]');
  if(lifeLink){ if(entry.lifeSlug){ lifeLink.href=`artist-life.html?artist=${encodeURIComponent(entry.lifeSlug)}`; lifeLink.hidden=false; } else { lifeLink.hidden=true; } }
  const lifetimeLink=q('[data-lifetime-link]'); const lifetimeMore=q('[data-lifetime-more]');
  const href=`mustsee.html?artist=${encodeURIComponent(artistName)}#artists`;
  if(lifetimeLink) lifetimeLink.href=href;
  if(lifetimeMore){ lifetimeMore.href=href; lifetimeMore.textContent=`${artistName}の「人生で生で見たい作品」をすべて見る →`; }

  function collectWorks(){
    const src=window.MUSTSEE_DATA || {}; const images=window.MUSTSEE_IMAGES || {}; const works=[];
    ['japan','overseas'].forEach(scope=>{
      (src[scope]?.museums || []).forEach(m=>{
        (m.works || []).forEach(w=>{
          if(w.artist!==artistName) return;
          works.push({...w,scope,museum:m.museum,location:m.location||m.prefecture||m.country||'',image:images[w.id]||null});
        });
      });
    });
    return works.sort((a,b)=>Number(!!b.priority)-Number(!!a.priority) || Number(!!b.image)-Number(!!a.image) || (a.no||999)-(b.no||999));
  }

  const allWorks=collectWorks();
  const excludedImages=new Set(entry.excludeImageIds || []);
  const heroWork=allWorks.find(w=>w.id===entry.heroWorkId) || allWorks.find(w=>w.image && !excludedImages.has(w.id)) || allWorks[0];
  const heroImage=(heroWork?.image && !excludedImages.has(heroWork.id)) ? heroWork.image : null;
  const heroFallbackImage=entry.heroFallbackImage ? (typeof entry.heroFallbackImage === 'string' ? { src: entry.heroFallbackImage } : entry.heroFallbackImage) : null;
  const displayHeroImage = heroImage?.src ? heroImage : (heroFallbackImage?.src ? heroFallbackImage : null);
  const displayHeroTitle = heroWork?.work || entry.heroFallbackTitle || entry.representative?.title || '人生で生で見たい作品';
  const displayHeroMuseum = heroWork?.museum || entry.heroFallbackMuseum || '';
  const hero=q('[data-artist-hero]');
  const heroPlaceholder=q('[data-artist-hero-placeholder]');
  const heroMedia=q('[data-artist-hero-media]');
  setText('[data-hero-work-title]', displayHeroTitle);
  setText('[data-hero-work-museum]', displayHeroMuseum);
  if(displayHeroImage?.src){
    if(hero){ hero.src=displayHeroImage.src; hero.alt=`${entry.name} ${displayHeroTitle}`; hero.hidden=false; }
    if(heroPlaceholder) heroPlaceholder.hidden=true;
    if(heroMedia) heroMedia.classList.remove('is-placeholder');
  } else {
    if(hero){ hero.removeAttribute('src'); hero.hidden=true; }
    if(heroPlaceholder){ heroPlaceholder.hidden=false; setText('[data-hero-placeholder-title]', displayHeroTitle || `${artistName}の生で見たい作品`); }
    if(heroMedia) heroMedia.classList.add('is-placeholder');
  }

  const lifetime=q('[data-artist-lifetime]');
  if(lifetime){
    lifetime.innerHTML='';
    const excluded=new Set(entry.excludeImageIds || []);
    const works=allWorks.filter(w=>w.image && !excluded.has(w.id)).slice(0,6);
    if(!works.length){
      const empty=document.createElement('div'); empty.className='artist-lifetime-empty';
      empty.innerHTML=`<strong>${artistName}の作品画像は現在掲載していません。</strong><p>「人生で生で見たい作品」には作品名・所蔵先・見るポイントを掲載しています。画像は掲載可能と確認できたものだけ追加します。</p>`;
      lifetime.appendChild(empty);
    } else {
      works.forEach(w=>{
        const card=document.createElement('article'); card.className='artist-lifetime-card';
        const upcoming=upcomingWorks.find(u=>sameWork(w.work,u.work));
        const exDetail=upcoming?exhibitionDetailFor(upcoming.exhibition):null;
        const workHref=`mustsee.html?work=${encodeURIComponent(w.id)}#${w.scope}`;
        const exLink=upcoming?(exDetail?`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(exDetail.slug)}">この作品が見られる展覧会 →</a>`:`<a href="mustsee.html#upcoming">来日予定を見る →</a>`):'';
        card.innerHTML=`<a class="artist-lifetime-media" href="${w.image.sourceUrl || w.image.src}" target="_blank" rel="noopener"><img src="${w.image.src}" alt="${w.artist} ${w.work}" loading="lazy"></a><div class="artist-lifetime-body"><div class="artist-lifetime-meta">${w.scope==='japan'?'日本':'海外'}｜${w.museum}</div><h3>${w.work}</h3><p>${w.point || ''}</p>${Array.isArray(w.guides)&&w.guides.length?`<details><summary>3つのヒントを先に見る</summary><ol>${w.guides.map(g=>`<li>${g}</li>`).join('')}</ol></details>`:''}<div class="artist-lifetime-links"><a href="artwork-guide.html?work=${encodeURIComponent(w.id)}">絵を見るヒント →</a><a href="${workHref}">作品リストで見る →</a>${exLink}</div></div>`;
        lifetime.appendChild(card);
      });
    }
  }


  const exhibitionRoot=q('[data-artist-exhibitions]');
  if(exhibitionRoot){
    const today=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;})();
    const imageMap=window.MUSTSEE_IMAGES||{};
    const guideMeta=window.EXHIBITION_GUIDES||{};
    const related=new Map();
    const add=(title,payload={})=>{
      if(!title) return;
      const key=compact(title);
      const current=related.get(key)||{title,works:[]};
      related.set(key,{...current,...payload,title,works:[...(current.works||[]),...(payload.works||[])]});
    };
    Object.values(window.EXHIBITION_DETAIL_DATA||{}).filter(d=>d.relatedArtist===entry.slug).forEach(d=>{
      const meta=guideMeta[d.title]||{};
      if(meta.end && meta.end<today) return;
      add(d.title,{detail:d,start:meta.start||'',end:meta.end||'',venue:meta.venue||'',thumbnail:d.thumbnail||d.hero||''});
    });
    const grouped=new Map();
    upcomingWorks.forEach(w=>{const key=compact(w.exhibition);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(w);});
    grouped.forEach(works=>{
      const first=works[0], detail=exhibitionDetailFor(first.exhibition), meta=guideMeta[first.exhibition]||{};
      const imageWork=works.find(w=>imageMap[w.id]?.src);
      add(first.exhibition,{detail,start:first.start||meta.start||'',end:first.end||meta.end||'',venue:first.venue||meta.venue||'',thumbnail:detail?.thumbnail||imageMap[imageWork?.id]?.src||'',url:first.url||'',works});
    });
    const list=[...related.values()].filter(x=>!x.end||x.end>=today).sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999'));
    exhibitionRoot.innerHTML='';
    if(!list.length){
      exhibitionRoot.innerHTML='<div class="artist-exhibition-empty">現在、この画家に関連づけている開催中・予定の展覧会はありません。</div>';
    } else list.forEach(ex=>{
      const status=ex.start&&ex.start>today?'これから':'開催中';
      const card=document.createElement('article');card.className='artist-exhibition-card';
      const media=ex.thumbnail?`<div class="artist-exhibition-media"><img src="${ex.thumbnail}" alt="${ex.title}" loading="lazy"></div>`:'<div class="artist-exhibition-media is-empty"><span>EXHIBITION</span></div>';
      const period=[ex.start,ex.end].filter(Boolean).join(' — ');
      const workList=(ex.works||[]).map(w=>`<li>${w.work}</li>`).join('');
      const actions=[];
      if(ex.detail) actions.push(`<a href="exhibition-detail.html?exhibition=${encodeURIComponent(ex.detail.slug)}">見どころを読む →</a>`);
      if(ex.works?.length) actions.push(`<a href="mustsee.html?upcoming=${encodeURIComponent(ex.works[0].id)}#upcoming">来日作品を見る →</a>`);
      if(ex.url) actions.push(`<a href="${ex.url}" target="_blank" rel="noopener">公式情報 ↗</a>`);
      card.innerHTML=`${media}<div class="artist-exhibition-body"><div class="artist-exhibition-status">${status}</div><h3>${ex.title}</h3>${period?`<p class="artist-exhibition-period">${period}</p>`:''}${ex.venue?`<p class="artist-exhibition-venue">${ex.venue}</p>`:''}${workList?`<ul>${workList}</ul>`:''}<div class="artist-exhibition-actions">${actions.join('')}</div></div>`;
      exhibitionRoot.appendChild(card);
    });
  }

  // SEO: 画家ごとに検索結果・SNSシェアの情報を最適化する。
  const seoName=entry.shortName||entry.name;
  const seoTitle=`${seoName}ってどんな画家？特徴・代表作・見るポイント｜答え合わせ美術部`;
  const desc=`${entry.name}（${entry.years}）の特徴を初心者向けに解説。「${entry.tagline}」を手がかりに、代表作、3つの見るポイント、実物で確かめたいところを紹介します。`;
  const canonical=`https://hillslife.tokyo/art/artist.html?artist=${encodeURIComponent(entry.slug)}`;
  const seoImage=displayHeroImage?.src?new URL(displayHeroImage.src,location.href).href:'';
  document.title=seoTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content',desc);
  let canonicalLink=document.querySelector('link[rel="canonical"]');
  if(!canonicalLink){canonicalLink=document.createElement('link');canonicalLink.rel='canonical';document.head.appendChild(canonicalLink);}
  canonicalLink.href=canonical;
  const setProp=(name,value)=>document.querySelector(`meta[property="${name}"]`)?.setAttribute('content',value||'');
  const setName=(name,value)=>document.querySelector(`meta[name="${name}"]`)?.setAttribute('content',value||'');
  setProp('og:title',seoTitle); setProp('og:description',desc); setProp('og:url',canonical);
  setProp('og:image',seoImage); setProp('og:image:alt',seoImage?`${entry.name}の代表作品`:'');
  setName('twitter:title',seoTitle); setName('twitter:description',desc); setName('twitter:image',seoImage);
})();

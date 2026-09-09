(() => {
  const root=document.querySelector('[data-exhibition-detail]'); if(!root) return;
  const data=window.EXHIBITION_DETAIL_DATA||{};
  const requested=(new URL(location.href).searchParams.get('exhibition')||'van-gogh').trim();
  const entry=data[requested]||Object.values(data)[0]; if(!entry) return;
  const q=s=>root.querySelector(s); const set=(s,v)=>{const el=q(s); if(el)el.textContent=v||'';};
  const compact=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s　「」『』《》〈〉()（）［］【】・･.,，。、:：;；!！?？'"“”‘’\-–—―]/g,'');
  const artistDetailFor=name=>{const key=compact(name);return Object.values(window.ARTIST_DETAIL_DATA||{}).find(d=>[d.name,d.shortName,...(d.aliases||[])].map(compact).some(n=>n===key||(Math.min(n.length,key.length)>=3&&(n.includes(key)||key.includes(n)))))||null;};
  const sameArtist=(a,b)=>{const da=artistDetailFor(a),db=artistDetailFor(b);if(da&&db)return da.slug===db.slug;const x=compact(a),y=compact(b);return !!x&&!!y&&(x===y||(Math.min(x.length,y.length)>=3&&(x.includes(y)||y.includes(x))));};
  const sameWork=(a,b)=>{const x=compact(a),y=compact(b);return !!x&&!!y&&(x===y||(Math.min(x.length,y.length)>=5&&(x.includes(y)||y.includes(x))));};
  const meta=window.EXHIBITION_GUIDES?.[entry.title]||{};
  // v2.77: detailed exhibition guides always expose the official exhibition page when known.
  // Priority: explicit entry URL -> matching coming-to-Japan record -> official thumbnail source.
  const matchingUpcoming=(window.MUSTSEE_DATA?.upcoming?.works||[]).find(w=>compact(w.exhibition)===compact(entry.title)&&/^https:\/\//i.test(w.url||''));
  const officialUrl=entry.officialUrl||matchingUpcoming?.url||(/^https:\/\//i.test(entry.thumbnailSource||'')?entry.thumbnailSource:'');
  const officialLink=q('[data-exhibition-official-link]');
  if(officialLink&&officialUrl){officialLink.href=officialUrl;officialLink.hidden=false;}
  else if(officialLink){officialLink.hidden=true;}
  set('[data-exhibition-eyebrow]',entry.eyebrow||'EXHIBITION GUIDE'); set('[data-exhibition-title]',entry.title); set('[data-exhibition-tagline]',entry.tagline); set('[data-exhibition-intro]',entry.intro);
  const period=[meta.start,meta.end].filter(Boolean).join(' — '); set('[data-exhibition-period]',period); set('[data-exhibition-venue]',meta.venue?`｜ ${meta.venue}`:'');
  const hero=q('[data-exhibition-hero]');
  const heroImage=entry.thumbnail||entry.hero;
  if(hero){
    hero.src=heroImage;
    hero.alt=entry.thumbnail?`${entry.title} 公式ビジュアル`:`${entry.title} 見どころ`;
  }
  set('[data-exhibition-hero-caption]',entry.title);
  const comparisonSection=q('[data-exhibition-comparison-section]');
  const comparisonRoot=q('[data-exhibition-comparison]');
  const comparisonLink=q('[data-exhibition-comparison-link]');
  if(comparisonSection&&comparisonRoot&&entry.comparison?.rows?.length){
    const [leftLead,rightLead]=entry.comparison.lead||[];
    comparisonRoot.innerHTML=`${(leftLead||rightLead)?`<div class="exhibition-comparison-lead"><p>${leftLead||''}</p><p>${rightLead||''}</p></div>`:''}<div class="exhibition-comparison-table-wrap"><table class="exhibition-comparison-table"><thead><tr><th>見るところ</th><th>北斎</th><th>広重</th></tr></thead><tbody>${entry.comparison.rows.map(row=>`<tr><th>${row[0]||''}</th><td>${row[1]||''}</td><td>${row[2]||''}</td></tr>`).join('')}</tbody></table></div>`;
    comparisonSection.hidden=false;
    if(comparisonLink) comparisonLink.hidden=false;
  }
  const highlights=q('[data-exhibition-highlights]'); if(highlights){highlights.innerHTML='';(entry.highlights||[]).forEach(([title,copy],i)=>{const card=document.createElement('article');card.className='exhibition-highlight-card';card.innerHTML=`<div class="exhibition-detail-no">0${i+1}</div><h3>${title}</h3><p>${copy}</p>`;highlights.appendChild(card);});}
  const must=q('[data-exhibition-mustsee]'); if(must){must.innerHTML='';(entry.mustSee||[]).forEach(([title,copy],i)=>{const card=document.createElement('article');card.className='exhibition-mustsee-card';card.innerHTML=`<div class="exhibition-mustsee-kicker">${String(i+1).padStart(2,'0')}</div><h3>${title}</h3><p>${copy}</p>`;must.appendChild(card);});}
  const order=q('[data-exhibition-order]'); if(order){order.innerHTML='';(entry.order||[]).forEach((copy,i)=>{const li=document.createElement('li');li.innerHTML=`<span>${i+1}</span><p>${copy}</p>`;order.appendChild(li);});}
  set('[data-exhibition-mantra]',entry.mantra);
  const summarySection=q('.exhibition-summary-section');
  const summary=q('[data-exhibition-summary]');
  if(summary&&entry.summary){
    summary.src=entry.summary;summary.alt=`${entry.title} 1枚まとめ`;
    if(summarySection)summarySection.hidden=false;
  }else if(summarySection){
    summarySection.hidden=true;
  }
  const relatedActions=q('[data-related-artist-actions]');
  const relatedArtistSlugs=Array.isArray(entry.relatedArtists)&&entry.relatedArtists.length?entry.relatedArtists:(entry.relatedArtist?[entry.relatedArtist]:[]);
  if(relatedActions&&relatedArtistSlugs.length){
    const links=[];
    relatedArtistSlugs.forEach(slug=>{
      const artist=Object.values(window.ARTIST_DETAIL_DATA||{}).find(d=>d.slug===slug);
      if(!artist) return;
      const artistName=artist.lifetimeArtist||artist.shortName||artist.name;
      links.push(`<a href="artist.html?artist=${encodeURIComponent(artist.slug)}">${artist.shortName||artist.name}を知る →</a>`);
      links.push(`<a href="mustsee.html?artist=${encodeURIComponent(artistName)}#artists">${artist.shortName||artist.name}の生で見たい作品 →</a>`);
    });
    relatedActions.innerHTML=links.join('');
  }

  // v2.72: 展覧会ページから代表作品のインタラクティブ鑑賞へ直接つなぐ。
  const featuredSection=q('[data-exhibition-featured-section]');
  const featuredRoot=q('[data-exhibition-featured]');
  if(featuredSection&&featuredRoot&&entry.featuredWork){
    const lifetime=[];
    ['japan','overseas'].forEach(scope=>(window.MUSTSEE_DATA?.[scope]?.museums||[]).forEach(m=>(m.works||[]).forEach(w=>lifetime.push({...w,scope,museum:m.museum||''}))));
    const work=lifetime.find(w=>w.id===entry.featuredWork);
    const image=(window.MUSTSEE_IMAGES||{})[entry.featuredWork];
    const visual=(window.ARTWORK_VISUAL_HINTS||{})[entry.featuredWork];
    if(work&&image?.src&&visual?.hints?.length===3){
      const hints=visual.hints.slice(0,3);
      const hintHtml=hints.map((h,i)=>`<a href="artwork-guide.html?work=${encodeURIComponent(work.id)}#three-hints"><b>0${i+1}</b><span>${h.label||`見るポイント${i+1}`}</span><small>${h.copy||work.guides?.[i]||''}</small></a>`).join('');
      featuredRoot.innerHTML=`<a class="exhibition-featured-art-media" href="artwork-guide.html?work=${encodeURIComponent(work.id)}"><img src="${image.src}" alt="${work.artist} ${work.work}" loading="lazy"><span>01 / 02 / 03 を画像で見る ↗</span></a><div class="exhibition-featured-art-copy"><p class="exhibition-featured-art-artist">${work.artist}</p><h3>${work.work}</h3><p class="exhibition-featured-art-point">${visual.point||work.point||''}</p><div class="exhibition-featured-art-hints">${hintHtml}</div><div class="exhibition-featured-art-actions"><a class="home-primary-link" href="artwork-guide.html?work=${encodeURIComponent(work.id)}">インタラクティブ鑑賞を開く →</a><a class="home-text-link" href="mustsee.html?view=overseas&work=${encodeURIComponent(work.id)}#work-${encodeURIComponent(work.id)}">「人生で生で見たい」で見る →</a></div></div>`;
      featuredSection.hidden=false;
    }
  }

  const relatedSection=q('[data-exhibition-related-works-section]');
  const relatedWorksRoot=q('[data-exhibition-related-works]');
  if(relatedSection&&relatedWorksRoot){
    const upcoming=(window.MUSTSEE_DATA?.upcoming?.works||[]).filter(w=>compact(w.exhibition)===compact(entry.title));
    if(upcoming.length){
      const images=window.MUSTSEE_IMAGES||{};
      const lifetime=[];
      ['japan','overseas'].forEach(scope=>(window.MUSTSEE_DATA?.[scope]?.museums||[]).forEach(m=>(m.works||[]).forEach(w=>lifetime.push({...w,scope,museum:m.museum||''}))));
      relatedWorksRoot.innerHTML='';
      upcoming.forEach(w=>{
        const card=document.createElement('article');card.className='exhibition-related-work-card';
        const image=images[w.id];
        const artist=artistDetailFor(w.artist);
        const artistHref=artist?`artist.html?artist=${encodeURIComponent(artist.slug)}`:`mustsee.html?artist=${encodeURIComponent(w.artist)}#artists`;
        const master=lifetime.find(x=>sameArtist(x.artist,w.artist)&&sameWork(x.work,w.work));
        const media=image?.src?`<a class="exhibition-related-work-media" href="${image.sourceUrl||image.src}" target="_blank" rel="noopener"><img src="${image.src}" alt="${w.artist} ${w.work}" loading="lazy"></a>`:'<div class="exhibition-related-work-media is-empty"><span>ARTWORK</span></div>';
        const links=[`<a href="${artistHref}">${artist?'この画家を知る':'同じ画家の作品'} →</a>`,`<a href="mustsee.html?upcoming=${encodeURIComponent(w.id)}#upcoming">来日予定リストで見る →</a>`];
        if(master) links.push(`<a href="mustsee.html?work=${encodeURIComponent(master.id)}#${master.scope}">人生で生で見たい作品 →</a>`);
        card.innerHTML=`${media}<div class="exhibition-related-work-body"><div class="exhibition-related-work-date">${[w.start,w.end].filter(Boolean).join(' — ')}</div><p class="exhibition-related-work-artist"><a href="${artistHref}">${w.artist}</a></p><h3>${w.work}</h3><p>${w.point||''}</p><div class="exhibition-related-work-links">${links.join('')}</div></div>`;
        relatedWorksRoot.appendChild(card);
      });
      relatedSection.hidden=false;
    }
  }
  document.title=`${entry.title} 見どころ｜答え合わせ美術部`;
  const desc=`${entry.title}を「${entry.tagline}」を合言葉に、見どころ・外せない作品・おすすめの順番で予習します。`;
  document.querySelector('meta[name="description"]')?.setAttribute('content',desc);document.querySelector('meta[property="og:title"]')?.setAttribute('content',`${entry.title} 見どころ｜答え合わせ美術部`);document.querySelector('meta[property="og:description"]')?.setAttribute('content',desc);
  const canonical=`https://hillslife.tokyo/art/exhibition-detail.html?exhibition=${encodeURIComponent(entry.slug)}`;let canonicalLink=document.querySelector('link[rel="canonical"]');if(!canonicalLink){canonicalLink=document.createElement('link');canonicalLink.rel='canonical';document.head.appendChild(canonicalLink);}canonicalLink.href=canonical;document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical);
  const socialImage=entry.summary||entry.thumbnail||entry.hero||''; if(socialImage){const absoluteImage=new URL(socialImage,location.href).href;document.querySelector('meta[property="og:image"]')?.setAttribute('content',absoluteImage);document.querySelector('meta[name="twitter:image"]')?.setAttribute('content',absoluteImage);}
})();

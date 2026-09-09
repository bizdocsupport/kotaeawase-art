(() => {
  const root=document.querySelector('[data-artist-life]');
  if(!root) return;
  const data=window.ARTIST_LIFE_DATA||{};
  const requested=(new URL(location.href).searchParams.get('artist')||'vangogh').trim();
  const entry=data[requested]||data.vangogh;
  if(!entry) return;
  const q=s=>root.querySelector(s);
  const set=(s,v)=>{const el=q(s); if(el) el.textContent=v||'';};
  set('[data-life-eyebrow]',entry.eyebrow); set('[data-life-years]',entry.years); set('[data-life-title]',entry.title); set('[data-life-tagline]',entry.tagline); set('[data-life-intro]',entry.intro); set('[data-life-mantra]',entry.mantra); set('[data-life-key-title]',`${entry.shortName}の人生で外せない3点`);
  const artistLink=q('[data-life-artist-link]'); if(artistLink) artistLink.href=`artist.html?artist=${encodeURIComponent(entry.artistSlug)}`;
  const mustsee=q('[data-life-mustsee-link]'); if(mustsee) mustsee.href=`mustsee.html?artist=${encodeURIComponent(entry.shortName)}#artists`;
  const summary=q('[data-life-summary]'); const summaryLarge=q('[data-life-summary-large]');
  [summary,summaryLarge].forEach(img=>{if(img){img.src=entry.originalSummary; img.alt=`${entry.shortName}って、どういう人生？ 1枚まとめ`;}});
  const phases=q('[data-life-phases]');
  if(phases){phases.innerHTML=''; (entry.phases||[]).forEach(p=>{const card=document.createElement('article'); card.className='artist-life-phase'; card.innerHTML=`<div class="artist-life-phase-no">${p.no}</div><div class="artist-life-phase-years">${p.years}</div><div class="artist-life-phase-main"><h3>${p.title}</h3><p>${p.copy}</p>${p.work?`<div class="artist-life-phase-work">代表作｜${p.work}</div>`:''}</div><aside><span>ここで覚える</span><p>${p.memory}</p></aside>`; phases.appendChild(card);});}
  const key=q('[data-life-keypoints]');
  if(key){key.innerHTML=''; (entry.keyPoints||[]).forEach((p,i)=>{const card=document.createElement('article'); card.className='artist-life-key-card'; card.innerHTML=`<div class="artist-life-key-no">${String(i+1).padStart(2,'0')}</div><h3>${p.title}</h3><p>${p.copy}</p>`; key.appendChild(card);});}
  const privateNote=q('[data-life-private-note]'); if(privateNote&&entry.privateNote){privateNote.textContent=entry.privateNote; privateNote.hidden=false;}
  // SEO: 人生ページも画家名・転機・作品変化が検索結果で分かる形にする。
  const seoTitle=`${entry.shortName}の生涯｜転機・代表作・画風の変化｜答え合わせ美術部`;
  const desc=`${entry.name}（${entry.years}）の生涯を初心者向けに紹介。人生の転機と代表作をたどりながら、画風や色・構図がどう変わったかを整理します。`;
  const canonical=`https://hillslife.tokyo/art/artist-life.html?artist=${encodeURIComponent(entry.slug)}`;
  const seoImage=entry.originalSummary?new URL(entry.originalSummary,location.href).href:'';
  document.title=seoTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content',desc);
  let canonicalLink=document.querySelector('link[rel="canonical"]');
  if(!canonicalLink){canonicalLink=document.createElement('link');canonicalLink.rel='canonical';document.head.appendChild(canonicalLink);}
  canonicalLink.href=canonical;
  const setProp=(name,value)=>document.querySelector(`meta[property="${name}"]`)?.setAttribute('content',value||'');
  const setName=(name,value)=>document.querySelector(`meta[name="${name}"]`)?.setAttribute('content',value||'');
  setProp('og:title',seoTitle); setProp('og:description',desc); setProp('og:url',canonical);
  setProp('og:image',seoImage); setProp('og:image:alt',seoImage?`${entry.shortName}の人生まとめ`:'');
  setName('twitter:title',seoTitle); setName('twitter:description',desc); setName('twitter:image',seoImage);
})();

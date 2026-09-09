(() => {
  const root=document.querySelector('[data-history-detail]'); if(!root) return;
  const data=window.HISTORY_DETAIL_DATA||{}; const entries=Object.values(data);
  const requested=(new URL(location.href).searchParams.get('period')||'ancient').trim();
  const entry=data[requested]||entries[0]; if(!entry) return;
  const q=s=>root.querySelector(s); const set=(s,v)=>{const el=q(s); if(el)el.textContent=v||'';};
  set('[data-history-number]',entry.no); set('[data-history-name]',entry.name); set('[data-history-years]',entry.years); set('[data-history-regions]',entry.regions); set('[data-history-tagline]',entry.tagline); set('[data-history-background]',entry.background);
  set('[data-history-work-title]',entry.representative?.title||''); set('[data-history-work-meta]',[entry.representative?.artist,entry.representative?.year,entry.representative?.place].filter(Boolean).join(' ｜ '));
  const hero=q('[data-history-hero]'); if(hero){hero.src=entry.hero; hero.alt=`${entry.name} ${entry.representative?.title||'代表作'}`;}
  const summary=q('[data-history-summary]'); if(summary){summary.src=entry.summary; summary.alt=`${entry.name} 1枚まとめ`;}
  const creators=q('[data-history-creators]'); if(creators){creators.innerHTML=''; (entry.creators||[]).forEach(([name,note])=>{const li=document.createElement('li');li.innerHTML=`<strong>${name}</strong><span>${note}</span>`;creators.appendChild(li);});}
  const traits=q('[data-history-traits]'); if(traits){traits.innerHTML=''; (entry.traits||[]).forEach(([title,copy],i)=>{const card=document.createElement('article');card.className='history-trait-card';card.innerHTML=`<div class="history-trait-no">0${i+1}</div><h3>${title}</h3><p>${copy}</p>`;traits.appendChild(card);});}
  const viewpoints=q('[data-history-viewpoints]'); if(viewpoints){viewpoints.innerHTML=''; (entry.viewpoints||[]).forEach(([title,copy],i)=>{const card=document.createElement('article');card.className='history-look-card';card.innerHTML=`<div class="history-look-no">${i+1}</div><div><h3>${title}</h3><p>${copy}</p></div>`;viewpoints.appendChild(card);});}
  const compact=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s　「」『』《》〈〉()（）［］【】・･.,，。、:：;；!！?？'"“”‘’\-–—―]/g,'');
  const artistEntries=Object.values(window.ARTIST_DETAIL_DATA||{});
  const artistFor=name=>{const key=compact(name);return artistEntries.find(d=>[d.name,d.shortName,...(d.aliases||[])].map(compact).some(n=>n===key||(Math.min(n.length,key.length)>=3&&(n.includes(key)||key.includes(n)))))||null;};
  const imageMap=window.MUSTSEE_IMAGES||{}; const works=[];
  ['japan','overseas'].forEach(scope=>(window.MUSTSEE_DATA?.[scope]?.museums||[]).forEach(m=>(m.works||[]).forEach(w=>works.push({...w,museum:m.museum||'',image:imageMap[w.id]||null}))));
  const sameArtist=(name,d)=>{const key=compact(name);return [d.name,d.shortName,...(d.aliases||[])].map(compact).some(n=>n===key||(Math.min(n.length,key.length)>=3&&(n.includes(key)||key.includes(n))));};
  const relatedNames=[...(entry.creators||[]).map(x=>x[0]),entry.representative?.artist].filter(Boolean); const related=[];
  relatedNames.forEach(name=>{const d=artistFor(name);if(d&&!related.some(x=>x.detail.slug===d.slug)){const ws=works.filter(w=>sameArtist(w.artist,d));related.push({detail:d,works:ws});}});
  const relatedSection=q('[data-history-related-section]'),relatedRoot=q('[data-history-related]');
  if(relatedSection&&relatedRoot&&related.length){relatedSection.hidden=false;relatedRoot.innerHTML='';related.forEach(({detail,works:ws})=>{const imgWork=ws.find(w=>w.image?.src);const a=document.createElement('article');a.className='history-related-card';a.innerHTML=`${imgWork?`<a class="history-related-media" href="artist.html?artist=${encodeURIComponent(detail.slug)}"><img src="${imgWork.image.src}" alt="${detail.shortName} ${imgWork.work}" loading="lazy"></a>`:''}<div class="history-related-body"><span>${entry.name}</span><h3>${detail.shortName}</h3><p>${detail.tagline||''}</p><div><a href="artist.html?artist=${encodeURIComponent(detail.slug)}">この画家を知る →</a>${ws.length?`<a href="mustsee.html?artist=${encodeURIComponent(detail.lifetimeArtist||detail.shortName)}#artists">生で見たい作品 ${ws.length}点 →</a>`:''}</div></div>`;relatedRoot.appendChild(a);});}
  set('[data-history-transition-from]',entry.transition?.from); set('[data-history-transition-to]',entry.transition?.to); set('[data-history-mantra]',entry.mantra);
  const nextLink=q('[data-history-next-link]'); if(nextLink){ if(entry.transition?.nextSlug){nextLink.href=`history-detail.html?period=${entry.transition.nextSlug}`;nextLink.textContent=`${entry.transition.next}へ →`;} else {nextLink.href='history.html';nextLink.textContent='美術史一覧へ →';}}
  const idx=entries.findIndex(x=>x.slug===entry.slug); const prev=entries[idx-1]; const next=entries[idx+1]; const prevA=q('[data-history-prev]'); const nextA=q('[data-history-next]');
  if(prevA){if(prev){prevA.href=`history-detail.html?period=${prev.slug}`;prevA.textContent=`← ${prev.no} ${prev.name}`;}else prevA.hidden=true;}
  if(nextA){if(next){nextA.href=`history-detail.html?period=${next.slug}`;nextA.textContent=`${next.no} ${next.name} →`;}else nextA.hidden=true;}
  // SEO: 時代名・特徴・代表作・見方が検索結果から分かる形にする。
  const seoTitle=`${entry.name}とは？特徴・代表作・見方｜西洋美術史｜答え合わせ美術部`;
  const desc=`${entry.name}（${entry.years}）を初心者向けに解説。時代背景、代表作、色・形・主題の特徴、見るポイント、次の時代への変化を「${entry.mantra}」を合言葉に整理します。`;
  const canonical=`https://hillslife.tokyo/art/history-detail.html?period=${encodeURIComponent(entry.slug)}`;
  const seoImage=entry.hero?new URL(entry.hero,location.href).href:(entry.summary?new URL(entry.summary,location.href).href:'');
  document.title=seoTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content',desc);
  let canonicalLink=document.querySelector('link[rel="canonical"]');
  if(!canonicalLink){canonicalLink=document.createElement('link');canonicalLink.rel='canonical';document.head.appendChild(canonicalLink);}
  canonicalLink.href=canonical;
  const setProp=(name,value)=>document.querySelector(`meta[property="${name}"]`)?.setAttribute('content',value||'');
  const setName=(name,value)=>document.querySelector(`meta[name="${name}"]`)?.setAttribute('content',value||'');
  setProp('og:title',seoTitle); setProp('og:description',desc); setProp('og:url',canonical);
  setProp('og:image',seoImage); setProp('og:image:alt',seoImage?`${entry.name}の美術史ガイド`:'');
  setName('twitter:title',seoTitle); setName('twitter:description',desc); setName('twitter:image',seoImage);
})();

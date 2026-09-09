(() => {
  const root=document.querySelector('[data-howto-detail]'); if(!root) return;
  const data=window.HOWTO_DETAIL_DATA||{}; const entries=Object.values(data);
  const requested=(new URL(location.href).searchParams.get('guide')||'seeing-techniques').trim();
  const entry=data[requested]||entries[0]; if(!entry) return;
  const q=s=>root.querySelector(s); const set=(s,v)=>{const el=q(s);if(el)el.textContent=v||'';};
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  set('[data-howto-eyebrow]',entry.eyebrow);set('[data-howto-number]',entry.no);set('[data-howto-title]',entry.title);set('[data-howto-tagline]',entry.tagline);set('[data-howto-intro]',entry.intro);set('[data-howto-source]',entry.sourceLabel);set('[data-howto-mantra]',entry.mantra);
  [q('[data-howto-summary-preview]'),q('[data-howto-summary]')].forEach(img=>{if(img){img.src=entry.summary;img.alt=`${entry.title} 1枚まとめ`;}});
  const book=q('[data-howto-book]');if(book&&entry.bookUrl){book.hidden=false;book.href=entry.bookUrl;book.textContent=entry.bookLabel||'本を見る ↗';}
  const groups=q('[data-howto-groups]');if(groups){groups.innerHTML='';(entry.groups||[]).forEach(group=>{const section=document.createElement('section');section.className='howto-topic-group';const chips=(group.chips||[]).map(c=>`<span>${esc(c)}</span>`).join('');const items=(group.items||[]).map(([title,copy])=>`<article class="howto-topic-card"><h3>${esc(title)}</h3><p>${esc(copy)}</p></article>`).join('');section.innerHTML=`<div class="howto-topic-group-head"><div class="howto-topic-label">${esc(group.label||'')}</div><div><h2>${esc(group.title||'')}</h2><p>${esc(group.lead||'')}</p></div></div>${chips?`<div class="howto-topic-chips">${chips}</div>`:''}<div class="howto-topic-cards">${items}</div>`;groups.appendChild(section);});}
  const workflow=q('[data-howto-workflow]');if(workflow){workflow.innerHTML='';(entry.workflow||[]).forEach(([no,title,copy])=>{const li=document.createElement('li');li.innerHTML=`<span>${esc(no)}</span><div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div>`;workflow.appendChild(li);});}
  const connections=q('[data-howto-connections]');if(connections){connections.innerHTML='';(entry.connections||[]).forEach(([title,copy,href])=>{const a=document.createElement('a');a.className='howto-connection-card';a.href=href;a.innerHTML=`<span>TRY IT</span><h3>${esc(title)}</h3><p>${esc(copy)}</p><b>見る →</b>`;connections.appendChild(a);});}
  document.title=`${entry.title}｜絵の見かた｜答え合わせ美術部`;
  const desc=`${entry.title}。${entry.tagline} 美術館で使える順番で整理します。`;
  document.querySelector('meta[name="description"]')?.setAttribute('content',desc);document.querySelector('meta[property="og:title"]')?.setAttribute('content',`${entry.title}｜答え合わせ美術部`);document.querySelector('meta[property="og:description"]')?.setAttribute('content',desc);
  const canonical=`https://hillslife.tokyo/art/howto-detail.html?guide=${encodeURIComponent(entry.slug)}`;let canonicalLink=document.querySelector('link[rel="canonical"]');if(!canonicalLink){canonicalLink=document.createElement('link');canonicalLink.rel='canonical';document.head.appendChild(canonicalLink);}canonicalLink.href=canonical;document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical);
})();

(() => {
  const root=document.querySelector('[data-artwork-guide]');
  if(!root) return;
  const params=new URL(location.href).searchParams;
  const requested=(params.get('work')||'jp-001').trim();
  const source=window.MUSTSEE_DATA||{};
  const images=window.MUSTSEE_IMAGES||{};
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const compact=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s　「」『』《》〈〉()（）［］【】・･.,，。、:：;；!！?？'"“”‘’\-–—―]/g,'');

  const all=[];
  ['japan','overseas'].forEach(scope=>{
    (source[scope]?.museums||[]).forEach(m=>{
      (m.works||[]).forEach(w=>all.push({...w,scope,museum:m.museum||'',location:m.location||m.prefecture||m.country||'',museumUrl:m.url||''}));
    });
  });
  // 来日予定の作品IDも直接アクセスできるようにする。
  (source.upcoming?.works||[]).forEach(w=>all.push({...w,scope:'upcoming',museum:w.venue||'',location:'日本',museumUrl:w.url||'',point:w.point||((w.guides||[])[0]||'実物でしか分からない違いを探す')}));

  let work=all.find(w=>w.id===requested);
  if(!work) work=all[0];
  if(!work) return;

  const q=s=>root.querySelector(s);
  const set=(s,v)=>{const el=q(s);if(el)el.textContent=v||'';};
  const info=images[work.id]||{};
  const visualConfig=(window.ARTWORK_VISUAL_HINTS||{})[work.id]||null;
  const baseGuides=(Array.isArray(work.guides)&&work.guides.length?work.guides:(Array.isArray(info.guides)?info.guides:[]));
  const guides=[0,1,2].map(i=>visualConfig?.hints?.[i]?.copy||baseGuides?.[i]||'');
  const displayPoint=visualConfig?.point||work.point||'実物で、画像との違いを一つ見つける';

  const artistEntries=Object.values(window.ARTIST_DETAIL_DATA||{});
  const artistDetail=artistEntries.find(d=>[d.name,d.shortName,...(d.aliases||[])].some(a=>{
    const a1=compact(a),b1=compact(work.artist);return a1&&b1&&(a1===b1||(Math.min(a1.length,b1.length)>=3&&(a1.includes(b1)||b1.includes(a1))));
  }))||null;

  set('[data-artwork-title]',work.work);
  set('[data-artwork-artist]',work.artist);
  set('[data-artwork-museum]',work.museum);
  set('[data-artwork-location]',work.location?`｜ ${work.location}`:'');
  set('[data-artwork-point]',displayPoint);
  set('[data-artwork-answer]',displayPoint||'近づく。離れる。違いを探す。');
  set('[data-artwork-caption]',`${work.artist} ${work.work}`);

  const artistLink=q('[data-artwork-artist-link]');
  const artistText=q('[data-artwork-artist]');
  if(artistDetail&&artistLink){
    artistLink.href=`artist.html?artist=${encodeURIComponent(artistDetail.slug)}`;
    artistLink.textContent=work.artist;
    artistLink.hidden=false;
    if(artistText) artistText.hidden=true;
  }

  const listHref=work.scope==='upcoming'?`mustsee.html#upcoming`:`mustsee.html?view=${work.scope==='japan'?'japan':'overseas'}&work=${encodeURIComponent(work.id)}#work-${encodeURIComponent(work.id)}`;
  q('[data-artwork-list-link]')?.setAttribute('href',listHref);
  q('[data-artwork-back]')?.setAttribute('href',listHref);

  const img=q('[data-artwork-image]');
  const imageFrame=q('[data-artwork-image-frame]');
  const unavailable=q('[data-artwork-unavailable]');
  const credit=q('[data-artwork-credit]');
  if(info?.src){
    img.src=info.src;
    img.alt=`${work.artist} ${work.work}`;
    img.hidden=false;
    if(imageFrame) imageFrame.hidden=false;
    if(unavailable) unavailable.hidden=true;
    q('[data-artwork-media]')?.classList.remove('is-no-image');
    if(credit){
      const pieces=[];
      if(info.credit) pieces.push(info.credit);
      if(info.license) pieces.push(info.license);
      credit.textContent=pieces.join(' · ');
    }
    if(info.fallbackSrc && /^https:\/\/upload\.wikimedia\.org\//i.test(info.fallbackSrc)){
      img.addEventListener('error',()=>{if(img.dataset.fallbackUsed==='1')return;img.dataset.fallbackUsed='1';img.src=info.fallbackSrc;},{once:true});
    }
  }else{
    img.hidden=true;
    if(imageFrame) imageFrame.hidden=true;
    if(unavailable) unavailable.hidden=false;
    q('[data-artwork-media]')?.classList.add('is-no-image');
    if(credit) credit.textContent='';
  }


  // v2.60: 画像上で01/02/03と対応箇所を答え合わせする。
  const visualHints=(visualConfig?.hints||[]).slice(0,3);
  const visualStage=q('[data-artwork-image-stage]');
  const visualOverlay=q('[data-artwork-visual-overlay]');
  const visualStatus=q('[data-artwork-visual-status]');
  const visualUi=q('[data-artwork-visual-ui]');
  const visualControls=q('[data-artwork-visual-controls]');
  const hintIntro=q('[data-artwork-hint-intro]');
  const hasVisualHints=Boolean(info?.src&&visualHints.length===3&&visualOverlay&&visualControls);
  let activeVisual=-1;

  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const shapeMarkup=(r,attrs='')=>{
    if(!r) return '';
    if(r.type==='rect') return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.r||3}" ${attrs}></rect>`;
    return `<ellipse cx="${r.x}" cy="${r.y}" rx="${r.w/2}" ry="${r.h/2}" ${attrs}></ellipse>`;
  };
  const firstMarker=(hint,index)=>{
    const r=(hint.regions||[])[0];
    if(!r) return '';
    const rawX=r.type==='rect'?r.x+3:r.x-r.w/2+4;
    const rawY=r.type==='rect'?r.y+4:r.y-r.h/2+5;
    const x=clamp(rawX,5,95), y=clamp(rawY,6,94);
    return `<g class="artwork-guide-visual-marker"><circle cx="${x}" cy="${y}" r="3.3"></circle><text x="${x}" y="${y+.25}" text-anchor="middle" dominant-baseline="middle">0${index+1}</text></g>`;
  };
  const syncVisualButtons=()=>{
    root.querySelectorAll('[data-visual-hint]').forEach(btn=>{
      const on=Number(btn.dataset.visualHint)===activeVisual;
      btn.classList.toggle('is-active',on);
      btn.setAttribute('aria-pressed',String(on));
    });
  };
  const renderVisual=(index,{scroll=false}={})=>{
    if(!hasVisualHints) return;
    activeVisual=(index>=0&&index<visualHints.length)?index:-1;
    if(activeVisual<0){
      visualOverlay.innerHTML='';
      visualOverlay.classList.remove('is-active');
      if(visualStatus){visualStatus.hidden=true;visualStatus.textContent='';}
      syncVisualButtons();
      return;
    }
    const hint=visualHints[activeVisual];
    const regions=hint.regions||[];
    const maskId=`artwork-hint-mask-${work.id.replace(/[^a-z0-9-]/gi,'')}-${activeVisual}`;
    const holes=regions.map(r=>shapeMarkup(r,'fill="black"')).join('');
    const outlines=regions.map(r=>shapeMarkup(r,'class="artwork-guide-visual-outline" vector-effect="non-scaling-stroke"')).join('');
    const path=Array.isArray(hint.path)&&hint.path.length>1
      ? `<polyline class="artwork-guide-visual-path" points="${hint.path.map(p=>p.join(',')).join(' ')}" marker-end="url(#artwork-hint-arrow)" vector-effect="non-scaling-stroke"></polyline>`
      : '';
    visualOverlay.innerHTML=`<defs><mask id="${maskId}"><rect width="100" height="100" fill="white"></rect>${holes}</mask><marker id="artwork-hint-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" class="artwork-guide-visual-arrowhead"></path></marker></defs><rect class="artwork-guide-visual-dim" width="100" height="100" mask="url(#${maskId})"></rect>${outlines}${path}${firstMarker(hint,activeVisual)}`;
    visualOverlay.classList.add('is-active');
    if(visualStatus){visualStatus.textContent=`0${activeVisual+1}｜${hint.label||'見るポイント'}`;visualStatus.hidden=false;}
    syncVisualButtons();
    if(scroll&&visualStage){
      const rect=visualStage.getBoundingClientRect();
      if(rect.top<90||rect.bottom>window.innerHeight-24) visualStage.scrollIntoView({behavior:'smooth',block:'center'});
    }
  };

  const fitVisualStage=()=>{
    if(!visualStage||!img||!img.naturalWidth||!imageFrame||imageFrame.hidden) return;
    const cs=getComputedStyle(imageFrame);
    const available=Math.max(180,imageFrame.clientWidth-parseFloat(cs.paddingLeft||0)-parseFloat(cs.paddingRight||0));
    const maxH=window.matchMedia('(max-width:760px)').matches?320:430;
    const ratio=img.naturalWidth/img.naturalHeight;
    let width=Math.min(available,maxH*ratio);
    let height=width/ratio;
    if(height>maxH){height=maxH;width=height*ratio;}
    visualStage.style.width=`${Math.round(width)}px`;
    visualStage.style.height=`${Math.round(height)}px`;
  };

  if(info?.src&&img){
    if(img.complete&&img.naturalWidth) fitVisualStage();
    img.addEventListener('load',fitVisualStage);
    window.addEventListener('resize',fitVisualStage,{passive:true});
  }
  if(hasVisualHints){
    q('[data-artwork-media]')?.classList.add('is-visual-enabled');
    if(visualUi) visualUi.hidden=false;
    if(hintIntro) hintIntro.innerHTML='<strong>01 / 02 / 03を押すと、絵の対応箇所が光ります。</strong> 文章と絵を行き来して答え合わせ。最後は「全体」で作品全体へ戻ろう。';
    visualControls.innerHTML=visualHints.map((h,i)=>`<button type="button" data-visual-hint="${i}" aria-pressed="false" aria-label="0${i+1} ${esc(h.label||'見るヒント')}">0${i+1}</button>`).join('')+`<button type="button" class="is-reset" data-visual-reset aria-label="ハイライトを消して作品全体を見る">全体</button>`;
    visualControls.querySelectorAll('[data-visual-hint]').forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.visualHint);renderVisual(activeVisual===i?-1:i);}));
    visualControls.querySelector('[data-visual-reset]')?.addEventListener('click',()=>renderVisual(-1));
  }

  const hintsRoot=q('[data-artwork-hints]');
  if(hintsRoot){
    const labels=['最初に目を置く','視線を動かす','近くで確かめる'];
    const defaults=['3秒だけ全体を見て、最初に目が止まった場所を覚える。','気になった場所から、線・色・人物の向きに沿って目を動かす。','細部へ近づき、色・筆跡・輪郭・素材の違いを一つ見つける。'];
    hintsRoot.innerHTML='';
    [0,1,2].forEach(i=>{
      const card=document.createElement(hasVisualHints?'button':'article');
      card.className='artwork-guide-hint-card';
      if(hasVisualHints){
        card.type='button';
        card.dataset.visualHint=String(i);
        card.setAttribute('aria-pressed','false');
        card.setAttribute('aria-label',`0${i+1} ${visualHints[i]?.label||labels[i]}。画像で場所を確認する`);
      }
      card.innerHTML=`<div class="artwork-guide-no">0${i+1}</div><span>${hasVisualHints?esc(visualHints[i]?.label||labels[i]):labels[i]}</span><p>${esc(guides[i]||defaults[i])}</p>${hasVisualHints?'<b class="artwork-guide-hint-action">絵の中で見る ↗</b>':''}`;
      if(hasVisualHints) card.addEventListener('click',()=>renderVisual(activeVisual===i?-1:i,{scroll:true}));
      hintsRoot.appendChild(card);
    });
    syncVisualButtons();
  }

  const liveRoot=q('[data-artwork-live-steps]');
  if(liveRoot){
    const closeHint=guides[2]||guides[0]||'筆跡、色の境界、輪郭、素材を一つ選んで見る。';
    const moveHint=guides[1]||'気になった部分から画面全体へ、視線をゆっくり動かす。';
    const point=displayPoint||'画像では分からない違いを一つ探す';
    const steps=[
      ['01','まず、離れて見る','作品の大きさと、自分の身体との距離を感じる。最初に目が止まった場所も覚えておく。'],
      ['02','近づく',closeHint],
      ['03','もう一度、離れる',`${moveHint} 近くでは別々だったものが、離れると何に変わるかを見る。`],
      ['04','画像との違いを一つ持ち帰る',`「${point}」。思っていたより大きい、暗い、厚い、粗い、静か——どんな小さなズレでもいい。`]
    ];
    liveRoot.innerHTML=steps.map(([no,title,copy])=>`<article class="artwork-guide-live-card"><div>${no}</div><h3>${esc(title)}</h3><p>${esc(copy)}</p></article>`).join('');
  }

  const tools=q('[data-artwork-related-tools]');
  if(tools){
    const links=[
      ['なぜ、生で絵を見るのか？','live-viewing.html'],
      ['5つの見る技術','howto-detail.html?guide=seeing-techniques'],
      ['物理・意味・人間の3面で見る','howto-detail.html?guide=three-aspects']
    ];
    if(artistDetail) links.unshift([`${work.artist}ってどんな画家？`,`artist.html?artist=${encodeURIComponent(artistDetail.slug)}`]);
    tools.innerHTML=links.map(([label,href])=>`<a href="${href}">${esc(label)} →</a>`).join('');
  }

  const relatedRoot=q('[data-artwork-related]');
  if(relatedRoot){
    const sameArtistWorks=all.filter(w=>w.scope!=='upcoming'&&w.id!==work.id&&compact(w.artist)===compact(work.artist));
    const withImages=sameArtistWorks.sort((a,b)=>Number(Boolean(images[b.id]?.src))-Number(Boolean(images[a.id]?.src))||Number(Boolean(b.priority))-Number(Boolean(a.priority))).slice(0,4);
    relatedRoot.innerHTML='';
    withImages.forEach(w=>{
      const im=images[w.id]||{};
      const card=document.createElement('a');
      card.className='artwork-guide-related-card';
      card.href=`artwork-guide.html?work=${encodeURIComponent(w.id)}`;
      const media=im.src?`<div class="artwork-guide-related-media"><img src="${esc(im.src)}" alt="${esc(w.artist+' '+w.work)}" loading="lazy"></div>`:`<div class="artwork-guide-related-media is-empty"><span>ARTWORK</span></div>`;
      card.innerHTML=`${media}<div class="artwork-guide-related-body"><span>${esc(w.museum)}</span><h3>${esc(w.work)}</h3><p>${esc(w.point||'')}</p><b>この作品のヒント →</b></div>`;
      relatedRoot.appendChild(card);
    });
  }

  // 同じ作品の来日予定があれば、関連ツールに追加する。
  const sameWork=(a,b)=>{const x=compact(a),y=compact(b);return x&&y&&(x===y||(Math.min(x.length,y.length)>=5&&(x.includes(y)||y.includes(x))));};
  const sameArtist=(a,b)=>{const x=compact(a),y=compact(b);return x&&y&&(x===y||(Math.min(x.length,y.length)>=3&&(x.includes(y)||y.includes(x))));};
  const upcoming=(source.upcoming?.works||[]).filter(u=>sameArtist(work.artist,u.artist)&&sameWork(work.work,u.work));
  if(tools&&upcoming.length){
    const u=upcoming.sort((a,b)=>(a.start||'').localeCompare(b.start||''))[0];
    const detail=Object.values(window.EXHIBITION_DETAIL_DATA||{}).find(d=>compact(d.title)===compact(u.exhibition));
    const a=document.createElement('a');
    a.href=detail?`exhibition-detail.html?exhibition=${encodeURIComponent(detail.slug)}`:'mustsee.html#upcoming';
    a.textContent=`この作品が見られる展覧会 →`;
    a.className='is-exhibition';
    tools.appendChild(a);
  }

  // SEO: 「作品名 + 見どころ / 見方」で探した人に内容が伝わるタイトル・説明へ。
  const seoTitle=`${work.work}の見どころ3つ｜${work.artist}｜答え合わせ美術部`;
  const museumText=work.museum?`${work.museum}所蔵。`:'';
  const desc=`${work.artist}${work.work}の見どころを3つに絞って初心者向けに解説。${museumText}${displayPoint}。作品の前で「どこを見る？」に迷わないための鑑賞ガイドです。`;
  const canonical=`https://hillslife.tokyo/art/artwork-guide.html?work=${encodeURIComponent(work.id)}`;
  const seoImage=info.src?new URL(info.src,location.href).href:'';
  document.title=seoTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content',desc);
  let canonicalLink=document.querySelector('link[rel="canonical"]');
  if(!canonicalLink){canonicalLink=document.createElement('link');canonicalLink.rel='canonical';document.head.appendChild(canonicalLink);}
  canonicalLink.href=canonical;
  const setProp=(name,value)=>document.querySelector(`meta[property="${name}"]`)?.setAttribute('content',value||'');
  const setName=(name,value)=>document.querySelector(`meta[name="${name}"]`)?.setAttribute('content',value||'');
  setProp('og:title',seoTitle); setProp('og:description',desc); setProp('og:url',canonical);
  setProp('og:image',seoImage); setProp('og:image:alt',seoImage?`${work.artist} ${work.work}`:'');
  setName('twitter:title',seoTitle); setName('twitter:description',desc); setName('twitter:image',seoImage);
})();

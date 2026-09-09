/* 答え合わせ美術部 v4.4.0｜12館定点観測＋大型展＋見たい保存 */
(function(){
  'use strict';
  const DAY = 86400000;
  const WISH_KEY = 'ka_wanted_exhibitions_v1';
  const TZ = 'Asia/Tokyo';
  const esc = (s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseDay = (s)=>new Date(s+'T00:00:00+09:00');
  const nowDay = ()=>{ const parts=new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const v=Object.fromEntries(parts.map(x=>[x.type,x.value])); return parseDay(`${v.year}-${v.month}-${v.day}`); };
  const fmt = (s)=>{ const d=parseDay(s); return `${d.getMonth()+1}.${d.getDate()}`; };
  const fmtJp = (s)=>{ const d=parseDay(s); return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`; };
  const fmtRange = (x)=>`${fmt(x.start)} — ${fmt(x.end)}`;
  const daysFromToday=(s)=>Math.round((parseDay(s)-nowDay())/DAY);
  const daysToEnd=(x)=>Math.round((parseDay(x.end)-nowDay())/DAY);
  const state=(x)=>{ const t=nowDay(); const a=parseDay(x.start), b=parseDay(x.end); if(t<a)return 'upcoming'; if(t>b)return 'past'; return 'current'; };
  const status=(x)=>{
    const st=state(x);
    if(st==='current'){
      const left=daysToEnd(x);
      if(left===0)return ['本日まで','is-urgent'];
      if(left<=14)return [`あと${left}日`,'is-ending'];
      return ['開催中','is-current'];
    }
    if(st==='upcoming'){
      const d=daysFromToday(x.start);
      if(d===1)return ['明日から','is-soon'];
      if(d<=30)return [`あと${d}日`,'is-soon'];
      return ['これから','is-future'];
    }
    return ['終了','is-past'];
  };
  const detailHref=(x)=>x.guide || x.official;
  const linkAttrs=(x)=>x.guide ? '' : ' target="_blank" rel="noopener"';
  const exhibitionData=()=>Array.isArray(window.KA_EXHIBITIONS)?window.KA_EXHIBITIONS:(Array.isArray(window.KA_CURATED_EXHIBITIONS)?window.KA_CURATED_EXHIBITIONS:[]);
  const primaryExhibitions=(data)=>data.filter(x=>x && x.kind!=='trip-guide');

  function imageInfo(x){
    if(x.image) return {src:x.image, alt:x.imageAlt||x.shortTitle||x.title};
    if(x.imageId && window.MUSTSEE_IMAGES?.[x.imageId]?.src){
      return {src:window.MUSTSEE_IMAGES[x.imageId].src, alt:x.imageAlt||x.shortTitle||x.title};
    }
    return null;
  }
  function mediaHtml(x){
    const img=imageInfo(x);
    if(!img) return `<div class="v4-ex-card__media v4-ex-card__media--placeholder"><span>${esc(x.area)}</span><b>${esc(x.venue)}</b></div>`;
    const pos=x.imagePosition ? ` style="object-position:${esc(x.imagePosition)}"` : '';
    return `<div class="v4-ex-card__media"><img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy"${pos}></div>`;
  }

  function compactDate(s){return String(s).replace(/-/g,'');}
  function nextDay(s){ const p=s.split('-').map(Number); const d=new Date(Date.UTC(p[0],p[1]-1,p[2]+1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
  function finalDayCalendarUrl(x){
    const q=new URLSearchParams();
    q.set('action','TEMPLATE');
    q.set('text',`【最終日】${x.shortTitle||x.title}｜${x.venue}`);
    q.set('dates',`${compactDate(x.end)}/${compactDate(nextDay(x.end))}`);
    q.set('location',x.venue);
    const details=[
      '答え合わせ美術部｜見たい展覧会',
      `会期：${fmtJp(x.start)}〜${fmtJp(x.end)}`,
      x.guide ? `見どころ：https://hillslife.tokyo/art/${x.guide}` : '',
      x.official ? `公式：${x.official}` : '',
      '※開館日・休館日・チケット情報は公式サイトをご確認ください。'
    ].filter(Boolean).join('\n');
    q.set('details',details);
    q.set('ctz',TZ);
    return 'https://calendar.google.com/calendar/render?'+q.toString();
  }

  function readWishes(){
    try{
      const v=JSON.parse(localStorage.getItem(WISH_KEY)||'[]');
      return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];
    }catch(_){ return []; }
  }
  function writeWishes(ids){
    try{ localStorage.setItem(WISH_KEY,JSON.stringify([...new Set(ids)])); }catch(_){}
  }
  function isWished(id){return readWishes().includes(id);}
  function wantButton(x, small=false){
    const on=isWished(x.id);
    return `<button class="v4-want-button${small?' v4-want-button--small':''}${on?' is-active':''}" type="button" data-v4-want="${esc(x.id)}" aria-pressed="${on?'true':'false'}"><span aria-hidden="true">${on?'♥':'♡'}</span><span>${on?'見たいに追加済み':'見たい'}</span></button>`;
  }
  function finalDayButton(x, compact=false){
    const on=isWished(x.id);
    return `<a class="v4-finalday-link${compact?' is-compact':''}" data-v4-finalday="${esc(x.id)}" href="${esc(finalDayCalendarUrl(x))}" target="_blank" rel="noopener"${on?'':' hidden'}>最終日をカレンダーに追加 ↗</a>`;
  }

  function card(x, compact=false, opts={}){
    const [label,cls]=status(x);
    const noTicket=opts.noTicket?' data-ka-ticket-disabled="true"':'';
    const anchor=opts.anchor===false?'':` id="ex-${esc(x.id)}"`;
    return `<article${anchor} class="v4-ex-card${compact?' is-compact':''}" data-v4-exhibition-id="${esc(x.id)}" data-exhibition-calendar="${esc(x.id)}"${noTicket}>
      ${mediaHtml(x)}<div class="v4-ex-card__body"><div class="v4-ex-card__meta"><span class="v4-status ${cls}">${esc(label)}</span><span>${esc(x.area)}</span></div>
      <h3>${esc(x.shortTitle||x.title)}</h3><p class="v4-ex-card__venue">${esc(x.venue)}｜${fmtRange(x)}</p>${compact?'':`<p class="v4-ex-card__note">${esc(x.note||'')}</p>`}
      <a class="v4-arrow-link" href="${esc(detailHref(x))}"${linkAttrs(x)}>${x.guide?'見どころを見る':'公式情報を見る'} →</a>
      <div class="v4-ex-card__save">${wantButton(x)}${finalDayButton(x)}</div>
      <div class="v4-ticket-slot" data-ka-ticket-slot="${esc(x.id)}"></div>
      </div></article>`;
  }
  function listRow(x){
    const [label,cls]=status(x);
    return `<article id="ex-${esc(x.id)}" class="v4-later-row" data-v4-exhibition-id="${esc(x.id)}" data-exhibition-calendar="${esc(x.id)}"><div><span class="v4-status ${cls}">${esc(label)}</span><time>${fmt(x.start)}</time></div><h3>${esc(x.shortTitle||x.title)}</h3><p>${esc(x.venue)}</p><div class="v4-later-row__actions"><a href="${esc(detailHref(x))}"${linkAttrs(x)}>詳細 →</a>${wantButton(x,true)}<div class="v4-ticket-slot" data-ka-ticket-slot="${esc(x.id)}"></div></div></article>`;
  }

  function flattenWorks(){
    const d=window.MUSTSEE_DATA; if(!d)return [];
    const out=[];
    const addMuseum=(m,overseas=false)=> (m.works||[]).forEach(w=>out.push({...w,museum:m.museum||'',location:m.location||m.country||'',overseas}));
    (d.japan?.museums||[]).forEach(m=>addMuseum(m,false));
    (d.overseas?.museums||[]).forEach(m=>addMuseum(m,true));
    return out.filter(w=>window.MUSTSEE_IMAGES?.[w.id]?.verified && window.MUSTSEE_IMAGES?.[w.id]?.src);
  }
  function renderDaily(){
    const root=document.querySelector('[data-v4-daily]'); if(!root)return;
    const works=flattenWorks(); if(!works.length)return;
    const origin=new Date(2026,0,1); const idx=Math.floor((nowDay()-origin)/DAY)%works.length; const w=works[(idx+works.length)%works.length]; const img=window.MUSTSEE_IMAGES[w.id];
    const guides=(img.guides||w.guides||[]).slice(0,3);
    root.innerHTML=`<a class="v4-daily__image" href="artwork-guide.html?work=${encodeURIComponent(w.id)}"><img src="${esc(img.src)}" alt="${esc(w.artist+' '+w.work)}"></a><div class="v4-daily__copy"><span class="v4-mini-label">TODAY'S ART</span><p>${esc(w.artist)}</p><h2>${esc(w.work)}</h2><div class="v4-daily__points">${guides.map((g,i)=>`<span><b>0${i+1}</b>${esc(g)}</span>`).join('')}</div><a class="v4-arrow-link" href="artwork-guide.html?work=${encodeURIComponent(w.id)}">3つだけ見てみる →</a></div>`;
  }
  function renderHomeExhibitions(){
    const root=document.querySelector('[data-v4-home-exhibitions]'); if(!root)return;
    const data=primaryExhibitions(exhibitionData());
    const current=data.filter(x=>state(x)==='current').sort((a,b)=>(b.homePriority||0)-(a.homePriority||0) || daysToEnd(a)-daysToEnd(b));
    const soon=data.filter(x=>state(x)==='upcoming' && daysFromToday(x.start)<=14).sort((a,b)=>(b.homePriority||0)-(a.homePriority||0) || parseDay(a.start)-parseDay(b.start));
    const picks=[...current,...soon].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,3);
    root.innerHTML=picks.map(x=>card(x,false,{noTicket:true})).join('');
  }
  function renderExhibitionPage(){
    if(!document.body.classList.contains('exhibitions-v4'))return;
    const data=exhibitionData();
    const primary=primaryExhibitions(data);
    const current=primary.filter(x=>state(x)==='current').sort((a,b)=>daysToEnd(a)-daysToEnd(b) || (b.homePriority||0)-(a.homePriority||0));
    const upcoming=primary.filter(x=>state(x)==='upcoming').sort((a,b)=>parseDay(a.start)-parseDay(b.start));
    const soon=upcoming.filter(x=>{const d=daysFromToday(x.start); return d>=0 && d<=45;});
    const later=upcoming.filter(x=>{const d=daysFromToday(x.start); return d>=46 && d<=180;});
    const put=(sel,html)=>{const el=document.querySelector(sel);if(el)el.innerHTML=html;};
    put('[data-v4-current]', current.length?current.map(x=>card(x,false)).join(''):'<p class="v4-empty">現在掲載中の展覧会を更新しています。</p>');
    put('[data-v4-soon]', soon.length?soon.map(x=>card(x,true)).join(''):'<p class="v4-empty">45日以内に始まる掲載展はありません。</p>');
    put('[data-v4-later]', later.length?later.map(listRow).join(''):'<p class="v4-empty">少し先の展覧会は、発表され次第追加します。</p>');
    renderMuseums(primary);
    // 話題の大型展は、時系列セクションとは別の“今季のピックアップ”として表示する。
    // bigPick を明示したものだけを出すことで、12館の定点観測と役割を分ける。
    const large=primary.filter(x=>x.bigPick && state(x)!=='past')
      .sort((a,b)=>(b.homePriority||0)-(a.homePriority||0) || parseDay(a.start)-parseDay(b.start)).slice(0,6);
    const largeSection=document.querySelector('[data-v4-large-section]');
    if(largeSection) largeSection.hidden=!large.length;
    put('[data-v4-large]',large.map(x=>card(x,true,{anchor:false})).join(''));
    const guides=primary.filter(x=>x.guide && state(x)!=='past').sort((a,b)=>parseDay(a.end)-parseDay(b.end)).slice(0,6);
    put('[data-v4-guides]',guides.map(x=>`<a class="v4-guide-link" href="${esc(x.guide)}"><span>${esc(x.area)}｜${fmtRange(x)}</span><strong>${esc(x.shortTitle||x.title)}</strong><em>行く前に見る →</em></a>`).join(''));
    renderArchive(data);
    renderWishlist();
  }

  function renderArchive(data){
    const root=document.querySelector('[data-past-exhibitions]');
    if(!root)return;
    const today=nowDay();
    const entries=[];

    (data||[]).forEach(x=>{
      const ended=state(x)==='past';
      const visited=Boolean(x.visitDate && parseDay(x.visitDate)<today);
      if(!ended && !visited)return;
      const img=imageInfo(x);
      entries.push({
        id:x.id, title:x.shortTitle||x.title, venue:x.venue||'',
        date:visited?x.visitDate:(x.end||''), ended, visited,
        image:img?.src||'', guide:x.guide||'', official:x.official||'', note:x.note||''
      });
    });

    entries.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    if(!entries.length){
      root.innerHTML='<div class="empty-state" style="grid-column:1/-1">会期終了後の展覧会や、見てきた記録は自動でここに移ります。</div>';
      return;
    }
    root.innerHTML=entries.map(entry=>{
      const label=entry.visited&&entry.ended?'見てきた・会期終了':entry.visited?'見てきた':'会期終了';
      const media=entry.image?`<div class="past-exhibition-media"><img src="${esc(entry.image)}" alt="${esc(entry.title)}" loading="lazy"></div>`:'';
      const guide=entry.guide?`<a href="${esc(entry.guide)}">見どころを読む →</a>`:'';
      const official=entry.official?`<a href="${esc(entry.official)}" target="_blank" rel="noopener">公式情報 ↗</a>`:'';
      return `<article class="past-exhibition-card" data-v4-archive-id="${esc(entry.id)}">${media}<div class="past-exhibition-body"><div class="past-exhibition-status">${esc(label)}</div><h3>${esc(entry.title)}</h3>${entry.venue?`<p class="past-exhibition-venue">${esc(entry.venue)}</p>`:''}${entry.note?`<p>${esc(entry.note)}</p>`:''}${entry.date?`<div class="past-exhibition-date">${esc(entry.date)}</div>`:''}${guide}${official}</div></article>`;
    }).join('');
  }

  function renderMuseums(data){
    const root=document.querySelector('[data-v4-museums]'); if(!root)return;
    const museums=Array.isArray(window.KA_SELECT_MUSEUMS)?window.KA_SELECT_MUSEUMS:[];
    const museumEventLink=(x,label)=>{
      if(!x)return '';
      const st=state(x);
      const badge=label || (st==='current'?'開催中':'次回');
      return `<a class="v4-museum-event" href="#ex-${esc(x.id)}"><span>${esc(badge)}</span><strong>${esc(x.shortTitle||x.title)}</strong><small>${st==='current'?`〜 ${fmt(x.end)}`:`${fmt(x.start)}〜`}</small></a>`;
    };
    root.innerHTML=['東京','関西'].map(area=>{
      const cards=museums.filter(m=>m.area===area).map(m=>{
        const hits=data.filter(x=>x.venue===m.name && state(x)!=='past').sort((a,b)=>parseDay(a.start)-parseDay(b.start));
        const current=hits.filter(x=>state(x)==='current').sort((a,b)=>parseDay(a.end)-parseDay(b.end));
        const upcoming=hits.filter(x=>state(x)==='upcoming').sort((a,b)=>parseDay(a.start)-parseDay(b.start));
        const currentOne=current[0]||null, nextOne=upcoming[0]||null;
        const eventLinks=[museumEventLink(currentOne,'開催中'),museumEventLink(nextOne,'次回')].filter(Boolean).join('');
        return `<article class="v4-museum-card"><span>${esc(area)}</span><h3>${esc(m.name)}</h3><div class="v4-museum-card__events">${eventLinks||'<p>次回展を確認中</p>'}</div><a class="v4-museum-official" href="${esc(m.url)}" target="_blank" rel="noopener">美術館公式 ↗</a></article>`;
      }).join('');
      return `<section class="v4-museum-area"><h3>${area}</h3><div class="v4-museum-grid">${cards}</div></section>`;
    }).join('');
  }

  function renderWishlist(){
    const root=document.querySelector('[data-v4-wishlist]'); if(!root)return;
    const ids=readWishes(); const data=primaryExhibitions(exhibitionData());
    const items=ids.map(id=>data.find(x=>x.id===id)).filter(Boolean).filter(x=>state(x)!=='past').sort((a,b)=>parseDay(a.end)-parseDay(b.end));
    const count=document.querySelector('[data-v4-wishlist-count]'); if(count)count.textContent=String(items.length);
    if(!items.length){
      root.innerHTML='<p class="v4-wishlist-empty">カードの「♡ 見たい」を押すと、ここに保存されます。ログインは不要です。</p>';
      return;
    }
    root.innerHTML=items.map(x=>`<article class="v4-wishlist-row"><div><span>${esc(x.area)}｜${esc(x.venue)}</span><strong>${esc(x.shortTitle||x.title)}</strong><small>〜 ${fmt(x.end)}</small></div><div class="v4-wishlist-row__actions"><a href="${esc(finalDayCalendarUrl(x))}" target="_blank" rel="noopener">最終日をカレンダーに追加 ↗</a><button type="button" data-v4-want-remove="${esc(x.id)}">削除</button></div></article>`).join('');
  }
  function syncWishUI(){
    const ids=new Set(readWishes());
    document.querySelectorAll('[data-v4-want]').forEach(btn=>{
      const on=ids.has(btn.dataset.v4Want);
      btn.classList.toggle('is-active',on); btn.setAttribute('aria-pressed',on?'true':'false');
      btn.innerHTML=`<span aria-hidden="true">${on?'♥':'♡'}</span><span>${on?'見たいに追加済み':'見たい'}</span>`;
    });
    document.querySelectorAll('[data-v4-finalday]').forEach(link=>{link.hidden=!ids.has(link.dataset.v4Finalday);});
    renderWishlist();
  }
  function toggleWish(id, forceRemove=false){
    const ids=readWishes(); const exists=ids.includes(id);
    const next=(exists || forceRemove)?ids.filter(x=>x!==id):[...ids,id];
    writeWishes(next); syncWishUI();
  }
  function bindWishes(){
    document.addEventListener('click',ev=>{
      const btn=ev.target.closest('[data-v4-want]');
      if(btn){ev.preventDefault();toggleWish(btn.dataset.v4Want);return;}
      const remove=ev.target.closest('[data-v4-want-remove]');
      if(remove){ev.preventDefault();toggleWish(remove.dataset.v4WantRemove,true);}
    });
  }

  function auditExhibitionMaster(){
    const data=exhibitionData();
    if(!data.length){ console.warn('[展覧会マスタ] KA_EXHIBITIONS が空です'); return; }
    const seen=new Set();
    data.forEach((x,i)=>{
      ['id','title','start','end'].forEach(k=>{if(!x?.[k])console.warn(`[展覧会マスタ] #${i} ${k} が未設定`,x);});
      if(x?.id){if(seen.has(x.id))console.warn('[展覧会マスタ] ID重複',x.id);seen.add(x.id);}
      if(x?.start&&x?.end&&parseDay(x.start)>parseDay(x.end))console.warn('[展覧会マスタ] 会期逆転',x.id,x.start,x.end);
    });
  }

  function init(){auditExhibitionMaster();renderDaily();renderHomeExhibitions();renderExhibitionPage();bindWishes();syncWishUI();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

(() => {
  const root=document.querySelector('[data-inspection-root]');
  if(!root) return;
  const data=window.MUSTSEE_DATA||{};
  const images=window.MUSTSEE_IMAGES||{};
  const visual=window.ARTWORK_VISUAL_HINTS||{};
  const STORE_KEY='kotaeawase_visual_inspection_v1';
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const compact=(v='')=>String(v).normalize('NFKC').toLowerCase().replace(/[\s　「」『』《》〈〉()（）［］【】・･.,，。、:：;；!！?？'"“”‘’\-–—―]/g,'');
  const all=[];
  ['japan','overseas'].forEach(scope=>{
    (data[scope]?.museums||[]).forEach(m=>(m.works||[]).forEach(w=>all.push({...w,scope,museum:m.museum||'',location:m.location||m.prefecture||m.country||''})));
  });
  const numId=id=>Number((String(id).match(/(\d+)/)||[])[1]||9999);
  all.sort((a,b)=>a.scope===b.scope?numId(a.id)-numId(b.id):(a.scope==='overseas'?-1:1));

  let review={};
  try{review=JSON.parse(localStorage.getItem(STORE_KEY)||'{}')||{};}catch(_){review={};}
  const save=()=>localStorage.setItem(STORE_KEY,JSON.stringify(review));
  const stateFor=id=>{
    const state=review[id]||(review[id]={issues:[],reviewed:false,note:'',issueNotes:{}});
    if(!Array.isArray(state.issues)) state.issues=[];
    if(typeof state.reviewed!=='boolean') state.reviewed=false;
    if(typeof state.note!=='string') state.note='';
    if(!state.issueNotes||typeof state.issueNotes!=='object'||Array.isArray(state.issueNotes)) state.issueNotes={};
    return state;
  };
  const incompleteParts=w=>{
    const missing=[];
    if(!images[w.id]?.src) missing.push('画像');
    const hints=Array.isArray(visual[w.id]?.hints)?visual[w.id].hints:[];
    for(let i=0;i<3;i++) if(!hints[i]) missing.push(`0${i+1}`);
    return missing;
  };
  const isIncomplete=w=>incompleteParts(w).length>0;
  const hasIssue=id=>(stateFor(id).issues||[]).length>0;

  const X_STORE_KEY='kotaeawase_x_rpa_v1';
  let xState={config:{},exported:{},lastBatchIds:[]};
  try{xState={...xState,...(JSON.parse(localStorage.getItem(X_STORE_KEY)||'{}')||{})};}catch(_){}
  if(!xState.config||typeof xState.config!=='object') xState.config={};
  if(!xState.exported||typeof xState.exported!=='object') xState.exported={};
  if(!Array.isArray(xState.lastBatchIds)) xState.lastBatchIds=[];
  const saveX=()=>localStorage.setItem(X_STORE_KEY,JSON.stringify(xState));
  const isXEligible=w=>stateFor(w.id).reviewed&&!hasIssue(w.id)&&!isIncomplete(w);
  // Batch ZIP is generated entirely in the browser. External image URLs can fail CORS/redirect loading,
  // so batch automation uses only same-site/local assets. Individual inspection remains unchanged.
  const isBatchSafeImage=w=>{const src=images[w.id]?.src||'';return !!src&&!/^https?:/i.test(src);};
  const isXExported=w=>Boolean(xState.exported?.[w.id]);

  const el={
    list:root.querySelector('[data-inspection-list]'),scope:root.querySelector('[data-filter-scope]'),rev:root.querySelector('[data-filter-review]'),hideReviewed:root.querySelector('[data-hide-reviewed]'),search:root.querySelector('[data-search]'),size:root.querySelector('[data-page-size]'),
    statVisible:root.querySelector('[data-stat-visible]'),statTotal:root.querySelector('[data-stat-total]'),statIssue:root.querySelector('[data-stat-issue]'),statReviewed:root.querySelector('[data-stat-reviewed]'),statIncomplete:root.querySelector('[data-stat-incomplete]'),
    pagerTop:root.querySelector('[data-pager-top]'),pagerBottom:root.querySelector('[data-pager-bottom]'),toast:document.querySelector('[data-toast]'),modal:document.querySelector('[data-inspection-modal]'),modalTitle:document.querySelector('[data-modal-title]'),modalStage:document.querySelector('[data-modal-stage]'),
    xEligible:root.querySelector('[data-x-eligible-count]'),xExported:root.querySelector('[data-x-exported-count]'),xStartDate:root.querySelector('[data-x-start-date]'),xTime:root.querySelector('[data-x-time]'),xWeekday1:root.querySelector('[data-x-weekday1]'),xWeekday2:root.querySelector('[data-x-weekday2]'),xBatchSize:root.querySelector('[data-x-batch-size]'),xStartNumber:root.querySelector('[data-x-start-number]'),xImageRoot:root.querySelector('[data-x-image-root]')
  };
  let page=1;
  let pageItems=[];

  const shape=(r,attrs='')=>{
    if(!r) return '';
    if(r.type==='rect') return `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.r||3}" ${attrs}></rect>`;
    return `<ellipse cx="${r.x}" cy="${r.y}" rx="${r.w/2}" ry="${r.h/2}" ${attrs}></ellipse>`;
  };
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const marker=(hint,index)=>{
    const r=(hint.regions||[])[0]; if(!r) return '';
    const rawX=r.type==='rect'?r.x+3:r.x-r.w/2+4;
    const rawY=r.type==='rect'?r.y+4:r.y-r.h/2+5;
    const x=clamp(rawX,5,95),y=clamp(rawY,6,94);
    return `<g class="inspection-marker"><circle cx="${x}" cy="${y}" r="3.3"></circle><text x="${x}" y="${y+.25}" text-anchor="middle" dominant-baseline="middle">0${index+1}</text></g>`;
  };
  const overlay=(work,index)=>{
    const hint=visual[work.id]?.hints?.[index]; if(!hint) return '';
    const regions=hint.regions||[];
    const uid=`inspect-${work.id}-${index}-${Math.random().toString(36).slice(2,7)}`;
    const holes=regions.map(r=>shape(r,'fill="black"')).join('');
    const outlines=regions.map(r=>shape(r,'class="inspection-outline" vector-effect="non-scaling-stroke"')).join('');
    const path=Array.isArray(hint.path)&&hint.path.length>1?`<polyline class="inspection-path" points="${hint.path.map(p=>p.join(',')).join(' ')}" marker-end="url(#${uid}-arrow)" vector-effect="non-scaling-stroke"></polyline>`:'';
    return `<svg class="inspection-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><mask id="${uid}-mask"><rect width="100" height="100" fill="white"></rect>${holes}</mask><marker id="${uid}-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" class="inspection-arrowhead"></path></marker></defs><rect class="inspection-dim" width="100" height="100" mask="url(#${uid}-mask)"></rect>${outlines}${path}${marker(hint,index)}</svg>`;
  };
  const panel=(work,index)=>{
    const info=images[work.id]||{};
    const hint=index<0?null:visual[work.id]?.hints?.[index];
    const state=stateFor(work.id);
    const issue=index>=0&&(state.issues||[]).includes(index);
    const issueNote=index>=0?(state.issueNotes?.[index]||''):'';
    const media=info.src?`<div class="inspection-stage" data-zoom="${index}"><img loading="lazy" src="${esc(info.src)}" alt="${esc(work.artist)} ${esc(work.work)}">${index>=0?overlay(work,index):''}</div>`:`<div class="inspection-missing">画像なし</div>`;
    const memo=index>=0&&issue?`<label class="inspection-issue-note-wrap"><span>0${index+1} のズレメモ</span><input class="inspection-issue-note" data-issue-note="${index}" value="${esc(issueNote)}" placeholder="例：顔より右。もう少し左下"></label>`:'';
    return `<article class="inspection-panel"><div class="inspection-panel-head"><div class="inspection-panel-label"><strong>${index<0?'全':'0'+(index+1)}</strong>${esc(index<0?'全体':hint?.label||'ヒント未設定')}</div>${index>=0?`<button type="button" class="inspection-issue-btn ${issue?'is-active':''}" data-issue="${index}">${issue?'ズレ記録済':'ズレを記録'}</button>`:''}</div>${media}${index>=0?`<p class="inspection-panel-copy">${esc(hint?.copy||work.guides?.[index]||'')}</p>${memo}`:''}</article>`;
  };
  const card=(work)=>{
    const s=stateFor(work.id),issue=(s.issues||[]).length>0,incomplete=isIncomplete(work);
    const cls=['inspection-card',issue?'is-issue':'',s.reviewed?'is-reviewed':''].filter(Boolean).join(' ');
    const status=incomplete?'データ不足':issue?`ズレ：${s.issues.map(i=>'0'+(i+1)).join(' / ')}`:s.reviewed?'確認済み':'未確認';
    return `<article class="${cls}" data-work-id="${esc(work.id)}"><div class="inspection-card-head"><div class="inspection-title"><div class="inspection-id">${esc(work.id)} · ${work.scope==='overseas'?'OVERSEAS':'JAPAN'}</div><h2>${esc(work.artist)}｜${esc(work.work)}</h2><p>${esc(work.museum)}${work.location?`｜${esc(work.location)}`:''}</p></div><span class="inspection-card-status">${status}</span></div><div class="inspection-panels">${panel(work,-1)}${panel(work,0)}${panel(work,1)}${panel(work,2)}</div><div class="inspection-card-foot"><button type="button" class="inspection-reviewed-btn ${s.reviewed?'is-active':''}" data-reviewed>${s.reviewed?'確認済み ✓':'確認済みにする'}</button><button type="button" class="inspection-export-btn" data-export-work>X用4枚出力</button><input class="inspection-note" data-note value="${esc(s.note||'')}" placeholder="作品全体メモ（任意）"><div class="inspection-card-links">${isXExported(work)?'<span class="inspection-x-exported-badge">X出力済み</span>':''}<a class="inspection-open" href="artwork-guide.html?work=${encodeURIComponent(work.id)}" target="_blank" rel="noopener">作品ページを開く ↗</a></div></div></article>`;
  };

  const incompleteTable=items=>{
    if(!items.length) return `<div class="inspection-empty">条件に合うデータ不足作品がありません。</div>`;
    const rows=items.map(w=>{
      const missing=incompleteParts(w);
      return `<tr>
        <td class="inspection-table-id">${esc(w.id)}</td>
        <td><span class="inspection-scope-badge">${w.scope==='overseas'?'海外':'日本'}</span></td>
        <td>${esc(w.artist)}</td>
        <td class="inspection-table-work">${esc(w.work)}</td>
        <td>${esc(w.museum||'—')}</td>
        <td><div class="inspection-missing-tags">${missing.map(v=>`<span>${esc(v)}不足</span>`).join('')}</div></td>
        <td><a class="inspection-open" href="artwork-guide.html?work=${encodeURIComponent(w.id)}" target="_blank" rel="noopener">開く ↗</a></td>
      </tr>`;
    }).join('');
    return `<div class="inspection-incomplete-table-wrap"><table class="inspection-incomplete-table">
      <thead><tr><th>ID</th><th>範囲</th><th>画家</th><th>作品</th><th>所蔵館</th><th>不足内容</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  };

  const filtered=()=>{
    const scope=el.scope.value,rv=el.rev.value,q=compact(el.search.value);
    return all.filter(w=>{
      if(scope!=='all'&&w.scope!==scope) return false;
      if(q&&!compact(`${w.id} ${w.artist} ${w.work} ${w.museum}`).includes(q)) return false;
      const s=stateFor(w.id),issue=(s.issues||[]).length>0,incomplete=isIncomplete(w);
      if(el.hideReviewed?.checked&&s.reviewed&&!issue) return false;
      if(rv==='unreviewed'&&(s.reviewed||issue)) return false;
      if(rv==='issue'&&!issue) return false;
      if(rv==='reviewed'&&!s.reviewed) return false;
      if(rv==='incomplete'&&!incomplete) return false;
      return true;
    });
  };
  const stat=()=>{
    el.statTotal.textContent=all.length;
    el.statIssue.textContent=all.filter(w=>hasIssue(w.id)).length;
    el.statReviewed.textContent=all.filter(w=>stateFor(w.id).reviewed).length;
    el.statIncomplete.textContent=all.filter(isIncomplete).length;
  };
  const pager=(target,total,pages)=>{
    if(!target) return;
    target.innerHTML=`<button type="button" data-prev ${page<=1?'disabled':''}>← 前</button><span>${page} / ${pages} ページ（${total}作品）</span><button type="button" data-next ${page>=pages?'disabled':''}>次 →</button>`;
    target.querySelector('[data-prev]')?.addEventListener('click',()=>{if(page>1){page--;render();scrollToList();}});
    target.querySelector('[data-next]')?.addEventListener('click',()=>{if(page<pages){page++;render();scrollToList();}});
  };
  const scrollToList=()=>el.list?.scrollIntoView({behavior:'smooth',block:'start'});
  const showToast=(msg)=>{if(!el.toast)return;el.toast.textContent=msg;el.toast.classList.add('is-show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>el.toast.classList.remove('is-show'),1800);};
  const imageCache=new Map();
  const loadImage=(src)=>{
    if(!src) return Promise.reject(new Error('missing image src'));
    if(imageCache.has(src)) return imageCache.get(src);
    const p=new Promise((resolve,reject)=>{
      const img=new Image();
      if(/^https?:/i.test(src)) img.crossOrigin='anonymous';
      img.decoding='async';
      img.onload=()=>resolve(img);
      img.onerror=()=>{
        imageCache.delete(src);
        reject(new Error(`failed to load ${src}`));
      };
      img.src=src;
    });
    imageCache.set(src,p);
    return p;
  };
  const roundRect=(ctx,x,y,w,h,r)=>{
    const rr=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr,y);
    ctx.arcTo(x+w,y,x+w,y+h,rr);
    ctx.arcTo(x+w,y+h,x,y+h,rr);
    ctx.arcTo(x,y+h,x,y,rr);
    ctx.arcTo(x,y,x+w,y,rr);
    ctx.closePath();
  };
  const fitRect=(iw,ih,bx,by,bw,bh)=>{
    const scale=Math.min(bw/iw,bh/ih);
    const w=iw*scale,h=ih*scale;
    return {x:bx+(bw-w)/2,y:by+(bh-h)/2,w,h};
  };
  const regionPath=(ctx,rect,box)=>{
    const toX=v=>box.x+box.w*(v/100);
    const toY=v=>box.y+box.h*(v/100);
    if(rect.type==='rect'){
      const x=toX(rect.x),y=toY(rect.y),w=box.w*(rect.w/100),h=box.h*(rect.h/100),r=Math.min(box.w,box.h)*((rect.r||3)/100);
      roundRect(ctx,x,y,w,h,r);
      return;
    }
    ctx.beginPath();
    ctx.ellipse(toX(rect.x),toY(rect.y),box.w*(rect.w/200),box.h*(rect.h/200),0,0,Math.PI*2);
    ctx.closePath();
  };
  const drawArrow=(ctx,x1,y1,x2,y2)=>{
    const ang=Math.atan2(y2-y1,x2-x1),size=14;
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-size*Math.cos(ang-Math.PI/7),y2-size*Math.sin(ang-Math.PI/7));
    ctx.lineTo(x2-size*Math.cos(ang+Math.PI/7),y2-size*Math.sin(ang+Math.PI/7));
    ctx.closePath();
    ctx.fill();
  };
  const drawExportOverlay=(ctx,work,index,imgBox)=>{
    const hint=visual[work.id]?.hints?.[index];
    if(!hint) return;
    const regions=hint.regions||[];
    // Darken only the non-highlighted area.
    // IMPORTANT: build the dim mask on an offscreen canvas so that
    // destination-out never erases the artwork itself from the export canvas.
    const dimCanvas=document.createElement('canvas');
    dimCanvas.width=ctx.canvas.width;
    dimCanvas.height=ctx.canvas.height;
    const dimCtx=dimCanvas.getContext('2d');
    dimCtx.fillStyle='rgba(11,24,35,0.56)';
    dimCtx.fillRect(imgBox.x,imgBox.y,imgBox.w,imgBox.h);
    dimCtx.globalCompositeOperation='destination-out';
    regions.forEach(r=>{regionPath(dimCtx,r,imgBox);dimCtx.fill();});
    dimCtx.globalCompositeOperation='source-over';
    ctx.drawImage(dimCanvas,0,0);

    ctx.save();
    ctx.setLineDash([12,8]);
    ctx.strokeStyle='#d27a4a';
    ctx.lineWidth=4;
    regions.forEach(r=>{regionPath(ctx,r,imgBox);ctx.stroke();});
    ctx.restore();

    if(Array.isArray(hint.path)&&hint.path.length>1){
      ctx.save();
      ctx.strokeStyle='#ffffff';
      ctx.fillStyle='#ffffff';
      ctx.lineWidth=3;
      ctx.setLineDash([10,8]);
      ctx.beginPath();
      hint.path.forEach((p,i)=>{
        const x=imgBox.x+imgBox.w*(p[0]/100),y=imgBox.y+imgBox.h*(p[1]/100);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.stroke();
      const a=hint.path[hint.path.length-2],b=hint.path[hint.path.length-1];
      drawArrow(ctx,imgBox.x+imgBox.w*(a[0]/100),imgBox.y+imgBox.h*(a[1]/100),imgBox.x+imgBox.w*(b[0]/100),imgBox.y+imgBox.h*(b[1]/100));
      ctx.restore();
    }

    const r=regions[0];
    if(r){
      const rx=(r.type==='rect'?r.x+3:r.x-r.w/2+4);
      const ry=(r.type==='rect'?r.y+4:r.y-r.h/2+5);
      const x=imgBox.x+imgBox.w*(clamp(rx,5,95)/100),y=imgBox.y+imgBox.h*(clamp(ry,6,94)/100);
      ctx.save();
      ctx.fillStyle='#c97342';
      ctx.strokeStyle='#ffffff';
      ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(x,y,26,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='#ffffff';
      ctx.font='bold 21px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`0${index+1}`,x,y+1);
      ctx.restore();
    }
  };
  const drawPill=(ctx,x,y,w,h,text,active=false)=>{
    ctx.save();
    roundRect(ctx,x,y,w,h,h/2);
    ctx.fillStyle=active?'#c97342':'#ffffff';
    ctx.strokeStyle=active?'#c97342':'#d2c9ba';
    ctx.lineWidth=2;ctx.fill();ctx.stroke();
    ctx.fillStyle=active?'#ffffff':'#16334d';
    ctx.font='bold 28px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x+w/2,y+h/2+1);
    ctx.restore();
  };
  const wrapText=(ctx,text,maxWidth)=>{
    const chars=[...String(text||'')];
    const lines=[]; let line='';
    chars.forEach(ch=>{
      const test=line+ch;
      if(line && ctx.measureText(test).width>maxWidth){ lines.push(line); line=ch; } else line=test;
    });
    if(line) lines.push(line);
    return lines;
  };
  const downloadBlob=(blob,name)=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const exportFileName=(work,index)=>`${work.id}_${index<0?'00':`0${index+1}`}.png`;
  const renderExportBlob=async(work,index)=>{
    const info=images[work.id]||{};
    if(!info.src) throw new Error('画像データがありません');
    const img=await loadImage(info.src);
    const hint=index>=0?visual[work.id]?.hints?.[index]:null;
    const canvas=document.createElement('canvas');
    canvas.width=1080; canvas.height=1350;
    const ctx=canvas.getContext('2d');

    // X用：スマホで読みやすい縦カード。作品は切らずに全体を表示する。
    ctx.fillStyle='#f3eee5';ctx.fillRect(0,0,canvas.width,canvas.height);
    roundRect(ctx,10,10,1060,1330,32);ctx.fillStyle='#eee8dd';ctx.fill();

    // Header
    const badge=index<0?'全':`0${index+1}`;
    ctx.save();
    ctx.fillStyle='#17334b';
    ctx.beginPath();ctx.arc(58,55,31,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 27px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(badge,58,56);
    ctx.textAlign='left';ctx.fillStyle='#17334b';
    ctx.font='bold 28px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';
    ctx.fillText(index<0?'全体':(hint?.label||`ヒント0${index+1}`),104,58);
    ctx.restore();

    const stage=index<0?{x:28,y:98,w:1024,h:1082}:{x:28,y:98,w:1024,h:942};
    roundRect(ctx,stage.x,stage.y,stage.w,stage.h,24);ctx.fillStyle='#d9d1c6';ctx.fill();
    ctx.save();roundRect(ctx,stage.x,stage.y,stage.w,stage.h,24);ctx.clip();
    const imgBox=fitRect(img.width,img.height,stage.x,stage.y,stage.w,stage.h);
    ctx.drawImage(img,imgBox.x,imgBox.y,imgBox.w,imgBox.h);
    if(index>=0) drawExportOverlay(ctx,work,index,imgBox);
    ctx.restore();

    if(index>=0){
      const copy=hint?.copy||work.guides?.[index]||'';
      roundRect(ctx,28,1060,1024,196,22);ctx.fillStyle='#f7f3eb';ctx.fill();
      ctx.fillStyle='#5e5d59';ctx.textAlign='left';ctx.textBaseline='top';
      ctx.font='27px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';
      let lines=wrapText(ctx,copy,956);
      if(lines.length>4){ctx.font='24px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';lines=wrapText(ctx,copy,956);}
      lines.slice(0,4).forEach((line,i)=>ctx.fillText(line,62,1092+i*38));
    }

    // Footer: 作品名と所蔵館だけ。投稿本文を短くできるよう画像側に持たせる。
    ctx.fillStyle='#17334b';ctx.textAlign='left';ctx.textBaseline='alphabetic';
    ctx.font='bold 25px Georgia,"Yu Mincho","Hiragino Mincho ProN",serif';
    const title=`${work.artist}｜${work.work}`;
    const titleLines=wrapText(ctx,title,820).slice(0,2);
    titleLines.forEach((line,i)=>ctx.fillText(line,40,1294+i*30));
    ctx.fillStyle='#77736c';ctx.font='18px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';
    const meta=`${work.museum}${work.location?`｜${work.location}`:''}`;
    ctx.fillText(meta,40,1332);
    ctx.textAlign='right';ctx.fillStyle='#9a9389';ctx.font='bold 16px -apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",sans-serif';
    ctx.fillText('答え合わせ美術部',1040,1332);

    return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('書き出しに失敗しました')),'image/png'));
  };
  const exportWorkSet=async(work,{silent=false}={})=>{
    if(isIncomplete(work)) throw new Error('データ不足のため出力できません');
    for(const index of [-1,0,1,2]){
      const blob=await renderExportBlob(work,index);
      downloadBlob(blob,exportFileName(work,index));
      await sleep(140);
    }
    if(!silent) showToast(`${work.id} のX用4枚を書き出しました`);
  };

  const pad2=n=>String(n).padStart(2,'0');
  const isoDate=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  const nextScheduledDates=(count,startDate,time,weekdays)=>{
    const [hh,mm]=String(time||'20:30').split(':').map(Number);
    const allowed=[...new Set(weekdays.map(Number))];
    let d=new Date(`${startDate}T00:00:00`);
    if(Number.isNaN(d.getTime())) d=new Date();
    const out=[];
    for(let guard=0;out.length<count&&guard<800;guard++){
      if(allowed.includes(d.getDay())) out.push(new Date(d.getFullYear(),d.getMonth(),d.getDate(),hh||0,mm||0,0,0));
      d.setDate(d.getDate()+1);
    }
    return out;
  };
  const buildPostText=work=>{
    const url=`https://hillslife.tokyo/art/artwork-guide.html?work=${encodeURIComponent(work.id)}`;
    return `${work.artist}${work.work}

見るポイントを3つだけ。
画像を順番にどうぞ。

${url}
#答え合わせ美術部 #美術鑑賞`;
  };
  const normalizeRootPath=s=>String(s||'C:\\RPA\\art_guide\\images').replace(/[\\/]+$/,'');
  const xlsxArrayFor=(works,schedules,startNumber,imageRoot)=>{
    if(!window.XLSX) throw new Error('Excel出力ライブラリを読み込めませんでした');
    const rootPath=normalizeRootPath(imageRoot);
    const headers=['No.','ImageFile','ImagePath','PostNumber','PostText','ScheduledAt','Year','Month','Day','Hour','Minute','Status','ImageFile2','ImagePath2','ImageFile3','ImagePath3','ImageFile4','ImagePath4'];
    const rows=works.map((w,i)=>{
      const dt=schedules[i],no=startNumber+i;
      const files=[`${w.id}_00.png`,`${w.id}_01.png`,`${w.id}_02.png`,`${w.id}_03.png`];
      const paths=files.map(f=>`${rootPath}\\${f}`);
      return [i+1,files[0],paths[0],no,buildPostText(w),dt,dt.getFullYear(),dt.getMonth()+1,dt.getDate(),dt.getHours(),pad2(dt.getMinutes()),'予約済み',files[1],paths[1],files[2],paths[2],files[3],paths[3]];
    });
    const ws=XLSX.utils.aoa_to_sheet([headers,...rows],{cellDates:true});
    ws['!cols']=[{wch:7},{wch:20},{wch:42},{wch:12},{wch:52},{wch:20},{wch:9},{wch:9},{wch:9},{wch:9},{wch:9},{wch:12},{wch:20},{wch:42},{wch:20},{wch:42},{wch:20},{wch:42}];
    for(let r=1;r<=rows.length;r++){ const c=ws[XLSX.utils.encode_cell({r,c:5})]; if(c) c.z='yyyy-mm-dd hh:mm'; }
    const first=schedules[0],last=schedules[schedules.length-1];
    const settings=[
      ['X予約投稿一覧（答え合わせ美術部・4枚画像）',''],
      ['画像フォルダ',rootPath],
      ['開始日時',first||''],
      ['開始番号',startNumber],
      ['画像件数',works.length*4],
      ['投稿件数',works.length],
      ['最終予約日時',last||''],
      ['最終投稿番号',startNumber+works.length-1],
      ['', ''],
      ['PostTextの形式','作品名＋3つの見るポイント＋合言葉＋サイトURL＋ハッシュタグ。セル内に実際の改行が入ります。'],
      ['PADで使う主な列','従来の ImagePath / PostText / Year / Month / Day / Hour / Minute に加え、ImagePath2 / ImagePath3 / ImagePath4 を使用。'],
      ['画像順','ImagePath=全体(00) → ImagePath2=01 → ImagePath3=02 → ImagePath4=03'],
      ['RPA改修','従来の画像1枚アップロード後に、ImagePath2・ImagePath3・ImagePath4を順番に追加アップロード。その他は従来フローを維持。']
    ];
    const ws2=XLSX.utils.aoa_to_sheet(settings,{cellDates:true});
    ws2['!cols']=[{wch:24},{wch:95}];
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'投稿一覧');
    XLSX.utils.book_append_sheet(wb,ws2,'設定・使い方');
    return XLSX.write(wb,{bookType:'xlsx',type:'array',cellDates:true});
  };
  const xConfigFromUi=()=>({
    startDate:el.xStartDate?.value||'',time:el.xTime?.value||'20:30',weekday1:Number(el.xWeekday1?.value??2),weekday2:Number(el.xWeekday2?.value??4),batchSize:Number(el.xBatchSize?.value||8),startNumber:Number(el.xStartNumber?.value||1),imageRoot:el.xImageRoot?.value||'C:\\RPA\\art_guide\\images'
  });
  const saveXConfig=()=>{xState.config=xConfigFromUi();saveX();};
  const refreshXStats=()=>{
    const eligible=all.filter(w=>isXEligible(w)&&!isXExported(w)&&isBatchSafeImage(w));
    const exported=all.filter(isXExported);
    if(el.xEligible) el.xEligible.textContent=eligible.length;
    if(el.xExported) el.xExported.textContent=exported.length;
    const n=Number(el.xBatchSize?.value||8);
    const btn=root.querySelector('[data-x-export-batch]');
    if(btn) btn.textContent=`次の${Math.min(n,eligible.length||n)}件を「縦4枚＋Excel」ZIP出力`;
  };
  const exportRpaBatch=async()=>{
    if(!window.XLSX||!window.JSZip) throw new Error('Excel/ZIP出力ライブラリを読み込めませんでした');
    const cfg=xConfigFromUi();
    if(!cfg.startDate) throw new Error('投稿開始日を設定してください');
    if(cfg.weekday1===cfg.weekday2) throw new Error('投稿曜日は2つ別の曜日を選んでください');

    // 「次のN件」は N件の候補を固定して途中失敗で全体を止めず、
    // N件の生成成功作品が揃うまで後続候補へ進む。
    const candidates=all.filter(w=>isXEligible(w)&&!isXExported(w)&&isBatchSafeImage(w));
    if(!candidates.length) throw new Error('ローカル画像でX出力可能な未出力作品がありません');

    const zip=new JSZip();
    const imgFolder=zip.folder('images');
    const successWorks=[];
    const successImages=[];
    const failures=[];

    for(let ci=0;ci<candidates.length && successWorks.length<cfg.batchSize;ci++){
      const work=candidates[ci];
      showToast(`${successWorks.length+1}/${cfg.batchSize} ${work.id} の4枚を生成中…`);
      try{
        // 1作品4枚がすべて成功してからZIPへ追加する。
        // 途中で1枚失敗した作品の半端な画像はZIPへ入れない。
        const blobs=[];
        for(const index of [-1,0,1,2]) blobs.push(await renderExportBlob(work,index));
        successWorks.push(work);
        successImages.push(blobs);
      }catch(err){
        console.warn('X batch image export skipped:',work.id,err);
        failures.push({id:work.id,artist:work.artist,work:work.work,error:err?.message||String(err)});
      }
    }

    if(!successWorks.length){
      const detail=failures.slice(0,3).map(f=>f.id).join(', ');
      throw new Error(`画像生成に成功した作品がありません${detail?`（失敗: ${detail}）`:''}`);
    }

    // 成功作品だけで予約日時・PostNumber・Excelを作るため、欠番が出ない。
    const dates=nextScheduledDates(successWorks.length,cfg.startDate,cfg.time,[cfg.weekday1,cfg.weekday2]);
    if(dates.length!==successWorks.length) throw new Error('予約日時の作成に失敗しました');

    successWorks.forEach((work,i)=>{
      [-1,0,1,2].forEach((index,j)=>imgFolder.file(exportFileName(work,index),successImages[i][j]));
    });

    const xlsx=xlsxArrayFor(successWorks,dates,cfg.startNumber,cfg.imageRoot);
    zip.file('X予約投稿一覧_答え合わせ美術部.xlsx',xlsx);
    const last=dates[dates.length-1];
    const readme=[
      '答え合わせ美術部 X予約投稿RPA用',
      '',
      '推奨展開先: C:\\RPA\\art_guide\\',
      'Excel: X予約投稿一覧_答え合わせ美術部.xlsx',
      '画像: images\\*.png',
      '',
      `生成成功: ${successWorks.length}件 / 希望: ${cfg.batchSize}件`,
      `外部画像URLのためバッチ対象外: ${all.filter(w=>isXEligible(w)&&!isXExported(w)&&!isBatchSafeImage(w)).length}件`,
      `画像読込等でスキップ: ${failures.length}件`,
      '',
      'PAD改修点:',
      '従来の ImagePath に加えて ImagePath2 / ImagePath3 / ImagePath4 を順にアップロードしてください。',
      'PostText / Year / Month / Day / Hour / Minute は従来と同じです。'
    ].join('\\r\\n');
    zip.file('README_RPA.txt',readme);

    if(failures.length){
      const failedText=[
        'X予約投稿ZIP生成時のスキップ作品',
        'この一覧の作品は「X出力済み」にはしていません。画像URL等を直した後、再度対象になります。',
        '',
        ...failures.map(f=>`${f.id}\t${f.artist}\t${f.work}\t${f.error}`)
      ].join('\\r\\n');
      zip.file('FAILED_IMAGES.txt',failedText);
    }

    showToast(`ZIP圧縮中… ${successWorks.length}件 / ${successWorks.length*4}枚`);
    const blob=await zip.generateAsync(
      {type:'blob',compression:'DEFLATE',compressionOptions:{level:4}},
      meta=>{ if(Math.round(meta.percent)%20===0) showToast(`ZIP圧縮中… ${Math.round(meta.percent)}%`); }
    );
    const zipName=`X予約投稿_答え合わせ美術部_${cfg.startDate.replaceAll('-','')}_${successWorks.length}件.zip`;
    downloadBlob(blob,zipName);

    const ids=[];
    successWorks.forEach((w,i)=>{
      xState.exported[w.id]={scheduledAt:dates[i].toISOString(),postNumber:cfg.startNumber+i,exportedAt:new Date().toISOString()};
      ids.push(w.id);
    });
    xState.lastBatchIds=ids;
    xState.config={...cfg,startDate:isoDate(new Date(last.getFullYear(),last.getMonth(),last.getDate()+1)),startNumber:cfg.startNumber+successWorks.length};
    saveX();
    if(el.xStartDate) el.xStartDate.value=xState.config.startDate;
    if(el.xStartNumber) el.xStartNumber.value=xState.config.startNumber;
    refreshXStats();render();

    if(failures.length){
      showToast(`${successWorks.length}件を出力しました（${failures.length}件スキップ。ZIP内FAILED_IMAGES.txt参照）`);
    }else{
      showToast(`${successWorks.length}件分の画像＋Excel ZIPを出力しました`);
    }
  };

  const render=()=>{
    const items=filtered(),size=Number(el.size.value)||24,pages=Math.max(1,Math.ceil(items.length/size)); if(page>pages)page=pages;
    const slice=items.slice((page-1)*size,page*size);
    pageItems=slice;
    el.statVisible.textContent=items.length;stat();
    const incompleteMode=el.rev.value==='incomplete';
    el.list.classList.toggle('is-table-view',incompleteMode);
    el.list.innerHTML=incompleteMode
      ? incompleteTable(slice)
      : (slice.length?slice.map(card).join(''):`<div class="inspection-empty">条件に合う作品がありません。</div>`);
    pager(el.pagerTop,items.length,pages);pager(el.pagerBottom,items.length,pages);
    if(!incompleteMode) bindCards();
    refreshXStats();
  };
  const bindCards=()=>{
    el.list.querySelectorAll('[data-work-id]').forEach(cardEl=>{
      const id=cardEl.dataset.workId,work=all.find(w=>w.id===id),s=stateFor(id);
      cardEl.querySelectorAll('[data-issue]').forEach(btn=>btn.addEventListener('click',()=>{
        const i=Number(btn.dataset.issue),set=new Set(s.issues||[]);
        if(set.has(i)){set.delete(i);delete s.issueNotes[i];}
        else{set.add(i);s.reviewed=true;}
        s.issues=[...set].sort();save();render();
      }));
      cardEl.querySelectorAll('[data-issue-note]').forEach(input=>input.addEventListener('change',e=>{
        const i=Number(input.dataset.issueNote);s.issueNotes[i]=e.target.value;save();showToast(`0${i+1} のメモを保存しました`);
      }));
      cardEl.querySelector('[data-reviewed]')?.addEventListener('click',()=>{s.reviewed=!s.reviewed;save();render();});
      cardEl.querySelector('[data-export-work]')?.addEventListener('click',async()=>{
        try{
          showToast(`${id} の4枚を書き出しています…`);
          await exportWorkSet(work);
        }catch(err){showToast(err?.message||'書き出しに失敗しました');}
      });
      cardEl.querySelector('[data-note]')?.addEventListener('change',e=>{s.note=e.target.value;save();showToast('作品全体メモを保存しました');});
      cardEl.querySelectorAll('[data-zoom]').forEach(stage=>stage.addEventListener('click',e=>{if(e.target.closest('button'))return;openModal(work,Number(stage.dataset.zoom));}));
    });
  };
  const openModal=(work,index)=>{
    if(!el.modal||!el.modalStage)return;
    const label=index<0?'全体':`0${index+1}｜${visual[work.id]?.hints?.[index]?.label||''}`;
    el.modalTitle.textContent=`${work.id}｜${work.artist} ${work.work}｜${label}`;
    const info=images[work.id]||{};
    el.modalStage.innerHTML=info.src?`<div style="width:min(100%,760px)"><div class="inspection-stage"><img src="${esc(info.src)}" alt="">${index>=0?overlay(work,index):''}</div>${index>=0?`<p class="inspection-panel-copy">${esc(visual[work.id]?.hints?.[index]?.copy||work.guides?.[index]||'')}</p>`:''}</div>`:'<div class="inspection-missing">画像なし</div>';
    el.modal.showModal();
  };
  document.querySelector('[data-modal-close]')?.addEventListener('click',()=>el.modal?.close());
  el.modal?.addEventListener('click',e=>{if(e.target===el.modal)el.modal.close();});
  [el.scope,el.rev,el.size,el.hideReviewed].forEach(x=>x?.addEventListener('change',()=>{page=1;render();}));
  let timer;el.search?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;render();},120);});

  const initXUi=()=>{
    const cfg={startDate:'',time:'20:30',weekday1:2,weekday2:4,batchSize:8,startNumber:1,imageRoot:'C:\\RPA\\art_guide\\images',...(xState.config||{})};
    if(!cfg.startDate){
      const d=new Date();d.setDate(d.getDate()+1);
      for(let i=0;i<7&&!([cfg.weekday1,cfg.weekday2].includes(d.getDay()));i++) d.setDate(d.getDate()+1);
      cfg.startDate=isoDate(d);
    }
    if(el.xStartDate) el.xStartDate.value=cfg.startDate;
    if(el.xTime) el.xTime.value=cfg.time;
    if(el.xWeekday1) el.xWeekday1.value=String(cfg.weekday1);
    if(el.xWeekday2) el.xWeekday2.value=String(cfg.weekday2);
    if(el.xBatchSize) el.xBatchSize.value=String(cfg.batchSize);
    if(el.xStartNumber) el.xStartNumber.value=String(cfg.startNumber);
    if(el.xImageRoot) el.xImageRoot.value=cfg.imageRoot;
    [el.xStartDate,el.xTime,el.xWeekday1,el.xWeekday2,el.xBatchSize,el.xStartNumber,el.xImageRoot].forEach(x=>x?.addEventListener('change',()=>{saveXConfig();refreshXStats();}));
    refreshXStats();
  };
  root.querySelector('[data-x-export-batch]')?.addEventListener('click',async()=>{
    try{saveXConfig();showToast('予約投稿一式を作成しています…');await exportRpaBatch();}
    catch(err){console.error(err);showToast(err?.message||'予約投稿一式の出力に失敗しました');}
  });
  root.querySelector('[data-x-undo-last]')?.addEventListener('click',()=>{
    if(!xState.lastBatchIds.length){showToast('戻せる直前バッチがありません');return;}
    xState.lastBatchIds.forEach(id=>delete xState.exported[id]);
    const n=xState.lastBatchIds.length;xState.lastBatchIds=[];saveX();refreshXStats();render();showToast(`直前の${n}件を未出力に戻しました`);
  });
  root.querySelector('[data-x-reset-exported]')?.addEventListener('click',()=>{
    if(!window.confirm('X出力済みの記録を全件リセットし、開始PostNumberを1に戻しますか？')) return;
    xState.exported={};
    xState.lastBatchIds=[];
    xState.config={...(xState.config||{}),startNumber:1};
    if(el.xStartNumber) el.xStartNumber.value='1';
    saveX();
    refreshXStats();
    render();
    showToast('X出力済みを全件リセットし、開始PostNumberを1に戻しました');
  });
  root.querySelector('[data-review-page]')?.addEventListener('click',()=>{
    if(!pageItems.length){showToast('このページに作品がありません');return;}
    pageItems.forEach(w=>{
      const s=stateFor(w.id);
      s.issues=[];
      s.issueNotes={};
      s.reviewed=true;
    });
    save();
    const count=pageItems.length;
    render();
    showToast(`${count}作品のズレ記録を解除し、確認済みにしました`);
  });
  root.querySelector('[data-copy-issues]')?.addEventListener('click',async()=>{
    const rows=all.filter(w=>hasIssue(w.id)).map(w=>{
      const s=stateFor(w.id);
      const memos=(s.issues||[]).map(i=>`0${i+1}: ${s.issueNotes?.[i]||''}`).filter(Boolean);
      if(s.note) memos.push(`全体: ${s.note}`);
      return `${w.id}\t${w.artist}\t${w.work}\t${s.issues.map(i=>'0'+(i+1)).join(',')}\t${memos.join(' / ')}`;
    });
    const text=rows.length?`ID\t画家\t作品\tズレ\tメモ\n${rows.join('\n')}`:'ズレ記録はありません。';
    try{await navigator.clipboard.writeText(text);showToast('ズレ一覧をコピーしました');}catch(_){showToast('コピーできませんでした');}
  });
  root.querySelector('[data-export-page]')?.addEventListener('click',async()=>{
    const targets=pageItems.filter(w=>!isIncomplete(w));
    if(!targets.length){showToast('このページに出力できる作品がありません');return;}
    if(targets.length>8&&!window.confirm(`このページの ${targets.length} 作品について、4枚ずつPNGを書き出します。
ブラウザで複数ダウンロードの許可が必要になる場合があります。続けますか？`)) return;
    try{
      showToast(`このページの ${targets.length} 作品を順番に書き出しています…`);
      for(const work of targets){ await exportWorkSet(work,{silent:true}); await sleep(260); }
      showToast(`${targets.length}作品のX用4枚を書き出しました`);
    }catch(err){ showToast(err?.message||'一括書き出しに失敗しました'); }
  });
  root.querySelector('[data-export-csv]')?.addEventListener('click',()=>{
    const quote=v=>`"${String(v??'').replace(/"/g,'""')}"`;
    const rows=[['ID','範囲','画家','作品','ズレ','確認済み','01メモ','02メモ','03メモ','作品全体メモ']];
    all.forEach(w=>{const s=stateFor(w.id);rows.push([w.id,w.scope,w.artist,w.work,(s.issues||[]).map(i=>'0'+(i+1)).join(' / '),s.reviewed?'YES':'NO',s.issueNotes?.[0]||'',s.issueNotes?.[1]||'',s.issueNotes?.[2]||'',s.note||'']);});
    const blob=new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='artwork-visual-inspection.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('CSVを書き出しました');
  });
  initXUi();
  render();
})();

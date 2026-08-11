const toc=document.querySelector('.rail');
const tocButton=document.createElement('button');
tocButton.type='button';
tocButton.className='nav-toggle';
tocButton.innerHTML='<i data-lucide="panel-left" aria-hidden="true"></i>';
tocButton.setAttribute('aria-controls','brief-navigation');
tocButton.setAttribute('aria-label','목차 접기');
tocButton.title='목차 접기';
toc?.setAttribute('id','brief-navigation');
document.body.append(tocButton);
window.lucide?.createIcons();

document.querySelectorAll('.head h2 br').forEach(lineBreak=>{
  lineBreak.replaceWith(document.createTextNode(' '));
});

function setNavigation(hidden){
  document.body.classList.toggle('nav-hidden',hidden);
  tocButton.setAttribute('aria-expanded',String(!hidden));
  const label=hidden?'목차 열기':'목차 접기';
  tocButton.setAttribute('aria-label',label);
  tocButton.title=label;
}

setNavigation(window.innerWidth<=1000);
tocButton.addEventListener('click',()=>setNavigation(!document.body.classList.contains('nav-hidden')));
document.querySelectorAll('.rail nav a').forEach(link=>link.addEventListener('click',()=>{if(window.innerWidth<=1000)setNavigation(true);}));
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.body.classList.contains('nav-hidden')){setNavigation(true);tocButton.focus();}});

(function initDeckZoom(){
  const STORAGE_KEY='ur-deck-zoom';
  const MIN=0.65, MAX=1.5, STEP=0.05;
  let zoom=Number(sessionStorage.getItem(STORAGE_KEY))||1;
  const badge=document.createElement('div');
  badge.className='zoom-badge';
  badge.setAttribute('aria-live','polite');
  document.body.append(badge);

  function apply(next, flash){
    zoom=Math.round(Math.min(MAX, Math.max(MIN, next))*100)/100;
    document.documentElement.style.zoom=String(zoom);
    sessionStorage.setItem(STORAGE_KEY, String(zoom));
    badge.textContent=Math.round(zoom*100)+'%';
    badge.dataset.active=zoom===1?'0':'1';
    if(flash!==false){
      badge.classList.add('show');
      clearTimeout(badge._timer);
      badge._timer=setTimeout(()=>badge.classList.remove('show'),900);
    }
  }

  window.__deckZoom={
    adjust(delta){ apply(zoom+delta); },
    set(value){ apply(value); },
    reset(){ apply(1); },
  };

  apply(zoom, false);

  window.addEventListener('wheel',(event)=>{
    if(!(event.ctrlKey||event.metaKey)) return;
    event.preventDefault();
    window.__deckZoom.adjust(event.deltaY>0?-STEP:STEP);
  },{passive:false, capture:true});

  window.addEventListener('keydown',(event)=>{
    if(!(event.ctrlKey||event.metaKey)) return;
    if(event.key==='='||event.key==='+'||event.code==='NumpadAdd'){
      event.preventDefault();
      window.__deckZoom.adjust(STEP);
    }
    if(event.key==='-'||event.key==='_'||event.code==='NumpadSubtract'){
      event.preventDefault();
      window.__deckZoom.adjust(-STEP);
    }
    if(event.key==='0'||event.code==='Numpad0'){
      event.preventDefault();
      window.__deckZoom.reset();
    }
  });
})();

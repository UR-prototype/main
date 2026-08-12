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

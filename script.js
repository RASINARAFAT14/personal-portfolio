(() => {
  const track = document.getElementById('galleryTrack');
  const cards = [...track.querySelectorAll('.photo-card')];
  const prev = document.querySelector('.carousel-btn.prev');
  const next = document.querySelector('.carousel-btn.next');
  const dots = document.getElementById('galleryDots');
  let index = 0;
  let timer;

  function perView() {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 980) return 3;
    return 4;
  }
  function maxIndex() { return Math.max(0, cards.length - perView()); }
  function pageCount() { return Math.max(1, Math.ceil(cards.length / perView())); }
  function buildDots(){
    dots.innerHTML='';
    for(let i=0;i<pageCount();i++){
      const b=document.createElement('button');
      b.type='button';
      b.setAttribute('aria-label',`Gallery page ${i+1}`);
      b.addEventListener('click',()=>goTo(Math.min(i*perView(),maxIndex())));
      dots.appendChild(b);
    }
  }
  function update(){
    const card = cards[0];
    if(!card) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(${-index * step}px)`;
    const currentPage = Math.floor(index / perView());
    [...dots.children].forEach((d,i)=>d.classList.toggle('active',i===currentPage));
  }
  function goTo(i){
    index=Math.max(0,Math.min(i,maxIndex()));
    update();
  }
  function advance(){
    const step=perView();
    index = index + step > maxIndex() ? 0 : index + step;
    update();
  }
  function restart(){clearInterval(timer);timer=setInterval(advance,4000)}
  function stopAuto(){clearInterval(timer);timer=null;}
  prev.addEventListener('click',()=>goTo(index-perView()));
  next.addEventListener('click',()=>goTo(index+perView()));
  window.addEventListener('resize',()=>{index=Math.min(index,maxIndex());buildDots();update()});
  // Pause only while the mouse is over a photo, then continue when it leaves.
  cards.forEach(card => {
    card.addEventListener('mouseenter', stopAuto);
    card.addEventListener('mouseleave', restart);
  });

  buildDots(); update(); restart();

  const lightbox=document.getElementById('lightbox');
  const lbImg=document.getElementById('lightboxImage');
  const lbCap=document.getElementById('lightboxCaption');
  const lbClose=document.getElementById('lightboxClose');
  const lbPrev=document.getElementById('lbPrev');
  const lbNext=document.getElementById('lbNext');
  let activePhoto=0;
  function openLightbox(i){activePhoto=i;const img=cards[i].querySelector('img');lbImg.src=img.src;lbImg.alt=img.alt;lbCap.textContent=cards[i].dataset.caption||'';lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function movePhoto(dir){activePhoto=(activePhoto+dir+cards.length)%cards.length;openLightbox(activePhoto)}
  cards.forEach((card,i)=>card.addEventListener('click',()=>openLightbox(i)));
  lbClose.addEventListener('click',closeLightbox); lbPrev.addEventListener('click',()=>movePhoto(-1)); lbNext.addEventListener('click',()=>movePhoto(1));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
  document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')movePhoto(-1);if(e.key==='ArrowRight')movePhoto(1)});
})();

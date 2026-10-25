(() => {
 const $=s=>document.querySelector(s),root=document.documentElement;
 const theme=$('#themeToggle');
 function labelTheme(){theme.setAttribute('aria-label',root.dataset.theme==='dark'?'Prepnúť na svetlý vzhľad':'Prepnúť na tmavý vzhľad');}
 labelTheme();theme.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('pcad-manual-theme',root.dataset.theme);}catch{}labelTheme();});
 const sidebar=$('#sidebar'),backdrop=$('#sidebarBackdrop'),menu=$('#menuToggle');
 function setMenu(open){sidebar.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Zavrieť obsah':'Otvoriť obsah');backdrop.hidden=!open;}
 menu.addEventListener('click',()=>setMenu(!sidebar.classList.contains('open')));backdrop.addEventListener('click',()=>setMenu(false));sidebar.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
 const current=sidebar.querySelector('[aria-current="page"]');if(current)sidebar.scrollTop=Math.max(0,current.offsetTop-sidebar.clientHeight*.45);
 const search=$('#searchDialog'),input=$('#searchInput'),results=$('#searchResults'),status=$('#searchStatus');let data=null,loading=null,selected=-1,request=0,focusBeforeSearch;
 const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 async function load(){if(data)return data;if(!loading)loading=fetch('assets/search.json').then(r=>{if(!r.ok)throw Error('Search data');return r.json();}).then(rows=>data=rows.map(r=>({...r,head:fold(r.title+' '+r.chapter),body:fold(r.text)}))).catch(e=>{loading=null;throw e;});return loading;}
 function select(index){const links=[...results.querySelectorAll('a')];if(!links.length)return;selected=(index+links.length)%links.length;for(const [i,link]of links.entries())link.classList.toggle('selected',i===selected);links[selected].scrollIntoView({block:'nearest'});}
 async function update(){const id=++request,q=fold(input.value.trim());results.replaceChildren();selected=-1;if(!q){status.textContent='Začni písať. Hľadanie funguje aj bez diakritiky.';return;}status.textContent='Vyhľadávam…';
  try{const rows=await load();if(id!==request)return;const words=q.split(/\s+/).filter(Boolean),matches=rows.filter(r=>words.every(w=>r.head.includes(w)||r.body.includes(w))).map(r=>({row:r,score:(r.head.includes(q)?100:0)+words.reduce((n,w)=>n+(r.head.includes(w)?18:1),0)})).sort((a,b)=>b.score-a.score).slice(0,16);
   const count=matches.length,label=count===16?'Najlepších 16 výsledkov':count===1?'Nájdený 1 výsledok':count<5?'Nájdené '+count+' výsledky':'Nájdených '+count+' výsledkov';
   status.textContent=count?`${label} pre „${input.value.trim()}“.`:'Nič sa nenašlo. Skús názov funkcie alebo kratší výraz.';
   for(const {row:r}of matches){const link=document.createElement('a');link.className='search-result';link.href=r.url;const chapter=document.createElement('small'),title=document.createElement('strong'),snippet=document.createElement('p');chapter.textContent=r.chapter;title.textContent=r.title;const at=Math.max(0,r.body.indexOf(words[0])-65);snippet.textContent=(at?'…':'')+r.text.slice(at,at+190)+(r.text.length>at+190?'…':'');link.append(chapter,title,snippet);link.addEventListener('click',()=>search.close());results.append(link);}
  }catch{if(id===request)status.textContent='Vyhľadávanie sa nepodarilo načítať. Kapitoly môžeš ďalej otvárať z obsahu.';}
 }
 function openSearch(){if(search.open)return;focusBeforeSearch=document.activeElement;search.showModal();input.focus();void load().catch(()=>{});void update();}
 $('#searchOpen').addEventListener('click',openSearch);input.addEventListener('input',update);search.addEventListener('close',()=>focusBeforeSearch?.focus());
 input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();select(selected<0?(e.key==='ArrowDown'?0:-1):selected+(e.key==='ArrowDown'?1:-1));}if(e.key==='Enter'){e.preventDefault();const links=results.querySelectorAll('a');if(links.length)links[Math.max(0,selected)].click();}});
 search.querySelector('form').addEventListener('submit',e=>{if(e.submitter)return;e.preventDefault();});
 search.addEventListener('click',e=>{if(e.target===search){const r=search.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)search.close();}});
 const imageDialog=$('#imageDialog'),preview=$('#imagePreview');let focusBeforeImage;
 document.addEventListener('click',e=>{const link=e.target.closest('[data-image-open]');if(!link)return;e.preventDefault();focusBeforeImage=link;preview.src=link.href;preview.alt=link.querySelector('img').alt;$('#imageDescription').textContent=preview.alt;imageDialog.showModal();});
 imageDialog.addEventListener('close',()=>{preview.removeAttribute('src');focusBeforeImage?.focus();});imageDialog.addEventListener('click',e=>{if(e.target===imageDialog)imageDialog.close();});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape')setMenu(false);});
 const tocLinks=[...document.querySelectorAll('.page-toc a')];
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){for(const a of tocLinks)a.classList.toggle('current',a.hash==='#'+entry.target.id);}},{rootMargin:'-88px 0px -65% 0px'});for(const h of document.querySelectorAll('article h2[id]'))observer.observe(h);}
})();

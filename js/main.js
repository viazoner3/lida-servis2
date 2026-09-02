
async function loadComponent(id,url){
 const el=document.getElementById(id); if(!el)return;
 try{el.innerHTML=await (await fetch(url)).text();}catch(e){}
}
function initSite(){
 document.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')));
 const burger=document.querySelector('.burger'), nav=document.querySelector('.mobile-nav');
 if(burger&&nav) burger.addEventListener('click',()=>nav.classList.toggle('open'));
 const form=document.querySelector('#leadForm');
 if(form) form.addEventListener('submit',e=>{e.preventDefault();form.innerHTML='<div style="text-align:center;padding:35px"><i class="fa-solid fa-circle-check" style="font-size:48px;color:#16a34a"></i><h3 style="color:#132B4F;margin:12px 0">Спасибо за заявку!</h3><p style="color:#687386">Специалист «Лида-Сервис» свяжется с вами в рабочее время.</p></div>'});
 const range=document.querySelector('#amount'), out=document.querySelector('#amountOut');
 if(range&&out) range.addEventListener('input',()=>out.textContent=Number(range.value).toLocaleString('ru-RU')+' BYN');
 const cookie=document.querySelector('.cookie'), ok=document.querySelector('#cookieOk');
 if(cookie&&!localStorage.getItem('cookie')) setTimeout(()=>cookie.classList.add('show'),700);
 if(ok)ok.addEventListener('click',()=>{localStorage.setItem('cookie','1');cookie.classList.remove('show')});
}
Promise.all([loadComponent('siteHeader','components/header.html'),loadComponent('siteFooter','components/footer.html')]).then(initSite);

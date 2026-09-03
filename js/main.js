document.addEventListener('DOMContentLoaded', async ()=>{
  async function include(id,file){
    const el=document.getElementById(id);
    if(!el)return;
    try{
      const r=await fetch(file);
      el.innerHTML=await r.text();
    }catch(e){console.error(e)}
  }

  await include('siteHeader','components/header.html');
  await include('siteFooter','components/footer.html');

  const burger=document.getElementById('burger'), mobileNav=document.getElementById('mobileNav');
  if(burger&&mobileNav){
    burger.addEventListener('click',()=>mobileNav.classList.toggle('open'));
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileNav.classList.remove('open')));
  }

  const scrollTopBtn=document.getElementById('scrollTop');
  if(scrollTopBtn){
    window.addEventListener('scroll',()=>scrollTopBtn.classList.toggle('visible',window.scrollY>400));
    scrollTopBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }

  const header=document.getElementById('header');
  if(header)window.addEventListener('scroll',()=>header.style.boxShadow=window.scrollY>20?'0 2px 20px rgba(0,0,0,.1)':'0 2px 10px rgba(0,0,0,.05)');

  // Homepage document tabs.
  const tabs=document.querySelectorAll('.doc-tab'), list=document.getElementById('docList');
  if(tabs.length&&list){
    const docs={
      legal:['Уставные документы (копия)','Свидетельство о государственной регистрации','Свидетельство о постановке на учёт в налоговом органе','Бухгалтерская отчётность за последний отчётный период','Финансовая отчётность за последние 12 месяцев','Документы, подтверждающие полномочия руководителя','Карточка предприятия с банковскими реквизитами','Бизнес-план или обоснование необходимости приобретения имущества','Документы на приобретаемое имущество (коммерческое предложение, счёт)'],
      ip:['Паспорт индивидуального предпринимателя','Свидетельство о государственной регистрации ИП','Свидетельство о постановке на учёт в налоговом органе','Налоговая декларация за последний отчётный период','Выписка из банка о движении средств по счетам за 6 месяцев','Документы, подтверждающие доходы','Карточка предприятия с банковскими реквизитами','Документы на приобретаемое имущество'],
      phys:['Паспорт гражданина Республики Беларусь','Справка о доходах по форме 1-НДФЛ или справка с места работы','Копия трудовой книжки, заверенная работодателем','Документы, подтверждающие наличие первоначального взноса','Документы на приобретаемое имущество']
    };
    const render=t=>list.innerHTML=docs[t].map((d,i)=>`<div class="doc-item"><div class="doc-check">${i+1}</div><div class="doc-text">${d}</div></div>`).join('');
    render('legal');
    tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');render(t.dataset.tab)}));
  }

  // FAQ.
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q=item.querySelector('.faq-q');
    if(q)q.addEventListener('click',()=>{
      const open=item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
      if(!open)item.classList.add('open');
    });
  });

  // Leasing calculators: same calculation logic on the homepage and on every leasing-type page.
  document.querySelectorAll('.leasing-calculator').forEach(calc=>{
    const typeSelect=calc.querySelector('#calcType');
    const price=calc.querySelector('#calcPrice, #detailCalcPrice');
    const adv=calc.querySelector('#calcAdv, #detailCalcAdv');
    const term=calc.querySelector('#calcTerm, #detailCalcTerm');
    const advValue=calc.querySelector('#advValue, #detailAdvValue');
    const termValue=calc.querySelector('#termValue, #detailTermValue');
    const payment=calc.querySelector('#calcPayment, #detailCalcPayment');
    if(!price||!adv||!term||!payment)return;

    const format=n=>Math.round(n).toLocaleString('ru-RU').replace(/\u00a0/g,' ');
    const update=()=>{
      const p=Math.max(0,Number(price.value)||0);
      const a=Math.min(100,Math.max(0,Number(adv.value)||0));
      const t=Math.max(1,Number(term.value)||1);
      const monthly=(p*(1-a/100))/t;
      payment.innerHTML=`${format(monthly)} <span>BYN</span>`;
      if(advValue)advValue.textContent=`${a}%`;
      if(termValue)termValue.textContent=`${t} мес.`;
    };
    [price,adv,term].forEach(el=>el.addEventListener('input',update));
    if(typeSelect)typeSelect.addEventListener('change',update);
    update();
  });

  // Identical application form behavior on the homepage and all leasing-type pages.
  document.querySelectorAll('#leadForm').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const c=form.closest('.form-card')?.querySelector('#formContent');
      const s=form.closest('.form-card')?.querySelector('#formSuccess');
      if(c&&s){c.style.display='none';s.style.display='block';}
    });
  });

  // Cookie banner.
  const accept=document.getElementById('cookieAccept'),decline=document.getElementById('cookieDecline'),banner=document.getElementById('cookieBanner');
  if(accept&&decline&&banner){
    if(!localStorage.getItem('cookie_consent'))setTimeout(()=>banner.classList.add('show'),800);
    accept.addEventListener('click',()=>{localStorage.setItem('cookie_consent','accepted');banner.classList.remove('show')});
    decline.addEventListener('click',()=>{localStorage.setItem('cookie_consent','declined');banner.classList.remove('show')});
  }
});

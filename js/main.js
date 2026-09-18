document.addEventListener('DOMContentLoaded', async ()=>{
  const metrGoal=(goal,params)=>{ if(typeof window.ym==='function') window.ym(112380601,'reachGoal',goal,params||{}); };
  async function include(id,file){
    const el=document.getElementById(id);
    if(!el)return;
    if(el.innerHTML.trim()) return;
    try{
      const r=await fetch(file);
      el.innerHTML=await r.text();
    }catch(e){console.error(e)}
  }

  await include('siteHeader','components/header.html');
  await include('siteFooter','components/footer.html');

  // Analytics goals. The Yandex.Metrica counter is embedded in each HTML page.
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-metrika-goal]');
    if(link) metrGoal(link.dataset.metrikaGoal);
    const fileLink=e.target.closest('a[href]');
    if(fileLink && /\.(pdf|jpg|jpeg|png|doc|docx|xls|xlsx)$/i.test(fileLink.getAttribute('href')||'')){
      metrGoal('document_download',{url:fileLink.href});
    }
  });

  // Correct anchor positioning after navigating from secondary pages.
  // Header/footer are loaded asynchronously, so the browser may calculate the
  // hash position before the fixed header changes the document layout.
  const hash = window.location.hash;
  if(hash){
    setTimeout(()=>{
      const target=document.querySelector(hash);
      if(target){
        const headerHeight=document.getElementById('header')?.offsetHeight || 80;
        const top=target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({top,behavior:'auto'});
      }
    },50);
  }

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

  // Approximate first-year payment schedule: remaining principal + monthly interest.
  // The 8% annual rate is deliberately a conditional example value and is isolated here
  // so the calculation formula/rate can be replaced later without changing the UI.
  const scheduleRate=0.08;
  const scheduleFormat=n=>Number(n||0).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}).replace(/\u00a0/g,' ');
  const closeSchedule=()=>document.getElementById('scheduleModal')?.classList.remove('show');
  const openSchedule=(calc)=>{
    const price=calc.querySelector('#calcPrice, #detailCalcPrice, #infoCalcPrice');
    const adv=calc.querySelector('#calcAdv, #detailCalcAdv, #infoCalcAdv');
    const term=calc.querySelector('#calcTerm, #detailCalcTerm, #infoCalcTerm');
    if(!price||!adv||!term)return;
    const assetPrice=Math.max(0,Number(price.value)||0);
    const advancePct=Math.min(100,Math.max(0,Number(adv.value)||0));
    const months=Math.max(1,Number(term.value)||1);
    const advance=assetPrice*advancePct/100;
    const financed=Math.max(0,assetPrice-advance);
    const principalPerMonth=financed/months;
    let remaining=financed;
    let rows='';
    let yearTotal=0;
    for(let month=1;month<=Math.min(12,months);month++){
      const interest=remaining*scheduleRate/12;
      const principal=Math.min(principalPerMonth,remaining);
      const payment=principal+interest;
      yearTotal+=payment;
      const after=Math.max(0,remaining-principal);
      rows+=`<tr><td>${month}</td><td>${scheduleFormat(principal)}</td><td>${scheduleFormat(interest)}</td><td><strong>${scheduleFormat(payment)}</strong></td></tr>`;
      remaining=after;
    }
    let modal=document.getElementById('scheduleModal');
    if(!modal){
      modal=document.createElement('div');
      modal.className='schedule-modal';
      modal.id='scheduleModal';
      document.body.appendChild(modal);
      modal.addEventListener('click',e=>{if(e.target===modal)closeSchedule()});
      document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSchedule()});
    }
    modal.innerHTML=`<div class="schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="scheduleTitle">
      <div class="schedule-head"><h3 id="scheduleTitle">Примерный график на первый год</h3><button class="schedule-close" type="button" aria-label="Закрыть"><i class="fas fa-times"></i></button></div>
      <div class="schedule-body">
        <div class="schedule-summary">
          <div class="schedule-summary-item"><span>Стоимость</span><strong>${scheduleFormat(assetPrice)} BYN</strong></div>
          <div class="schedule-summary-item"><span>Аванс</span><strong>${scheduleFormat(advance)} BYN (${advancePct}%)</strong></div>
          <div class="schedule-summary-item"><span>Финансирование</span><strong>${scheduleFormat(financed)} BYN</strong></div>
          <div class="schedule-summary-item"><span>Срок</span><strong>${months} мес.</strong></div>
          <div class="schedule-summary-item"><span>Условная ставка</span><strong>8% годовых</strong></div>
          <div class="schedule-summary-item"><span>Сумма за 12 мес.</span><strong>${scheduleFormat(yearTotal)} BYN</strong></div>
        </div>
        <div class="schedule-table-wrap"><table class="schedule-table"><thead><tr><th>Месяц</th><th>Основной долг</th><th>Проценты</th><th>Платёж</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="schedule-note"><strong>Важно:</strong> 8% — условное значение для примера. В расчёте используется дифференцированный платёж: основной долг погашается равными долями, а проценты каждый месяц начисляются на остаток основного долга. Фактический график определяется условиями конкретной сделки.</p>
      </div></div>`;
    modal.classList.add('show');
    modal.querySelector('.schedule-close').addEventListener('click',closeSchedule);
  };
  document.querySelectorAll('[data-schedule-trigger]').forEach(btn=>{
    btn.addEventListener('click',()=>openSchedule(btn.closest('.leasing-calculator')));
  });

  // Informational calculator on "Что такое лизинг" page. It shows an orientational first payment; later payments decrease.
  const infoCalc=document.querySelector('.leasing-calculator #infoCalcPrice');
  if(infoCalc){
    const box=infoCalc.closest('.leasing-calculator');
    const adv=box.querySelector('#infoCalcAdv'), term=box.querySelector('#infoCalcTerm'), payment=box.querySelector('#infoCalcPayment');
    const av=box.querySelector('#infoAdvValue'), tv=box.querySelector('#infoTermValue');
    const format=n=>Math.round(n).toLocaleString('ru-RU').replace(/\u00a0/g,' ');
    const update=()=>{const p=Math.max(0,Number(infoCalc.value)||0), a=Math.min(100,Math.max(0,Number(adv.value)||0)), t=Math.max(1,Number(term.value)||1); const first=(p*(1-a/100))/t; payment.innerHTML=`${format(first)} <span>BYN</span>`; av.textContent=`${a}%`; tv.textContent=`${t} мес.`;};
    [infoCalc,adv,term].forEach(el=>el.addEventListener('input',update)); update();
  }

  // Privacy modal used from application forms. The footer itself links to the standalone privacy page.
  if(!document.getElementById('privacyModal')){
    const modal=document.createElement('div');
    modal.className='modal-overlay';
    modal.id='privacyModal';
    modal.innerHTML=`
      <div class="modal-content">
        <div class="modal-header">
          <h3>Политика конфиденциальности</h3>
          <button class="modal-close" type="button" aria-label="Закрыть"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <h4>1. Общие положения</h4>
          <p>Настоящая Политика конфиденциальности разработана в соответствии с законодательством Республики Беларусь, в том числе Законом Республики Беларусь от 10 ноября 2008 года № 455-З «Об информации, информатизации и защите информации», Законом Республики Беларусь от 7 мая 2021 года № 99-З «О защите персональных данных».</p>
          <h4>2. Основные понятия</h4>
          <ul>
            <li><strong>Персональные данные</strong> — любая информация, относящаяся к прямо или косвенно определённому физическому лицу.</li>
            <li><strong>Обработка персональных данных</strong> — любое действие с персональными данными.</li>
            <li><strong>Файлы cookie</strong> — небольшие текстовые файлы, сохраняющиеся на устройстве пользователя.</li>
          </ul>
          <h4>3. Состав обрабатываемых персональных данных</h4>
          <ul>
            <li>Фамилия, имя, отчество</li>
            <li>Адрес электронной почты (e-mail)</li>
            <li>Номер телефона</li>
            <li>Данные, полученные при заполнении форм на Сайте</li>
            <li>Технические данные: IP-адрес, информация о браузере, файлы cookie</li>
          </ul>
          <h4>4. Цели обработки персональных данных</h4>
          <ul>
            <li>Обработка заявок, поступивших через формы обратной связи</li>
            <li>Консультирование по вопросам лизинговых услуг</li>
            <li>Заключение и исполнение договоров лизинга</li>
            <li>Информирование об услугах Компании</li>
            <li>Улучшение работы Сайта и анализ статистики посещений</li>
          </ul>
          <h4>5. Права субъекта персональных данных</h4>
          <ul>
            <li>Получать информацию об обработке своих персональных данных</li>
            <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
            <li>Отозвать согласие на обработку персональных данных</li>
            <li>Обжаловать действия Оператора в уполномоченный орган или в судебном порядке</li>
          </ul>
          <h4>6. Контактная информация</h4>
          <ul>
            <li><strong>ООО «Лида-Сервис»</strong></li>
            <li>Адрес: 231291, Гродненская область, г. Лида, ул. Кирова, д. 27, пом. 9</li>
            <li>Телефон: <a href="tel:+375296444680">8 (029) 644-46-80</a></li>
            <li>E-mail: <a href="mailto:info@lida-servis.by">info@lida-servis.by</a></li>
          </ul>
          <p><em>Дата последнего обновления: 1 сентября 2026 года</em></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" type="button">Закрыть</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close=()=>modal.classList.remove('show');
    window.openPrivacyModal=()=>modal.classList.add('show');
    window.closePrivacyModal=close;
    modal.querySelector('.modal-close').addEventListener('click',close);
    modal.querySelector('.modal-footer button').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  // Real application submission: send form data to the site's PHP mail handler.
  document.querySelectorAll('#leadForm').forEach(form=>{
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const button=form.querySelector('button[type="submit"]');
      const originalText=button?.textContent || 'Отправить заявку';
      const c=form.closest('.form-card')?.querySelector('#formContent');
      const s=form.closest('.form-card')?.querySelector('#formSuccess');
      const errorBox=form.closest('.form-card')?.querySelector('.form-submit-error');
      if(button){button.disabled=true;button.textContent='Отправка...';}
      if(errorBox) errorBox.remove();
      try{
        const response=await fetch('submit.php',{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
        const data=await response.json().catch(()=>({success:false,message:'Сервер вернул некорректный ответ.'}));
        if(!response.ok || !data.success) throw new Error(data.message || 'Не удалось отправить заявку.');
        metrGoal('form_submit',{form:form.id || 'leadForm',page:location.pathname});
        if(c&&s){c.style.display='none';s.style.display='block';}
      }catch(err){
        const box=document.createElement('div');
        box.className='form-submit-error';
        box.style.cssText='margin-top:16px;padding:12px 14px;border-radius:10px;background:#fff1f1;color:#a33;font-size:14px;line-height:1.5;';
        box.textContent=err.message || 'Не удалось отправить заявку. Позвоните нам или попробуйте ещё раз.';
        form.appendChild(box);
        if(button){button.disabled=false;button.textContent=originalText;}
      }
    });
  });

  // Cookie banner.
  const accept=document.getElementById('cookieAccept'),decline=document.getElementById('cookieDecline'),banner=document.getElementById('cookieBanner');
  if(accept&&decline&&banner){
    if(!localStorage.getItem('cookie_consent'))setTimeout(()=>banner.classList.add('show'),800);
    accept.addEventListener('click',()=>{localStorage.setItem('cookie_consent','accepted');banner.classList.remove('show');window.dispatchEvent(new Event('lida-cookie-accepted'));});
    decline.addEventListener('click',()=>{localStorage.setItem('cookie_consent','declined');banner.classList.remove('show')});
  }
});

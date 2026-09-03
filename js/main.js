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
            <li>Адрес: 231300, Гродненская область, г. Лида, ул. Кирова, д. 27, пом. 9</li>
            <li>Телефон: <a href="tel:+375154659775">8 (0154) 65-97-75</a></li>
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

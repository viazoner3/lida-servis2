/*
 * Яндекс.Метрика — единая точка подключения.
 *
 * Сейчас счётчик отключён: замените 0 на ID счётчика, который будет создан
 * в Яндекс.Метрике. После этого код начнёт загружаться только после согласия
 * пользователя на использование аналитических cookie.
 */
(function () {
  var COUNTER_ID = 0; // <-- сюда вписать ID Яндекс.Метрики
  var STORAGE_KEY = 'cookie_consent';
  var started = false;

  function load() {
    if (started || !COUNTER_ID || window.ym) return;
    started = true;

    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t), a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    window.ym(COUNTER_ID, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
      trackHash: true
    });

    var noscript = document.createElement('noscript');
    noscript.innerHTML = '<div><img src="https://mc.yandex.ru/watch/' + COUNTER_ID + '" style="position:absolute;left:-9999px" alt="" /></div>';
    document.body.appendChild(noscript);
  }

  window.lidaMetrikaGoal = function (goal, params) {
    if (window.ym && COUNTER_ID) window.ym(COUNTER_ID, 'reachGoal', goal, params || {});
  };

  window.lidaMetrikaInit = load;

  if (localStorage.getItem(STORAGE_KEY) === 'accepted') load();
  window.addEventListener('lida-cookie-accepted', load);
})();

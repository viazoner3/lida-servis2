/*
 * Яндекс.Метрика: helper for site goals.
 * The counter itself is embedded directly in each HTML page.
 */
(function () {
  var COUNTER_ID = 112380601;
  window.lidaMetrikaGoal = function (goal, params) {
    if (typeof window.ym === 'function') {
      window.ym(COUNTER_ID, 'reachGoal', goal, params || {});
    }
  };
})();

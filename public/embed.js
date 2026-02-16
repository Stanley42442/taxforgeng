/**
 * TaxForge NG — Embeddable Calculator SDK
 * https://taxforgeng.com
 *
 * Usage:
 *   <div id="taxforge-calculator"></div>
 *   <script src="https://taxforgeng.com/embed.js"></script>
 *   <script>
 *     TaxForge.init({
 *       container: '#taxforge-calculator',
 *       apiKey: 'YOUR_API_KEY',
 *       onCalculate: function(result) { console.log(result); }
 *     });
 *   </script>
 */
(function () {
  'use strict';

  // Detect base URL from the script's own src attribute
  var scripts = document.getElementsByTagName('script');
  var baseUrl = 'https://taxforgeng.com';
  for (var i = scripts.length - 1; i >= 0; i--) {
    var src = scripts[i].src || '';
    if (src.indexOf('embed.js') !== -1) {
      baseUrl = src.replace(/\/embed\.js.*$/, '');
      break;
    }
  }

  function init(options) {
    if (!options) {
      console.error('[TaxForge] init() requires an options object.');
      return;
    }

    if (!options.container) {
      console.error('[TaxForge] "container" option is required (CSS selector or DOM element).');
      return;
    }

    if (!options.apiKey) {
      console.error('[TaxForge] "apiKey" option is required.');
      return;
    }

    var container =
      typeof options.container === 'string'
        ? document.querySelector(options.container)
        : options.container;

    if (!container) {
      console.error('[TaxForge] Container element not found: ' + options.container);
      return;
    }

    var height = options.height || '800';
    var maxWidth = options.maxWidth || '520';

    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/embed/calculator?key=' + encodeURIComponent(options.apiKey);
    iframe.style.width = '100%';
    iframe.style.maxWidth = maxWidth + 'px';
    iframe.style.height = height + 'px';
    iframe.style.border = 'none';
    iframe.style.colorScheme = 'light';
    iframe.style.borderRadius = '12px';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';
    iframe.loading = 'lazy';
    iframe.title = 'TaxForge NG Calculator';
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');

    container.innerHTML = '';
    container.appendChild(iframe);

    // Listen for calculation results from the iframe
    if (typeof options.onCalculate === 'function') {
      window.addEventListener('message', function (event) {
        if (
          event.source === iframe.contentWindow &&
          event.data &&
          event.data.type === 'taxforge-calculation'
        ) {
          options.onCalculate(event.data.data);
        }
      });
    }
  }

  window.TaxForge = { init: init };
})();

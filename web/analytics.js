(function (window) {
  function AnalyticsClient() {
    this.queue = [];
  }

  AnalyticsClient.prototype.track = function (eventName, properties) {
    var event = {
      event: eventName,
      properties: properties || {},
      timestamp: new Date().toISOString(),
      path: window.location.pathname
    };
    this.queue.push(event);
    if (window.console && console.debug) {
      console.debug('[analytics]', event);
    }
  };

  var client = new AnalyticsClient();
  window.analytics = client;

  document.addEventListener('DOMContentLoaded', function () {
    client.track('page_viewed', { page: document.title });
  });
})(window);

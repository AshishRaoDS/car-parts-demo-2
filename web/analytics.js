(function (window) {
  function createClient() {
    var events = [];

    function track(name, props) {
      var event = {
        name: name,
        props: props || {},
        timestamp: new Date().toISOString()
      };
      events.push(event);
      if (window.console && window.console.debug) {
        window.console.debug('[analytics]', event.name, event.props);
      }
    }

    return {
      track: track,
      getEvents: function () { return events.slice(); }
    };
  }

  window.analytics = window.analytics || createClient();
  window.analytics.track('page_viewed', { path: window.location.pathname });
})(window);

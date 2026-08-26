window.analytics = window.analytics || {
  events: [],
  track: function (name, props) {
    var payload = { name: name, props: props || {}, ts: new Date().toISOString() };
    this.events.push(payload);
    if (window.console && console.debug) {
      console.debug('[analytics]', payload.name, payload.props);
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.analytics.track('page_viewed', { path: window.location.pathname });

  var cta = document.getElementById('browse-cta');
  if (cta) {
    cta.addEventListener('click', function () {
      window.analytics.track('landing_cta_clicked', { destination: 'listing' });
    });
  }
});

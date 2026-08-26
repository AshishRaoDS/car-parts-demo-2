window.Analytics = window.Analytics || {
  track: function (event, props) {
    window.__analyticsEvents = window.__analyticsEvents || [];
    window.__analyticsEvents.push({ event: event, props: props || {}, ts: Date.now() });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.Analytics.track('page_viewed', { page: 'landing' });

  var cta = document.getElementById('cta-shop');
  if (cta) {
    cta.addEventListener('click', function () {
      window.Analytics.track('cta_clicked', { page: 'landing', target: 'listing' });
    });
  }
});

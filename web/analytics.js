window.analytics = {
  events: [],
  track(name, props) {
    this.events.push({ name, props: props || {}, ts: Date.now() });
    console.log('[analytics]', name, props || {});
  }
};
window.analytics.track('page_viewed', { path: window.location.pathname });

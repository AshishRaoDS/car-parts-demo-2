window.Analytics = (function () {
  function track(event, props) {
    console.log("[analytics]", event, props || {});
  }
  document.addEventListener("DOMContentLoaded", function () {
    track("page_viewed", { path: window.location.pathname });
  });
  return { track: track };
})();

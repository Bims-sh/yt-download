// this can only be used with https enabled because the browser will block the request
// you might have to trust the unsafe page once to get it to work
javascript: (function () {
  var url = window.location.href;
  var regex = /v=([^&]*)/;
  var match = regex.exec(url);
  var videoId = match[1];
  var downloadUrl = "https://127.0.0.1:3000/download?v=" + videoId;
  window.open(downloadUrl, "_self");
})();

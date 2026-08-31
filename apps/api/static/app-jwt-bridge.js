(function () {
  var STORAGE_KEY = "tradnest_admin_jwt";
  var origFetch = window.fetch.bind(window);

  function urlOf(input) {
    if (typeof input === "string") {
      return input;
    }
    if (input && typeof input.url === "string") {
      return input.url;
    }
    return "";
  }

  function isApiUrl(url) {
    return (
      url.indexOf("/admin") !== -1 ||
      url.indexOf("/auth") !== -1 ||
      url.indexOf("/vendor") !== -1
    );
  }

  window.fetch = function (input, init) {
    init = init ? Object.assign({}, init) : {};
    var headers = new Headers(init.headers || undefined);
    var url = urlOf(input);
    var token = localStorage.getItem(STORAGE_KEY);
    if (token && isApiUrl(url) && !headers.has("Authorization")) {
      headers.set("Authorization", "Bearer " + token);
    }
    init.headers = headers;
    return origFetch(input, init).then(function (res) {
      if (!res.ok || url.indexOf("/auth/") === -1) {
        return res;
      }
      return res
        .clone()
        .json()
        .then(function (body) {
          if (body && typeof body.token === "string") {
            localStorage.setItem(STORAGE_KEY, body.token);
          }
          return res;
        })
        .catch(function () {
          return res;
        });
    });
  };
})();

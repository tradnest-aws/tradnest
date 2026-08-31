(function () {
  var STORAGE_KEY = "tradnest_admin_jwt";
  var SDK_KEY = "medusa_auth_token";
  var origFetch = window.fetch.bind(window);

  function urlOf(input) {
    if (!input) {
      return "";
    }
    if (typeof input === "string") {
      return input;
    }
    if (typeof URL !== "undefined" && input instanceof URL) {
      return input.href;
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      return input.url;
    }
    if (typeof input.href === "string") {
      return input.href;
    }
    if (typeof input.url === "string") {
      return input.url;
    }
    return String(input);
  }

  function isApiUrl(url) {
    return (
      url.indexOf("/admin") !== -1 ||
      url.indexOf("/auth") !== -1 ||
      url.indexOf("/vendor") !== -1
    );
  }

  function rememberToken(token) {
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(SDK_KEY, token);
  }

  window.fetch = function (input, init) {
    init = init ? Object.assign({}, init) : {};
    var headers = new Headers(init.headers || undefined);
    var url = urlOf(input);
    var token = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(SDK_KEY);
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
            rememberToken(body.token);
          }
          return res;
        })
        .catch(function () {
          return res;
        });
    });
  };
})();

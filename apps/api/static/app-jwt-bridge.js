(function () {
  var STORAGE_KEY = "tradnest_admin_jwt";
  var SDK_KEY = "medusa_auth_token";
  var origFetch = window.fetch.bind(window);
  var origJson = Response.prototype.json;

  function forceJwtAuth() {
    var sdk = window.__sdk;
    if (!sdk || !sdk.client || !sdk.client.config) {
      return false;
    }
    sdk.client.config.auth = sdk.client.config.auth || {};
    sdk.client.config.auth.type = "jwt";
    return true;
  }

  function urlOf(input) {
    if (!input) {
      return "";
    }
    if (typeof input === "string") {
      return input;
    }
    try {
      if (typeof URL !== "undefined" && input instanceof URL) {
        return input.href;
      }
    } catch {
      /* ignore */
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
    try {
      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(SDK_KEY, token);
    } catch {
      /* ignore quota / private-mode */
    }
  }

  Response.prototype.json = function () {
    return origJson.call(this).then(function (body) {
      if (body && typeof body.token === "string") {
        rememberToken(body.token);
      }
      return body;
    });
  };

  window.fetch = function (input, init) {
    forceJwtAuth();
    init = init ? Object.assign({}, init) : {};
    var headers = new Headers(init.headers || undefined);
    var url = urlOf(input);
    var token = null;
    try {
      token = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(SDK_KEY);
    } catch {
      /* ignore */
    }
    if (token && isApiUrl(url) && !headers.get("Authorization")) {
      headers.set("Authorization", "Bearer " + token);
    }
    init.headers = headers;
    return origFetch(input, init);
  };

  var attempts = 0;
  (function waitForSdk() {
    if (forceJwtAuth() || attempts++ > 200) {
      return;
    }
    setTimeout(waitForSdk, 25);
  })();
})();

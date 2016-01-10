const Rx = Meteor.npmRequire("rx");
const HttpRequestOptions = {
  headers: {
    "Accept": "application/json;charset=utf-8"
  }
};

TeamCity = class TeamCity {
  constructor(serverBaseUrl, authMode = "guestAuth", authData = {}) {
    if (serverBaseUrl.endsWith("/")) {
      this.serverBaseUrl = serverBaseUrl;
    } else {
      this.serverBaseUrl = serverBaseUrl + "/";
    }

    this.authMode = authMode;
    this.authData = authData;
  }

  getBuild$(count = 100, pollInterval = 5000) {
    const refreshInterval$ = Rx.Observable.create(observer => {
      var handle = Meteor.setInterval(() => {
        observer.onNext();
      }, pollInterval);

      return () => {
        Meteor.clearInterval(handle);
      };
    });

    // running:any is needed in order to also return builds that are ongoing.
    return refreshInterval$
      .flatMap(_ => {
        return getApiResultData$(this.serverBaseUrl, this.authMode, `app/rest/builds?locator=running:any&count=${count}`).map(content => content.build);
      })
      .flatMap(builds => Rx.Observable.fromArray(builds)
        .flatMap(build => this.getBuildDetail$(build.id).map(details => _(build).extend(details)))
        .toArray())
  }

  getBuildDetail$(buildId) {
    return getApiResultData$(this.serverBaseUrl, this.authMode, `app/rest/builds/${buildId}`).share();
  }
}

function getApiResultData$(baseUrl, authMode, relativeAddress) {
  const url = `${baseUrl}${authMode}/${relativeAddress}`;

  return Rx.Observable
    .fromNodeCallback(HTTP.get)(url, HttpRequestOptions)
    .map(result => JSON.parse(result.content));
}

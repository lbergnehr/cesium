const Rx = Meteor.npmRequire("rx");
const HttpRequestOptions = {
  headers: {
    "Accept": "application/json;charset=utf-8"
  }
};

const refreshInterval$ = Rx.Observable.create(observer => {
  var handle = Meteor.setInterval(() => {
    observer.onNext();
  }, 3000);

  return () => {
    Meteor.clearInterval(handle);
  };
});

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

  getBuild$(count = 100) {
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
      .do(result => console.log(`Queried server on ${url}`))
      .map(result => JSON.parse(result.content));
}



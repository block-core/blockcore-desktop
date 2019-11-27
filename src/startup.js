
(function () {

  // function getParam(n) {
  //   var half = location.search.split(n + '=')[1];
  //   return half !== undefined ? decodeURIComponent(half.split('&')[0]) : null;
  // }

  // const coin = getParam('coin') || 'city';
  // console.log('Selected coin: ' + coin);

  // We don't really want to change the whole branding, City Hub will support multiple coins. But if anyone
  // want to fork and release a more generic app with multi-coin support, they could change top-logo this way.
  // document.getElementById('title-bar-logo').setAttribute('src', '/assets/' + coin + '/logo-full-dark.png');

  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('electron') > -1) {
    document.body.classList.add('app-electron');
  }

  //const remote = require('electron').remote;

  function init() {
    // document.getElementById("min-btn").addEventListener("click", function (e) {
    //   const window = remote.getCurrentWindow();
    //   window.minimize();
    // });

    // document.getElementById("max-btn").addEventListener("click", function (e) {
    //   const window = remote.getCurrentWindow();
    //   if (!window.isMaximized()) {
    //     window.maximize();
    //   } else {
    //     window.unmaximize();
    //   }
    // });

    // document.getElementById("close-btn").addEventListener("click", function (e) {
    //   const window = remote.getCurrentWindow();
    //   window.close();
    // });
  };

  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      init();
    }
  };
  
})();





var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

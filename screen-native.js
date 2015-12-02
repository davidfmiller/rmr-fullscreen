/* jshint undef: true,strict:true,trailing:true */
/* global document,window,Image */


/*
 * Bridge the gap between browsers' various implementations of zooming elements to full-screen.
 * https://developer.mozilla.org/en/DOM/Using_full-screen_mode
 *
 * Much love to http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
 */

/**
 @module screen
 */

(function() {

  var _bridge,
      i,
      prefix,
      extensions = ['webkit','moz','o','ms','khtml'],
      CLASSNAME = 'rmr-screen';

      _bridge = {
        prefix : '',
        supported : false,
        isFullScreen : function() { return false; },
        exit : function() { },
        request : function() { },
        eventName : null
      };

  if (typeof document.cancelFullScreen != 'undefined') { // check for native support
    _bridge.supported = true;
  }
  else {
    for (i = 0; i < extensions.length; i++ ) { // check for fullscreen support by vendor prefix

      prefix = extensions[i];
      if (typeof document[prefix + 'CancelFullScreen' ] != 'undefined') {
        _bridge.supported = true;
        _bridge.prefix = prefix;
        break;
      }
    }
  }

  if (_bridge.supported) {
    _bridge.eventName = _bridge.prefix + 'fullscreenchange';
    _bridge.request = function(node) {
      return ! prefix ? node.requestFullScreen() : node[prefix + 'RequestFullScreen']();
    };

    _bridge.exit = function(node) { return ! prefix ? document.cancelFullScreen() : document[prefix + 'CancelFullScreen'](); };
    _bridge.isFullScreen = function() {
      var r = null;
      switch (prefix) {
        case 'webkit':
          r = document.webkitIsFullScreen;
          break;
        case 'moz':
          r = document.mozFullScreenElement;
          break;
        default:
          if (document.hasOwnProperty('fullScreen')) {
            r = document.fullScreen;
          } else if (document.hasOwnProperty('fullscreen')) {
            r = document.fullscreen;
          }

          r = document[prefix + 'FullScreen'];
      }

      return r;
    };
  }

  window.Screen = function(selector) {

    this.node = document.querySelector(selector);
    this.events = {
      'exit' : function() { },
      'fullscreen' : function() { }
    };

    var $ = this;

    this.listener = function(e) {

      if ($.isFullScreen()) {
        $.events.fullscreen();
        $.node.classList.add(CLASSNAME);

      } else {
        $.events.exit();
        $.node.classList.remove(CLASSNAME);
      }
    };

    if (_bridge.prefix == 'moz') {
      document.addEventListener('mozfullscreenchange', this.listener);
    } else {
      $.node.addEventListener(_bridge.eventName, this.listener);
    }
  };


  window.Screen.prototype.isSupported = function() {
    return _bridge.supported;
  };

  window.Screen.prototype.request = function() {
      _bridge.request(this.node);
  };

  window.Screen.prototype.isFullScreen = function() {
    return _bridge.isFullScreen();
  };

  window.Screen.prototype.on = function(event, method) {
    this.events[event] = method;
  };

  window.Screen.prototype.toggle = function() {
    return this.isFullScreen() ? this.exit() : this.request();
  };

  window.Screen.prototype.exit = function() {
    _bridge.exit();
  };

  window.Screen.prototype.toString = function() {
    return 'Screen <' + this.node + '>';
  };

}());

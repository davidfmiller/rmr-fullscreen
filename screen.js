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

   /**
    * Create a new instance of 
    *
    * @param {String} selector 
    */
  window.Screen = function(node) {

    this.node = typeof node == 'string' ? document.querySelector(node) : node;

    this.events = {
      'exit' : function() { },
      'fullscreen' : function() { }
    };

    var $ = this;

    var listener = function(e) {

      if ($.isFullScreen()) {
        $.events.fullscreen();
        $.node.classList.add(CLASSNAME);

      } else {
        $.events.exit();
        $.node.classList.remove(CLASSNAME);
      }
    };

    if (_bridge.prefix == 'moz') {
      document.addEventListener('mozfullscreenchange', listener);
    } else {
      $.node.addEventListener(_bridge.eventName, listener);
    }
    
    return this;
  };

   /**
    * Determine whether or not the browser has full-screen support
    *
    * @return {Boolean} 
    */
  window.Screen.prototype.isSupported = function() {
    return _bridge.supported;
  };

   /**
    * Request full-screen mode
    *
    * @chainable
    */
  window.Screen.prototype.request = function() {
      _bridge.request(this.node);
      return this;
  };

   /**
    * Determine if the node is in full-screen mode
    *
    * @return {Boolean} 
    */
  window.Screen.prototype.isFullScreen = function() {
    return _bridge.isFullScreen();
  };

   /**
    * Assign a handler for an event
    *
    * @param {String} e - event name to attach to, one of 'fullscreen' or 'exit'
    * @param {Function} func - function to invoke when event occurs
    * @chainable
    */
  window.Screen.prototype.on = function(event, func) {
    this.events[event] = func;
    return this;
  };

  /**
    * Stops event bubbling further.
    *
    * @param {Event} e Event to prevent from bubbling further.
    * @chainable
    */
  window.Screen.prototype.toggle = function() {
    this.isFullScreen() ? this.exit() : this.request();
    return this;
  };

  /**
    * Stops event bubbling further.
    *
    * @param {Event} e Event to prevent from bubbling further.
    * @chainable
    */
  window.Screen.prototype.exit = function() {
    _bridge.exit();
    return this;
  };

  /**
    * Stops event bubbling further.
    *
    * @param {Event} e Event to prevent from bubbling further.
    */
  window.Screen.prototype.toString = function() {
    return 'Screen <' + this.node.toString() + '>';
  };

}());

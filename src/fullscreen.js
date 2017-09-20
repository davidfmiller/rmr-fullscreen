/* jshint undef: true,strict:true,trailing:true */
/* global document,window,Image,HTMLElement */


/*
 * Bridge the gap between browsers' various implementations of zooming elements to full-screen.
 * https://developer.mozilla.org/en/DOM/Using_full-screen_mode
 *
 */

/**
 @module fullscreen
 */

(function() {
  'use strict';

//  if (window.FullScreen) { return; }

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

    // normalize method to exit out of fullscreen mode
    _bridge.exit = function(node) { return ! prefix ? document.cancelFullScreen() : document[prefix + 'CancelFullScreen'](); };

    // normalize method to determine if we're currently in fullscreen mode
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
    * Create a new Screen instance
    *
    * @param {String} selector
    */
  var FullScreen = function(node) {

    this.node = typeof node == 'string' ? document.querySelector(node) : node;

    if (! (this.node instanceof HTMLElement)) {
      throw Error('Invalid FullScreen node <' + node + '>');
    }

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
  FullScreen.prototype.isSupported = function() {
    return _bridge.supported;
  };

   /**
    * Request full-screen mode
    *
    * @chainable
    */
  FullScreen.prototype.request = function() {
      _bridge.request(this.node);
      return this;
  };


   /**
    * Determine if the node is in full-screen mode
    *
    * @return {Boolean}
    */
  FullScreen.prototype.isFullScreen = function() {
    return _bridge.isFullScreen();
  };


   /**
    * Assign handler for a Screen event
    *
    * @param {String} e - event name to attach to, one of 'fullscreen' or 'exit'
    * @param {Function} func - function to invoke when event occurs
    * @chainable
    */
  FullScreen.prototype.on = function(event, func) {
    this.events[event] = func;
    return this;
  };

  /**
    * Exits full-screen mode if enabled, or requests the screen if not
    *
    * @chainable
    */
  FullScreen.prototype.toggle = function() {
    if (this.isFullScreen()) {
      this.exit();
    } else {
      this.request();
    }
    return this;
  };

  /**
    * Exit full-screen mode
    *
    * @chainable
    */
  FullScreen.prototype.exit = function() {
    _bridge.exit();
    return this;
  };

  /**
    * Return a String instance
    *
    * @return {String}
    */
  FullScreen.prototype.toString = function() {
    return 'Screen <' + this.node.toString() + '>';
  };

  module.exports = FullScreen;

}());

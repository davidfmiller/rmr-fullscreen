/* jshint undef: true,strict:true,trailing:true */
/* global YUI,document,window,Image */


/*
 * Bridge the gap between browsers' various implementations of zooming elements to full-screen.
 * https://developer.mozilla.org/en/DOM/Using_full-screen_mode
 *
 * Much love to http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
 */

/**
 @module screen
 */
YUI.add('screen', function(Y) {

  'use strict';

  var Screen,
      _bridge,
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
  } else {

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
      return ! prefix ? node._node.requestFullScreen() : node._node[prefix + 'RequestFullScreen']();
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
   @class Screen
   @constructor
   @extends Y.Base
   @param config {object}
   */
  Screen = function(config) {
    Screen.superclass.constructor.apply(this, arguments);
    if (! _bridge.supported) { return false; }

    this.set('node', config.hasOwnProperty('node') ? config.node : document.body);
    var $ = this;

    if (! this.get('node')) { return null; }

    this.set('listener', function(e) {

      /**
       Fired when the node gains full-screen control

       @event fullscreen
       */
      if ($.isFullScreen()) {
        $.fire('fullscreen');
        $.get('node').addClass(CLASSNAME);

      /**
       Fired when the node loses full-screen control

       @event exit
       */
      } else {
        $.fire('exit');
        $.get('node').removeClass(CLASSNAME);
      }
    });

    if (_bridge.prefix == 'moz') {
      document.addEventListener('mozfullscreenchange', this.get('listener'));
    } else {
      this.get('node')._node.addEventListener(_bridge.eventName, this.get('listener'));
    }
  };

  Screen.ATTRS = {

    /**
     Reference to the Node that this object is bound to

     @property node
     @type {Node}
     */
    'node' : {
      setter : function(node) {
        return Y.one(node);
      },
      writeOnce : true
    },
    'listener' : { }
  };

  Screen.NAME = 'screen';


  Y.Screen = Y.extend(Screen, Y.Base, {

    /**
     Determines if the browser is currently in full-screen mode

     @method isFullScreen
     @return {boolean}
     */
    isFullScreen : function() {
      return _bridge.isFullScreen();
    },

    /**
     Determine whether or not the browser supports full-screen elements

     @method isSupported
     @return {boolean}
     */
    isSupported : function() {
      return _bridge.supported;
    },

    /**
     A convenience method to switch between request() and exit() based on the current state

     @method toggle
     @chainable
     @see request
     @see exit
     */
    toggle : function() {
      return this.isFullScreen() ? this.exit() : this.request();
    },

    /**
     Attempt to enter fullscreen mode

     @method request
     @chainable
     */
    request : function() {
      var n = this.get('node');
      _bridge.request(n);

      return this;
    },

    /**
     Exit fullscreen mode

     @method exit
     @chainable
     */
    exit : function() {
      _bridge.exit();
      return this;
    },

    /**
     Returns a string representation of the object

     @method toString
     @return {String}
     */
    toString : function() {
      return 'Screen <' + this.get('node') + '>';
    },

    /*
     Clean up
     */
    destructor : function() {
      if (this.get('node')) {
        this.get('node')._node.removeEventListener(_bridge.eventName, this.get('listener'));
        this.set('node', null);
      }
    }
  });

}, '3.3.1', { requires : ['node', 'event', 'base']});

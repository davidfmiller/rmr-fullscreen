/*jslint browser:true,indent:2,white:true,nomen:false,plusplus:true,nomen:true,eqeq:true */
/*global YUI, window */

/*
  A module that bridges the gap between browsers' various implementations of zooming elements to full-screen.
  https://developer.mozilla.org/en/DOM/Using_full-screen_mode

  Much love to http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/
*/

YUI.add('screen', function(Y) {

  'use strict';

  var Screen, _bridge, i, prefix, extensions = ['webkit','moz','o','ms','khtml'],
      CLASSNAME = 'rmr-screen';

  // 
  _bridge = {
    prefix : '',
    supported : false,
    isFullScreen : function() { return false; },
    exit : function() { },
    request : function() { },
    eventName : null
  };

  // check for native support
  if (typeof document.cancelFullScreen != 'undefined') {
    _bridge.supported = true;
  } else {
    // check for fullscreen support by vendor prefix
    for (i = 0; i < extensions.length; i++ ) {

      prefix = extensions[i];
      if (typeof document[prefix + 'CancelFullScreen' ] != 'undefined') {
        _bridge.supported = true;
        _bridge.prefix = prefix;
        break;
      }
    }
  }

  if (_bridge.supported) {
    Y.one('body').addClass('rmr-screenable');
    _bridge.eventName = _bridge.prefix + 'fullscreenchange';
    _bridge.request = function(node) { return ! prefix ? node._node.requestFullScreen() : node._node[prefix + 'RequestFullScreen'](); };
    _bridge.exit = function(node) { return ! prefix ? document.cancelFullScreen() : document[prefix + 'CancelFullScreen'](); };
    _bridge.isFullScreen = function() {
      var r = null;
      switch (prefix) {
        case 'webkit':
          r = document.webkitIsFullScreen;
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

  Screen = function(config) {
    Screen.superclass.constructor.apply(this, arguments);
    if (! _bridge.supported) { return false; }

    this.set('node', config.hasOwnProperty('node') ? config.node : document.body);
    var $ = this;

    if (! this.get('node')) { return null; }

    this.set('listener', function(e) {
      if ($.isFullScreen()) {
        $.fire('fullscreen');
        Y.one(e.target).addClass(CLASSNAME);
      } else {
        $.fire('exit');
        $.get('node').removeClass(CLASSNAME);
      }
    });

    this.get('node')._node.addEventListener(_bridge.eventName, this.get('listener'));
  };

  Screen.ATTRS = {
    'node' : {
      setter : function(node) {
        var n = Y.one(node);
        if (! n) { return null; }
        return n;
      },
      writeOnce : true
    },
    'listener' : { }
  };


  Y.Screen = Y.extend(Screen, Y.Base, {

    /*
     *
     * @return boolean
     */
    isFullScreen : function() {
      return _bridge.isFullScreen();
    },

    /*
     * Determine whether or not the browser supports full-screen elements
     *
     * @return boolean
     */
    isSupported : function() {
      return _bridge.supported;
    },

    /*
     * A convenience method to switch between request() and exit() based on the current state
     *
     * @see request
     * @see exit
     * @return this
     */
    toggle : function() {
      return this.isFullScreen() ? this.exit() : this.request();
    },

    /*
     * Attempt to enter fullscreen mode
     *
     * @event 'fullscreen' if successful
     * @return this
     */
    request : function() {
      var n = this.get('node'); 
      if (! n) { return false; }
      _bridge.request(n);

      return this;
    },

    /*
     * Exit fullscreen mode
     * @event 'exit' if successful 
     * @return this
     */
    exit : function() {
      _bridge.exit();
      return this;
    },

    /*
     *
     * @return string
     */
    toString : function() {
      return 'Screen <' + this.get('node') + '>';
    },

    /*
     * Clean up
     */
    destructor : function() {
      if (this.get('node')) {
        this.get('node')._node.removeEventListener(_bridge.eventName, this.get('listener'));
        this.set('node', null);
      }
    },

    NAME : 'screen'
  });

}, '3.3.1', { requires : ['node', 'event', 'base']});

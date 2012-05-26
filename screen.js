/*jslint browser:true,indent:2,white:true,nomen:false,plusplus:true,nomen:true */
/*global YUI, window */

// Much love to http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/


YUI.add('screen', function(Y) {

  'use strict';

  var Screen, _bridge, i, prefix, extensions = ['webkit','moz','o','ms','khtml'];

  Screen = function() {
    Screen.superclass.constructor.apply(this, arguments);
  };


  // 
  _bridge = {
    prefix : '',
    supported : false,
    isFullScreen : function() { return false; },
    cancel : function() { },
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
    _bridge.eventName = _bridge.prefix + 'fullscreenchange';
    _bridge.request = function(node) { return ! prefix ? node._node.requestFullScreen() : node._node[prefix + 'RequestFullScreen'](); };
    _bridge.cancel = function(node) { return ! prefix ? document.cancelFullScreen() : document[prefix + 'CancelFullScreen'](); };
    _bridge.isFullScreen = function() {
      switch (prefix) {
        case 'webkit':
          return document.webkitIsFullScreen;
        default:
          if (document.hasOwnProperty('fullScreen')) {
            return document.fullScreen;
          } else if (document.hasOwnProperty('fullscreen')) {
            return document.fullscreen;
          }

          return document[prefix + 'FullScreen'];
      }
    };
  }

  Y.Screen = Y.extend(Screen, Y.Base, {

    /*
     *
     *
     */
    initializer : function(config) {


      if (! _bridge.supported) { return false; }

      this.set('node', config.node);
      var $ = this;

      this.set('listener', function(e) {
        if (_bridge.isFullScreen()) {
          $.fire('fullscreen');
          Y.one(e.target).addClass('yui-fullscreen');
        } else {
          $.fire('exit');
          $.get('node').removeClass('yui-fullscreen');
        }
      });

      this.get('node')._node.addEventListener(_bridge.eventName, this.get('listener'));
    },

    isFullScreen : function() {
      return _bridge.isFull();
    },

    /*
     *
     * @return boolean
     */
    isSupported : function() {
      return _bridge.supported;
    },

    /*
     *
     *
     */
    request : function() {
      var n = this.get('node'); 
      if (! n) { return false; }
      _bridge.request(n);

      return this;
    },

    /*
     * Exit fullscren mode
     */
    exit : function() {
      _bridge.cancel();
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
     *
     *
     */
    destructor : function() {
      if (this.get('node')) {
        this.get('node')._node.removeEventListener(_bridge.eventName, this.get('listener'));
        this.set('node', null);
      }
    },

    NAME : 'screen',
    ATTRS : {
      'node' : {
        setter : function(node) {
          var n = Y.one(node);
          if (! n) { Y.fail('Screen: Invalid node' + node); }
          return n;
        },
        writeOnce : true
      },
      'listener' : { }
    }
  });

}, '3.3.1', { requires : ['node', 'event', 'base']});

/*jslint browser:true, indent:2,white:true,nomen:false,plusplus:false */
/*global YUI, window */

YUI.add('screen', function(Y) {

  "use strict";

  var Screen = function() {
    Screen.superclass.constructor.apply(this, arguments);
  };



  Y.Screen = Y.extend(Screen, Y.Base, {

    /*
     *
     *
     */
    initializer : function(config) {

      this.set('node', config.node);

      if (! this.get('node')) { Y.log('none'); return false; }

      var $ = this;

      this.set('listener', function(e) {
        if (document.webkitIsFullScreen) {
          $.fire('fullscreen');
          Y.one(e.target).addClass('yui-fullscreen');
        } else {
          $.fire('exit');
          $.get('node').removeClass('yui-fullscreen');
        }
      });

      this.get('node')._node.addEventListener('webkitfullscreenchange', this.get('listener'));

      return this;
    },

    /*
     *
     * @return boolean
     */
    isSupported : function() {
      return true;
    },

    /*
     *
     *
     */
    request : function() {
      var n = this.get('node'); 
      if (! n) { return false; }
      n._node.webkitRequestFullScreen();

      return this;
    },

    /*
     * Exit fullscren mode
     */
    exit : function() {
      document.webkitCancelFullScreen();
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
      this.get('node')._node.removeEventListener('webkitfullscreenchange', this.get('listener'));
      this.set('node', null);
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
      'listener' : { },
      'destroyed' : { }
    }
  });

}, '3.3.1', { requires : ['node', 'event', 'base']});

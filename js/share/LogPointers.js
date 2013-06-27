// Copyright 2002-2013, University of Colorado Boulder

/**
 * This model implementation tracks the location of the pointer(s), if any, so they can be visualized during playback.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  "use strict";

  var Pointer = require( 'JOIST/share/Pointer' );
  var Pointers = require( 'JOIST/share/Pointers' );

  function LogPointers() {

    //Set up data logging and visualization
    this.pointers = new Pointers();
  }

  LogPointers.prototype = {
    startLogging: function() {
      var logPointers = this;
      window.addEventListener( 'mousemove', function( e ) {
        var location = {x: e.clientX, y: e.clientY};
        if ( logPointers.pointers.length === 0 ) {
          logPointers.pointers.add( new Pointer( location ) );
        }
        else {
          logPointers.pointers.at( 0 ).set( location );
        }
      }, false );
      window.addEventListener( 'touchmove', function( e ) {
        var touches = e.touches;
        for ( var i = 0; i < touches.length; i++ ) {
          var touch = touches[i];
          var location = {x: touch.pageX, y: touch.pageY};
          if ( i >= logPointers.pointers.length ) {
            logPointers.pointers.add( new Pointer( location ) );
          }
          else {
            logPointers.pointers.at( i ).set( location );
          }
        }
        while ( logPointers.pointers.length > touches.length ) {
          logPointers.pointers.pop();
        }
      }, false );

      //TODO: add touchend support
    },
    showPointers: function() {
      var logPointers = this;
      this.pointers.on( 'add', function( model, collection, options ) {
        var $img = $( '<img id="cursor">' ); //Equivalent: $(document.createElement('img'))
        $img.attr( 'src', "http://dc440.4shared.com/img/mFJBl0A0/s7/mouse-cursor-icon.png" ); //TODO: our own copy of the image
        $img.css( {zIndex: 9999, position: 'absolute', width: 12, height: 20, 'pointer-events': 'none'} );
        $img.appendTo( 'body' );
        model.on( 'change:x change:y', function() {
          $img.css( {left: model.x, top: model.y} );
        } );

        logPointers.pointers.on( 'remove', function( m, c, o ) {
          if ( m === model ) {
            $img.detach();
            //TODO: clean up listeners?
          }
        } );
      } );
    }
  };

  return LogPointers;
} );
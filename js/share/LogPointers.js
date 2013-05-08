/**
 * This fort model implementation tracks the location of the pointer(s), if any, so they can be visualized during playback.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  "use strict";

  var Fort = require( 'FORT/Fort' );
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
    },
    startPlayback: function() {
      var DOM_img = document.createElement( "img" );
      DOM_img.src = "http://files.softicons.com/download/toolbar-icons/black-wireframe-toolbar-icons-by-gentleface/png/32/cursor_arrow.png";
      body.appendChild( DOM_img );
    }
  };

  return LogPointers;
} );
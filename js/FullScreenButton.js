// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows a button that changes the simulation to full screen.  This feature is not available on iPad.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Input = require( 'SCENERY/input/Input' );

  function requestFullScreen( element ) {

    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if ( requestMethod ) { // Native full screen.
      requestMethod.call( element );
    }
    else if ( typeof window.ActiveXObject !== "undefined" ) { // Older IE.
      var wscript = new ActiveXObject( "WScript.Shell" );
      if ( wscript !== null ) {
        wscript.SendKeys( "{F11}" );
      }
    }
  }

  var fullScreener = function() {
    requestFullScreen( document.body );
  };

  function FullScreenButton( options ) {
    Node.call( this, {cursor: 'pointer'} );
    this.addChild( new FontAwesomeNode( 'fullscreen', {fill: '#fff', scale: 0.8} ) );
    this.mutate( _.extend( {cursor: 'pointer'}, options ) );//TODO: pointer not going through here

    this.addInputListener( {down: function() {
      $( 'body' ).one( 'mouseup', fullScreener );
    }} );

    this.mouseArea = this.bounds;
    this.touchArea = this.bounds;
  }

  return inherit( Node, FullScreenButton );
} );
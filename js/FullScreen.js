// Copyright 2002-2013, University of Colorado Boulder

/**
 * Utilities for full-screen support
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var Platform = require( 'PHET_CORE/Platform' );
  var detectPrefix = require( 'PHET_CORE/detectPrefix' );
  var detectPrefixEvent = require( 'PHET_CORE/detectPrefixEvent' );
  var Property = require( 'AXON/Property' );
  
  // get prefixed (and properly capitalized) property names
  var requestFullscreenPropertyName = detectPrefix( document.body, 'requestFullscreen' ) ||
                                      detectPrefix( document.body, 'requestFullScreen' );
  var exitFullscreenPropertyName    = detectPrefix( document, 'exitFullscreen' ) ||
                                      detectPrefix( document, 'cancelFullScreen' );
  var fullscreenElementPropertyName = detectPrefix( document, 'fullscreenElement' ) ||
                                      detectPrefix( document, 'fullScreenElement' );
  var fullscreenEnabledPropertyName = detectPrefix( document, 'fullscreenEnabled' ) ||
                                      detectPrefix( document, 'fullScreenEnabled' );
  var fullscreenChangeEvent         = detectPrefixEvent( document, 'fullscreenchange' );
  // var fullscreenErrorEvent          = detectPrefixEvent( document, 'fullscreenerror' );
  
  var FullScreen = {
    isFullScreen: function() {
      return !!document[fullscreenElementPropertyName];
    },
    
    isFullScreenEnabled: function() {
      return document[fullscreenEnabledPropertyName];
    },
    
    enterFullScreen: function( sim ) {
      // console.log( 'enter' );
      if ( !Platform.ie9 && !Platform.ie10 ) {
        sim.display.domElement[requestFullscreenPropertyName] && sim.display.domElement[requestFullscreenPropertyName]();
      } else if ( typeof window.ActiveXObject !== 'undefined' ) { // Older IE.
        var wscript = new window.ActiveXObject( 'WScript.Shell' );
        if ( wscript !== null ) {
          wscript.SendKeys( '{F11}' );
        }
      }
    },
    
    exitFullScreen: function() {
      // console.log( 'exit' );
      document[exitFullscreenPropertyName] && document[exitFullscreenPropertyName]();
    },
    
    toggleFullScreen: function( sim ) {
      if ( FullScreen.isFullScreen() ) {
        FullScreen.exitFullScreen();
      } else {
        FullScreen.enterFullScreen( sim );
      }
    }
  };
  
  FullScreen.isFullScreenProperty = new Property( false );
  document.addEventListener( fullscreenChangeEvent, function( evt ) {
    FullScreen.isFullScreenProperty.set( FullScreen.isFullScreen() );
  } );
  // FullScreen.isFullScreenProperty.link( function( value ) { console.log( 'fullscreen: ' + value ); } );
  
  return FullScreen;
} );

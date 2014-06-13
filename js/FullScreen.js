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
                                      detectPrefix( document.body, 'requestFullScreen' ); // Firefox capitalization
  var exitFullscreenPropertyName    = detectPrefix( document, 'exitFullscreen' ) ||
                                      detectPrefix( document, 'cancelFullScreen' ); // Firefox
  var fullscreenElementPropertyName = detectPrefix( document, 'fullscreenElement' ) ||
                                      detectPrefix( document, 'fullScreenElement' ); // Firefox capitalization
  var fullscreenEnabledPropertyName = detectPrefix( document, 'fullscreenEnabled' ) ||
                                      detectPrefix( document, 'fullScreenEnabled' ); // Firefox capitalization
  var fullscreenChangeEvent         = detectPrefixEvent( document, 'fullscreenchange' );
  
  // required capitalization workaround for now
  if ( fullscreenChangeEvent === 'msfullscreenchange' ) {
    fullscreenChangeEvent = 'MSFullscreenChange';
  }
  
  var FullScreen = {
    isFullScreen: function() {
      return !!document[fullscreenElementPropertyName];
    },
    
    isFullScreenEnabled: function() {
      return document[fullscreenEnabledPropertyName];
    },
    
    enterFullScreen: function( sim ) {
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
      document[exitFullscreenPropertyName] && document[exitFullscreenPropertyName]();
    },
    
    toggleFullScreen: function( sim ) {
      if ( FullScreen.isFullScreen() ) {
        FullScreen.exitFullScreen();
      } else {
        FullScreen.enterFullScreen( sim );
      }
    },
    
    isFullScreenProperty: new Property( false )
  };
  
  // update isFullScreenProperty on potential changes
  document.addEventListener( fullscreenChangeEvent, function( evt ) {
    FullScreen.isFullScreenProperty.set( FullScreen.isFullScreen() );
  } );
  
  return FullScreen;
} );

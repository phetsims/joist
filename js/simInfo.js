// Copyright 2018, University of Colorado Boulder

/**
 * Return an object of data about the simulation and the browser
 * much of the code was copied from SimTroubleshootPage.html in the website repo
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var Util = require( 'SCENERY/util/Util' );

  var simInfo = {};

  function addInfo( key, value ) {
    simInfo[ key ] = value;
  }

  function addIfTruthy( key, value ) {
    if ( value ) {
      addInfo( key, value );
    }
  }

  // globals
  addIfTruthy( 'url', window.location.href );
  addIfTruthy( 'randomSeed', window.phet.chipper.randomSeed );
  addIfTruthy( 'userAgent', window.navigator.userAgent );
  addIfTruthy( 'language', window.navigator.language );
  addIfTruthy( 'window', window.innerWidth + 'x' + window.innerHeight );
  addIfTruthy( 'referrer', document.referrer );

  // from Scenery Util
  addIfTruthy( 'pixelRatio', Util.back );
  addIfTruthy( 'isWebGLSupported', Util.isWebGLSupported );
  addIfTruthy( 'checkIE11StencilSupport', Util.checkIE11StencilSupport );

  var canvas;
  var context;
  var backingStorePixelRatio;

  try {
    canvas = document.createElement( 'canvas' );
    context = canvas.getContext( '2d' );
    backingStorePixelRatio = context.webkitBackingStorePixelRatio ||
                             context.mozBackingStorePixelRatio ||
                             context.msBackingStorePixelRatio ||
                             context.oBackingStorePixelRatio ||
                             context.backingStorePixelRatio || 1;
  }
  catch( e ) {} // eslint-disable-line

  var flags = [];
  if ( window.navigator.pointerEnabled ) { flags.push( 'pointerEnabled' ); }
  if ( window.navigator.msPointerEnabled ) { flags.push( 'msPointerEnabled' ); }
  if ( !window.navigator.onLine ) { flags.push( 'offline' ); }
  if ( ( window.devicePixelRatio || 1 ) / backingStorePixelRatio !== 1 ) { flags.push( 'pixelRatioScaling' ); }
  addIfTruthy( 'flags', flags.join( ', ' ) );

  canvas = null; // dispose only reference

  joist.register( 'simInfo', simInfo );

  return simInfo;
} );

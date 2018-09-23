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

  var info = {};

  function putInfo( key, value ) {
    if ( value === undefined ) {
      value = '{{undefined}}';
    }
    info[ key ] = value;
  }

  // globals
  putInfo( 'url', window.location.href );
  putInfo( 'randomSeed', window.phet.chipper.randomSeed );
  putInfo( 'userAgent', window.navigator.userAgent );
  putInfo( 'language', window.navigator.language );
  putInfo( 'window', window.innerWidth + 'x' + window.innerHeight );
  putInfo( 'referrer', document.referrer );

  // from Scenery Util
  putInfo( 'checkIE11StencilSupport', Util.checkIE11StencilSupport );
  if ( phet.chipper.queryParameters.webgl ) {
    putInfo( 'isWebGLSupported', Util.isWebGLSupported );
  }

  var canvas;
  var context;
  var backingStorePixelRatio;

  try {
    canvas = document.createElement( 'canvas' );
    context = canvas.getContext( '2d' );
    backingStorePixelRatio = Util.backingStorePixelRatio( context );
  }
  catch( e ) {} // eslint-disable-line

  putInfo( 'pixelRatio', ( window.devicePixelRatio || 1 ) + '/' + backingStorePixelRatio );

  var flags = [];
  if ( window.navigator.pointerEnabled ) { flags.push( 'pointerEnabled' ); }
  if ( window.navigator.msPointerEnabled ) { flags.push( 'msPointerEnabled' ); }
  if ( !window.navigator.onLine ) { flags.push( 'offline' ); }
  if ( ( window.devicePixelRatio || 1 ) / backingStorePixelRatio !== 1 ) { flags.push( 'pixelRatioScaling' ); }
  putInfo( 'flags', flags.join( ', ' ) );

  canvas = null; // dispose only reference

  var simInfo = {
    getInfo: function( sim, packageJSON ) {

      if ( !info.simName ) {
        putInfo( 'simName', sim.name );
        putInfo( 'simVersion', sim.version );
        putInfo( 'repoName', packageJSON.name );
      }

      // (phet-io) if there is metadata from the wrapper
      if ( phet.phetio ) {
        putInfo( 'wrapperMetadata', phet.phetio.simStartedMetadata );
      }

      return info;
    }
  };

  joist.register( 'simInfo', simInfo );

  return simInfo;
} );

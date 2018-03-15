// Copyright 2018, University of Colorado Boulder

/**
 *
 * Return an object of data about the simulation and the browser
 * much of the code was copied from SimTroubleshootPage.html in the website repo
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );

  var simInfo = {};

  function addInfo( key, value ) {
    simInfo[ key ] = value;
  }

  function addIfDefined( key, value ) {
    if ( value !== undefined ) {
      addInfo( key, value );
    }
  }

  function addIfTruthy( key, value ) {
    if ( value ) {
      addInfo( key, value );
    }
  }

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
  catch( e ) { e;} // avoid lint

  var flags = [];
  if ( window.navigator.pointerEnabled ) { flags.push( 'pointerEnabled' ); }
  if ( window.navigator.msPointerEnabled ) { flags.push( 'msPointerEnabled' ); }
  if ( !window.navigator.onLine ) { flags.push( 'offline' ); }
  if ( ( window.devicePixelRatio || 1 ) / backingStorePixelRatio !== 1 ) { flags.push( 'pixelRatioScaling' ); }

  addIfDefined( 'pixelRatio', ( window.devicePixelRatio || 1 ) + '/' + backingStorePixelRatio );
  addIfTruthy( 'Flags', flags.join( ', ' ) );

  // globals
  addIfTruthy( 'url', window.location.href );
  addIfTruthy( 'randomSeed', window.phet.chipper.randomSeed );
  addIfTruthy( 'userAgent', window.navigator.userAgent );
  addIfTruthy( 'language', window.navigator.language );
  addIfTruthy( 'window', window.innerWidth + 'x' + window.innerHeight );
  addIfTruthy( 'referrer', document.referrer );

  // webGL info
  if ( window.WebGLRenderingContext ) {
    canvas = document.createElement( 'canvas' );
    var err = '';
    var contextNames = [ 'webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl' ];
    var gl;
    canvas.addEventListener( 'webglcontextcreationerror', function( event ) {
      err += event.statusMessage + ' ';
    }, false );
    for ( var i = 0; i < contextNames.length; i++ ) {
      try {
        gl = canvas.getContext( contextNames[ i ] );
      }
      catch( e ) {
        err += e.toString() + ' ';
      }
      if ( gl ) {
        break;
      }
    }
    if ( !gl ) {
      addInfo( 'WebGL', 'disabled' + ( err ? ' (' + err + ')' : '' ) );
    }
    else {
      var indented = { marginLeft: '40px' };
      addInfo( 'WebGL', gl.getParameter( gl.VERSION ) );
      addInfo( 'GLSL', gl.getParameter( gl.SHADING_LANGUAGE_VERSION ), indented );
      addInfo( 'Vendor', gl.getParameter( gl.VENDOR ) + ' (' + gl.getParameter( gl.RENDERER ) + ')', indented );
      addInfo( 'Vertex', 'attribs: ' + gl.getParameter( gl.MAX_VERTEX_ATTRIBS ) +
                         ' varying: ' + gl.getParameter( gl.MAX_VARYING_VECTORS ) +
                         ' uniform: ' + gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS ), indented );
      addInfo( 'Texture', 'size: ' + gl.getParameter( gl.MAX_TEXTURE_SIZE ) +
                          ' imageUnits: ' + gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS ) +
                          ' (vertex: ' + gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) + ',' +
                          ' combined: ' + gl.getParameter( gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS ) + ')', indented );
      addInfo( 'Max viewport', gl.getParameter( gl.MAX_VIEWPORT_DIMS )[ 0 ] + 'x' + gl.getParameter( gl.MAX_VIEWPORT_DIMS )[ 1 ], indented );
      addInfo( 'OES_texture_float', gl.getExtension( 'OES_texture_float' ) ? 'true' : 'false', indented );
    }
  }
  else {
    addInfo( 'WebGL', 'unsupported' );
  }

  joist.register( 'simInfo', simInfo );

  return simInfo;
} );

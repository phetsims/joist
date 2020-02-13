// Copyright 2018-2019, University of Colorado Boulder

/**
 * Return an object of data about the simulation and the browser
 * much of the code was copied from SimTroubleshootPage.html in the website repo
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );
  const Utils = require( 'SCENERY/util/Utils' );
  const Tandem = require( 'TANDEM/Tandem' );

  // ifphetio
  const dataStream = require( 'ifphetio!PHET_IO/dataStream' );
  const phetioCommandProcessor = require( 'ifphetio!PHET_IO/phetioCommandProcessor' );

  // constants
  const info = {};

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

  // from Scenery Utils
  putInfo( 'checkIE11StencilSupport', Utils.checkIE11StencilSupport() );
  if ( phet.chipper.queryParameters.webgl ) {
    putInfo( 'isWebGLSupported', Utils.isWebGLSupported );
  }

  let canvas;
  let context;
  let backingStorePixelRatio;

  try {
    canvas = document.createElement( 'canvas' );
    context = canvas.getContext( '2d' );
    backingStorePixelRatio = Utils.backingStorePixelRatio( context );
  }
  catch( e ) {} // eslint-disable-line

  putInfo( 'pixelRatio', ( window.devicePixelRatio || 1 ) + '/' + backingStorePixelRatio );

  const flags = [];
  if ( window.navigator.pointerEnabled ) { flags.push( 'pointerEnabled' ); }
  if ( window.navigator.msPointerEnabled ) { flags.push( 'msPointerEnabled' ); }
  if ( !window.navigator.onLine ) { flags.push( 'offline' ); }
  if ( ( window.devicePixelRatio || 1 ) / backingStorePixelRatio !== 1 ) { flags.push( 'pixelRatioScaling' ); }
  putInfo( 'flags', flags.join( ', ' ) );

  canvas = null; // dispose only reference

  const simInfo = {

    /**
     * @param {Sim} sim
     * @param {Object} packageJSON
     */
    get( sim, packageJSON ) {

      // no need to add this again if the method has already been called
      if ( !info.simName ) {
        putInfo( 'simName', sim.name );
        putInfo( 'simVersion', sim.version );
        putInfo( 'repoName', packageJSON.name );
        putInfo( 'screens', sim.screens.map( screen => {
          const screenObject = {

            // likely null for single screen sims, so use the sim name as a default
            name: screen.name || sim.name
          };
          if ( Tandem.PHET_IO_ENABLED ) {
            screenObject.phetioID = screen.tandem.phetioID;
          }
          return screenObject;
        } ) );

        // (phet-io) if there is metadata from the wrapper
        if ( Tandem.PHET_IO_ENABLED ) {
          putInfo( 'screenPropertyValue', sim.screenProperty.value.tandem.phetioID );
          putInfo( 'wrapperMetadata', window.phet.phetio.simStartedMetadata );
          putInfo( 'dataStreamVersion', dataStream.VERSION );
          putInfo( 'phetioCommandProcessorProtocol', phetioCommandProcessor.PHET_IO_PROTOCOL );
        }
      }

      return info;
    }
  };

  return joist.register( 'simInfo', simInfo );
} );

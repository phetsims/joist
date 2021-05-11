// Copyright 2018-2020, University of Colorado Boulder

/**
 * Return an object of data about the simulation and the browser
 * much of the code was largely copied and expanded on from SimTroubleshootPage.html in the website repo. Note that
 * key names in the info object are used by the PhET-iO API, do not change without great consideration.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../scenery/js/util/Utils.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import joist from './joist.js';
import packageJSON from './packageJSON.js';

class SimInfo extends PhetioObject {

  constructor( sim ) {
    super( {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'simInfo' ),
      phetioType: SimInfo.SimInfoIO,
      phetioReadOnly: true,
      phetioDocumentation: 'A collection of data about the runtime and simulation. Available in the simStarted PhET-iO ' +
                           'data stream event, as well as on demand in the PhET-iO state.'
    } );

    assert && assert( Array.isArray( sim.screens ), 'screens should be set and an array' );

    // @public (SimInfoIO)
    this.info = {};

    // globals
    this.putInfo( 'randomSeed', window.phet.chipper.queryParameters.randomSeed );

    // Some data values change from run to run and should not be recorded for purposes of PhET-iO API generation or
    // comparison
    if ( !Tandem.PHET_IO_ENABLED || ( !phet.preloads.phetio.queryParameters.phetioPrintAPI &&
                                      !phet.preloads.phetio.queryParameters.phetioCompareAPI ) ) {
      this.putInfo( 'url', window.location.href );
      this.putInfo( 'userAgent', window.navigator.userAgent );
    }

    this.putInfo( 'language', window.navigator.language );
    this.putInfo( 'window', `${window.innerWidth}x${window.innerHeight}` );
    this.putInfo( 'referrer', document.referrer );

    // from Scenery Utils
    this.putInfo( 'checkIE11StencilSupport', Utils.checkIE11StencilSupport() );
    if ( phet.chipper.queryParameters.webgl ) {
      this.putInfo( 'isWebGLSupported', Utils.isWebGLSupported );
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

    this.putInfo( 'pixelRatio', `${window.devicePixelRatio || 1}/${backingStorePixelRatio}` );

    const flags = [];
    if ( window.navigator.pointerEnabled ) { flags.push( 'pointerEnabled' ); }
    if ( window.navigator.msPointerEnabled ) { flags.push( 'msPointerEnabled' ); }
    if ( !window.navigator.onLine ) { flags.push( 'offline' ); }
    if ( ( window.devicePixelRatio || 1 ) / backingStorePixelRatio !== 1 ) { flags.push( 'pixelRatioScaling' ); }
    this.putInfo( 'flags', flags.join( ', ' ) );

    canvas = null; // dispose only reference

    // from Sim.js
    this.putInfo( 'simName', sim.simNameProperty.value );
    this.putInfo( 'simVersion', sim.version );
    this.putInfo( 'repoName', packageJSON.name );
    this.putInfo( 'screens', sim.screens.map( screen => {
      const screenObject = {

        // likely null for single screen sims, so use the sim name as a default
        name: screen.nameProperty.value || sim.simNameProperty.value
      };
      if ( Tandem.PHET_IO_ENABLED ) {
        screenObject.phetioID = screen.tandem.phetioID;
      }
      return screenObject;
    } ) );

    // From PhET-iO code
    if ( Tandem.PHET_IO_ENABLED ) {
      this.putInfo( 'screenPropertyValue', sim.screenProperty.value.tandem.phetioID );
      this.putInfo( 'wrapperMetadata', phet.preloads.phetio.simStartedMetadata );
      this.putInfo( 'dataStreamVersion', phet.phetio.dataStream.VERSION );
      this.putInfo( 'phetioCommandProcessorProtocol', phet.phetio.phetioCommandProcessor.PHET_IO_PROTOCOL );
    }
  }

  /**
   * @private
   * @param {string} key
   * @param {*} value
   */
  putInfo( key, value ) {
    if ( value === undefined ) {
      value = '{{undefined}}';
    }
    assert && assert( !this.info.hasOwnProperty( key ), `key already defined: ${key}` );
    this.info[ key ] = value;
  }
}

// @private
SimInfo.SimInfoIO = new IOType( 'SimInfoIO', {
  valueType: SimInfo,
  toStateObject: simInfo => simInfo.info
} );

joist.register( 'SimInfo', SimInfo );
export default SimInfo;
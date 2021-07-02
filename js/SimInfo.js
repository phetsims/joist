// Copyright 2021, University of Colorado Boulder

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
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../tandem/js/types/ObjectLiteralIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
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
    this.putInfo( 'url', window.location.href );
    this.putInfo( 'randomSeed', window.phet.chipper.queryParameters.randomSeed );
    this.putInfo( 'userAgent', window.navigator.userAgent );
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
  toStateObject: simInfo => {
    return {
      simName: simInfo.info.simName,
      screens: simInfo.info.screens,
      repoName: simInfo.info.repoName,

      screenPropertyValue: simInfo.info.screenPropertyValue,
      dataStreamVersion: simInfo.info.dataStreamVersion,
      phetioCommandProcessorProtocol: simInfo.info.phetioCommandProcessorProtocol,

      simVersion: Tandem.API_GENERATION ? null : simInfo.info.simVersion,
      wrapperMetadata: Tandem.API_GENERATION ? null : simInfo.info.wrapperMetadata,
      randomSeed: Tandem.API_GENERATION ? null : simInfo.info.randomSeed,
      url: Tandem.API_GENERATION ? null : simInfo.info.url,
      userAgent: Tandem.API_GENERATION ? null : simInfo.info.userAgent,
      window: Tandem.API_GENERATION ? null : simInfo.info.window,
      referrer: Tandem.API_GENERATION ? null : simInfo.info.referrer,
      language: Tandem.API_GENERATION ? null : simInfo.info.language,
      pixelRatio: Tandem.API_GENERATION ? null : simInfo.info.pixelRatio,
      isWebGLSupported: Tandem.API_GENERATION ? null : simInfo.info.isWebGLSupported,
      checkIE11StencilSupport: Tandem.API_GENERATION ? null : simInfo.info.checkIE11StencilSupport,
      flags: Tandem.API_GENERATION ? null : simInfo.info.flags || null
    };
  },
  stateSchema: {
    simName: StringIO,
    screens: ArrayIO( ObjectLiteralIO ),
    repoName: StringIO,

    screenPropertyValue: StringIO,
    wrapperMetadata: NullableIO( ObjectLiteralIO ),
    dataStreamVersion: StringIO,
    phetioCommandProcessorProtocol: StringIO,

    // Parts that are omitted in API generation
    simVersion: NullableIO( StringIO ),
    randomSeed: NullableIO( NumberIO ),
    url: NullableIO( StringIO ),
    userAgent: NullableIO( StringIO ),
    window: NullableIO( StringIO ),
    referrer: NullableIO( StringIO ),
    language: NullableIO( StringIO ),
    pixelRatio: NullableIO( StringIO ),
    isWebGLSupported: NullableIO( BooleanIO ),
    checkIE11StencilSupport: NullableIO( BooleanIO ),
    flags: NullableIO( StringIO )
  }
} );

joist.register( 'SimInfo', SimInfo );
export default SimInfo;
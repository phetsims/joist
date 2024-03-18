// Copyright 2015-2019, University of Colorado Boulder

/**
 * A singleton type/object for handling checking whether our simulation is up-to-date, or whether there is an
 * updated version. See https://github.com/phetsims/joist/issues/189
 *
 * It exposes its current state (for UIs to hook into), and a check() function used to start checking the version.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Brand = require( 'BRAND/Brand' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const joist = require( 'JOIST/joist' );
  const packageJSON = require( 'JOIST/packageJSON' ); // parse name/version out of the package.json
  const SimVersion = phet.preloads.chipper.SimVersion; // use preload from chipper (auto-copied from perennial)
  const UpdateState = require( 'JOIST/UpdateState' );

  // constants
  const simName = packageJSON.name;
  const simVersion = SimVersion.parse( packageJSON.version, phet.chipper.buildTimestamp );
  const requestProtocolString = ( 'https:' === document.location.protocol ? 'https:' : 'http:' );
  const TIMEOUT_MILLISECONDS = 15000; // How many ms before we time out (set to 'offline')

  class UpdateCheck {
    constructor() {

      // @public (read-only joist-internal) {Property.<UpdateState>}
      this.stateProperty = new EnumerationProperty( UpdateState, UpdateState.UNCHECKED );

      // @public (read-only joist-internal) {SimVersion|null} will be filled in by check() if applicable
      this.latestVersion = null;

      this.ourVersion = simVersion; // @public (joist-internal) {SimVersion} version of the sim that is running

      // @private
      this.timeoutCallback = this.timeout.bind( this );

      // @public - Whether we actually allow checking for updates, or showing any update-related UIs.
      // If it's not PhET-branded OR if it is phet-io or in the phet-app, do not check for updates
      this.areUpdatesChecked = Brand.id === 'phet' && !Brand.isPhetApp && phet.chipper.queryParameters.yotta;

      // @public - The URL to be used for "New version available" clicks
      this.updateURL = 'http://phet.colorado.edu/html-sim-update' +
                       '?simulation=' + encodeURIComponent( simName ) +
                       '&version=' + encodeURIComponent( simVersion.toString() ) +
                       '&buildTimestamp=' + encodeURIComponent( '' + phet.chipper.buildTimestamp );

      // @private {number} - Valid only if `state === UpdateState.CHECKING`, the timeout ID of our timeout listener
      this.timeoutId = -1;
    }

    // @private - Clears our timeout listener.
    clearTimeout() {
      window.clearTimeout( this.timeoutId );
    }

    // @private - Sets our timeout listener.
    setTimeout() {
      this.timeoutId = window.setTimeout( this.timeoutCallback, TIMEOUT_MILLISECONDS );
    }

    // @public - If we are checking, it resets our timeout timer to TIMEOUT_MILLISECONDS
    resetTimeout() {
      if ( this.stateProperty.value === UpdateState.CHECKING ) {
        this.clearTimeout();
        this.setTimeout();
      }
    }

    // @private - What happens when we actually time out.
    timeout() {
      this.stateProperty.value = UpdateState.OFFLINE;
    }

    /**
     * @public - Kicks off the version checking request (if able), resulting in state changes.
     */
    check() {
      const self = this;

      if ( !this.areUpdatesChecked || ( self.stateProperty.value !== UpdateState.UNCHECKED && self.stateProperty.value !== UpdateState.OFFLINE ) ) {
        return;
      }

      // If our sim's version indicates it hasn't been published, don't attempt to send a request for now
      if ( this.ourVersion.isSimNotPublished ) {
        self.stateProperty.value = UpdateState.UP_TO_DATE;
        return;
      }

      const req = new XMLHttpRequest();

      if ( 'withCredentials' in req ) {
        // we'll be able to send the proper type of request, so we mark ourself as checking
        self.stateProperty.value = UpdateState.CHECKING;

        self.setTimeout();

        req.onload = function() {
          self.clearTimeout();

          try {
            const data = JSON.parse( req.responseText );

            if ( data.error ) {
              console.log( 'Update check failure: ' + data.error );
              self.stateProperty.value = UpdateState.OFFLINE;
            }
            else {
              if ( self.updateURL ) {
                self.updateURL = data.updateURL;
              }
              self.latestVersion = SimVersion.parse( data.latestVersion, data.buildTimestamp );

              // these `state` strings come from the website service, and should be kept in sync with
              // website\src\java\edu\colorado\phet\website\services\CheckHTMLUpdates.java
              if ( data.state === 'out-of-date' ) {
                self.stateProperty.value = UpdateState.OUT_OF_DATE;
              }
              else if ( data.state === 'up-to-date' ) {
                self.stateProperty.value = UpdateState.UP_TO_DATE;
              }
              else {
                console.log( 'Failed to get proper state: ' + data.state );
                self.stateProperty.value = UpdateState.OFFLINE;
              }
            }
          }
          catch( e ) {
            self.stateProperty.value = UpdateState.OFFLINE;
          }
        };
        req.onerror = function() {
          self.clearTimeout();

          self.stateProperty.value = UpdateState.OFFLINE;
        };
        req.open( 'post', requestProtocolString + '//phet.colorado.edu/services/check-html-updates', true ); // enable CORS
        req.send( JSON.stringify( {
          api: '1.0',
          simulation: simName,
          locale: phet.joist.sim.locale,
          currentVersion: self.ourVersion.toString(),
          buildTimestamp: phet.chipper.buildTimestamp
        } ) );
      }
    }
  }

  return joist.register( 'updateCheck', new UpdateCheck() );
} );

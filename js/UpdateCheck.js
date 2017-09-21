// Copyright 2015-2017, University of Colorado Boulder

/**
 * A singleton type/object for handling checking whether our simulation is up-to-date, or whether there is an
 * updated version. See https://github.com/phetsims/joist/issues/189
 *
 * It exposes its current state (for UIs to hook into), and a check() function used to start checking the version.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Brand = require( 'BRAND/Brand' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var packageJSON = require( 'JOIST/packageJSON' ); // parse name/version out of the package.json
  var Property = require( 'AXON/Property' );
  var SimVersion = require( 'JOIST/SimVersion' );

  var simName = packageJSON.name;
  var simVersion = SimVersion.parse( packageJSON.version, phet.chipper.buildTimestamp );
  var requestProtocolString = ( 'https:' === document.location.protocol ? 'https:' : 'http:' );

  // NOTE: singleton type!
  function UpdateCheck() {

    // @public (joist-internal)
    this.stateProperty = new Property( 'unchecked', {
      validValues: [
        'up-to-date',  // Simulation version is equal to or greater than the currently published version.
        'out-of-date', // Simulation version is less than currently published version (or equal but has a suffix)
        'checking',    // Request to server sent out, has not processed reply yet.
        'offline',     // Last attempt to check failed, most likely offline
        'unchecked'    // No attempt as been made to check the version against the latest online.
      ]
    } );

    // @public (joist-internal) {SimVersion} will be filled in by check() if applicable
    this.latestVersionProperty = new Property( null );

    this.ourVersion = simVersion; // @public (joist-internal) {SimVersion} version of the sim that is running

    this.timeoutCallback = this.timeout.bind( this ); // @public (joist-internal)
  }

  inherit( Object, UpdateCheck, {

    // @public - Whether we actually allow checking for updates, or showing any update-related UIs.
    // If it's not PhET-branded OR if it is phet-io or in the phet-app, do not check for updates
    areUpdatesChecked: Brand.id === 'phet' && !Brand.isPhetApp,

    // @public - The URL to be used for "New version available" clicks
    updateURL: 'http://phet.colorado.edu/html-sim-update' +
               '?simulation=' + encodeURIComponent( simName ) +
               '&version=' + encodeURIComponent( simVersion.toString() ) +
               '&buildTimestamp=' + encodeURIComponent( '' + phet.chipper.buildTimestamp ),

    // @private - Valid only if state === 'checking', the timeout ID of our timeout listener
    timeoutId: -1,

    // @private - How many ms before we time out (set to 'offline')
    timeoutMilliseconds: 15000,

    // @private - Clears our timeout listener.
    clearTimeout: function() {
      window.clearTimeout( this.timeoutId );
    },

    // @private - Sets our timeout listener.
    setTimeout: function() {
      this.timeoutId = window.setTimeout( this.timeoutCallback, this.timeoutMilliseconds );
    },

    // @public - If we are checking, it resets our timeout timer to timeoutMilliseconds
    resetTimeout: function() {
      if ( this.stateProperty.value === 'checking' ) {
        this.clearTimeout();
        this.setTimeout();
      }
    },

    // @private - What happens when we actually time out.
    timeout: function() {
      this.stateProperty.value = 'offline';
    },

    /**
     * @public - Kicks off the version checking request (if able), resulting in state changes.
     */
    check: function() {
      var self = this;

      if ( !this.areUpdatesChecked || ( self.stateProperty.value !== 'unchecked' && self.stateProperty.value !== 'offline' ) ) {
        return;
      }

      // If our sim's version indicates it hasn't been published, don't attempt to send a request for now
      if ( this.ourVersion.isSimNotPublished ) {
        self.stateProperty.value = 'up-to-date';
        return;
      }

      var req = new XMLHttpRequest();

      if ( 'withCredentials' in req ) {
        // we'll be able to send the proper type of request, so we mark ourself as checking
        self.stateProperty.value = 'checking';

        self.setTimeout();

        req.onload = function() {
          self.clearTimeout();

          try {
            var data = JSON.parse( req.responseText );

            if ( data.error ) {
              console.log( 'Update check failure: ' + data.error );
              self.stateProperty.value = 'offline';
            }
            else {
              if ( self.updateURL ) {
                self.updateURL = data.updateURL;
              }
              self.latestVersion = SimVersion.parse( data.latestVersion, data.buildTimestamp );

              if ( data.state === 'out-of-date' || data.state === 'up-to-date' ) {
                self.stateProperty.value = data.state;
              }
              else {
                console.log( 'Failed to get proper state: ' + data.state );
                self.stateProperty.value = 'offline';
              }
            }
          }
          catch( e ) {
            self.stateProperty.value = 'offline';
          }
        };
        req.onerror = function() {
          self.clearTimeout();

          self.stateProperty.value = 'offline';
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
  } );

  var singleton = new UpdateCheck();
  joist.register( 'UpdateCheck', singleton );
  return singleton;
} );

// Copyright 2015-2022, University of Colorado Boulder

/**
 * A singleton type/object for handling checking whether our simulation is up-to-date, or whether there is an
 * updated version. See https://github.com/phetsims/joist/issues/189
 *
 * It exposes its current state (for UIs to hook into), and a check() function used to start checking the version.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import EnumerationProperty from '../../axon/js/EnumerationProperty.js';
import joist from './joist.js';
import packageJSON from './packageJSON.js'; // parse name/version out of the package.json
import UpdateState from './UpdateState.js';

const SimVersion = phet.preloads.chipper.SimVersion; // use preload from chipper (auto-copied from perennial)

// constants
const simName = packageJSON.name;
const simVersion = SimVersion.parse( packageJSON.version, phet.chipper.buildTimestamp );
const requestProtocolString = ( document.location.protocol === 'https:' ? 'https:' : 'http:' );
const TIMEOUT_MILLISECONDS = 15000; // How many ms before we time out (set to 'offline')

type TSimVersion = string & {
  isSimNotPublished: boolean;
};

class UpdateCheck {
  public readonly stateProperty: EnumerationProperty<UpdateState>;
  public latestVersion: TSimVersion | null; // {SimVersion|null} will be filled in by check() if applicable
  public readonly ourVersion: TSimVersion; // (joist-internal) {SimVersion} version of the sim that is running
  private readonly timeoutCallback: () => void;
  public readonly areUpdatesChecked: boolean; // Whether we actually allow checking for updates, or showing any update-related UIs.
  public updateURL: string; // The URL to be used for "New version available" clicks
  private timeoutId: number; // Valid only if `state === UpdateState.CHECKING`, the timeout ID of our timeout listener

  public constructor() {

    this.stateProperty = new EnumerationProperty( UpdateState.UNCHECKED );
    this.latestVersion = null;
    this.ourVersion = simVersion;
    this.timeoutCallback = this.timeout.bind( this );

    // If it's not PhET-branded OR if it is phet-io or in the phet-app, do not check for updates
    this.areUpdatesChecked = phet.chipper.brand === 'phet' && !phet.chipper.isApp;

    this.updateURL = `${'http://phet.colorado.edu/html-sim-update' +
                        '?simulation='}${encodeURIComponent( simName )
    }&version=${encodeURIComponent( simVersion.toString() )
    }&buildTimestamp=${encodeURIComponent( `${phet.chipper.buildTimestamp}` )}`;

    this.timeoutId = -1;
  }

  // Clears our timeout listener.
  private clearTimeout(): void {
    window.clearTimeout( this.timeoutId );
  }

  //Sets our timeout listener.
  private setTimeout(): void { // eslint-disable-line bad-sim-text
    this.timeoutId = window.setTimeout( this.timeoutCallback, TIMEOUT_MILLISECONDS ); // eslint-disable-line bad-sim-text
  }

  // If we are checking, it resets our timeout timer to TIMEOUT_MILLISECONDS
  public resetTimeout(): void {
    if ( this.stateProperty.value === UpdateState.CHECKING ) {
      this.clearTimeout();
      this.setTimeout();
    }
  }

  // What happens when we actually time out.
  private timeout(): void {
    this.stateProperty.value = UpdateState.OFFLINE;
  }

  /**
   * Kicks off the version checking request (if able), resulting in state changes.
   */
  public check(): void {
    if ( !this.areUpdatesChecked || ( this.stateProperty.value !== UpdateState.UNCHECKED && this.stateProperty.value !== UpdateState.OFFLINE ) ) {
      return;
    }

    // If our sim's version indicates it hasn't been published, don't attempt to send a request for now
    if ( this.ourVersion.isSimNotPublished ) {
      this.stateProperty.value = UpdateState.UP_TO_DATE;
      return;
    }

    const req = new XMLHttpRequest();

    if ( 'withCredentials' in req ) {

      // we'll be able to send the proper type of request, so we mark ourself as checking
      this.stateProperty.value = UpdateState.CHECKING;

      this.setTimeout();

      req.onload = () => {
        this.clearTimeout();

        try {
          const data = JSON.parse( req.responseText );

          if ( data.error ) {
            console.log( `Update check failure: ${data.error}` );
            this.stateProperty.value = UpdateState.OFFLINE;
          }
          else {
            if ( this.updateURL ) {
              this.updateURL = data.updateURL;
            }
            this.latestVersion = SimVersion.parse( data.latestVersion, data.buildTimestamp );

            // these `state` strings come from the website service, and should be kept in sync with
            // website\src\java\edu\colorado\phet\website\services\CheckHTMLUpdates.java
            if ( data.state === 'out-of-date' ) {
              this.stateProperty.value = UpdateState.OUT_OF_DATE;
            }
            else if ( data.state === 'up-to-date' ) {
              this.stateProperty.value = UpdateState.UP_TO_DATE;
            }
            else {
              console.log( `Failed to get proper state: ${data.state}` );
              this.stateProperty.value = UpdateState.OFFLINE;
            }
          }
        }
        catch( e ) {
          this.stateProperty.value = UpdateState.OFFLINE;
        }
      };
      req.onerror = () => {
        this.clearTimeout();

        this.stateProperty.value = UpdateState.OFFLINE;
      };
      req.open( 'post', `${requestProtocolString}//phet.colorado.edu/services/check-html-updates`, true ); // enable CORS
      req.send( JSON.stringify( {
        api: '1.0',
        simulation: simName,
        locale: phet.joist.sim.locale,
        currentVersion: this.ourVersion.toString(),
        buildTimestamp: phet.chipper.buildTimestamp
      } ) );
    }
  }
}

const updateCheck = new UpdateCheck();
joist.register( 'updateCheck', updateCheck );
export default updateCheck;
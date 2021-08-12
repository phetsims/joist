// Copyright 2021, University of Colorado Boulder

/**
 * Singleton that can save and load a Property's value to localStorage, and keep it in sync for the next runtime.
 * Must be used with ?preferencesStorage.
 *
 * NOTE: Property values are stringified, so don't try using this with something like `new StringProperty( 'true' )`
 *
 * author
 */

import joist from '../joist.js';

let preferencesStorage = null;

const PREFERENCES_KEY = 'PREFERENCES:';

class PreferencesStorage {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    // @private
    this.enabled = true;

    // @private - for debugging
    this.registedProperties = [];

    try {

      // Always store the line indices just in case they want to be used by the next run.
      window.localStorage.setItem( 'test', 'test' );
    }
    catch( e ) {
      this.enabled = false; // can't use localStorage with browser settings
      const safari = navigator.userAgent.indexOf( 'Safari' ) !== -1 && navigator.userAgent.indexOf( 'Chrome' ) === -1;
      if ( safari && e.toString().indexOf( 'QuotaExceededError' ) >= 0 ) {
        console.log( 'It looks like you are browsing with private mode in Safari. ' +
                     'Please turn that setting off if you want to use PreferencesStorage' );
      }
      else {
        throw e;
      }
    }
  }

  /**
   * @private
   * @param {Property} property
   * @param {string} name
   */
  registerToLocalStorage( property, name ) {
    const key = `${PREFERENCES_KEY}${name}`;
    if ( window.localStorage.getItem( key ) ) {
      property.value = JSON.parse( window.localStorage.getItem( key ) );
    }
    property.link( value => {
      window.localStorage.setItem( key, JSON.stringify( value ) );
    } );
    this.registedProperties.push( property );
  }

  /**
   * @public
   * @param {Property} property
   * @param {string} name
   */
  static register( property, name ) {
    if ( !phet.chipper.queryParameters.preferencesStorage ) {
      return;
    }

    if ( !preferencesStorage ) {
      preferencesStorage = new PreferencesStorage();
    }

    if ( preferencesStorage.enabled ) {
      preferencesStorage.registerToLocalStorage( property, name );
    }
  }
}

joist.register( 'PreferencesStorage', PreferencesStorage );
export default PreferencesStorage;
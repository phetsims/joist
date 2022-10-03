// Copyright 2021-2022, University of Colorado Boulder

/**
 * Singleton that can save and load a Property's value to localStorage, and keep it in sync for the next runtime.
 * Must be used with ?preferencesStorage.
 *
 * NOTE: Property values are stringified, so don't try using this with something like `new StringProperty( 'true' )`
 *
 * author
 */

import TProperty from '../../../axon/js/TProperty.js';
import joist from '../joist.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

let preferencesStorage: PreferencesStorage | null = null;

const PREFERENCES_KEY = 'PREFERENCES:';

class PreferencesStorage {

  private enabled = true;

  // for debugging
  private readonly registedProperties: TProperty<unknown>[] = [];

  public constructor() {

    try {

      // Always store the line indices just in case they want to be used by the next run.
      window.localStorage.setItem( 'test', 'test' );
    }
    catch( e ) {
      this.enabled = false; // can't use localStorage with browser settings

      if ( e instanceof Error ) {
        const safari = window.navigator.userAgent.includes( 'Safari' ) && !window.navigator.userAgent.includes( 'Chrome' );

        if ( safari && e.message.includes( 'QuotaExceededError' ) ) {
          console.log( 'It looks like you are browsing with private mode in Safari. ' +
                       'Please turn that setting off if you want to use PreferencesStorage' );
        }
        else {
          throw e;
        }
      }
    }
  }

  private registerToLocalStorage( property: TProperty<unknown>, name: string ): void {
    const key = `${PREFERENCES_KEY}${name}`;
    if ( window.localStorage.getItem( key ) ) {
      property.value = JSON.parse( window.localStorage.getItem( key )! );
    }
    property.link( ( value: IntentionalAny ) => {
      window.localStorage.setItem( key, JSON.stringify( value ) );
    } );
    this.registedProperties.push( property );
  }

  public static register( property: TProperty<unknown>, name: string ): TProperty<unknown> {
    if ( !phet.chipper.queryParameters.preferencesStorage ) {
      return property;
    }

    if ( !preferencesStorage ) {
      preferencesStorage = new PreferencesStorage();
    }

    if ( preferencesStorage.enabled ) {
      preferencesStorage.registerToLocalStorage( property, name );
    }

    return property;
  }
}

joist.register( 'PreferencesStorage', PreferencesStorage );
export default PreferencesStorage;
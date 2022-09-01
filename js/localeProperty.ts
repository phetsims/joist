// Copyright 2022, University of Colorado Boulder

/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringProperty from '../../axon/js/StringProperty.js';
import { globalKeyStateTracker, KeyboardUtils } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';

const locales = Object.keys( phet.chipper.strings ).sort();

const localeProperty = new StringProperty( phet.chipper.locale || 'en', {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'localeProperty' ),
  phetioFeatured: true,
  validValues: locales
} );

if ( phet.chipper.queryParameters.keyboardLocaleSwitcher ) {

  // DUPLICATION ALERT: don't change these without consulting PHET_IO_WRAPPERS/Client.wireUpKeyboardLocaleSwitcher()
  const FORWARD_KEY = KeyboardUtils.KEY_I;
  const BACKWARD_KEY = KeyboardUtils.KEY_U;

  globalKeyStateTracker.keydownEmitter.addListener( ( event: KeyboardEvent ) => {

    const bump = ( delta: number ) => {

      // Ctrl + u in Chrome on Windows is "view source" in a new tab
      event.preventDefault();

      const index = locales.indexOf( localeProperty.value );
      const nextIndex = ( index + delta + locales.length ) % locales.length;
      localeProperty.value = locales[ nextIndex ];

      // Indicate the new locale on the console
      console.log( localeProperty.value );
    };

    if ( event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey ) {
      if ( KeyboardUtils.isKeyEvent( event, FORWARD_KEY ) ) {
        bump( +1 );
      }
      else if ( KeyboardUtils.isKeyEvent( event, BACKWARD_KEY ) ) {
        bump( -1 );
      }
    }
  } );
}

joist.register( 'localeProperty', localeProperty );

export default localeProperty;

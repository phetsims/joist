// Copyright 2022, University of Colorado Boulder

/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringProperty from '../../axon/js/StringProperty.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';

const locales = Object.keys( phet.chipper.strings ).sort();

const localeProperty = new StringProperty( phet.chipper.locale || 'en', {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'localeProperty' ),
  phetioFeatured: true,
  validValues: locales
} );

if ( phet.chipper.queryParameters.keyboardLocaleSwitcher ) {

  // Support qwerty and dvorak.  u (back) and i (forward) on the physical keyboard
  const forwardKeys = [ 'c', 'i' ];
  const backwardKeys = [ 'g', 'u' ];

  document.addEventListener( 'keydown', ( event: KeyboardEvent ) => {

    const bump = ( delta: number ) => {
      const index = locales.indexOf( localeProperty.value );
      const nextIndex = ( index + delta + locales.length ) % locales.length;
      localeProperty.value = locales[ nextIndex ];

      // Indicate the new locale on the console
      console.log( localeProperty.value );
    };

    if ( event.ctrlKey && forwardKeys.includes( event.key ) ) {
      bump( +1 );
    }
    else if ( event.ctrlKey && backwardKeys.includes( event.key ) ) {
      bump( -1 );
    }
  } );
}

joist.register( 'localeProperty', localeProperty );

export default localeProperty;

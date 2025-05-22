// Copyright 2022-2024, University of Colorado Boulder

/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import { ReadOnlyPropertyState } from '../../../axon/js/ReadOnlyProperty.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { globalKeyStateTracker, KeyboardUtils } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import joist from '../joist.js';

// Hard coding a few locales here is better than relying on a generated output of the "ground truth" localeData in babel,
// which could change at any time and cause a type error here (either on main or worse, in release branches). Also we
// could reach the TypeScript maximum for number of string union entries, (see https://github.com/microsoft/TypeScript/issues/41160#issuecomment-1287271132).
// Feel free to add any locale here as needed for the type.
export type Locale = 'en' | 'de' | 'ot' | 'zh_CN' | 'zh_HK' | 'tl';

assert && assert( phet.chipper.locale, 'phet.chipper.locale global expected' );
assert && assert( phet.chipper.localeData, 'phet.chipper.localeData global expected' );
assert && assert( phet.chipper.strings, 'phet.chipper.strings global expected' );

// Sort these properly by their localized name (without using _.sortBy, since string comparison does not provide
// a good sorting experience). See https://github.com/phetsims/joist/issues/965
const availableRuntimeLocales = ( Object.keys( phet.chipper.strings ) as Locale[] ).sort( ( a, b ) => {
  const lowerCaseA = StringUtils.localeToLocalizedName( a ).toLowerCase();
  const lowerCaseB = StringUtils.localeToLocalizedName( b ).toLowerCase();
  return lowerCaseA.localeCompare( lowerCaseB, 'en-US', { sensitivity: 'base' } );
} );

export class LocaleProperty extends Property<Locale> {
  public readonly availableRuntimeLocales: Locale[] = availableRuntimeLocales;

  // Override to provide grace and support for the full definition of allowed locales (aligned with the query parameter
  // schema). For example three letter values, and case insensitivity. See checkAndRemapLocale() for details. NOTE that
  // this will assert if the locale doesn't match the right format.
  protected override unguardedSet( value: Locale ): void {

    // NOTE: updates phet.chipper.locale as a side-effect
    super.unguardedSet( phet.chipper.checkAndRemapLocale( value, true ) );
  }

  // This improves the PhET-iO Studio interface, by giving available values, without triggering validation if you want
  // to use the more general locale schema (three digit/case-insensitive/etc).
  protected override toStateObject<StateType>(): ReadOnlyPropertyState<StateType> {
    const parentObject = super.toStateObject<StateType>();

    // Provide via validValues without forcing validation assertions if a different value is set.
    parentObject.validValues = [ ...this.availableRuntimeLocales ].sort() as StateType[];
    return parentObject;
  }

  // Dynamic local switching is not supported if there is only one available runtime locale
  public get supportsDynamicLocale(): boolean {
    return this.availableRuntimeLocales.length > 1;
  }
}

const localeProperty = new LocaleProperty( phet.chipper.locale, {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'localeProperty' ),
  valueType: 'string',
  phetioFeatured: true,
  phetioValueType: StringIO,
  phetioDocumentation: 'Specifies language currently displayed in the simulation'
} );

// Update the HTML lang (used here to make the maintenance release easier)
localeProperty.link( locale => {
  document.documentElement.lang = phet.chipper.localeData[ locale ].bcp47;
} );

if ( phet?.chipper?.queryParameters?.keyboardLocaleSwitcher ) {

  // DUPLICATION ALERT: don't change these without consulting PHET_IO_WRAPPERS/PhetioClient.initializeKeyboardLocaleSwitcher()
  const FORWARD_KEY = KeyboardUtils.KEY_I;
  const BACKWARD_KEY = KeyboardUtils.KEY_U;

  globalKeyStateTracker.keydownEmitter.addListener( ( event: KeyboardEvent ) => {

    const bump = ( delta: number ) => {

      // Ctrl + u in Chrome on Windows is "view source" in a new tab
      event.preventDefault();

      const index = availableRuntimeLocales.indexOf( localeProperty.value );
      const nextIndex = ( index + delta + availableRuntimeLocales.length ) % availableRuntimeLocales.length;
      localeProperty.value = availableRuntimeLocales[ nextIndex ];

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
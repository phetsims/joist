// Copyright 2022-2024, University of Colorado Boulder

/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { globalKeyStateTracker, KeyboardUtils } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import joist from '../joist.js';
import { ReadOnlyPropertyState } from '../../../axon/js/ReadOnlyProperty.js';

const FALLBACK_LOCALE = 'en';

export type Locale = keyof typeof localeInfoModule;

assert && assert( phet.chipper.locale, 'phet.chipper.locale global expected' );
assert && assert( phet.chipper.localeData, 'phet.chipper.localeData global expected' );
assert && assert( phet.chipper.strings, 'phet.chipper.strings global expected' );
assert && assert( phet.chipper.queryParameters.locale, 'should exist with a default' );

/**
 * Given a locale based on the supported query parameter schema, map it to the 2 or 5 char locale code (key in localeData).
 */
const remapLocale = ( locale: string ) => {
  assert && assert( locale );
  assert && assert( phet.chipper.localeData );

  const inputValueLocale = locale;

  if ( locale.length < 5 ) {
    locale = locale.toLowerCase();
  }
  else {
    locale = locale.replace( /-/, '_' );

    const parts = locale.split( '_' );
    if ( parts.length === 2 ) {
      locale = parts[ 0 ].toLowerCase() + '_' + parts[ 1 ].toUpperCase();
    }
  }

  if ( locale.length === 3 ) {
    for ( const candidateLocale of Object.keys( phet.chipper.localeData ) ) {
      if ( phet.chipper.localeData[ candidateLocale ].locale3 === locale ) {
        locale = candidateLocale;
        break;
      }
    }
  }

  // Permissive patterns for locale query parameter patterns.
  // We don't want to show a query parameter warning if it matches these patterns, EVEN if it is not a valid locale
  // in localeData, see https://github.com/phetsims/qa/issues/1085#issuecomment-2111105235.
  const pairRegex = /^[a-zA-Z]{2}$/;
  const tripleRegex = /^[a-zA-Z]{3}$/;
  const doublePairRegex = /^[a-zA-Z]{2}[_-][a-zA-Z]{2}$/;

  if ( !phet.chipper.localeData[ locale ] ) {
    const badLocale = inputValueLocale;

    if ( !pairRegex.test( badLocale ) && !tripleRegex.test( badLocale ) && !doublePairRegex.test( badLocale ) ) {
      assert && assert( false, 'invalid locale:', inputValueLocale );
    }

    locale = FALLBACK_LOCALE;
  }

  return locale;
};

/**
 * Get the "most" valid locale, see https://github.com/phetsims/phet-io/issues/1882
 *  As part of https://github.com/phetsims/joist/issues/963, this as changed. We check a specific fallback order based
 *  on the locale. In general, it will usually try a prefix for xx_XX style locales, e.g. 'ar_SA' would try 'ar_SA', 'ar', 'en'
 *  NOTE: If the locale doesn't actually have any strings: THAT IS OK! Our string system will use the appropriate
 *  fallback strings.
 */
const getValidRuntimeLocale = ( locale: string ) => {
  assert && assert( locale );
  assert && assert( phet.chipper.localeData );
  assert && assert( phet.chipper.strings );

  const possibleLocales = [
    locale,
    ...( phet.chipper.localeData[ locale ]?.fallbackLocales ?? [] ),
    FALLBACK_LOCALE
  ];

  const availableLocale = possibleLocales.find( possibleLocale => !!phet.chipper.strings[ possibleLocale ] );
  assert && assert( availableLocale, 'no fallback found for ', locale );
  return availableLocale;
};

// We will need to check for locale validity (once we have localeData loaded, if running unbuilt), and potentially
// either fall back to `en`, or remap from 3-character locales to our locale keys. This overwrites phet.chipper.locale.
// Used when setting locale through JOIST/localeProperty also. Default to the query parameter instead of
// chipper.locale because we overwrite that value, and may run this function multiple times during the startup
// sequence (in unbuilt mode).
const checkAndRemapLocale = ( locale: string ) => {

  // We need both to proceed. Provided as a global, so we can call it from load-unbuilt-strings
  // (IF initialize-globals loads first). Also handle the unbuilt mode case where we have phet.chipper.strings
  // exists but no translations have loaded yet.
  if ( !phet.chipper.localeData || !phet.chipper.strings?.hasOwnProperty( FALLBACK_LOCALE ) || !locale ) {
    return locale;
  }

  const remappedLocale = remapLocale( locale );
  const finalLocale = getValidRuntimeLocale( remappedLocale );

  phet.chipper.locale = finalLocale; // NOTE: this will change with every setting of JOIST/localeProperty
  return finalLocale;
};

// All available locales for the runtime
export const availableRuntimeLocales = _.sortBy( Object.keys( phet.chipper.strings ), locale => {
  return StringUtils.localeToLocalizedName( locale ).toLowerCase();
} ) as Locale[];

export class LocaleProperty extends Property<Locale> {
  public readonly availableRuntimeLocales: Locale[] = availableRuntimeLocales;

  protected override unguardedSet( value: Locale ): void {
    // NOTE: updates phet.chipper.locale as a side-effect
    super.unguardedSet( checkAndRemapLocale( value ) );
  }

  // This improves the PhET-iO Studio interface, by giving available values, without triggering validation if you want
  // to use the more general locale schema (three digit/case-insensitive/etc).
  protected override toStateObject<StateType>(): ReadOnlyPropertyState<StateType> {
    const parentObject = super.toStateObject<StateType>();

    // Provide via validValues without forcing validation assertions if a different value is set.
    parentObject.validValues = this.availableRuntimeLocales as StateType[];
    return parentObject;
  }

  protected override applyState<StateType>( stateObject: ReadOnlyPropertyState<StateType> ): void {
    stateObject.validValues = null; // TODO: this should be removed in https://github.com/phetsims/axon/issues/453
    super.applyState( stateObject );
  }
}

const localeProperty = new LocaleProperty( FALLBACK_LOCALE, {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'localeProperty' ),
  phetioFeatured: true,
  phetioValueType: StringIO,
  phetioDocumentation: 'Specifies language currently displayed in the simulation'
} );
localeProperty.value = phet.chipper.locale;

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
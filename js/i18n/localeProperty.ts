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

export type Locale = keyof typeof localeInfoModule;

assert && assert( phet.chipper.locale, 'phet.chipper.locale global expected' );
assert && assert( phet.chipper.localeData, 'phet.chipper.localeData global expected' );
assert && assert( phet.chipper.strings, 'phet.chipper.strings global expected' );

// All available locales for the runtime
const availableRuntimeLocales = _.sortBy( Object.keys( phet.chipper.strings ), locale => {
  return StringUtils.localeToLocalizedName( locale ).toLowerCase();
} ) as Locale[];

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
    parentObject.validValues = this.availableRuntimeLocales as StateType[];
    return parentObject;
  }

  protected override applyState<StateType>( stateObject: ReadOnlyPropertyState<StateType> ): void {
    stateObject.validValues = null; // TODO: this should be removed in https://github.com/phetsims/axon/issues/453
    super.applyState( stateObject );
  }
}

const localeProperty = new LocaleProperty( phet.chipper.locale, {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'localeProperty' ),
  phetioFeatured: true,
  phetioValueType: StringIO,
  phetioDocumentation: 'Specifies language currently displayed in the simulation'
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
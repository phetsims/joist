// Copyright 2018-2022, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import platform from '../../phet-core/js/platform.js';
import Tandem from '../../tandem/js/Tandem.js';
import { HBox } from '../../scenery/js/imports.js';
import audioManager from './audioManager.js';
import joist from './joist.js';
import KeyboardHelpButton from './KeyboardHelpButton.js';
import NavigationBarAudioToggleButton from './NavigationBarAudioToggleButton.js';
import NavigationBarPreferencesButton from './preferences/NavigationBarPreferencesButton.js';

class A11yButtonsHBox extends HBox {

  /**
   * @param {Sim} sim
   * @param {Property.<Color|string>} backgroundColorProperty
   * @param {Object} [options]
   */
  constructor( sim, backgroundColorProperty, options ) {

    options = merge( {
      align: 'center',
      spacing: 6,

      // This Node is not instrumented! This tandem is instead just used to create subcomponents.
      tandem: Tandem.REQUIRED
    }, options );

    // list of optional buttons added for a11y
    const a11yButtons = [];

    if ( sim.preferencesManager ) {
      const preferencesButton = new NavigationBarPreferencesButton(
        sim.preferencesManager,
        sim.lookAndFeel, {
          tandem: options.tandem.createTandem( 'navigationBarPreferencesButton' )
        } );

      a11yButtons.push( preferencesButton );
    }

    // For consistent PhET-iO support, we eagerly create the audio toggle button in every sim.  But it is only
    // added to the a11yButtons when sound is fully enabled in a sim runtime.
    const audioToggleButton = new NavigationBarAudioToggleButton(
      audioManager.audioEnabledProperty,
      backgroundColorProperty,
      options.tandem.createTandem( 'audioToggleButton' )
    );

    // only put the sound on/off button on the nav bar if the sound library is enabled
    if ( audioManager.supportsAudio ) {
      a11yButtons.push( audioToggleButton );
    }

    // Create a keyboard help button/dialog if there is keyboard help content.
    if ( sim.hasKeyboardHelpContent ) {

      // Create the KeyboardHelpButton (pops open a dialog with information about keyboard navigation) if there is content
      // and the sim has supports Interactive Description. Eagerly create this to support a consistent PhET-iO API, but
      // only conditionally add it to the nav bar if in the proper runtime.
      const keyboardHelpButton = new KeyboardHelpButton(
        sim.screenProperty,
        backgroundColorProperty,
        options.tandem.createTandem( 'keyboardHelpButton' )
      );

      // only show the keyboard help button if the sim supports interactive description and we are not in mobile safari
      if ( phet.chipper.queryParameters.supportsInteractiveDescription && !platform.mobileSafari ) {
        a11yButtons.push( keyboardHelpButton );
      }
    }

    assert && assert( !options.children, 'A11yButtonsHBox sets children' );
    options.children = a11yButtons;

    // Don't instrument this tandem
    super( _.omit( options, 'tandem' ) );
  }
}

joist.register( 'A11yButtonsHBox', A11yButtonsHBox );
export default A11yButtonsHBox;
// Copyright 2018-2021, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import platform from '../../phet-core/js/platform.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import audioManager from './audioManager.js';
import joist from './joist.js';
import KeyboardHelpButton from './KeyboardHelpButton.js';
import NavigationBarAudioToggleButton from './NavigationBarAudioToggleButton.js';
import NavigationBarPreferencesButton from './preferences/NavigationBarPreferencesButton.js';

class A11yButtonsHBox extends HBox {

  /**
   * @param {Sim} sim
   * @param {Property.<Color|string>} backgroundColorProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( sim, backgroundColorProperty, tandem, options ) {

    options = merge( {
      align: 'center',
      spacing: 6
    }, options );

    // list of optional buttons added for a11y
    const a11yButtons = [];

    if ( sim.preferencesConfiguration ) {
      const preferencesButton = new NavigationBarPreferencesButton(
        sim.preferencesConfiguration,
        sim.preferencesManager.preferencesProperties,
        sim.lookAndFeel,
        audioManager.audioEnabledProperty
      );

      a11yButtons.push( preferencesButton );
    }

    // For consistent PhET-iO support, we eagerly create the audio toggle button in every sim.  But it is only
    // added to the a11yButtons when sound is fully enabled in a sim runtime.
    const audioToggleButton = new NavigationBarAudioToggleButton(
      audioManager.audioEnabledProperty,
      backgroundColorProperty,
      tandem.createTandem( 'audioToggleButton' )
    );

    // only put the sound on/off button on the nav bar if the sound library is enabled
    if ( audioManager.supportsAudio ) {
      a11yButtons.push( audioToggleButton );
    }

    // Create the KeyboardHelpButton if there is content and the sim has supports Interactive Description. When running
    // in phet-io brand, the button is only created if accessibility is part of the permanent API in order to support
    // a consistent PhET-iO API.
    if ( sim.hasKeyboardHelpContent && ( phet.chipper.brand === 'phet-io' ? sim.accessibilityPartOfTheAPI :
                                         phet.chipper.queryParameters.supportsInteractiveDescription ) ) {

      // Pops open a dialog with information about keyboard navigation
      const keyboardHelpButton = new KeyboardHelpButton(
        sim.screenProperty,
        backgroundColorProperty,
        tandem.createTandem( 'keyboardHelpButton' )
      );

      // only show the keyboard help button if the sim supports interactive description, there is keyboard help content,
      // and we are not in mobile safari
      if ( phet.chipper.queryParameters.supportsInteractiveDescription && !platform.mobileSafari ) {
        a11yButtons.push( keyboardHelpButton );
      }
    }

    assert && assert( !options.children, 'A11yButtonsHBox sets children' );
    options.children = a11yButtons;

    super( options );
  }
}

joist.register( 'A11yButtonsHBox', A11yButtonsHBox );
export default A11yButtonsHBox;
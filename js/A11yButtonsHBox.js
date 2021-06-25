// Copyright 2018-2021, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import platform from '../../phet-core/js/platform.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import joist from './joist.js';
import KeyboardHelpButton from './KeyboardHelpButton.js';
import NavigationBarSoundToggleButton from './NavigationBarSoundToggleButton.js';
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
        sim.allAudioEnabledProperty,
        tandem.createTandem( 'preferencesButton' )
      );

      a11yButtons.push( preferencesButton );
    }

    // If the sim has sound support in its API, then create the button. This is support consistent API for PhET-iO
    if ( sim.soundPartOfTheAPI ) {
      const soundOnOffButton = new NavigationBarSoundToggleButton(
        sim.allAudioEnabledProperty,
        backgroundColorProperty,
        tandem.createTandem( 'soundOnOffButton' )
      );

      // only put the sound on/off button on the nav bar if the sound library is enabled
      if ( sim.supportsSound ) {
        a11yButtons.push( soundOnOffButton );
      }
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
// Copyright 2018-2020, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import platform from '../../phet-core/js/platform.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import soundManager from '../../tambo/js/soundManager.js';
import joist from './joist.js';
import KeyboardHelpButton from './KeyboardHelpButton.js';
import NavigationBarSoundToggleButton from './NavigationBarSoundToggleButton.js';

/**
 * @param {Sim} sim
 * @param {Property.<Color|string>} backgroundColorProperty
 * @param {Tandem} tandem
 * @param {Object} [options]
 * @constructor
 */
function A11yButtonsHBox( sim, backgroundColorProperty, tandem, options ) {
  options = merge( {
    align: 'center',
    spacing: 6
  }, options );

  // list of optional buttons added for a11y
  const a11yButtons = [];

  // If the sim has sound support in its API, then create the button. This is support consistent API for PhET-iO
  if ( sim.soundPartOfAPI ) {
    const soundOnOffButton = new NavigationBarSoundToggleButton(
      soundManager.enabledProperty,
      backgroundColorProperty,
      tandem.createTandem( 'soundOnOffButton' )
    );

    // only put the sound on/off button on the nav bar if the sound library is enabled
    if ( sim.supportsSound ) {
      a11yButtons.push( soundOnOffButton );
    }
  }

  // If the sim has accessibility support in its API, then create the button. This is support consistent API for PhET-iO
  if ( sim.accessibilityPartOfTheAPI && sim.keyboardHelpNode ) {

    // Pops open a dialog with information about keyboard navigation
    const keyboardHelpButton = new KeyboardHelpButton(
      sim.keyboardHelpNode,
      backgroundColorProperty,
      tandem.createTandem( 'keyboardHelpButton' )
    );

    // only show the keyboard help button if the sim is accessible, there is keyboard help content, and we are
    // not in mobile safari
    if ( sim.isAccessible && !platform.mobileSafari ) {
      a11yButtons.push( keyboardHelpButton );
    }
  }

  options.children = a11yButtons;
  HBox.call( this, options );
}

joist.register( 'A11yButtonsHBox', A11yButtonsHBox );

inherit( HBox, A11yButtonsHBox );
export default A11yButtonsHBox;
// Copyright 2018-2019, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const KeyboardHelpButton = require( 'JOIST/KeyboardHelpButton' );
  const merge = require( 'PHET_CORE/merge' );
  const NavigationBarSoundToggleButton = require( 'JOIST/NavigationBarSoundToggleButton' );
  const platform = require( 'PHET_CORE/platform' );
  const soundManager = require( 'TAMBO/soundManager' );
  const Tandem = require( 'TANDEM/Tandem' );

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

    // only put the sound on/off button on the nav bar if the sound library is enabled
    // TODO: Support instrumented element that is dynamic/lazily created, see https://github.com/phetsims/phet-io/issues/1454
    if ( sim.supportsSound ) {
      const soundOnOffButton = new NavigationBarSoundToggleButton(
        soundManager.enabledProperty,
        backgroundColorProperty,
        Tandem.optional
        // tandem.createTandem( 'soundOnOffButton' )
      );
      a11yButtons.push( soundOnOffButton );
    }

    // only show the keyboard help button if the sim is accessible, there is keyboard help content, and we are
    // not in mobile safari
    // TODO: We shouldn't have different APIs for different platforms, see https://github.com/phetsims/phet-io/issues/1443
    if ( sim.isAccessible && sim.keyboardHelpNode && !platform.mobileSafari ) {

      // @public (joist-internal, read-only) - Pops open a dialog with information about keyboard navigation
      this.keyboardHelpButton = new KeyboardHelpButton(
        sim.keyboardHelpNode,
        backgroundColorProperty,
        tandem.createTandem( 'keyboardHelpButton' )
      );
      a11yButtons.push( this.keyboardHelpButton );
    }

    options.children = a11yButtons;
    HBox.call( this, options );
  }

  joist.register( 'A11yButtonsHBox', A11yButtonsHBox );

  return inherit( HBox, A11yButtonsHBox );
} );
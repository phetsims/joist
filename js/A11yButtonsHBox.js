// Copyright 2018, University of Colorado Boulder

/**
 * Creates an HBox that can have the sound toggle button, a11y button, or be empty
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var KeyboardHelpButton = require( 'JOIST/KeyboardHelpButton' );
  var NavigationBarSoundToggleButton = require( 'JOIST/NavigationBarSoundToggleButton' );
  var platform = require( 'PHET_CORE/platform' );
  var soundManager = require( 'TAMBO/soundManager' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Sim} sim
   * @param {Property.<Color|string>} backgroundColorProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function A11yButtonsHBox( sim, backgroundColorProperty, tandem, options ) {
    options = _.extend( {
      align: 'center',
      spacing: 6
    }, options );

    // list of optional buttons added for a11y
    var a11yButtons = [];

    // only put the sound on/off button on the nav bar if the sound library is enabled
    // TODO: Support instrumented element that is dynamic/lazily created, see https://github.com/phetsims/phet-io/issues/1454
    if ( sim.supportsSound ) {
      var soundOnOffButton = new NavigationBarSoundToggleButton(
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
    if ( phet.chipper.accessibility && sim.keyboardHelpNode && !platform.mobileSafari ) {

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